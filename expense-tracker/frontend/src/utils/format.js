export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(typeof value === 'string' ? parseFloat(value) : value);

export const formatCurrencyShort = (value) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

export const formatMonthFull = (month) => {
  const [year, mon] = month.split('-');
  return new Date(year, Number(mon) - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
};

export const formatMonthShort = (month) => {
  const [year, mon] = month.split('-');
  return `${new Date(year, Number(mon) - 1).toLocaleString('en-IN', { month: 'short' })} '${year.slice(2)}`;
};

export const formatDate = (date) => new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
