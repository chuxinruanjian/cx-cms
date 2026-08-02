import { App } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Attachment } from '@/services/upload';
import { deleteAttachment } from '@/services/upload';
import type { UploaderOptions, UploadTask } from './types';
import {
  abortUploadSession,
  newUploadToken,
  uploadFile,
  validateSelectedFile,
} from './uploadTaskManager';

export const useUploader = (options: UploaderOptions = {}) => {
  const { message } = App.useApp();
  const [attachments, setAttachments] = useState<Attachment[]>(
    options.value || [],
  );
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const controllers = useRef(new Map<string, AbortController>());

  useEffect(() => {
    if (options.value) setAttachments(options.value);
  }, [options.value]);

  const emitAttachments = useCallback(
    (next: Attachment[]) => {
      setAttachments(next);
      options.onChange?.(next);
    },
    [options],
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<UploadTask>) =>
      setTasks((current) =>
        current.map((task) => (task.id === id ? { ...task, ...patch } : task)),
      ),
    [],
  );

  const start = useCallback(
    async (task: UploadTask) => {
      const controller = new AbortController();
      controllers.current.set(task.id, controller);
      updateTask(task.id, { status: 'uploading', error: undefined });
      try {
        const attachment = await uploadFile(task, {
          signal: controller.signal,
          update: (patch) => updateTask(task.id, patch),
        });
        updateTask(task.id, {
          status: 'success',
          progress: 100,
          attachmentId: attachment.id,
        });
        setAttachments((current) => {
          const next =
            options.multiple === false
              ? [attachment]
              : [...current, attachment].slice(
                  0,
                  options.maxCount || Number.POSITIVE_INFINITY,
                );
          options.onChange?.(next);
          return next;
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        const reason = error instanceof Error ? error.message : 'Upload failed';
        updateTask(task.id, { status: 'error', error: reason });
        message.error(reason);
      } finally {
        controllers.current.delete(task.id);
      }
    },
    [options, updateTask],
  );

  const addFiles = useCallback(
    async (files: File[]) => {
      const pendingCount = tasks.filter(
        (task) => !['success', 'canceled'].includes(task.status),
      ).length;
      const available =
        options.multiple === false
          ? pendingCount > 0
            ? 0
            : 1
          : Math.max(
              0,
              (options.maxCount || Number.POSITIVE_INFINITY) -
                attachments.length -
                pendingCount,
            );
      const selected = files.slice(0, available);
      const accepted: File[] = [];
      for (const file of selected) {
        try {
          await validateSelectedFile(file, options.fileType);
          accepted.push(file);
        } catch (error) {
          message.error(
            error instanceof Error ? error.message : 'The file is not allowed',
          );
        }
      }
      const next = accepted.map<UploadTask>((file) => ({
        id: newUploadToken(),
        file,
        uploadToken: newUploadToken(),
        progress: 0,
        status: 'waiting',
        uploadedChunks: [],
        createdAt: Date.now(),
      }));
      setTasks((current) => [...current, ...next]);
      next.forEach((task) => void start(task));
    },
    [attachments.length, options.maxCount, options.multiple, start, tasks],
  );

  const pause = (id: string) => {
    controllers.current.get(id)?.abort();
    updateTask(id, { status: 'paused' });
  };

  const resume = (id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (task) void start(task);
  };

  const cancel = async (id: string) => {
    const task = tasks.find((item) => item.id === id);
    controllers.current.get(id)?.abort();
    if (task?.uploadId) await abortUploadSession(task.uploadId);
    updateTask(id, { status: 'canceled' });
  };

  const remove = async (attachment: Attachment) => {
    await deleteAttachment(attachment.id);
    emitAttachments(attachments.filter((item) => item.id !== attachment.id));
  };

  return {
    attachments,
    tasks,
    uploading: tasks.some((task) => task.status === 'uploading'),
    addFiles,
    pause,
    resume,
    retry: resume,
    cancel,
    remove,
    setAttachments: emitAttachments,
  };
};
