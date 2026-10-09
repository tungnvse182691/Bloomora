import { apiFetch } from './api';

/** Danh sách bài viết. params: { tag, limit }. Trả về { items } */
export const getPosts = (params = {}) => {
  const q = new URLSearchParams();
  if (params.tag) q.set('tag', params.tag);
  if (params.limit) q.set('limit', String(params.limit));
  const s = q.toString();
  return apiFetch(`/blog${s ? `?${s}` : ''}`);
};

/** Chi tiết bài viết theo slug. Trả về { post, related } */
export const getPost = (slug) => apiFetch(`/blog/${slug}`);
