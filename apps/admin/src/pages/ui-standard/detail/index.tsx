import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { history, useIntl, useParams } from '@umijs/max';
import type { TableProps } from 'antd';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Flex,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { AdminPage } from '@/components';
import dayjs from '@/utils/dayjs';
import { standardRecords } from '../data';
import useStyles from '../style.style';

interface AuditRecord {
  id: number;
  action: string;
  operator: string;
  createdAt: string;
}

const auditRecords: AuditRecord[] = [
  {
    id: 1,
    action: 'Updated project description',
    operator: 'Chen Yu',
    createdAt: '2026-07-28T09:35:00+08:00',
  },
  {
    id: 2,
    action: 'Changed status to enabled',
    operator: 'Lin Wei',
    createdAt: '2026-07-26T14:12:00+08:00',
  },
  {
    id: 3,
    action: 'Created the project',
    operator: 'Chen Yu',
    createdAt: '2026-07-20T10:08:00+08:00',
  },
];

export default () => {
  const intl = useIntl();
  const { id } = useParams<{ id?: string }>();
  const { styles } = useStyles();
  const t = (key: string, defaultMessage: string) =>
    intl.formatMessage({ id: key, defaultMessage });
  const record =
    standardRecords.find((item) => item.id === Number(id)) ||
    standardRecords[0];

  const detailItems = [
    {
      key: 'name',
      label: t('uiStandard.field.name', 'Project name'),
      children: record.name,
    },
    {
      key: 'code',
      label: t('uiStandard.field.code', 'Project code'),
      children: record.code,
    },
    {
      key: 'category',
      label: t('uiStandard.field.category', 'Category'),
      children: t(`uiStandard.category.${record.category}`, record.category),
    },
    {
      key: 'status',
      label: t('uiStandard.field.status', 'Status'),
      children: (
        <Tag color={record.status === 'enabled' ? 'green' : 'gold'}>
          {t(`uiStandard.status.${record.status}`, record.status)}
        </Tag>
      ),
    },
    {
      key: 'owner',
      label: t('uiStandard.field.owner', 'Owner'),
      children: record.owner,
    },
    {
      key: 'createdAt',
      label: t('uiStandard.detail.createdAt', 'Created at'),
      children: '2026-07-20 10:08',
    },
    {
      key: 'createdBy',
      label: t('uiStandard.detail.createdBy', 'Created by'),
      children: 'Chen Yu',
    },
    {
      key: 'version',
      label: t('uiStandard.detail.version', 'Current version'),
      children: 'v2.4.0',
    },
    {
      key: 'description',
      label: t('uiStandard.field.description', 'Description'),
      children: record.description,
      span: 'filled' as const,
    },
  ];

  const auditColumns: TableProps<AuditRecord>['columns'] = [
    {
      title: t('uiStandard.field.description', 'Description'),
      dataIndex: 'action',
    },
    {
      title: t('uiStandard.field.owner', 'Owner'),
      dataIndex: 'operator',
      width: 160,
    },
    {
      title: t('uiStandard.field.updatedAt', 'Updated at'),
      dataIndex: 'createdAt',
      width: 190,
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <AdminPage
      title={t('uiStandard.detail.title', 'Project Details')}
      breadcrumbs={[
        { title: t('uiStandard.home', 'Home'), path: '/' },
        { title: t('uiStandard.section', 'UI Standards') },
        {
          title: t('uiStandard.list.title', 'Standard List Page'),
          path: '/ui-standard/list',
        },
        { title: t('uiStandard.detail.title', 'Project Details') },
      ]}
      extra={
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => history.push('/ui-standard/list')}
          >
            {t('uiStandard.action.back', 'Back to list')}
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => history.push(`/ui-standard/edit/${record.id}`)}
          >
            {t('uiStandard.action.edit', 'Edit')}
          </Button>
        </Space>
      }
    >
      <div className={styles.stack}>
        <Card title={t('uiStandard.detail.basic', 'Basic information')}>
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2, lg: 3, xxl: 4 }}
            items={detailItems}
          />
        </Card>

        <Card title={t('uiStandard.detail.operation', 'Operations')}>
          <Row gutter={[16, 16]}>
            {[
              ['uiStandard.detail.todayVisits', 'Visits today', '1,284'],
              ['uiStandard.detail.pendingTasks', 'Pending tasks', '12'],
              ['uiStandard.detail.members', 'Collaborators', '8'],
              ['uiStandard.detail.completion', 'Profile completeness', '92%'],
            ].map(([key, label, value]) => (
              <Col xs={24} sm={12} xl={6} key={key}>
                <Card size="small" className={styles.metricCard}>
                  <Flex orientation="vertical">
                    <Typography.Text type="secondary">
                      {t(key, label)}
                    </Typography.Text>
                    <Typography.Title level={3} className={styles.metricValue}>
                      {value}
                    </Typography.Title>
                  </Flex>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        <Card
          title={t('uiStandard.detail.audit', 'Recent activity')}
          styles={{ body: { padding: 0 } }}
        >
          <Table<AuditRecord>
            rowKey="id"
            columns={auditColumns}
            dataSource={auditRecords}
            pagination={false}
            scroll={{ x: 720 }}
          />
        </Card>
      </div>
    </AdminPage>
  );
};
