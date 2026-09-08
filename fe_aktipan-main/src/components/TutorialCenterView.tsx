import React, { useState } from 'react';
import { 
  Play, 
  Search, 
  Award, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Cpu, 
  BookOpen, 
  Video, 
  ListOrdered, 
  Volume2, 
  Maximize2, 
  ThumbsUp, 
  MessageSquare, 
  Info,
  ShieldCheck,
  Star,
  Check,
  X,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TUTORIALS, Tutorial } from '../data/activities';
import { useLanguage } from '../contexts/LanguageContext';

// Referencing our newly generated academy instructor image
const INSTRUCTOR_IMG = '/src/assets/images/academy_instructor_1781686248688.jpg';

export default function TutorialCenterView() {
  const { t } = useLanguage();
  const [selectedTutorialId, setSelectedTutorialId] = useState<string>('tut-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState<string>('1.0x');
  const [showVideoNotes, setShowVideoNotes] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showCertModal, setShowCertModal] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Find currently active tutorial
  const activeTutorial = TUTORIALS.find(t => t.id === selectedTutorialId) || TUTORIALS[0];

  // Filter tutorials based on level and search query
  const filteredTutorials = TUTORIALS.filter(t => {
    const matchesLevel = filterLevel === 'All' || t.level === filterLevel;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const toggleLessonComplete = (id: string) => {
    if (completedLessons.includes(id)) {
      setCompletedLessons(completedLessons.filter(item => item !== id));
    } else {
      setCompletedLessons([...completedLessons, id]);
    }
  };

  const handleNextLesson = () => {
    const currentIndex = TUTORIALS.findIndex(t => t.id === activeTutorial.id);
    if (currentIndex !== -1 && currentIndex < TUTORIALS.length - 1) {
      setSelectedTutorialId(TUTORIALS[currentIndex + 1].id);
    } else {
      setSelectedTutorialId(TUTORIALS[0].id); // loop back
    }
  };

  return (
    <div id="tutorial-center-panel" className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      
      {/* Academy Premium Header */}
      <div className="bg-slate-900 rounded-lg p-5 mb-5 text-white relative overflow-hidden border border-slate-800 shadow-md">
        <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-0 opacity-90" />
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl z-0" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 justify-between">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-blue-400 bg-blue-950/80 border border-blue-900 px-2 py-0.5 rounded tracking-widest font-mono">
              <Cpu className="h-3 w-3 animate-spin text-blue-400" /> {t('AKTIPAN INSTRUCTOR COCKPIT')}
            </span>
            <h1 className="text-xl font-black tracking-tight text-white uppercase sm:text-2xl">
              {t('Academy & Video Tutorial Center')}
            </h1>
            <p className="text-slate-300 text-xs leading-relaxed">
              {t('Kuasai panggung, asah suara pembawa acara (vocal presence), dan ketahui taktik jeli merancang skenario ice breaking kustom demi melipatgandakan kepuasan klien korporat.')}
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" /> {t('Sertifikasi Premium')}
              </span>
              <span>•</span>
              <span>{t('7 Modul Kursus Aktif')}</span>
              <span>•</span>
              <span className="text-orange-400 font-bold">{completedLessons.length}/7 {t('Sukses Dipelajari')}</span>
            </div>
          </div>

          {/* Senior Master Instructor Spotlight Card */}
          <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-lg flex items-center gap-3 w-full md:w-80 shadow-inner">
            <img 
              src={INSTRUCTOR_IMG} 
              alt="Coach Andika" 
              className="h-14 w-14 rounded-md object-cover border border-slate-700 pointer-events-none hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="text-[9px] bg-amber-500/15 text-amber-400 px-1 py-0.2 rounded font-extrabold font-mono">{t('MASTER')}</span>
                <span className="text-[10px] text-slate-400">{t('Instruktur')}</span>
              </div>
              <h4 className="text-[11px] font-black text-slate-100">{t('Coach Andika Pratama, M.M.')}</h4>
              <p className="text-[10px] text-slate-400 leading-none">{t('Senior Trainer & MC Partner')}</p>
              <div className="flex items-center gap-0.5 text-amber-500 pt-1">
                <Star className="h-2.5 w-2.5 fill-current" />
                <Star className="h-2.5 w-2.5 fill-current" />
                <Star className="h-2.5 w-2.5 fill-current" />
                <Star className="h-2.5 w-2.5 fill-current" />
                <Star className="h-2.5 w-2.5 fill-current" />
                <span className="text-[9px] font-bold text-slate-300 ml-1 font-mono">5.0 ({t('482 ulasan')})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Learning Workspace - High Density 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Interactive Screen Player (col-span-8) */}
        <div className="lg:col-span-8 space-y-3">
          
          {/* Main Simulated Video Terminal / YouTube Embed */}
          <div className="bg-slate-950 rounded-lg overflow-hidden border border-slate-900 shadow-lg relative">
            
            {/* Header Control Panel Bar */}
            <div className="bg-slate-900 border-b border-slate-950 px-3 py-1.5 flex items-center justify-between text-slate-400 text-[11px] font-mono select-none">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-slate-500">|</span>
                <span className="font-extrabold text-blue-400 flex items-center gap-1 uppercase tracking-wider text-[10px]">
                  <Video className="h-3 w-3 animate-pulse" /> {t('PLAYING STATE:')} {activeTutorial.id.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-[10px]">
                <span className="bg-slate-950 px-2 py-0.5 rounded text-amber-400 border border-slate-800 font-extrabold">{t('HD STREAM READY')}</span>
                <span className="text-slate-500 hidden sm:inline">{t('DELAY:')} 0.05ms</span>
              </div>
            </div>

            {/* Video Integration Screen */}
            <div className="relative aspect-video w-full bg-slate-900">
              <iframe
                id="active-youtube-player"
                src={`https://www.youtube.com/embed/${activeTutorial.youtubeId}?autoplay=0&rel=0&modestbranding=1&showinfo=0`}
                title={t(activeTutorial.title)}
                className="w-full h-full border-0 rounded-b"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Sub-bar overlay metrics */}
            <div className="bg-slate-900/90 py-2 px-3 border-t border-slate-950 text-slate-400 text-[10px] flex items-center justify-between font-mono">
              <div className="flex items-center space-x-3">
                <span className="flex items-center gap-1 font-bold text-slate-300">
                  <Volume2 className="h-3 w-3 text-slate-500" /> {t('Audio: Stereo 5.1')}
                </span>
                <span className="text-slate-700">|</span>
                <span className="text-slate-400">{t('Speed:')} {playbackSpeed}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {['0.75x', '1.0x', '1.25x', '1.5x'].map((spd) => (
                  <button 
                    key={spd}
                    onClick={() => {
                      setPlaybackSpeed(spd);
                      triggerToast(`${t('Kecepatan video disesuaikan ke')} ${spd} ${t('(Simulasi)')}`);
                    }}
                    className={`px-1 rounded text-[9px] font-bold border transition-colors ${playbackSpeed === spd ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-slate-800 border-slate-800 text-slate-400'}`}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Current Lesson Details Block */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 outline-none shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase font-mono border border-blue-200/20">{t(activeTutorial.category)}</span>
                  <span className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-350 font-extrabold px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider">{t(activeTutorial.level)}</span>
                </div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mt-0.5">{t(activeTutorial.title)}</h2>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleLessonComplete(activeTutorial.id)}
                  className={`px-3 py-1 text-[11px] font-extrabold rounded flex items-center gap-1 cursor-pointer transition-colors ${
                    completedLessons.includes(activeTutorial.id) 
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                      : 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-750 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <CheckCircle2 className={`h-3.5 w-3.5 ${completedLessons.includes(activeTutorial.id) ? 'text-emerald-600 fill-emerald-100 dark:fill-emerald-950' : 'text-slate-400'}`} />
                  {completedLessons.includes(activeTutorial.id) ? t('Selesai Dipelajari') : t('Tandai Selesai')}
                </button>

                <button
                  onClick={handleNextLesson}
                  className="px-3 py-1 bg-slate-900 dark:bg-slate-750 text-slate-100 hover:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold rounded cursor-pointer transition-all"
                >
                  {t('Modul Selanjutnya →')}
                </button>
              </div>
            </div>

            {/* Course Summary Description */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">{t('Deskripsi Pembelajaran')}</span>
              <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded border border-slate-150 dark:border-slate-750">
                {t(activeTutorial.description)}
              </p>
            </div>

            {/* Syllabus Checkpoints Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono mb-2">{t('Target Kompetensi Modul Ini:')}</span>
                <div className="space-y-1.5">
                  {activeTutorial.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <div className="mt-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 h-4 w-4 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0">
                        {idx + 1}
                      </div>
                      <span className="leading-tight font-medium text-slate-650 dark:text-slate-350">{t(highlight)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra Instructor Tips */}
              <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-150 dark:border-blue-900/40 p-3 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300 font-bold text-[11px] uppercase tracking-wide">
                    <Award className="h-3.5 w-3.5 text-blue-600 dark:text-blue-450" />
                    <span>{t('Rekomendasi Coach')}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                    {t('"Ulangi latihan memandu di depan cermin sebanyak 3 kali sebelum Anda benar-benar maju menggerakkan ratusan peserta korporasi di aula."')}
                  </p>
                </div>
                <div className="text-[9px] text-blue-500 dark:text-blue-450 font-mono mt-2 font-bold text-right">
                  {t('Dikeluarkan oleh Aktipan L&D Dept.')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Course Syllabus Dashboard (col-span-4) */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Syllabus Filtering Console */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2.5">
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">{t('Kokpit Daftar Modul')}</span>
            
            {/* Real Search Box */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={t('Cari teori, video, cara main...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-2 py-1 w-full text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none transition-all"
              />
            </div>

            {/* Level Quick Badges Filter */}
            <div className="flex flex-wrap gap-1 pt-1">
              {['All', 'Pemula', 'Menengah', 'Profesional'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-md transition-colors cursor-pointer border ${
                    filterLevel === lvl 
                      ? 'bg-slate-900 dark:bg-slate-700 border-slate-900 dark:border-slate-600 text-white' 
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-750 text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {lvl === 'All' ? t('Semua Modul') : t(lvl)}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Playlist Cards view */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {filteredTutorials.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded text-center text-slate-400 text-xs">
                {t('Tidak ada materi kurikulum yang cocok dengan filter atau kata kunci pencarian Anda.')}
              </div>
            ) : (
              filteredTutorials.map((tut, idx) => {
                const isActive = tut.id === selectedTutorialId;
                const isDone = completedLessons.includes(tut.id);
                return (
                  <div
                    key={tut.id}
                    onClick={() => setSelectedTutorialId(tut.id)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isActive 
                        ? 'bg-blue-50/75 dark:bg-blue-950/45 border-blue-400 dark:border-blue-800 shadow-sm' 
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-350 dark:hover:border-slate-650'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 justify-between">
                      <div className="flex items-start gap-2">
                        {/* Interactive LED playback indicator index */}
                        <div className={`mt-0.5 h-6 w-6 rounded-md font-mono text-[10px] font-extrabold flex items-center justify-center shrink-0 ${
                          isActive 
                            ? 'bg-blue-600 text-white animate-pulse' 
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                        }`}>
                          {tut.id === 'tut-1' && '01'}
                          {tut.id === 'tut-2' && '02'}
                          {tut.id === 'tut-3' && '03'}
                          {tut.id === 'tut-4' && '04'}
                          {tut.id === 'tut-5' && '05'}
                          {tut.id === 'tut-6' && '06'}
                          {tut.id === 'tut-7' && '07'}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold px-1 rounded font-mono uppercase tracking-wider">{t(tut.category)}</span>
                            <span className={`text-[8px] font-bold px-1 rounded font-mono uppercase ${
                              tut.level === 'Pemula' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450' :
                              tut.level === 'Menengah' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450'
                            }`}>{t(tut.level)}</span>
                          </div>
                          
                          <h3 className={`text-xs font-black uppercase mt-1 leading-tight tracking-tight ${
                            isActive ? 'text-blue-800 dark:text-blue-300' : 'text-slate-900 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-450'
                          }`}>
                            {t(tut.title)}
                          </h3>
                        </div>
                      </div>

                      {/* Tick or Play button icon */}
                      <div className="shrink-0 pt-0.5">
                        {isDone ? (
                          <div className="h-4.5 w-4.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="h-3 w-3 fill-emerald-150 dark:fill-emerald-900" />
                          </div>
                        ) : (
                          <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center border ${
                            isActive ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-750'
                          }`}>
                            <Play className="h-2 w-2 fill-current" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata line duration & difficulty */}
                    <div className="flex items-center justify-between border-t border-slate-100/80 dark:border-slate-750 pt-1.5 text-[9px] font-mono text-slate-400 dark:text-slate-500">
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" /> {t(tut.duration)}
                      </span>
                      {isActive && (
                        <span className="text-blue-600 dark:text-blue-400 font-extrabold flex items-center gap-0.5 animate-pulse">
                          <span>•</span> {t('SEDANG DIPUTAR')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Certificate Generation progress helper panel */}
          <div className="bg-gradient-to-tr from-slate-900 to-slate-950 p-3.5 rounded-lg text-white border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-tight">{t('Status Kelulusan Kursus')}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>{t('Progress Belajar')}</span>
                <span>{Math.round((completedLessons.length / 7) * 105)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-400 h-1.5 transition-all duration-300" 
                  style={{ width: `${(completedLessons.length / 7) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {t('Selesaikan ketujuh modul instruksi taktis untuk mengklaim sertifikat fasilitator digital kehormatan Anda.')}
            </p>
            <button
              onClick={() => {
                if (completedLessons.length === 7) {
                  setShowCertModal(true);
                } else {
                  triggerToast(`${t('Silakan tuntaskan sisa')} ${7 - completedLessons.length} ${t('modul pembelajaran lagi untuk membuka sertifikat kompetensi Anda.')}`);
                }
              }}
              className="w-full block text-center bg-amber-500 hover:bg-amber-450 active:bg-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-wider py-1.5 rounded cursor-pointer transition-colors"
            >
              {t('Klaim Sertifikat Anda')}
            </button>
          </div>

        </div>

      </div>

      {/* FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 max-w-sm w-11/12"
          >
            <Info className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="text-[11px] font-bold leading-tight">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DIGITAL CERTIFICATE MODAL */}
      <AnimatePresence>
        {showCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCertModal(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-6 md:p-8 border border-amber-300 dark:border-amber-700 shadow-2xl max-w-2xl w-full z-10 flex flex-col space-y-6 text-center"
            >
              {/* Close button */}
              <button 
                onClick={() => setShowCertModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black text-amber-600 bg-amber-55/65 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 p-1 px-3 rounded-full uppercase tracking-widest font-mono inline-block">
                  🎖️ {t('CERTIFICATE OF COMPETENCY')}
                </span>
                <h3 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tight">{t('Sertifikat Kelulusan Resmi')}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('Selamat atas dedikasi luar biasa Anda menyelesaikan modul pelatihan Aktipan Academy.')}</p>
              </div>

              {/* The Visual Certificate Frame */}
              <div className="border-[8px] border-double border-amber-200 dark:border-amber-850 p-6 md:p-8 bg-amber-50/[0.15] dark:bg-amber-950/[0.04] rounded-xl relative overflow-hidden text-center shadow-inner select-none font-serif">
                {/* Visual Stamp background */}
                <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none">
                  <Award className="h-32 w-32 text-amber-500" />
                </div>
                
                <h4 className="text-[10px] font-mono font-black uppercase text-amber-700 dark:text-amber-500 tracking-widest">{t('AKTIPAN ACADEMY INDONESIA')}</h4>
                <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-200 dark:via-amber-800 to-transparent my-3" />
                
                <p className="text-[10px] italic text-slate-500 dark:text-slate-400 font-sans">{t('Dengan ini menerangkan secara sah bahwa:')}</p>
                <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight my-2 font-serif uppercase">{t('USER AKTIPAN PARTNER')}</h2>
                <p className="text-[10px] leading-relaxed text-slate-650 dark:text-slate-350 max-w-md mx-auto font-sans font-medium">
                  {t('Telah menuntaskan seluruh kurikulum pelatihan')} <strong>"Ice Breaking & Facilitation Excellence"</strong> {t('dengan hasil kelulusan sangat memuaskan, mencakup penguasaan materi vocal presence, manajemen panggung, mitigasi risiko sosiologis, dan digital scoring.')}
                </p>

                {/* Signatures & Seal row */}
                <div className="grid grid-cols-2 gap-4 mt-6 items-end font-sans">
                  <div className="text-center space-y-1">
                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 block">{t('Ditetapkan tanggal:')}</span>
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block">{t('24 Juni 2026')}</span>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 w-24 mx-auto" />
                    <span className="text-[8px] text-slate-400 dark:text-slate-500 block">{t('Aktipan L&D Registrar')}</span>
                  </div>

                  <div className="text-center space-y-1">
                    <span className="text-[9px] text-indigo-500 dark:text-indigo-400 font-serif italic block">{t('Coach Andika Pratama')}</span>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 w-24 mx-auto" />
                    <span className="text-[8px] font-bold text-slate-700 dark:text-slate-200 block">{t('Senior Master Trainer')}</span>
                    <span className="text-[7px] text-slate-400 dark:text-slate-500 block">{t('KODE ID: ACT-7729-FAC')}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCertModal(false)}
                  className="flex-1 py-2.5 bg-slate-150 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 rounded-xl text-xs font-black uppercase transition-colors cursor-pointer"
                >
                  {t('Tutup')}
                </button>
                <button
                  onClick={() => {
                    triggerToast(t('📥 Mengunduh file Sertifikat PDF resolusi tinggi...'));
                  }}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-450 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/15 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileCheck className="h-4 w-4" /> {t('Cetak / Download PDF')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
