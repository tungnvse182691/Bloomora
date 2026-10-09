import { apiFetch } from './api';

/** Kiểm tra mã giảm giá. Trả về { valid, promo, discount } */
export const validatePromo = (code, subtotal) =>
  apiFetch('/promos/validate', { method: 'POST', body: { code, subtotal } });
