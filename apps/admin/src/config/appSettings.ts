export const appSettings = {
  title: process.env.APP_TITLE || 'CX CMS',
  logo: '/admin/logo.png',
  timezone: process.env.APP_TIMEZONE || 'Asia/Shanghai',
  slogan: {
    'zh-CN': process.env.APP_SLOGAN_ZH_CN || '让业务开发更简单',
    'en-US': process.env.APP_SLOGAN_EN_US || 'Build business software faster',
  },
  copyright: {
    'zh-CN': process.env.APP_COPYRIGHT_ZH_CN || '© {year} 初心软件 版权所有',
    'en-US':
      process.env.APP_COPYRIGHT_EN_US ||
      '© {year} Chuxin Software. All rights reserved.',
  },
} as const;

export type AppLocale = keyof typeof appSettings.slogan;

export const getAppLocale = (locale: string): AppLocale =>
  locale.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US';
