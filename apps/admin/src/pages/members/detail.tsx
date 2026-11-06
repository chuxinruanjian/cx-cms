import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { history, useAccess, useIntl, useParams } from '@umijs/max';
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Result,
  Space,
  Spin,
  Tag,
} from 'antd';
import { useState } from 'react';
import { AdminPage } from '@/components';
import { getAvatarText } from '@/utils/avatar';
import dayjs from '@/utils/dayjs';
import Editor from './Editor';
import { getMember } from './service';

export default () => {
  const { id } = useParams<{ id: string }>();
  const intl = useIntl();
  const access = useAccess();
  const t = (key: string) => intl.formatMessage({ id: `members.${key}` });
  const queryClient = useQueryClient();
  const key = ['managed-member', id];
  const {
    data: member,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: key,
    queryFn: () => getMember(Number(id)),
    retry: false,
  });
  const [editing, setEditing] = useState(false);
  const time = (value: string | null) =>
    value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '—';
  return (
    <AdminPage
      title={t('detail')}
      breadcrumbs={[
        { title: t('title'), path: '/members' },
        { title: t('detail') },
      ]}
      extra={[
        <Button
          key="back"
          icon={<ArrowLeftOutlined />}
          onClick={() => history.push('/members')}
        >
          {t('back')}
        </Button>,
        ...(access.canUpdateMembers && member
          ? [
              <Button
                key="edit"
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditing(true)}
              >
                {t('edit')}
              </Button>,
            ]
          : []),
      ]}
    >
      {isPending ? (
        <Spin />
      ) : isError || !member ? (
        <Result
          status="error"
          title={t('loadFailed')}
          extra={<Button onClick={() => refetch()}>{t('retry')}</Button>}
        />
      ) : (
        <Card
          title={
            <Space>
              <Avatar src={member.avatar || undefined}>
                {getAvatarText(member.nickname || member.username)}
              </Avatar>
              {member.nickname || member.username}
            </Space>
          }
        >
          <Descriptions
            column={{ xs: 1, sm: 2, lg: 3, xxl: 4 }}
            items={[
              { key: 'id', label: t('id'), children: member.id },
              {
                key: 'username',
                label: t('username'),
                children: member.username,
              },
              {
                key: 'nickname',
                label: t('nickname'),
                children: member.nickname || '—',
              },
              {
                key: 'mobile',
                label: t('mobile'),
                children: member.mobile || '—',
              },
              {
                key: 'status',
                label: t('status'),
                children: (
                  <Tag color={member.status ? 'green' : 'default'}>
                    {t(member.status ? 'enabled' : 'disabled')}
                  </Tag>
                ),
              },
              {
                key: 'passwordLogin',
                label: t('passwordLogin'),
                children: t(member.passwordLoginEnabled ? 'enabled' : 'notSet'),
              },
              {
                key: 'rename',
                label: t('rename'),
                children: t(member.canChangeUsername ? 'available' : 'used'),
              },
              {
                key: 'createdAt',
                label: t('createdAt'),
                children: time(member.createdAt),
              },
              {
                key: 'updatedAt',
                label: t('updatedAt'),
                children: time(member.updatedAt),
              },
              {
                key: 'lastLoginAt',
                label: t('lastLoginAt'),
                children: time(member.lastLoginAt),
              },
            ]}
          />
        </Card>
      )}
      <Editor
        member={editing ? member : undefined}
        onClose={() => setEditing(false)}
        onSaved={(updated) => queryClient.setQueryData(key, updated)}
      />
    </AdminPage>
  );
};
