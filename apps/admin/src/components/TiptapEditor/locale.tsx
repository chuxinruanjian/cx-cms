import { useIntl } from '@umijs/max';
import { createContext, type ReactNode, useContext } from 'react';

export const tiptapLocaleMessages = {
  editorLabel: {
    id: 'tiptap.editor.label',
    defaultMessage: 'Rich text editor',
  },
  back: {
    id: 'tiptap.action.back',
    defaultMessage: 'Back',
  },
  toolbar: {
    id: 'tiptap.toolbar.label',
    defaultMessage: 'Editor toolbar',
  },
  switchToLightMode: {
    id: 'tiptap.theme.switchToLightMode',
    defaultMessage: 'Switch to light mode',
  },
  switchToDarkMode: {
    id: 'tiptap.theme.switchToDarkMode',
    defaultMessage: 'Switch to dark mode',
  },
  undo: {
    id: 'tiptap.history.undo',
    defaultMessage: 'Undo',
  },
  redo: {
    id: 'tiptap.history.redo',
    defaultMessage: 'Redo',
  },
  heading: {
    id: 'tiptap.heading.label',
    defaultMessage: 'Heading',
  },
  setHeading: {
    id: 'tiptap.heading.set',
    defaultMessage: 'Set heading',
  },
  headingLevel: {
    id: 'tiptap.heading.level',
    defaultMessage: 'Heading {level}',
  },
  list: {
    id: 'tiptap.list.label',
    defaultMessage: 'List',
  },
  listOptions: {
    id: 'tiptap.list.options',
    defaultMessage: 'List options',
  },
  bulletList: {
    id: 'tiptap.list.bullet',
    defaultMessage: 'Bullet list',
  },
  orderedList: {
    id: 'tiptap.list.ordered',
    defaultMessage: 'Ordered list',
  },
  taskList: {
    id: 'tiptap.list.task',
    defaultMessage: 'Task list',
  },
  blockquote: {
    id: 'tiptap.blockquote.label',
    defaultMessage: 'Blockquote',
  },
  codeBlock: {
    id: 'tiptap.codeBlock.label',
    defaultMessage: 'Code block',
  },
  bold: {
    id: 'tiptap.mark.bold',
    defaultMessage: 'Bold',
  },
  italic: {
    id: 'tiptap.mark.italic',
    defaultMessage: 'Italic',
  },
  strike: {
    id: 'tiptap.mark.strike',
    defaultMessage: 'Strikethrough',
  },
  inlineCode: {
    id: 'tiptap.mark.code',
    defaultMessage: 'Inline code',
  },
  underline: {
    id: 'tiptap.mark.underline',
    defaultMessage: 'Underline',
  },
  superscript: {
    id: 'tiptap.mark.superscript',
    defaultMessage: 'Superscript',
  },
  subscript: {
    id: 'tiptap.mark.subscript',
    defaultMessage: 'Subscript',
  },
  highlight: {
    id: 'tiptap.highlight.label',
    defaultMessage: 'Highlight',
  },
  highlightText: {
    id: 'tiptap.highlight.text',
    defaultMessage: 'Highlight text',
  },
  highlightColors: {
    id: 'tiptap.highlight.colors',
    defaultMessage: 'Highlight colors',
  },
  useHighlightColor: {
    id: 'tiptap.highlight.useColor',
    defaultMessage: 'Use {color}',
  },
  removeHighlight: {
    id: 'tiptap.highlight.remove',
    defaultMessage: 'Remove highlight',
  },
  defaultBackground: {
    id: 'tiptap.highlight.color.default',
    defaultMessage: 'Default background',
  },
  grayBackground: {
    id: 'tiptap.highlight.color.gray',
    defaultMessage: 'Gray background',
  },
  brownBackground: {
    id: 'tiptap.highlight.color.brown',
    defaultMessage: 'Brown background',
  },
  orangeBackground: {
    id: 'tiptap.highlight.color.orange',
    defaultMessage: 'Orange background',
  },
  yellowBackground: {
    id: 'tiptap.highlight.color.yellow',
    defaultMessage: 'Yellow background',
  },
  greenBackground: {
    id: 'tiptap.highlight.color.green',
    defaultMessage: 'Green background',
  },
  blueBackground: {
    id: 'tiptap.highlight.color.blue',
    defaultMessage: 'Blue background',
  },
  purpleBackground: {
    id: 'tiptap.highlight.color.purple',
    defaultMessage: 'Purple background',
  },
  pinkBackground: {
    id: 'tiptap.highlight.color.pink',
    defaultMessage: 'Pink background',
  },
  redBackground: {
    id: 'tiptap.highlight.color.red',
    defaultMessage: 'Red background',
  },
  fontSize: {
    id: 'tiptap.fontSize.label',
    defaultMessage: 'Font size',
  },
  fontSizeDefault: {
    id: 'tiptap.fontSize.default',
    defaultMessage: 'Default size',
  },
  fontSizeValue: {
    id: 'tiptap.fontSize.value',
    defaultMessage: 'Font size {size}',
  },
  textColor: {
    id: 'tiptap.textColor.label',
    defaultMessage: 'Text color',
  },
  textColors: {
    id: 'tiptap.textColor.colors',
    defaultMessage: 'Text colors',
  },
  useTextColor: {
    id: 'tiptap.textColor.useColor',
    defaultMessage: 'Use {color}',
  },
  textColorCustom: {
    id: 'tiptap.textColor.custom',
    defaultMessage: 'Custom text color',
  },
  removeTextColor: {
    id: 'tiptap.textColor.remove',
    defaultMessage: 'Remove text color',
  },
  textColorBlack: {
    id: 'tiptap.textColor.color.black',
    defaultMessage: 'Black',
  },
  textColorGray: {
    id: 'tiptap.textColor.color.gray',
    defaultMessage: 'Gray',
  },
  textColorRed: {
    id: 'tiptap.textColor.color.red',
    defaultMessage: 'Red',
  },
  textColorOrange: {
    id: 'tiptap.textColor.color.orange',
    defaultMessage: 'Orange',
  },
  textColorYellow: {
    id: 'tiptap.textColor.color.yellow',
    defaultMessage: 'Yellow',
  },
  textColorGreen: {
    id: 'tiptap.textColor.color.green',
    defaultMessage: 'Green',
  },
  textColorBlue: {
    id: 'tiptap.textColor.color.blue',
    defaultMessage: 'Blue',
  },
  textColorPurple: {
    id: 'tiptap.textColor.color.purple',
    defaultMessage: 'Purple',
  },
  textColorPink: {
    id: 'tiptap.textColor.color.pink',
    defaultMessage: 'Pink',
  },
  link: {
    id: 'tiptap.link.label',
    defaultMessage: 'Link',
  },
  linkPlaceholder: {
    id: 'tiptap.link.placeholder',
    defaultMessage: 'Paste a link URL...',
  },
  applyLink: {
    id: 'tiptap.link.apply',
    defaultMessage: 'Apply link',
  },
  openLink: {
    id: 'tiptap.link.openNewWindow',
    defaultMessage: 'Open in a new window',
  },
  removeLink: {
    id: 'tiptap.link.remove',
    defaultMessage: 'Remove link',
  },
  alignLeft: {
    id: 'tiptap.textAlign.left',
    defaultMessage: 'Align left',
  },
  alignCenter: {
    id: 'tiptap.textAlign.center',
    defaultMessage: 'Align center',
  },
  alignRight: {
    id: 'tiptap.textAlign.right',
    defaultMessage: 'Align right',
  },
  alignJustify: {
    id: 'tiptap.textAlign.justify',
    defaultMessage: 'Justify',
  },
  insertImage: {
    id: 'tiptap.image.insert',
    defaultMessage: 'Insert image',
  },
  imageFileTooLarge: {
    id: 'tiptap.imageUpload.fileTooLarge',
    defaultMessage: 'File size cannot exceed {maxSize} MB',
  },
  imageUploadHandlerMissing: {
    id: 'tiptap.imageUpload.handlerMissing',
    defaultMessage: 'Upload handler is not configured',
  },
  imageUploadNoUrl: {
    id: 'tiptap.imageUpload.noUrl',
    defaultMessage: 'Upload failed: no image URL was returned',
  },
  imageUploadFailed: {
    id: 'tiptap.imageUpload.failed',
    defaultMessage: 'Upload failed',
  },
  uploadFailed: {
    id: 'tiptap.upload.failed',
    defaultMessage: 'Image upload failed',
  },
  imageSelect: {
    id: 'tiptap.imageUpload.select',
    defaultMessage: 'Please select images to upload',
  },
  imageLimit: {
    id: 'tiptap.imageUpload.limit',
    defaultMessage: 'You can upload up to {limit} images',
  },
  imageUploadClick: {
    id: 'tiptap.imageUpload.click',
    defaultMessage: 'Click to upload',
  },
  imageUploadDrag: {
    id: 'tiptap.imageUpload.drag',
    defaultMessage: 'or drag images here',
  },
  imageUploadHint: {
    id: 'tiptap.imageUpload.hint',
    defaultMessage: 'Up to {limit} images, {maxSize} MB each.',
  },
  imageFallbackAlt: {
    id: 'tiptap.imageUpload.fallbackAlt',
    defaultMessage: 'Image',
  },
  imageUploading: {
    id: 'tiptap.imageUpload.uploading',
    defaultMessage: 'Uploading {count} images',
  },
  imageClearAll: {
    id: 'tiptap.imageUpload.clearAll',
    defaultMessage: 'Clear all',
  },
  imageRemoveFile: {
    id: 'tiptap.imageUpload.removeFile',
    defaultMessage: 'Remove file',
  },
  fileSizeBytes: {
    id: 'tiptap.fileSize.bytes',
    defaultMessage: 'Bytes',
  },
  fileSizeKilobytes: {
    id: 'tiptap.fileSize.kilobytes',
    defaultMessage: 'KB',
  },
  fileSizeMegabytes: {
    id: 'tiptap.fileSize.megabytes',
    defaultMessage: 'MB',
  },
  fileSizeGigabytes: {
    id: 'tiptap.fileSize.gigabytes',
    defaultMessage: 'GB',
  },
} as const;

