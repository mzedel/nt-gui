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
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  customSort,
  dateRangeToUnix,
  deepCompare,
  detectOsIdentifier,
  duplicateFilter,
  extractSoftware,
  extractSoftwareItem,
  formatTime,
  fullyDecodeURI,
  getDebConfigurationCode,
  getDemoDeviceAddress,
  getFormattedSize,
  isEmpty,
  preformatWithRequestID,
  standardizePhases,
  stringToBoolean,
  unionizeStrings,
  versionCompare
} from './helpers';

const deploymentCreationTime = '2019-01-01T12:30:00.000Z';

const mockDeployments = {
  d1: { id: 'd1', created: deploymentCreationTime },
  d2: { id: 'd2', created: '2019-01-01T13:30:00.000Z' },
  d3: { id: 'd3', created: '2019-01-01T14:30:00.000Z' }
};

const mockDevices = {
  a1: { id: 'a1', attributes: { ipv4_wlan0: '192.168.10.141/24' } }
};

describe('getFormattedSize function', () => {
  it('converts correctly', async () => {
    expect(getFormattedSize()).toEqual('0 Bytes');
    expect(getFormattedSize(null)).toEqual('0 Bytes');
    expect(getFormattedSize(0)).toEqual('0 Bytes');
    expect(getFormattedSize(31)).toEqual('31.00 Bytes');
    expect(getFormattedSize(1024)).toEqual('1.00 KB');
    expect(getFormattedSize(1024 * 1024)).toEqual('1.00 MB');
    expect(getFormattedSize(1024 * 1024 * 2.5)).toEqual('2.50 MB');
    expect(getFormattedSize(1024 * 1024 * 1024 * 1.2345)).toEqual('1.23 GB');
  });
});

describe('isEmpty function', () => {
  it('should identify empty objects', async () => {
    expect(isEmpty({})).toEqual(true);
  });
  it('should identify non-empty objects', async () => {
    expect(isEmpty({ a: 1 })).toEqual(false);
  });
  it('should identify an object with nested empty objects as non-empty', async () => {
    expect(isEmpty({ a: {} })).toEqual(false);
  });
});

describe('stringToBoolean function', () => {
  it('should convert truthy objects', async () => {
    expect(stringToBoolean(1)).toEqual(true);
    expect(stringToBoolean('1')).toEqual(true);
    expect(stringToBoolean(true)).toEqual(true);
    expect(stringToBoolean('yes')).toEqual(true);
    expect(stringToBoolean('TRUE')).toEqual(true);
    expect(stringToBoolean('something')).toEqual(true);
  });
  it('should convert truthy objects', async () => {
    expect(stringToBoolean(0)).toEqual(false);
    expect(stringToBoolean('0')).toEqual(false);
    expect(stringToBoolean(false)).toEqual(false);
    expect(stringToBoolean('no')).toEqual(false);
    expect(stringToBoolean('FALSE')).toEqual(false);
  });
});

describe('versionCompare function', () => {
  it('should work as intended', async () => {
    expect(versionCompare('2.5.1', '2.6.0').toString()).toEqual('-1');
    expect(versionCompare('2.6.0', '2.6.0').toString()).toEqual('0');
    expect(versionCompare('2.6.x', '2.6.0').toString()).toEqual('1');
    expect(versionCompare('next', '2.6').toString()).toEqual('1');
    expect(versionCompare('', '2.6.0').toString()).toEqual('-1');
  });
});

