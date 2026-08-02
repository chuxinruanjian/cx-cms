import { useTiptapLocale } from '@/components/TiptapEditor/locale';
import { useTiptapTheme } from '@/components/TiptapEditor/theme';

// --- Icons ---
import { MoonStarIcon } from '@/components/tiptap-icons/moon-star-icon';
import { SunIcon } from '@/components/tiptap-icons/sun-icon';
import { Button } from '@/components/tiptap-ui-primitive/button';

export function ThemeToggle() {
  const { t } = useTiptapLocale();
  const { isDark, toggleTheme } = useTiptapTheme();

  return (
    <Button
      onClick={toggleTheme}
      aria-label={t(isDark ? 'switchToLightMode' : 'switchToDarkMode')}
      variant="ghost"
    >
      {isDark ? (
        <MoonStarIcon className="tiptap-button-icon" />
      ) : (
        <SunIcon className="tiptap-button-icon" />
      )}
    </Button>
  );
}
