import { ReactNode, useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { VenuxAgent } from '@/components/VenuxAgent';
import { AddTransactionSheet } from '@/components/sheets/AddTransactionSheet';
import { useIsPro } from '@/hooks/useIsPro';
import { UpgradeDialog } from '@/components/UpgradeDialog';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { isPro } = useIsPro();

  const handleAddClick = () => {
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }
    setShowAddTransaction(true);
  };

  // Alternância de tema
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <InstallPrompt />
      <Sidebar />
      <VenuxAgent />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto pb-24 lg:pb-0 w-full overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1600px] h-full">
            {children}
          </div>
        </main>
        <BottomNav onAddClick={handleAddClick} />
        <AddTransactionSheet
          open={showAddTransaction}
          onOpenChange={setShowAddTransaction}
        />
        <UpgradeDialog
          open={showUpgrade}
          onOpenChange={setShowUpgrade}
          feature="adicionar transações"
        />
      </div>
    </div>
  );
}