const oldHostname = window.location.hostname;
const postTestCleanUp = () => {
  window.location = {
    ...window.location,
    hostname: oldHostname
  };
};
describe('getDebConfigurationCode function', () => {
  let code;
  describe('configuring devices for hosted mender', () => {
    beforeEach(() => {
      code = getDebConfigurationCode({
        ipAddress: '192.168.7.41',
        isDemoMode: true,
        deviceType: 'raspberrypi3',
        token: 'omnomnom'
      });
    });
    afterEach(postTestCleanUp);
    it('should not contain any template string leftovers', async () => {
      expect(code).not.toMatch(/\$\{([^}]+)\}/);
    });
    it('should return a sane result', async () => {
      expect(code).toMatch(
        `wget -O- https://get.mender.io | sudo bash -s -- --demo --force-mender-client4 -- --quiet --device-type "raspberrypi3" --demo --server-ip 192.168.7.41`
      );
    });
    it('should not contain tenant information for OS calls', async () => {
      expect(code).not.toMatch(/tenant/);
      expect(code).not.toMatch(/token/);
      expect(code).not.toMatch(/TENANT/);
      expect(code).not.toMatch(/TOKEN/);
    });
  });
  describe('configuring devices for hosted mender', () => {
    beforeEach(() => {
      window.location = {
        ...window.location,
        hostname: 'hosted.mender.io'
      };
    });
    afterEach(postTestCleanUp);

    it('should contain sane information for hosted calls', async () => {
      code = getDebConfigurationCode({
        deviceType: 'raspberrypi3',
        hasMonitor: true,
        isHosted: true,
        isOnboarding: true,
        tenantToken: 'token',
        token: 'omnomnom'
      });
      expect(code).toMatch(
        `JWT_TOKEN="omnomnom"
TENANT_TOKEN="token"
wget -O- https://get.mender.io | sudo bash -s -- --demo --commercial --jwt-token $JWT_TOKEN --force-mender-client4 -- --quiet --device-type "raspberrypi3" --tenant-token $TENANT_TOKEN --demo --server-url https://hosted.mender.io --server-cert=""`
      );
    });
    it('should contain sane information for hosted calls by users without monitor access', async () => {
      code = getDebConfigurationCode({
        deviceType: 'raspberrypi3',
        isHosted: true,
        isOnboarding: true,
        tenantToken: 'token',
        token: 'omnomnom'
      });
      expect(code).toMatch(
        `JWT_TOKEN="omnomnom"
TENANT_TOKEN="token"
wget -O- https://get.mender.io | sudo bash -s -- --demo --jwt-token $JWT_TOKEN --force-mender-client4 -- --quiet --device-type "raspberrypi3" --tenant-token $TENANT_TOKEN --demo --server-url https://hosted.mender.io --server-cert=""`
      );
    });
  });
  describe('configuring devices for staging.hosted.mender', () => {
    beforeEach(() => {
      window.location = {
        ...window.location,
        hostname: 'staging.hosted.mender.io'
      };
    });
    afterEach(postTestCleanUp);

    it('should contain sane information for staging preview calls', async () => {
      code = getDebConfigurationCode({
        deviceType: 'raspberrypi3',
        hasMonitor: true,
        isHosted: true,
        isOnboarding: true,
        isPreRelease: true,
        tenantToken: 'token',
        token: 'omnomnom'
      });
      expect(code).toMatch(
        `JWT_TOKEN="omnomnom"
TENANT_TOKEN="token"
wget -O- https://get.mender.io/staging | sudo bash -s -- --demo -c experimental --commercial --jwt-token $JWT_TOKEN --force-mender-client4 -- --quiet --device-type "raspberrypi3" --tenant-token $TENANT_TOKEN --demo --server-url https://staging.hosted.mender.io --server-cert=""`
      );
    });
  });
  describe('configuring devices for fancy.enterprise.on.prem', () => {
    beforeEach(() => {
      window.location = {
        ...window.location,
        hostname: 'fancy.enterprise.on.prem'
      };
    });
    afterEach(postTestCleanUp);

    it('should contain sane information for enterprise demo on-prem calls', async () => {
      code = getDebConfigurationCode({
        ipAddress: '1.2.3.4',
        isDemoMode: true,
        tenantToken: 'token',
        token: 'omnomnom',
        deviceType: 'raspberrypi3'
      });
      expect(code).toMatch(
        `TENANT_TOKEN="token"
wget -O- https://get.mender.io | sudo bash -s -- --demo --force-mender-client4 -- --quiet --device-type "raspberrypi3" --tenant-token $TENANT_TOKEN --demo --server-ip 1.2.3.4`
      );
    });
    it('should contain sane information for enterprise production on-prem calls', async () => {
      code = getDebConfigurationCode({
        ipAddress: '1.2.3.4',
        isDemoMode: false,
        tenantToken: 'token',
        deviceType: 'raspberrypi3'
      });
      expect(code).toMatch(
        `TENANT_TOKEN="token"
wget -O- https://get.mender.io | sudo bash -s -- --demo --force-mender-client4 -- --quiet --device-type "raspberrypi3" --tenant-token $TENANT_TOKEN --retry-poll 300 --update-poll 1800 --inventory-poll 28800 --server-url https://fancy.enterprise.on.prem --server-cert=""`
      );
    });
  });
  describe('configuring devices for fancy.opensource.on.prem', () => {
    beforeEach(() => {
      window.location = {
        ...window.location,
        hostname: 'fancy.opensource.on.prem'
      };
    });
    afterEach(postTestCleanUp);

    it('should contain sane information for OS demo on-prem calls', async () => {
      code = getDebConfigurationCode({
        ipAddress: '1.2.3.4',
        isDemoMode: true,
        tenantToken: 'token',
        token: 'omnomnom',
        deviceType: 'raspberrypi3'
      });
      expect(code).toMatch(
        `wget -O- https://get.mender.io | sudo bash -s -- --demo --force-mender-client4 -- --quiet --device-type "raspberrypi3" --tenant-token $TENANT_TOKEN --demo --server-ip 1.2.3.4`
      );
    });
    it('should contain sane information for OS production on-prem calls', async () => {
      code = getDebConfigurationCode({
        ipAddress: '1.2.3.4',
        isDemoMode: false,
        tenantToken: 'token',
        token: 'omnomnom',
        deviceType: 'raspberrypi3'
      });
      expect(code).toMatch(
        `wget -O- https://get.mender.io | sudo bash -s -- --demo --force-mender-client4 -- --quiet --device-type "raspberrypi3" --tenant-token $TENANT_TOKEN --retry-poll 300 --update-poll 1800 --inventory-poll 28800 --server-url https://fancy.opensource.on.prem --server-cert=""`
      );
    });
  });
});

