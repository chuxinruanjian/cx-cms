import { useIntl } from '@umijs/max';
import { Alert, Card, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { AdminPage } from '@/components';
import {
  AvatarUploader,
  CoverImageUploader,
  FileUploader,
  MultiImageUploader,
  SquareImageUploader,
  VideoUploader,
} from '@/components/Uploader';
import { getUploadConfig } from '@/services/upload';

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
  'qiniu-direct': {
    title: 'Qiniu Direct Upload',
    component: <FileUploader maxCount={5} uploadMode="qiniu-direct" />,
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
  const [qiniuDirectEnabled, setQiniuDirectEnabled] = useState<boolean>();

  useEffect(() => {
    if (key !== 'qiniu-direct') return;
    void getUploadConfig()
      .then((config) => setQiniuDirectEnabled(config.directUploadEnabled))
      .catch(() => setQiniuDirectEnabled(false));
  }, [key]);

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
          {key === 'qiniu-direct' && qiniuDirectEnabled !== undefined && (
            <Alert
              showIcon
              type={qiniuDirectEnabled ? 'success' : 'warning'}
              title={
                qiniuDirectEnabled
                  ? t(
                      'uploader.demo.qiniuDirectReady',
                      'Qiniu direct upload is ready',
                    )
                  : t(
                      'uploader.demo.qiniuDirectDisabled',
                      'Qiniu direct upload is not enabled',
                    )
              }
              style={{ marginBottom: 16 }}
            />
          )}
          {demo.component}
          {key === 'multipart' && (
            <Typography.Paragraph type="secondary" style={{ marginTop: 16 }}>
              {t(
                'uploader.demo.multipartHint',
                'The upload threshold and chunk size come from the server. Select a file larger than the threshold to test multipart upload.',
              )}
            </Typography.Paragraph>
          )}
          {key === 'qiniu-direct' && (
            <Typography.Paragraph type="secondary" style={{ marginTop: 16 }}>
              {t(
                'uploader.demo.qiniuDirectHint',
                'The browser uploads directly to Qiniu with a short-lived token issued by the API. Enable Qiniu as the active disk and turn on direct upload before testing.',
              )}
            </Typography.Paragraph>
          )}
        </Card>
      </Space>
    </AdminPage>
  );
};
