// Copyright 2020 Northern.tech AS
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
import type {
  AuditLog,
  TenantTenantadm as BackendTenant,
  BillingInfo,
  BillingProfile,
  Event,
  Integration,
  NewTenant,
  PreviewRequest,
  Product,
  SupportRequest
} from '@northern.tech/types/MenderTypes';
import { PreviewRequest as PreviewRequestEnum } from '@northern.tech/types/MenderTypes';
import { dateRangeToUnix, deepCompare } from '@northern.tech/utils/helpers';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { jwtDecode } from 'jwt-decode';
import hashString from 'md5';
import Cookies from 'universal-cookie';

import { actions, sliceName } from '.';
import storeActions from '../actions';
import Api from '../api/general-api';
import type { AvailablePlans, ContentType, SortOptions } from '../constants';
import {
  DEVICE_LIST_DEFAULTS,
  SORTING_OPTIONS,
  TENANT_LIST_DEFAULT,
  TIMEOUTS,
  auditLogsApiUrl,
  deviceAuthV2,
  headerNames,
  iotManagerBaseURL,
  locations,
  ssoIdpApiUrlv1,
  tenantadmApiUrlv1,
  tenantadmApiUrlv2
} from '../constants';
import type { AuditLogSelectionState, SSOConfig, Tenant, TenantList } from '../organizationSlice/types';
import { getCurrentSession, getTenantCapabilities, getTenantsList } from '../selectors';
import type { AppDispatch } from '../store';
import { commonErrorFallback, commonErrorHandler, createAppAsyncThunk } from '../store';
import { getDeviceLimit, setFirstLoginAfterSignup } from '../thunks';
import type { UserSession } from '../usersSlice';
import { parseSubscriptionPreview } from '../utils';
import { SSO_TYPES } from './constants';
import { getAuditlogState, getOrganization } from './selectors';

const cookies = new Cookies();

dayjs.extend(utc);
const { setAnnouncement, setSnackbar } = storeActions;
const { page: defaultPage, perPage: defaultPerPage } = DEVICE_LIST_DEFAULTS;

export const cancelRequest = createAppAsyncThunk(`${sliceName}/cancelRequest`, (reason: string, { dispatch, getState }) => {
  const { id: tenantId } = getOrganization(getState());
  return Api.post(`${tenantadmApiUrlv2}/tenants/${tenantId}/cancel`, { reason }).then(() =>
    Promise.resolve(dispatch(setSnackbar({ message: 'Deactivation request was sent successfully', autoHideDuration: TIMEOUTS.fiveSeconds })))
  );
});

export const getTargetLocation = (key: string) => {
  if (devLocations.includes(window.location.hostname)) {
    return '';
  }
  let subdomainSections = window.location.hostname.substring(0, window.location.hostname.indexOf(locations.us.location)).split('.');
  subdomainSections = subdomainSections.splice(0, subdomainSections.length - 1);
  if (!subdomainSections.find(section => section === key)) {
    subdomainSections = key === locations.us.key ? subdomainSections.filter(section => !locations[section]) : [...subdomainSections, key];
    return `https://${[...subdomainSections, ...locations.us.location.split('.')].join('.')}`;
  }
  return `https://${window.location.hostname}`;
};

const devLocations = ['localhost', 'docker.mender.io'];

