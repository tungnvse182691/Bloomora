import { http, HttpResponse, delay } from 'msw';
import {
  categories, occasions, products, promos, users, orders,
  reviews, blogPosts, banners, provinces,
  subscriptionPlans, subscriptionSizes, subscriptionDurations, subscriptions,
  DEFAULT_CARE, DEFAULT_DELIVERY,
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

const ORDER_FLOW = ['pending', 'confirmed', 'shipping', 'delivered'];
const ADMIN_STATUS_NOTES = {
  confirmed: 'Admin đã duyệt đơn hàng',
  shipping: 'Đơn hàng đang được giao',
  delivered: 'Giao hàng thành công',
  cancelled: 'Admin đã hủy đơn hàng',
};

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const uniqueSlug = (base) => {
  let slug = base || `san-pham-${Date.now()}`;
  let i = 2;
  while (products.some((p) => p.slug === slug)) slug = `${base}-${i++}`;
  return slug;
};

const DEFAULT_PRODUCT_IMG = 'https://images.unsplash.com/photo-1561181286-d3fee7d55342?w=800&q=80&auto=format&fit=crop';

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

  // ------------------------------------------------------------- admin
  http.patch('/api/orders/:code/status', async ({ params, request }) => {
    await wait();
    const body = await request.json().catch(() => ({}));
    const order = orders.find((o) => o.code === params.code);
    if (!order) return HttpResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
    const { status } = body;
    const valid = ['confirmed', 'shipping', 'delivered', 'cancelled'];
    if (!valid.includes(status)) {
      return HttpResponse.json({ message: 'Trạng thái không hợp lệ' }, { status: 400 });
    }
    if (['delivered', 'cancelled'].includes(order.status)) {
      return HttpResponse.json({ message: 'Đơn hàng đã kết thúc, không thể đổi trạng thái' }, { status: 400 });
    }
    // Chỉ cho đi tiếp theo luồng hoặc hủy (không cho quay ngược)
    const curIdx = ORDER_FLOW.indexOf(order.status);
    const nextIdx = ORDER_FLOW.indexOf(status);
    if (status !== 'cancelled' && (nextIdx === -1 || nextIdx < curIdx)) {
      return HttpResponse.json({ message: 'Không thể chuyển về trạng thái trước đó' }, { status: 400 });
    }
    order.status = status;
    order.timeline.push({ status, at: new Date().toISOString(), note: ADMIN_STATUS_NOTES[status] || '' });
    return HttpResponse.json({ order });
  }),

  http.get('/api/admin/stats', async () => {
    await wait();
    const delivered = orders.filter((o) => o.status === 'delivered');
    const revenue = delivered.reduce((sum, o) => sum + (o.total || 0), 0);

    // Doanh thu 14 ngày gần nhất
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayRevenue = delivered
        .filter((o) => (o.createdAt || '').slice(0, 10) === key)
        .reduce((sum, o) => sum + (o.total || 0), 0);
      days.push({ date: key, label: `${d.getDate()}/${d.getMonth() + 1}`, revenue: dayRevenue });
    }

    const ordersByStatus = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'].map((s) => ({
      status: s,
      count: orders.filter((o) => o.status === s).length,
    }));

    // Top sản phẩm bán chạy (theo số lượng, chỉ tính đơn chưa hủy)
    const qtyMap = {};
    orders
      .filter((o) => o.status !== 'cancelled')
      .forEach((o) => (o.items || []).forEach((it) => {
        const k = it.productId;
        qtyMap[k] = qtyMap[k] || { name: it.name, image: it.image, qty: 0, revenue: 0 };
        qtyMap[k].qty += Number(it.qty) || 0;
        qtyMap[k].revenue += (Number(it.price) || 0) * (Number(it.qty) || 0);
      }));
    const topProducts = Object.values(qtyMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

    const lowStock = products
      .filter((p) => (p.stock ?? 0) < 10)
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
      .slice(0, 6)
      .map((p) => ({ id: p.id, name: p.name, image: p.images?.[0], stock: p.stock ?? 0, slug: p.slug }));

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return HttpResponse.json({
      totals: {
        revenue,
        orders: orders.length,
        products: products.length,
        customers: users.length,
        pendingOrders: orders.filter((o) => o.status === 'pending').length,
      },
      revenueByDay: days,
      ordersByStatus,
      topProducts,
      lowStock,
      recentOrders,
    });
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

  // ------------------------------------------------------------- subscriptions
  http.get('/api/subscriptions/plans', async () => {
    await wait();
    return HttpResponse.json({
      plans: subscriptionPlans,
      sizes: subscriptionSizes,
      durations: subscriptionDurations,
    });
  }),

  http.get('/api/subscriptions', async ({ request }) => {
    await wait();
    const userId = new URL(request.url).searchParams.get('userId');
    const items = subscriptions
      .filter((s) => !userId || s.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return HttpResponse.json({ items });
  }),

  http.post('/api/subscriptions', async ({ request }) => {
    await wait();
    const body = await request.json().catch(() => ({}));
    const { planId, sizeId, durationMonths, startDate, name, phone, address, city, note, userId } = body;
    const plan = subscriptionPlans.find((p) => p.id === planId);
    const size = subscriptionSizes.find((s) => s.id === sizeId);
    const duration = subscriptionDurations.find((d) => d.months === Number(durationMonths));
    if (!plan || !size || !duration) {
      return HttpResponse.json({ message: 'Vui lòng chọn đầy đủ gói, kích thước và thời hạn' }, { status: 400 });
    }
    if (!name || !phone || !address) {
      return HttpResponse.json({ message: 'Vui lòng điền đầy đủ thông tin nhận hoa' }, { status: 400 });
    }
    const pricePerDelivery = Math.round(size.price * (1 - plan.discount) * (1 - duration.bonus));
    const deliveries = Math.max(1, Math.round((duration.months * 30) / plan.intervalDays));
    const code = `SUB-${String(Math.floor(100000 + Math.random() * 900000))}`;
    const now = new Date().toISOString();
    const sub = {
      id: `sub${Date.now()}`,
      code,
      userId: userId || 'u1',
      planId: plan.id, planName: plan.name,
      sizeId: size.id, sizeName: size.name,
      durationMonths: duration.months,
      pricePerDelivery, deliveries,
      total: pricePerDelivery * deliveries,
      startDate: startDate || now.slice(0, 10),
      nextDelivery: startDate || now.slice(0, 10),
      status: 'active',
      name, phone, address, city: city || '', note: note || '',
      createdAt: now,
    };
    subscriptions.unshift(sub);
    return HttpResponse.json({ subscription: sub }, { status: 201 });
  }),

  http.patch('/api/subscriptions/:id', async ({ params, request }) => {
    await wait();
    const body = await request.json().catch(() => ({}));
    const sub = subscriptions.find((s) => s.id === params.id);
    if (!sub) return HttpResponse.json({ message: 'Không tìm thấy gói đăng ký' }, { status: 404 });
    const { status } = body;
    if (!['active', 'paused', 'cancelled'].includes(status)) {
      return HttpResponse.json({ message: 'Trạng thái không hợp lệ' }, { status: 400 });
    }
    sub.status = status;
    return HttpResponse.json({ subscription: sub });
  }),

  // ---- Products CRUD (admin)
  http.post('/api/products', async ({ request }) => {
    await wait();
    const body = await request.json().catch(() => ({}));
    const { name, price, oldPrice, stock, categoryId, description, image } = body;
    if (!name || !String(name).trim()) {
      return HttpResponse.json({ message: 'Vui lòng nhập tên sản phẩm' }, { status: 400 });
    }
    if (!(Number(price) > 0)) {
      return HttpResponse.json({ message: 'Giá sản phẩm phải lớn hơn 0' }, { status: 400 });
    }
    const p = Math.round(Number(price));
    const now = new Date().toISOString();
    const product = {
      id: `p${Date.now()}`,
      slug: uniqueSlug(slugify(name)),
      name: String(name).trim(),
      price: p,
      oldPrice: Number(oldPrice) > 0 ? Math.round(Number(oldPrice)) : null,
      categoryId: categoryId || 'c1',
      occasionIds: [],
      images: [image || DEFAULT_PRODUCT_IMG],
      colors: [],
      sizes: [
        { name: 'S', price: Math.round(p * 0.8) },
        { name: 'M', price: p },
        { name: 'L', price: Math.round(p * 1.25) },
      ],
      rating: 0, reviewCount: 0, stock: Math.max(0, Math.round(Number(stock) || 0)),
      isNew: true, isBestseller: false, tags: ['mới'],
      description: description || '',
      care: DEFAULT_CARE, delivery: DEFAULT_DELIVERY,
      createdAt: now,
    };
    products.unshift(product);
    return HttpResponse.json({ product }, { status: 201 });
  }),

  http.patch('/api/products/:id', async ({ params, request }) => {
    await wait();
    const body = await request.json().catch(() => ({}));
    const product = products.find((p) => p.id === params.id);
    if (!product) return HttpResponse.json({ message: 'Không tìm thấy sản phẩm' }, { status: 404 });
    const { name, price, oldPrice, stock, categoryId, description, image } = body;
    if (name !== undefined) {
      if (!String(name).trim()) return HttpResponse.json({ message: 'Tên sản phẩm không được trống' }, { status: 400 });
      product.name = String(name).trim();
    }
    if (price !== undefined) {
      if (!(Number(price) > 0)) return HttpResponse.json({ message: 'Giá sản phẩm phải lớn hơn 0' }, { status: 400 });
      const p = Math.round(Number(price));
      product.price = p;
      product.sizes = [
        { name: 'S', price: Math.round(p * 0.8) },
        { name: 'M', price: p },
        { name: 'L', price: Math.round(p * 1.25) },
      ];
    }
    if (oldPrice !== undefined) product.oldPrice = Number(oldPrice) > 0 ? Math.round(Number(oldPrice)) : null;
    if (stock !== undefined) product.stock = Math.max(0, Math.round(Number(stock) || 0));
    if (categoryId !== undefined) product.categoryId = categoryId;
    if (description !== undefined) product.description = description;
    if (image !== undefined && image) product.images = [image, ...product.images.slice(1)];
    return HttpResponse.json({ product });
  }),

  http.delete('/api/products/:id', async ({ params }) => {
    await wait();
    const idx = products.findIndex((p) => p.id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Không tìm thấy sản phẩm' }, { status: 404 });
    const [removed] = products.splice(idx, 1);
    return HttpResponse.json({ ok: true, id: removed.id });
  }),

  // ---- Users (admin)
  http.get('/api/admin/users', async () => {
    await wait();
    const items = users.map((u) => ({
      id: u.id, name: u.name, email: u.email, phone: u.phone,
      avatar: u.avatar, role: u.role || 'customer',
      addresses: (u.addresses || []).length,
      orders: orders.filter((o) => o.userId === u.id).length,
    }));
    return HttpResponse.json({ items });
  }),

  http.patch('/api/admin/users/:id', async ({ params, request }) => {
    await wait();
    const body = await request.json().catch(() => ({}));
    const u = users.find((x) => x.id === params.id);
    if (!u) return HttpResponse.json({ message: 'Không tìm thấy người dùng' }, { status: 404 });
    const { name, phone, role } = body;
    if (name !== undefined) u.name = String(name).trim() || u.name;
    if (phone !== undefined) u.phone = String(phone).trim();
    if (role !== undefined) {
      if (!['admin', 'customer'].includes(role)) {
        return HttpResponse.json({ message: 'Vai trò không hợp lệ' }, { status: 400 });
      }
      if (u.role === 'admin' && role !== 'admin' && users.filter((x) => x.role === 'admin').length <= 1) {
        return HttpResponse.json({ message: 'Phải giữ lại ít nhất một quản trị viên' }, { status: 400 });
      }
      u.role = role;
    }
    const { password, ...safe } = u;
    return HttpResponse.json({ user: { ...safe, orders: orders.filter((o) => o.userId === u.id).length } });
  }),

  http.delete('/api/admin/users/:id', async ({ params, request }) => {
    await wait();
    const body = await request.json().catch(() => ({}));
    const idx = users.findIndex((x) => x.id === params.id);
    if (idx === -1) return HttpResponse.json({ message: 'Không tìm thấy người dùng' }, { status: 404 });
    const target = users[idx];
    if (target.id === body.requesterId) {
      return HttpResponse.json({ message: 'Không thể xóa chính tài khoản của mình' }, { status: 400 });
    }
    if (target.role === 'admin' && users.filter((x) => x.role === 'admin').length <= 1) {
      return HttpResponse.json({ message: 'Không thể xóa quản trị viên cuối cùng' }, { status: 400 });
    }
    users.splice(idx, 1);
    return HttpResponse.json({ ok: true, id: target.id });
  }),
];
