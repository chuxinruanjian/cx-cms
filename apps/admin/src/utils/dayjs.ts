import dayjs, { type ConfigType, type Dayjs } from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { appSettings, getAppLocale } from '@/config/appSettings';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.tz.setDefault(appSettings.timezone);

const offsetSuffixPattern = /(?:[zZ]|[+-]\d{2}:?\d{2})$/;

/**
 * Parse and return a Day.js instance in the application timezone.
 *
 * ISO values with an offset are treated as absolute instants and converted.
 * Strings without an offset are interpreted directly in the application
 * timezone, so their meaning is independent from the browser timezone.
 */
const appDayjs = (value?: ConfigType): Dayjs => {
  if (typeof value === 'string' && !offsetSuffixPattern.test(value.trim())) {
    return dayjs.tz(value, appSettings.timezone);
  }

  return dayjs(value).tz(appSettings.timezone);
};

export const setDayjsLocale = (locale: string) => {
  dayjs.locale(getAppLocale(locale) === 'zh-CN' ? 'zh-cn' : 'en');
};

export { appSettings };
export default appDayjs;
