// Utility functions for formatting

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  // Se vier no formato yyyy-mm-dd, formata manualmente para dd/mm/yyyy
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [ano, mes, dia] = dateString.split('-');
    return `${dia}/${mes}/${ano}`;
  }
  // Se vier em outro formato, tenta usar Date normalmente
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
};
