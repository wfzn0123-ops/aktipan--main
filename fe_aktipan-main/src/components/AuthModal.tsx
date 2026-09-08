import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Mail, Lock, User, Sparkles, CheckCircle2, 
  GraduationCap, Mic, Briefcase, Calendar, MessageSquare, Laptop, ArrowRight,
  Phone, Eye, EyeOff, Shield
} from 'lucide-react';
import { sound } from '../utils/sound';
import { useLanguage } from '../contexts/LanguageContext';
import { authApi } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: string, name: string, userObj?: any) => void;
  initialTab?: 'login' | 'register';
  onOpenTerms?: (tab: 'terms' | 'privacy') => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'login',
  onOpenTerms
}: AuthModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Trainer');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(true);

  const roles = [
    { value: 'Trainer', label: 'Trainer', desc: 'Pelatih & Pembicara', icon: Laptop, color: 'text-blue-500 bg-blue-50 border-blue-200' },
    { value: 'MC / Host', label: 'MC / Host', desc: 'Pemandu Acara', icon: Mic, color: 'text-orange-500 bg-orange-50 border-orange-200' },
    { value: 'Fasilitator', label: 'Fasilitator', desc: 'Pemandu Kelompok', icon: MessageSquare, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
    { value: 'HR / L&D', label: 'HR / L&D', desc: 'Corporate HRD', icon: Briefcase, color: 'text-purple-500 bg-purple-50 border-purple-200' },
    { value: 'Guru / Dosen', label: 'Guru / Dosen', desc: 'Pendidik Akademik', icon: GraduationCap, color: 'text-cyan-500 bg-cyan-50 border-cyan-200' },
    { value: 'EO', label: 'Event Organizer', desc: 'Penyelenggara Acara', icon: Calendar, color: 'text-rose-500 bg-rose-50 border-rose-200' },
    { value: 'Admin', label: 'Admin', desc: 'Administrator Sistem', icon: Shield, color: 'text-amber-500 bg-amber-50 border-amber-200' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validations
    if (activeTab === 'register' && !name.trim()) {
      setError('Silakan masukkan nama lengkap Anda.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Silakan masukkan alamat email yang valid.');
      return;
    }
    if (activeTab === 'register' && !phone.trim()) {
      setError('Silakan masukkan nomor telepon Anda.');
      return;
    }
    if (password.length < 6) {
      setError('Password harus memiliki minimal 6 karakter.');
      return;
    }
    if (activeTab === 'register' && password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }
    if (activeTab === 'register' && (!agreedToTerms || !agreedToPrivacy)) {
      setError('Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi.');
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        const res = await authApi.login({
          email: email.trim(),
          password
        });

        if (res.success && res.user) {
          sound.playSuccess();
          onSuccess(res.user.role || 'Trainer', res.user.name, res.user);
        } else {
          sound.playClick();
          setError(res.message || 'Gagal masuk. Periksa kembali email dan password Anda.');
        }
      } else {
        const res = await authApi.register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          role: selectedRole
        });

        if (res.success && res.user) {
          sound.playSparkle();
          onSuccess(res.user.role || selectedRole, res.user.name, res.user);
        } else {
          sound.playClick();
          setError(res.message || 'Gagal mendaftar. Silakan coba kembali.');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError('Terjadi kesalahan koneksi dengan server backend be_aktipan-main.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick preset login handler
  const handleQuickLogin = async (targetEmail: string, targetPass: string, defaultRole: string, defaultName: string) => {
    sound.playClick();
    setIsLoading(true);
    setError(null);

    try {
      const res = await authApi.login({
        email: targetEmail,
        password: targetPass
      });

      if (res.success && res.user) {
        sound.playSuccess();
        onSuccess(res.user.role || defaultRole, res.user.name, res.user);
      } else {
        // Fallback demo mock if backend not active
        sound.playSparkle();
        onSuccess(defaultRole, defaultName, { role: defaultRole, name: defaultName, email: targetEmail });
      }
    } catch (e) {
      onSuccess(defaultRole, defaultName, { role: defaultRole, name: defaultName, email: targetEmail });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="auth-modal-overlay" className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        {/* Modal Window Container */}
        <motion.div
          id="auth-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[95vh] overflow-y-auto"
        >
          {/* Header Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-orange-500" />

          {/* Close button */}
          <button
            id="close-auth-modal"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Modal Content */}
          <div className="p-6 md:p-8">
            {/* Logo and Greeting */}
            <div className="flex items-center space-x-2.5 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-orange-500 shadow-sm">
                <span className="text-white text-xs font-black">⚡</span>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">
                  AKTI<span className="text-orange-500">PAN</span> WORKSPACE
                </h3>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                  SaaS Premium Active & Fun Games
                </span>
              </div>
            </div>

            {/* Tab Switched Header */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
              <button
                id="tab-login-btn"
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveTab('login');
                  setError(null);
                }}
                className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'border-blue-600 text-blue-600 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {t('Masuk Akun')}
              </button>
              <button
                id="tab-register-btn"
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveTab('register');
                  setError(null);
                }}
                className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'border-blue-600 text-blue-600 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {t('Daftar Baru')}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div id="auth-error-block" className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2">
                <span className="font-bold">⚠️</span>
                <span>{t(error)}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {activeTab === 'register' && (
                <div className="space-y-1">
                  <label htmlFor="reg-name" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">{t('Nama Lengkap')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      id="reg-name"
                      type="text"
                      placeholder={t('Masukkan nama lengkap Anda')}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="auth-email" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">{t('Alamat Email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {activeTab === 'register' && (
                <div className="space-y-1">
                  <label htmlFor="reg-phone" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">{t('Nomor Telepon / WhatsApp')}</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      id="reg-phone"
                      type="tel"
                      placeholder="Cth: 08123456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>
              )}

              {activeTab === 'login' ? (
                <div className="space-y-1">
                  <label htmlFor="auth-password" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">{t('Password')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      id="auth-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label htmlFor="reg-password" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">{t('Password')}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        id="reg-password"
                        type={showRegPassword ? "text" : "password"}
                        placeholder="Minimal 6 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="reg-confirm-password" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">{t('Konfirmasi Password')}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        id="reg-confirm-password"
                        type={showRegConfirmPassword ? "text" : "password"}
                        placeholder="Ulangi password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none cursor-pointer"
                      >
                        {showRegConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Roles Selector Section */}
              {activeTab === 'register' && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="auth-role" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      {t('Pilih Professional Role')}
                    </label>
                  </div>
                  
                  <div className="relative">
                    <select
                      id="auth-role"
                      value={selectedRole}
                      onChange={(e) => {
                        sound.playClick();
                        setSelectedRole(e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer appearance-none"
                      required
                    >
                      {roles.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label} ({r.desc})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Action Submit Button */}
              <button
                id="auth-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{activeTab === 'login' ? t('Masuk ke Akun') : t('Selesaikan Pendaftaran')}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>

              {/* 1-Click Quick Testing Accounts */}
              {activeTab === 'login' && (
                <div className="pt-2 space-y-2">
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold">
                      <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-mono">Uji Coba 1-Klik Cepat</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="quick-login-admin-btn"
                      type="button"
                      onClick={() => handleQuickLogin('admin@aktipan.com', 'admin123', 'Admin', 'Super Admin Aktipan')}
                      className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-left transition-all cursor-pointer text-xs"
                    >
                      <div className="font-extrabold flex items-center gap-1">
                        <span>👑</span> Masuk Admin
                      </div>
                      <div className="text-[9px] text-amber-600 dark:text-amber-400 font-mono">admin@aktipan.com</div>
                    </button>

                    <button
                      id="quick-login-trainer-btn"
                      type="button"
                      onClick={() => handleQuickLogin('andika@aktipan.com', 'password123', 'Trainer', 'Andika Pratama')}
                      className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-left transition-all cursor-pointer text-xs"
                    >
                      <div className="font-extrabold flex items-center gap-1">
                        <span>🎯</span> Masuk Trainer
                      </div>
                      <div className="text-[9px] text-blue-600 dark:text-blue-400 font-mono">andika@aktipan.com</div>
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center pt-2">
                <p className="text-[10px] text-slate-400 font-medium">
                  {activeTab === 'login' ? t('Belum punya akun?') : t('Sudah memiliki akun?')}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setActiveTab(activeTab === 'login' ? 'register' : 'login');
                      setError(null);
                    }}
                    className="text-blue-600 font-extrabold hover:underline cursor-pointer"
                  >
                    {activeTab === 'login' ? t('Daftar Sekarang') : t('Masuk di Sini')}
                  </button>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
