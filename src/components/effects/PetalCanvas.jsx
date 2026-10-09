import { useEffect, useRef } from 'react';

const COLORS = ['#e8a7a2', '#c4706b', '#f4cfd3', '#e3b6b3', '#d98c8c'];
const COUNT = 24;

const makePetal = (w, h) => ({
  x: Math.random() * w,
  y: Math.random() * h - h,
  size: 6 + Math.random() * 10,
  speedY: 0.4 + Math.random() * 0.9,
  speedX: (Math.random() - 0.5) * 0.6,
  angle: Math.random() * Math.PI * 2,
  spin: (Math.random() - 0.5) * 0.02,
  sway: Math.random() * Math.PI * 2,
  swaySpeed: 0.008 + Math.random() * 0.015,
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
  opacity: 0.5 + Math.random() * 0.4,
});

export const PetalCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');

    let w = window.innerWidth;
    let h = window.innerHeight;
    let petals = [];
    let raf = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    petals = Array.from({ length: COUNT }, () => makePetal(w, h));
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of petals) {
        p.y += p.speedY;
        p.sway += p.swaySpeed;
        p.x += p.speedX + Math.sin(p.sway) * 0.6;
        p.angle += p.spin;

        if (p.y > h + 20) {
          Object.assign(p, makePetal(w, h), { y: -20 });
        }
        if (p.x > w + 20) p.x = -20;
        if (p.x < -20) p.x = w + 20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        // ellipse cánh hoa
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.45, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  if (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[5]"
      aria-hidden="true"
    />
  );
};
