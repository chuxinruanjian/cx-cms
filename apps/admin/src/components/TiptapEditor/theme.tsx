import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';

interface TiptapThemeValue {
  isDark: boolean;
  toggleTheme: () => void;
}

const TiptapThemeContext = createContext<TiptapThemeValue>({
  isDark: false,
  toggleTheme: () => undefined,
});

export const TiptapThemeProvider = ({ children }: PropsWithChildren) => {
  const [isDark, setIsDark] = useState(false);
  const value = useMemo(
    () => ({
      isDark,
      toggleTheme: () => setIsDark((current) => !current),
    }),
    [isDark],
  );

  return (
    <TiptapThemeContext.Provider value={value}>
      {children}
    </TiptapThemeContext.Provider>
  );
};

export const useTiptapTheme = () => useContext(TiptapThemeContext);
