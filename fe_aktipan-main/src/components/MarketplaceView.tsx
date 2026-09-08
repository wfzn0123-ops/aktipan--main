import React, { useState } from 'react';
import { Users, ShieldAlert, Star, MessageSquare, CheckCircle, Mail, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VENDORS, Vendor } from '../data/activities';
import { useLanguage } from '../contexts/LanguageContext';

interface MarketplaceViewProps {
  isLoggedIn?: boolean;
  onRequireAuth?: () => void;
  vendors?: Vendor[];
}

export default function MarketplaceView({ isLoggedIn = false, onRequireAuth, vendors: propsVendors }: MarketplaceViewProps) {
  const { t } = useLanguage();
  const vendors = propsVendors !== undefined ? propsVendors : VENDORS;
  const [successVendor, setSuccessVendor] = useState<Vendor | null>(null);

  return (
    <div id="marketplace-search-panel" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-xs relative text-slate-900 dark:text-slate-100">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-200/25">{t('Dukungan Ekosistem')}</span>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-3">{t('Talent & Vendor Marketplace')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('Sewa jasa fasilitator game tersertifikasi, MC pernikahan heboh, atau sewa peralatan panggung event raksasa langsung dari vendor terpercaya.')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vendors.map(vendor => (
          <div key={vendor.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 p-5 shadow-sm dark:shadow-black/20 space-y-4 hover:border-slate-350 dark:hover:border-slate-600 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">ID: {vendor.id.toUpperCase()}</span>
                <span className="text-xs text-amber-500 font-extrabold flex items-center gap-0.5"><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> {vendor.rating}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 p-0.5 px-2 rounded">{t(vendor.category)}</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-2">{t(vendor.name)}</h3>
                <span className="text-slate-450 dark:text-slate-400 block text-[10px] mt-0.5">📍 {t('Lokasi')}: {t(vendor.location)}</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">{t('Spesialis Layanan:')}</span>
                <div className="flex flex-wrap gap-1">
                  {vendor.services.map((s, idx) => (
                    <span key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[9px] font-extrabold text-slate-600 dark:text-slate-300">{t(s)}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between mt-4">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">{t('Tarif Partner')}</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-100">{t(vendor.price)}</span>
              </div>

              <button
                onClick={() => {
                  if (!isLoggedIn && onRequireAuth) {
                    onRequireAuth();
                    return;
                  }
                  setSuccessVendor(vendor);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-2 px-4 rounded-lg flex items-center gap-1 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <MessageSquare className="h-4 w-4" /> {t('Tanya / Hubungi')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SUCCESS MODAL FOR BOOKING TALENT */}
      <AnimatePresence>
        {successVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSuccessVendor(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl max-w-sm w-full z-10 flex flex-col space-y-4 text-center"
            >
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-500 shadow-inner">
                <CheckCircle className="h-8 w-8 text-blue-600 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-950 dark:text-white uppercase">{t('Booking Terkirim! 📅')}</h3>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                  {t('Pengajuan konsultasi dan booking untuk talent partner')} <strong>"{t(successVendor.name)}"</strong> {t('telah berhasil dilayangkan.')}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 p-3.5 rounded-xl text-left space-y-1 text-slate-700 dark:text-slate-300">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-mono">{t('Langkah Selanjutnya:')}</span>
                <p className="text-[11px] leading-relaxed">
                  {t('1. Tim')} <strong>{t(successVendor.name)}</strong> {t('akan memproses ketersediaan jadwal.')}<br />
                  {t('2. Anda akan dihubungi oleh admin resmi via WhatsApp/Email dalam tempo maksimal')} <strong>{t('2 jam kerja')}</strong>.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSuccessVendor(null)}
                  className="flex-grow py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase transition-colors cursor-pointer"
                >
                  {t('Selesai ✓')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
