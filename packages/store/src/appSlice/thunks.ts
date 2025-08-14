// Copyright 2019 Northern.tech AS
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
import { deepCompare, extractErrorMessage } from '@northern.tech/utils/helpers';
import Cookies from 'universal-cookie';

import type { ReleaseData, SearchState, TagData, VersionRelease } from '.';
import { actions, sliceName } from '.';
import GeneralApi from '../api/general-api';
import { getOfflineThresholdSettings } from '../selectors';
import type { AppDispatch } from '../store';
import { createAppAsyncThunk } from '../store';
import { searchDevices } from '../thunks';
import { getComparisonCompatibleVersion } from '../utils';
import { getFeatures, getSearchState } from './selectors';

const cookies = new Cookies();

/*
  General
*/
export const setFirstLoginAfterSignup = createAppAsyncThunk<void, boolean>(`${sliceName}/setFirstLoginAfterSignup`, (firstLoginAfterSignup, { dispatch }) => {
  cookies.set('firstLoginAfterSignup', !!firstLoginAfterSignup, { maxAge: 60, path: '/', domain: '.mender.io', sameSite: false });
  dispatch(actions.setFirstLoginAfterSignup(!!firstLoginAfterSignup));
});

const dateFunctionMap = {
  getDays: 'getDate',
  setDays: 'setDate'
};
export const setOfflineThreshold = createAppAsyncThunk(`${sliceName}/setOfflineThreshold`, (_, { dispatch, getState }) => {
  const { interval, intervalUnit } = getOfflineThresholdSettings(getState());
  const today = new Date();
  const intervalName = `${intervalUnit.charAt(0).toUpperCase()}${intervalUnit.substring(1)}`;
  const setter = dateFunctionMap[`set${intervalName}`] ?? `set${intervalName}`;
  const getter = dateFunctionMap[`get${intervalName}`] ?? `get${intervalName}`;
  today[setter](today[getter]() - interval);
  let value: string;
  try {
    value = today.toISOString();
  } catch {
    return Promise.resolve(dispatch(actions.setSnackbar('There was an error saving the offline threshold, please check your settings.')));
  }
  return Promise.resolve(dispatch(actions.setOfflineThreshold(value))) as ReturnType<AppDispatch>;
});

const versionRegex = new RegExp(/\d+\.\d+/);

const getLatestRelease = (thing: VersionRelease): VersionRelease => {
  const latestKey = Object.keys(thing)
    .filter(key => versionRegex.test(key))
    .sort()
    .reverse()[0];
  return thing[latestKey] as VersionRelease;
};

const repoKeyMap = {
  integration: 'Integration',
  mender: 'Mender-Client',
  'mender-artifact': 'Mender-Artifact'
} as const;

const deductSaasState = (latestRelease: VersionRelease, guiTags: TagData): string | undefined => {
  const latestGuiTag = guiTags.length ? guiTags[0].name : '';
  return latestGuiTag ? latestGuiTag : latestRelease.release;
};

export const getLatestReleaseInfo = createAppAsyncThunk(`${sliceName}/getLatestReleaseInfo`, (_, { dispatch, getState }) => {
  if (!getFeatures(getState()).isHosted) {
    return Promise.resolve();
  }
  return Promise.all([GeneralApi.get<ReleaseData>('/versions.json'), GeneralApi.get<TagData>('/tags.json')])
    .catch(err => {
      console.log('init error:', extractErrorMessage(err));
      return Promise.resolve([{ data: {} }, { data: [] }]) as any;
    })
    .then(([{ data }, { data: guiTags }]) => {
      if (!guiTags.length) {
        return Promise.resolve();
      }
      const { releases } = data;
      const latestRelease = getLatestRelease(getLatestRelease(releases));
      const { latestRepos, latestVersions } = latestRelease.repos!.reduce(
        (accu, item) => {
          if (repoKeyMap[item.name]) {
            accu.latestVersions[repoKeyMap[item.name]] = getComparisonCompatibleVersion(item.version);
          }
          accu.latestRepos[item.name] = getComparisonCompatibleVersion(item.version);
          return accu;
        },
        { latestVersions: { ...getState().app.versionInformation }, latestRepos: {} }
      );
      const info = deductSaasState(latestRelease, guiTags);
      return Promise.resolve(
        dispatch(
          actions.setVersionInformation({
            ...latestVersions,
            Server: info,
            latestRelease: {
              releaseDate: latestRelease.release_date!,
              repos: latestRepos
            }
          })
        )
      ) as ReturnType<AppDispatch>;
    });
});

export const setSearchState = createAppAsyncThunk(`${sliceName}/setSearchState`, (searchState: Partial<SearchState>, { dispatch, getState }) => {
  const currentState = getSearchState(getState());
  const nextState = {
    ...currentState,
    ...searchState,
    sort: {
      ...currentState.sort,
      ...searchState.sort
    }
  };
  const tasks: ReturnType<AppDispatch>[] = [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isSearching: currentSearching, deviceIds: currentDevices, searchTotal: currentTotal, ...currentRequestState } = currentState;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isSearching: nextSearching, deviceIds: nextDevices, searchTotal: nextTotal, ...nextRequestState } = nextState;
  if (nextRequestState.searchTerm && !deepCompare(currentRequestState, nextRequestState)) {
    nextState.isSearching = true;
    tasks.push(
      dispatch(searchDevices(nextState))
        .unwrap()
        .then(results => {
          const searchResult = results[results.length - 1];
          return dispatch(actions.setSearchState({ ...searchResult, isSearching: false }));
        })
        .catch(() => dispatch(actions.setSearchState({ isSearching: false, searchTotal: 0 })))
    );
  }
  tasks.push(dispatch(actions.setSearchState(nextState)));
  return Promise.all(tasks);
});
