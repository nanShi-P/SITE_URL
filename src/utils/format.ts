export function formatStars(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

export function formatDelta(d: number): string {
  if (d > 0) return `↑${d}`;
  if (d < 0) return `↓${-d}`;
  return '–';
}
