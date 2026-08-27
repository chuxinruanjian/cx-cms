import {
  DeleteOutlined,
  FileOutlined,
  InboxOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  RedoOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import type { UploadProps } from 'antd';
import { App, Button, List, Progress, Space, Typography, Upload } from 'antd';
import { useState } from 'react';
import type { UploadedFile } from '@/services/upload';
import { ImageUploader } from './ImageUploader';
import type { UploaderProps } from './types';
import { useUploader } from './useUploader';

const { Dragger } = Upload;

export const downloadUploadedFile = (file: UploadedFile) => {
  const anchor = document.createElement('a');
  anchor.href = `${file.url}${file.url.includes('?') ? '&' : '?'}download=1`;
  anchor.download = file.originalName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

const GenericUploader = ({
  title,
  hint,
  compact = false,
  ...options
}: UploaderProps) => {
  const intl = useIntl();
  const { message } = App.useApp();
  const uploader = useUploader(options);
  const [draggingId, setDraggingId] = useState<string>();
  const t = (id: string, defaultMessage: string) =>
    intl.formatMessage({ id, defaultMessage });
  const uploadTitle =
    title ||
    (options.fileType === 'video'
      ? t('uploader.action.uploadVideo', 'Upload video')
      : t('uploader.action.uploadFiles', 'Upload files'));
  const uploadHint =
    hint ||
    t(
      'uploader.hint.generic',
      'Click or drag files here. Normal or multipart upload is selected automatically.',
    );

  const beforeUpload: UploadProps['beforeUpload'] = (file, fileList) => {
    if (file === fileList[0]) void uploader.addFiles(fileList);
    return Upload.LIST_IGNORE;
  };

  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      <Dragger
        accept={options.accept}
        multiple={options.multiple !== false}
        showUploadList={false}
        beforeUpload={beforeUpload}
        disabled={
          Boolean(options.maxCount) &&
          uploader.files.length >= (options.maxCount || 0)
        }
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">{uploadTitle}</p>
        {!compact && <p className="ant-upload-hint">{uploadHint}</p>}
      </Dragger>

      {uploader.tasks.length > 0 && (
        <List
          size="small"
          dataSource={uploader.tasks}
          renderItem={(task) => (
            <List.Item
              actions={[
                task.status === 'uploading' ? (
                  <Button
                    key="pause"
                    type="text"
                    icon={<PauseOutlined />}
                    onClick={() => uploader.pause(task.id)}
                  />
                ) : ['paused', 'error'].includes(task.status) ? (
                  <Button
                    key="resume"
                    type="text"
                    icon={
                      task.status === 'error' ? (
                        <RedoOutlined />
                      ) : (
                        <PlayCircleOutlined />
                      )
                    }
                    onClick={() => uploader.resume(task.id)}
                  />
                ) : null,
                !['success', 'canceled'].includes(task.status) ? (
                  <Button
                    key="cancel"
                    type="text"
                    danger
                    icon={<StopOutlined />}
                    onClick={() =>
                      void uploader
                        .cancel(task.id)
                        .catch((error) => message.error(error.message))
                    }
                  />
                ) : null,
              ]}
            >
              <List.Item.Meta
                title={task.file.name}
                description={
                  <>
                    <Progress
                      percent={task.progress}
                      status={
                        task.status === 'error'
                          ? 'exception'
                          : task.status === 'success'
                            ? 'success'
                            : 'active'
                      }
                      size="small"
                    />
                    {task.error && (
                      <Typography.Text type="danger">
                        {task.error}
                      </Typography.Text>
                    )}
                  </>
                }
              />
            </List.Item>
          )}
        />
      )}

      {uploader.files.length > 0 && (
        <List
          grid={{ gutter: 12, xs: 1, sm: 2, md: 3, lg: 4 }}
          dataSource={uploader.files}
          renderItem={(file) => (
            <List.Item
              draggable={options.sortable}
              onDragStart={() => setDraggingId(String(file.id))}
              onDragOver={(event) => {
                if (options.sortable) event.preventDefault();
              }}
              onDrop={() => {
                if (!draggingId || draggingId === String(file.id)) return;
                const current = [...uploader.files];
                const from = current.findIndex(
                  (item) => String(item.id) === draggingId,
                );
                const to = current.findIndex((item) => item.id === file.id);
                const [dragged] = current.splice(from, 1);
                current.splice(to, 0, dragged);
                uploader.setFiles(current);
                setDraggingId(undefined);
              }}
            >
              <Space>
                <FileOutlined style={{ fontSize: 32 }} />
                <Space orientation="vertical" size={0}>
                  <Typography.Link
                    ellipsis
                    style={{ maxWidth: 160 }}
                    onClick={() => downloadUploadedFile(file)}
                  >
                    {file.originalName}
                  </Typography.Link>
                  <Typography.Text type="secondary">
                    {file.size > 0
                      ? `${(file.size / 1024).toFixed(1)} KB`
                      : file.url}
                  </Typography.Text>
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => void uploader.remove(file)}
                  >
                    {t('uploader.action.remove', 'Remove')}
                  </Button>
                </Space>
              </Space>
            </List.Item>
          )}
        />
      )}
    </Space>
  );
};

export const BaseUploader = (props: UploaderProps) =>
  props.fileType === 'image' ? (
    <ImageUploader {...props} />
  ) : (
    <GenericUploader {...props} />
  );
