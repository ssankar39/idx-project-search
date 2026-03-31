export function formatPrice(value) {
  if (value === null || value === undefined || value === '') {
    return 'Price unavailable';
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return 'Price unavailable';
  }

  return `$${numericValue.toLocaleString()}`;
}

export function formatNumber(value) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return 'N/A';
  }

  return numericValue.toLocaleString();
}