export type TiptapLocaleMessageKey = keyof typeof tiptapLocaleMessages;
export type TiptapLocaleValues = Record<string, number | string>;

export interface TiptapTranslate {
  (key: TiptapLocaleMessageKey, values?: TiptapLocaleValues): string;
  (key: string, defaultMessage: string, values?: TiptapLocaleValues): string;
}

type IntlValue = ReturnType<typeof useIntl>;

const TiptapLocaleContext = createContext<IntlValue | null>(null);

export function TiptapLocaleProvider({ children }: { children: ReactNode }) {
  const intl = useIntl();

  return (
    <TiptapLocaleContext.Provider value={intl}>
      {children}
    </TiptapLocaleContext.Provider>
  );
}

export function useTiptapLocale() {
  const fallbackIntl = useIntl();
  const intl = useContext(TiptapLocaleContext) ?? fallbackIntl;
  const t: TiptapTranslate = (
    key: string,
    defaultMessageOrValues?: string | TiptapLocaleValues,
    values?: TiptapLocaleValues,
  ) => {
    const isKnownMessage = Object.hasOwn(tiptapLocaleMessages, key);
    const descriptor = isKnownMessage
      ? tiptapLocaleMessages[key as TiptapLocaleMessageKey]
      : {
          id: key.startsWith('tiptap.') ? key : `tiptap.${key}`,
          defaultMessage:
            typeof defaultMessageOrValues === 'string'
              ? defaultMessageOrValues
              : key,
        };
    const messageValues =
      typeof defaultMessageOrValues === 'string'
        ? values
        : defaultMessageOrValues;

    return intl.formatMessage(descriptor, messageValues);
  };

  return { t };
}
