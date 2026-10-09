// Client gọi API mock — tầng duy nhất được phép dùng fetch trực tiếp.
// Mọi service khác phải đi qua apiFetch, không hardcode fetch riêng.

const TOKEN_KEY = 'bloomora_token';

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};

export const setToken = (token) => {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
};

export const clearToken = () => {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
};

/**
 * @param {string} path - đường dẫn API, vd '/products?page=1'
 * @param {{ method?: string, body?: any, auth?: boolean }} options
 */
export async function apiFetch(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    throw new Error(data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
  }
  if (data == null) {
    // VD: service worker chưa kịp đăng ký, request rớt ra mạng thật và nhận
    // về trang HTML (200) thay vì JSON. Ném lỗi rõ ràng thay vì để crash ở chỗ gọi hàm.
    throw new Error('Không nhận được dữ liệu từ máy chủ, vui lòng tải lại trang');
  }
  return data;
}
