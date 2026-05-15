import { format, parseISO, isValid } from 'date-fns';

export function formatDate(dateStr: string, fmt = 'MMM dd, yyyy'): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return format(date, fmt);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  return formatDate(dateStr, 'MMM dd, yyyy HH:mm');
}

export function formatDateForAPI(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function today(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function thirtyDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return format(d, 'yyyy-MM-dd');
}
