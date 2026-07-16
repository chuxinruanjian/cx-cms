import baseDayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { describe, expect, it } from 'vitest';
import appDayjs, { appSettings } from './dayjs';

baseDayjs.extend(utc);
baseDayjs.extend(timezone);

describe('appDayjs', () => {
  it('converts offset timestamps into the configured timezone', () => {
    const value = '2026-01-01T00:00:00Z';

    expect(appDayjs(value).format()).toBe(
      baseDayjs(value).tz(appSettings.timezone).format(),
    );
  });

  it('interprets timestamps without an offset in the configured timezone', () => {
    const value = '2026-01-01 08:00:00';

    expect(appDayjs(value).valueOf()).toBe(
      baseDayjs.tz(value, appSettings.timezone).valueOf(),
    );
  });
});
