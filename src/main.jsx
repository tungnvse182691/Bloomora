import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { worker } from './mocks/browser.js';

// Demo deploy: MSW luôn bật để mock API hoạt động cả trên production.
// Khi có backend thật, đổi lại thành: if (import.meta.env.DEV) { ... }
worker.start({ onUnhandledRequest: 'bypass' });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
