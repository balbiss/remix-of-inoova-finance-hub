import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, Chrome, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, user } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate('/dashboard');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Bem-vindo de volta!');
          navigate('/dashboard');
        }
      } else {
        if (!name.trim()) {
          toast.error('Por favor, insira seu nome');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, name);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Conta criada! Verifique seu email para confirmar.');
        }
      }
    } catch (err) {
      toast.error('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-2 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden opacity-50">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-ai/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10 -mt-6"
      >
        {/* Glass Card */}
        <div className="glass-card pt-3 pb-4 px-5 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center gap-0 mb-1">
            <img
              src="/logo.png"
              alt="VENUX ASSESSOR"
              className="w-24 h-auto object-contain drop-shadow-lg"
            />
          </div>

          {/* Title - Compacted */}
          <div className="text-center mb-3">
            <h1 className="text-xl font-black text-foreground mb-0.5 mt-0.5 tracking-tight uppercase italic">
              {isLogin ? 'Assuma o' : 'Jornada'} <span className="text-primary">{isLogin ? 'Controle Total' : 'PRO'}</span>
            </h1>
            <p className="text-[10px] text-muted-foreground max-w-[180px] mx-auto leading-tight">
              {isLogin
                ? 'Entre para gerenciar suas finanças com inteligência'
                : 'A inteligência financeira no seu WhatsApp'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1"
              >
                <Label htmlFor="name" className="text-foreground text-[10px] uppercase font-bold tracking-wider">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9 pl-9 bg-secondary/50 border-border/50 focus:border-primary text-xs"
                    disabled={loading}
                  />
                </div>
              </motion.div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email" className="text-foreground text-[10px] uppercase font-bold tracking-wider">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 pl-9 bg-secondary/50 border-border/50 focus:border-primary text-xs"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-foreground text-[10px] uppercase font-bold tracking-wider">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 pl-9 pr-9 bg-secondary/50 border-border/50 focus:border-primary text-xs"
                  disabled={loading}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-[10px] text-primary hover:underline font-medium">
                  Esqueci minha senha
                </button>
              </div>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-0.5">
              <Button type="submit" className="w-full h-10 text-xs font-bold gap-2 gradient-primary rounded-lg shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Entrar no Dashboard' : 'Experimentar Grátis'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[9px] uppercase font-bold">
              <span className="bg-card px-2 text-muted-foreground/60 tracking-widest">OU</span>
            </div>
          </div>

          {/* Social Login */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              className="w-full h-9 gap-1.5 border-border/50 hover:bg-secondary/50 text-xs"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <Chrome className="w-3.5 h-3.5" />
              Google
            </Button>
          </motion.div>

          {/* Toggle */}
          <p className="text-center mt-4 text-[11px] text-muted-foreground font-medium">
            {isLogin ? 'Novo por aqui?' : 'Já tem uma conta?'}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-primary font-bold hover:underline"
              disabled={loading}
            >
              {isLogin ? 'Criar conta' : 'Acessar agora'}
            </button>
          </p>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-1 mt-3 opacity-40">
            <Lock className="w-2.5 h-2.5" />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Dados Protegidos</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-3 text-[9px] text-muted-foreground/60 leading-tight">
          Ao continuar, você concorda com nossos{' '}
          <Link to="#" className="text-primary hover:underline">Termos</Link>
          {' '}e{' '}
          <Link to="#" className="text-primary hover:underline">Privacidade</Link>
        </div>
      </motion.div>
    </div>
  );
}
