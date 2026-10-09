import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export const TiltCard = ({ children, className = '', max = 8 }) => {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return <div className={className}>{children}</div>;

  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rotateX: -py * max, rotateY: px * max });
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ perspective: 800 }}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ rotateX: 0, rotateY: 0 })}
      animate={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {children}
    </motion.div>
  );
};
