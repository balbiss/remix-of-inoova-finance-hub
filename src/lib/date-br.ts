// utils/date-br.ts


// Converte para ISO 8601 com timezone -03:00 (Brasil)
export function toBrazilIso(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Ajusta para GMT-3
  const brDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000) - (3 * 60 * 60 * 1000));
  // Retorna ISO 8601 com timezone -03:00
  return brDate.toISOString().replace('Z', '-03:00');
}
