import { http, HttpResponse, delay } from 'msw';
import {
  categories, occasions, products, promos, users, orders,
  reviews, blogPosts, banners, provinces,
} from './db.js';

const wait = () => delay(300 + Math.random() * 500);

const stripPassword = (u) => {
  const { password, ...rest } = u;
  return rest;
};

const getUserFromAuth = (request) => {
  const header = request.headers.get('Authorization') || '';
  const m = header.match(/^Bearer mock-token-(.+)$/);
  if (!m) return null;
  return users.find((u) => u.id === m[1]) || null;
};

const vnd = (n) => `${Number(n || 0).toLocaleString('vi-VN')}₫`;
const productIdNum = (id) => parseInt(String(id).replace(/\D/g, ''), 10) || 0;

const DELIVERY_SLOTS = ['08:00 - 10:00', '10:00 - 12:00', '13:00 - 15:00', '15:00 - 17:00', '17:00 - 19:00'];

// ------------------------------------------------------------- products
function filterProducts(url) {
  const q = url.searchParams;
  let list = [...products];

  const category = q.get('category');
  if (category) {
    const cat = categories.find((c) => c.slug === category);
    list = cat ? list.filter((p) => p.categoryId === cat.id) : [];
  }

  const occasion = q.get('occasion');
  if (occasion) {
    const occ = occasions.find((o) => o.slug === occasion);
    list = occ ? list.filter((p) => p.occasionIds.includes(occ.id)) : [];
  }

  const keyword = (q.get('q') || '').trim().toLowerCase();
  if (keyword) list = list.filter((p) => p.name.toLowerCase().includes(keyword));

  const colors = (q.get('colors') || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (colors.length) list = list.filter((p) => p.colors.some((c) => colors.includes(c)));

  const minPrice = Number(q.get('minPrice'));
  const maxPrice = Number(q.get('maxPrice'));
  if (!Number.isNaN(minPrice) && q.get('minPrice') !== null) list = list.filter((p) => p.price >= minPrice);
  if (!Number.isNaN(maxPrice) && q.get('maxPrice') !== null) list = list.filter((p) => p.price <= maxPrice);

  const sort = q.get('sort') || 'featured';
  switch (sort) {
    case 'price-asc': list.sort((a, b) => a.price - b.price); break;
    case 'price-desc': list.sort((a, b) => b.price - a.price); break;
    case 'newest': list.sort((a, b) => Number(b.isNew) - Number(a.isNew) || productIdNum(b.id) - productIdNum(a.id)); break;
    case 'bestseller': list.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller) || b.reviewCount - a.reviewCount); break;
    case 'rating': list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount); break;
    default: list.sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller) || b.reviewCount - a.reviewCount);
  }
  return list;
}

