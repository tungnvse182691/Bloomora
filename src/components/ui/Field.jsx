export const Field = ({ label, error, children }) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-semibold text-ink mb-1.5">{label}</label>
    )}
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);
