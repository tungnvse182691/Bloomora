import { useEffect, useState } from 'react';

const diff = (target) => {
  const t = new Date(target).getTime() - Date.now();
  if (Number.isNaN(t) || t <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(t / 86400000),
    hours: Math.floor(t / 3600000) % 24,
    minutes: Math.floor(t / 60000) % 60,
    seconds: Math.floor(t / 1000) % 60,
  };
};

export const useCountdown = (targetDate) => {
  const [time, setTime] = useState(() => diff(targetDate));

  useEffect(() => {
    setTime(diff(targetDate));
    const id = setInterval(() => setTime(diff(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return time;
};