type OrganizationTrialPayload = {
  email: string;
  'g-recaptcha-response': string;
  location: keyof typeof locations;
  name: string;
  organization: string;
  password: string;
  plan: string;
  tos: boolean;
  ts?: number;
};
export const createOrganizationTrial = createAppAsyncThunk(`${sliceName}/createOrganizationTrial`, (data: OrganizationTrialPayload, { dispatch }) => {
  const { key } = locations[data.location];
  const targetLocation = getTargetLocation(key);
  const target = `${targetLocation}${tenantadmApiUrlv2}/tenants/trial`;
  return (
    Api.postUnauthorized(target, data)
      .catch(err => {
        if (err.response?.status >= 400 && err.response?.status < 500) {
          dispatch(setSnackbar({ message: err.response.data.error, autoHideDuration: TIMEOUTS.fiveSeconds }));
        } else {
          // This handles "timeouts", "general connectivity" and "500 - Internal Server Error" errors
          dispatch(setSnackbar({ message: 'There was an error creating your account', autoHideDuration: TIMEOUTS.fiveSeconds }));
        }
        return Promise.reject(err);
      })
      //TODO: resolve the case with no response more gracefully
      //UPD: soon to be removed due to change to the subscription flow
      // @ts-ignore
      .then(({ headers }) => {
        cookies.remove('oauth');
        cookies.remove('externalID');
        cookies.remove('email');
        dispatch(setFirstLoginAfterSignup(true));
        return new Promise<void>(resolve =>
          setTimeout(() => {
            window.location.assign(`${targetLocation}${headers.location || ''}`);
            return resolve();
          }, TIMEOUTS.fiveSeconds)
        );
      })
  );
});

export const startCardUpdate = createAppAsyncThunk(`${sliceName}/startCardUpdate`, (_, { dispatch }) =>
  Api.post(`${tenantadmApiUrlv2}/billing/card`)
    .then(({ data }) => {
      dispatch(actions.receiveSetupIntent(data.intent_id));
      return Promise.resolve(data.secret);
    })
    .catch(err => commonErrorHandler(err, `Updating the card failed:`, dispatch))
);

export const confirmCardUpdate = createAppAsyncThunk(`${sliceName}/confirmCardUpdate`, (_, { dispatch, getState }) =>
  Api.post(`${tenantadmApiUrlv2}/billing/card/${getState().organization.intentId}/confirm`)
    .then(() => Promise.all([dispatch(setSnackbar('Payment card was updated successfully')), dispatch(actions.receiveSetupIntent(null))]))
    .catch(err => commonErrorHandler(err, `Updating the card failed:`, dispatch))
);

export const getCurrentCard = createAppAsyncThunk(`${sliceName}/getCurrentCard`, (_, { dispatch }) =>
  Api.get<BillingInfo>(`${tenantadmApiUrlv2}/billing`).then(res => {
    const { last4, exp_month, exp_year, brand } = res.data.card || {};
    return Promise.resolve(dispatch(actions.receiveCurrentCard({ brand, last4, expiration: { month: exp_month, year: exp_year } })));
  })
);

export const startUpgrade = createAppAsyncThunk(`${sliceName}/startUpgrade`, (tenantId: string, { dispatch }) =>
  Api.post(`${tenantadmApiUrlv2}/tenants/${tenantId}/upgrade/start`)
    .then(({ data }) => Promise.resolve(data.secret))
    .catch(err => commonErrorHandler(err, `There was an error upgrading your account:`, dispatch))
);

export const cancelUpgrade = createAppAsyncThunk(`${sliceName}/cancelUpgrade`, (tenantId: string) =>
  Api.post(`${tenantadmApiUrlv2}/tenants/${tenantId}/upgrade/cancel`)
);

interface completeUpgradePayload {
  billing_profile: BillingProfile;
  plan: AvailablePlans;
  tenantId: string;
}
export const completeUpgrade = createAppAsyncThunk(
  `${sliceName}/completeUpgrade`,
  ({ tenantId, plan, billing_profile }: completeUpgradePayload, { dispatch }) =>
    Api.post(`${tenantadmApiUrlv2}/tenants/${tenantId}/upgrade/complete`, { plan, billing_profile })
      .catch(err => commonErrorHandler(err, `There was an error upgrading your account:`, dispatch))
      .then(() => Promise.all([dispatch(getDeviceLimit()), dispatch(getUserOrganization())]))
);

