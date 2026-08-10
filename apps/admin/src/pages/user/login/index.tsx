import { LockOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import {
  FormattedMessage,
  getLocale,
  Helmet,
  history,
  SelectLang,
  useIntl,
  useModel,
} from '@umijs/max';
import { Alert, App, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import React, { startTransition, useState } from 'react';
import { Footer } from '@/components';
import { appSettings, getAppLocale } from '@/config/appSettings';
import {
  loginAdmin,
  loginAdminWithSms,
  sendAdminSmsCode,
} from '@/services/adminAuth';
import type { AdminLoginFormValues } from '@/types/admin';

/**
 * Validate redirect URL to prevent open redirect attacks.
 * Only allow same-origin relative paths starting with '/'.
 */
const getSafeRedirectUrl = (redirect: string | null): string => {
  if (!redirect?.startsWith('/')) return '/';

  if (redirect.startsWith('//')) return '/';

  try {
    const parsed = new URL(redirect, window.location.origin);
    if (parsed.origin !== window.location.origin) return '/';
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/';
  }
};

const useStyles = createStyles(({ token }) => ({
  lang: {
    width: 42,
    height: 42,
    lineHeight: '42px',
    position: 'fixed',
    right: 16,
    borderRadius: token.borderRadius,
    ':hover': {
      backgroundColor: token.colorBgTextHover,
    },
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'auto',
    backgroundImage:
      "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
    backgroundSize: '100% 100%',
  },
}));

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{ content: string }> = ({ content }) => (
  <Alert style={{ marginBottom: 24 }} title={content} type="error" showIcon />
);

const getApiErrorCode = (error: unknown) => {
  if (!error || typeof error !== 'object' || !('response' in error))
    return undefined;
  const response = error.response;
  if (!response || typeof response !== 'object' || !('data' in response))
    return undefined;
  const data = response.data;
  if (!data || typeof data !== 'object' || !('code' in data)) return undefined;
  return typeof data.code === 'string' ? data.code : undefined;
};

const Login: React.FC = () => {
  const [loginFailed, setLoginFailed] = useState(false);
  const [loginType, setLoginType] = useState<'account' | 'sms'>('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const { message } = App.useApp();
  const intl = useIntl();
  const locale = getAppLocale(getLocale());

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      startTransition(() => {
        setInitialState((state) => ({
          ...state,
          currentUser: userInfo,
        }));
      });
    }
  };

  const handleSubmit = async (values: AdminLoginFormValues) => {
    try {
      setLoginFailed(false);
      if (loginType === 'sms') {
        if (!values.mobile || !values.code) return;
        await loginAdminWithSms({
          mobile: values.mobile,
          code: values.code,
          autoLogin: values.autoLogin,
        });
      } else {
        if (!values.username || !values.password) return;
        await loginAdmin({
          username: values.username,
          password: values.password,
          autoLogin: values.autoLogin,
        });
      }
      message.success(
        intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        }),
      );
      await fetchUserInfo();
      const urlParams = new URL(window.location.href).searchParams;
      history.replace(getSafeRedirectUrl(urlParams.get('redirect')));
    } catch {
      setLoginFailed(true);
      message.error(
        intl.formatMessage({
          id: 'pages.login.failure',
          defaultMessage: '登录失败，请重试！',
        }),
      );
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>{`${intl.formatMessage({ id: 'menu.login', defaultMessage: '登录' })} - ${appSettings.title}`}</title>
      </Helmet>
      <Lang />
      <div style={{ flex: '1', padding: '32px 0' }}>
        <LoginForm
          contentStyle={{ minWidth: 280, maxWidth: '75vw' }}
          logo={
            <img
              alt={appSettings.title}
              src={appSettings.logo}
              style={{ objectFit: 'contain' }}
            />
          }
          title={appSettings.title}
          subTitle={appSettings.slogan[locale]}
          initialValues={{ autoLogin: true }}
          onFinish={async (values) => {
            await handleSubmit(values as AdminLoginFormValues);
          }}
        >
          <Tabs
            activeKey={loginType}
            centered
            items={[
              {
                key: 'account',
                label: intl.formatMessage({
                  id: 'pages.login.accountLogin.tab',
                  defaultMessage: '账号登录',
                }),
              },
              {
                key: 'sms',
                label: intl.formatMessage({
                  id: 'pages.login.smsLogin.tab',
                  defaultMessage: '短信登录',
                }),
              },
            ]}
            onChange={(key) => {
              setLoginType(key as 'account' | 'sms');
              setLoginFailed(false);
            }}
          />
          {loginFailed && (
            <LoginMessage
              content={intl.formatMessage({
                id:
                  loginType === 'sms'
                    ? 'pages.login.smsLogin.errorMessage'
                    : 'pages.login.accountLogin.errorMessage',
                defaultMessage:
                  loginType === 'sms'
                    ? '手机号或验证码错误'
                    : '用户名或密码错误',
              })}
            />
          )}
          {loginType === 'account' ? (
            <>
              <ProFormText
                name="username"
                fieldProps={{ size: 'large', prefix: <UserOutlined /> }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.username.placeholder',
                  defaultMessage: '用户名',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名！"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '密码',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
            </>
          ) : (
            <>
              <ProFormText
                name="mobile"
                fieldProps={{ size: 'large', prefix: <MobileOutlined /> }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.mobile.placeholder',
                  defaultMessage: '手机号',
                })}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'pages.login.mobile.required',
                      defaultMessage: '请输入手机号！',
                    }),
                  },
                  {
                    pattern: /^1[3-9]\d{9}$/,
                    message: intl.formatMessage({
                      id: 'pages.login.mobile.invalid',
                      defaultMessage: '请输入正确的中国大陆手机号！',
                    }),
                  },
                ]}
              />
              <ProFormCaptcha
                name="code"
                phoneName="mobile"
                fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
                captchaProps={{ size: 'large' }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.code.placeholder',
                  defaultMessage: '短信验证码',
                })}
                rules={[
                  {
                    required: true,
                    message: intl.formatMessage({
                      id: 'pages.login.code.required',
                      defaultMessage: '请输入短信验证码！',
                    }),
                  },
                  {
                    pattern: /^\d{6}$/,
                    message: intl.formatMessage({
                      id: 'pages.login.code.invalid',
                      defaultMessage: '验证码为 6 位数字！',
                    }),
                  },
                ]}
                captchaTextRender={(timing, count) =>
                  timing
                    ? intl.formatMessage(
                        {
                          id: 'pages.login.code.resend',
                          defaultMessage: '{seconds} 秒后重发',
                        },
                        { seconds: count },
                      )
                    : intl.formatMessage({
                        id: 'pages.login.code.send',
                        defaultMessage: '获取验证码',
                      })
                }
                onGetCaptcha={async (mobile) => {
                  try {
                    await sendAdminSmsCode(mobile);
                    message.success(
                      intl.formatMessage({
                        id: 'pages.login.code.sent',
                        defaultMessage: '验证码已发送！',
                      }),
                    );
                  } catch (error) {
                    const errorCode = getApiErrorCode(error);
                    const messageId =
                      errorCode === 'E_ADMIN_MOBILE_NOT_BOUND'
                        ? 'pages.login.code.mobileNotBound'
                        : errorCode === 'E_DATABASE_MIGRATION_REQUIRED'
                          ? 'pages.login.code.schemaNotReady'
                          : errorCode === 'E_SMS_RATE_LIMITED'
                            ? 'pages.login.code.rateLimited'
                            : errorCode === 'E_SMS_SEND_FAILED'
                              ? 'pages.login.code.providerFailure'
                              : 'pages.login.code.sendFailure';
                    message.error(
                      intl.formatMessage({
                        id: messageId,
                        defaultMessage: '验证码发送失败，请稍后重试！',
                      }),
                    );
                    throw error;
                  }
                }}
              />
            </>
          )}
          <div style={{ marginBottom: 24 }}>
            <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage
                id="pages.login.rememberMe"
                defaultMessage="记住登录状态"
              />
            </ProFormCheckbox>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
