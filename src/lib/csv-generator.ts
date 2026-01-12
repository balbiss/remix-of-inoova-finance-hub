import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const generateTransactionsCSV = (transactions: any[], userName: string) => {
    const headers = ['Data', 'Descricao', 'Categoria', 'Valor', 'Tipo', 'Metodo de Pagamento'];

    const rows = transactions.map(t => [
        format(new Date(t.date), 'dd/MM/yyyy'),
        t.description.replace(/,/g, ''), // remove commas to avoid breaking CSV
        t.category,
        t.amount.toString().replace('.', ','), // use comma as decimal separator for Brazilian Excel
        t.type === 'income' ? 'Receita' : 'Despesa',
        t.payment_method || 'N/A'
    ]);

    const csvContent = [
        headers.join(';'), // use semicolon as separator for Brazilian Excel
        ...rows.map(r => r.join(';'))
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const filename = `venux_contabil_${userName.toLowerCase().replace(/\s/g, '_')}_${format(new Date(), 'MM_yyyy')}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
