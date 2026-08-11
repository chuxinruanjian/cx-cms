import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { App, Button, Popconfirm, Space, Tag } from 'antd';
import { useRef } from 'react';
import { downloadAttachment } from '@/components/Uploader';
import type { Attachment } from '@/services/upload';
import { deleteAttachment, listAttachments } from '@/services/upload';
import dayjs from '@/utils/dayjs';

const statusColors: Record<string, string> = {
  temporary: 'gold',
  active: 'green',
  uploading: 'blue',
  failed: 'red',
  deleted: 'default',
};

export default () => {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);

  const columns: ProColumns<Attachment>[] = [
    {
      title: 'File name',
      dataIndex: 'search',
      render: (_, item) => item.originalName,
    },
    {
      title: 'Type',
      dataIndex: 'fileType',
      valueType: 'select',
      valueEnum: {
        image: 'Image',
        video: 'Video',
        audio: 'Audio',
        document: 'Document',
        archive: 'Archive',
        other: 'Other',
      },
    },
    {
      title: 'Size',
      search: false,
      render: (_, item) => `${(item.size / 1024 / 1024).toFixed(2)} MB`,
    },
    {
      title: 'Storage',
      dataIndex: 'storageDisk',
      valueType: 'select',
      valueEnum: { local: 'Local', qiniu: 'Qiniu Kodo', oss: 'OSS', s3: 'S3' },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        temporary: 'Temporary',
        active: 'Active',
        uploading: 'Uploading',
        failed: 'Failed',
        deleted: 'Deleted',
      },
      render: (_, item) => (
        <Tag color={statusColors[item.status]}>{item.status}</Tag>
      ),
    },
    {
      title: 'References',
      dataIndex: 'referenceCount',
      search: false,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      search: false,
      render: (_, item) => dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Actions',
      valueType: 'option',
      render: (_, item) => (
        <Space>
          {item.previewUrl && item.fileType === 'image' && (
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() =>
                void downloadAttachment(item).catch((error) =>
                  message.error(error.message),
                )
              }
            >
              Preview
            </Button>
          )}
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() =>
              void downloadAttachment(item).catch((error) =>
                message.error(error.message),
              )
            }
          >
            Download
          </Button>
          <Popconfirm
            title="Delete this attachment?"
            description={
              item.referenceCount > 0
                ? 'Referenced attachments cannot be deleted.'
                : undefined
            }
            disabled={item.referenceCount > 0}
            onConfirm={async () => {
              await deleteAttachment(item.id);
              message.success('Deleted');
              actionRef.current?.reload();
            }}
          >
            <Button
              type="link"
              danger
              disabled={item.referenceCount > 0}
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<Attachment>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          const result = await listAttachments({
            ...params,
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
