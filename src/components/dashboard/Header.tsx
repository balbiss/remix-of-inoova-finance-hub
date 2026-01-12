import { motion } from 'framer-motion';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationPopover } from './NotificationPopover';
import { VenuxWrapped } from './VenuxWrapped';

export function DashboardHeader() {
  const [isDark, setIsDark] = useState(true);
  const { profile } = useAuth();

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'Usuário';
  const [showWrapped, setShowWrapped] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4"
    >
      <div>
        <p className="text-xs text-muted-foreground">{getGreeting()}</p>
        <h1 className="text-lg lg:text-xl font-bold text-foreground">
          {firstName} 👋
        </h1>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          onClick={() => setShowWrapped(true)}
          className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-xl text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all group"
        >
          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span className="text-[10px] font-black uppercase italic tracking-wider">Ver Insights</span>
        </Button>
        <NotificationPopover />
        <Button
          variant="ghost"
          size="icon"
          className="ml-2 text-muted-foreground hover:text-foreground h-8 w-8"
          onClick={toggleTheme}
          title={isDark ? 'Modo claro' : 'Modo escuro'}
        >
          {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-700" />}
        </Button>
      </div>
      <VenuxWrapped open={showWrapped} onClose={() => setShowWrapped(false)} />
    </motion.header>
  );
}
