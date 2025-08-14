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
import { getDemoDeviceAddress } from '@northern.tech/utils/helpers';
import Tracking from '@northern.tech/utils/tracking';
import Cookies from 'universal-cookie';

import type { OnboardingApproach } from '.';
import { actions, sliceName } from '.';
import type { OnboardingStep } from '../constants';
import { DEVICE_STATES, onboardingSteps as onboardingStepNames, orderedOnboardingSteps as onboardingSteps } from '../constants';
import { getOnboardingState as getCurrentOnboardingState, getUserCapabilities } from '../selectors';
import type { AppDispatch } from '../store';
import { createAppAsyncThunk } from '../store';
import { saveUserSettings } from '../thunks';

const cookies = new Cookies();

const applyOnboardingFallbacks = progress => {
  const step = onboardingSteps[progress] as any;
  if (step && step.fallbackStep) {
    return step.fallbackStep;
  }
  return progress;
};

const determineProgress = (acceptedDevices, pendingDevices, releases, pastDeployments) => {
  const steps = onboardingSteps;
  let progress = -1;
  progress = pendingDevices.length > 1 ? steps.findIndex(step => step === onboardingStepNames.DEVICES_PENDING_ACCEPTING_ONBOARDING) : progress;
  progress = acceptedDevices.length >= 1 ? steps.findIndex(step => step === onboardingStepNames.DEVICES_ACCEPTED_ONBOARDING) : progress;
  progress =
    acceptedDevices.length > 1 && releases.length > 1 && pastDeployments.length > 1
      ? steps.findIndex(step => step === onboardingStepNames.DEPLOYMENTS_PAST_COMPLETED)
      : progress;
  return steps[progress];
};

const deductOnboardingState = ({ devicesById, devicesByStatus, onboardingState, pastDeployments, releases, userCapabilities, userId }) => {
  const { canDeploy, canManageDevices, canReadDeployments, canReadDevices, canReadReleases, canUploadReleases } = userCapabilities;
  const userCookie = cookies.get(`${userId}-onboarded`);
  const acceptedDevices = devicesByStatus[DEVICE_STATES.accepted].deviceIds;
  const pendingDevices = devicesByStatus[DEVICE_STATES.pending].deviceIds;
  let deviceType = onboardingState.deviceType ?? [];
  deviceType =
    !deviceType.length && acceptedDevices.length && devicesById[acceptedDevices[0]].hasOwnProperty('attributes')
      ? devicesById[acceptedDevices[0]].attributes.device_type
      : deviceType;
  const progress = applyOnboardingFallbacks(onboardingState.progress || determineProgress(acceptedDevices, pendingDevices, releases, pastDeployments));
  return {
    ...onboardingState,
    complete: !!(
      Boolean(userCookie) ||
      onboardingState.complete ||
      (acceptedDevices.length > 1 && pendingDevices.length > 0 && releases.length > 1 && pastDeployments.length > 1) ||
      (acceptedDevices.length >= 1 && releases.length >= 2 && pastDeployments.length > 2) ||
      (acceptedDevices.length >= 1 && pendingDevices.length > 0 && releases.length >= 2 && pastDeployments.length >= 2) ||
      onboardingSteps.findIndex(step => step === progress) >= onboardingSteps.length - 1 ||
      onboardingState.disable ||
      ![canDeploy, canManageDevices, canReadDeployments, canReadDevices, canReadReleases, canUploadReleases].every(i => i)
    ),
    showTips: onboardingState.showTips != null ? onboardingState.showTips : true,
    deviceType,
    approach: onboardingState.approach || (deviceType.some(type => type.startsWith('qemu')) ? 'virtual' : 'physical'),
    progress
  };
};

