import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from 'antd';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ImageUploader } from './ImageUploader';

const mocks = vi.hoisted(() => ({ remove: vi.fn(), cancel: vi.fn() }));

vi.mock('@umijs/max', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
}));

vi.mock('./useUploader', () => ({
  useUploader: (options: { value?: string }) => ({
    files: options.value
      ? [
          {
            id: 1,
            originalName: 'avatar.png',
            url: options.value,
            mimeType: 'image/png',
            size: 128,
            persisted: true,
          },
        ]
      : [],
    tasks: [],
    remove: mocks.remove,
    cancel: mocks.cancel,
    addFiles: vi.fn(),
    setFiles: vi.fn(),
  }),
}));

const renderAvatar = (value?: string) =>
  render(
    <App>
      <ImageUploader
        previewShape="circle"
        maxCount={1}
        multiple={false}
        crop
        cropAspect={1}
        value={value}
        fallbackText="AD"
        compact
      />
    </App>,
  );

describe('avatar upload native image actions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses the native circular image item and its built-in removal action', async () => {
    const { container } = renderAvatar('/avatar.png');
    expect(
      container.querySelector(
        '.ant-upload-list-picture-circle .ant-upload-list-item-done',
      ),
    ).toBeTruthy();
    expect(
      container.querySelectorAll('.ant-upload-list-item-actions'),
    ).toHaveLength(1);
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Remove file'));
    await waitFor(() =>
      expect(mocks.remove).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/avatar.png' }),
      ),
    );
  });

  it('opens the image preview through the native item action', async () => {
    renderAvatar('/avatar.png');
    fireEvent.click(screen.getByTitle('Preview file'));
    await waitFor(() =>
      expect(document.querySelector('.ant-image-preview')).toBeTruthy(),
    );
  });

  it('keeps initials and the crop upload entry when no image is set', () => {
    const { container } = renderAvatar();
    expect(screen.getByText('AD')).toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).toBeTruthy();
  });

  it('falls back to initials when a configured avatar cannot load', async () => {
    renderAvatar('/missing-avatar.png');
    fireEvent.error(screen.getByAltText('avatar.png'));
    await waitFor(() => expect(screen.getByText('AD')).toBeInTheDocument());
  });
});
