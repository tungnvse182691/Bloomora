export const ProductBadges = ({ product }) => {
  if (!product) return null;
  const badges = [];
  if (product.isNew) badges.push({ text: 'Mới', cls: 'bg-ink text-cream' });
  if (product.isBestseller) badges.push({ text: 'Bán chạy', cls: 'bg-rose text-cream' });
  if (product.oldPrice && product.oldPrice > product.price) {
    const pct = Math.round((1 - product.price / product.oldPrice) * 100);
    badges.push({ text: `-${pct}%`, cls: 'bg-gold text-ink' });
  }
  if (!badges.length) return null;
  return (
    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
      {badges.map((b) => (
        <span
          key={b.text}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${b.cls}`}
        >
          {b.text}
        </span>
      ))}
    </div>
  );
};
