import { apiFetch } from './api';

/** Thống kê tổng quan cho admin. Trả về { totals, revenueByDay, ordersByStatus, topProducts, lowStock, recentOrders } */
export const getAdminStats = () => apiFetch('/admin/stats');

/** Tất cả đơn hàng (không lọc userId). Trả về { items } */
export const getAllOrders = () => apiFetch('/orders');

/** Đổi trạng thái đơn: 'confirmed' | 'shipping' | 'delivered' | 'cancelled'. Trả về { order } */
export const updateOrderStatus = (code, status) =>
  apiFetch(`/orders/${code}/status`, { method: 'PATCH', body: { status } });

/** Tạo sản phẩm mới. Trả về { product } */
export const createProduct = (data) => apiFetch('/products', { method: 'POST', body: data });

/** Sửa sản phẩm. Trả về { product } */
export const updateProduct = (id, data) => apiFetch(`/products/${id}`, { method: 'PATCH', body: data });

/** Xóa sản phẩm. Trả về { ok, id } */
export const deleteProduct = (id) => apiFetch(`/products/${id}`, { method: 'DELETE' });

/** Danh sách người dùng (đã ẩn mật khẩu). Trả về { items } */
export const getAdminUsers = () => apiFetch('/admin/users');

/** Sửa người dùng: { name, phone, role }. Trả về { user } */
export const updateUser = (id, data) => apiFetch(`/admin/users/${id}`, { method: 'PATCH', body: data });

/** Xóa người dùng. Trả về { ok, id } */
export const deleteUser = (id, requesterId) =>
  apiFetch(`/admin/users/${id}`, { method: 'DELETE', body: { requesterId } });
