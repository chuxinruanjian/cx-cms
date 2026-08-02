import '@/components/tiptap-ui-primitive/popover/popover.scss';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { useTiptapTheme } from '@/components/TiptapEditor/theme';
import { cn } from '@/lib/tiptap-utils';

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger {...props} />;
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  const { isDark } = useTiptapTheme();

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'cx-tiptap-portal',
          { dark: isDark },
          'tiptap-popover',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverContent, PopoverTrigger };