describe('duplicateFilter function', () => {
  it('removes duplicastes from an array', async () => {
    expect([].filter(duplicateFilter)).toEqual([]);
    expect([1, 1, 2, 3, 4, 5].filter(duplicateFilter)).toEqual([1, 2, 3, 4, 5]);
    expect(['hey', 'hey', 'ho', 'ho', 'ho', 'heyho'].filter(duplicateFilter)).toEqual(['hey', 'ho', 'heyho']);
  });
});

describe('unionizeStrings function', () => {
  it('joins arrays of strings to a list of distinct strings', async () => {
    expect(unionizeStrings([], [])).toEqual([]);
    expect(unionizeStrings(['hey', 'hey', 'ho', 'ho', 'ho', 'heyho'], ['hohoho'])).toEqual(['hey', 'ho', 'heyho', 'hohoho']);
    expect(unionizeStrings(['hohoho'], ['hey', 'hey', 'ho', 'ho', 'ho', 'heyho'])).toEqual(['hohoho', 'hey', 'ho', 'heyho']);
    expect(unionizeStrings(['hohoho', 'hohoho'], ['hey', 'hey', 'ho', 'ho', 'ho', 'heyho'])).toEqual(['hohoho', 'hey', 'ho', 'heyho']);
  });
});

describe('customSort function', () => {
  it('works as expected', async () => {
    const creationSortedUp = Object.values(mockDeployments).sort(customSort(false, 'created'));
    expect(creationSortedUp[0].id).toEqual(mockDeployments.d1.id);
    expect(creationSortedUp[1].id).toEqual(mockDeployments.d2.id);
    const creationSortedDown = Object.values(mockDeployments).sort(customSort(true, 'created'));
    expect(creationSortedDown[0].id).toEqual(mockDeployments.d3.id);
    expect(creationSortedDown[2].id).toEqual(mockDeployments.d1.id);
    const idSortedUp = Object.values(mockDeployments).sort(customSort(false, 'id'));
    expect(idSortedUp[0].id).toEqual(mockDeployments.d1.id);
    expect(idSortedUp[1].id).toEqual(mockDeployments.d2.id);
    const idSortedDown = Object.values(mockDeployments).sort(customSort(true, 'id'));
    expect(idSortedDown[0].id).toEqual(mockDeployments.d3.id);
    expect(idSortedDown[1].id).toEqual(mockDeployments.d2.id);
  });
});
describe('deepCompare function', () => {
  it('works as expected', async () => {
    expect(deepCompare(false, 12)).toBeFalsy();
    expect(deepCompare(mockDevices, {})).toBeFalsy();
    expect(
      deepCompare(mockDevices, {
        ...mockDevices,
        a1: { ...mockDevices.a1, id: 'test' }
      })
    ).toBeFalsy();
    expect(deepCompare({}, {})).toBeTruthy();
    expect(deepCompare({}, {}, {})).toBeTruthy();
    expect(deepCompare(mockDevices, { ...mockDevices }, { ...mockDevices })).toBeTruthy();
    expect(deepCompare(['test', { test: 'test' }, 1], ['test', { test: 'test' }, 1])).toBeTruthy();
    expect(deepCompare(undefined, null)).toBeFalsy();
    expect(deepCompare(1, 2)).toBeFalsy();
    expect(deepCompare(1, 1)).toBeTruthy();
    const date = new Date();
    expect(deepCompare(date, date)).toBeTruthy();
    expect(deepCompare(date, new Date().setDate(date.getDate() - 1))).toBeFalsy();
  });
});
describe('detectOsIdentifier function', () => {
  it('works as expected', async () => {
    expect(detectOsIdentifier()).toEqual('Linux');
    navigator.appVersion = '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36';
    expect(detectOsIdentifier()).toEqual('MacOs');
  });
});
describe('formatTime function', () => {
  it('works as expected', async () => {
    expect(formatTime(new Date('2020-11-30T18:36:38.258Z'))).toEqual('2020-11-30T18:36:38.258');
    expect(formatTime('2020-11-30 18 : 36 : 38 . 258 UTC')).toEqual('2020-11-30T18:36:38.258');
  });
});
describe('fullyDecodeURI function', () => {
  it('works as expected', async () => {
    expect(fullyDecodeURI('http%3A%2F%2Ftest%20encoded%20%2520http%253A%252F%252Ftest%20%2520%20twice%20%C3%B8%C3%A6%C3%A5%C3%9F%2F%60%C2%B4')).toEqual(
      'http://test encoded  http://test   twice øæåß/`´'
    );
  });
});
describe('getDemoDeviceAddress function', () => {
  it('works as expected', async () => {
    expect(getDemoDeviceAddress(Object.values(mockDevices), 'virtual')).toEqual('localhost');
    expect(getDemoDeviceAddress(Object.values(mockDevices), 'physical')).toEqual('192.168.10.141');
  });
});

