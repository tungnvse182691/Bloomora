import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 350, damping: 30 });
  const ringY = useSpring(y, { stiffness: 350, damping: 30 });

  useEffect(() => {
    const fine =
      window.matchMedia('(pointer:fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine) return undefined;
    setEnabled(true);
    document.body.classList.add('custom-cursor');

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e) => {
      setHovering(
        !!e.target.closest('a, button, [data-cursor="view"]')
      );
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    return () => {
      document.body.classList.remove('custom-cursor');
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* dot */}
      <motion.div
        className="fixed top-0 left-0 z-[100] pointer-events-none"
        style={{ x, y }}
        aria-hidden="true"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-rose-deep -translate-x-1/2 -translate-y-1/2" />
      </motion.div>
      {/* ring */}
      <motion.div
        className="fixed top-0 left-0 z-[100] pointer-events-none"
        style={{ x: ringX, y: ringY }}
        animate={{ scale: hovering ? 1.9 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        aria-hidden="true"
      >
        <div
          className={`rounded-full border-2 -translate-x-1/2 -translate-y-1/2 transition-colors ${
            hovering ? 'border-rose-deep bg-rose/10' : 'border-rose'
          }`}
          style={{ width: 34, height: 34 }}
        />
      </motion.div>
    </>
  );
};
