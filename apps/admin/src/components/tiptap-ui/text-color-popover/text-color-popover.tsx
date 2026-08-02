import type { Editor } from '@tiptap/react';
import type { CSSProperties } from 'react';
import { forwardRef, useCallback, useState } from 'react';
import type { TiptapLocaleMessageKey } from '@/components/TiptapEditor/locale';
import { useTiptapLocale } from '@/components/TiptapEditor/locale';
import { BanIcon } from '@/components/tiptap-icons/ban-icon';
import type { ButtonProps } from '@/components/tiptap-ui-primitive/button';
import { Button } from '@/components/tiptap-ui-primitive/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/tiptap-ui-primitive/popover';
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
import { isNodeTypeSelected } from '@/lib/tiptap-utils';
import './text-color-popover.scss';

export interface TextColorOption {
  value: string;
  messageKey: TiptapLocaleMessageKey;
}

export const TEXT_COLOR_OPTIONS: TextColorOption[] = [
  { value: '#1f2328', messageKey: 'textColorBlack' },
  { value: '#6b7280', messageKey: 'textColorGray' },
  { value: '#dc2626', messageKey: 'textColorRed' },
  { value: '#ea580c', messageKey: 'textColorOrange' },
  { value: '#ca8a04', messageKey: 'textColorYellow' },
  { value: '#16a34a', messageKey: 'textColorGreen' },
  { value: '#2563eb', messageKey: 'textColorBlue' },
  { value: '#9333ea', messageKey: 'textColorPurple' },
  { value: '#db2777', messageKey: 'textColorPink' },
];

interface TextColorControlOptions {
  editor?: Editor | null;
  onApplied?: () => void;
}

function useTextColorControl({
  editor: providedEditor,
  onApplied,
}: TextColorControlOptions = {}) {
  const { editor } = useTiptapEditor(providedEditor);
  const currentColor = editor?.getAttributes('textStyle').color;
  const color = typeof currentColor === 'string' ? currentColor : undefined;
  const canApply = Boolean(
    editor?.isEditable &&
      !isNodeTypeSelected(editor, ['image']) &&
      editor.can().setColor(TEXT_COLOR_OPTIONS[0].value),
  );

  const applyColor = useCallback(
    (value?: string) => {
      if (!editor || !canApply) return false;

      const chain = editor.chain().focus();
      const applied = value
        ? chain.setColor(value).run()
        : chain.unsetColor().run();

      if (applied) onApplied?.();
      return applied;
    },
    [canApply, editor, onApplied],
  );

  return { applyColor, canApply, color, editor };
}

interface TextColorButtonProps extends Omit<ButtonProps, 'type'> {
  editor?: Editor | null;
}

type TextColorIconStyle = CSSProperties & {
  '--tiptap-current-text-color': string;
};

export const TextColorPopoverButton = forwardRef<
  HTMLButtonElement,
  TextColorButtonProps
>(({ editor: providedEditor, children, ...props }, ref) => {
  const { t } = useTiptapLocale();
  const { canApply, color } = useTextColorControl({ editor: providedEditor });
  const iconStyle: TextColorIconStyle = {
    '--tiptap-current-text-color': color ?? 'currentColor',
  };

  return (
    <Button
      type="button"
      variant="ghost"
      data-active-state={color ? 'on' : 'off'}
      disabled={!canApply}
      data-disabled={!canApply}
      aria-label={t('textColor')}
      tooltip={t('textColor')}
      tabIndex={-1}
      ref={ref}
      {...props}
    >
      {children ?? (
        <span
          className="tiptap-text-color-icon"
          style={iconStyle}
          aria-hidden="true"
        >
          A
        </span>
      )}
    </Button>
  );
});

TextColorPopoverButton.displayName = 'TextColorPopoverButton';

export interface TextColorPopoverContentProps extends TextColorControlOptions {
  onSelected?: () => void;
}

function getColorInputValue(color?: string) {
  return color && /^#[0-9a-f]{6}$/i.test(color) ? color : '#1677ff';
}

export function TextColorPopoverContent({
  editor: providedEditor,
  onApplied,
  onSelected,
}: TextColorPopoverContentProps) {
  const { t } = useTiptapLocale();
  const { applyColor, canApply, color } = useTextColorControl({
    editor: providedEditor,
    onApplied,
  });

  const selectColor = (value?: string) => {
    if (applyColor(value)) onSelected?.();
  };

  return (
    <div
      className="tiptap-text-color-options"
      role="menu"
      aria-label={t('textColors')}
    >
      {TEXT_COLOR_OPTIONS.map((option) => {
        const label = t(option.messageKey);
        const isActive = color?.toLowerCase() === option.value;

        return (
          <button
            type="button"
            className="tiptap-text-color-swatch"
            style={{ backgroundColor: option.value }}
            aria-label={t('useTextColor', { color: label })}
            aria-checked={isActive}
            data-active-state={isActive ? 'on' : 'off'}
            disabled={!canApply}
            role="menuitemradio"
            key={option.value}
            onClick={() => selectColor(option.value)}
          />
        );
      })}

      <label className="tiptap-text-color-custom" title={t('textColorCustom')}>
        <input
          type="color"
          value={getColorInputValue(color)}
          aria-label={t('textColorCustom')}
          disabled={!canApply}
          onChange={(event) => selectColor(event.target.value)}
        />
      </label>

      <Button
        type="button"
        variant="ghost"
        size="small"
        className="tiptap-text-color-remove"
        disabled={!canApply}
        aria-label={t('removeTextColor')}
        tooltip={t('removeTextColor')}
        role="menuitem"
        onClick={() => selectColor()}
      >
        <BanIcon className="tiptap-button-icon" />
      </Button>
    </div>
  );
}

export interface TextColorPopoverProps
  extends Omit<TextColorButtonProps, 'editor'>,
    TextColorControlOptions {}

export function TextColorPopover({
  editor: providedEditor,
  onApplied,
  ...buttonProps
}: TextColorPopoverProps) {
  const { t } = useTiptapLocale();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <TextColorPopoverButton editor={providedEditor} {...buttonProps} />
      </PopoverTrigger>
      <PopoverContent align="start" aria-label={t('textColors')}>
        <TextColorPopoverContent
          editor={providedEditor}
          onApplied={onApplied}
          onSelected={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}

export default TextColorPopover;
