import { apiFetch } from './api';

/** Gói, kích thước, thời hạn của hoa định kỳ. Trả về { plans, sizes, durations } */
export const getSubscriptionPlans = () => apiFetch('/subscriptions/plans');

/** Đăng ký gói mới. Trả về { subscription } */
export const createSubscription = (data) => apiFetch('/subscriptions', { method: 'POST', body: data });

/** Gói đã đăng ký của user. Trả về { items } */
export const getSubscriptions = (userId) =>
  apiFetch(`/subscriptions${userId ? `?userId=${userId}` : ''}`);

/** Đổi trạng thái gói: 'active' | 'paused' | 'cancelled'. Trả về { subscription } */
export const updateSubscription = (id, status) =>
  apiFetch(`/subscriptions/${id}`, { method: 'PATCH', body: { status } });
