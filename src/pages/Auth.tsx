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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-ai/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Glass Card */}
        <div className="glass-card p-5 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center gap-0 mb-2">
            <img
              src="/logo.png"
              alt="VENUX ASSESSOR"
              className="w-36 h-auto object-contain drop-shadow-lg"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-5">
            <h1 className="text-2xl font-black text-foreground mb-1 mt-1 tracking-tight uppercase italic">
              {isLogin ? 'Assuma o' : 'Jornada'} <span className="text-primary">{isLogin ? 'Controle Total' : 'PRO'}</span>
            </h1>
            <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
              {isLogin
                ? 'Entre para gerenciar suas finanças com inteligência'
                : 'A inteligência financeira que você precisava, agora no seu WhatsApp'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2.5">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <Label htmlFor="name" className="text-foreground text-xs">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 pl-9 bg-secondary/50 border-border/50 focus:border-primary text-sm"
                    disabled={loading}
                  />
                </div>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground text-xs">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 pl-9 bg-secondary/50 border-border/50 focus:border-primary text-sm"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-foreground text-xs">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 pl-9 pr-9 bg-secondary/50 border-border/50 focus:border-primary text-sm"
                  disabled={loading}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-xs text-primary hover:underline">
                  Esqueci minha senha
                </button>
              </div>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="pt-1">
              <Button type="submit" className="w-full h-11 text-sm font-bold gap-2 gradient-primary rounded-xl shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-5 h-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Entrar no Dashboard' : 'Experimentar Gratuitamente'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou continue com</span>
            </div>
          </div>

          {/* Social Login */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              className="w-full h-10 gap-1.5 border-border/50 hover:bg-secondary/50 text-sm"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <Chrome className="w-4 h-4" />
              Google
            </Button>
          </motion.div>

          {/* Toggle */}
          <p className="text-center mt-5 text-xs text-muted-foreground">
            {isLogin ? 'Novo por aqui?' : 'Já tem uma conta?'}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-primary font-bold hover:underline"
              disabled={loading}
            >
              {isLogin ? 'Criar minha conta' : 'Acessar agora'}
            </button>
          </p>

          {/* Trust Badge */}
          <div className="flex items-center justify-center gap-1.5 mt-4 opacity-50">
            <Lock className="w-3 h-3" />
            <span className="text-[10px] font-medium">Seus dados estão protegidos</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-5 text-[10px] text-muted-foreground">
          Ao continuar, você concorda com nossos{' '}
          <Link to="#" className="text-primary hover:underline">Termos</Link>
          {' '}e{' '}
          <Link to="#" className="text-primary hover:underline">Privacidade</Link>
        </p>
      </motion.div>
    </div>
  );
}
