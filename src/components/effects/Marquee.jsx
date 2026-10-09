import LocalFloristIcon from '@mui/icons-material/LocalFlorist';

export const Marquee = ({ items = [], reverse = false, className = '' }) => {
  const doubled = [...items, ...items];
  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className={`flex w-max items-center gap-8 ${
          reverse ? 'animate-marquee-right' : 'animate-marquee-left'
        }`}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-8 shrink-0">
            <span className="font-display text-2xl md:text-3xl italic whitespace-nowrap">
              {item}
            </span>
            <LocalFloristIcon className="text-rose shrink-0" style={{ fontSize: 22 }} />
          </span>
        ))}
      </div>
    </div>
  );
};
