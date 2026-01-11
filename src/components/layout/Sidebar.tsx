import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, ArrowLeftRight, Bell, Target, User, LogOut, Sparkles, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const financeItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transações', icon: ArrowLeftRight },
  { path: '/reminders', label: 'Assistente IA', icon: Sparkles },
  { path: '/goals', label: 'Metas', icon: Target },
];

const accountItems = [
  { path: '/subscription', label: 'Assinatura', icon: CreditCard },
  { path: '/profile', label: 'Perfil', icon: User },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        'hidden lg:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      <div className="h-14 flex items-center justify-between px-3 border-b border-sidebar-border">
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/dashboard')}
          animate={{ opacity: 1 }}
        >
          {!collapsed ? (
            <span className="font-black text-lg tracking-tighter text-sidebar-foreground uppercase">
              VENUX <span className="text-primary">ASSESSOR</span>
            </span>
          ) : (
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
              <span className="text-white font-black text-xs">V</span>
            </div>
          )}
        </motion.div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-sidebar-foreground hover:bg-sidebar-accent" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </Button>
      </div>

      <nav className="flex-1 p-3 space-y-4">
        <div className="space-y-1">
          {!collapsed && <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest px-3 mb-2">Financeiro</p>}
          {financeItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                  isActive ? 'bg-primary text-primary-foreground shadow-md' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        <div className="space-y-1">
          {!collapsed && <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest px-3 mb-2">Conta</p>}
          {accountItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                  isActive ? 'bg-primary text-primary-foreground shadow-md' : 'text-sidebar-foreground hover:bg-sidebar-accent'
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button onClick={handleLogout} className={cn('flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 w-full text-expense hover:bg-expense/10')}>
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Sair</span>}
        </button>
      </div>
    </motion.aside>
  );
}
