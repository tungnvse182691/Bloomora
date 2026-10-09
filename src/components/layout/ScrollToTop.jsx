import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

export const ScrollToTop = () => {
  const [show, setShow] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="group fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-ink text-cream shadow-lg flex items-center justify-center hover:bg-rose-deep transition-colors cursor-pointer"
          aria-label="Về đầu trang"
        >
          <LocalFloristIcon className={hover ? 'animate-spin-slower' : ''} style={{ fontSize: 22 }} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
