import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Search, Heart, Play, Navigation, ChevronRight, ChevronLeft, 
  X, CheckSquare, Filter, BookOpen, Clock, Users, Laptop, Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InteractiveTour({ isOpen, onClose }: InteractiveTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Auto Reset state on modal open
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: "Selamat Datang di Kampus Aktipan! 🎓",
      description: "Asisten sakti penataran taktis untuk Trainer, MC, dan Fasilitator Indonesia. Mari ikuti tur kilat gratis ini untuk memahami cara instan meramu sirkulasi panggung Anda!",
      badge: "Panduan Cepat",
      illustration: (
        <div className="relative h-44 w-full bg-gradient-to-br from-indigo-900 to-slate-950 rounded-xl overflow-hidden flex flex-col items-center justify-center p-4 border border-indigo-500/20">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ repeat: Infinity, duration: 6 }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="h-16 w-16 rounded-full bg-indigo-500/10 border border-indigo-400 flex items-center justify-center text-indigo-400 mb-3 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>
            <h4 className="text-sm font-black text-white font-mono tracking-wider uppercase">KAMPUS AKTIPAN v2.0</h4>
            <div className="flex gap-2.5 mt-2">
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded border border-blue-500/30">132+ Aktivitas</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">AI Generator</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded border border-rose-500/30">Live Arena</span>
            </div>
          </motion.div>
        </div>
      ),
      tip: "Anda dapat memicu panduan interaktif ini kapan saja dengan mengeklik tombol 'Panduan Panduan 💡' di ujung pojok direktori."
    },
    {
      title: "1. Eksplorasi Direktori Pintar 🔍",
      description: "Gunakan filter multi-dimensi instan untuk memilih aktivitas berdasarkan Kategori, Format (Indoor/Outdoor), Tingkat Energi (Low/Medium/High), hingga Durasi & rentang Jumlah Peserta.",
      badge: "Langkah 1",
      illustration: (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 bg-white rounded border border-slate-200 p-2 shadow-sm">
            <Search className="h-3.5 w-3.5 text-blue-500" />
            <div className="h-2.5 bg-slate-100 rounded w-2/3 animate-pulse" />
            <span className="ml-auto bg-slate-100 p-1 rounded"><Filter className="h-3 w-3 text-slate-400" /></span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="border border-blue-200 bg-blue-50/50 p-2 rounded text-center">
              <span className="text-[8px] uppercase font-black text-blue-500 block">Kategori</span>
              <span className="text-[10px] font-extrabold text-slate-800">Energizer</span>
            </div>
            <div className="border border-slate-100 bg-slate-50 p-2 rounded text-center">
              <span className="text-[8px] uppercase font-bold text-slate-400 block">Format</span>
              <span className="text-[10px] font-bold text-slate-600">Outdoor</span>
            </div>
            <div className="border border-slate-100 bg-slate-50 p-2 rounded text-center">
              <span className="text-[8px] uppercase font-bold text-slate-400 block">Energi</span>
              <span className="text-[10px] font-bold text-slate-600 font-mono">High 🔥</span>
            </div>
          </div>
          <div className="text-[9px] text-center text-slate-500 leading-tight">
            Urutkan berdasarkan <strong>Terpopuler (Usage Count)</strong> atau ketersediaan alat pendukung.
          </div>
        </div>
      ),
      tip: "Mencari game tanpa alat? Ketik 'Tanpa Alat' di bilah pencari untuk memunculkan aktivitas yang fleksibel tanpa logistik!"
    },
    {
      title: "2. Tandai & Simpan Sebagai Favorit ❤️",
      description: "Klik ikon hati (Favorit) di sudut kanan bawah kartu permainan untuk menyimpannya ke tab 'Koleksi Saya'. Anda juga bisa merajut koleksi modular secara kustom per event pelatihan.",
      badge: "Langkah 2",
      illustration: (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between h-44">
          <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm space-y-2">
            <div className="flex justify-between items-start">
              <span className="bg-orange-100 text-orange-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Ice Breaking</span>
              <span className="text-[9px] font-mono text-slate-400">#ACT-005</span>
            </div>
            <h5 className="text-xs font-black text-slate-900 leading-snug">Menepuk Konsentrasi Balon</h5>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 w-3/4 h-full" />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
            <div className="bg-rose-50 border border-rose-200 text-rose-600 font-bold text-[10px] px-2.5 py-1.5 rounded flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 fill-rose-600" /> Saved di Favorit
            </div>
            <span className="text-[9px] font-mono text-slate-500">Tersinkronisasi 💾</span>
          </div>
        </div>
      ),
      tip: "Gunakan tab 'Koleksi Saya' di panel navigasi atas untuk mencetak direktori kustom buatan Anda sendiri demi kenyamanan luring."
    },
    {
      title: "3. Jalankan Event Secara Mantap dengan 'Run Mode' 🚀",
      description: "Ubah gawai Anda menjadi mesin monitoring interaktif. Run Mode membekali Anda dengan timer waktu mundur pintar, indikator kelulusan, dan panduan langkah demi langkah real-time di panggung.",
      badge: "Langkah 3",
      illustration: (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-white space-y-2">
          {/* Mock Run Mode UI */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono text-slate-300 uppercase tracking-wider">RUNNING STATE</span>
            </div>
            <span className="text-[8px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1 py-0.5 rounded">Ronde 1/3</span>
          </div>

          {/* Giant Countdown Panel */}
          <div className="py-2.5 bg-slate-900 rounded border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-mono">COUNTDOWN TIMER</span>
            <span className="text-2xl font-black text-amber-400 font-mono tracking-tight animate-pulse">04:59.2</span>
          </div>

          {/* Progress bar and control buttons */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] text-emerald-400 font-mono">15/40 Evaluasi Lolos</span>
            <div className="flex gap-1.5">
              <span className="bg-orange-500 text-[8px] font-bold px-1.5 py-0.5 rounded">JEDA</span>
              <span className="bg-blue-600 text-[8px] font-bold px-1.5 py-0.5 rounded">NEXT STEP</span>
            </div>
          </div>
        </div>
      ),
      tip: "Anda bisa meluncurkan 'Run Mode' langsung dari kartu direktori utama atau saat melihat detail lengkap aktivitas pilihan."
    }
  ];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('aktipan_tour_completed', 'true');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleComplete}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
        />

        {/* Modal Window Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm sm:max-w-md w-full overflow-hidden z-10 flex flex-col text-slate-800"
          id="interactive-tour-modal"
        >
          {/* Top Banner Indicator */}
          <div className="bg-slate-950 text-white px-5 py-3.5 border-b border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-400/25">
                <BookOpen className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest font-mono text-slate-300">
                KAMPUS AKTIPAN TOUR
              </span>
            </div>
            
            {/* Steps tracker indicator */}
            <span className="bg-slate-900 text-slate-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-800">
              {currentStep + 1} / {tourSteps.length}
            </span>
          </div>

          {/* Modal content body */}
          <div className="p-6 space-y-4 flex-1">
            
            {/* Dynamic Step Header */}
            <div className="space-y-1">
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider">
                {tourSteps[currentStep].badge}
              </span>
              <h3 className="text-base font-black text-slate-950 uppercase tracking-tight font-sans">
                {tourSteps[currentStep].title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {tourSteps[currentStep].description}
              </p>
            </div>

            {/* Simulated Live visual / Interactive block */}
            <div className="py-2">
              {tourSteps[currentStep].illustration}
            </div>

            {/* Smart Tip widget */}
            <div className="bg-amber-50 border border-amber-250 rounded-lg p-3 flex gap-2">
              <span className="text-amber-500 text-xs shrink-0 select-none">💡</span>
              <p className="text-[10px] text-amber-800 leading-normal font-semibold font-sans">
                <strong>Tips Sakti:</strong> {tourSteps[currentStep].tip}
              </p>
            </div>

          </div>

          {/* Footer actions */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            
            {/* Left action: Back button */}
            {currentStep > 0 ? (
              <button 
                onClick={handlePrev}
                className="text-slate-500 hover:text-slate-800 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 px-3 py-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Sebelumnya
              </button>
            ) : (
              <button 
                onClick={handleComplete}
                className="text-slate-400 hover:text-slate-600 text-[11px] font-bold uppercase tracking-wider hover:underline"
              >
                Lewati Tur
              </button>
            )}

            {/* Right Action: Next / Finish button */}
            <button 
              onClick={handleNext}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-600/15 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            >
              {currentStep < tourSteps.length - 1 ? (
                <>Lanjut <ChevronRight className="h-3.5 w-3.5" /></>
              ) : (
                <>Mulai Eksplorasi! <CheckSquare className="h-3.5 w-3.5" /></>
              )}
            </button>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
