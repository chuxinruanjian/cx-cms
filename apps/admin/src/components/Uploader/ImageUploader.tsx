import {
  DeleteOutlined,
  EyeOutlined,
  LoadingOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import { App, Button, Image, Progress, Space, Typography, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import { useEffect, useMemo, useState } from 'react';
import type { UploadedFile } from '@/services/upload';
import useStyles from './style.style';
import type { UploaderProps, UploadTask } from './types';
import { useUploader } from './useUploader';

type RcFile = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

interface ImageUploadFile extends UploadFile {
  uploadedFile?: UploadedFile;
  task?: UploadTask;
}

const getBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  });

const useLocalPreview = (file?: File) => {
  const [source, setSource] = useState<string>();

  useEffect(() => {
    if (!file) {
      setSource(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setSource(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return source;
};

const taskStatus = (task: UploadTask): UploadFile['status'] => {
  if (task.status === 'error') return 'error';
  if (task.status === 'success') return 'done';
  return 'uploading';
};

export const ImageUploader = ({
  title,
  hint,
  compact = false,
  ...options
}: UploaderProps) => {
  const intl = useIntl();
  const { message } = App.useApp();
  const { styles } = useStyles();
  const uploader = useUploader(options);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [failedAvatarSource, setFailedAvatarSource] = useState('');
  const [draggingUid, setDraggingUid] = useState<string>();
  const t = (id: string, defaultMessage: string) =>
    intl.formatMessage({ id, defaultMessage });
  const isAvatar = options.previewShape === 'circle' && options.maxCount === 1;
  const activeTasks = useMemo(
    () =>
      uploader.tasks.filter(
        (task) => !['success', 'canceled'].includes(task.status),
      ),
    [uploader.tasks],
  );
  const activeTask = activeTasks[0];
  const localAvatarPreview = useLocalPreview(activeTask?.file);

  const fileList = useMemo<ImageUploadFile[]>(
    () => [
      ...uploader.files.map((file) => ({
        uid: `file-${file.id}`,
        name: file.originalName,
        status: 'done' as const,
        type: file.mimeType,
        url: file.url,
        thumbUrl: file.url,
        uploadedFile: file,
      })),
      ...activeTasks.map((task) => ({
        uid: `task-${task.id}`,
        name: task.file.name,
        status: taskStatus(task),
        percent: task.progress,
        type: task.file.type,
        originFileObj: task.file as RcFile,
        task,
      })),
    ],
    [activeTasks, uploader.files],
  );

  const beforeUpload: UploadProps['beforeUpload'] = (file, selectedFiles) => {
    if (file === selectedFiles[0]) void uploader.addFiles(selectedFiles);
    return Upload.LIST_IGNORE;
  };

  const handlePreview = async (file: ImageUploadFile) => {
    const source =
      file.url ||
      file.thumbUrl ||
      (file.originFileObj ? await getBase64(file.originFileObj) : '');
    if (!source) return;
    setPreviewImage(source);
    setPreviewOpen(true);
  };

  const removeItem = async (uploadedFile?: UploadedFile, task?: UploadTask) => {
    try {
      if (uploadedFile) await uploader.remove(uploadedFile);
      if (task) await uploader.cancel(task.id);
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : t('uploader.message.removeFailed', 'Failed to remove the image'),
      );
    }
    return false;
  };
  const handleRemove: UploadProps['onRemove'] = (file) => {
    const imageFile = file as ImageUploadFile;
    return removeItem(imageFile.uploadedFile, imageFile.task);
  };

  const moveFile = (target: ImageUploadFile) => {
    if (!draggingUid || draggingUid === target.uid || !target.uploadedFile)
      return;
    const sourceId = draggingUid.replace('file-', '');
    const current = [...uploader.files];
    const from = current.findIndex((item) => String(item.id) === sourceId);
    const to = current.findIndex(
      (item) => String(item.id) === String(target.uploadedFile?.id),
    );
    if (from < 0 || to < 0) return;
    const [dragged] = current.splice(from, 1);
    current.splice(to, 0, dragged);
    uploader.setFiles(current);
    setDraggingUid(undefined);
  };

  const uploadLabel =
    title ||
    (isAvatar
      ? t('uploader.action.uploadAvatar', 'Upload avatar')
      : t('uploader.action.uploadImage', 'Upload image'));
  const uploadHint =
    hint ||
    t(
      'uploader.hint.image',
      'Supports common image formats. Drag uploaded images to reorder them.',
    );
  const reachedLimit =
    Boolean(options.maxCount) &&
    fileList.length >= (options.maxCount || Number.POSITIVE_INFINITY);

  const uploadButton = (
    <button className={styles.uploadButton} type="button">
      <PlusOutlined />
      <span>{uploadLabel}</span>
    </button>
  );

  const commonProps: UploadProps = {
    accept: options.accept,
    beforeUpload,
    multiple: options.multiple !== false,
    maxCount: options.maxCount,
  };

  const candidateAvatarSource =
    localAvatarPreview || uploader.files[0]?.url || options.initialPreviewUrl;
  const avatarSource =
    candidateAvatarSource === failedAvatarSource
      ? undefined
      : candidateAvatarSource;
  const avatarUpload = (
    <Upload
      {...commonProps}
      listType="picture-circle"
      showUploadList={false}
      multiple={false}
    >
      <button
        className={styles.avatarButton}
        type="button"
        aria-label={String(uploadLabel)}
      >
        {avatarSource ? (
          <img
            alt={String(uploadLabel)}
            className={styles.avatarImage}
            draggable={false}
            src={avatarSource}
            onError={() => setFailedAvatarSource(avatarSource)}
          />
        ) : (
          <span className={styles.avatarPlaceholder}>
            {activeTask ? (
              <LoadingOutlined />
            ) : options.fallbackText ? (
              <span className={styles.avatarFallback}>
                <span>{options.fallbackText}</span>
                <span className={styles.avatarFallbackHint}>{uploadLabel}</span>
              </span>
            ) : (
              <>
                <PlusOutlined />
                <span>{uploadLabel}</span>
              </>
            )}
          </span>
        )}
      </button>
    </Upload>
  );

  const wallUpload = (
    <Upload
      {...commonProps}
      listType="picture-card"
      fileList={fileList}
      onChange={() => undefined}
      onPreview={handlePreview}
      onRemove={handleRemove}
      showUploadList={{
        showDownloadIcon: false,
        showPreviewIcon: true,
        showRemoveIcon: true,
      }}
      itemRender={(originNode, file) => (
        <div
          draggable={Boolean(options.sortable && file.status === 'done')}
          className={options.sortable ? styles.sortableItem : undefined}
          onDragStart={() => setDraggingUid(file.uid)}
          onDragOver={(event) => {
            if (options.sortable) event.preventDefault();
          }}
          onDrop={() => moveFile(file as ImageUploadFile)}
        >
          {originNode}
        </div>
      )}
    >
      {reachedLimit ? null : uploadButton}
    </Upload>
  );

  const uploadControl = options.crop ? (
    <ImgCrop
      aspect={options.cropAspect || 1}
      cropShape={isAvatar ? 'round' : 'rect'}
      quality={0.9}
      rotationSlider
      showGrid
      showReset
      modalTitle={t('uploader.crop.title', 'Crop image')}
      modalOk={t('uploader.action.confirm', 'Confirm')}
      modalCancel={t('uploader.action.cancel', 'Cancel')}
      resetText={t('uploader.action.reset', 'Reset')}
      beforeCrop={(file) => file.type.startsWith('image/')}
    >
      {isAvatar ? avatarUpload : wallUpload}
    </ImgCrop>
  ) : isAvatar ? (
    avatarUpload
  ) : (
    wallUpload
  );

  return (
    <div className={styles.root}>
      {uploadControl}

      {isAvatar && (uploader.files[0] || activeTask) && (
        <Space className={styles.avatarActions}>
          {avatarSource && (
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setPreviewImage(avatarSource);
                setPreviewOpen(true);
              }}
            >
              {t('uploader.action.preview', 'Preview')}
            </Button>
          )}
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              if (activeTask) void removeItem(undefined, activeTask);
              else if (uploader.files[0]) void removeItem(uploader.files[0]);
            }}
          >
            {t('uploader.action.remove', 'Remove')}
          </Button>
        </Space>
      )}

      {isAvatar && activeTask && (
        <div className={styles.avatarProgress}>
          <Progress
            percent={activeTask.progress}
            size="small"
            status={activeTask.status === 'error' ? 'exception' : 'active'}
          />
          {activeTask.error && (
            <Typography.Text type="danger">{activeTask.error}</Typography.Text>
          )}
        </div>
      )}

      {!compact && (
        <Typography.Text type="secondary" className={styles.hint}>
          {uploadHint}
        </Typography.Text>
      )}

      {previewImage && (
        <Image
          alt={String(uploadLabel)}
          src={previewImage}
          styles={{ root: { display: 'none' } }}
          preview={{
            open: previewOpen,
            onOpenChange: setPreviewOpen,
            afterOpenChange: (open) => {
              if (!open) setPreviewImage('');
            },
          }}
        />
      )}
    </div>
  );
};
