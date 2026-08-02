import { useIntl } from '@umijs/max';
import { Alert, Card, Space, Typography } from 'antd';
import { AdminPage } from '@/components';
import {
  AvatarUploader,
  CoverImageUploader,
  FileUploader,
  MultiImageUploader,
  SquareImageUploader,
  VideoUploader,
} from '@/components/Uploader';

const demos = {
  avatar: {
    title: 'Avatar',
    component: <AvatarUploader />,
  },
  square: {
    title: 'Square Image',
    component: <SquareImageUploader />,
  },
  cover: {
    title: 'Cover Image',
    component: <CoverImageUploader />,
  },
  multi: {
    title: 'Multi-image',
    component: <MultiImageUploader maxCount={20} />,
  },
  video: {
    title: 'Video',
    component: <VideoUploader />,
  },
  files: {
    title: 'Files',
    component: <FileUploader maxCount={20} />,
  },
  multipart: {
    title: 'Multipart',
    component: <FileUploader maxCount={5} />,
  },
} as const;

export default () => {
  const intl = useIntl();
  const key = window.location.pathname.split('/').pop() as keyof typeof demos;
  const demo = demos[key] || demos.files;
  const t = (id: string, defaultMessage: string) =>
    intl.formatMessage({ id, defaultMessage });
  const title = t(`menu.uploads.${key}`, demo.title);
  const uploadsTitle = t('menu.uploads', 'File Uploads');

  return (
    <AdminPage
      title={title}
      breadcrumbs={[{ title: uploadsTitle, path: '/uploads' }, { title }]}
    >
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          title={t('uploader.demo.lifecycle', 'Unified upload lifecycle')}
          description={t(
            'uploader.demo.lifecycleDescription',
            'The component handles validation, progress, normal upload, and multipart upload; business pages only manage attachment values.',
          )}
        />
        <Card>
          {demo.component}
          {key === 'multipart' && (
            <Typography.Paragraph type="secondary" style={{ marginTop: 16 }}>
              {t(
                'uploader.demo.multipartHint',
                'The upload threshold and chunk size come from the server. Select a file larger than the threshold to test multipart upload.',
              )}
            </Typography.Paragraph>
          )}
        </Card>
      </Space>
    </AdminPage>
  );
};
