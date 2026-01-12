import { useTransactions } from '@/hooks/useTransactions';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils-format';

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-primary">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export function AnnualProjectionChart() {
  const { transactions } = useTransactions();
  // Group transactions by month for the current year
  const year = new Date().getFullYear();
  const monthlyTotals = useMemo(() => {
    const totals = Array(12).fill(0);
    transactions.forEach((t: any) => {
      const date = new Date(t.date + 'T12:00:00');
      if (date.getFullYear() === year) {
        const idx = date.getMonth();
        totals[idx] += Number(t.amount);
      }
    });
    return totals;
  }, [transactions, year]);

  const data = months.map((month, i) => ({
    name: month,
    total: monthlyTotals[i],
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Projeção Anual</h3>
          <p className="text-xs text-muted-foreground">Análise avançada com IA</p>
        </div>
        <TrendingUp className="w-5 h-5 text-primary" />
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={28} style={{ borderRadius: 12 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => formatCurrency(v)} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary)/0.05)' }} />
            <Legend />
            <Bar dataKey="total" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
