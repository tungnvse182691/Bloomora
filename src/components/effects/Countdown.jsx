import { useCountdown } from '../../hooks/useCountdown';

const pad = (n) => String(n).padStart(2, '0');

export const Countdown = ({ targetDate }) => {
  const { days, hours, minutes, seconds } = useCountdown(targetDate);
  const cells = [
    { label: 'Ngày', value: days },
    { label: 'Giờ', value: pad(hours) },
    { label: 'Phút', value: pad(minutes) },
    { label: 'Giây', value: pad(seconds) },
  ];
  return (
    <div className="flex gap-2 md:gap-3">
      {cells.map((c) => (
        <div
          key={c.label}
          className="bg-ink text-cream rounded-2xl px-3 py-2.5 md:px-5 md:py-3 min-w-[64px] md:min-w-[84px] text-center"
        >
          <div className="font-display text-2xl md:text-4xl font-semibold tabular-nums">
            {c.value}
          </div>
          <div className="text-[11px] md:text-xs text-cream/70 mt-0.5">{c.label}</div>
        </div>
      ))}
    </div>
  );
};
