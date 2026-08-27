import { App } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { UploadedFile } from '@/services/upload';
import { requestJson } from '@/services/upload';
import type { UploaderOptions, UploaderStateFile, UploadTask } from './types';
import {
  abortUploadSession,
  newUploadToken,
  uploadFile,
  validateSelectedFile,
} from './uploadTaskManager';

export const useUploader = (options: UploaderOptions = {}) => {
  const { message } = App.useApp();
  const normalizeValue = useCallback(
    (value: UploaderOptions['value'], current: UploaderStateFile[] = []) => {
      const urls = (Array.isArray(value) ? value : value ? [value] : []).filter(
        Boolean,
      );
      return urls.map<UploaderStateFile>((url) => {
        const existing = current.find((file) => file.url === url);
        if (existing) return existing;
        const name = decodeURIComponent(
          url.split('/').pop()?.split('?')[0] || 'file',
        );
        return {
          id: url,
          originalName: name,
          mimeType: '',
          size: 0,
          url,
          persisted: true,
        };
      });
    },
    [],
  );
  const [files, setFiles] = useState<UploaderStateFile[]>(() =>
    normalizeValue(options.value),
  );
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const controllers = useRef(new Map<string, AbortController>());

  useEffect(() => {
    setFiles((current) => normalizeValue(options.value, current));
  }, [normalizeValue, options.value]);

  const emitFiles = useCallback(
    (next: UploaderStateFile[]) => {
      setFiles(next);
      const urls = next.map((file) => file.url);
      options.onChange?.(options.multiple === false ? (urls[0] ?? null) : urls);
    },
    [options.multiple, options.onChange],
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
        const uploaded = await uploadFile(
          task,
          {
            signal: controller.signal,
            update: (patch) => updateTask(task.id, patch),
          },
          options.uploadMode,
        );
        updateTask(task.id, {
          status: 'success',
          progress: 100,
          attachmentId:
            typeof uploaded.id === 'number' ? uploaded.id : undefined,
        });
        if (!uploaded.url)
          throw new Error('Upload response does not contain a URL');
        setFiles((current) => {
          const file: UploaderStateFile = { ...uploaded, persisted: false };
          const next =
            options.multiple === false
              ? [file]
              : [...current, file].slice(
                  0,
                  options.maxCount || Number.POSITIVE_INFINITY,
                );
          const urls = next.map((item) => item.url);
          options.onChange?.(
            options.multiple === false ? (urls[0] ?? null) : urls,
          );
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
    async (selectedFiles: File[]) => {
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
                files.length -
                pendingCount,
            );
      const selected = selectedFiles.slice(0, available);
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
    [files.length, options.maxCount, options.multiple, start, tasks],
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
    if (task?.attachmentId && !task.uploadId) {
      await requestJson(`/api/v1/admin/uploads/files/${task.attachmentId}`, {
        method: 'DELETE',
      });
    }
    updateTask(id, { status: 'canceled' });
  };

  const remove = async (file: UploadedFile) => {
    emitFiles(files.filter((item) => item.id !== file.id));
  };

  return {
    files,
    tasks,
    uploading: tasks.some((task) => task.status === 'uploading'),
    addFiles,
    pause,
    resume,
    retry: resume,
    cancel,
    remove,
    setFiles: emitFiles,
  };
};
