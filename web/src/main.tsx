import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { updateThemeMode } from './providers/theme.tsx';
import { initDecoderWorker } from './services/image-decoder.ts';
import { ThemeManagerProvider } from './providers/theme-provider.tsx';
import { showErrorSnackbar } from './providers/snackbar.tsx';
import { initEncoderWorker } from './services/image-encoder.ts';
import { enableMapSet } from 'immer';

updateThemeMode();

initDecoderWorker().catch((error: unknown) => {
  console.error('Filed to initialize decoder worker:', error);
  showErrorSnackbar('初始化图像解码器失败');
});

initEncoderWorker().catch((error: unknown) => {
  console.error('Filed to initialize encoder worker:', error);
  showErrorSnackbar('初始化图像编码器失败');
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
enableMapSet();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeManagerProvider>
      <App />
    </ThemeManagerProvider>
  </StrictMode>
);
