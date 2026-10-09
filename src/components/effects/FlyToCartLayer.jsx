import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export const triggerFlyToCart = (imgSrc, clientX, clientY) => {
  if (!imgSrc) return;
  window.dispatchEvent(
    new CustomEvent('fly-to-cart', { detail: { imgSrc, clientX, clientY } })
  );
};

let flyId = 0;

export const FlyToCartLayer = () => {
  const [flies, setFlies] = useState([]);

  useEffect(() => {
    const onFly = (e) => {
      const { imgSrc, clientX, clientY } = e.detail || {};
      const cartBtn = document.getElementById('cart-button');
      const rect = cartBtn?.getBoundingClientRect();
      const id = ++flyId;
      setFlies((s) => [
        ...s,
        {
          id,
          imgSrc,
          startX: clientX,
          startY: clientY,
          endX: rect ? rect.left + rect.width / 2 : window.innerWidth - 40,
          endY: rect ? rect.top + rect.height / 2 : 40,
        },
      ]);
    };
    window.addEventListener('fly-to-cart', onFly);
    return () => window.removeEventListener('fly-to-cart', onFly);
  }, []);

  const remove = (id) => setFlies((s) => s.filter((f) => f.id !== id));

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none" aria-hidden="true">
      <AnimatePresence>
        {flies.map((f) => (
          <motion.img
            key={f.id}
            src={f.imgSrc}
            alt=""
            className="absolute w-16 h-20 object-cover rounded-xl shadow-xl"
            style={{ left: f.startX - 32, top: f.startY - 40 }}
            initial={{ scale: 1, opacity: 1, x: 0, y: 0 }}
            animate={{
              x: f.endX - f.startX,
              y: f.endY - f.startY,
              scale: 0.15,
              opacity: 0.4,
            }}
            transition={{ duration: 0.7, ease: [0.3, 0.7, 0.4, 1] }}
            onAnimationComplete={() => remove(f.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
