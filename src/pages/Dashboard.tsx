import { useState } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardHeader } from '@/components/dashboard/Header';
import { KPICard } from '@/components/dashboard/KPICard';
import { BalanceChart } from '@/components/dashboard/BalanceChart';
import { AIInsightCard } from '@/components/dashboard/AIInsightCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { AddTransactionSheet } from '@/components/sheets/AddTransactionSheet';
import { AddReminderSheet } from '@/components/sheets/AddReminderSheet';
import { AddGoalSheet } from '@/components/sheets/AddGoalSheet';
import { TransferSheet } from '@/components/sheets/TransferSheet';
import { useTransactions } from '@/hooks/useTransactions';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils-format';
import { Wallet, TrendingUp, TrendingDown, Calculator } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { generateTransactionsPDF } from '@/lib/pdf-generator';
import { useProfile } from '@/hooks/useProfile';
import { useIsPro } from '@/hooks/useIsPro';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const { transactions, income, expenses, balance, isLoading } = useTransactions();
  const { profile } = useProfile();
  const { isPro } = useIsPro();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddReminder = () => {
    setShowAddReminder(true);
  };

  const handleAddGoal = () => {
    setShowAddGoal(true);
  };


  const incomePercentage = income + expenses > 0
    ? Math.round((income / (income + expenses)) * 100)
    : 0;
  const expensePercentage = 100 - incomePercentage;

  return (
    <MainLayout>
      <DashboardHeader />

      <div className="px-3 lg:px-8 py-4 lg:py-8 pb-24 lg:pb-12 space-y-4 lg:space-y-8">
        {/* Dynamic Desktop Grid: 4 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8 items-start">

          {/* Main Content Area (3/4 on Desktop) */}
          <div className="lg:col-span-3 space-y-4 lg:space-y-8">
            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-6">
              <motion.div
                className="col-span-2 lg:col-span-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {isLoading ? (
                  <Skeleton className="h-32 w-full rounded-[32px]" />
                ) : (
                  <KPICard
                    title="Saldo Atual"
                    value={formatCurrency(balance)}
                    subtitle="Disponível para uso"
                    icon={Wallet}
                    variant="primary"
                    size="large"
                    trend={{ value: 12.5, isPositive: balance >= 0 }}
                    className="rounded-[32px] shadow-lg border-none h-full"
                  />
                )}
              </motion.div>

              <div className="col-span-1">
                {isLoading ? (
                  <Skeleton className="h-32 w-full rounded-[32px]" />
                ) : (
                  <KPICard
                    title="Receitas"
                    value={formatCurrency(income)}
                    icon={TrendingUp}
                    variant="income"
                    className="rounded-[32px] border-none shadow-sm h-full"
                  />
                )}
              </div>

              <div className="col-span-1">
                {isLoading ? (
                  <Skeleton className="h-32 w-full rounded-[32px]" />
                ) : (
                  <KPICard
                    title="Despesas"
                    value={formatCurrency(expenses)}
                    icon={TrendingDown}
                    variant="expense"
                    className="rounded-[32px] border-none shadow-sm h-full"
                  />
                )}
              </div>
            </div>

            {/* Middle Section: Chart and Projection */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              <div className="lg:col-span-2">
                <BalanceChart />
              </div>
              <div className="lg:col-span-1">
                <KPICard
                  title="Previsão Final"
                  value={formatCurrency(expenses)}
                  subtitle="Estimativa do mês"
                  icon={Calculator}
                  className="rounded-[32px] shadow-sm h-full"
                >
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                      <span>Saúde Financeira</span>
                      <span className="text-primary">ESTÁVEL</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '78%' }}
                        className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
                      />
                    </div>
                  </div>
                </KPICard>
              </div>
            </div>

            {/* Desktop Recent Transactions Section */}
            <div className="hidden lg:block">
              <RecentTransactions />
            </div>
          </div>

          {/* Desktop Sticky Sidebar (1/4 on Desktop) */}
          <div className="lg:sticky lg:top-8 space-y-4 lg:space-y-6">
            <QuickActions
              onAddExpense={() => {
                if (!isPro) {
                  toast({
                    title: "Funcionalidade Premium",
                    description: "Assine o Pro para lançar despesas ilimitadas.",
                    variant: "destructive",
                  });
                  navigate('/subscription');
                  return;
                }
                setShowAddTransaction(true);
              }}
              onAddReminder={handleAddReminder}
              onAddGoal={handleAddGoal}
              onDownloadReport={async () => {
                if (!isPro) {
                  toast({
                    title: "Funcionalidade Premium",
                    description: "Relatórios PDF são exclusivos para membros PRO.",
                    variant: "destructive",
                  });
                  navigate('/subscription');
                  return;
                }
                const monthTransactions = transactions.filter(t => {
                  const date = new Date(t.date + 'T12:00:00');
                  return date >= startOfMonth(new Date()) && date <= endOfMonth(new Date());
                });
                await generateTransactionsPDF(
                  monthTransactions,
                  profile?.full_name || 'Usuário',
                  { from: startOfMonth(new Date()), to: endOfMonth(new Date()) }
                );
              }}
              className="w-full"
            />

            <AIInsightCard />

            {/* Mobile-only Recent Transactions (shown below sidebar on mobile if grid stack) */}
            <div className="lg:hidden text-center py-4">
              <RecentTransactions />
            </div>
          </div>
        </div>
      </div>

      <AddTransactionSheet
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
      />

      <AddReminderSheet
        open={showAddReminder}
        onOpenChange={setShowAddReminder}
      />

      <AddGoalSheet
        open={showAddGoal}
        onOpenChange={setShowAddGoal}
      />

      <TransferSheet
        open={showTransfer}
        onOpenChange={setShowTransfer}
      />
    </MainLayout>
  );
}
