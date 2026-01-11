import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageCircle, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useGoals } from '@/hooks/useGoals';
import { formatCurrency } from '@/lib/utils-format';
import { Button } from '@/components/ui/button';

interface Insight {
  id: string;
  message: string;
  type: 'warning' | 'success' | 'tip';
}

export function AIInsightCard() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { transactions, income, expenses } = useTransactions();
  const { goals } = useGoals();

  // Generate dynamic insights based on real data
  const insights = useMemo<Insight[]>(() => {
    const generatedInsights: Insight[] = [];

    // No data insight
    if (transactions.length === 0) {
      return [{
        id: 'empty',
        message: 'Adicione suas transações para receber insights personalizados sobre seus gastos! 📊',
        type: 'tip' as const,
      }];
    }

    // Expense vs Income insight
    if (expenses > income && income > 0) {
      generatedInsights.push({
        id: 'overspending',
        message: `Cuidado! Suas despesas (${formatCurrency(expenses)}) estão maiores que suas receitas este mês. 📉`,
        type: 'warning',
      });
    } else if (income > expenses && expenses > 0) {
      const savings = income - expenses;
      const savingsPercentage = Math.round((savings / income) * 100);
      generatedInsights.push({
        id: 'savings',
        message: `Parabéns! Você economizou ${savingsPercentage}% da sua renda este mês (${formatCurrency(savings)})! 🎉`,
        type: 'success',
      });
    }

    // Category analysis
    const categoryExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryExpenses)
      .sort((a, b) => b[1] - a[1])[0];

    if (topCategory && expenses > 0) {
      const percentage = Math.round((topCategory[1] / expenses) * 100);
      if (percentage > 40) {
        generatedInsights.push({
          id: 'top-category',
          message: `${topCategory[0]} representa ${percentage}% dos seus gastos (${formatCurrency(topCategory[1])}). Considere otimizar! 💡`,
          type: 'warning',
        });
      }
    }

    // Goals insight
    const activeGoals = goals.filter(g => {
      const saved = Number(g.saved_amount) || 0;
      const target = Number(g.target_amount);
      return saved < target;
    });

    if (activeGoals.length > 0) {
      const goal = activeGoals[0];
      const progress = Math.round((Number(goal.saved_amount || 0) / Number(goal.target_amount)) * 100);
      generatedInsights.push({
        id: 'goal-progress',
        message: `Sua meta "${goal.title}" está em ${progress}%. Continue assim! 🎯`,
        type: progress > 50 ? 'success' : 'tip',
      });
    }

    // Default tip if no specific insights
    if (generatedInsights.length === 0) {
      generatedInsights.push({
        id: 'default',
        message: 'Continue registrando suas transações para receber análises mais precisas! 📈',
        type: 'tip',
      });
    }

    return generatedInsights;
  }, [transactions, income, expenses, goals]);

  useEffect(() => {
    if (insights.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % insights.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [insights.length]);

  const currentInsight = insights[currentIndex];

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'success': return TrendingUp;
      default: return Target;
    }
  };

  const InsightIcon = getIcon(currentInsight.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="relative overflow-hidden bg-card border border-border rounded-xl p-4"
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-ai/20 via-transparent to-primary/20 opacity-30" />
      
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-ai/20 blur-2xl"
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-ai/10">
            <Sparkles className="w-3.5 h-3.5 text-ai" />
          </div>
          <span className="text-xs font-semibold text-ai">Insights IA</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentInsight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="min-h-[48px] flex items-center gap-2"
          >
            <InsightIcon className={`w-4 h-4 flex-shrink-0 ${
              currentInsight.type === 'warning' ? 'text-expense' :
              currentInsight.type === 'success' ? 'text-income' : 'text-primary'
            }`} />
            <p className="text-sm text-foreground leading-snug">
              {currentInsight.message}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-3">
          {/* Dots indicator */}
          {insights.length > 1 && (
            <div className="flex gap-1">
              {insights.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-ai' : 'bg-secondary'
                  }`}
                />
              ))}
            </div>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-ai hover:text-ai hover:bg-ai/10 h-7 px-2 ml-auto"
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            Conversar
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
