import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency, formatDate } from '@/lib/utils-format';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import { ChevronRight, Receipt } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const categoryIcons: Record<string, string> = {
  'Alimentação': 'UtensilsCrossed',
  'Transporte': 'Car',
  'Mercado': 'ShoppingCart',
  'Contas': 'Zap',
  'Streaming': 'Tv',
  'Trabalho': 'Briefcase',
  'Salário': 'Briefcase',
  'Freelance': 'Palette',
  'Saúde': 'Heart',
  'Compras': 'Package',
  'Outros': 'Circle',
};

export function RecentTransactions() {
  const { transactions, isLoading } = useTransactions();
  const recentTransactions = transactions.slice(0, 5);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-3 w-24 mb-1" />
                <Skeleton className="h-2 w-16" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card border border-border rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Transações Recentes</h3>
        <Link 
          to="/transactions" 
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-0.5"
        >
          Ver todas
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recentTransactions.length === 0 ? (
        <div className="text-center py-8">
          <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma transação ainda</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Adicione sua primeira transação clicando no +
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {recentTransactions.map((transaction, index) => {
            const iconName = categoryIcons[transaction.category] || 'Circle';
            // @ts-ignore
            const Icon = Icons[iconName] || Icons.Circle;

            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className={cn(
                  'p-1.5 rounded-lg',
                  transaction.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                )}>
                  <Icon className={cn(
                    'w-3.5 h-3.5',
                    transaction.type === 'income' ? 'text-income' : 'text-expense'
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{transaction.description}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {transaction.category} • {transaction.date ? formatDate(transaction.date) : ''}
                  </p>
                </div>

                <p className={cn(
                  'font-semibold financial-number text-sm',
                  transaction.type === 'income' ? 'text-income' : 'text-expense'
                )}>
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(Number(transaction.amount))}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
