import clsx from 'clsx';
import type { SimpleEditorProps } from '@/components/tiptap-templates/simple/simple-editor';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { TiptapLocaleProvider } from './locale';
import { TiptapThemeProvider, useTiptapTheme } from './theme';
import './index.scss';

export interface TiptapEditorProps extends SimpleEditorProps {
  className?: string;
}

const TiptapEditorFrame = ({ className, ...props }: TiptapEditorProps) => {
  const { isDark } = useTiptapTheme();

  return (
    <div className={clsx('cx-tiptap-editor', { dark: isDark }, className)}>
      <SimpleEditor {...props} />
    </div>
  );
};

export const TiptapEditor = (props: TiptapEditorProps) => (
  <TiptapLocaleProvider>
    <TiptapThemeProvider>
      <TiptapEditorFrame {...props} />
    </TiptapThemeProvider>
  </TiptapLocaleProvider>
);

export default TiptapEditor;
export type { UploadFunction } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension';
