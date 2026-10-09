import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://bloomora-nu.vercel.app';
const SITE_NAME = 'Bloomora';
const DEFAULT_TITLE = 'Bloomora — Shop Hoa Tươi';
const DEFAULT_DESC =
  'Bloomora — Shop hoa tươi Đà Lạt, giao nhanh trong 2h tại TP.HCM & Hà Nội. Bó hoa, lẵng hoa, hoa cưới, hoa khai trương, hoa tang lễ, chậu cây.';

export function setMetaTag(attr, key, content) {
  if (content == null) return;
  const selector = attr === 'property' ? `meta[property="${key}"]` : `meta[name="${key}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function setCanonicalTag(url) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

// Giữ nguyên tên & chữ ký cũ (title) để 19 trang đang dùng không phải sửa.
// Thêm options { description, image, noindex } để có meta SEO đầy đủ:
// title, description, canonical, Open Graph, Twitter Card, robots.
export const useDocumentTitle = (title, { description, image, noindex } = {}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title || DEFAULT_TITLE;
    const desc = description || DEFAULT_DESC;
    const url = `${SITE_URL}${pathname}`;

    document.title = fullTitle;
    setMetaTag('name', 'description', desc);
    setCanonicalTag(url);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', SITE_NAME);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', desc);
    setMetaTag('property', 'og:url', url);
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', desc);
    if (image) {
      setMetaTag('property', 'og:image', image);
      setMetaTag('name', 'twitter:image', image);
    }
    setMetaTag('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
  }, [title, description, image, noindex, pathname]);
};

// Đánh dấu noindex cho các trang riêng tư (giỏ hàng, checkout, tài khoản, admin...)
// Dùng 1 lần trong App.jsx, không cần sửa từng trang.
const PRIVATE_PREFIXES = [
  '/account',
  '/checkout',
  '/admin',
  '/login',
  '/register',
  '/forgot-password',
  '/cart',
  '/wishlist',
];

export function usePrivateRouteNoIndex() {
  const { pathname } = useLocation();
  useEffect(() => {
    const isPrivate = PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    setMetaTag('name', 'robots', isPrivate ? 'noindex, nofollow' : 'index, follow');
  }, [pathname]);
}