type AuditLogQuery = {
  detail?: { id: string } | string;

  endDate?: string;
  sort?: SortOptions;
  startDate?: string;
  type?: {
    queryParameter: string;
    title: string;
    value: string;
  } | null;
  user?: { id: string } | string;
};
const prepareAuditlogQuery = ({
  startDate,
  endDate,
  user: userFilter,
  type,
  detail: detailFilter,
  sort = { direction: SORTING_OPTIONS.desc }
}: AuditLogQuery) => {
  const userId = typeof userFilter === 'object' && userFilter ? userFilter.id : userFilter;
  const detail = typeof detailFilter === 'object' && detailFilter ? detailFilter.id : detailFilter;
  const { start: startUnix, end: endUnix } = dateRangeToUnix(startDate, endDate);
  const createdAfter = startDate ? `&created_after=${startUnix}` : '';
  const createdBefore = endDate ? `&created_before=${endUnix}` : '';
  const typeSearch = type ? `&object_type=${type.value}`.toLowerCase() : '';
  const userSearch = userId ? `&actor_id=${userId}` : '';
  const objectSearch = type && detail ? `&${type.queryParameter}=${encodeURIComponent(detail)}` : '';
  const { direction = SORTING_OPTIONS.desc } = sort;
  return `${createdAfter}${createdBefore}${userSearch}${typeSearch}${objectSearch}&sort=${direction}`;
};

type GetAuditLogPayload = { page: number; perPage: number } & AuditLogQuery;
export const getAuditLogs = createAppAsyncThunk(`${sliceName}/getAuditLogs`, (selectionState: GetAuditLogPayload, { dispatch, getState }) => {
  const { page, perPage } = selectionState;
  const { hasAuditlogs } = getTenantCapabilities(getState());
  if (!hasAuditlogs) {
    return Promise.resolve();
  }
  return Api.get<AuditLog[]>(`${auditLogsApiUrl}/logs?page=${page}&per_page=${perPage}${prepareAuditlogQuery(selectionState)}`)
    .then(({ data, headers }) => {
      let total = headers[headerNames.total];
      total = Number(total || data.length);
      return Promise.resolve(dispatch(actions.receiveAuditLogs({ events: data, total }))) as ReturnType<AppDispatch>;
    })
    .catch(err => commonErrorHandler(err, `There was an error retrieving audit logs:`, dispatch));
});

export const getAuditLogsCsvLink = createAppAsyncThunk(`${sliceName}/getAuditLogsCsvLink`, (_, { getState }) =>
  Promise.resolve(`${window.location.origin}${auditLogsApiUrl}/logs/export?limit=20000${prepareAuditlogQuery(getAuditlogState(getState()))}`)
);

export const setAuditlogsState = createAppAsyncThunk(
  `${sliceName}/setAuditlogsState`,
  (selectionState: Partial<AuditLogSelectionState>, { dispatch, getState }) => {
    const currentState = getAuditlogState(getState());
    const nextState = {
      ...currentState,
      ...selectionState,
      sort: { ...currentState.sort, ...selectionState.sort }
    };
    const tasks: ReturnType<AppDispatch>[] = [];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isLoading: currentLoading, selectedIssue: currentIssue, ...currentRequestState } = currentState;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isLoading: selectionLoading, selectedIssue: selectionIssue, ...selectionRequestState } = nextState;
    if (!deepCompare(currentRequestState, selectionRequestState)) {
      nextState.isLoading = true;
      tasks.push(dispatch(getAuditLogs(nextState)).finally(() => dispatch(actions.setAuditLogState({ isLoading: false }))));
    }
    tasks.push(dispatch(actions.setAuditLogState(nextState)));
    return Promise.all(tasks);
  }
);

/*
  Tenant management + Hosted Mender
*/
export const tenantDataDivergedMessage = 'The system detected there is a change in your plan or purchased add-ons. Please log out and log in again';

export const addTenant = createAppAsyncThunk(`${sliceName}/createTenant`, (selectionState: NewTenant, { dispatch }) =>
  Api.post(`${tenantadmApiUrlv2}/tenants`, selectionState)
    .then(() =>
      Promise.all([
        dispatch(setSnackbar('Tenant was created successfully.')),
        new Promise(resolve => setTimeout(() => resolve(dispatch(getTenants())), TIMEOUTS.oneSecond))
      ])
    )
    .catch(err => commonErrorHandler(err, 'There was an error creating tenant', dispatch, commonErrorFallback))
);

