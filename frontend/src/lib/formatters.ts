// [PARTE VISUAL / UTILIDADES: Formateadores de Texto y Moneda] Funciones de transformación visual para mostrar precios en Soles (PEN S/), fechas amigables y estados legibles en la interfaz.
export function formatMoney(cents: number): string {
  if (isNaN(cents)) return 'S/ 0.00';
  return `S/ ${(cents / 100).toFixed(2)}`;
}

export function formatDate(dateStringOrDate: string | Date | null | undefined): string {
  if (!dateStringOrDate) return '-';
  const date = typeof dateStringOrDate === 'string' ? new Date(dateStringOrDate) : dateStringOrDate;
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateOnly(dateStringOrDate: string | Date | null | undefined): string {
  if (!dateStringOrDate) return '-';
  const date = typeof dateStringOrDate === 'string' ? new Date(dateStringOrDate) : dateStringOrDate;
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
