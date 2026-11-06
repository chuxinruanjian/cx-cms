import {
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons';
import {
  type ActionType,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { history, useAccess, useIntl } from '@umijs/max';
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tag,
} from 'antd';
import { useRef, useState } from 'react';
import { AdminPage } from '@/components';
import { getAvatarText } from '@/utils/avatar';
import dayjs from '@/utils/dayjs';
import Editor from './Editor';
import {
  listMembers,
  type Member,
  type MemberFilters,
  updateMember,
} from './service';
import useStyles from './style.style';

export default () => {
  const intl = useIntl();
  const access = useAccess();
  const { message, modal } = App.useApp();
  const { styles } = useStyles();
  const t = (key: string) => intl.formatMessage({ id: `members.${key}` });
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm<{
    keyword?: string;
    status?: 'enabled' | 'disabled';
  }>();
  const [filters, setFilters] = useState<MemberFilters>({});
  const [editing, setEditing] = useState<Member>();
  const formatTime = (value: string | null) =>
    value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '—';
  const columns: ProColumns<Member>[] = [
    { title: t('id'), dataIndex: 'id', width: 80 },
    {
      title: t('user'),
      dataIndex: 'username',
      width: 250,
      render: (_, row) => (
        <Space>
          <Avatar src={row.avatar || undefined}>
            {getAvatarText(row.nickname || row.username)}
          </Avatar>
          <span>
            {row.nickname || row.username}
            <br />
            <small>{row.username}</small>
          </span>
        </Space>
      ),
    },
    { title: t('mobile'), dataIndex: 'mobile', width: 150 },
    {
      title: t('status'),
      dataIndex: 'status',
      width: 100,
      render: (_, row) => (
        <Tag color={row.status ? 'green' : 'default'}>
          {t(row.status ? 'enabled' : 'disabled')}
        </Tag>
      ),
    },
    {
      title: t('passwordLogin'),
      dataIndex: 'passwordLoginEnabled',
      width: 150,
      render: (_, row) => t(row.passwordLoginEnabled ? 'enabled' : 'notSet'),
    },
    {
      title: t('lastLoginAt'),
      dataIndex: 'lastLoginAt',
      width: 180,
      render: (_, row) => formatTime(row.lastLoginAt),
    },
    {
      title: t('createdAt'),
      dataIndex: 'createdAt',
      width: 180,
      render: (_, row) => formatTime(row.createdAt),
    },
    {
      title: t('actions'),
      valueType: 'option',
      width: 80,
      fixed: 'right',
      render: (_, row) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              { key: 'detail', icon: <EyeOutlined />, label: t('detail') },
              ...(access.canUpdateMembers
                ? [
                    { key: 'edit', icon: <EditOutlined />, label: t('edit') },
                    {
                      key: 'status',
                      icon: row.status ? (
                        <StopOutlined />
                      ) : (
                        <CheckCircleOutlined />
                      ),
                      label: t(row.status ? 'disable' : 'enable'),
                      danger: row.status,
                    },
                  ]
                : []),
            ],
            onClick: ({ key }) => {
              if (key === 'detail') history.push(`/members/${row.id}`);
              if (key === 'edit') setEditing(row);
              if (key === 'status')
                modal.confirm({
                  title: t(row.status ? 'disableTitle' : 'enableTitle'),
                  content: row.status ? t('disableHint') : undefined,
                  okText: t('confirm'),
                  cancelText: t('cancel'),
                  onOk: async () => {
                    await updateMember(row.id, { status: !row.status });
                    message.success(t('saved'));
                    await actionRef.current?.reload();
                  },
                });
            },
          }}
        >
          <Button icon={<MoreOutlined />} aria-label={t('actions')} />
        </Dropdown>
      ),
    },
  ];
  return (
    <AdminPage title={t('title')} breadcrumbs={[{ title: t('title') }]}>
      <div className={styles.stack}>
        <Card>
          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => {
              setFilters({
                keyword: values.keyword?.trim() || undefined,
                status:
                  values.status === undefined
                    ? undefined
                    : values.status === 'enabled',
              });
              actionRef.current?.setPageInfo?.({ current: 1 });
            }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12} xl={8}>
                <Form.Item name="keyword" label={t('keyword')}>
                  <Input allowClear placeholder={t('keywordPlaceholder')} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} xl={8}>
                <Form.Item name="status" label={t('status')}>
                  <Select
                    allowClear
                    placeholder={t('all')}
                    options={[
                      { value: 'enabled', label: t('enabled') },
                      { value: 'disabled', label: t('disabled') },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <div className={styles.filterActions}>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    form.resetFields();
                    setFilters({});
                    actionRef.current?.setPageInfo?.({ current: 1 });
                  }}
                >
                  {t('reset')}
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                >
                  {t('search')}
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
        <ProTable<Member>
          rowKey="id"
          actionRef={actionRef}
          columns={columns}
          search={false}
          params={filters}
          headerTitle={t('list')}
          request={async (params) => {
            const result = await listMembers({
              keyword: params.keyword,
              status: params.status,
              page: params.current || 1,
              perPage: params.pageSize || 20,
            });
            return {
              data: result.data,
              total: result.meta.total,
              success: true,
            };
          }}
          pagination={{ defaultPageSize: 20, showSizeChanger: true }}
          scroll={{ x: 1220 }}
        />
      </div>
      <Editor
        member={editing}
        onClose={() => setEditing(undefined)}
        onSaved={() => {
          actionRef.current?.reload();
        }}
      />
    </AdminPage>
  );
};
