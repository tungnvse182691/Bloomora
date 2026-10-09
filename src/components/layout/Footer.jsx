import { Link } from 'react-router-dom';
import { useState } from 'react';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import SendIcon from '@mui/icons-material/Send';
import { toast } from 'sonner';
import { subscribeNewsletter } from '../../services/misc.service';

const shopLinks = [
  { label: 'Tất cả sản phẩm', to: '/shop' },
  { label: 'Hoa sinh nhật', to: '/occasions/sinh-nhat' },
  { label: 'Hoa cưới', to: '/occasions/cuoi' },
  { label: 'Hoa khai trương', to: '/occasions/khai-truong' },
];

const supportLinks = [
  { label: 'Chính sách giao hàng', to: '/chinh-sach-giao-hang' },
  { label: 'Đổi trả & hoàn tiền', to: '/doi-tra' },
  { label: 'Hướng dẫn chăm sóc hoa', to: '/blog' },
  { label: 'Liên hệ', to: '/contact' },
];

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await subscribeNewsletter(email.trim());
      toast.success('Đăng ký nhận tin thành công!');
      setEmail('');
    } catch {
      toast.error('Đăng ký thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-ink text-cream">
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Giới thiệu */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <LocalFloristIcon className="text-rose" style={{ fontSize: 28 }} />
            <span className="font-display italic text-2xl">Bloomora</span>
          </div>
          <p className="text-cream/70 text-sm leading-relaxed mb-5">
            Tiệm hoa tươi mỗi ngày — gói ghém cảm xúc bằng những đóa hoa tươi nhất,
            giao nhanh trong 2h tại TP.HCM.
          </p>
          <div className="flex gap-3">
            {[FacebookIcon, InstagramIcon, YouTubeIcon].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-full border border-cream/25 flex items-center justify-center hover:bg-rose hover:border-rose transition-colors"
                aria-label="Mạng xã hội"
              >
                <Icon style={{ fontSize: 18 }} />
              </a>
            ))}
          </div>
        </div>

        {/* Liên kết */}
        <div>
          <h4 className="font-display text-lg mb-4">Cửa hàng</h4>
          <ul className="space-y-2.5 text-sm text-cream/70">
            {shopLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-gold transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Hỗ trợ */}
        <div>
          <h4 className="font-display text-lg mb-4">Hỗ trợ</h4>
          <ul className="space-y-2.5 text-sm text-cream/70">
            {supportLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-gold transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-display text-lg mb-4">Nhận tin ưu đãi</h4>
          <p className="text-cream/70 text-sm mb-4">
            Giảm 10% cho đơn đầu tiên khi đăng ký nhận tin.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email của bạn"
              className="flex-1 min-w-0 bg-cream/10 border border-cream/25 rounded-full px-4 py-2.5 text-sm placeholder:text-cream/40 focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-10 h-10 shrink-0 rounded-full bg-rose hover:bg-rose-deep transition-colors flex items-center justify-center disabled:opacity-50 cursor-pointer"
              aria-label="Đăng ký"
            >
              <SendIcon style={{ fontSize: 18 }} />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-cream/15">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-cream/50">
          <p>© 2026 Bloomora. Tất cả quyền được bảo lưu.</p>
          <p>Hoa tươi mỗi ngày — TP. Hồ Chí Minh</p>
        </div>
      </div>
    </footer>
  );
};
