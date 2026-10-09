import { apiFetch } from './api';

const toQuery = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
};

/** Lấy danh sách sản phẩm có lọc/phân trang/sắp xếp. Trả về { items, total, page, totalPages } */
export const getProducts = (params = {}) => apiFetch(`/products${toQuery(params)}`);

/** Chi tiết sản phẩm theo slug. Trả về { product, related } */
export const getProduct = (slug) => apiFetch(`/products/${slug}`);

/** Sản phẩm nổi bật. type: 'bestseller' | 'new'. Trả về { items } */
export const getFeatured = (type = 'bestseller') => apiFetch(`/products/featured?type=${type}`);

/** Trả về { items: categories } */
export const getCategories = () => apiFetch('/categories');

/** Trả về { items: occasions } */
export const getOccasions = () => apiFetch('/occasions');

/** Trả về { items: banners } */
export const getBanners = () => apiFetch('/banners');

/** Đánh giá của sản phẩm (theo product id). Trả về { items } */
export const getReviews = (productId) => apiFetch(`/products/${productId}/reviews`);

/** Thêm đánh giá (cần đăng nhập). Trả về { review } */
export const addReview = (productId, { rating, comment }) =>
  apiFetch(`/products/${productId}/reviews`, { method: 'POST', body: { rating, comment }, auth: true });

/** Gợi ý tìm kiếm theo tên. Trả về { items: [{ slug, name, image, price }] } */
export const suggestProducts = (q) => apiFetch(`/search/suggest${toQuery({ q })}`);
