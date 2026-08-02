import {
  AppstoreAddOutlined,
  CloudUploadOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { history, useIntl } from '@umijs/max';
import type { MenuProps } from 'antd';
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
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import { useMemo, useState } from 'react';
import { AdminPage } from '@/components';
import dayjs from '@/utils/dayjs';
import {
  type StandardRecord,
  type StandardStatus,
  standardRecords,
} from '../data';
import useStyles from './style.style';

interface FilterValues {
  keyword?: string;
  category?: StandardRecord['category'];
  status?: StandardStatus;
  owner?: string;
}

const statusColor: Record<StandardStatus, string> = {
  enabled: 'green',
  disabled: 'default',
  draft: 'gold',
};

export default () => {
  const intl = useIntl();
  const { message, modal } = App.useApp();
  const { styles } = useStyles();
  const [filterForm] = Form.useForm<FilterValues>();
  const [quickForm] = Form.useForm();
  const [filters, setFilters] = useState<FilterValues>({});
  const [quickOpen, setQuickOpen] = useState(false);
  const t = (
    id: string,
    defaultMessage: string,
    values?: Record<string, string | number>,
  ) => intl.formatMessage({ id, defaultMessage }, values);

  const categoryOptions = [
    {
      value: 'platform',
      label: t('uiStandard.category.platform', 'Platform'),
    },
    {
      value: 'content',
      label: t('uiStandard.category.content', 'Content'),
    },
    {
      value: 'marketing',
      label: t('uiStandard.category.marketing', 'Marketing'),
    },
  ];
  const statusOptions = [
    {
      value: 'enabled',
      label: t('uiStandard.status.enabled', 'Enabled'),
    },
    {
      value: 'disabled',
      label: t('uiStandard.status.disabled', 'Disabled'),
    },
    {
      value: 'draft',
      label: t('uiStandard.status.draft', 'Draft'),
    },
  ];

  const records = useMemo(
    () =>
      standardRecords.filter((record) => {
        const keyword = filters.keyword?.trim().toLowerCase();
        return (
          (!keyword ||
            record.name.toLowerCase().includes(keyword) ||
            record.code.toLowerCase().includes(keyword)) &&
          (!filters.category || record.category === filters.category) &&
          (!filters.status || record.status === filters.status) &&
          (!filters.owner || record.owner === filters.owner)
        );
      }),
    [filters],
  );

  const actionMenu = (record: StandardRecord): MenuProps => ({
    items: [
      {
        key: 'detail',
        icon: <EyeOutlined />,
        label: t('uiStandard.action.detail', 'Details'),
      },
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: t('uiStandard.action.edit', 'Edit'),
      },
      {
        type: 'divider',
      },
      {
        key: 'copy',
        icon: <CopyOutlined />,
        label: t('uiStandard.action.copy', 'Duplicate'),
      },
      {
        key: 'disable',
        icon: <StopOutlined />,
        label: t('uiStandard.action.disable', 'Disable'),
      },
      {
        key: 'delete',
        danger: true,
        icon: <DeleteOutlined />,
        label: t('uiStandard.action.delete', 'Delete'),
      },
    ],
    onClick: ({ key }) => {
      if (key === 'detail') {
        history.push(`/ui-standard/detail/${record.id}`);
      } else if (key === 'edit') {
        history.push(`/ui-standard/edit/${record.id}`);
      } else if (key === 'delete') {
        modal.confirm({
          title: t('uiStandard.action.delete', 'Delete'),
          content: t(
            'uiStandard.message.static',
            'This static reference does not write to a database',
          ),
          okButtonProps: { danger: true },
        });
      } else {
        message.success(
          key === 'copy'
            ? t('uiStandard.message.copied', 'Duplicate action simulated')
            : t('uiStandard.message.disabled', 'Disable action simulated'),
        );
      }
    },
  });

  const columns: ProColumns<StandardRecord>[] = [
    {
      title: t('uiStandard.field.name', 'Project name'),
      dataIndex: 'name',
      width: 260,
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
          <Button
            type="link"
            style={{ padding: 0, height: 'auto' }}
            onClick={() => history.push(`/ui-standard/detail/${record.id}`)}
          >
            {record.name}
          </Button>
          <Typography.Text type="secondary">{record.code}</Typography.Text>
        </Space>
      ),
    },
    {
      title: t('uiStandard.field.category', 'Category'),
      dataIndex: 'category',
      width: 150,
      render: (_, record) =>
        categoryOptions.find((option) => option.value === record.category)
          ?.label,
    },
    {
      title: t('uiStandard.field.owner', 'Owner'),
      dataIndex: 'owner',
      width: 140,
    },
    {
      title: t('uiStandard.field.status', 'Status'),
      dataIndex: 'status',
      width: 120,
      render: (_, record) => (
        <Tag color={statusColor[record.status]}>
          {
            statusOptions.find((option) => option.value === record.status)
              ?.label
          }
        </Tag>
      ),
    },
    {
      title: t('uiStandard.field.updatedAt', 'Updated at'),
      dataIndex: 'updatedAt',
      width: 180,
      render: (_, record) => dayjs(record.updatedAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('uiStandard.field.actions', 'Actions'),
      key: 'actions',
      width: 72,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Dropdown menu={actionMenu(record)} trigger={['click']}>
          <Button
            aria-label={t('uiStandard.action.more', 'More actions')}
            icon={<MoreOutlined />}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <AdminPage
      title={t('uiStandard.list.title', 'Standard List Page')}
      breadcrumbs={[
        { title: t('uiStandard.home', 'Home'), path: '/' },
        { title: t('uiStandard.section', 'UI Standards') },
        { title: t('uiStandard.list.title', 'Standard List Page') },
      ]}
    >
      <div className={styles.stack}>
        <Card>
          <Form
            form={filterForm}
            layout="vertical"
            onFinish={(values) => setFilters(values)}
          >
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12} xl={6}>
                <Form.Item
                  name="keyword"
                  label={t('uiStandard.field.keyword', 'Name / code')}
                >
                  <Input
                    allowClear
                    placeholder={t(
                      'uiStandard.placeholder.keyword',
                      'Enter a name or code',
                    )}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} xl={6}>
                <Form.Item
                  name="category"
                  label={t('uiStandard.field.category', 'Category')}
                >
                  <Select
                    allowClear
                    options={categoryOptions}
                    placeholder={t('uiStandard.placeholder.select', 'Select')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} xl={6}>
                <Form.Item
                  name="status"
                  label={t('uiStandard.field.status', 'Status')}
                >
                  <Select
                    allowClear
                    options={statusOptions}
                    placeholder={t('uiStandard.placeholder.select', 'Select')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12} xl={6}>
                <Form.Item
                  name="owner"
                  label={t('uiStandard.field.owner', 'Owner')}
                >
                  <Select
                    allowClear
                    options={['Chen Yu', 'Lin Wei', 'Zhou Min'].map(
                      (value) => ({
                        value,
                        label: value,
                      }),
                    )}
                    placeholder={t('uiStandard.placeholder.select', 'Select')}
                  />
                </Form.Item>
              </Col>
            </Row>
            <div className={styles.filterActions}>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    filterForm.resetFields();
                    setFilters({});
                  }}
                >
                  {t('uiStandard.action.reset', 'Reset')}
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                >
                  {t('uiStandard.action.search', 'Search')}
                </Button>
              </Space>
            </div>
          </Form>
        </Card>

        <ProTable<StandardRecord>
          rowKey="id"
          columns={columns}
          dataSource={records}
          search={false}
          headerTitle={
            <Space wrap>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => history.push('/ui-standard/create')}
              >
                {t('uiStandard.action.create', 'Create project')}
              </Button>
              <Button
                icon={<AppstoreAddOutlined />}
                onClick={() => setQuickOpen(true)}
              >
                {t('uiStandard.action.quickCreate', 'Quick create')}
              </Button>
              <Button
                icon={<CloudUploadOutlined />}
                onClick={() =>
                  message.info(
                    t(
                      'uiStandard.message.static',
                      'This static reference does not write to a database',
                    ),
                  )
                }
              >
                {t('uiStandard.action.import', 'Import')}
              </Button>
            </Space>
          }
          options={{
            reload: () =>
              message.success(
                t('uiStandard.message.refreshed', 'Static data refreshed'),
              ),
            density: true,
            setting: true,
          }}
          rowSelection={{}}
          scroll={{ x: 980 }}
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            showTotal: (total) =>
              t('uiStandard.list.total', '{total} static example records', {
                total,
              }),
          }}
        />
      </div>

      <Modal
        title={t('uiStandard.quick.title', 'Quick create (up to 6 fields)')}
        open={quickOpen}
        destroyOnHidden
        okText={t('uiStandard.action.save', 'Save')}
        cancelText={t('uiStandard.action.cancel', 'Cancel')}
        onCancel={() => setQuickOpen(false)}
        onOk={async () => {
          await quickForm.validateFields();
          message.success(
            t(
              'uiStandard.message.saved',
              'The static form passed validation; nothing was written',
            ),
          );
          setQuickOpen(false);
          quickForm.resetFields();
        }}
      >
        <Typography.Paragraph
          type="secondary"
          className={styles.modalDescription}
        >
          {t(
            'uiStandard.quick.description',
            'Use a modal for six fields or fewer.',
          )}
        </Typography.Paragraph>
        <Form form={quickForm} layout="vertical">
          <Form.Item
            name="name"
            label={t('uiStandard.field.name', 'Project name')}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label={t('uiStandard.field.category', 'Category')}
            rules={[{ required: true }]}
          >
            <Select options={categoryOptions} />
          </Form.Item>
          <Form.Item name="owner" label={t('uiStandard.field.owner', 'Owner')}>
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={t('uiStandard.field.description', 'Description')}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </AdminPage>
  );
};
