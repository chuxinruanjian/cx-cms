import { describe, expect, it, vi } from 'vitest';
import { demoImageUpload } from './demoImageUpload';

describe('demoImageUpload', () => {
  it('returns an embeddable data URL and reports completion', async () => {
    const onProgress = vi.fn();
    const file = new File(['image-content'], 'demo.png', {
      type: 'image/png',
    });

    await expect(demoImageUpload(file, onProgress)).resolves.toMatch(
      /^data:image\/png;base64,/,
    );
    expect(onProgress).toHaveBeenLastCalledWith({ progress: 100 });
  });

  it('rejects an upload that was already canceled', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      demoImageUpload(
        new File(['image-content'], 'demo.png', { type: 'image/png' }),
        undefined,
        controller.signal,
      ),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});
