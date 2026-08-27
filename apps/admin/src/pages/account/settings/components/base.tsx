import {
  ProForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl, useModel } from '@umijs/max';
import { App } from 'antd';
import React, { useState } from 'react';
import { AvatarUploader } from '@/components/Uploader';
import { getAvatarText } from '@/utils/avatar';
import { queryCurrent, updateCurrent } from '../service';
import useStyles from './index.style';

interface BasicSettingsValues {
  email: string;
  name: string;
  profile?: string;
}

const BaseView: React.FC = () => {
  const intl = useIntl();
  const { setInitialState } = useModel('@@initialState');
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const { styles } = useStyles();
  const [avatar, setAvatar] = useState<string | null>();
  const t = (id: string, defaultMessage: string) =>
    intl.formatMessage({ id, defaultMessage });
  const { data: currentUser, isLoading: loading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => queryCurrent().then((res) => res.data),
  });

  if (loading) return null;

  const displayName =
    currentUser?.name || t('app.settings.basic.avatar', 'Avatar');

  return (
    <div className={styles.baseView}>
      <div className={styles.left}>
        <ProForm<BasicSettingsValues>
          layout="vertical"
          onFinish={async (values) => {
            const updatedUser = await updateCurrent({
              fullName: values.name,
              email: values.email,
              profile: values.profile?.trim() || null,
              avatar:
                avatar === undefined ? currentUser?.avatar || null : avatar,
            });
            queryClient.setQueryData(['current-user'], updatedUser);
            setAvatar(updatedUser.avatar);
            await setInitialState((state) => ({
              ...state,
              currentUser: updatedUser,
            }));
            message.success(
              t(
                'app.settings.basic.update-success',
                'Basic information updated',
              ),
            );
            return true;
          }}
          submitter={{
            searchConfig: {
              submitText: t('app.settings.basic.update', 'Update Information'),
            },
            render: (_, dom) => dom[1],
          }}
          initialValues={{
            email: currentUser?.email,
            name: currentUser?.name,
            profile: currentUser?.profile,
          }}
          requiredMark={false}
        >
          <ProFormText
            width="md"
            name="email"
            label={t('app.settings.basic.email', 'Email')}
            rules={[
              {
                required: true,
                message: t(
                  'app.settings.basic.email-message',
                  'Please input your email!',
                ),
              },
              {
                type: 'email',
                message: t(
                  'app.settings.basic.email-invalid',
                  'Please enter a valid email address!',
                ),
              },
            ]}
          />
          <ProFormText
            width="md"
            name="name"
            label={t('app.settings.basic.nickname', 'Nickname')}
            rules={[
              {
                required: true,
                message: t(
                  'app.settings.basic.nickname-message',
                  'Please input your nickname!',
                ),
              },
              { max: 64 },
            ]}
          />
          <ProFormTextArea
            width="md"
            name="profile"
            label={t('app.settings.basic.profile', 'Personal profile')}
            fieldProps={{ maxLength: 500, showCount: true, rows: 4 }}
            placeholder={t(
              'app.settings.basic.profile-placeholder',
              'Brief introduction to yourself',
            )}
          />
        </ProForm>
      </div>
      <div className={styles.right}>
        <div className={styles.avatar_title}>
          {t('app.settings.basic.avatar', 'Avatar')}
        </div>
        <div className={styles.avatar}>
          <AvatarUploader
            fallbackText={getAvatarText(displayName)}
            value={avatar === undefined ? currentUser?.avatar : avatar}
            onChange={(value) =>
              setAvatar(typeof value === 'string' ? value : null)
            }
            title={t('app.settings.basic.change-avatar', 'Change avatar')}
          />
        </div>
      </div>
    </div>
  );
};

export default BaseView;