const tenantListRetrieval = async (config): Promise<[BackendTenant[], number]> => {
  const { page, perPage } = config;
  const params = new URLSearchParams({ page, per_page: perPage }).toString();
  const tenantList = await Api.get<BackendTenant[]>(`${tenantadmApiUrlv2}/tenants?${params}`);
  const totalCount = tenantList.headers[headerNames.total] || TENANT_LIST_DEFAULT.perPage;
  return [tenantList.data, Number(totalCount)];
};
export const getTenants = createAppAsyncThunk(`${sliceName}/getTenants`, async (_, { dispatch, getState }) => {
  const currentState = getTenantsList(getState());
  const [tenants, pageCount] = await tenantListRetrieval(currentState);
  dispatch(actions.setTenantListState({ ...currentState, total: pageCount, tenants }));
});

export const setTenantsListState = createAppAsyncThunk(
  `${sliceName}/setTenantsListState`,
  async (selectionState: Partial<TenantList>, { dispatch, getState }) => {
    const currentState = getTenantsList(getState());
    const nextState = {
      ...currentState,
      ...selectionState
    };
    if (!deepCompare(currentState, selectionState)) {
      const [tenants, pageCount] = await tenantListRetrieval(nextState);
      return dispatch(actions.setTenantListState({ ...nextState, tenants, total: pageCount }));
    }
    return dispatch(actions.setTenantListState({ ...nextState }));
  }
);

interface editTenantBody {
  id: string;
  name: string;
  newLimit: number;
}
export const editTenantDeviceLimit = createAppAsyncThunk(`${sliceName}/editDeviceLimit`, ({ newLimit, id, name }: editTenantBody, { dispatch }) =>
  Api.put(`${tenantadmApiUrlv2}/tenants/${id}/child`, { device_limit: newLimit, name })
    .catch(err => commonErrorHandler(err, `Device Limit cannot be changed`, dispatch))
    .then(() =>
      Promise.all([
        dispatch(setSnackbar('Device Limit was changed successfully')),
        dispatch(getUserOrganization()),
        new Promise(resolve => setTimeout(() => resolve(dispatch(getTenants())), TIMEOUTS.oneSecond))
      ])
    )
);
export const editBillingProfile = createAppAsyncThunk(
  `${sliceName}/editBillingProfileEmail`,
  ({ billingProfile }: { billingProfile: BillingProfile }, { dispatch }) =>
    Api.patch(`${tenantadmApiUrlv2}/billing/profile`, billingProfile)
      .catch(err => commonErrorHandler(err, `Failed to change billing profile`, dispatch))
      .then(() => Promise.all([dispatch(setSnackbar('Billing Profile was changed successfully')), dispatch(getUserBilling())]))
);
export const createBillingProfile = createAppAsyncThunk(
  `${sliceName}/createBillingProfileEmail`,
  ({ billingProfile }: { billingProfile: BillingProfile }, { dispatch }) =>
    Api.post(`${tenantadmApiUrlv2}/billing/profile`, billingProfile)
      .catch(err => commonErrorHandler(err, `Failed to create billing profile`, dispatch))
      .then(() => Promise.all([dispatch(setSnackbar('Billing Profile was created successfully')), dispatch(getUserBilling())]))
);

export const removeTenant = createAppAsyncThunk(`${sliceName}/editDeviceLimit`, ({ id }: { id: string }, { dispatch }) =>
  Api.post(`${tenantadmApiUrlv2}/tenants/${id}/remove/start`)
    .catch(err => commonErrorHandler(err, `There was an error removing the tenant`, dispatch))
    .then(() =>
      Promise.all([
        dispatch(setSnackbar('The tenant was removed successfully')),
        dispatch(getUserOrganization()),
        new Promise(resolve => setTimeout(() => resolve(dispatch(getTenants())), TIMEOUTS.oneSecond))
      ])
    )
);
export const getUserOrganization = createAppAsyncThunk(`${sliceName}/getUserOrganization`, (_, { dispatch, getState }) =>
  Api.get<Tenant>(`${tenantadmApiUrlv1}/user/tenant`).then(res => {
    const tasks: ReturnType<AppDispatch>[] = [dispatch(actions.setOrganization(res.data))];
    const { addons, plan, trial } = res.data;
    const { token } = getCurrentSession(getState()) as UserSession;
    const jwt = jwtDecode(token);
    const jwtData = { addons: jwt['mender.addons'], plan: jwt['mender.plan'], trial: jwt['mender.trial'] };
    if (!deepCompare({ addons, plan, trial }, jwtData)) {
      const hash = hashString(tenantDataDivergedMessage);
      cookies.remove(`${jwt.sub}${hash}`);
      tasks.push(dispatch(setAnnouncement(tenantDataDivergedMessage)));
    }
    return Promise.all(tasks);
  })
);

