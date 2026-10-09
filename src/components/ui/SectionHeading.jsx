export const SectionHeading = ({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  dark = false,
}) => {
  const alignCls = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <div className={`max-w-2xl ${alignCls}`}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose mb-3">
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-display text-4xl md:text-5xl leading-tight ${dark ? 'text-cream' : 'text-ink'}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-base ${dark ? 'text-cream/70' : 'text-ink-soft'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
