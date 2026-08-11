import {
  ModalForm,
  ProFormCaptcha,
  ProFormText,
} from '@ant-design/pro-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl, useModel } from '@umijs/max';
import { App, Button, Form, List } from 'antd';
import React, { useState } from 'react';
import { adminFeatures } from '@/config/features';
import type { AdminAuthUser } from '@/types/admin';
import {
  changeCurrentPassword,
  getRequestErrorCode,
  queryCurrent,
  sendSecurityMobileCode,
  updateSecurityMobile,
} from '../service';

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface MobileFormValues {
  currentPassword: string;
  mobile: string;
  code: string;
}

interface SecurityItem {
  key: string;
  title: React.ReactNode;
  description: React.ReactNode;
  actions: React.ReactNode[];
}

const maskMobile = (mobile: string) =>
  mobile.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');

const SecurityView: React.FC = () => {
  const intl = useIntl();
  const { message } = App.useApp();
  const { setInitialState } = useModel('@@initialState');
  const queryClient = useQueryClient();
  const [passwordForm] = Form.useForm<PasswordFormValues>();
  const [mobileForm] = Form.useForm<MobileFormValues>();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => queryCurrent().then((result) => result.data),
  });
  const t = (id: string, defaultMessage: string) =>
    intl.formatMessage({ id, defaultMessage });

  const errorMessages: Record<string, [string, string]> = {
    E_CURRENT_PASSWORD_INVALID: [
      'app.settings.security.current-password-invalid',
      'The current password is incorrect!',
    ],
    E_PASSWORD_UNCHANGED: [
      'app.settings.security.password-unchanged',
      'The new password must be different from the current password!',
    ],
    E_ADMIN_MOBILE_ALREADY_BOUND: [
      'app.settings.security.mobile-already-bound',
      'This mobile number is bound to another administrator account!',
    ],
    E_ADMIN_MOBILE_UNCHANGED: [
      'app.settings.security.mobile-unchanged',
      'The new mobile number must differ from the current number!',
    ],
    E_INVALID_SMS_CODE: [
      'app.settings.security.mobile-code-error',
      'The verification code is invalid or has expired!',
    ],
    E_SMS_RATE_LIMITED: [
      'app.settings.security.mobile-code-rate-limited',
      'Too many requests. Please try again later!',
    ],
    E_SMS_SEND_FAILED: [
      'app.settings.security.mobile-code-send-failed',
      'Failed to send SMS. Check the Aliyun SMS configuration or try again later!',
    ],
    E_DATABASE_MIGRATION_REQUIRED: [
      'app.settings.security.schema-not-ready',
      'The database schema is out of date. Run npm run db:migrate and restart the API.',
    ],
  };

  const showRequestError = (error: unknown) => {
    const errorMessage: [string, string] = errorMessages[
      getRequestErrorCode(error) || ''
    ] || [
      'app.settings.security.update-failed',
      'The operation failed. Please try again later!',
    ];
    message.error(t(...errorMessage));
  };

  const updateCurrentUser = async (user: AdminAuthUser) => {
    queryClient.setQueryData(['current-user'], user);
    await setInitialState((state) => ({
      ...state,
      currentUser: user,
    }));
  };

  const passwordModal = (
    <ModalForm<PasswordFormValues>
      form={passwordForm}
      open={passwordOpen}
      onOpenChange={setPasswordOpen}
      title={t(
        'app.settings.security.password-title',
        'Change Account Password',
      )}
      width={480}
      layout="vertical"
      requiredMark={false}
      modalProps={{
        destroyOnHidden: true,
        afterClose: () => passwordForm.resetFields(),
      }}
      submitter={{
        searchConfig: {
          resetText: t('app.settings.security.cancel', 'Cancel'),
          submitText: t('app.settings.security.confirm', 'Confirm'),
        },
      }}
      onFinish={async ({ currentPassword, newPassword }) => {
        try {
          await changeCurrentPassword({ currentPassword, newPassword });
          message.success(
            t(
              'app.settings.security.password-updated',
              'Account password updated!',
            ),
          );
          return true;
        } catch (error) {
          showRequestError(error);
          return false;
        }
      }}
    >
      <ProFormText.Password
        name="currentPassword"
        label={t('app.settings.security.current-password', 'Current password')}
        placeholder={t(
          'app.settings.security.current-password-placeholder',
          'Enter your current account password',
        )}
        fieldProps={{ autoComplete: 'current-password' }}
        rules={[
          {
            required: true,
            message: t(
              'app.settings.security.current-password-required',
              'Please enter your current account password!',
            ),
          },
        ]}
      />
      <ProFormText.Password
        name="newPassword"
        label={t('app.settings.security.new-password', 'New password')}
        placeholder={t(
          'app.settings.security.new-password-placeholder',
          'Enter a new password',
        )}
        fieldProps={{ autoComplete: 'new-password' }}
        rules={[
          {
            required: true,
            message: t(
              'app.settings.security.new-password-required',
              'Please enter a new password!',
            ),
          },
          {
            pattern: /^(?=.*[A-Za-z])(?=.*\d).{8,128}$/,
            message: t(
              'app.settings.security.new-password-invalid',
              'Use at least 8 characters with both letters and numbers!',
            ),
          },
        ]}
      />
      <ProFormText.Password
        name="confirmPassword"
        label={t(
          'app.settings.security.confirm-password',
          'Confirm new password',
        )}
        placeholder={t(
          'app.settings.security.confirm-password-placeholder',
          'Enter the new password again',
        )}
        fieldProps={{ autoComplete: 'new-password' }}
        dependencies={['newPassword']}
        rules={[
          {
            required: true,
            message: t(
              'app.settings.security.confirm-password-required',
              'Please confirm the new password!',
            ),
          },
          ({ getFieldValue }) => ({
            validator: (_, value) => {
              if (!value || value === getFieldValue('newPassword')) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error(
                  t(
                    'app.settings.security.confirm-password-mismatch',
                    'The two new passwords do not match!',
                  ),
                ),
              );
            },
          }),
        ]}
      />
    </ModalForm>
  );

  const mobileModal = (
    <ModalForm<MobileFormValues>
      form={mobileForm}
      open={mobileOpen}
      onOpenChange={setMobileOpen}
      title={t(
        currentUser?.mobile
          ? 'app.settings.security.mobile-modify-title'
          : 'app.settings.security.mobile-bind-title',
        currentUser?.mobile ? 'Change Security Phone' : 'Bind Security Phone',
      )}
      width={480}
      layout="vertical"
      requiredMark={false}
      modalProps={{
        destroyOnHidden: true,
        afterClose: () => mobileForm.resetFields(),
      }}
      submitter={{
        searchConfig: {
          resetText: t('app.settings.security.cancel', 'Cancel'),
          submitText: t('app.settings.security.confirm', 'Confirm'),
        },
      }}
      onFinish={async (values) => {
        try {
          const updatedUser = await updateSecurityMobile(values);
          await updateCurrentUser(updatedUser);
          message.success(
            t(
              currentUser?.mobile
                ? 'app.settings.security.mobile-updated'
                : 'app.settings.security.mobile-bound',
              currentUser?.mobile
                ? 'Security phone updated!'
                : 'Security phone bound!',
            ),
          );
          return true;
        } catch (error) {
          showRequestError(error);
          return false;
        }
      }}
    >
      <ProFormText.Password
        name="currentPassword"
        label={t('app.settings.security.current-password', 'Current password')}
        placeholder={t(
          'app.settings.security.current-password-placeholder',
          'Enter your current account password',
        )}
        fieldProps={{ autoComplete: 'current-password' }}
        rules={[
          {
            required: true,
            message: t(
              'app.settings.security.current-password-required',
              'Please enter your current account password!',
            ),
          },
        ]}
      />
      <ProFormText
        name="mobile"
        label={t('app.settings.security.new-mobile', 'New mobile number')}
        placeholder={t(
          'app.settings.security.new-mobile-placeholder',
          'Enter a new mobile number',
        )}
        fieldProps={{
          autoComplete: 'tel',
          inputMode: 'numeric',
          maxLength: 11,
        }}
        rules={[
          {
            required: true,
            message: t(
              'app.settings.security.new-mobile-required',
              'Please enter a new mobile number!',
            ),
          },
          {
            pattern: /^1[3-9]\d{9}$/,
            message: t(
              'app.settings.security.new-mobile-invalid',
              'Please enter a valid mainland China mobile number!',
            ),
          },
        ]}
      />
      <ProFormCaptcha
        name="code"
        phoneName="mobile"
        label={t('app.settings.security.mobile-code', 'SMS verification code')}
        placeholder={t(
          'app.settings.security.mobile-code-placeholder',
          'Enter the SMS verification code',
        )}
        fieldProps={{ autoComplete: 'one-time-code', inputMode: 'numeric' }}
        captchaProps={{ type: 'default' }}
        rules={[
          {
            required: true,
            message: t(
              'app.settings.security.mobile-code-required',
              'Please enter the SMS verification code!',
            ),
          },
          {
            pattern: /^\d{6}$/,
            message: t(
              'app.settings.security.mobile-code-invalid',
              'The verification code must contain 6 digits!',
            ),
          },
        ]}
        captchaTextRender={(timing, count) =>
          timing
            ? intl.formatMessage(
                {
                  id: 'app.settings.security.mobile-code-resend',
                  defaultMessage: 'Resend in {seconds}s',
                },
                { seconds: count },
              )
            : t('app.settings.security.mobile-code-send', 'Get code')
        }
        onGetCaptcha={async (mobile) => {
          try {
            await sendSecurityMobileCode(mobile);
            message.success(
              t(
                'app.settings.security.mobile-code-sent',
                'Verification code sent!',
              ),
            );
          } catch (error) {
            showRequestError(error);
            throw error;
          }
        }}
      />
    </ModalForm>
  );

  const mobile = currentUser?.mobile;
  const data: SecurityItem[] = [
    {
      key: 'password',
      title: t('app.settings.security.password', 'Account Password'),
      description: t(
        'app.settings.security.password-description',
        'Configured. Update your password regularly',
      ),
      actions: [
        <Button
          key="password"
          type="link"
          onClick={() => setPasswordOpen(true)}
        >
          {t('app.settings.security.modify', 'Modify')}
        </Button>,
      ],
    },
    {
      key: 'mobile',
      title: t('app.settings.security.phone', 'Security Phone'),
      description: mobile
        ? `${t('app.settings.security.phone-description', 'Bound phone')}：${maskMobile(mobile)}`
        : t(
            'app.settings.security.phone-unbound',
            'No security phone is bound',
          ),
      actions: [
        <Button key="mobile" type="link" onClick={() => setMobileOpen(true)}>
          {mobile
            ? t('app.settings.security.modify', 'Modify')
            : t('app.settings.security.bind', 'Bind')}
        </Button>,
      ],
    },
    {
      key: 'question',
      title: t('app.settings.security.question', 'Security Question'),
      description: t(
        'app.settings.security.question-description',
        'The security question is not set',
      ),
      actions: [
        <Button key="question" type="link">
          {t('app.settings.security.set', 'Set')}
        </Button>,
      ],
    },
    {
      key: 'email',
      title: t('app.settings.security.email', 'Backup Email'),
      description: `${t('app.settings.security.email-description', 'Bound Email')}：ant***sign.com`,
      actions: [
        <Button key="email" type="link">
          {t('app.settings.security.modify', 'Modify')}
        </Button>,
      ],
    },
    {
      key: 'mfa',
      title: t('app.settings.security.mfa', 'MFA Device'),
      description: t(
        'app.settings.security.mfa-description',
        'No MFA device is bound',
      ),
      actions: [
        <Button key="mfa" type="link">
          {t('app.settings.security.bind', 'Bind')}
        </Button>,
      ],
    },
  ].filter((item) => adminFeatures.mobileEnabled || item.key !== 'mobile');

  return (
    <>
      <List<SecurityItem>
        itemLayout="horizontal"
        loading={isLoading}
        dataSource={data}
        renderItem={(item) => (
          <List.Item actions={item.actions}>
            <List.Item.Meta title={item.title} description={item.description} />
          </List.Item>
        )}
      />
      {passwordModal}
      {adminFeatures.mobileEnabled && mobileModal}
    </>
  );
};

export default SecurityView;
