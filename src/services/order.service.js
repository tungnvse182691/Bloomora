import { apiFetch } from './api';

/** Tạo đơn hàng. Trả về { order } */
export const createOrder = (payload) =>
  apiFetch('/orders', { method: 'POST', body: payload });

/** Danh sách đơn của user. Trả về { items } (mới nhất trước) */
export const getOrders = (userId) =>
  apiFetch(`/orders${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`);

/** Chi tiết đơn theo mã. Trả về { order } */
export const getOrder = (code) => apiFetch(`/orders/${code}`);

/** Hủy đơn (chỉ khi pending/confirmed). Trả về { order } */
export const cancelOrder = (code) =>
  apiFetch(`/orders/${code}/cancel`, { method: 'PATCH' });
