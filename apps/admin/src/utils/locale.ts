import { type AppLocale, getAppLocale } from '@/config/appSettings';

const DEFAULT_LOCALE: AppLocale = 'zh-CN';

export const getBrowserAppLocale = (): AppLocale => {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  try {
    const storedLocale = window.localStorage.getItem('umi_locale');
    return getAppLocale(storedLocale || window.navigator.language);
  } catch {
    return getAppLocale(window.navigator.language || DEFAULT_LOCALE);
  }
};
