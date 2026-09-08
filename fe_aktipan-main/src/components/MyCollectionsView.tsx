import React, { useState } from 'react';
import { FolderHeart, Plus, Trash2, ArrowRight, Layers, LayoutList, CheckCircle, FolderOpen, MoreVertical, X, Sparkles } from 'lucide-react';
import { Activity, ACTIVITIES } from '../data/activities';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface MyCollectionsViewProps {
  savedActivities: Activity[];
  onSelectActivity: (activity: Activity) => void;
  onRemoveFromSaved: (activity: Activity) => void;
  isLoggedIn?: boolean;
  onRequireAuth?: () => void;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  activityIds: number[];
}

export default function MyCollectionsView({
  savedActivities,
  onSelectActivity,
  onRemoveFromSaved,
  isLoggedIn = false,
  onRequireAuth
}: MyCollectionsViewProps) {
  const { t } = useLanguage();
  // Collections state
  const [collections, setCollections] = useState<Collection[]>([
    { id: '1', name: t('Ice Breaking Favorit'), description: t('Kumpulan game cepat di awal sesi pelatihan kantor.'), activityIds: [1, 2, 3] },
    { id: '2', name: t('Games Tanpa Alat'), description: t('Daftar aktivitas darurat saat panitia lupa sewa perlengkapan.'), activityIds: [11, 12, 13] },
    { id: '3', name: t('Team Building Indoor'), description: t('Merangkul kebersamaan karyawan di dalam ruangan meeting.'), activityIds: [31, 33] }
  ]);

  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn && onRequireAuth) {
      onRequireAuth();
      return;
    }
    if (!newColName.trim()) return;

    const newCol: Collection = {
      id: Date.now().toString(),
      name: newColName,
      description: newColDesc || t('Koleksi custom berdaya guna tinggi.'),
      activityIds: []
    };

    setCollections([...collections, newCol]);
    setNewColName('');
    setNewColDesc('');
    setIsCreating(false);
    setToastMessage(t('Folder koleksi baru berhasil dibuat!'));
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteCollection = (id: string) => {
    setCollections(collections.filter(c => c.id !== id));
    setToastMessage(t('Koleksi berhasil dihapus.'));
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add a saved activity directly into a custom collection
  const handleAddActivityToCollection = (activityId: number, colId: string) => {
    setCollections(collections.map(c => {
      if (c.id === colId) {
        if (c.activityIds.includes(activityId)) return c;
        return { ...c, activityIds: [...c.activityIds, activityId] };
      }
      return c;
    }));
    setToastMessage(t('Aktivitas berhasil dimasukkan ke dalam folder koleksi!'));
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div id="my-collections-panel" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative min-h-[80vh] text-slate-900 dark:text-slate-100">
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
            <div className="p-2.5 bg-rose-100 dark:bg-rose-950/50 rounded-xl border border-rose-200/25">
              <FolderHeart className="h-7 w-7 text-rose-500" />
            </div>
            {t('Koleksi Aktivitas Saya')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base max-w-2xl">{t('Kelompokkan berbagai aktivitas favorit Anda ke dalam paket rundown kustom teratur untuk mempermudah eksekusi acara.')}</p>
        </div>

        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center justify-center space-x-2 py-3 px-5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-750 text-sm font-semibold text-white transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          {isCreating ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span>{isCreating ? t('Batal') : t('Buat Koleksi Baru')}</span>
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreateCollection} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700 p-6 shadow-sm max-w-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="flex items-center gap-2 mb-5">
                <FolderOpen className="h-5 w-5 text-blue-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{t('Buat Folder Koleksi Baru')}</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-350 text-sm font-medium mb-1.5">{t('Nama Koleksi')} <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    placeholder={t('e.g. Sesi Pembuka Webinar')}
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-350 text-sm font-medium mb-1.5">{t('Deskripsi Singkat')}</label>
                  <input 
                    type="text" 
                    placeholder={t('e.g. Daftar game untuk webinar berdurasi singkat')}
                    value={newColDesc}
                    onChange={(e) => setNewColDesc(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setIsCreating(false)} className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-medium py-2 px-5 rounded-xl transition-colors">{t('Batal')}</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer">{t('Simpan Koleksi')}</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of collections */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="h-4 w-4 text-slate-400 dark:text-slate-550" />
          {t('Folder Koleksi Anda')} <span className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs py-0.5 px-2 rounded-full">{collections.length}</span>
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
        {collections.length === 0 ? (
           <div className="col-span-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/40">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 shadow-sm rounded-2xl flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
                 <FolderOpen className="w-8 h-8" />
              </div>
              <h4 className="text-slate-900 dark:text-white font-bold mb-1">{t('Belum ada folder koleksi')}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-4">{t('Buat folder untuk mengelompokkan aktivitas favorit Anda agar lebih mudah ditemukan saat akan digunakan.')}</p>
              <button onClick={() => setIsCreating(true)} className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline cursor-pointer">{t('Buat koleksi pertama Anda')}</button>
           </div>
        ) : (
          collections.map(col => (
            <div key={col.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/70 dark:border-slate-700 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] dark:shadow-black/20 hover:shadow-lg dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-300 group flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-100/50 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                  <FolderHeart className="h-6 w-6" />
                </div>
                <button 
                  onClick={() => handleDeleteCollection(col.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                  title={t('Hapus Koleksi')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-1.5">{col.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">{col.description}</p>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100/80 dark:border-slate-700">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-medium text-slate-500 dark:text-slate-400">{col.activityIds.length} {t('Aktivitas tersimpan')}</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">Custom Pack</span>
                </div>

                {/* Quick display names inside */}
                {col.activityIds.length > 0 ? (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                    {col.activityIds.map(actId => {
                      const matchedAct = ACTIVITIES.find(sa => sa.id === actId);
                      return matchedAct ? (
                        <div 
                          key={actId} 
                          onClick={() => onSelectActivity(matchedAct)}
                          className="group/item flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover/item:scale-150 transition-transform"></div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover/item:text-slate-900 dark:group-hover/item:text-white truncate">{t(matchedAct.activity_name)}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-750 px-1.5 py-0.5 rounded shadow-sm shrink-0">{matchedAct.duration_max}m</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl p-3 text-center">
                    <p className="text-xs text-slate-400 dark:text-slate-500">{t('Folder masih kosong. Tambahkan dari draf di bawah.')}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Favorites List section */}
      <div className="mb-6 flex items-center justify-between mt-12 border-t border-slate-200/60 dark:border-slate-800 pt-10">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <LayoutList className="h-5 w-5 text-slate-400 dark:text-slate-550" />
            {t('Semua Aktivitas Tersimpan')} 
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('Daftar semua aktivitas yang telah Anda tandai simpan.')}</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold text-sm py-1 px-3 rounded-full border border-slate-200 dark:border-slate-800">
          {savedActivities.length} {t('Total')}
        </div>
      </div>
      
      {savedActivities.length === 0 ? (
        <div className="border border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center flex flex-col items-center bg-white dark:bg-slate-800 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
            <Sparkles className="w-8 h-8" />
          </div>
          <h4 className="text-slate-900 dark:text-white font-bold mb-1">{t('Belum ada aktivitas tersimpan')}</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-4">{t('Eksplorasi direktori kami dan simpan aktivitas favorit Anda agar muncul di sini.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {savedActivities.map((act) => (
            <div key={act.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/70 dark:border-slate-700 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-slate-350 dark:hover:border-slate-600 transition-all group">
              <div onClick={() => onSelectActivity(act)} className="cursor-pointer flex-1 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0 overflow-hidden relative">
                   <LayoutList className="w-5 h-5 text-slate-400 dark:text-slate-550" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md uppercase tracking-wide border border-indigo-100/50 dark:border-indigo-900/30">{t(act.category)}</span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md">{act.duration_min}-{act.duration_max} Min</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-450 transition-colors leading-tight">{t(act.activity_name)}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">{t(act.short_description)}</p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-700 pt-3 sm:pt-0">
                {/* dropdown select list target folders */}
                <div className="relative">
                  <select 
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddActivityToCollection(act.id, e.target.value);
                        e.target.value = ""; // reset after selection
                      }
                    }}
                    className="appearance-none bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-colors"
                    defaultValue=""
                  >
                    <option value="" disabled className="bg-white dark:bg-slate-800">{t('+ Tambah ke Folder')}</option>
                    {collections.map(c => <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800">{c.name}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 dark:text-slate-400">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>

                <button 
                  onClick={() => onRemoveFromSaved(act)}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('Hapus')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
