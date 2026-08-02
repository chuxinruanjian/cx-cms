import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Progress, Tag } from 'antd';
import type { UploadSession } from '@/services/upload';
import { listUploadSessions } from '@/services/upload';
import dayjs from '@/utils/dayjs';

export default () => {
  const columns: ProColumns<UploadSession>[] = [
    { title: 'File name', dataIndex: 'originalName', search: false },
    {
      title: 'Status',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        initialized: 'Initialized',
        uploading: 'Uploading',
        completed: 'Completed',
        aborted: 'Aborted',
        expired: 'Expired',
        failed: 'Failed',
      },
      render: (_, item) => <Tag>{item.status}</Tag>,
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      search: false,
      render: (_, item) => (
        <Progress
          percent={item.progress}
          status={item.status === 'failed' ? 'exception' : undefined}
        />
      ),
    },
    {
      title: 'Chunks',
      search: false,
      render: (_, item) => `${item.uploadedChunks.length}/${item.chunkTotal}`,
    },
    {
      title: 'Expires',
      dataIndex: 'expiresAt',
      search: false,
      render: (_, item) => dayjs(item.expiresAt).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  return (
    <PageContainer>
      <ProTable<UploadSession>
        rowKey="uploadId"
        columns={columns}
        request={async (params) => {
          const result = await listUploadSessions({
            status: params.status,
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
