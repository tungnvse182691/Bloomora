import { apiFetch } from './api';

/** Thống kê tổng quan cho admin. Trả về { totals, revenueByDay, ordersByStatus, topProducts, lowStock, recentOrders } */
export const getAdminStats = () => apiFetch('/admin/stats');

/** Tất cả đơn hàng (không lọc userId). Trả về { items } */
export const getAllOrders = () => apiFetch('/orders');

/** Đổi trạng thái đơn: 'confirmed' | 'shipping' | 'delivered' | 'cancelled'. Trả về { order } */
export const updateOrderStatus = (code, status) =>
  apiFetch(`/orders/${code}/status`, { method: 'PATCH', body: { status } });
