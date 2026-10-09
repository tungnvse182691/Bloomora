import { apiFetch } from './api';

/** Gửi form liên hệ. Trả về { ok } */
export const submitContact = (data) =>
  apiFetch('/contact', { method: 'POST', body: data });

/** Đăng ký nhận tin. Trả về { ok } */
export const subscribeNewsletter = (email) =>
  apiFetch('/newsletter/subscribe', { method: 'POST', body: { email } });

/** Đồng bộ giỏ hàng lên server (mock). Trả về { ok } */
export const syncCart = (items) =>
  apiFetch('/cart/sync', { method: 'POST', body: { items } });