// ---------------------------------------------------------------- handlers
export const handlers = [
  // ---- Products
  http.get('/api/products', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const list = filterProducts(url);
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const limit = Math.max(1, Number(url.searchParams.get('limit')) || 12);
    const totalPages = Math.max(1, Math.ceil(list.length / limit));
    return HttpResponse.json({
      items: list.slice((page - 1) * limit, page * limit),
      total: list.length,
      page,
      totalPages,
    });
  }),

  http.get('/api/products/featured', async ({ request }) => {
    await wait();
    const type = new URL(request.url).searchParams.get('type') || 'bestseller';
    const list = type === 'new'
      ? products.filter((p) => p.isNew).slice(0, 8)
      : products.filter((p) => p.isBestseller).slice(0, 8);
    return HttpResponse.json({ items: list });
  }),

  http.get('/api/products/:slug', async ({ params }) => {
    await wait();
    const product = products.find((p) => p.slug === params.slug);
    if (!product) return HttpResponse.json({ message: 'Không tìm thấy sản phẩm' }, { status: 404 });
    const related = products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);
    return HttpResponse.json({ product, related });
  }),

  // ---- Taxonomies & banners
  http.get('/api/categories', async () => {
    await wait();
    return HttpResponse.json({ items: categories });
  }),

  http.get('/api/occasions', async () => {
    await wait();
    return HttpResponse.json({ items: occasions });
  }),

  http.get('/api/banners', async () => {
    await wait();
    return HttpResponse.json({ items: banners });
  }),

  // ---- Reviews
  http.get('/api/products/:id/reviews', async ({ params }) => {
    await wait();
    return HttpResponse.json({ items: reviews.filter((r) => r.productId === params.id) });
  }),

  http.post('/api/products/:id/reviews', async ({ params, request }) => {
    await wait();
    const user = getUserFromAuth(request);
    if (!user) return HttpResponse.json({ message: 'Bạn cần đăng nhập để đánh giá' }, { status: 401 });
    const product = products.find((p) => p.id === params.id);
    if (!product) return HttpResponse.json({ message: 'Không tìm thấy sản phẩm' }, { status: 404 });
    const { rating, comment } = await request.json();
    if (!rating || rating < 1 || rating > 5) return HttpResponse.json({ message: 'Vui lòng chọn số sao đánh giá' }, { status: 400 });
    if (!comment || !comment.trim()) return HttpResponse.json({ message: 'Vui lòng nhập nội dung đánh giá' }, { status: 400 });
    const review = {
      id: `r${Date.now()}`, productId: product.id, userId: user.id, userName: user.name,
      rating: Number(rating), comment: comment.trim(), createdAt: new Date().toISOString(),
    };
    reviews.unshift(review);
    product.rating = Math.round(((product.rating * product.reviewCount + review.rating) / (product.reviewCount + 1)) * 10) / 10;
    product.reviewCount += 1;
    return HttpResponse.json({ review }, { status: 201 });
  }),

  // ---- Cart
  http.get('/api/cart', async () => {
    await wait();
    return HttpResponse.json({ items: [] });
  }),

  http.post('/api/cart/sync', async ({ request }) => {
    await wait();
    await request.json().catch(() => ({}));
    return HttpResponse.json({ ok: true });
  }),

  // ---- Promos
  http.post('/api/promos/validate', async ({ request }) => {
    await wait();
    const { code, subtotal } = await request.json();
    const promo = promos.find((p) => p.code === String(code || '').trim().toUpperCase());
    if (!promo) return HttpResponse.json({ message: 'Mã khuyến mãi không tồn tại' }, { status: 400 });
    if (new Date(promo.expiry) < new Date()) return HttpResponse.json({ message: 'Mã khuyến mãi đã hết hạn' }, { status: 400 });
    if (promo.used >= promo.usageLimit) return HttpResponse.json({ message: 'Mã khuyến mãi đã hết lượt sử dụng' }, { status: 400 });
    if (Number(subtotal) < promo.minOrder) {
      return HttpResponse.json({ message: `Đơn hàng tối thiểu ${vnd(promo.minOrder)} để sử dụng mã này` }, { status: 400 });
    }
    const discount = promo.type === 'percent' ? Math.round((Number(subtotal) * promo.value) / 100) : promo.value;
    return HttpResponse.json({ valid: true, promo: { code: promo.code, description: promo.description }, discount });
  }),

  // ---- Shipping
  http.get('/api/shipping', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const city = url.searchParams.get('city') || '';
    const subtotal = Number(url.searchParams.get('subtotal')) || 0;
    const province = provinces.find((p) => p.name === city);
    const baseFee = province ? province.fee : 35000;
    const freeShip = subtotal >= 500000;
    return HttpResponse.json({ fee: freeShip ? 0 : baseFee, freeShip, slots: DELIVERY_SLOTS });
  }),

  // ---- Orders
  http.post('/api/orders', async ({ request }) => {
    await wait();
    const body = await request.json();
    const { items, name, phone, address, city, note, deliveryDate, deliverySlot, paymentMethod, promoCode, userId } = body;
    if (!items || !items.length) return HttpResponse.json({ message: 'Giỏ hàng của bạn đang trống' }, { status: 400 });
    if (!name || !phone || !address) return HttpResponse.json({ message: 'Vui lòng điền đầy đủ thông tin nhận hàng' }, { status: 400 });

    let subtotal = 0;
    const orderItems = items.map((it) => {
      const p = products.find((x) => x.id === it.productId);
      subtotal += Number(it.price) * Number(it.qty);
      if (p) p.stock = Math.max(0, p.stock - Number(it.qty));
      return {
        productId: it.productId, name: it.name, image: it.image,
        price: Number(it.price), size: it.size || 'M', qty: Number(it.qty),
      };
    });

    let discount = 0;
    if (promoCode) {
      const promo = promos.find((p) => p.code === String(promoCode).toUpperCase());
      if (promo && subtotal >= promo.minOrder) {
        discount = promo.type === 'percent' ? Math.round((subtotal * promo.value) / 100) : promo.value;
        promo.used += 1;
      }
    }

    const province = provinces.find((p) => p.name === city);
    const shippingFee = subtotal >= 500000 ? 0 : (province ? province.fee : 35000);
    const code = `BM-${String(Math.floor(100000 + Math.random() * 900000))}`;
    const now = new Date().toISOString();

    const order = {
      id: `o${Date.now()}`, code, userId: userId || 'u1', items: orderItems,
      subtotal, discount, shippingFee, total: subtotal - discount + shippingFee,
      status: 'pending', paymentMethod: paymentMethod || 'cod',
      name, phone, address, city: city || '', note: note || '',
      deliveryDate: deliveryDate || '', deliverySlot: deliverySlot || '',
      createdAt: now,
      timeline: [{ status: 'pending', at: now, note: 'Đơn hàng được tạo thành công' }],
    };
    orders.unshift(order);
    return HttpResponse.json({ order }, { status: 201 });
  }),

  http.get('/api/orders', async ({ request }) => {
    await wait();
    const userId = new URL(request.url).searchParams.get('userId');
    const list = orders
      .filter((o) => !userId || o.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return HttpResponse.json({ items: list });
  }),

  http.get('/api/orders/:code', async ({ params }) => {
    await wait();
    const order = orders.find((o) => o.code === params.code);
    if (!order) return HttpResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    return HttpResponse.json({ order });
  }),

  http.patch('/api/orders/:code/cancel', async ({ params }) => {
    await wait();
    const order = orders.find((o) => o.code === params.code);
    if (!order) return HttpResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    if (!['pending', 'confirmed'].includes(order.status)) {
      return HttpResponse.json({ message: 'Không thể hủy đơn hàng ở trạng thái hiện tại' }, { status: 400 });
    }
    order.status = 'cancelled';
    order.timeline.push({ status: 'cancelled', at: new Date().toISOString(), note: 'Khách hàng yêu cầu hủy đơn' });
    return HttpResponse.json({ order });
  }),

  // ---- Auth
  http.post('/api/auth/login', async ({ request }) => {
    await wait();
    const { email, password } = await request.json();
    const user = users.find((u) => u.email === String(email).trim().toLowerCase() && u.password === password);
    if (!user) return HttpResponse.json({ message: 'Email hoặc mật khẩu không đúng' }, { status: 401 });
    return HttpResponse.json({ token: `mock-token-${user.id}`, user: stripPassword(user) });
  }),

  http.post('/api/auth/register', async ({ request }) => {
    await wait();
    const { name, email, phone, password } = await request.json();
    if (!name || !email || !password) return HttpResponse.json({ message: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
    if (users.some((u) => u.email === String(email).trim().toLowerCase())) {
      return HttpResponse.json({ message: 'Email đã được sử dụng' }, { status: 400 });
    }
    const user = {
      id: `u${Date.now()}`, name: name.trim(), email: String(email).trim().toLowerCase(),
      password, phone: phone || '', avatar: '', addresses: [],
    };
    users.push(user);
    return HttpResponse.json({ token: `mock-token-${user.id}`, user: stripPassword(user) }, { status: 201 });
  }),

  http.get('/api/auth/me', async ({ request }) => {
    await wait();
    const user = getUserFromAuth(request);
    if (!user) return HttpResponse.json({ message: 'Phiên đăng nhập đã hết hạn' }, { status: 401 });
    return HttpResponse.json({ user: stripPassword(user) });
  }),

  http.post('/api/auth/forgot-password', async ({ request }) => {
    await wait();
    const { email } = await request.json().catch(() => ({}));
    if (!email) return HttpResponse.json({ message: 'Vui lòng nhập email' }, { status: 400 });
    return HttpResponse.json({ ok: true, message: 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn' });
  }),

  // ---- Blog
  http.get('/api/blog', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    const tag = url.searchParams.get('tag');
    const limit = Number(url.searchParams.get('limit')) || 0;
    let list = [...blogPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (tag) list = list.filter((p) => p.tags.includes(tag));
    if (limit > 0) list = list.slice(0, limit);
    return HttpResponse.json({ items: list });
  }),

  http.get('/api/blog/:slug', async ({ params }) => {
    await wait();
    const post = blogPosts.find((p) => p.slug === params.slug);
    if (!post) return HttpResponse.json({ message: 'Không tìm thấy bài viết' }, { status: 404 });
    const related = blogPosts
      .filter((p) => p.id !== post.id && p.tags.some((t) => post.tags.includes(t)))
      .slice(0, 3);
    return HttpResponse.json({ post, related });
  }),

  // ---- Misc
  http.post('/api/contact', async ({ request }) => {
    await wait();
    const { name, email, message } = await request.json().catch(() => ({}));
    if (!name || !email || !message) return HttpResponse.json({ message: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
    return HttpResponse.json({ ok: true });
  }),

  http.post('/api/newsletter/subscribe', async ({ request }) => {
    await wait();
    const { email } = await request.json().catch(() => ({}));
    if (!email) return HttpResponse.json({ message: 'Vui lòng nhập email' }, { status: 400 });
    return HttpResponse.json({ ok: true });
  }),

  http.get('/api/search/suggest', async ({ request }) => {
    await wait();
    const q = (new URL(request.url).searchParams.get('q') || '').trim().toLowerCase();
    if (!q) return HttpResponse.json({ items: [] });
    const items = products
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 6)
      .map((p) => ({ slug: p.slug, name: p.name, image: p.images[0], price: p.price }));
    return HttpResponse.json({ items });
  }),
];
