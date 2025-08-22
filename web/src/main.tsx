import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeManagerProvider } from './providers/theme-provider.tsx';
import './main.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeManagerProvider>
      <App />
    </ThemeManagerProvider>
  </StrictMode>
);
