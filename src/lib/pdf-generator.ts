import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from './utils-format';

export const generateTransactionsPDF = async (
    transactions: any[],
    userName: string,
    dateRange?: { from: Date; to: Date }
) => {
    try {
        console.log("PDF: Iniciando geração final com identidade visual...");

        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const timestamp = format(new Date(), "dd/MM/yyyy HH:mm");

        // Período
        let periodText = format(new Date(), "MMMM yyyy", { locale: ptBR });
        if (dateRange?.from && dateRange?.to) {
            periodText = `${format(dateRange.from, "dd/MM/yyyy")} até ${format(dateRange.to, "dd/MM/yyyy")}`;
        }

        // Identidade Visual do Sistema (Verde Venux)
        const systemGreen: [number, number, number] = [16, 185, 129];
        const darkGray: [number, number, number] = [20, 20, 20];

        // Cabeçalho Premium
        doc.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.rect(0, 0, 210, 40, 'F');

        // Tentar carregar a logo antes de desenhar
        try {
            const logoBase64 = await new Promise<string>((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'Anonymous';
                img.src = '/logo.png';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0);
                        resolve(canvas.toDataURL('image/png'));
                    } else {
                        reject(new Error('Canvas context failed'));
                    }
                };
                img.onerror = () => reject(new Error('Logo load failed'));
            });
            doc.addImage(logoBase64, 'PNG', 15, 8, 24, 24);
        } catch (e) {
            console.warn("PDF: Logo não carregada, usando texto.", e);
            doc.setTextColor(systemGreen[0], systemGreen[1], systemGreen[2]);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("VENUX", 15, 22);
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("ASSESSOR", 42, 22);

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150);
        doc.text(`Relatório Financeiro Profissional`, 42, 28);
        doc.text(`GERADO EM: ${timestamp}`, 195, 20, { align: 'right' });

        // Título do Conteúdo
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("EXTRATO DE MOVIMENTAÇÕES", 15, 55);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Proprietário: ${userName}`, 15, 62);
        doc.text(`Período: ${periodText}`, 15, 68);

        // Somatórios Estilizados (Fundo claro com borda verde)
        const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
        const balance = income - expense;

        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, 75, 180, 20, 2, 2, 'F');
        doc.setDrawColor(systemGreen[0], systemGreen[1], systemGreen[2]);
        doc.setLineWidth(0.5);
        doc.line(15, 75, 15, 95); // Barra lateral de destaque

        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 100, 100);
        doc.text("RECEITAS TOTAL", 22, 82);
        doc.text("DESPESAS TOTAL", 85, 82);
        doc.text("SALDO DISPONÍVEL", 148, 82);

        doc.setFontSize(11);
        doc.setTextColor(systemGreen[0], systemGreen[1], systemGreen[2]);
        doc.text(formatCurrency(income), 22, 90);
        doc.setTextColor(220, 38, 38);
        doc.text(formatCurrency(expense), 85, 90);
        doc.setTextColor(balance >= 0 ? systemGreen[0] : 220, balance >= 0 ? systemGreen[1] : 38, balance >= 0 ? systemGreen[2] : 38);
        doc.text(formatCurrency(balance), 148, 90);

        // Tabela de Dados
        const rows = transactions.map(t => [
            t.date ? format(new Date(t.date + 'T12:00:00'), "dd/MM/yyyy") : '---',
            t.description || 'Sem descrição',
            t.category || 'Outros',
            t.type === 'income' ? 'Receita' : 'Despesa',
            formatCurrency(t.amount || 0)
        ]);

        autoTable(doc, {
            startY: 105,
            head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
            body: rows,
            headStyles: {
                fillColor: systemGreen,
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold'
            },
            alternateRowStyles: { fillColor: [250, 252, 251] },
            styles: { fontSize: 8, cellPadding: 3 },
            margin: { left: 15, right: 15 },
            didDrawPage: (data) => {
                doc.setFontSize(7);
                doc.setTextColor(150, 150, 150);
                doc.text(`Venux Assessor - Página ${data.pageNumber}`, 105, 285, { align: 'center' });
            }
        });

        doc.save(`extrato_venux_${format(new Date(), "ddMMyyyy")}.pdf`);
        console.log("PDF: Sucesso!");

    } catch (error) {
        console.error("PDF: Falha na geração", error);
        alert("Erro ao gerar PDF colorido. Tente novamente.");
    }
};
