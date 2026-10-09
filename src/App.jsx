import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/useAuthStore';
import { usePrivateRouteNoIndex } from './hooks/useDocumentTitle';

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

// Pages: lazy-load theo route để bundle ban đầu nhẹ (tăng tốc lần load đầu)
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Account = lazy(() => import('./pages/Account'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const Occasion = lazy(() => import('./pages/Occasion'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageFallback = () => (
  <div className="min-h-[70vh] flex items-center justify-center bg-cream">
    <div className="w-12 h-12 rounded-full border-4 border-sand border-t-rose animate-spin" aria-label="Đang tải trang" />
  </div>
);

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
  usePrivateRouteNoIndex();

  return (
    <>
      <ScrollToTopOnNav />
      <CustomCursor />
      <PetalCanvas />
      <FlyToCartLayer />
      <Header />
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageFallback />}>
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
        </Suspense>
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
