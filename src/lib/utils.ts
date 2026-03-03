
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns a Date object for the start of the month for the given year and month string
 */
export function getStartOfMonth(year: string, month: string): Date {
    return new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
}

/**
 * Returns a Date object for the end of the month for the given year and month string
 */
export function getEndOfMonth(year: string, month: string): Date {
    return new Date(parseInt(year, 10), parseInt(month, 10), 0);
}
