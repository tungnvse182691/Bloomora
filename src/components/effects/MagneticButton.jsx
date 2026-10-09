import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

const canMagnetic = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer:fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const MagneticButton = ({ children, className = '', strength = 0.25 }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  if (!canMagnetic()) return <div className={className}>{children}</div>;

  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: (e.clientX - (rect.left + rect.width / 2)) * strength,
      y: (e.clientY - (rect.top + rect.height / 2)) * strength,
    });
  };

  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 180, damping: 16 }}
    >
      {children}
    </motion.div>
  );
};
