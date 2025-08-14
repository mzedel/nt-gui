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
import type { SnackbarProps } from '@mui/material';

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { SortOptions } from '../constants';
import { SORTING_OPTIONS } from '../constants';

export const sliceName = 'app';

const getYesterday = () => {
  const today = new Date();
  today.setDate(today.getDate() - 1);
  return today.toISOString();
};

export type Repository = {
  name: string;
  version: string;
};

export type VersionRelease = Partial<{ [versionInfo: string]: VersionRelease }> & {
  release?: string;
  release_date?: string;
  repos?: Repository[];
  supported_until?: string;
};

export type SaasVersion = {
  date: string;
  tag: string;
};

export type ReleaseData = {
  lts: string[];
  releases: {
    [version: string]: VersionRelease;
  };
  saas: SaasVersion[];
};
export type TagData = { name: string }[];

export interface SnackbarContent extends Pick<SnackbarProps, 'action' | 'autoHideDuration' | 'message' | 'open'> {
  preventClickToCopy?: boolean;
}

export interface SearchState {
  deviceIds: string[];
  isSearching: boolean;
  page?: number;
  perPage?: number;
  searchTerm: string;
  searchTotal: number;
  sort: SortOptions;
}

export interface Upload {
  cancelSource: any;
  inprogress?: boolean;
  name?: string;
  progress: number;
  size?: number;
}

type UILatestRelease = {
  releaseDate: string;
  repos: Record<string, string>;
};

type VersionInformation = {
  [key: string]: string | UILatestRelease | undefined;
  backend?: string;
  GUI?: string;
  latestRelease?: UILatestRelease;
};

export type SentryConfig = {
  isReduxEnabled?: string; // no parsing done here as this has to be accessed outside of the store
  location: string;
  replaysSessionSampleRate?: number;
  tracesSampleRate?: number;
};

type AppSliceType = {
  cancelSource: any;
  commit: string;
  demoArtifactLink: string;
  docsVersion: string;
  features: Record<string, boolean>;
  feedbackProbability: number;
  firstLoginAfterSignup: boolean;
  hostAddress: string | null;
  hostedAnnouncement: string;
  newThreshold: string;
  offlineThreshold: string;
  recaptchaSiteKey: string;
  searchState: SearchState;
  sentry: SentryConfig;
  snackbar: SnackbarContent;
  stripeAPIKey: string;
  trackerCode: string;
  uploadsById: Record<string, Upload>;
  versionInformation: VersionInformation;
  yesterday?: string;
};

export const initialState: AppSliceType = {
  cancelSource: undefined,
  commit: '',
  demoArtifactLink: 'https://dgsbl4vditpls.cloudfront.net/mender-demo-artifact.mender',
  hostAddress: null,
  snackbar: {
    action: undefined,
    autoHideDuration: undefined,
    message: '',
    open: false,
    preventClickToCopy: false
  },
  // return boolean rather than organization details
  features: {
    hasAuditlogs: false,
    hasDeltaProgress: false,
    hasMultitenancy: false,
    hasDeviceConfig: false,
    hasDeviceConnect: false,
    hasFeedbackEnabled: false,
    hasMonitor: false,
    hasReporting: false,
    isDemoMode: false,
    isHosted: true,
    isEnterprise: false
  },
  feedbackProbability: 0.3,
  firstLoginAfterSignup: false,
  hostedAnnouncement: '',
  docsVersion: '',
  recaptchaSiteKey: '',
  searchState: {
    deviceIds: [],
    searchTerm: '',
    searchTotal: 0,
    isSearching: false,
    sort: {
      direction: SORTING_OPTIONS.desc
      // key: null,
      // scope: null
    }
  },
  sentry: {
    location: '',
    replaysSessionSampleRate: 0.1,
    tracesSampleRate: 1.0
  },
  stripeAPIKey: '',
  trackerCode: '',
  uploadsById: {
    // id: { progress: 0, cancelSource: undefined }
  },
  newThreshold: getYesterday(),
  offlineThreshold: getYesterday(),
  versionInformation: {
    Integration: '',
    'Mender-Client': '',
    'Mender-Artifact': '',
    'Meta-Mender': ''
  },
  yesterday: undefined
};

export const appSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    setFeatures: (state, action: PayloadAction<Record<string, boolean>>) => {
      state.features = {
        ...state.features,
        ...action.payload
      };
    },
    setSnackbar: (state, { payload }: PayloadAction<SnackbarContent | string>) => {
      if (typeof payload === 'string') {
        state.snackbar.message = payload;
        return;
      }
      const { message, autoHideDuration, action, preventClickToCopy = false } = payload;
      state.snackbar = {
        message,
        autoHideDuration,
        action,
        preventClickToCopy,
        open: !!message
      };
    },
    setFirstLoginAfterSignup: (state, action: PayloadAction<boolean>) => {
      state.firstLoginAfterSignup = action.payload;
    },
    setAnnouncement: (state, action: PayloadAction<string>) => {
      state.hostedAnnouncement = action.payload;
    },
    setSearchState: (state, action) => {
      state.searchState = {
        ...state.searchState,
        ...action.payload
      };
    },
    setOfflineThreshold: (state, action: PayloadAction<string>) => {
      state.offlineThreshold = action.payload;
    },
    initUpload: (state, action: PayloadAction<{ id: string; upload: Upload }>) => {
      const { id, upload } = action.payload;
      state.uploadsById[id] = upload;
    },
    uploadProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const { id, progress } = action.payload;
      state.uploadsById[id] = {
        ...state.uploadsById[id],
        progress
      };
    },
    cleanUpUpload: (state, action: PayloadAction<string>) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.payload]: current, ...remainder } = state.uploadsById;
      state.uploadsById = remainder;
    },
    setVersionInformation: (state, action: PayloadAction<VersionInformation>) => {
      state.versionInformation = {
        ...state.versionInformation,
        ...action.payload
      };
    },
    setEnvironmentData: (state, action) => ({ ...state, ...action.payload })
  }
});

export const actions = appSlice.actions;
export default appSlice.reducer;
