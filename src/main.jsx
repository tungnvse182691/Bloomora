import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

// Dynamic import để MSW (khá nặng) nằm ở chunk riêng, không phình bundle chính.

// Demo deploy: MSW luôn bật để mock API hoạt động cả trên production.
// Khi có backend thật, đổi lại thành: if (import.meta.env.DEV) { ... }
//
// QUAN TRỌNG: phải await worker.start() xong mới render app. Nếu không,
// request /api/* có thể bắn đi trước khi service worker kịp đăng ký → rớt ra
// mạng thật, Vercel trả về trang index.html (HTTP 200) thay vì JSON →
// apiFetch nhận data = null → crash "Cannot read properties of null (reading 'items')".
async function bootstrap() {
  try {
    const { worker } = await import('./mocks/browser.js');
    await worker.start({ onUnhandledRequest: 'bypass' });
  } catch (e) {
    console.warn('[MSW] Không khởi động được mock worker:', e);
  }
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}

bootstrap();
