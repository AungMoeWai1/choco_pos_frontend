export function formatCurrency(amount: number): string {
  return `MMK ${new Intl.NumberFormat('en-US').format(Math.round(amount))}`;
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount);
}
