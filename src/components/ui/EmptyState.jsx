export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6">
    {icon && <div className="text-ink/30 mb-4">{icon}</div>}
    <h3 className="font-display text-2xl text-ink mb-2">{title}</h3>
    {description && <p className="text-ink-soft text-sm max-w-xs mb-6">{description}</p>}
    {action}
  </div>
);
