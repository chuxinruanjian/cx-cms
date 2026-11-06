import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  type ActionType,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { useAccess, useIntl } from '@umijs/max';
import {
  App,
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { useRef, useState } from 'react';
import { AdminPage } from '@/components';
import dayjs from '@/utils/dayjs';
import {
  type ConfigInput,
  type ConfigType,
  createConfig,
  deleteConfig,
  listConfigs,
  type SystemConfig,
  updateConfig,
} from './service';
import useStyles from './style.style';

export default () => {
  const intl = useIntl();
  const access = useAccess();
  const { message, modal } = App.useApp();
  const { styles } = useStyles();
  const t = (key: string) => intl.formatMessage({ id: `systemConfig.${key}` });
  const actionRef = useRef<ActionType>(null);
  const [filterForm] = Form.useForm<{ keyword?: string }>();
  const [form] = Form.useForm<ConfigInput>();
  const [type, setType] = useState<ConfigType>('public');
  const [keyword, setKeyword] = useState<string>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SystemConfig>();
  const [saving, setSaving] = useState(false);

  const close = () => {
    setOpen(false);
    form.resetFields();
  };
  const showEditor = (row?: SystemConfig) => {
    form.resetFields();
    setEditing(row);
    if (row)
      form.setFieldsValue({
        configKey: row.configKey,
        name: row.name,
        value: row.type === 'public' ? row.value || undefined : undefined,
        description: row.description || undefined,
      });
    setOpen(true);
  };
  const save = async (values: ConfigInput) => {
    setSaving(true);
    try {
      if (editing) {
        await updateConfig(editing.id, {
          name: values.name,
          description: values.description || '',
          ...(values.value ? { value: values.value } : {}),
        });
      } else {
        await createConfig({ ...values, type });
      }
      message.success(t('saved'));
      close();
      await actionRef.current?.reload();
    } catch {
      // The shared request handler displays API errors; preserve the editor for correction.
    } finally {
      setSaving(false);
    }
  };

  const columns: ProColumns<SystemConfig>[] = [
    { title: t('name'), dataIndex: 'name', width: 160, ellipsis: true },
    { title: t('key'), dataIndex: 'configKey', width: 200, copyable: true },
    {
      title: t('value'),
      dataIndex: 'value',
      width: 240,
      render: (_, row) =>
        row.type === 'internal' ? (
          <Tag icon={<LockOutlined />}>
            {t(row.hasValue ? 'configured' : 'notConfigured')}
          </Tag>
        ) : (
          <Typography.Text
            ellipsis={{ tooltip: row.value }}
            style={{ maxWidth: 220 }}
          >
            {row.value}
          </Typography.Text>
        ),
    },
    { title: t('description'), dataIndex: 'description', ellipsis: true },
    {
      title: t('updatedAt'),
      dataIndex: 'updatedAt',
      width: 180,
      render: (_, row) =>
        dayjs(row.updatedAt || row.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: t('actions'),
      valueType: 'option',
      width: 80,
      fixed: 'right',
      render: (_, row) => {
        const items = [
          ...(access.canUpdateSystemConfig
            ? [{ key: 'edit', icon: <EditOutlined />, label: t('edit') }]
            : []),
          ...(access.canDeleteSystemConfig
            ? [
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: t('delete'),
                  danger: true,
                },
              ]
            : []),
        ];
        return items.length ? (
          <Dropdown
            menu={{
              items,
              onClick: ({ key }) => {
                if (key === 'edit') showEditor(row);
                if (key === 'delete')
                  modal.confirm({
                    title: t('deleteTitle'),
                    content: row.name,
                    okText: t('delete'),
                    cancelText: t('cancel'),
                    okButtonProps: { danger: true },
                    onOk: async () => {
                      await deleteConfig(row.id);
                      message.success(t('deleted'));
                      await actionRef.current?.reload();
                    },
                  });
              },
            }}
            trigger={['click']}
          >
            <Button icon={<MoreOutlined />} aria-label={t('actions')} />
          </Dropdown>
        ) : null;
      },
    },
  ];

  return (
    <AdminPage title={t('title')} breadcrumbs={[{ title: t('title') }]}>
      <Tabs
        activeKey={type}
        items={[
          { key: 'public', label: t('public') },
          { key: 'internal', label: t('internal') },
        ]}
        onChange={(key) => {
          setType(key as ConfigType);
          setKeyword(undefined);
          filterForm.resetFields();
          close();
        }}
      />
      <div className={styles.stack}>
        <Card>
          <Form
            form={filterForm}
            layout="vertical"
            onFinish={(values) => {
              setKeyword(values.keyword?.trim() || undefined);
              actionRef.current?.setPageInfo?.({ current: 1 });
            }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12} xl={8}>
                <Form.Item name="keyword" label={t('keyword')}>
                  <Input allowClear placeholder={t('searchPlaceholder')} />
                </Form.Item>
              </Col>
            </Row>
            <div className={styles.filterActions}>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    filterForm.resetFields();
                    setKeyword(undefined);
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
        <ProTable<SystemConfig>
          key={type}
          rowKey="id"
          actionRef={actionRef}
          columns={columns}
          search={false}
          params={{ type, keyword }}
          request={async (params) => {
            const result = await listConfigs({
              type,
              keyword: params.keyword,
              page: params.current || 1,
              perPage: params.pageSize || 20,
            });
            return {
              data: result.data,
              total: result.meta.total,
              success: true,
            };
          }}
          headerTitle={
            access.canCreateSystemConfig ? (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showEditor()}
              >
                {t('create')}
              </Button>
            ) : undefined
          }
          options={{ reload: true, density: true, setting: true }}
          pagination={{ defaultPageSize: 20, showSizeChanger: true }}
          scroll={{ x: 980 }}
        />
      </div>
      <Modal
        open={open}
        title={t(editing ? 'edit' : 'create')}
        forceRender
        confirmLoading={saving}
        okText={t('save')}
        cancelText={t('cancel')}
        onCancel={close}
        onOk={() => form.submit()}
        mask={{ closable: !saving }}
        closable={!saving}
        cancelButtonProps={{ disabled: saving }}
      >
        <Form form={form} layout="vertical" preserve={false} onFinish={save}>
          <Form.Item
            label={t('name')}
            name="name"
            rules={[{ required: true, message: t('nameRequired') }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            label={t('key')}
            name="configKey"
            extra={t('keyHint')}
            rules={[{ required: true, message: t('keyRequired') }]}
          >
            <Input
              disabled={Boolean(editing)}
              maxLength={128}
              placeholder="site.name"
            />
          </Form.Item>
          <Form.Item
            label={t(type === 'internal' && editing ? 'replaceValue' : 'value')}
            name="value"
            extra={
              type === 'internal'
                ? t(editing ? 'internalEditHint' : 'internalHint')
                : t('publicHint')
            }
            rules={[
              {
                required: !editing || type === 'public',
                message: t('valueRequired'),
              },
            ]}
          >
            {type === 'internal' ? (
              <Input.Password autoComplete="new-password" maxLength={8000} />
            ) : (
              <Input.TextArea rows={3} maxLength={8000} />
            )}
          </Form.Item>
          <Form.Item label={t('description')} name="description">
            <Input.TextArea rows={2} maxLength={255} />
          </Form.Item>
        </Form>
      </Modal>
    </AdminPage>
  );
};
