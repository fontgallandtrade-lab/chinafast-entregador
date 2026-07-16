export function formatMoney(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatDistance(value) {
  return `${Number(value || 0).toFixed(1)} km`;
}

export function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleDateString('pt-BR');
}

export function formatDateTime(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleString('pt-BR');
}

export function formatAddress(delivery, type) {
  const prefix =
    type === 'pickup' ? 'pickup' : 'destination';

  return [
    delivery?.[`${prefix}_street`],
    delivery?.[`${prefix}_number`],
    delivery?.[`${prefix}_neighborhood`],
    delivery?.[`${prefix}_city`],
  ]
    .filter(Boolean)
    .join(', ');
}
