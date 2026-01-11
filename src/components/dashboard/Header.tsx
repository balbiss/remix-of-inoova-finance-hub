import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationPopover } from './NotificationPopover';

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
    </motion.header>
  );
}
