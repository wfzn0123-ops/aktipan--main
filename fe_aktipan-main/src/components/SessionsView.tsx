import React, { useState } from 'react';
import { Calendar, Plus, Play, Trash2, CheckCircle, Clock, CalendarDays, Users, LayoutList, Layers } from 'lucide-react';
import { Activity, ACTIVITIES } from '../data/activities';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface SessionsViewProps {
  onSelectActivity: (activity: Activity) => void;
  onNavigateToRun?: (activity: Activity) => void;
  isLoggedIn?: boolean;
  onRequireAuth?: () => void;
  sessions?: Session[];
  onSessionsChange?: (sessions: Session[]) => void;
}

interface Session {
  id: string;
  name: string;
  date: string;
  context: string;
  audience: string;
  participantCount: number;
  activityIds: number[];
  notes: string;
  status: 'Draft' | 'Berjalan' | 'Selesai';
}

export default function SessionsView({
  onSelectActivity,
  onNavigateToRun,
  isLoggedIn = false,
  onRequireAuth,
  sessions: propsSessions,
  onSessionsChange
}: SessionsViewProps) {
  const { t } = useLanguage();

  // Session states fallback
  const [localSessions, setLocalSessions] = useState<Session[]>([
    { id: 'sess-1', name: t('Rapat Kerja Tahunan 2026'), date: '2026-06-25', context: 'Corporate Gathering', audience: t('Manager & Staf Divisi HR'), participantCount: 45, activityIds: [1, 11, 31], notes: t('Buka dengan ice breaking fakta, pertengahan beri tepuk fokus.'), status: 'Draft' },
    { id: 'sess-2', name: t('Seminar Motivasi Mahasiswa Baru'), date: '2026-07-02', context: 'MPLS Campus', audience: t('Mahasiswa Baru angkatan 2026'), participantCount: 150, activityIds: [2, 13, 112], notes: t('Fokus refleksi di penutup panggung.'), status: 'Berjalan' }
  ]);

  const sessions = propsSessions !== undefined ? propsSessions : localSessions;
  const setSessions = (val: Session[] | ((prev: Session[]) => Session[])) => {
    if (onSessionsChange) {
      if (typeof val === 'function') {
        onSessionsChange(val(sessions));
      } else {
        onSessionsChange(val);
      }
    } else {
      if (typeof val === 'function') {
        setLocalSessions(val(localSessions));
      } else {
        setLocalSessions(val);
      }
    }
  };

  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('2026-06-20');
  const [newContext, setNewContext] = useState('Corporate Training');
  const [newAudience, setNewAudience] = useState('Staf Umum');
  const [newCount, setNewCount] = useState<number>(30);
  const [isFormOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newSess: Session = {
      id: `sess-${Date.now()}`,
      name: newName,
      date: newDate,
      context: newContext,
      audience: newAudience,
      participantCount: newCount,
      activityIds: [1, 2], // default prepopulated activities
      notes: t('Rangkaian rancangan interaktif siap pake.'),
      status: 'Draft'
    };

    setSessions([newSess, ...sessions]);
    setNewName('');
    setIsOpen(false);
    setToastMessage(t('Sesi rundown baru berhasil dibuat!'));
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
    setToastMessage(t('Sesi rundown berhasil dihapus.'));
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div id="sessions-pendukung-panel" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative min-h-[80vh] text-slate-900 dark:text-slate-100">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 text-white font-medium text-sm px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
          >
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-950/50 rounded-xl border border-blue-200/20">
              <CalendarDays className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            {t('Sesi & Rundown Acara')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base max-w-2xl">{t('Rancang dan kelompokkan rangkaian aktivitas menjadi satu rundown utuh untuk kemudahan eksekusi acara Anda.')}</p>
        </div>

        <button 
          onClick={() => {
            if (!isLoggedIn && onRequireAuth) {
              onRequireAuth();
              return;
            }
            setIsOpen(!isFormOpen);
          }}
          className="inline-flex items-center justify-center space-x-2 py-3 px-5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-750 text-sm font-semibold text-white transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          {isFormOpen ? <span className="font-bold">{t('Batal')}</span> : (
            <>
              <Plus className="h-4 w-4" />
              <span>{t('Buat Rangkaian Sesi')}</span>
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreateSession} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700 p-6 sm:p-8 shadow-sm max-w-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="flex items-center gap-2 mb-6">
                <LayoutList className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{t('Rancang Sesi Baru')}</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 dark:text-slate-350 text-sm font-medium mb-1.5">{t('Nama Acara Sesi')} <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Employee Gathering 2026"
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-350 text-sm font-medium mb-1.5">{t('Tanggal Pelaksanaan')}</label>
                  <input 
                    type="date" 
                    value={newDate} 
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-350 text-sm font-medium mb-1.5">{t('Konteks / Tema')}</label>
                  <input 
                    type="text" 
                    value={newContext} 
                    onChange={(e) => setNewContext(e.target.value)}
                    placeholder="e.g. Corporate Training"
                    className="w-full bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-350 text-sm font-medium mb-1.5">{t('Target Audiens')}</label>
                  <input 
                    type="text" 
                    value={newAudience} 
                    onChange={(e) => setNewAudience(e.target.value)}
                    placeholder="e.g. Staf Umum"
                    className="w-full bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-350 text-sm font-medium mb-1.5">{t('Estimasi Peserta')}</label>
                  <input 
                    type="number" 
                    value={newCount} 
                    onChange={(e) => setNewCount(Number(e.target.value))}
                    min="1"
                    className="w-full bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-750">
                <button type="button" onClick={() => setIsOpen(false)} className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-medium py-2 px-5 rounded-xl transition-colors">{t('Batal')}</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-xl shadow-sm shadow-blue-600/20 transition-all active:scale-95 cursor-pointer">{t('Simpan Sesi')}</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          {t('Rundown Terjadwal')} <span className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs py-0.5 px-2 rounded-full">{sessions.length}</span>
        </h3>
      </div>

      {/* Sessions Cards grid listing */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {sessions.length === 0 ? (
          <div className="col-span-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/40">
             <div className="w-16 h-16 bg-white dark:bg-slate-900 shadow-sm rounded-2xl flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
                <CalendarDays className="w-8 h-8" />
             </div>
             <h4 className="text-slate-900 dark:text-white font-bold mb-1">{t('Belum ada rundown acara')}</h4>
             <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-4">{t('Mulai rancang rundown aktivitas Anda untuk memudahkan pelaksanaan acara.')}</p>
             <button 
              onClick={() => {
                if (!isLoggedIn && onRequireAuth) {
                  onRequireAuth();
                  return;
                }
                setIsOpen(true);
              }} 
              className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline cursor-pointer"
            >{t('Buat rundown pertama')}</button>
           </div>
        ) : (
          sessions.map(sess => (
            <div key={sess.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-700 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-black/20 hover:shadow-lg dark:hover:shadow-black/35 hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
              <div className="flex items-start justify-between mb-5">
                <div className="flex-1 pr-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg ${
                      sess.status === 'Berjalan' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/40 dark:border-emerald-800/40' : 
                      sess.status === 'Selesai' ? 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200/40 dark:border-slate-800/40' : 
                      'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/40 dark:border-amber-800/40'
                    }`}>
                      {t(sess.status)}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
                      {t(sess.context)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-2">{sess.name}</h3>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <Calendar className="h-3.5 w-3.5 text-blue-500" />
                      {sess.date}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <Users className="h-3.5 w-3.5 text-indigo-500" />
                      {sess.participantCount} {t('Orang')} ({sess.audience})
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleDeleteSession(sess.id)}
                  className="p-2 text-slate-300 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors shrink-0 cursor-pointer"
                  title={t('Hapus Sesi')}
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="pt-5 border-t border-slate-100/80 dark:border-slate-700 mt-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('Rundown Permainan')} ({sess.activityIds.length})</span>
                </div>
                
                <div className="space-y-2">
                  {sess.activityIds.length > 0 ? sess.activityIds.map((actId, seqNo) => {
                    const matchedAct = ACTIVITIES.find(a => a.id === actId);
                    return matchedAct ? (
                      <div key={actId} className="group flex items-center justify-between bg-slate-50 dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 border border-slate-150 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 rounded-xl p-3 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {seqNo + 1}
                          </div>
                          <div className="truncate">
                            <h4 
                              className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 cursor-pointer transition-colors truncate" 
                              onClick={() => onSelectActivity(matchedAct)}
                            >
                              {t(matchedAct.activity_name)}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {matchedAct.duration_min}-{matchedAct.duration_max}m</span>
                              <span>•</span>
                              <span>{t(matchedAct.category)}</span>
                            </div>
                          </div>
                        </div>

                        {onNavigateToRun && (
                          <button
                            onClick={() => onNavigateToRun(matchedAct)}
                            className="ml-3 shrink-0 py-1.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-400 hover:bg-blue-600 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-300 hover:text-white dark:hover:text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span className="hidden sm:inline">{t('Mulai')}</span>
                          </button>
                        )}
                      </div>
                    ) : null;
                  }) : (
                     <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-center">
                      <p className="text-sm text-slate-400 dark:text-slate-500">{t('Belum ada aktivitas di rundown ini.')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
