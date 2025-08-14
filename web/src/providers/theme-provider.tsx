import { useMemo, type ReactNode } from 'react';
import { useThemeStore } from './theme';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

interface ThemeManagerProviderProps {
  children: ReactNode;
}

export function ThemeManagerProvider({ children }: ThemeManagerProviderProps) {
  const mode = useThemeStore((s) => s.mode);
  const primaryColor = useThemeStore((s) => s.primaryColor);
  const secondaryColor = useThemeStore((s) => s.secondaryColor);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: primaryColor },
          secondary: { main: secondaryColor },
        },
      }),
    [mode, primaryColor, secondaryColor]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
