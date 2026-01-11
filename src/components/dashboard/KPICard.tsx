import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'income' | 'expense' | 'ai';
  size?: 'default' | 'large';
  className?: string;
  children?: ReactNode;
}

const variants = {
  default: 'bg-card border border-border',
  primary: 'gradient-primary text-primary-foreground',
  income: 'bg-income/10 border border-income/20',
  expense: 'bg-expense/10 border border-expense/20',
  ai: 'gradient-ai text-ai-foreground',
};

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  size = 'default',
  className,
  children,
}: KPICardProps) {
  const isLarge = size === 'large';
  const isPrimaryOrAi = variant === 'primary' || variant === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-xl p-3 lg:p-4 transition-all duration-300 hover-lift',
        variants[variant],
        isLarge && 'p-4 lg:p-5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className={cn(
            'text-xs font-medium',
            isPrimaryOrAi ? 'text-white/80' : 'text-muted-foreground'
          )}>
            {title}
          </p>
          <p className={cn(
            'font-bold financial-number',
            isLarge ? 'text-xl lg:text-2xl' : 'text-lg lg:text-xl',
            isPrimaryOrAi ? 'text-white' : 'text-foreground',
            variant === 'income' && 'text-income',
            variant === 'expense' && 'text-expense'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              'text-[11px]',
              isPrimaryOrAi ? 'text-white/70' : 'text-muted-foreground'
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={cn(
              'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium mt-1',
              trend.isPositive 
                ? 'bg-income/20 text-income' 
                : 'bg-expense/20 text-expense'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn(
            'p-2 rounded-lg',
            isPrimaryOrAi ? 'bg-white/20' : 'bg-secondary'
          )}>
            <Icon className={cn(
              'w-4 h-4',
              isPrimaryOrAi ? 'text-white' : 'text-foreground'
            )} />
          </div>
        )}
      </div>
      {children}
    </motion.div>
  );
}
