export function fmtSalary(n: number | null): string {
  if (!n) return 'Не указана';
  return n.toLocaleString('ru-RU') + ' ₽';
}

export function fmtDate(str: string | null | undefined): string {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function fmtDateTime(str: string): string {
  const d = new Date(str);
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function fmtExp(years: number): string {
  if (years === 0) return 'Без опыта';
  if (years === 1) return '1 год';
  if (years < 5) return `${years} года`;
  return `${years} лет`;
}
