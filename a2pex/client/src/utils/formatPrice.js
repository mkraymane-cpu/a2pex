export function formatPrice(value) {
  const n = Number(value) || 0;
  const formatted = new Intl.NumberFormat('fr-MA', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
  return `${formatted} DH`;
}
