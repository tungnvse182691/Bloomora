/** 450000 -> "450.000₫" */
export const formatVND = (n) => `${new Intl.NumberFormat('vi-VN').format(Number(n) || 0)}₫`;

const pad = (x) => String(x).padStart(2, '0');

/** ISO -> "09/10/2026" */
export const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

/** ISO -> "09/10/2026 14:30" */
export const formatDateTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${formatDate(iso)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
