import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import { AnimatePresence, motion } from 'framer-motion';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';

const NAV = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Cửa hàng', to: '/shop' },
  { label: 'Dịp lễ', to: '/occasions/sinh-nhat' },
  { label: 'Blog', to: '/blog' },
  { label: 'Liên hệ', to: '/contact' },
];

export const Header = () => {
  const navigate = useNavigate();
  const cartCount = useCartStore((s) => s.count());
  const wishlistCount = useWishlistStore((s) => s.ids.length);
  const user = useAuthStore((s) => s.user);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const setMiniCartOpen = useUIStore((s) => s.setMiniCartOpen);
  const mobileNavOpen = useUIStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);

  return (
    <>
      {/* Topbar */}
      <div className="bg-ink text-cream text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <p className="tracking-wide">Giao hoa nhanh trong 2h tại TP.HCM</p>
          <a href="tel:19001234" className="flex items-center gap-1.5 hover:text-gold transition-colors">
            <PhoneIcon style={{ fontSize: 14 }} />
            <span>Hotline: 1900 1234</span>
          </a>
        </div>
      </div>

      {/* Main bar */}
      <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 -ml-2 text-ink cursor-pointer"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Mở menu"
          >
            <MenuIcon />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-ink">
            <LocalFloristIcon className="text-rose" style={{ fontSize: 30 }} />
            <span className="font-display italic text-2xl md:text-3xl font-semibold">
              Bloomora
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-sm font-medium text-ink hover:text-rose-deep transition-colors tracking-wide"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-1 md:gap-2">
            <button
              className="p-2 text-ink hover:text-rose-deep transition-colors cursor-pointer"
              onClick={() => setSearchOpen(true)}
              aria-label="Tìm kiếm"
            >
              <SearchIcon />
            </button>
            <button
              className="p-2 text-ink hover:text-rose-deep transition-colors cursor-pointer relative"
              onClick={() => navigate('/wishlist')}
              aria-label="Danh sách yêu thích"
            >
              <FavoriteBorderIcon />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-rose text-cream text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center px-1">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              className="p-2 text-ink hover:text-rose-deep transition-colors cursor-pointer"
              onClick={() => navigate(user ? '/account' : '/login')}
              aria-label="Tài khoản"
            >
              <PersonOutlinedIcon />
            </button>
            <button
              id="cart-button"
              className="p-2 text-ink hover:text-rose-deep transition-colors cursor-pointer relative"
              onClick={() => setMiniCartOpen(true)}
              aria-label="Giỏ hàng"
            >
              <ShoppingBagOutlinedIcon />
              {cartCount > 0 && (
                <span
                  key={cartCount}
                  className="animate-pop-in absolute top-0.5 right-0.5 bg-ink text-cream text-[10px] font-bold min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center px-1"
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-ink/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.aside
              className="fixed top-0 left-0 h-full w-72 bg-cream z-50 p-6 flex flex-col"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-display italic text-2xl text-ink">Bloomora</span>
                <button
                  className="p-2 text-ink cursor-pointer"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Đóng menu"
                >
                  <CloseIcon />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setMobileNavOpen(false)}
                    className="py-3 px-2 text-ink font-medium border-b border-ink/10 hover:text-rose-deep transition-colors"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