export const getUserBilling = createAppAsyncThunk(`${sliceName}/getUserBilling`, (_, { dispatch }) =>
  Api.get(`${tenantadmApiUrlv2}/billing/profile`)
    .catch(err => commonErrorHandler(err, 'There was an error getting your billing profile:', dispatch, commonErrorFallback))
    .then(res => dispatch(actions.setBillingProfile(res.data)))
);

export const getUserSubscription = createAppAsyncThunk(`${sliceName}/getUserSubscription`, async (_, { dispatch }) => {
  // We need to fetch current subscription first to ensure non-stripe customers handled right
  const currentSubscription = await dispatch(getCurrentSubscription()).unwrap();
  const currentPreview = await dispatch(getBillingPreview({ preview_mode: PreviewRequestEnum.preview_mode.NEXT })).unwrap();
  return dispatch(actions.setSubscription({ ...currentPreview, ...currentSubscription }));
});

//Can also be used to get current subscription when no products supplied
export const getBillingPreview = createAppAsyncThunk(`${sliceName}/getBillingPreview`, (order: PreviewRequest, { dispatch }) =>
  Api.post(`${tenantadmApiUrlv2}/billing/subscription/invoices/preview`, order)
    .catch(err => commonErrorHandler(err, 'There was an error getting your billing information:', dispatch, commonErrorFallback))
    .then(({ data }) => (order.preview_mode === 'recurring' ? { ...parseSubscriptionPreview(data.lines), total: data.total } : data))
);

export const getCurrentSubscription = createAppAsyncThunk(`${sliceName}/getCurrentSubscription`, (_, { dispatch }) =>
  Api.get(`${tenantadmApiUrlv2}/billing/subscription`)
    .then(res => res.data)
    .catch(err => {
      if (err.response && err.response.status === 404) {
        throw new Error('Request failed with status code 404');
      }
      return commonErrorHandler(err, 'There was an error retrieving your current subscription', dispatch, commonErrorFallback);
    })
);

export const requestPlanUpgrade = createAppAsyncThunk(`${sliceName}/requestPlanUpgrade`, (order: { plan: string; products: Product[] }, { dispatch }) =>
  Api.post(`${tenantadmApiUrlv2}/billing/subscription`, order)
    .catch(err => commonErrorHandler(err, 'There was an error sending your request', dispatch, commonErrorFallback))
    .then(() => Promise.all([setTimeout(() => dispatch(getDeviceLimit()), TIMEOUTS.threeSeconds), dispatch(getUserOrganization())]))
);

export const sendSupportMessage = createAppAsyncThunk(`${sliceName}/sendSupportMessage`, (content: SupportRequest, { dispatch }) =>
  Api.post(`${tenantadmApiUrlv2}/contact/support`, content)
    .catch(err => commonErrorHandler(err, 'There was an error sending your request', dispatch, commonErrorFallback))
    .then(() => Promise.resolve(dispatch(setSnackbar({ message: 'Your request was sent successfully', autoHideDuration: TIMEOUTS.fiveSeconds }))))
);
interface requestPlanChangePayload {
  content: {
    current_addons: string;
    current_plan: string;
    requested_addons: string;
    requested_plan: string;
    user_message: string;
  };
  tenantId: string;
}
export const requestPlanChange = createAppAsyncThunk(
  `${sliceName}/requestPlanChange`,
  ({ content, tenantId }: requestPlanChangePayload, { dispatch, rejectWithValue }) =>
    Api.post(`${tenantadmApiUrlv2}/tenants/${tenantId}/plan`, content)
      .catch(async err => {
        await commonErrorHandler(err, 'There was an error sending your request', dispatch, commonErrorFallback);
        rejectWithValue(err);
      })
      .then(() => Promise.resolve(dispatch(setSnackbar({ message: 'Your request was sent successfully', autoHideDuration: TIMEOUTS.fiveSeconds }))))
);

