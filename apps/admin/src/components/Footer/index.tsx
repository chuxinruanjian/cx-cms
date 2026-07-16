import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import { appSettings } from '@/config/appSettings';
import dayjs from '@/utils/dayjs';
import { getBrowserAppLocale } from '@/utils/locale';

const useStyles = createStyles(({ token, css }) => ({
  footer: css`
    padding: 16px 24px;
    text-align: center;
    color: ${token.colorTextDescription};
    font-size: ${token.fontSizeSM}px;
    line-height: ${token.lineHeight};
    background: transparent;
  `,
}));

const Footer: React.FC = () => {
  const { styles } = useStyles();
  const [locale, setLocale] = useState(getBrowserAppLocale);

  useEffect(() => {
    const syncLocale = () => setLocale(getBrowserAppLocale());
    window.addEventListener('languagechange', syncLocale);

    return () => window.removeEventListener('languagechange', syncLocale);
  }, []);

  const copyright = appSettings.copyright[locale].replace(
    '{year}',
    String(dayjs().year()),
  );

  return <div className={styles.footer}>{copyright}</div>;
};

export default Footer;
