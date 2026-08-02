import { ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons';
import { history, useIntl, useParams } from '@umijs/max';
import {
  App,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Space,
  Switch,
} from 'antd';
import { AdminPage, TiptapEditor } from '@/components';
import { demoImageUpload } from '@/components/TiptapEditor/demoImageUpload';
import dayjs from '@/utils/dayjs';
import useStyles from '../style.style';

export default () => {
  const intl = useIntl();
  const { id } = useParams<{ id?: string }>();
  const { message } = App.useApp();
  const { styles } = useStyles();
  const [form] = Form.useForm();
  const isEdit = Boolean(id);
  const t = (key: string, defaultMessage: string) =>
    intl.formatMessage({ id: key, defaultMessage });
  const title = isEdit
    ? t('uiStandard.form.editTitle', 'Edit project')
    : t('uiStandard.form.createTitle', 'Create project');
  const demoContent = `<h2>${t(
    'uiStandard.editor.sampleTitle',
    'Rich text content',
  )}</h2><p>${t(
    'uiStandard.editor.sampleBody',
    'Use the toolbar to format text, insert links, lists, highlights, and images.',
  )}</p><p><span style="font-size: 18px; color: #2563eb">${t(
    'uiStandard.editor.sampleStyledText',
    'This line demonstrates an 18 px blue text style.',
  )}</span></p><ul><li>${t(
    'uiStandard.editor.sampleItemOne',
    'Supports controlled form values',
  )}</li><li>${t(
    'uiStandard.editor.sampleItemTwo',
    'Works on desktop and mobile screens',
  )}</li></ul><img src="/admin/logo.png" alt="${t(
    'uiStandard.editor.sampleImageAlt',
    'Resizable example image',
  )}" title="${t(
    'uiStandard.editor.sampleImageAlt',
    'Resizable example image',
  )}" width="128" height="128">`;

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

  return (
    <AdminPage
      title={title}
      breadcrumbs={[
        { title: t('uiStandard.home', 'Home'), path: '/' },
        { title: t('uiStandard.section', 'UI Standards') },
        {
          title: t('uiStandard.list.title', 'Standard List Page'),
          path: '/ui-standard/list',
        },
        { title },
      ]}
      extra={
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => history.push('/ui-standard/list')}
          >
            {t('uiStandard.action.back', 'Back')}
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => form.submit()}
          >
            {t('uiStandard.action.save', 'Save')}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={
          isEdit
            ? {
                name: 'Enterprise content portal',
                code: 'CONTENT-PORTAL',
                category: 'content',
                status: true,
                owner: 'Chen Yu',
                phone: '13800000000',
                email: 'owner@example.com',
                effectiveAt: dayjs('2026-08-01'),
                description: 'Unified content publishing and review workspace.',
                remarks: 'Static reference data.',
              }
            : { status: true, content: demoContent }
        }
        onFinish={() => {
          message.success(
            t(
              'uiStandard.message.saved',
              'The static form passed validation; nothing was written',
            ),
          );
          history.push('/ui-standard/list');
        }}
      >
        <div className={styles.stack}>
          <Card title={t('uiStandard.form.basic', 'Basic information')}>
            <Row gutter={[24, 0]}>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="name"
                  label={t('uiStandard.field.name', 'Project name')}
                  rules={[{ required: true }]}
                >
                  <Input
                    maxLength={80}
                    placeholder={t(
                      'uiStandard.placeholder.input',
                      'Enter a value',
                    )}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="code"
                  label={t('uiStandard.field.code', 'Project code')}
                  rules={[{ required: true }, { pattern: /^[A-Z][A-Z0-9-]+$/ }]}
                >
                  <Input placeholder="PROJECT-CODE" />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="category"
                  label={t('uiStandard.field.category', 'Category')}
                  rules={[{ required: true }]}
                >
                  <Select
                    options={categoryOptions}
                    placeholder={t('uiStandard.placeholder.select', 'Select')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="effectiveAt"
                  label={t('uiStandard.field.effectiveAt', 'Effective date')}
                  rules={[{ required: true }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label={t('uiStandard.field.description', 'Description')}
                  rules={[{ required: true }]}
                >
                  <Input.TextArea rows={4} maxLength={500} showCount />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title={t('uiStandard.form.contact', 'Owner information')}>
            <Row gutter={[24, 0]}>
              <Col xs={24} lg={8}>
                <Form.Item
                  name="owner"
                  label={t('uiStandard.field.owner', 'Owner')}
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item
                  name="phone"
                  label={t('uiStandard.field.phone', 'Phone')}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} lg={8}>
                <Form.Item
                  name="email"
                  label={t('uiStandard.field.email', 'Email')}
                  rules={[{ type: 'email' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Card title={t('uiStandard.form.publish', 'Publishing')}>
            <Row gutter={[24, 0]}>
              <Col xs={24} lg={8}>
                <Form.Item
                  name="status"
                  label={t('uiStandard.field.status', 'Status')}
                  valuePropName="checked"
                >
                  <Switch
                    checkedChildren={t('uiStandard.status.enabled', 'Enabled')}
                    unCheckedChildren={t(
                      'uiStandard.status.disabled',
                      'Disabled',
                    )}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} lg={16}>
                <Form.Item
                  name="remarks"
                  label={t('uiStandard.field.remarks', 'Internal notes')}
                >
                  <Input.TextArea rows={3} maxLength={300} />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {!isEdit && (
            <Card
              title={t('uiStandard.form.richText', 'Rich text editor example')}
            >
              <Form.Item
                name="content"
                label={t('uiStandard.field.content', 'Content')}
                extra={t(
                  'uiStandard.editor.demoHint',
                  'This static example stores inserted images as data URLs and does not write files or data to the server.',
                )}
              >
                <TiptapEditor imageUpload={demoImageUpload} />
              </Form.Item>
            </Card>
          )}
        </div>
      </Form>
    </AdminPage>
  );
};
