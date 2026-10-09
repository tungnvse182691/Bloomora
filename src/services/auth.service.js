import { apiFetch } from './api';

/** Đăng nhập. Trả về { token, user } */
export const login = (email, password) =>
  apiFetch('/auth/login', { method: 'POST', body: { email, password } });

/** Đăng ký. Trả về { token, user } */
export const register = (data) =>
  apiFetch('/auth/register', { method: 'POST', body: data });

/** Lấy thông tin user từ token (cần auth). Trả về { user } */
export const me = () => apiFetch('/auth/me', { auth: true });

/** Quên mật khẩu. Trả về { ok, message } */
export const forgotPassword = (email) =>
  apiFetch('/auth/forgot-password', { method: 'POST', body: { email } });
