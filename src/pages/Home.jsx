import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { toast } from 'sonner';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SpaIcon from '@mui/icons-material/Spa';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SendIcon from '@mui/icons-material/Send';

import { Button } from '../components/ui/Button';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Rating } from '../components/ui/Rating';
import { ProductCard } from '../components/product/ProductCard';
import { ProductGrid } from '../components/product/ProductGrid';
import { Reveal } from '../components/effects/Reveal';
import { MagneticButton } from '../components/effects/MagneticButton';
import { Marquee } from '../components/effects/Marquee';
import { Countdown } from '../components/effects/Countdown';
import { getCategories, getOccasions, getFeatured } from '../services/product.service';
import { getPosts } from '../services/blog.service';
import { subscribeNewsletter } from '../services/misc.service';
import { formatDate } from '../utils/format';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const HERO_TITLE = 'Hoa Tươi Mỗi Ngày, Trao Yêu Thương';

const MARQUEE_ITEMS = [
  'Giao hoa trong 2h',
  'Hoa tươi mỗi ngày',
  'Miễn phí thiệp',
  'Tư vấn 24/7',
];

const TESTIMONIALS = [
  {
    quote: 'Hoa đẹp hơn cả ảnh, giao đúng giờ hẹn. Vợ mình rất bất ngờ và hạnh phúc!',
    name: 'Chị Lan Anh',
    detail: 'TP. Hồ Chí Minh',
  },
  {
    quote: 'Bó tulip tươi rói, gói cực kỳ cẩn thận. Tỏ tình thành công nhờ Bloomora!',
    name: 'Anh Minh Quân',
    detail: 'Hà Nội',
  },
  {
    quote: 'Đặt lẵng khai trương cho công ty, sang trọng và đúng ý. Sẽ ủng hộ dài dài.',
    name: 'Chị Thu Hà',
    detail: 'Đà Nẵng',
  },
];

const scrollToBestseller = () => {
  document.getElementById('bestseller')?.scrollIntoView({ behavior: 'smooth' });
};

