import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { ptBR } from 'date-fns/locale';
import { useBalanceHistory } from '@/hooks/useTransactions';
import { formatCurrency } from '@/lib/utils-format';
import { TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-primary">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function BalanceChart() {
  const [period, setPeriod] = useState<'7D' | '30D' | '90D' | 'CUSTOM'>('30D');
  const [customRange, setCustomRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const customRangeStarted = period === 'CUSTOM' && (customRange.start || customRange.end);
  const customRangeComplete = period !== 'CUSTOM' || (customRange.start && customRange.end);
  const { data: balanceHistory, isLoading } = useBalanceHistory(period);

    if (isLoading || (period === 'CUSTOM' && !customRangeComplete)) {
      const startedRange = customRange.start || customRange.end;
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-4 h-64"
        >
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-40 w-full rounded-lg" />
          {period === 'CUSTOM' && startedRange && !customRangeComplete && (
            <div className="text-center text-xs text-muted-foreground mt-2">Selecione o início e o fim do período para visualizar o gráfico.</div>
          )}
        </motion.div>
      );
  }

  const hasData = balanceHistory && balanceHistory.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card border border-border rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Evolução do Saldo</h3>
          <p className="text-[11px] text-muted-foreground">
              {period === 'CUSTOM' && customRange.start && customRange.end ? `De ${customRange.start.toLocaleDateString()} até ${customRange.end.toLocaleDateString()}` : `Últimos ${period === '7D' ? '7 dias' : period === '30D' ? '30 dias' : '90 dias'}`}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {['7D', '30D', '90D'].map((p) => (
            <button
              key={p}
              onClick={() => { setPeriod(p as '7D' | '30D' | '90D'); setCustomRange({ start: null, end: null }); }}
              className={
                period === p
                  ? 'bg-primary text-primary-foreground px-2 py-0.5 rounded-full'
                  : 'text-muted-foreground px-2 py-0.5 rounded-full hover:bg-secondary transition-colors'
              }
              style={{ outline: 'none', border: 'none', background: 'none', cursor: 'pointer' }}
              type="button"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
        {period === 'CUSTOM' && <></>}

      {!hasData ? (
        <div className="h-40 flex flex-col items-center justify-center">
          <TrendingUp className="w-10 h-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Sem dados suficientes</p>
          <p className="text-xs text-muted-foreground">Adicione transações para ver o gráfico</p>
        </div>
      ) : (
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={balanceHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#balanceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
