const variants = {
  primary: 'bg-ink text-cream hover:bg-rose-deep',
  outline: 'border border-ink text-ink hover:bg-ink hover:text-cream',
  ghost: 'text-ink hover:bg-sand/60',
  light: 'bg-cream text-ink hover:bg-cream-dark',
};

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
    {...rest}
  >
    {children}
  </button>
);
