// Copyright 2025 Northern.tech AS
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
//@ts-nocheck
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { getConfiguredStore } from '@northern.tech/store/store';
import { mockApiResponses as defaultState } from '@northern.tech/testing/mockData';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { HttpResponse, http } from 'msw';

import AuditLogs from './AuditLogs';

const meta: Meta<typeof AuditLogs> = {
  component: AuditLogs,
  render: () => {
    const store = getConfiguredStore({ preloadedState });
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MemoryRouter>
          <Provider store={store}>
            <AuditLogs />
          </Provider>
        </MemoryRouter>
      </LocalizationProvider>
    );
  },
  title: 'common/AuditLogs'
};

export default meta;

const preloadedState = {
  ...defaultState,
  app: {
    ...defaultState.app,
    features: {
      ...defaultState.app.features,
      hasAuditlogs: true,
      isEnterprise: true
    }
  }
};

/**
 * Computes how many items to return based on the page, per-page count, and total logs.
 */
const getPaginatedItems = (page: number, perPage: number, total: number): number => Math.min(perPage, Math.max(0, total - (page - 1) * perPage));

const mswHandlers = logsNumber => [
  http.get('/api/management/v1/auditlogs/logs', ({ request }) => {
    const queryParams = Object.fromEntries(new URL(request.url).searchParams.entries());
    const paginatedItems = getPaginatedItems(queryParams.page, queryParams.per_page, logsNumber);
    const mockedEventsLength = defaultState.organization.auditlog.events.length;
    const mockedEvents = defaultState.organization.auditlog.events;
    const events =
      mockedEventsLength >= paginatedItems
        ? mockedEvents.slice(0, paginatedItems)
        : [
            ...mockedEvents,
            ...Array.from({ length: paginatedItems - mockedEventsLength }, (_, i) => ({
              ...mockedEvents[0],
              time: new Date(new Date(mockedEvents[0].time).getTime() + ++i * 60000).toISOString()
            }))
          ];

    return HttpResponse.json(events, {
      headers: {
        'x-total-count': logsNumber.toString()
      }
    });
  })
];

type Story = StoryObj<typeof AuditLogs>;

export const Primary: Story = {
  parameters: {
    msw: {
      handlers: mswHandlers(105)
    }
  },
  name: 'AuditLogs - main'
};

export const NoLogs: Story = {
  parameters: {
    msw: {
      handlers: mswHandlers(0)
    }
  },
  name: 'AuditLogs - no logs'
};

export const NoAccess: Story = {
  render: () => {
    const store = getConfiguredStore({});
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <MemoryRouter>
          <Provider store={store}>
            <AuditLogs />
          </Provider>
        </MemoryRouter>
      </LocalizationProvider>
    );
  },

  name: 'AuditLogs - no access'
};
