import { CloudUploadOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Link, useAccess } from '@umijs/max';
import { Button, Space, Typography } from 'antd';

export default () => {
  const access = useAccess();

  return (
    <PageContainer>
      <ProCard>
        <Space orientation="vertical" size="large">
          <div>
            <Typography.Title level={3}>Unified file uploads</Typography.Title>
            <Typography.Paragraph type="secondary">
              Upload, resume, bind, review, and clean private application files
              through one lifecycle.
            </Typography.Paragraph>
          </div>
          <Space>
            {access.canUploadFiles && (
              <Link to="/uploads/files">
                <Button type="primary" icon={<CloudUploadOutlined />}>
                  Open uploader
                </Button>
              </Link>
            )}
            {access.canViewFiles && (
              <Link to="/uploads/resources">
                <Button icon={<FolderOpenOutlined />}>Open resources</Button>
              </Link>
            )}
          </Space>
        </Space>
      </ProCard>
    </PageContainer>
  );
};
