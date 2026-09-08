import React, { useState } from 'react';
import { 
  Settings, Sun, Moon, Volume2, VolumeX, ShieldAlert, Download, RefreshCw, 
  UploadCloud, Star, MessageSquare, Send, Languages, Sparkles, HelpCircle, AlertTriangle, FileCheck
} from 'lucide-react';
import { sound } from '../utils/sound';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsViewProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  language: 'id' | 'en';
  onLanguageToggle: () => void;
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
  onResetData: () => void;
  onRestoreData: () => void;
  onBackupData: () => void;
  onImportBackup: (jsonData: string) => boolean;
  triggerToast: (msg: string) => void;
}

export default function SettingsView({
  theme,
  onThemeToggle,
  language,
  onLanguageToggle,
  soundEnabled,
  onSoundToggle,
  onResetData,
  onRestoreData,
  onBackupData,
  onImportBackup,
  triggerToast
}: SettingsViewProps) {
  const { t } = useLanguage();
  
  // Modal states
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Feedback form states
  const [feedbackCategory, setFeedbackCategory] = useState('General');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackHoverRating, setFeedbackHoverRating] = useState<number | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File import state
  const [importingJson, setImportingJson] = useState<string | null>(null);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMsg.trim() || !feedbackSubject.trim()) {
      sound.playFail();
      triggerToast('⚠️ ' + t('Harap lengkapi subjek dan pesan feedback Anda!'));
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      sound.playSuccess();
      setFeedbackSubmitted(true);
      setIsSubmitting(false);
      triggerToast('🎉 ' + t('Feedback Anda berhasil dikirim! Terima kasih.'));
      // Reset form
      setFeedbackSubject('');
      setFeedbackMsg('');
      setFeedbackRating(5);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        sound.playFail();
        setFileError(t('Hanya file .json yang diperbolehkan!'));
        return;
      }
      setFileError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          // Validate if JSON parses correctly
          JSON.parse(content);
          setImportingJson(content);
        } catch (err) {
          sound.playFail();
          setFileError(t('File JSON tidak valid atau rusak!'));
        }
      };
      reader.readAsText(file);
    }
  };

  const executeImport = () => {
    if (importingJson) {
      const success = onImportBackup(importingJson);
      if (success) {
        sound.playFanfare();
        setImportingJson(null);
        triggerToast('✅ ' + t('Backup data berhasil dipulihkan dari file JSON!'));
      } else {
        sound.playFail();
        setFileError(t('Format backup tidak cocok dengan skema sistem!'));
      }
    }
  };

  return (
    <div id="saas-aktipan-settings-page" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-300">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                {t('Pengaturan Sistem')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('Kustomisasi preferensi tampilan, notifikasi suara, serta kelola keamanan data.')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Preferences & Data Control */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section 1: Preferensi Aplikasi */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              {t('Preferensi & Tampilan')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Theme Toggle Button Card */}
              <div className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col justify-between min-h-[110px]">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">{t('Tema Aplikasi')}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                    {theme === 'dark' ? t('Tema Gelap / Dark Mode') : t('Tema Terang / Light Mode')}
                  </span>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    onThemeToggle();
                  }}
                  className="mt-3 w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-lg flex items-center justify-center gap-2 font-bold text-xs text-slate-700 dark:text-slate-300 shadow-3xs cursor-pointer transition-colors"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
                      <span>{t('Ganti ke Terang')}</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-blue-500" />
                      <span>{t('Ganti ke Gelap')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Language Selector Button Card */}
              <div className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col justify-between min-h-[110px]">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">{t('Bahasa Platform')}</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                    {language === 'id' ? 'Bahasa Indonesia (ID)' : 'English (EN)'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    onLanguageToggle();
                  }}
                  className="mt-3 w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-lg flex items-center justify-center gap-2 font-bold text-xs text-slate-700 dark:text-slate-300 shadow-3xs cursor-pointer transition-colors"
                >
                  <Languages className="w-4 h-4 text-blue-500" />
                  <span>{language === 'id' ? t('Ubah ke English') : t('Ubah ke Indonesia')}</span>
                </button>
              </div>

              {/* Sound Toggle Button Card */}
              <div className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col justify-between min-h-[110px] md:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">{t('Suara Notifikasi & Synthesizer')}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                      {soundEnabled ? t('Suara Notifikasi Aktif') : t('Suara Notifikasi Senyap')}
                    </span>
                  </div>
                  <div className="h-2 w-2 rounded-full animate-ping bg-emerald-500" style={{ display: soundEnabled ? 'block' : 'none' }} />
                </div>
                <button
                  onClick={() => {
                    onSoundToggle(!soundEnabled);
                    setTimeout(() => {
                      sound.playClick();
                    }, 50);
                  }}
                  className={`mt-3 w-full py-2 border rounded-lg flex items-center justify-center gap-2 font-bold text-xs shadow-3xs cursor-pointer transition-colors ${
                    soundEnabled 
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>{t('Matikan Efek Suara')}</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4 text-slate-400" />
                      <span>{t('Aktifkan Efek Suara')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Keamanan & Manajemen Data */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-500" />
              {t('Keamanan & Manajemen Data')}
            </h2>

            {/* Warn Info Card */}
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex gap-2.5 items-start leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">{t('PENTING: Penyimpanan Lokal Browser')}</span>
                {t('Aplikasi ini menyimpan semua koleksi, sejarah sesi, serta kualifikasi keahlian Anda secara lokal di browser. Harap melakukan backup data secara berkala untuk menghindari kehilangan data saat melakukan pembersihan cache browser.')}
              </div>
            </div>

            {/* Bento Grid Data Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Backup Data Button Card */}
              <button
                onClick={() => {
                  sound.playClick();
                  onBackupData();
                }}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between min-h-[140px] cursor-pointer group shadow-2xs hover:shadow-xs"
              >
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center mb-3">
                  <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 block">{t('Backup Data (JSON)')}</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">{t('Unduh berkas pencadangan lokal ke komputer Anda.')}</span>
                </div>
              </button>

              {/* Restore Data Button Card */}
              <button
                onClick={() => {
                  sound.playClick();
                  setShowRestoreConfirm(true);
                }}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all text-left flex flex-col justify-between min-h-[140px] cursor-pointer group shadow-2xs hover:shadow-xs"
              >
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mb-3">
                  <RefreshCw className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                </div>
                <div>
                  <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 block">{t('Restore Data Seed')}</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">{t('Pulihkan kembali semua data demo bawaan pabrikan.')}</span>
                </div>
              </button>

              {/* Reset Data Button Card */}
              <button
                onClick={() => {
                  sound.playClick();
                  setShowResetConfirm(true);
                }}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-rose-50/20 dark:hover:bg-rose-950/20 transition-all text-left flex flex-col justify-between min-h-[140px] cursor-pointer group shadow-2xs hover:shadow-xs hover:border-rose-300"
              >
                <div className="h-8 w-8 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-650 dark:text-rose-450 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-4 h-4 group-hover:animate-shake transition-transform" />
                </div>
                <div>
                  <span className="font-extrabold text-xs text-rose-600 dark:text-rose-400 block">{t('Reset Total Data')}</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">{t('Bersihkan semua data di platform ini secara permanen.')}</span>
                </div>
              </button>

            </div>

            {/* JSON File Upload Restore */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4">
              <div>
                <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 block">{t('Unggah Berkas Pencadangan')}</span>
                <span className="text-[10px] text-slate-500 mt-0.5 block">{t('Pilih berkas JSON hasil unduhan backup sebelumnya untuk mengembalikan data Anda.')}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <label className="w-full sm:w-auto px-4 py-2 border border-slate-250 dark:border-slate-700 hover:border-blue-500 rounded-lg flex items-center justify-center gap-2 font-bold text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 cursor-pointer shadow-3xs transition-colors">
                  <UploadCloud className="w-4 h-4 text-slate-400" />
                  <span>{t('Pilih Berkas JSON')}</span>
                  <input 
                    type="file" 
                    accept=".json" 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                </label>
                
                {importingJson && (
                  <button
                    onClick={executeImport}
                    className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white font-extrabold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow hover:bg-blue-700 transition-colors"
                  >
                    <FileCheck className="w-4 h-4 animate-bounce-slow" />
                    <span>{t('Pulihkan dari JSON ini')}</span>
                  </button>
                )}
              </div>

              {fileError && (
                <p className="text-[10.5px] text-rose-600 font-medium tracking-tight bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/30 px-3 py-1.5 rounded-lg">
                  ⚠️ {fileError}
                </p>
              )}
            </div>

          </div>

        </div>

        {/* Right Side: Beautiful Polished Feedback Form */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 sticky top-20">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  {t('Umpan Balik & Saran')}
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {t('Saran Anda sangat berharga untuk pengembangan platform Aktipan.')}
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!feedbackSubmitted ? (
                <motion.form 
                  key="feedback-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleFeedbackSubmit} 
                  className="space-y-4"
                >
                  
                  {/* Category select */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      {t('Kategori Feedback')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['General', 'Bug Report', 'Feature Request', 'Question'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setFeedbackCategory(cat);
                          }}
                          className={`px-3 py-2 border rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer text-center transition-colors ${
                            feedbackCategory === cat
                              ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50 text-orange-700 dark:text-orange-400'
                              : 'bg-white dark:bg-slate-800 border-slate-250 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          {t(cat)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      {t('Rating Kepuasan')}
                    </label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setFeedbackHoverRating(star)}
                          onMouseLeave={() => setFeedbackHoverRating(null)}
                          onClick={() => {
                            sound.playClick();
                            setFeedbackRating(star);
                          }}
                          className="text-slate-300 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star 
                            className={`w-6 h-6 ${
                              (feedbackHoverRating !== null ? star <= feedbackHoverRating : star <= feedbackRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-2">
                        {feedbackRating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Subject input */}
                  <div className="space-y-1">
                    <label htmlFor="feedback-subject" className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      {t('Subjek / Judul')}
                    </label>
                    <input
                      id="feedback-subject"
                      type="text"
                      value={feedbackSubject}
                      onChange={(e) => setFeedbackSubject(e.target.value)}
                      placeholder={t('Contoh: Bug filter pencarian, Ide fitur kuis')}
                      className="w-full px-3 py-2 border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Message input */}
                  <div className="space-y-1">
                    <label htmlFor="feedback-message" className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      {t('Detail Masukan Anda')}
                    </label>
                    <textarea
                      id="feedback-message"
                      rows={4}
                      value={feedbackMsg}
                      onChange={(e) => setFeedbackMsg(e.target.value)}
                      placeholder={t('Tuliskan masukan, saran, kritik, atau bug report secara rinci di sini...')}
                      className="w-full px-3 py-2 border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-slate-400 disabled:to-slate-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-98"
                  >
                    {isSubmitting ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{t('Kirim Feedback Premium')}</span>
                      </>
                    )}
                  </button>

                </motion.form>
              ) : (
                <motion.div 
                  key="feedback-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 px-4 space-y-4"
                >
                  <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-500">
                    <FileCheck className="w-8 h-8 animate-bounce-slow" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                      {t('Feedback Terkirim!')}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {t('Terima kasih banyak atas partisipasi aktif Anda. Masukan Anda telah kami teruskan langsung ke tim developer untuk terus memoles Aktipan Workspace!')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setFeedbackSubmitted(false);
                    }}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {t('Kirim Feedback Lain')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* --- CUSTOM OVERLAY MODALS --- */}

      {/* 1. RESET DATA CONFIRM MODAL */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl max-w-md w-full space-y-5"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                    {t('Konfirmasi Reset Total Data')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t('Tindakan ini akan menghapus seluruh data Anda secara permanen. Ini mencakup koleksi tersimpan, custom game yang Anda buat, serta kualifikasi dan sertifikasi di profile Anda. Seluruh nilai akan kembali ke angka nol (0).')}
                  </p>
                  <p className="text-xs text-rose-600 dark:text-rose-450 font-bold leading-relaxed pt-1">
                    ⚠️ {t('Tindakan ini TIDAK dapat dibatalkan!')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowResetConfirm(false);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t('Batal')}
                </button>
                <button
                  onClick={() => {
                    sound.playBuzzer();
                    onResetData();
                    setShowResetConfirm(false);
                    triggerToast('🔥 ' + t('Semua data platform Anda telah dibersihkan!'));
                  }}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {t('Ya, Reset Semua')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. RESTORE DATA CONFIRM MODAL */}
      <AnimatePresence>
        {showRestoreConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl max-w-md w-full space-y-5"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                    {t('Konfirmasi Restore Data Demo')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {t('Apakah Anda yakin ingin memulihkan seluruh data bawaan pabrik? Tindakan ini akan menimpa data profile, riwayat sesi, dan sertifikasi Anda saat ini dengan dataset demo orisinal yang di-seed dari kode program.')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowRestoreConfirm(false);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t('Batal')}
                </button>
                <button
                  onClick={() => {
                    sound.playSuccess();
                    onRestoreData();
                    setShowRestoreConfirm(false);
                    triggerToast('✨ ' + t('Data demo orisinal berhasil dipulihkan!'));
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer animate-pulse-slow"
                >
                  {t('Ya, Pulihkan')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
