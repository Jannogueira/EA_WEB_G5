import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext';
import { AlertProvider } from './context/AlertContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { config } from './config';
import './i18n';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={config.googleClientId}>
      <ThemeProvider>
        <AlertProvider>
          <App />
        </AlertProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
