import { apiFetch } from './api';

/** Tính phí ship. Trả về { fee, freeShip, slots } */
export const getShipping = (city, subtotal) =>
  apiFetch(`/shipping?city=${encodeURIComponent(city || '')}&subtotal=${Number(subtotal) || 0}`);
