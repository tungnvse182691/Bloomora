import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingBagOutlined from '@mui/icons-material/ShoppingBagOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

import { Button } from '../components/ui/Button';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Rating } from '../components/ui/Rating';
import { PriceTag } from '../components/ui/PriceTag';
import { QtyStepper } from '../components/ui/QtyStepper';
import { Field } from '../components/ui/Field';
import { ProductBadges } from '../components/ui/Badge';
import { ProductCard } from '../components/product/ProductCard';
import { Reveal } from '../components/effects/Reveal';
import { MagneticButton } from '../components/effects/MagneticButton';
import { triggerFlyToCart } from '../components/effects/FlyToCartLayer';
import { getProduct, getReviews, addReview } from '../services/product.service';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { formatVND, formatDate } from '../utils/format';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const GIFT_WRAP_FEE = 30000;

const TABS = [
  { id: 'desc', label: 'Mô tả' },
  { id: 'care', label: 'Hướng dẫn chăm sóc' },
  { id: 'reviews', label: 'Đánh giá' },
];

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [size, setSize] = useState('M');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [giftWrap, setGiftWrap] = useState(false);
  const [note, setNote] = useState('');
  const [tab, setTab] = useState('desc');

  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [sendingReview, setSendingReview] = useState(false);

  const [showSticky, setShowSticky] = useState(false);
  const addBtnRef = useRef(null);

  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const hasWishlist = useWishlistStore((s) => s.has);

  useDocumentTitle(product ? `${product.name} — Bloomora` : 'Chi tiết sản phẩm — Bloomora', {
    description: product
      ? `${product.name} — hoa tươi Đà Lạt, giao nhanh trong 2h, miễn phí thiệp viết tay. Xem chi tiết & đặt hàng tại Bloomora.`
      : undefined,
    image: product?.images?.[0],
  });

  // ---- Tải sản phẩm
  useEffect(() => {
    let cancelled = false;
    window.scrollTo(0, 0);
    setLoading(true);
    (async () => {
      try {
        const { product: p, related: r } = await getProduct(slug);
        if (cancelled) return;
        setProduct(p);
        setRelated(r || []);
        setSize(p.sizes?.[1]?.name || p.sizes?.[0]?.name || 'M');
        setColor(p.colors?.[0] || '');
        setActiveImg(0);
        setQty(1);
        setGiftWrap(false);
        setNote('');
        setTab('desc');
        const rev = await getReviews(p.id);
        if (!cancelled) setReviews(rev.items || []);
      } catch (err) {
        if (!cancelled) {
          toast.error(err.message || 'Không tìm thấy sản phẩm');
          navigate('/shop');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  // ---- Sticky bar mobile: hiện khi cuộn qua nút thêm giỏ chính
  useEffect(() => {
    const el = addBtnRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [product, loading]);

  const sizePrice = useMemo(() => {
    if (!product) return 0;
    const found = product.sizes?.find((s) => s.name === size);
    return found ? found.price : product.price;
  }, [product, size]);

  const finalPrice = sizePrice + (giftWrap ? GIFT_WRAP_FEE : 0);
  const wished = product ? hasWishlist(product.id) : false;

  const handleAdd = (e) => {
    if (!product) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0],
      price: finalPrice,
      size,
      qty,
      giftWrap,
      note: note.trim(),
    });
    if (e?.clientX != null) triggerFlyToCart(product.images?.[0], e.clientX, e.clientY);
    toast.success(`Đã thêm “${product.name}” vào giỏ hàng`);
  };

  const scrollToReviews = () => {
    setTab('reviews');
    requestAnimationFrame(() => {
      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập để gửi đánh giá');
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }
    setSendingReview(true);
    try {
      const { review } = await addReview(product.id, { rating: reviewRating, comment: reviewComment.trim() });
      setReviews((r) => [{ ...review, userName: review.userName || user.name }, ...r]);
      setReviewComment('');
      toast.success('Cảm ơn bạn đã đánh giá!');
    } catch (err) {
      toast.error(err.message || 'Gửi đánh giá thất bại');
    } finally {
      setSendingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">
        <div className="aspect-[4/5] rounded-3xl skeleton-shimmer" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded skeleton-shimmer" />
          <div className="h-6 w-1/3 rounded skeleton-shimmer" />
          <div className="h-10 w-1/2 rounded skeleton-shimmer" />
          <div className="h-24 rounded skeleton-shimmer" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length ? product.images : [];

  return (
    <div className="bg-cream">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-ink-soft mb-8 flex-wrap">
          <Link to="/" className="hover:text-rose-deep">Trang chủ</Link>
          <ChevronRightIcon fontSize="small" />
          <Link to="/shop" className="hover:text-rose-deep">Cửa hàng</Link>
          <ChevronRightIcon fontSize="small" />
          <span className="text-ink font-medium">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* ---- Gallery ---- */}
          <div>
            <div className="relative rounded-[2rem] overflow-hidden bg-sand aspect-[4/5] group">
              <ProductBadges product={product} />
              <img
                src={images[activeImg]}
                alt={product.name}
                onClick={() => setLightbox(true)}
                className="w-full h-full object-cover cursor-zoom-in transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className={`rounded-2xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                    i === activeImg ? 'border-rose' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ---- Panel phải ---- */}
          <div>
            <h1 className="font-display text-4xl md:text-5xl text-ink leading-tight">{product.name}</h1>
            <button
              type="button"
              onClick={scrollToReviews}
              className="mt-3 flex items-center gap-2 cursor-pointer hover:opacity-80"
            >
              <Rating value={product.rating} />
              <span className="text-sm text-ink-soft font-medium">
                {product.rating} · {product.reviewCount} đánh giá
              </span>
            </button>

            <div className="mt-5">
              <PriceTag price={finalPrice} oldPrice={product.oldPrice} size="lg" />
            </div>

            {/* Size */}
            {product.sizes?.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-ink mb-2">Kích thước</p>
                <div className="flex gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setSize(s.name)}
                      className={`min-w-14 px-4 py-2.5 rounded-full border text-sm font-semibold transition-all cursor-pointer ${
                        size === s.name
                          ? 'bg-ink text-cream border-ink'
                          : 'border-ink/20 text-ink hover:border-ink'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Màu */}
            {product.colors?.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-ink mb-2">Màu sắc</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all cursor-pointer ${
                        color === c ? 'bg-rose text-cream border-rose' : 'border-ink/20 text-ink hover:border-rose'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Số lượng + gói quà */}
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <div>
                <p className="text-sm font-semibold text-ink mb-2">Số lượng</p>
                <QtyStepper qty={qty} onChange={(v) => setQty(Math.max(1, Math.min(product.stock || 99, v)))} />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer select-none mt-7">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="w-5 h-5 accent-[#c4706b] cursor-pointer"
                />
                <span className="text-sm text-ink flex items-center gap-1.5">
                  <CardGiftcardIcon fontSize="small" className="text-rose" />
                  Gói quà tặng (+{formatVND(GIFT_WRAP_FEE)})
                </span>
              </label>
            </div>

            <div className="mt-5">
              <Field label="Lời nhắn trên thiệp (miễn phí)">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  maxLength={200}
                  placeholder="VD: Chúc mừng sinh nhật em yêu!"
                  className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-rose resize-none"
                />
              </Field>
            </div>

            {/* CTA */}
            <div ref={addBtnRef} className="mt-6 flex gap-3">
              <MagneticButton className="flex-1">
                <Button size="lg" className="w-full" onClick={handleAdd}>
                  <ShoppingBagOutlined fontSize="small" /> Thêm vào giỏ · {formatVND(finalPrice * qty)}
                </Button>
              </MagneticButton>
              <button
                type="button"
                onClick={() => {
                  toggleWishlist(product.id);
                  toast.success(wished ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích');
                }}
                aria-label="Yêu thích"
                className={`w-[52px] h-[52px] rounded-full border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                  wished ? 'bg-rose border-rose text-cream' : 'border-ink/20 text-ink hover:border-rose hover:text-rose'
                }`}
              >
                {wished ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-sand/60 p-4 text-sm text-ink-soft space-y-1.5">
              <p>🚚 Giao hoa trong 2–4h tại nội thành · kèm thiệp viết tay miễn phí</p>
              <p>🌸 Cam kết hoa tươi — đổi mới nếu hoa héo khi nhận</p>
            </div>
          </div>
        </div>

        {/* ---- Tabs ---- */}
        <div id="reviews" className="mt-16 scroll-mt-24">
          <div className="flex gap-2 border-b border-ink/10 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer border-b-2 -mb-px ${
                  tab === t.id ? 'border-rose text-rose-deep' : 'border-transparent text-ink-soft hover:text-ink'
                }`}
              >
                {t.label}
                {t.id === 'reviews' && ` (${reviews.length})`}
              </button>
            ))}
          </div>

          <div className="py-8">
            {tab === 'desc' && (
              <div className="max-w-3xl text-ink-soft leading-relaxed space-y-4">
                <p>{product.description}</p>
                {product.delivery && <p>{product.delivery}</p>}
              </div>
            )}
            {tab === 'care' && (
              <div className="max-w-3xl text-ink-soft leading-relaxed">
                <p>{product.care || 'Cắt chéo gốc hoa, thay nước mỗi ngày và để nơi thoáng mát.'}</p>
              </div>
            )}
            {tab === 'reviews' && (
              <div className="max-w-3xl">
                <div className="space-y-6">
                  {reviews.length === 0 && (
                    <p className="text-ink-soft text-sm">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                  )}
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-2xl bg-white border border-ink/10 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-ink text-sm">{r.userName}</p>
                        <span className="text-xs text-ink-soft/70">{formatDate(r.createdAt)}</span>
                      </div>
                      <div className="mt-1"><Rating value={r.rating} size={15} /></div>
                      <p className="mt-2 text-sm text-ink-soft leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmitReview} className="mt-8 rounded-2xl bg-cream-dark p-6">
                  <h3 className="font-display text-xl text-ink mb-4">Viết đánh giá của bạn</h3>
                  <div className="grid sm:grid-cols-[160px_1fr] gap-4">
                    <Field label="Số sao">
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-rose cursor-pointer"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>{n} sao</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Nhận xét">
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={3}
                        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                        className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-rose resize-none"
                      />
                    </Field>
                  </div>
                  <Button type="submit" disabled={sendingReview}>
                    {sendingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </Button>
                  {!user && (
                    <p className="mt-3 text-xs text-ink-soft">
                      Bạn cần <Link to="/login" className="text-rose-deep font-semibold hover:underline">đăng nhập</Link> để gửi đánh giá.
                    </p>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>

        {/* ---- Related ---- */}
        {related.length > 0 && (
          <div className="mt-8">
            <Reveal>
              <SectionHeading eyebrow="Gợi ý" title="Có thể bạn cũng thích" align="left" />
            </Reveal>
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              spaceBetween={20}
              slidesPerView={1.4}
              breakpoints={{
                640: { slidesPerView: 2.4 },
                1024: { slidesPerView: 4 },
              }}
              className="!pb-12 mt-8"
            >
              {related.map((p) => (
                <SwiperSlide key={p.id} className="!h-auto">
                  <ProductCard product={p} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>

      {/* ---- Lightbox ---- */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-ink/90 flex items-center justify-center p-6"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            aria-label="Đóng"
            className="absolute top-6 right-6 text-cream hover:text-gold cursor-pointer"
            onClick={() => setLightbox(false)}
          >
            <CloseIcon fontSize="large" />
          </button>
          <img
            src={images[activeImg]}
            alt={product.name}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ---- Sticky bar mobile ---- */}
      {showSticky && (
        <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-cream/95 backdrop-blur border-t border-ink/10 px-4 py-3 flex items-center justify-between gap-4 animate-pop-in">
          <div>
            <p className="text-[11px] text-ink-soft">{product.name}</p>
            <PriceTag price={finalPrice} size="sm" />
          </div>
          <Button size="sm" onClick={handleAdd} className="shrink-0">
            <ShoppingBagOutlined fontSize="small" /> Thêm vào giỏ
          </Button>
        </div>
      )}
    </div>
  );
}