describe('extractSoftware function', () => {
  it('works as expected', async () => {
    expect(
      extractSoftware({
        artifact_name: 'myapp',
        'rootfs-image.version': 'stablev1-beta-final-v0',
        'rootfs-image.checksum': '12341143',
        'test.version': 'test-2',
        'a.whole.lot.of.dots.version': 'test-3'
      })
    ).toEqual({
      nonSoftware: [['artifact_name', 'myapp']],
      software: [
        ['rootfs-image.version', 'stablev1-beta-final-v0'],
        ['rootfs-image.checksum', '12341143'],
        ['test.version', 'test-2'],
        ['a.whole.lot.of.dots.version', 'test-3']
      ]
    });
    expect(extractSoftware({ foo: 'myapp' })).toEqual({ nonSoftware: [['foo', 'myapp']], software: [] });
  });
});

describe('extractSoftwareItem function', () => {
  it('works as expected', async () => {
    expect(
      extractSoftwareItem({
        artifact_name: 'myapp',
        'data-partition.myapp.version': 'v2020.10',
        list_of_fancy: ['x172']
      })
    ).toEqual({ key: 'data-partition', name: 'myapp', nestingLevel: 3, version: 'v2020.10' });
    expect(extractSoftwareItem({ list_of_fancy: ['x172'] })).toEqual(undefined);
  });
});

describe('standardizePhases function', () => {
  it('works as expected', async () => {
    const phases = [
      {
        batch_size: 10,
        delay: 2,
        delayUnit: 'hours',
        start_ts: deploymentCreationTime
      },
      { batch_size: 10, delay: 2, start_ts: deploymentCreationTime },
      { batch_size: 10, start_ts: deploymentCreationTime }
    ];
    expect(standardizePhases(phases)).toEqual([
      { batch_size: 10, delay: 2, delayUnit: 'hours' },
      { batch_size: 10, delay: 2, delayUnit: 'hours', start_ts: 1 },
      { batch_size: 10, start_ts: 2 }
    ]);
  });
});

