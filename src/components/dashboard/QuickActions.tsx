import { motion } from 'framer-motion';
import { Plus, Bell, Target, ArrowRightLeft, FileDown } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: typeof Plus;
  label: string;
  color: 'primary' | 'expense' | 'ai' | 'income';
  onClick?: () => void;
}

import { useNavigate } from 'react-router-dom';

const actions: QuickAction[] = [
  { icon: Plus, label: 'Gasto', color: 'expense' },
  { icon: Bell, label: 'Alerta', color: 'ai' },
  { icon: Icons.ShoppingBag, label: 'Assinaturas', color: 'primary' },
  { icon: Icons.FileDown, label: 'Relatório', color: 'income' },
];

const colorClasses = {
  primary: 'text-primary bg-primary/10',
  expense: 'text-destructive bg-destructive/10',
  ai: 'text-ai bg-ai/10',
  income: 'text-income bg-income/10',
};

interface QuickActionsProps {
  onAddExpense?: () => void;
  onAddReminder?: () => void;
  onAddGoal?: () => void;
  onDownloadReport?: () => void;
  className?: string;
}

export function QuickActions({ onAddExpense, onAddReminder, onAddGoal, onDownloadReport, className }: QuickActionsProps) {
  const navigate = useNavigate();

  const handleActionClick = (label: string) => {
    switch (label) {
      case 'Gasto': onAddExpense?.(); break;
      case 'Alerta': onAddReminder?.(); break;
      case 'Meta': onAddGoal?.(); break;
      case 'Relatório': onDownloadReport?.(); break;
      case 'Assinaturas': navigate('/my-subscriptions'); break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={cn("flex justify-around items-center w-full h-full", className)}
    >
      <div className="flex justify-around items-center w-full bg-card/50 dark:bg-card/20 backdrop-blur-sm border sm:border-border rounded-[32px] p-4 sm:p-6 shadow-sm">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleActionClick(action.label)}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border border-transparent group-active:scale-90',
                colorClasses[action.color]
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
                {action.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
