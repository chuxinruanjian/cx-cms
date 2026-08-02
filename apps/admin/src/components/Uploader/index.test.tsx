import { describe, expect, it } from 'vitest';
import {
  AvatarUploader,
  MultiImageUploader,
  SquareImageUploader,
} from './index';

describe('Uploader scenario wrappers', () => {
  it('keeps avatar upload single, round, and cropped', () => {
    const element = AvatarUploader({
      crop: false,
      fallbackText: 'AD',
      initialPreviewUrl: '/avatar.png',
      maxCount: 8,
      multiple: true,
      previewShape: 'square',
    });

    expect(element.props).toMatchObject({
      accept: 'image/*',
      compact: true,
      crop: true,
      cropAspect: 1,
      fallbackText: 'AD',
      fileType: 'image',
      initialPreviewUrl: '/avatar.png',
      maxCount: 1,
      multiple: false,
      previewShape: 'circle',
    });
  });

  it('keeps multi-image upload as a sortable photo wall', () => {
    const element = MultiImageUploader({
      maxCount: 20,
      multiple: false,
      sortable: false,
    });

    expect(element.props).toMatchObject({
      accept: 'image/*',
      fileType: 'image',
      maxCount: 20,
      multiple: true,
      sortable: true,
    });
  });

  it('keeps a square image field limited to one image', () => {
    const element = SquareImageUploader({
      maxCount: 3,
      multiple: true,
    });

    expect(element.props).toMatchObject({
      accept: 'image/*',
      fileType: 'image',
      maxCount: 1,
      multiple: false,
    });
  });
});
