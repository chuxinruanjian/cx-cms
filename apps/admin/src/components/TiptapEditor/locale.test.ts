import enUS from '@/locales/en-US/tiptap';
import zhCN from '@/locales/zh-CN/tiptap';
import { tiptapLocaleMessages } from './locale';

describe('Tiptap locales', () => {
  it('keeps component descriptors and both locales in sync', () => {
    const descriptorIds = Object.values(tiptapLocaleMessages)
      .map((message) => message.id)
      .sort();

    expect(Object.keys(enUS).sort()).toEqual(descriptorIds);
    expect(Object.keys(zhCN).sort()).toEqual(descriptorIds);
  });
});
