// Copyright 2024 Northern.tech AS
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.
/*eslint import/namespace: ['error', { allowComputed: true }]*/
import type {
  DeploymentDeployments as BackendDeployment,
  DeviceWithImage,
  NewDeployment,
  NewDeploymentForGroup,
  NewDeploymentV2
} from '@northern.tech/types/MenderTypes';
import { customSort, deepCompare, isEmpty, standardizePhases } from '@northern.tech/utils/helpers';
import Tracking from '@northern.tech/utils/tracking';
import isUUID from 'validator/lib/isUUID';

import type {
  Deployment,
  DeploymentByStatus,
  DeploymentByStatusKey,
  DeploymentConfig,
  DeploymentStatus,
  DeviceDeployment,
  SelectionListState,
  SelectionState
} from '.';
import { actions, sliceName } from '.';
import storeActions from '../actions';
import GeneralApi from '../api/general-api';
import { DEVICE_LIST_DEFAULTS, SORTING_OPTIONS, TIMEOUTS, deploymentsApiUrl, deploymentsApiUrlV2, headerNames } from '../constants';
import type { SortOptions } from '../constants';
import { getDevicesById, getGlobalSettings, getOrganization, getUserCapabilities } from '../selectors';
import { commonErrorHandler, createAppAsyncThunk } from '../store';
import type { AppDispatch } from '../store';
import { getDeviceAuth, getDeviceById, saveGlobalSettings } from '../thunks';
import { mapTermsToFilters } from '../utils';
import { DEPLOYMENT_ROUTES, DEPLOYMENT_STATES, DEPLOYMENT_TYPES, deploymentPrototype } from './constants';
import { getDeploymentsById, getDeploymentsByStatus as getDeploymentsByStatusSelector } from './selectors';

const { receivedDevice, setSnackbar } = storeActions;

