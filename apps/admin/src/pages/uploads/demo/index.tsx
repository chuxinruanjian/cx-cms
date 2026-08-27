import { useIntl } from '@umijs/max';
import { Alert, Card, Space, Typography } from 'antd';
import type { ComponentProps } from 'react';
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
    render: (props: ComponentProps<typeof AvatarUploader>) => (
      <AvatarUploader {...props} />
    ),
  },
  square: {
    title: 'Square Image',
    render: (props: ComponentProps<typeof SquareImageUploader>) => (
      <SquareImageUploader {...props} />
    ),
  },
  cover: {
    title: 'Cover Image',
    render: (props: ComponentProps<typeof CoverImageUploader>) => (
      <CoverImageUploader {...props} />
    ),
  },
  multi: {
    title: 'Multi-image',
    render: (props: ComponentProps<typeof MultiImageUploader>) => (
      <MultiImageUploader {...props} maxCount={20} />
    ),
  },
  video: {
    title: 'Video',
    render: (props: ComponentProps<typeof VideoUploader>) => (
      <VideoUploader {...props} />
    ),
  },
  files: {
    title: 'Files',
    render: (props: ComponentProps<typeof FileUploader>) => (
      <FileUploader {...props} maxCount={20} />
    ),
  },
  multipart: {
    title: 'Multipart',
    render: (props: ComponentProps<typeof FileUploader>) => (
      <FileUploader {...props} maxCount={5} />
    ),
  },
  'qiniu-direct': {
    title: 'Qiniu Direct Upload',
    render: (props: ComponentProps<typeof FileUploader>) => (
      <FileUploader {...props} maxCount={5} uploadMode="qiniu-direct" />
    ),
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
  const [value, setValue] = useState<string | string[] | null>(
    ['avatar', 'square', 'cover', 'video'].includes(key) ? null : [],
  );

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
            'The component handles validation, progress, normal upload, and multipart upload; business forms save the returned URL value directly.',
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
          {demo.render({ value, onChange: setValue })}
          <Typography.Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
            <Typography.Text type="secondary">
              {t('uploader.demo.fieldValue', 'Form field value')}:{' '}
            </Typography.Text>
            <Typography.Text code>{JSON.stringify(value)}</Typography.Text>
          </Typography.Paragraph>
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
