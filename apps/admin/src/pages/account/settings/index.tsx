import { GridContent } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Menu } from 'antd';
import React, { useLayoutEffect, useRef, useState } from 'react';
import BaseView from './components/base';
import BindingView from './components/binding';
import NotificationView from './components/notification';
import SecurityView from './components/security';
import useStyles from './style.style';

type SettingsStateKeys = 'base' | 'security' | 'binding' | 'notification';
type SettingsState = {
  mode: 'inline' | 'horizontal';
  selectKey: SettingsStateKeys;
};

const SettingsContent: React.FC<{ selectKey: SettingsStateKeys }> = ({
  selectKey,
}) => {
  switch (selectKey) {
    case 'base':
      return <BaseView />;
    case 'security':
      return <SecurityView />;
    case 'binding':
      return <BindingView />;
    case 'notification':
      return <NotificationView />;
    default:
      return null;
  }
};

const Settings: React.FC = () => {
  const intl = useIntl();
  const { styles } = useStyles();
  const [initConfig, setInitConfig] = useState<SettingsState>({
    mode: 'inline',
    selectKey: 'base',
  });
  const dom = useRef<HTMLDivElement>(null);
  const menuMap: Record<SettingsStateKeys, React.ReactNode> = {
    base: intl.formatMessage({
      id: 'app.settings.menuMap.basic',
      defaultMessage: 'Basic Settings',
    }),
    security: intl.formatMessage({
      id: 'app.settings.menuMap.security',
      defaultMessage: 'Security Settings',
    }),
    binding: intl.formatMessage({
      id: 'app.settings.menuMap.binding',
      defaultMessage: 'Account Binding',
    }),
    notification: intl.formatMessage({
      id: 'app.settings.menuMap.notification',
      defaultMessage: 'New Message Notification',
    }),
  };
  const menuItems = Object.entries(menuMap).map(([key, label]) => ({
    key,
    label,
  }));

  const resize = () => {
    requestAnimationFrame(() => {
      if (!dom.current) {
        return;
      }
      let mode: 'inline' | 'horizontal' = 'inline';
      const { offsetWidth } = dom.current;
      if (dom.current.offsetWidth < 641 && offsetWidth > 400) {
        mode = 'horizontal';
      }
      if (window.innerWidth < 768 && offsetWidth > 400) {
        mode = 'horizontal';
      }
      setInitConfig((prev) => ({
        ...prev,
        mode: mode as SettingsState['mode'],
      }));
    });
  };

  const resizeRef = useRef(resize);
  resizeRef.current = resize;

  useLayoutEffect(() => {
    const handler = () => resizeRef.current();
    window.addEventListener('resize', handler);
    handler();
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);
  return (
    <GridContent>
      <div
        className={styles.main}
        ref={(ref) => {
          if (ref) {
            dom.current = ref;
          }
        }}
      >
        <div className={styles.leftMenu}>
          <Menu
            mode={initConfig.mode}
            selectedKeys={[initConfig.selectKey]}
            onClick={({ key }) => {
              setInitConfig((prev) => ({
                ...prev,
                selectKey: key as SettingsStateKeys,
              }));
            }}
            items={menuItems}
          />
        </div>
        <div className={styles.right}>
          <div className={styles.title}>{menuMap[initConfig.selectKey]}</div>
          <SettingsContent selectKey={initConfig.selectKey} />
        </div>
      </div>
    </GridContent>
  );
};
export default Settings;
