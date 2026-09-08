import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, Sparkles, ArrowRight, 
  AlertCircle, ArrowLeft, Laptop, Mic, MessageSquare, Briefcase, GraduationCap, Calendar
} from 'lucide-react';
import { authApi } from '../services/api';
import { sound } from '../utils/sound';
import { useLanguage } from '../contexts/LanguageContext';

interface RegisterPageProps {
  onRegisterSuccess: (role: string, name: string, userObj?: any) => void;
  onNavigate: (view: string) => void;
  onOpenTerms?: (tab: 'terms' | 'privacy') => void;
}

export default function RegisterPage({
  onRegisterSuccess,
  onNavigate,
  onOpenTerms
}: RegisterPageProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Trainer');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { value: 'Trainer', label: 'Trainer', icon: Laptop },
    { value: 'MC / Host', label: 'MC / Host', icon: Mic },
    { value: 'Fasilitator', label: 'Fasilitator', icon: MessageSquare },
    { value: 'HR / L&D', label: 'HR / L&D', icon: Briefcase },
    { value: 'Guru / Dosen', label: 'Guru / Dosen', icon: GraduationCap },
    { value: 'EO', label: 'Event Organizer', icon: Calendar },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Silakan masukkan nama lengkap Anda.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Silakan masukkan alamat email yang valid.');
      return;
    }

    if (!phone.trim()) {
      setError('Silakan masukkan nomor telepon / WhatsApp Anda.');
      return;
    }

    if (password.length < 6) {
      setError('Password harus memiliki minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    if (!agreedToTerms) {
      setError('Anda harus menyetujui Syarat dan Ketentuan layanan.');
      return;
    }

    setIsLoading(true);
    sound.playClick();

    try {
      const res = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        whatsapp: phone.trim(),
        password,
        role: selectedRole
      });

      if (res.success && res.user) {
        sound.playSuccess();
        onRegisterSuccess(res.user.role || selectedRole, res.user.name, res.user);
      } else {
        sound.playClick();
        setError(res.message || 'Gagal mendaftar akun. Silakan coba lagi.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan pada server saat pendaftaran.');
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
        className="max-w-lg w-full space-y-6 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl relative overflow-hidden"
      >
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Back navigation & Tag */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('public-home')}
            className="inline-flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {t('Beranda')}
          </button>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
            PENDAFTARAN AKUN
          </span>
        </div>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 mb-1">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Buat Akun AKTIPAN
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Gabung bersama ribuan fasilitator, trainer, dan MC untuk memandu game acara interaktif kelas dunia.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nomor WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="register-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 812-xxxx-xxxx"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Peran Utama Anda
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setSelectedRole(r.value)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/80 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 ring-2 ring-orange-500/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-orange-500' : 'text-slate-400'}`} />
                    <span className="text-[11px] font-bold truncate">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 karakter"
                  required
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  required
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
            <input
              id="register-terms-check"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
            />
            <label htmlFor="register-terms-check" className="cursor-pointer">
              Saya menyetujui{' '}
              <button
                type="button"
                onClick={() => onOpenTerms && onOpenTerms('terms')}
                className="text-orange-600 dark:text-orange-400 underline font-bold"
              >
                Syarat & Ketentuan
              </button>{' '}
              AKTIPAN.
            </label>
          </div>

          <button
            id="register-submit-button"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-block animate-spin h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full" />
            ) : (
              <>
                <span>Daftar Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch to Login */}
        <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          Sudah memiliki akun?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Masuk ke Akun Anda
          </button>
        </div>
      </motion.div>
    </div>
  );
}