describe('preformatWithRequestID function', () => {
  it('works as expected', async () => {
    const expectedLongText = Array.from({ length: 100 }, () => 'long text').join(' ');
    expect(preformatWithRequestID({ data: { request_id: 'someUuidLikeLongerText' } }, expectedLongText)).toEqual(
      'long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text ... [Request ID: someUuid]'
    );
    expect(preformatWithRequestID({ data: {} }, expectedLongText)).toEqual(
      'long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text ...'
    );
    expect(preformatWithRequestID(undefined, expectedLongText)).toEqual(
      'long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text long text ...'
    );
    const expectedText = 'short text';
    expect(preformatWithRequestID({ data: { request_id: 'someUuidLikeLongerText' } }, expectedText)).toEqual('short text [Request ID: someUuid]');
    expect(preformatWithRequestID(undefined, expectedText)).toEqual(expectedText);
  });
});

describe('dateRangeToUnix function', () => {
  const timestamps = {
    JAN_1_2025_START: 1735689600, // 2025-01-01 00:00:00 UTC
    JAN_31_2025_END: 1738367999, // 2025-01-31 23:59:59 UTC
    JUN_15_2025_START: 1749945600, // 2025-06-15 00:00:00 UTC
    JUN_16_2025_END: 1750118399 // 2025-06-16 23:59:59 UTC
  };

  describe.for([
    'America/New_York',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Europe/London',
    'Asia/Dubai',
    'Pacific/Auckland',
    'Africa/Cairo',
    'America/Los_Angeles',
    'Asia/Shanghai',
    'Europe/Paris',
    'UTC'
  ])('works for timezone %s', timezone => {
    beforeAll(() => {
      vi.stubEnv('TZ', timezone);
    });

    afterAll(() => {
      vi.unstubAllEnvs();
    });

    it('converts valid date strings to unix timestamps with different timezones', () => {
      const start = '2025-01-01T00:50:00';
      const end = '2025-01-31T23:50:00';
      const stringsResult = dateRangeToUnix(start, end);
      const objectsResult = dateRangeToUnix(new Date(start), new Date(end));
      expect(stringsResult).toStrictEqual(objectsResult);
    });

    it('handles Date objects for', () => {
      const startDate = new Date('2025-06-15T00:50:00');
      const endDate = new Date('2025-06-16T23:50:00');
      const result = dateRangeToUnix(startDate, endDate);
      expect(result.start).toBe(timestamps.JUN_15_2025_START);
      expect(result.end).toBe(timestamps.JUN_16_2025_END);
    });

    it('strings result equals to Date objects', () => {
      const startDate = new Date('2025-06-15T00:50:00');
      const endDate = new Date('2025-06-16T23:50:00');
      const result = dateRangeToUnix(startDate, endDate);
      expect(result.start).toBe(timestamps.JUN_15_2025_START);
      expect(result.end).toBe(timestamps.JUN_16_2025_END);
    });

    it('returns null for invalid dates', () => {
      const result = dateRangeToUnix('invalid-date', '2025-01-31');
      expect(result.start).toBeNull();
      expect(result.end).toBe(timestamps.JAN_31_2025_END);
    });

    it('handles null inputs', () => {
      const result = dateRangeToUnix(null, null);
      expect(result.start).toBeNull();
      expect(result.end).toBeNull();
    });

    it('works with only start date', () => {
      const result = dateRangeToUnix('2025-01-01');
      expect(result.start).toBe(timestamps.JAN_1_2025_START);
      expect(result.end).toBeNull();
    });

    it('works with only end date', () => {
      const result = dateRangeToUnix(null, '2025-01-31');
      expect(result.start).toBeNull();
      expect(result.end).toBe(timestamps.JAN_31_2025_END);
    });

    it('handles default parameters', () => {
      const result = dateRangeToUnix();
      expect(result.start).toBeNull();
      expect(result.end).toBeNull();
    });
  });
});
