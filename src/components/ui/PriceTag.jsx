import { formatVND } from '../../utils/format';

const sizeCls = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

export const PriceTag = ({ price, oldPrice, size = 'md' }) => (
  <div className="flex items-baseline gap-2 flex-wrap">
    <span className={`text-rose-deep font-semibold ${sizeCls[size] || sizeCls.md}`}>
      {formatVND(price)}
    </span>
    {oldPrice && oldPrice > price && (
      <span className="text-ink/40 line-through text-sm">{formatVND(oldPrice)}</span>
    )}
  </div>
);
