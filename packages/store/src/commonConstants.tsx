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
// @ts-nocheck
import { mdiAws as AWS, mdiMicrosoftAzure as Azure } from '@mdi/js';
import { Credentials, Integration } from '@northern.tech/types/MenderTypes';

import type { DEVICE_FILTERING_OPTIONS } from './constants';
import { ATTRIBUTE_SCOPES } from './constants';

export const timeUnits = {
  days: 'days',
  minutes: 'minutes',
  hours: 'hours'
};

export const UNGROUPED_GROUP = { id: '*|=ungrouped=|*', name: 'Unassigned' };

export const DEVICE_LIST_MAXIMUM_LENGTH = 50;

export type FilterOperator = keyof typeof DEVICE_FILTERING_OPTIONS;

const oneSecond = 1000;
export const TIMEOUTS = {
  debounceDefault: 700,
  debounceShort: 300,
  halfASecond: 0.5 * oneSecond,
  oneSecond,
  twoSeconds: 2 * oneSecond,
  threeSeconds: 3 * oneSecond,
  fiveSeconds: 5 * oneSecond,
  refreshDefault: 10 * oneSecond,
  refreshLong: 60 * oneSecond
};

export const DEVICE_ONLINE_CUTOFF = { interval: 1, intervalName: timeUnits.days };

export const defaultIdAttribute = Object.freeze({ attribute: 'id', scope: ATTRIBUTE_SCOPES.identity });

export const credentialTypes = {
  aws: Credentials.type.AWS,
  http: Credentials.type.HTTP,
  sas: Credentials.type.SAS,
  x509: 'x509'
};
export const EXTERNAL_PROVIDER = {
  'iot-core': {
    credentialsType: credentialTypes.aws as Credentials.type.AWS,
    icon: AWS,
    title: 'AWS IoT Core',
    twinTitle: 'Device Shadow',
    provider: 'iot-core',
    enabled: true,
    deviceTwin: true,
    configHint: <>For help finding your AWS IoT Core connection string, check the AWS IoT documentation.</>
  },
  'iot-hub': {
    credentialsType: credentialTypes.sas as Credentials.type.SAS,
    icon: Azure,
    title: 'Azure IoT Hub',
    twinTitle: 'Device Twin',
    provider: 'iot-hub',
    enabled: true,
    deviceTwin: true,
    configHint: (
      <span>
        For help finding your Azure IoT Hub connection string, look under &apos;Shared access policies&apos; in the Microsoft Azure UI as described{' '}
        {
          <a
            href="https://devblogs.microsoft.com/iotdev/understand-different-connection-strings-in-azure-iot-hub/#iothubconn"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
        }
        .
      </span>
    )
  },
  webhook: {
    credentialsType: credentialTypes.http as Credentials.type.HTTP,
    deviceTwin: false,
    twinTitle: '',
    // disable the webhook provider here, since it is treated different than other integrations, with a custom configuration & management view, etc.
    enabled: false,
    provider: 'webhook'
  }
} as const;

export interface Webhook extends Integration {
  provider: Integration.provider.WEBHOOK;
}

export const emptyWebhook: Webhook = {
  description: '',
  provider: Integration.provider.WEBHOOK,
  credentials: {
    type: EXTERNAL_PROVIDER.webhook.credentialsType,
    [EXTERNAL_PROVIDER.webhook.credentialsType]: {
      secret: '',
      url: ''
    }
  }
};

interface CountryType {
  code: string;
  label: string;
}
export const MAX_PAGE_SIZE = 500;
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
export const countries: readonly CountryType[] = [
  'AD',
  'AE',
  'AF',
  'AG',
  'AI',
  'AL',
  'AM',
  'AO',
  'AQ',
  'AR',
  'AS',
  'AT',
  'AU',
  'AW',
  'AX',
  'AZ',
  'BA',
  'BB',
  'BD',
  'BE',
  'BF',
  'BG',
  'BH',
  'BI',
  'BJ',
  'BL',
  'BM',
  'BN',
  'BO',
  'BR',
  'BS',
  'BT',
  'BV',
  'BW',
  'BY',
  'BZ',
  'CA',
  'CC',
  'CD',
  'CF',
  'CG',
  'CH',
  'CI',
  'CK',
  'CL',
  'CM',
  'CN',
  'CO',
  'CR',
  'CU',
  'CV',
  'CW',
  'CX',
  'CY',
  'CZ',
  'DE',
  'DJ',
  'DK',
  'DM',
  'DO',
  'DZ',
  'EC',
  'EE',
  'EG',
  'EH',
  'ER',
  'ES',
  'ET',
  'FI',
  'FJ',
  'FK',
  'FM',
  'FO',
  'FR',
  'GA',
  'GB',
  'GD',
  'GE',
  'GF',
  'GG',
  'GH',
  'GI',
  'GL',
  'GM',
  'GN',
  'GP',
  'GQ',
  'GR',
  'GS',
  'GT',
  'GU',
  'GW',
  'GY',
  'HK',
  'HM',
  'HN',
  'HR',
  'HT',
  'HU',
  'ID',
  'IE',
  'IL',
  'IM',
  'IN',
  'IO',
  'IQ',
  'IR',
  'IS',
  'IT',
  'JE',
  'JM',
  'JO',
  'JP',
  'KE',
  'KG',
  'KH',
  'KI',
  'KM',
  'KN',
  'KP',
  'KR',
  'KW',
  'KY',
  'KZ',
  'LA',
  'LB',
  'LC',
  'LI',
  'LK',
  'LR',
  'LS',
  'LT',
  'LU',
  'LV',
  'LY',
  'MA',
  'MC',
  'MD',
  'ME',
  'MF',
  'MG',
  'MH',
  'MK',
  'ML',
  'MM',
  'MN',
  'MO',
  'MP',
  'MQ',
  'MR',
  'MS',
  'MT',
  'MU',
  'MV',
  'MW',
  'MX',
  'MY',
  'MZ',
  'NA',
  'NC',
  'NE',
  'NF',
  'NG',
  'NI',
  'NL',
  'NO',
  'NP',
  'NR',
  'NU',
  'NZ',
  'OM',
  'PA',
  'PE',
  'PF',
  'PG',
  'PH',
  'PK',
  'PL',
  'PM',
  'PN',
  'PR',
  'PS',
  'PT',
  'PW',
  'PY',
  'QA',
  'RE',
  'RO',
  'RS',
  'RU',
  'RW',
  'SA',
  'SB',
  'SC',
  'SD',
  'SE',
  'SG',
  'SH',
  'SI',
  'SJ',
  'SK',
  'SL',
  'SM',
  'SN',
  'SO',
  'SR',
  'SS',
  'ST',
  'SV',
  'SX',
  'SY',
  'SZ',
  'TC',
  'TD',
  'TF',
  'TG',
  'TH',
  'TJ',
  'TK',
  'TL',
  'TM',
  'TN',
  'TO',
  'TR',
  'TT',
  'TV',
  'TW',
  'TZ',
  'UA',
  'UG',
  'US',
  'UY',
  'UZ',
  'VA',
  'VC',
  'VE',
  'VG',
  'VI',
  'VN',
  'VU',
  'WF',
  'WS',
  'XK',
  'YE',
  'YT',
  'ZA',
  'ZM',
  'ZW'
]
  .map(code => ({ code, label: regionNames.of(code) }))
  .sort((a, b) => a.label.localeCompare(b.label));
