import { ClearOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { App, Button } from 'antd';
import { useRef } from 'react';
import type { Attachment } from '@/services/upload';
import { cleanupUploads, listAttachments } from '@/services/upload';
import dayjs from '@/utils/dayjs';

export default () => {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const columns: ProColumns<Attachment>[] = [
    {
      title: 'File name',
      dataIndex: 'search',
      render: (_, item) => item.originalName,
    },
    { title: 'Type', dataIndex: 'fileType', search: false },
    {
      title: 'Size',
      search: false,
      render: (_, item) => `${(item.size / 1024 / 1024).toFixed(2)} MB`,
    },
    {
      title: 'Expires',
      dataIndex: 'expiresAt',
      search: false,
      render: (_, item) =>
        item.expiresAt
          ? dayjs(item.expiresAt).format('YYYY-MM-DD HH:mm:ss')
          : '-',
    },
  ];

  return (
    <PageContainer
      extra={
        <Button
          type="primary"
          icon={<ClearOutlined />}
          onClick={async () => {
            const result = await cleanupUploads();
            message.success(
              `Cleaned ${result.sessionsCleaned} sessions and ${result.attachmentsCleaned} files`,
            );
            actionRef.current?.reload();
          }}
        >
          Run cleanup
        </Button>
      }
    >
      <ProTable<Attachment>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          const result = await listAttachments({
            status: 'temporary',
            search: params.search,
            page: params.current,
            perPage: params.pageSize,
          });
          return {
            data: result.data,
            total: result.meta.total,
            success: true,
          };
        }}
      />
    </PageContainer>
  );
};