export default function Home() {
  useDocumentTitle('Bloomora — Hoa Tươi Mỗi Ngày');
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const bgRef = useRef(null);
  const promoBgRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [posts, setPosts] = useState([]);
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const promoTarget = useMemo(() => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), []);

  // ---- Dữ liệu trang chủ
  useEffect(() => {
    (async () => {
      try {
        const [c, o, b, n, p] = await Promise.all([
          getCategories(),
          getOccasions(),
          getFeatured('bestseller'),
          getFeatured('new'),
          getPosts({ limit: 3 }),
        ]);
        setCategories((c.items || []).slice(0, 4));
        setOccasions(o.items || []);
        setBestsellers(b.items || []);
        setNewArrivals((n.items || []).slice(0, 4));
        setPosts(p.items || []);
      } catch (err) {
        toast.error(err.message || 'Không tải được dữ liệu trang chủ');
      }
    })();
  }, []);

  // ---- GSAP: reveal tiêu đề + parallax
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-letter',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.028, ease: 'power3.out', delay: 0.35 },
      );
      gsap.fromTo(
        '.hero-fade',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.15, ease: 'power3.out', delay: 1.1 },
      );
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          yPercent: 18,
          ease: 'none',
          scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
        });
      }
      if (promoBgRef.current) {
        gsap.fromTo(
          promoBgRef.current,
          { yPercent: -12 },
          {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: { trigger: promoBgRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      }
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    setSubscribing(true);
    try {
      await subscribeNewsletter(value);
      toast.success('Đăng ký nhận tin thành công! Cảm ơn bạn.');
      setEmail('');
    } catch (err) {
      toast.error(err.message || 'Đăng ký thất bại, vui lòng thử lại');
    } finally {
      setSubscribing(false);
    }
  };

  const titleWords = HERO_TITLE.split(' ');

  return (
    <div className="bg-cream">
      {/* ================= HERO ================= */}
      <section ref={heroRef} className="relative h-screen min-h-[640px] overflow-hidden">
        <div ref={bgRef} className="absolute inset-0 -bottom-[20%]">
          <img
            src="https://loremflickr.com/1920/1080/flowers?lock=100"
            alt="Hoa tươi Bloomora"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink/70" />

        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">
          <p className="hero-fade text-cream/80 text-xs md:text-sm font-semibold uppercase tracking-[0.35em] mb-6">
            Bloomora Flower Studio
          </p>
          <h1 className="font-display text-cream text-5xl md:text-7xl lg:text-8xl leading-[1.08] max-w-5xl">
            {titleWords.map((word, wi) => (
              <span key={wi} className="inline-block whitespace-nowrap">
                {word.split('').map((ch, ci) => (
                  <span key={ci} className="hero-letter inline-block">
                    {ch}
                  </span>
                ))}
                {wi < titleWords.length - 1 && <span>&nbsp;</span>}
              </span>
            ))}
          </h1>
          <p className="hero-fade mt-6 text-cream/85 text-base md:text-lg max-w-xl">
            Hoa Đà Lạt tươi mới mỗi sáng, bó tay bởi nghệ nhân và giao tận nơi trong 2 giờ.
          </p>
          <div className="hero-fade mt-10 flex flex-col sm:flex-row items-center gap-4">
            <MagneticButton>
              <Button variant="light" size="lg" onClick={() => navigate('/shop')}>
                Mua ngay <ArrowForwardIcon fontSize="small" />
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button
                variant="outline"
                size="lg"
                onClick={scrollToBestseller}
                className="!border-cream !text-cream hover:!bg-cream hover:!text-ink"
              >
                Khám phá
              </Button>
            </MagneticButton>
          </div>
        </div>

        <button
          type="button"
          onClick={scrollToBestseller}
          className="hero-fade absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-cream/80 hover:text-cream transition-colors cursor-pointer"
          aria-label="Cuộn xuống"
        >
          <span className="text-[11px] uppercase tracking-[0.3em]">Cuộn xuống</span>
          <ArrowDownwardIcon className="animate-bounce" />
        </button>
      </section>

      {/* ================= MARQUEE ================= */}
      <div className="bg-ink text-cream py-4 overflow-hidden">
        <Marquee items={MARQUEE_ITEMS.map((t) => `✦ ${t}`)} />
      </div>

      {/* ================= DANH MỤC NỔI BẬT ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Bộ sưu tập"
            title="Danh mục nổi bật"
            subtitle="Từ bó hoa bó tay đến lẵng hoa sang trọng — luôn có một lựa chọn dành cho bạn."
          />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <Reveal key={cat.id}>
              <Link
                to={`/shop?category=${cat.slug}`}
                className="group relative block rounded-3xl overflow-hidden aspect-[3/4] bg-sand"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5">
                  <h3 className="font-display text-cream text-xl md:text-2xl">{cat.name}</h3>
                  <span className="inline-flex items-center gap-1 mt-1 text-cream/85 text-sm font-semibold">
                    Khám phá <ArrowForwardIcon fontSize="small" className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= BESTSELLER ================= */}
      <section id="bestseller" className="bg-cream-dark py-20 md:py-28 overflow-hidden">
        <Reveal>
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeading
              eyebrow="Được yêu thích nhất"
              title="Bestseller"
              subtitle="Những mẫu hoa được khách hàng của Bloomora chọn nhiều nhất."
            />
          </div>
        </Reveal>
        <Reveal className="mt-12">
          <Swiper
            modules={[EffectCoverflow, Autoplay]}
            effect="coverflow"
            grabCursor
            centeredSlides
            slidesPerView="auto"
            loop={bestsellers.length > 3}
            autoplay={{ delay: 3200, disableOnInteraction: false }}
            coverflowEffect={{ rotate: 18, stretch: 0, depth: 220, modifier: 1, slideShadows: false }}
            className="pb-8"
          >
            {bestsellers.map((p) => (
              <SwiperSlide key={p.id} style={{ width: 280 }} className="!h-auto">
                <ProductCard product={p} />
              </SwiperSlide>
            ))}
          </Swiper>
        </Reveal>
      </section>

      {/* ================= THEO DỊP ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Mọi khoảnh khắc"
            title="Shop theo dịp"
            subtitle="Gửi đúng thông điệp cho từng dịp đặc biệt của bạn."
          />
        </Reveal>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {occasions.map((occ) => (
            <Reveal key={occ.id}>
              <Link
                to={`/occasions/${occ.slug}`}
                className="group flex items-center gap-5 rounded-3xl bg-white border border-ink/10 p-4 pr-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <img
                  src={occ.image}
                  alt={occ.name}
                  loading="lazy"
                  className="w-24 h-24 rounded-2xl object-cover shrink-0"
                />
                <div className="flex-1">
                  <h3 className="font-display text-xl text-ink">{occ.name}</h3>
                  <span className="inline-flex items-center gap-1 mt-1 text-sm font-semibold text-rose-deep">
                    Xem hoa <ArrowForwardIcon fontSize="small" className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= PROMO BANNER ================= */}
      <section className="relative overflow-hidden">
        <div ref={promoBgRef} className="absolute inset-0 -top-[15%] -bottom-[15%]">
          <img
            src="https://loremflickr.com/1920/800/flowers,pink?lock=200"
            alt="Ưu đãi hoa tươi"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-ink/65" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 md:py-32 text-center">
          <Reveal>
            <p className="text-gold text-xs font-semibold uppercase tracking-[0.35em] mb-4">Ưu đãi giới hạn</p>
            <h2 className="font-display text-cream text-4xl md:text-6xl leading-tight">
              Tuần Lễ Hoa Tươi — Giảm đến 20%
            </h2>
            <p className="mt-4 text-cream/80 text-base md:text-lg">
              Áp dụng cho toàn bộ bó hoa và lẵng hoa. Nhanh tay, ưu đãi kết thúc sau:
            </p>
            <div className="mt-8 flex justify-center">
              <Countdown targetDate={promoTarget} />
            </div>
            <div className="mt-10">
              <MagneticButton>
                <Button variant="light" size="lg" onClick={() => navigate('/shop')}>
                  Săn ưu đãi ngay <ArrowForwardIcon fontSize="small" />
                </Button>
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= MỚI VỀ ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Vừa cập bến"
            title="Mới về"
            subtitle="Những mẫu hoa mới nhất từ vườn Đà Lạt, cập nhật mỗi tuần."
          />
        </Reveal>
        <Reveal className="mt-12">
          <ProductGrid products={newArrivals} />
          <div className="mt-10 text-center">
            <Button variant="outline" size="lg" onClick={() => navigate('/shop?sort=newest')}>
              Xem tất cả <ArrowForwardIcon fontSize="small" />
            </Button>
          </div>
        </Reveal>
      </section>

      {/* ================= CAM KẾT ================= */}
      <section className="bg-ink text-cream py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <LocalShippingIcon fontSize="large" />, title: 'Giao hoa trong 2h', desc: 'Nội thành TP.HCM & Hà Nội' },
            { icon: <SpaIcon fontSize="large" />, title: 'Hoa tươi mỗi ngày', desc: 'Nhập mới từ Đà Lạt mỗi sáng' },
            { icon: <CardGiftcardIcon fontSize="large" />, title: 'Miễn phí thiệp', desc: 'Thiệp viết tay theo yêu cầu' },
            { icon: <SupportAgentIcon fontSize="large" />, title: 'Tư vấn 24/7', desc: 'Đội ngũ luôn sẵn sàng hỗ trợ' },
          ].map((f) => (
            <Reveal key={f.title}>
              <div className="flex flex-col items-center text-center gap-3">
                <span className="text-gold">{f.icon}</span>
                <h3 className="font-display text-lg">{f.title}</h3>
                <p className="text-cream/70 text-sm">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Khách hàng nói gì"
            title="Yêu thương được gửi trao"
            subtitle="Hàng ngàn khách hàng đã tin chọn Bloomora cho những dịp đặc biệt."
          />
        </Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <Reveal key={t.name}>
              <figure className="h-full rounded-3xl bg-white border border-ink/10 p-8 flex flex-col shadow-sm">
                <Rating value={5} />
                <blockquote className="mt-4 text-ink-soft leading-relaxed flex-1">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6">
                  <p className="font-semibold text-ink">{t.name}</p>
                  <p className="text-sm text-ink-soft/70">{t.detail}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= BLOG ================= */}
      <section className="bg-cream-dark py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Góc hoa"
              title="Bài viết mới nhất"
              subtitle="Mẹo chăm hoa, ý nghĩa loài hoa và cảm hứng mỗi ngày."
            />
          </Reveal>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Reveal key={post.id}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block h-full rounded-3xl overflow-hidden bg-cream border border-ink/10 hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={post.cover}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-xs text-ink-soft/70 font-semibold uppercase tracking-wider">
                      {formatDate(post.createdAt)} · {post.author}
                    </p>
                    <h3 className="mt-2 font-display text-xl text-ink leading-snug group-hover:text-rose-deep transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-ink-soft line-clamp-2">{post.excerpt}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= NEWSLETTER ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <Reveal>
          <div className="rounded-[2.5rem] bg-ink text-cream px-8 py-16 md:p-20 text-center relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-rose/25 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-gold/20 blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-4xl md:text-5xl">Nhận ưu đãi độc quyền</h2>
              <p className="mt-4 text-cream/75 max-w-lg mx-auto">
                Đăng ký nhận tin để không bỏ lỡ mẫu hoa mới và voucher giảm giá mỗi tháng.
              </p>
              <form onSubmit={handleSubscribe} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email của bạn"
                  className="flex-1 rounded-full px-6 py-3.5 bg-cream/10 border border-cream/25 text-cream placeholder:text-cream/50 outline-none focus:border-gold transition-colors"
                />
                <Button type="submit" variant="light" disabled={subscribing}>
                  {subscribing ? 'Đang gửi...' : (<>Đăng ký <SendIcon fontSize="small" /></>)}
                </Button>
              </form>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
