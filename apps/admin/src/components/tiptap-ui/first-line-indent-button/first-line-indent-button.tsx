'use client';

import { forwardRef, useCallback, useEffect, useState } from 'react';
import { useTiptapLocale } from '@/components/TiptapEditor/locale';
import { FirstLineIndentIcon } from '@/components/tiptap-icons/first-line-indent-icon';
import type { ButtonProps } from '@/components/tiptap-ui-primitive/button';
import { Button } from '@/components/tiptap-ui-primitive/button';
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';

export const FirstLineIndentButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'type'>
>(({ onClick, ...buttonProps }, ref) => {
  const { editor } = useTiptapEditor();
  const { t } = useTiptapLocale();
  const [, refresh] = useState(0);

  useEffect(() => {
    if (!editor) return;
    const update = () => refresh((value) => value + 1);
    editor.on('transaction', update);
    return () => {
      editor.off('transaction', update);
    };
  }, [editor]);

  const isParagraph = Boolean(editor?.isActive('paragraph'));
  const isActive = Boolean(editor?.isActive({ firstLineIndent: true }));
  const canToggle = Boolean(
    editor?.isEditable && isParagraph && editor.can().toggleFirstLineIndent(),
  );
  const label = t('firstLineIndent');

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      editor?.chain().focus().toggleFirstLineIndent().run();
    },
    [editor, onClick],
  );

  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      role="button"
      tabIndex={-1}
      disabled={!canToggle}
      data-disabled={!canToggle}
      data-active-state={isActive ? 'on' : 'off'}
      aria-label={label}
      aria-pressed={isActive}
      tooltip={label}
      onClick={handleClick}
      {...buttonProps}
    >
      <FirstLineIndentIcon className="tiptap-button-icon" />
    </Button>
  );
});

FirstLineIndentButton.displayName = 'FirstLineIndentButton';