export const downloadLicenseReport = createAppAsyncThunk(`${sliceName}/downloadLicenseReport`, (_, { dispatch }) =>
  Api.get(`${deviceAuthV2}/license`)
    .catch(err => commonErrorHandler(err, 'There was an error downloading the report', dispatch, commonErrorFallback))
    .then(res => res.data)
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createIntegration = createAppAsyncThunk(`${sliceName}/createIntegration`, ({ id, ...integration }: Integration, { dispatch }) =>
  Api.post(`${iotManagerBaseURL}/integrations`, integration)
    .catch(err => commonErrorHandler(err, 'There was an error creating the integration', dispatch, commonErrorFallback))
    .then(() => Promise.all([dispatch(setSnackbar('The integration was set up successfully')), dispatch(getIntegrations())]))
);

export const changeIntegration = createAppAsyncThunk(`${sliceName}/changeIntegration`, ({ id, credentials }: Integration, { dispatch }) =>
  Api.put(`${iotManagerBaseURL}/integrations/${id}/credentials`, credentials)
    .catch(err => commonErrorHandler(err, 'There was an error updating the integration', dispatch, commonErrorFallback))
    .then(() => Promise.all([dispatch(setSnackbar('The integration was updated successfully')), dispatch(getIntegrations())]))
);

export const deleteIntegration = createAppAsyncThunk(
  `${sliceName}/deleteIntegration`,
  ({ id, provider }: { id: string } & Integration, { dispatch, getState }) =>
    Api.delete(`${iotManagerBaseURL}/integrations/${id}`, {})
      .catch(err => commonErrorHandler(err, 'There was an error removing the integration', dispatch, commonErrorFallback))
      .then(() => {
        const integrations = getState().organization.externalDeviceIntegrations.filter(item => provider !== item.provider);
        return Promise.all([
          dispatch(setSnackbar('The integration was removed successfully')),
          dispatch(actions.receiveExternalDeviceIntegrations(integrations))
        ]);
      })
);

export const getIntegrations = createAppAsyncThunk(`${sliceName}/getIntegrations`, (_, { dispatch, getState }) =>
  Api.get<Integration[]>(`${iotManagerBaseURL}/integrations`)
    .catch(err => commonErrorHandler(err, 'There was an error retrieving the integration', dispatch, commonErrorFallback))
    .then(({ data }) => {
      const existingIntegrations = getState().organization.externalDeviceIntegrations;
      const integrations = data.reduce<Integration[]>((accu, item) => {
        const existingIntegration = existingIntegrations.find(integration => item.id === integration.id) ?? {};
        const integration = { ...existingIntegration, ...item };
        accu.push(integration);
        return accu;
      }, []);
      return Promise.resolve(dispatch(actions.receiveExternalDeviceIntegrations(integrations)));
    })
);

type GetWebhookEventsPayload = {
  isFollowUp?: boolean;
  page?: number;
  perPage?: number;
};
export const getWebhookEvents = createAppAsyncThunk(`${sliceName}/getWebhookEvents`, (config: GetWebhookEventsPayload = {}, { dispatch, getState }) => {
  const { isFollowUp, page = defaultPage, perPage = defaultPerPage } = config;
  return Api.get<Event[]>(`${iotManagerBaseURL}/events?page=${page}&per_page=${perPage}`)
    .catch(err => commonErrorHandler(err, 'There was an error retrieving activity for this integration', dispatch, commonErrorFallback))
    .then(({ data }) => {
      const tasks: ReturnType<AppDispatch>[] = [
        dispatch(
          actions.receiveWebhookEvents({
            value: isFollowUp ? getState().organization.webhooks.events : data,
            total: (page - 1) * perPage + data.length
          })
        )
      ];
      if (data.length >= perPage && !isFollowUp) {
        tasks.push(dispatch(getWebhookEvents({ isFollowUp: true, page: page + 1, perPage: 1 })));
      }
      return Promise.all(tasks);
    });
});

const ssoConfigActions = {
  create: { success: 'stored', error: 'storing' },
  edit: { success: 'updated', error: 'updating' },
  read: { success: '', error: 'retrieving' },
  remove: { success: 'removed', error: 'removing' },
  readMultiple: { success: '', error: 'retrieving' }
} as const;
type SsoConfigActionKeys = keyof typeof ssoConfigActions;

const ssoConfigActionErrorHandler = (err, type: keyof typeof ssoConfigActions) => (dispatch: AppDispatch) =>
  commonErrorHandler(err, `There was an error ${ssoConfigActions[type].error} the SSO configuration.`, dispatch, commonErrorFallback);

const ssoConfigActionSuccessHandler = (type: SsoConfigActionKeys) => (dispatch: AppDispatch) =>
  dispatch(setSnackbar(`The SSO configuration was ${ssoConfigActions[type].success} successfully`));

export const storeSsoConfig = createAppAsyncThunk(
  `${sliceName}/storeSsoConfig`,
  ({ config, contentType }: { config: string; contentType: ContentType }, { dispatch }) =>
    Api.post(ssoIdpApiUrlv1, config, { headers: { 'Content-Type': contentType, Accept: 'application/json' } })
      .catch(err => dispatch(ssoConfigActionErrorHandler(err, 'create')))
      .then(() => Promise.all([dispatch(ssoConfigActionSuccessHandler('create')), dispatch(getSsoConfigs())]))
);

export const changeSsoConfig = createAppAsyncThunk(
  `${sliceName}/changeSsoConfig`,
  ({ config, contentType }: { config: SSOConfig; contentType: ContentType }, { dispatch }) =>
    Api.put(`${ssoIdpApiUrlv1}/${config.id}`, config, { headers: { 'Content-Type': contentType, Accept: 'application/json' } })
      .catch(err => dispatch(ssoConfigActionErrorHandler(err, 'edit')))
      .then(() => Promise.all([dispatch(ssoConfigActionSuccessHandler('edit')), dispatch(getSsoConfigs())]))
);

export const deleteSsoConfig = createAppAsyncThunk(`${sliceName}/deleteSsoConfig`, ({ id }: SSOConfig, { dispatch, getState }) =>
  Api.delete(`${ssoIdpApiUrlv1}/${id}`)
    .catch(err => dispatch(ssoConfigActionErrorHandler(err, 'remove')))
    .then(() => {
      const configs = getState().organization.ssoConfigs.filter(item => id !== item.id);
      return Promise.all([dispatch(ssoConfigActionSuccessHandler('remove')), dispatch(actions.receiveSsoConfigs(configs))]);
    })
);

export const getSsoConfigById = createAppAsyncThunk(`${sliceName}/getSsoConfigById`, (config: SSOConfig, { dispatch }) =>
  Api.get<string>(`${ssoIdpApiUrlv1}/${config.id}`)
    .catch(err => dispatch(ssoConfigActionErrorHandler(err, 'read')))
    .then(({ data, headers }) => {
      const sso = Object.values(SSO_TYPES).find(({ contentType }) => contentType === headers['content-type']);
      return sso
        ? (Promise.resolve({ ...config, config: data, type: sso.id }) as ReturnType<AppDispatch>)
        : (Promise.reject('Unsupported SSO config content type.') as ReturnType<AppDispatch>);
    })
);

export const getSsoConfigs = createAppAsyncThunk(`${sliceName}/getSsoConfigs`, (_, { dispatch }) =>
  Api.get<SSOConfig[]>(ssoIdpApiUrlv1)
    .catch(err => dispatch(ssoConfigActionErrorHandler(err, 'readMultiple')))
    .then(({ data }) =>
      Promise.all(data.map(config => dispatch(getSsoConfigById(config)).unwrap()))
        .then((configs: SSOConfig[]) => dispatch(actions.receiveSsoConfigs(configs)))
        .catch(err => commonErrorHandler(err, err, dispatch, ''))
    )
);