export const getOnboardingState = createAppAsyncThunk(`${sliceName}/getOnboardingState`, (_, { dispatch, getState }) => {
  const state = getState();
  let onboardingState = getCurrentOnboardingState(state);
  if (!onboardingState.complete) {
    const userId = state.users.currentUser;
    onboardingState = deductOnboardingState({
      devicesById: state.devices.byId,
      devicesByStatus: state.devices.byStatus,
      onboardingState,
      pastDeployments: state.deployments.byStatus.finished.deploymentIds,
      releases: Object.values(state.releases.byId),
      userCapabilities: getUserCapabilities(state),
      userId
    });
  }
  onboardingState.progress = onboardingState.progress || onboardingStepNames.DASHBOARD_ONBOARDING_START;
  const demoDeviceAddress = `http://${getDemoDeviceAddress(Object.values(state.devices.byId), onboardingState.approach)}`;
  onboardingState.address = state.onboarding.demoArtifactPort ? `${demoDeviceAddress}:${state.onboarding.demoArtifactPort}` : demoDeviceAddress;
  return Promise.all([
    dispatch(actions.setOnboardingComplete(onboardingState.complete)),
    dispatch(actions.setOnboardingState(onboardingState)),
    dispatch(saveUserSettings({ onboarding: onboardingState }))
  ]);
});

export const setOnboardingDeviceType = createAppAsyncThunk(`${sliceName}/setOnboardingDeviceType`, (value: string[] | string, { dispatch }) =>
  Promise.all([dispatch(actions.setOnboardingDeviceType(value)), dispatch(saveUserSettings({ onboarding: { deviceType: value } }))])
);

export const setOnboardingApproach = createAppAsyncThunk(`${sliceName}/setOnboardingApproach`, (value: OnboardingApproach, { dispatch }) =>
  Promise.all([dispatch(actions.setOnboardingApproach(value)), dispatch(saveUserSettings({ onboarding: { approach: value } }))])
);

export const setOnboardingComplete = createAppAsyncThunk(`${sliceName}/setOnboardingComplete`, (value: boolean, { dispatch }) => {
  const tasks: ReturnType<AppDispatch>[] = [Promise.resolve(dispatch(actions.setOnboardingComplete(value)))];
  if (value) {
    tasks.push(Promise.resolve(dispatch(actions.setShowOnboardingHelp(false))));
    tasks.push(Promise.resolve(dispatch(advanceOnboarding(onboardingStepNames.DEPLOYMENTS_PAST_COMPLETED))));
  }
  return Promise.all(tasks);
});

export const setOnboardingCanceled = createAppAsyncThunk(`${sliceName}/setOnboardingCanceled`, (_, { dispatch }) =>
  Promise.all([
    Promise.resolve(dispatch(actions.setShowOnboardingHelp(false))),
    Promise.resolve(dispatch(actions.setShowDismissOnboardingTipsDialog(false))),
    Promise.resolve(dispatch(actions.setOnboardingComplete(true)))
  ])
    // using DEPLOYMENTS_PAST_COMPLETED to ensure we get the intended onboarding state set after
    // _advancing_ the onboarding progress
    .then(() => dispatch(advanceOnboarding(onboardingStepNames.DEPLOYMENTS_PAST_COMPLETED_FAILURE)))
    // since we can't advance after ONBOARDING_CANCELED, track the step manually here
    .then(() => Tracking.event({ category: 'onboarding', action: onboardingStepNames.ONBOARDING_CANCELED }))
);

export const advanceOnboarding = createAppAsyncThunk(`${sliceName}/advanceOnboarding`, (stepId: OnboardingStep, { dispatch, getState }) => {
  const steps = onboardingSteps;
  const progress = steps.findIndex(step => step === getState().onboarding.progress);
  const stepIndex = steps.findIndex(step => step === stepId);
  // if there is no progress set yet, the onboarding state deduction hasn't happened
  // and the subsequent settings persistence would overwrite what we stored
  if (progress > stepIndex || getState().onboarding.progress === null) {
    return;
  }
  const madeProgress = steps[stepIndex + 1];
  const state = { ...getCurrentOnboardingState(getState()), progress: madeProgress };
  state.complete = stepIndex + 1 >= onboardingSteps.findIndex(step => step === onboardingStepNames.DEPLOYMENTS_PAST_COMPLETED_FAILURE) ? true : state.complete;
  Tracking.event({ category: 'onboarding', action: stepId });
  return Promise.all([dispatch(actions.setOnboardingProgress(madeProgress)), dispatch(saveUserSettings({ onboarding: state }))]);
});
