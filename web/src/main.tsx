import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { updateThemeMode } from './providers/theme.tsx';
import { initDecoderWorker } from './services/image-decoder.ts';
import { ThemeManagerProvider } from './providers/theme-provider.tsx';
import { showErrorSnackbar } from './providers/snackbar.tsx';

updateThemeMode();

initDecoderWorker().catch((error: unknown) => {
  console.error('初始化图像解码器失败:', error);
  showErrorSnackbar('初始化图像解码器失败');
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeManagerProvider>
      <App />
    </ThemeManagerProvider>
  </StrictMode>
);