// default per page until pagination and counting integrated
const { page: defaultPage, perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;

export const deriveDeploymentGroup = ({ filter, group, groups = [], name }: Deployment) =>
  group || (groups.length === 1 && !isUUID(name)) ? groups[0] : filter?.name;

const transformDeployments = (deployments: BackendDeployment[], deploymentsById: Record<string, Deployment>) =>
  deployments.sort(customSort(true, 'created')).reduce<{ deploymentIds: string[]; deployments: Record<string, Deployment> }>(
    (accu, item: BackendDeployment) => {
      const filter = item.filter;
      let deployment: Deployment = {
        ...deploymentPrototype,
        ...deploymentsById[item.id],
        ...item,
        filter: filter ? { ...filter, name: filter.name ?? filter.id, filters: mapTermsToFilters(filter.terms) } : undefined,
        name: decodeURIComponent(item.name)
      };
      // deriving the group in a second step to potentially make use of the merged data from the existing group state + the decoded name
      deployment = { ...deployment, group: deriveDeploymentGroup(deployment) };
      accu.deployments[item.id] = deployment;
      accu.deploymentIds.push(item.id);
      return accu;
    },
    { deployments: {}, deploymentIds: [] }
  );

/*Deployments */
export type GetDeploymentsByStatusPayload = Partial<SelectionListState> & {
  group?: string;
  shouldSelect?: boolean;
  sort?: SortOptions;
  status: DeploymentByStatusKey;
};
export const getDeploymentsByStatus = createAppAsyncThunk(
  `${sliceName}/getDeploymentsByStatus`,
  (options: GetDeploymentsByStatusPayload, { dispatch, getState }) => {
    const { status, page = defaultPage, perPage = defaultPerPage, startDate, endDate, group, type, shouldSelect = true, sort = SORTING_OPTIONS.desc } = options;
    const created_after = startDate ? `&created_after=${startDate}` : '';
    const created_before = endDate ? `&created_before=${endDate}` : '';
    const search = group ? `&search=${group}` : '';
    const typeFilter = type ? `&type=${type}` : '';
    return GeneralApi.get<BackendDeployment[]>(
      `${deploymentsApiUrl}/deployments?status=${status}&per_page=${perPage}&page=${page}${created_after}${created_before}${search}${typeFilter}&sort=${sort}`
    ).then(res => {
      const { deployments, deploymentIds } = transformDeployments(res.data, getState().deployments.byId);
      const total = Number(res.headers[headerNames.total]);
      let tasks: ReturnType<AppDispatch> = [
        dispatch(actions.receivedDeployments(deployments)),
        dispatch(
          actions.receivedDeploymentsForStatus({
            deploymentIds,
            status,
            total: !(startDate || endDate || group || type) ? total : getState().deployments.byStatus[status].total
          })
        )
      ];
      tasks = deploymentIds.reduce((accu, deploymentId) => {
        if (deployments[deploymentId].type === DEPLOYMENT_TYPES.configuration) {
          accu.push(dispatch(getSingleDeployment(deploymentId)));
        }
        return accu;
      }, tasks);
      if (shouldSelect) {
        tasks.push(dispatch(actions.selectDeploymentsForStatus({ deploymentIds, status, total })));
      }
      tasks.push({ deploymentIds, total });
      return Promise.all(tasks);
    });
  }
);

const isWithinFirstMonth = (expirationDate?: string) => {
  if (!expirationDate) {
    return false;
  }
  const endOfFirstMonth = new Date(expirationDate);
  endOfFirstMonth.setMonth(endOfFirstMonth.getMonth() - 11);
  return endOfFirstMonth > new Date();
};

const trackDeploymentCreation = (totalDeploymentCount: number, hasDeployments: boolean, trial_expiration?: string) => {
  Tracking.event({ category: 'deployments', action: 'create' });
  if (!totalDeploymentCount) {
    if (!hasDeployments) {
      Tracking.event({ category: 'deployments', action: 'create_initial_deployment' });
      if (isWithinFirstMonth(trial_expiration)) {
        Tracking.event({ category: 'deployments', action: 'create_initial_deployment_first_month' });
      }
    }
    Tracking.event({ category: 'deployments', action: 'create_initial_deployment_user' });
  }
};

const MAX_PREVIOUS_PHASES_COUNT = 5;
export const createDeployment = createAppAsyncThunk(
  `${sliceName}/createDeployment`,
  (
    {
      newDeployment,
      hasNewRetryDefault = false
    }: { hasNewRetryDefault: boolean; newDeployment: NewDeployment | (NewDeploymentForGroup & { group: string }) | NewDeploymentV2 },
    { dispatch, getState }
  ) => {
    let request;
    if ('filter_id' in newDeployment && newDeployment.filter_id) {
      request = GeneralApi.post(`${deploymentsApiUrlV2}/deployments`, newDeployment);
    } else if ('group' in newDeployment && newDeployment.group) {
      request = GeneralApi.post(`${deploymentsApiUrl}/deployments/group/${newDeployment.group}`, newDeployment);
    } else {
      request = GeneralApi.post(`${deploymentsApiUrl}/deployments`, newDeployment);
    }
    const totalDeploymentCount = (Object.values(getDeploymentsByStatusSelector(getState())) as DeploymentStatus[]).reduce<number>(
      (accu, item) => accu + item.total,
      0
    );
    const { hasDeployments } = getGlobalSettings(getState());
    const { trial_expiration } = getOrganization(getState());
    return request
      .catch(err => commonErrorHandler(err, 'Error creating deployment.', dispatch))
      .then(data => {
        const lastslashindex = data.headers.location.lastIndexOf('/');
        const deploymentId = data.headers.location.substring(lastslashindex + 1);
        const deployment = {
          ...newDeployment,
          id: deploymentId,
          devices: 'devices' in newDeployment && newDeployment.devices ? newDeployment.devices.map(id => ({ id, status: 'pending' })) : [],
          statistics: { status: {} }
        };
        const tasks = [
          dispatch(actions.createdDeployment(deployment)),
          dispatch(getSingleDeployment(deploymentId)),
          dispatch(setSnackbar({ message: 'Deployment created successfully', autoHideDuration: TIMEOUTS.fiveSeconds }))
        ] as ReturnType<AppDispatch>;
        // track in GA
        trackDeploymentCreation(totalDeploymentCount, hasDeployments, trial_expiration);
        const { canManageUsers } = getUserCapabilities(getState());
        if (canManageUsers) {
          const { phases, retries } = newDeployment;
          const { previousPhases = [], retries: previousRetries = 0 } = getGlobalSettings(getState());
          const newSettings: any = { retries: hasNewRetryDefault ? retries : previousRetries, hasDeployments: true };
          if (phases) {
            const standardPhases = standardizePhases(phases);
            const prevPhases = previousPhases.map(standardizePhases);
            if (!prevPhases.find(previousPhaseList => previousPhaseList.every(oldPhase => standardPhases.find(phase => deepCompare(phase, oldPhase))))) {
              prevPhases.push(standardPhases);
            }
            newSettings.previousPhases = prevPhases.slice(-1 * MAX_PREVIOUS_PHASES_COUNT);
          }
          tasks.push(dispatch(saveGlobalSettings(newSettings)));
        }
        return Promise.all(tasks);
      });
  }
);

export const getDeploymentDevices = createAppAsyncThunk(
  `${sliceName}/getDeploymentDevices`,
  (options: { id: string; page?: number; perPage?: number }, { dispatch, getState }) => {
    const { id, page = defaultPage, perPage = defaultPerPage } = options;
    return GeneralApi.get<DeviceWithImage[]>(`${deploymentsApiUrl}/deployments/${id}/devices/list?&page=${page}&per_page=${perPage}`).then(response => {
      const { devices: deploymentDevices = {} } = getState().deployments.byId[id] || {};
      const devices = response.data.reduce<Record<string, DeviceWithImage>>((accu, item) => {
        accu[item.id] = item;
        const log: boolean = (deploymentDevices[item.id] || {}).log;
        if (log) {
          accu[item.id].log = log;
        }
        return accu;
      }, {});
      const selectedDeviceIds = Object.keys(devices);
      let tasks: ReturnType<AppDispatch> = [
        dispatch(
          actions.receivedDeploymentDevices({
            id,
            devices,
            selectedDeviceIds,
            totalDeviceCount: Number(response.headers[headerNames.total])
          })
        )
      ];
      const devicesById = getDevicesById(getState());
      // only update those that have changed & lack data
      const lackingData = selectedDeviceIds.reduce<string[]>((accu, deviceId) => {
        const device = devicesById[deviceId];
        if (!device || !device.identity_data || !device.attributes || Object.keys(device.attributes).length === 0) {
          accu.push(deviceId);
        }
        return accu;
      }, []);
      // get device artifact, inventory and identity details not listed in schedule data
      tasks = lackingData.reduce((accu, deviceId) => [...accu, dispatch(getDeviceById(deviceId)), dispatch(getDeviceAuth(deviceId))], tasks);
      return Promise.all(tasks);
    });
  }
);
const parseDeviceDeployment = ({
  deployment: { id, artifact_name: release, status: deploymentStatus },
  device: { created, deleted, id: deviceId, finished, status, log }
}: {
  deployment: Deployment;
  device: DeviceWithImage;
}): DeviceDeployment => ({
  id,
  release,
  created,
  deleted,
  deviceId,
  finished,
  status,
  log,
  route: Object.values(DEPLOYMENT_ROUTES).reduce<string>((accu, { key, states }) => {
    if (!accu) {
      return (states as readonly string[]).includes(deploymentStatus) ? key : accu;
    }
    return accu;
  }, '')
});
type GetDeviceDeploymentsPayload = {
  deviceId: string;
  filterSelection?: string[];
  page?: number;
  perPage?: number;
};

export const getDeviceDeployments = createAppAsyncThunk(`${sliceName}/getDeviceDeployments`, (options: GetDeviceDeploymentsPayload, { dispatch }) => {
  const { deviceId, filterSelection = [], page = defaultPage, perPage = defaultPerPage } = options;
  const filters = filterSelection.map(item => `&status=${item}`).join('');
  return GeneralApi.get(`${deploymentsApiUrl}/deployments/devices/${deviceId}?page=${page}&per_page=${perPage}${filters}`)
    .then(({ data, headers }) =>
      Promise.resolve(
        dispatch(
          receivedDevice({
            id: deviceId,
            deviceDeployments: data.map(parseDeviceDeployment),
            deploymentsCount: Number(headers[headerNames.total])
          })
        )
      )
    )
    .catch(err => commonErrorHandler(err, 'There was an error retrieving the device deployment history:', dispatch));
});

export const resetDeviceDeployments = createAppAsyncThunk(`${sliceName}/resetDeviceDeployments`, (deviceId: string, { dispatch }) =>
  GeneralApi.delete(`${deploymentsApiUrl}/deployments/devices/${deviceId}/history`)
    .then(() => Promise.resolve(dispatch(getDeviceDeployments({ deviceId }))))
    .catch(err => commonErrorHandler(err, 'There was an error resetting the device deployment history:', dispatch))
);

export const getSingleDeployment = createAppAsyncThunk(`${sliceName}/getSingleDeployment`, (id: string, { dispatch, getState }) =>
  GeneralApi.get(`${deploymentsApiUrl}/deployments/${id}`).then(({ data }) => {
    const { deployments } = transformDeployments([data], getState().deployments.byId);
    return Promise.resolve(dispatch(actions.receivedDeployment(deployments[id])));
  })
);

export const getDeviceLog = createAppAsyncThunk(
  `${sliceName}/getDeviceLog`,
  ({ deploymentId, deviceId }: { deploymentId: string; deviceId: string }, { dispatch }) =>
    GeneralApi.get(`${deploymentsApiUrl}/deployments/${deploymentId}/devices/${deviceId}/log`)
      .catch(e => {
        console.log('no log here', e);
        return Promise.reject();
      })
      .then(({ data: log }) =>
        Promise.all([Promise.resolve(dispatch(actions.receivedDeploymentDeviceLog({ id: deploymentId, deviceId, log }))), Promise.resolve(log)])
      )
);

export const abortDeployment = createAppAsyncThunk(`${sliceName}/abortDeployment`, (deploymentId: string, { dispatch, getState }) =>
  GeneralApi.put(`${deploymentsApiUrl}/deployments/${deploymentId}/status`, { status: 'aborted' })
    .then(() => {
      const deploymentsByStatus: DeploymentByStatus = getDeploymentsByStatusSelector(getState());
      let status: DeploymentByStatusKey = DEPLOYMENT_STATES.pending;
      let index = deploymentsByStatus.pending.deploymentIds.findIndex((id: string) => id === deploymentId);
      if (index < 0) {
        status = DEPLOYMENT_STATES.inprogress;
        index = deploymentsByStatus.inprogress.deploymentIds.findIndex((id: string) => id === deploymentId);
      }
      const deploymentIds = [...deploymentsByStatus[status].deploymentIds.slice(0, index), ...deploymentsByStatus[status].deploymentIds.slice(index + 1)];
      const deploymentsById = getDeploymentsById(getState());
      const deployments = deploymentIds.reduce<Record<string, Deployment>>((accu, id) => {
        accu[id] = deploymentsById[id];
        return accu;
      }, {});
      const total = Math.max(deploymentsByStatus[status].total - 1, 0);
      return Promise.all([
        dispatch(actions.receivedDeployments(deployments)),
        dispatch(actions.receivedDeploymentsForStatus({ deploymentIds, status, total })),
        dispatch(actions.removedDeployment(deploymentId)),
        dispatch(setSnackbar('The deployment was successfully aborted'))
      ]);
    })
    .catch(err => commonErrorHandler(err, 'There was an error while aborting the deployment:', dispatch))
);

export const updateDeploymentControlMap = createAppAsyncThunk(
  `${sliceName}/updateDeploymentControlMap`,
  ({ deploymentId, updateControlMap }: { deploymentId: string; updateControlMap: BackendDeployment['update_control_map'] }, { dispatch }) =>
    GeneralApi.patch(`${deploymentsApiUrl}/deployments/${deploymentId}`, { update_control_map: updateControlMap })
      .catch(err => commonErrorHandler(err, 'There was an error while updating the deployment status:', dispatch))
      .then(() => Promise.resolve(dispatch(getSingleDeployment(deploymentId))))
);

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type SetDeploymentsStatePayload = DeepPartial<SelectionState> & { page?: number; perPage?: number };
export const setDeploymentsState = createAppAsyncThunk(`${sliceName}/setDeploymentsState`, (selection: SetDeploymentsStatePayload, { dispatch, getState }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { page, perPage, ...selectionState } = selection;
  const currentState = getState().deployments.selectionState;
  const nextState = {
    ...currentState,
    ...selectionState,
    ...Object.keys(DEPLOYMENT_STATES).reduce<Partial<SelectionState>>((accu, item) => {
      accu[item] = {
        ...currentState[item],
        ...selectionState[item]
      };
      return accu;
    }, {}),
    general: {
      ...currentState.general,
      ...selectionState.general
    }
  } as SelectionState;
  const tasks: ReturnType<AppDispatch> = [dispatch(actions.setDeploymentsState(nextState))];
  if (nextState.selectedId && currentState.selectedId !== nextState.selectedId) {
    tasks.push(dispatch(getSingleDeployment(nextState.selectedId)));
  }
  return Promise.all(tasks);
});

const deltaAttributeMappings = [
  { here: 'compressionLevel', there: 'compression_level' },
  { here: 'disableChecksum', there: 'disable_checksum' },
  { here: 'disableDecompression', there: 'disable_external_decompression' },
  { here: 'sourceWindow', there: 'source_window_size' },
  { here: 'inputWindow', there: 'input_window_size' },
  { here: 'duplicatesWindow', there: 'compression_duplicates_window' },
  { here: 'instructionBuffer', there: 'instruction_buffer_size' }
];

const mapExternalDeltaConfig = (config = {}) =>
  deltaAttributeMappings.reduce((accu, { here, there }) => {
    if (config[there] !== undefined) {
      accu[here] = config[there];
    }
    return accu;
  }, {});

export const getDeploymentsConfig = createAppAsyncThunk(`${sliceName}/getDeploymentsConfig`, (_, { dispatch, getState }) =>
  GeneralApi.get(`${deploymentsApiUrl}/config`).then(({ data }) => {
    const oldConfig = getState().deployments.config;
    const { delta = {} } = data;
    const { binary_delta = {}, binary_delta_limits = {} } = delta;
    const { xdelta_args = {} } = binary_delta;
    const { xdelta_args_limits = {} } = binary_delta_limits;
    const config = {
      ...oldConfig,
      hasDelta: Boolean(delta.enabled),
      binaryDelta: {
        ...oldConfig.binaryDelta,
        ...mapExternalDeltaConfig(xdelta_args)
      },
      binaryDeltaLimits: {
        ...oldConfig.binaryDeltaLimits,
        ...mapExternalDeltaConfig(xdelta_args_limits)
      }
    };
    return Promise.resolve(dispatch(actions.setDeploymentsConfig(config)));
  })
);

// traverse a source object and remove undefined & empty object properties to only return an attribute if there really is content worth sending
const deepClean = <T extends Record<string, any>>(source: T): Partial<T> | undefined =>
  Object.entries(source).reduce<Partial<T> | undefined>((accu, [key, value]) => {
    if (value !== undefined) {
      const cleanedValue = typeof value === 'object' ? deepClean(value) : value;
      if (cleanedValue === undefined || (typeof cleanedValue === 'object' && isEmpty(cleanedValue))) {
        return accu;
      }
      accu = { ...(accu ?? {}), [key]: cleanedValue } as Partial<T>;
    }
    return accu;
  }, undefined);

export const saveDeltaDeploymentsConfig = createAppAsyncThunk(
  `${sliceName}/saveDeltaDeploymentsConfig`,
  (config: DeploymentConfig['binaryDelta'], { dispatch, getState }) => {
    const configChange = {
      xdelta_args: deltaAttributeMappings.reduce((accu, { here, there }) => {
        if (config[here] !== undefined) {
          accu[there] = config[here];
        }
        return accu;
      }, {})
    };
    const result = deepClean(configChange);
    if (!result) {
      return Promise.resolve();
    }
    return GeneralApi.put(`${deploymentsApiUrl}/config/binary_delta`, result)
      .catch(err => commonErrorHandler(err, 'There was a problem storing your delta artifact generation configuration.', dispatch))
      .then(() => {
        const oldConfig = getState().deployments.config;
        const newConfig = {
          ...oldConfig,
          binaryDelta: {
            ...oldConfig.binaryDelta,
            ...config
          }
        };
        return Promise.all([dispatch(actions.setDeploymentsConfig(newConfig)), dispatch(setSnackbar('Settings saved successfully'))]);
      });
  }
);
