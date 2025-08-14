// Copyright 2023 Northern.tech AS
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
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export const sliceName = 'onboarding';

export type OnboardingApproach = 'virtual' | 'physical';
type OnboardingSliceType = {
  address?: string;
  approach: OnboardingApproach | null;
  complete: boolean;
  demoArtifactPort: number;
  deviceConnection?: string;
  deviceType: string[] | string | null;
  progress: string | null;
  showTips: boolean | null;
  showTipsDialog: boolean;
};

export const initialState: OnboardingSliceType = {
  approach: null,
  complete: false,
  deviceType: null,
  demoArtifactPort: 85,
  progress: null,
  showTips: null,
  showTipsDialog: false
};

export const onboardingSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    setOnboardingState: (state, action: PayloadAction<Partial<OnboardingSliceType>>) => ({ ...state, ...action.payload }),
    setDemoArtifactPort: (state, action: PayloadAction<number>) => {
      state.demoArtifactPort = action.payload;
    },
    setShowOnboardingHelp: (state, action: PayloadAction<boolean>) => {
      state.showTips = action.payload;
    },
    setShowDismissOnboardingTipsDialog: (state, action: PayloadAction<boolean>) => {
      state.showTipsDialog = action.payload;
    },
    setOnboardingComplete: (state, action: PayloadAction<boolean>) => {
      state.complete = action.payload;
    },
    setOnboardingProgress: (state, action: PayloadAction<string>) => {
      state.progress = action.payload;
    },
    setOnboardingDeviceType: (state, action: PayloadAction<string[] | string>) => {
      state.deviceType = action.payload;
    },
    setOnboardingApproach: (state, action: PayloadAction<OnboardingApproach>) => {
      state.approach = action.payload;
    }
  }
});

export const actions = onboardingSlice.actions;
export default onboardingSlice.reducer;
