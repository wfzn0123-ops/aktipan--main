import React, { useState } from 'react';
import { Layers, Unlock, Lock, ShoppingCart, CheckCircle, Trophy, Sparkles, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ACTIVITY_PACKS, ActivityPack } from '../data/activities';
import { useLanguage } from '../contexts/LanguageContext';

interface PacksViewProps {
  onUnlockCompleted?: (pack: ActivityPack) => void;
  isLoggedIn?: boolean;
  onRequireAuth?: () => void;
  packs?: ActivityPack[];
  onPacksChange?: (packs: ActivityPack[]) => void;
}

export default function PacksView({ 
  onUnlockCompleted, 
  isLoggedIn = false, 
  onRequireAuth,
  packs: propsPacks,
  onPacksChange
}: PacksViewProps) {
  const { t } = useLanguage();
  const [localPacks, setLocalPacks] = useState<ActivityPack[]>(ACTIVITY_PACKS);
  
  const packs = propsPacks !== undefined ? propsPacks : localPacks;
  const setPacks = (val: ActivityPack[] | ((prev: ActivityPack[]) => ActivityPack[])) => {
    if (onPacksChange) {
      if (typeof val === 'function') {
        onPacksChange(val(packs));
      } else {
        onPacksChange(val);
      }
    } else {
      if (typeof val === 'function') {
        setLocalPacks(val(localPacks));
      } else {
        setLocalPacks(val);
      }
    }
  };
  const [successPackName, setSuccessPackName] = useState<string | null>(null);

  const handleBuyPack = (packId: string, packName: string) => {
    if (!isLoggedIn && onRequireAuth) {
      onRequireAuth();
      return;
    }
    setPacks(packs.map(p => {
      if (p.id === packId) {
        return { ...p, isUnlocked: true };
      }
      return p;
    }));
    setSuccessPackName(packName);
  };

  return (
    <div id="packs-directory-panel" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-xs relative text-slate-900 dark:text-slate-100">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-200/50 dark:border-blue-900/40">{t('Katalog Premium')}</span>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-3">{t('Activity Packs Siap Saji')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('Dapatkan bundel aktivitas bertema untuk mensukseskan jenis rundown Anda tanpa repot memikirkan instrumen pendukung.')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {packs.map(pack => (
          <div key={pack.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 p-5 shadow-sm space-y-4 hover:border-slate-350 dark:hover:border-slate-650 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 p-1 px-2 rounded-md">{t(pack.category)}</span>
                {pack.isUnlocked ? (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5"><Unlock className="h-3 w-3 inline" /> {t('Terbuka')}</span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5"><Lock className="h-3 w-3 inline" /> {t('Terkunci')}</span>
                )}
              </div>

              <h3 className="text-sm font-black text-slate-950 dark:text-white">{t(pack.name)}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">{t(pack.description)}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 mt-4 flex items-center justify-between">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t('Akses')}</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{pack.activitiesCount} {t('Aktivitas Premium')}</span>
              </div>

              {pack.isUnlocked ? (
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-extrabold flex items-center gap-1"><CheckCircle className="h-4 w-4 text-emerald-500" /> {t('Siap Pake')}</span>
              ) : (
                <button
                  onClick={() => handleBuyPack(pack.id, pack.name)}
                  className="bg-slate-900 dark:bg-slate-750 hover:bg-slate-800 dark:hover:bg-slate-650 text-white font-extrabold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-transform"
                >
                  <ShoppingCart className="h-3.5 w-3.5 text-orange-400" /> {pack.price}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* SUCCESS MODAL FOR PAYMENTS */}
      <AnimatePresence>
        {successPackName && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSuccessPackName(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl max-w-sm w-full z-10 flex flex-col space-y-4 text-center"
            >
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shadow-inner">
                <Trophy className="h-8 w-8 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-950 dark:text-white uppercase">{t('Pembayaran Berhasil! 💸')}</h3>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                  {t('Sambut kegembiraan baru! Paket aktivitas premium')} <strong>"{t(successPackName)}"</strong> {t('kini telah sukses dibuka dan siap dipakai di workspace Anda.')}
                </p>
              </div>

              <div className="bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-150 dark:border-emerald-800 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 justify-center">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-extrabold">{t('Workspace Teraktualisasi Otomatis')}</span>
              </div>

              <button
                onClick={() => setSuccessPackName(null)}
                className="w-full py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-colors"
              >
                {t('Mulai Gunakan Sekarang ✓')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
