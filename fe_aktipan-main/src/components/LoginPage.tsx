import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, Lock, Eye, EyeOff, Shield, Sparkles, ArrowRight, 
  CheckCircle2, AlertCircle, ArrowLeft, Laptop, ChevronRight
} from 'lucide-react';
import { authApi } from '../services/api';
import { sound } from '../utils/sound';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginPageProps {
  onLoginSuccess: (role: string, name: string, userObj?: any) => void;
  onNavigate: (view: string) => void;
  redirectTarget?: string | null;
}

export default function LoginPage({
  onLoginSuccess,
  onNavigate,
  redirectTarget
}: LoginPageProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Harap masukkan alamat email yang valid.');
      return;
    }

    if (!password) {
      setError('Password wajib diisi.');
      return;
    }

    setIsLoading(true);
    sound.playClick();

    try {
      const res = await authApi.login({
        email: email.trim(),
        password
      });

      if (res.success && res.user) {
        sound.playSuccess();
        onLoginSuccess(res.user.role || 'Trainer', res.user.name, res.user);
      } else {
        sound.playClick();
        setError(res.message || 'Kombinasi email atau password salah. Pastikan data akun Anda benar.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string, roleName: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setIsLoading(true);
    sound.playSparkle();

    try {
      const res = await authApi.login({
        email: demoEmail,
        password: demoPass
      });

      if (res.success && res.user) {
        sound.playSuccess();
        onLoginSuccess(res.user.role || roleName, res.user.name, res.user);
      } else {
        setError(res.message || 'Gagal login otomatis.');
      }
    } catch (err: any) {
      setError('Gagal login: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl relative overflow-hidden"
      >
        {/* Background glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-500/20 to-orange-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-amber-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Back navigation & Brand */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('public-home')}
            className="inline-flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {t('Beranda')}
          </button>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/40">
            AKTIPAN AUTH
          </span>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 mb-1">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Masuk ke Akun Anda
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {redirectTarget === 'admin'
              ? 'Panel Administrator membutuhkan otorisasi. Silakan masuk terlebih dahulu.'
              : 'Akses 132+ aktivitas interaktif, AI generator, dan sesi acara Anda.'}
          </p>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300"
          >
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Alamat Email</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Password</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-button"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="space-y-3 pt-2">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
              Pintasan Uji Coba Cepat
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              id="quick-admin-login-btn"
              type="button"
              onClick={() => handleQuickLogin('admin@aktipan.com', 'admin123', 'Admin')}
              className="p-2.5 rounded-xl border border-amber-300/80 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Super Admin
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block mt-0.5 truncate">admin@aktipan.com</span>
            </button>

            <button
              id="quick-trainer-login-btn"
              type="button"
              onClick={() => handleQuickLogin('andika@aktipan.com', 'password123', 'Trainer')}
              className="p-2.5 rounded-xl border border-blue-300/80 dark:border-blue-700/60 bg-blue-50/70 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                  <Laptop className="h-3.5 w-3.5 text-blue-500" />
                  Trainer Demo
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block mt-0.5 truncate">andika@aktipan.com</span>
            </button>
          </div>
        </div>

        {/* Footer switch to Register */}
        <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          Belum memiliki akun?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Daftar Akun Baru Sekarang
          </button>
        </div>
      </motion.div>
    </div>
  );
}
