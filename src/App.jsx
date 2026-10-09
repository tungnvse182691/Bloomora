import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/useAuthStore';

// Layout / effects (created in parallel — import only, exact export names)
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MiniCart } from './components/layout/MiniCart';
import { SearchOverlay } from './components/layout/SearchOverlay';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { QuickViewModal } from './components/product/QuickViewModal';
import { PetalCanvas } from './components/effects/PetalCanvas';
import { CustomCursor } from './components/effects/CustomCursor';
import { FlyToCartLayer } from './components/effects/FlyToCartLayer';

// Pages (P1–P3 pages by other agents — import only)
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Wishlist from './pages/Wishlist';

// Pages (P4–P5, this scope)
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Account from './pages/Account';
import OrderTracking from './pages/OrderTracking';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Occasion from './pages/Occasion';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

const ScrollToTopOnNav = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Page = ({ children }) => (
  <motion.main
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    transition={{ duration: 0.35 }}
  >
    {children}
  </motion.main>
);

const RequireAuth = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

export default function App() {
  const location = useLocation();

  return (
    <>
      <ScrollToTopOnNav />
      <CustomCursor />
      <PetalCanvas />
      <FlyToCartLayer />
      <Header />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/shop" element={<Page><Shop /></Page>} />
          <Route path="/shop/:slug" element={<Page><ProductDetail /></Page>} />
          <Route path="/cart" element={<Page><Cart /></Page>} />
          <Route path="/checkout" element={<Page><Checkout /></Page>} />
          <Route path="/checkout/success" element={<Page><CheckoutSuccess /></Page>} />
          <Route path="/wishlist" element={<Page><Wishlist /></Page>} />

          <Route path="/login" element={<Page><Login /></Page>} />
          <Route path="/register" element={<Page><Register /></Page>} />
          <Route path="/forgot-password" element={<Page><ForgotPassword /></Page>} />

          <Route path="/account" element={<Page><RequireAuth><Account /></RequireAuth></Page>} />
          <Route path="/account/orders/:code" element={<Page><RequireAuth><OrderTracking /></RequireAuth></Page>} />

          <Route path="/blog" element={<Page><Blog /></Page>} />
          <Route path="/blog/:slug" element={<Page><BlogDetail /></Page>} />
          <Route path="/occasions/:slug" element={<Page><Occasion /></Page>} />
          <Route path="/about" element={<Page><About /></Page>} />
          <Route path="/contact" element={<Page><Contact /></Page>} />
          <Route path="/admin" element={<Page><Admin /></Page>} />

          <Route path="*" element={<Page><NotFound /></Page>} />
        </Routes>
      </AnimatePresence>
      <MiniCart />
      <SearchOverlay />
      <QuickViewModal />
      <Footer />
      <ScrollToTop />
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}
