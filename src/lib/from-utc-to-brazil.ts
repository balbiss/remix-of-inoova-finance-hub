// Converte string UTC do banco para exibição no fuso de Brasília (GMT-3)
export function fromUtcToBrazil(dateStr: string) {
  if (!dateStr) return 'Data inválida';
  // Espera formato: YYYY-MM-DD HH:mm:ss+00
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::\d{2})?(?:\.\d+)?([+-]\d{2})?/);
  if (!match) return 'Data inválida';
  const [, year, month, day, hour, minute] = match;
  return `${day}/${month}/${year} ${hour}:${minute}`;
}
