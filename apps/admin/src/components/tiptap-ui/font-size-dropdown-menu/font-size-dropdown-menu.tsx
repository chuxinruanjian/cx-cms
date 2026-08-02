import type { Editor } from '@tiptap/react';
import { forwardRef, useCallback, useState } from 'react';
import { useTiptapLocale } from '@/components/TiptapEditor/locale';
import { ChevronDownIcon } from '@/components/tiptap-icons/chevron-down-icon';
import type { ButtonProps } from '@/components/tiptap-ui-primitive/button';
import { Button } from '@/components/tiptap-ui-primitive/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/tiptap-ui-primitive/dropdown-menu';
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
import { isNodeTypeSelected } from '@/lib/tiptap-utils';
import './font-size-dropdown-menu.scss';

export const FONT_SIZE_OPTIONS = [
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
  '28px',
  '32px',
  '36px',
  '48px',
] as const;

type FontSizeOption = (typeof FONT_SIZE_OPTIONS)[number] | null;

interface FontSizeControlOptions {
  editor?: Editor | null;
  onApplied?: () => void;
}

function useFontSizeControl({
  editor: providedEditor,
  onApplied,
}: FontSizeControlOptions = {}) {
  const { editor } = useTiptapEditor(providedEditor);
  const currentFontSize = editor?.getAttributes('textStyle').fontSize;
  const fontSize =
    typeof currentFontSize === 'string' ? currentFontSize : undefined;
  const canApply = Boolean(
    editor?.isEditable &&
      !isNodeTypeSelected(editor, ['image']) &&
      editor.can().setFontSize('16px'),
  );

  const applyFontSize = useCallback(
    (value: FontSizeOption) => {
      if (!editor || !canApply) return false;

      const chain = editor.chain().focus();
      const applied = value
        ? chain.setFontSize(value).run()
        : chain.unsetFontSize().run();

      if (applied) onApplied?.();
      return applied;
    },
    [canApply, editor, onApplied],
  );

  return { applyFontSize, canApply, editor, fontSize };
}

interface FontSizeButtonProps extends Omit<ButtonProps, 'type'> {
  editor?: Editor | null;
}

export const FontSizeButton = forwardRef<
  HTMLButtonElement,
  FontSizeButtonProps
>(({ editor: providedEditor, children, ...props }, ref) => {
  const { t } = useTiptapLocale();
  const { canApply, fontSize } = useFontSizeControl({
    editor: providedEditor,
  });

  return (
    <Button
      type="button"
      variant="ghost"
      className="tiptap-font-size-button"
      data-active-state={fontSize ? 'on' : 'off'}
      disabled={!canApply}
      data-disabled={!canApply}
      aria-label={t('fontSize')}
      tooltip={t('fontSize')}
      tabIndex={-1}
      ref={ref}
      {...props}
    >
      {children ?? (
        <>
          <span className="tiptap-font-size-button-label" aria-hidden="true">
            Aa
          </span>
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </>
      )}
    </Button>
  );
});

FontSizeButton.displayName = 'FontSizeButton';

export interface FontSizeToolbarContentProps extends FontSizeControlOptions {
  onSelected?: () => void;
}

export function FontSizeToolbarContent({
  editor: providedEditor,
  onApplied,
  onSelected,
}: FontSizeToolbarContentProps) {
  const { t } = useTiptapLocale();
  const { applyFontSize, canApply, fontSize } = useFontSizeControl({
    editor: providedEditor,
    onApplied,
  });

  const selectFontSize = (value: FontSizeOption) => {
    if (applyFontSize(value)) onSelected?.();
  };

  return (
    <div className="tiptap-font-size-toolbar-options" role="menu">
      <Button
        type="button"
        variant="ghost"
        size="small"
        showTooltip={false}
        disabled={!canApply}
        data-active-state={!fontSize ? 'on' : 'off'}
        aria-label={t('fontSizeDefault')}
        role="menuitemradio"
        aria-checked={!fontSize}
        onClick={() => selectFontSize(null)}
      >
        {t('fontSizeDefault')}
      </Button>
      {FONT_SIZE_OPTIONS.map((value) => (
        <Button
          type="button"
          variant="ghost"
          size="small"
          showTooltip={false}
          disabled={!canApply}
          data-active-state={fontSize === value ? 'on' : 'off'}
          aria-label={t('fontSizeValue', { size: value })}
          role="menuitemradio"
          aria-checked={fontSize === value}
          key={value}
          onClick={() => selectFontSize(value)}
        >
          {value.replace('px', '')}
        </Button>
      ))}
    </div>
  );
}

export interface FontSizeDropdownMenuProps
  extends Omit<FontSizeButtonProps, 'editor'>,
    FontSizeControlOptions {
  modal?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const FontSizeDropdownMenu = forwardRef<
  HTMLButtonElement,
  FontSizeDropdownMenuProps
>(
  (
    {
      editor: providedEditor,
      modal = true,
      onApplied,
      onOpenChange,
      ...buttonProps
    },
    ref,
  ) => {
    const { t } = useTiptapLocale();
    const [open, setOpen] = useState(false);
    const { applyFontSize, canApply, fontSize } = useFontSizeControl({
      editor: providedEditor,
      onApplied,
    });

    const handleOpenChange = (nextOpen: boolean) => {
      if (nextOpen && !canApply) return;
      setOpen(nextOpen);
      onOpenChange?.(nextOpen);
    };

    const options: FontSizeOption[] = [null, ...FONT_SIZE_OPTIONS];

    return (
      <DropdownMenu modal={modal} open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <FontSizeButton editor={providedEditor} ref={ref} {...buttonProps} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="tiptap-font-size-dropdown-content"
          aria-label={t('fontSize')}
        >
          <DropdownMenuGroup>
            {options.map((value) => {
              const isActive = value ? fontSize === value : !fontSize;
              const label = value
                ? t('fontSizeValue', { size: value })
                : t('fontSizeDefault');

              return (
                <DropdownMenuItem
                  key={value ?? 'default'}
                  asChild
                  onSelect={() => applyFontSize(value)}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    showTooltip={false}
                    className="tiptap-font-size-menu-item"
                    data-active-state={isActive ? 'on' : 'off'}
                    role="menuitemradio"
                    aria-checked={isActive}
                  >
                    {label}
                  </Button>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);

FontSizeDropdownMenu.displayName = 'FontSizeDropdownMenu';
