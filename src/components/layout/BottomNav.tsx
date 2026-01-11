import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  Bell,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/transactions', label: 'Extrato', icon: ArrowLeftRight },
  { path: '/reminders', label: 'Alertas', icon: Bell },
  { path: '/profile', label: 'Perfil', icon: User },
];

interface BottomNavProps {
  onAddClick?: () => void;
}

export function BottomNav({ onAddClick }: BottomNavProps) {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border/50 safe-area-bottom pb-4">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto relative h-16">
        {navItems.slice(0, 2).map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 transition-all duration-300 relative flex-1',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('w-6 h-6', isActive && 'stroke-[2.5]')} />
              <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
              {isActive && (
                <motion.div layoutId="nav-glow" className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full blur-[1px]" />
              )}
            </NavLink>
          );
        })}

        <div className="flex-1 flex justify-center">
          <button onClick={onAddClick} className="relative -mt-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-[0_8px_20px_rgba(var(--primary-rgb),0.3)] border-4 border-background"
            >
              <Plus className="w-6 h-6 text-primary-foreground stroke-[3]" />
            </motion.div>
          </button>
        </div>

        {navItems.slice(2).map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 transition-all duration-300 relative flex-1',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('w-6 h-6', isActive && 'stroke-[2.5]')} />
              <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
              {isActive && (
                <motion.div layoutId="nav-glow" className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full blur-[1px]" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
