import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, SlidersHorizontal, Grid, List, Table, Filter, Plus, Check, Star, 
  Trash, Save, ArrowRight, BookOpen, Clock, Heart, Users, Trash2, Edit, Quote
} from 'lucide-react';
import { Activity, getIllustrationUrl } from '../data/activities';
import InteractiveTour from './InteractiveTour';
import ActivityIllustration from './ActivityIllustration';
import { motion } from 'motion/react';
import { sound } from '../utils/sound';
import { useLanguage } from '../contexts/LanguageContext';

interface DirectoryDashboardProps {
  activities: Activity[];
  onSelectActivity: (activity: Activity) => void;
  onSaveToggle: (activity: Activity) => void;
  savedActivities: Activity[];
  onAddCustomActivity: (newAct: Activity) => void;
  onNavigateToRun?: (activity: Activity) => void;
  onAddToCollectionDirect?: (activity: Activity) => void;
  isLoggedIn?: boolean;
  onRequireAuth?: () => void;
}

export default function DirectoryDashboard({
  activities,
  onSelectActivity,
  onSaveToggle,
  savedActivities,
  onAddCustomActivity,
  onNavigateToRun,
  onAddToCollectionDirect,
  isLoggedIn = false,
  onRequireAuth
}: DirectoryDashboardProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFormat, setSelectedFormat] = useState<string>('All');
  const [selectedEnergy, setSelectedEnergy] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTools, setSelectedTools] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Custom Activity Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [customName, setCustomName] = useState('');

  // Auto trigger the interactive tour for new users on load
  useEffect(() => {
    const isCompleted = localStorage.getItem('aktipan_tour_completed');
    if (isCompleted !== 'true') {
      setIsTourOpen(true);
    }
  }, []);
  const [customCategory, setCustomCategory] = useState('Ice Breaking');
  const [customDesc, setCustomDesc] = useState('');
  const [customDurationMax, setCustomDurationMax] = useState(10);
  const [customFormat, setCustomFormat] = useState<'Offline' | 'Online' | 'Hybrid'>('Offline');
  const [customEnergy, setCustomEnergy] = useState<'Calm' | 'Medium' | 'High'>('Medium');
  const [customObjective, setCustomObjective] = useState('');

  // Dropdown list helpers
  const categories = ['All', 'Ice Breaking', 'Energizer', 'Fun Games', 'Team Building', 'Communication', 'Leadership', 'Problem Solving', 'Sales & Service', 'Quiz & Polling', 'Simulation & Role Play', 'Challenge', 'Reflection', 'Travel & Special'];
  const formats = ['All', 'Offline', 'Online', 'Hybrid'];
  const energies = ['All', 'Calm', 'Medium', 'High'];
  const difficulties = ['All', 'Easy', 'Medium', 'Advanced'];

  // Filter logic
  const filteredActivities = useMemo(() => {
    let result = [...activities];

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(act => 
        act.activity_name.toLowerCase().includes(q) ||
        act.short_description.toLowerCase().includes(q) ||
        act.objective.toLowerCase().includes(q) ||
        act.activity_number.toLowerCase().includes(q) ||
        act.tools_needed.some(t => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(act => act.category === selectedCategory);
    }

    // Format filter
    if (selectedFormat !== 'All') {
      result = result.filter(act => act.format === selectedFormat);
    }

    // Energy level filter
    if (selectedEnergy !== 'All') {
      result = result.filter(act => act.energy_level === selectedEnergy);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'All') {
      result = result.filter(act => act.difficulty_level === selectedDifficulty);
    }

    // Tools filter
    if (selectedTools === 'NoTools') {
      result = result.filter(act => act.tools_needed.some(t => t.toLowerCase() === 'tanpa alat' || t.toLowerCase() === 'suara mandiri'));
    } else if (selectedTools === 'WithTools') {
      result = result.filter(act => !act.tools_needed.some(t => t.toLowerCase() === 'tanpa alat' || t.toLowerCase() === 'suara mandiri'));
    }

    // Sorting logic
    if (sortBy === 'popular') {
      result.sort((a, b) => b.usage_count - a.usage_count);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'duration_fast') {
      result.sort((a, b) => a.duration_min - b.duration_min);
    } else if (sortBy === 'difficulty_easy') {
      // Manual sorting easy first
      const diffWeight = (d: string) => d === 'Easy' ? 1 : (d === 'Medium' ? 2 : 3);
      result.sort((a, b) => diffWeight(a.difficulty_level) - diffWeight(b.difficulty_level));
    }

    return result;
  }, [activities, searchQuery, selectedCategory, selectedFormat, selectedEnergy, selectedDifficulty, selectedTools, sortBy]);

  // Handle Custom Activity submit
  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newCustomAct: Activity = {
      id: Date.now(),
      activity_number: `CUST-${String(activities.length + 1).padStart(3, '0')}`,
      activity_name: customName,
      category: customCategory,
      short_description: customDesc || 'Aktivitas adaptif kreasi pengguna seutuhnya.',
      long_description: customDesc || 'Aktivitas adaptif kreasi pengguna seutuhnya.',
      objective: customObjective || 'Mengaktifkan peserta secara interaktif.',
      main_goal: 'Kustomisasi instruksi sesuai target pelatihan.',
      suitable_for: ["Trainer", "Fasilitator"],
      suitable_event_filter: ["Custom Event"],
      participant_min: 10,
      participant_max: 100,
      duration_min: 5,
      duration_max: customDurationMax,
      format: customFormat,
      indoor_outdoor: 'Indoor',
      energy_level: customEnergy,
      difficulty_level: 'Medium',
      tools_needed: ['Tanpa Alat'],
      step_by_step: [
        "Fasilitator mengucapkan salam pembuka dan mengumumkan aktivitas kustom ini.",
        "Menjelaskan peraturan instruksi singkat.",
        "Mulai jalankan musik pengiring.",
        "Aktivitas berlangsung dengan monitoring langsung.",
        "Refleksi singkat bersuara."
      ],
      mc_script: `"Halo semuanya mari kita lakukan rintangan kustom ini bersama-sama!"`,
      debrief_questions: [
        "Apa poin paling mengasyikkan yang dirasakan?",
        "Bagaimana cara kita meningkatkan hasil jika diulang?"
      ],
      variations: ["Atur durasi lebih singkat 5 menit."],
      risk_notes: "Risiko kelelahan minimal.",
      mitigation_tips: "Sediakan suplai minum.",
      professional_tips: "Pastikan senyum hangat.",
      rating: 5.0,
      usage_count: 1,
      is_free: true,
      estimated_fun_level: 5,
      estimated_impact_level: 4,
      illustration_url: getIllustrationUrl(customCategory, Date.now())
    };

    onAddCustomActivity(newCustomAct);
    setIsModalOpen(false);
    // Reset form
    setCustomName('');
    setCustomDesc('');
    setCustomObjective('');
  };

  // Map category to badge helper
  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'Ice Breaking': return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40';
      case 'Energizer': return 'bg-orange-100 dark:bg-orange-950/60 text-orange-850 dark:text-orange-300 border border-orange-200 dark:border-orange-900/40';
      case 'Fun Games': return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40';
      case 'Team Building': return 'bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-900/40';
      case 'Communication': return 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-850 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-900/40';
      case 'Leadership': return 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40';
      case 'Problem Solving': return 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40';
      case 'Sales & Service': return 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40';
      case 'Quiz & Polling': return 'bg-pink-100 dark:bg-pink-950/60 text-pink-800 dark:text-pink-300 border border-pink-200 dark:border-pink-900/40';
      case 'Reflection': return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40';
      default: return 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div id="directory-dashboard-panel" className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100">
      {/* Quick Dashboard metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
        <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">{t('Total Database')}</span>
            <span id="stat-total-count" className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-1 block font-mono">{activities.length} {t('Aktivitas')}</span>
          </div>
          <span className="text-[9px] bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-300 px-1 py-0.5 rounded font-bold font-mono">DB-VER 2.5</span>
        </div>
        <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">{t('Tersimpan')}</span>
            <span id="stat-saved-count" className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-1 block font-mono">{savedActivities.length} {t('Favorit')}</span>
          </div>
          <span className="text-[9px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-1 py-0.5 rounded font-bold font-mono">Sync</span>
        </div>
        <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">{t('Kebutuhan Acara')}</span>
            <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-1 block font-mono">15+ {t('Solusi')}</span>
          </div>
          <span className="text-[9px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-1 py-0.5 rounded font-bold font-mono">Active</span>
        </div>
        <div className="bg-white dark:bg-slate-800 px-3 py-2 rounded border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">{t('Dukungan Lisensi')}</span>
            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">{t('SaaS SIAP JUAL')}</span>
          </div>
          <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-1 py-0.5 rounded font-bold font-mono">Commercial</span>
        </div>
      </div>

      {/* Visual Immersive Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-lg overflow-hidden border border-slate-800 shadow-md mb-4 flex flex-col md:flex-row items-center justify-between relative">
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/30 pointer-events-none z-10" />
        <div className="p-5 md:p-6 space-y-2 max-w-xl relative z-20 text-white">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded tracking-wide font-mono">NEW GENERATION</span>
            <span className="bg-blue-600/20 text-blue-300 font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Pro Tools Active</span>
          </div>
          <h2 className="text-base sm:text-lg font-black tracking-tight uppercase">
            {t('Akses Instan Game Generator & Run Mode Terintegrasi')}
          </h2>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {t('Pilih di antara 132 petunjuk taktis MC premium, simpan aktivitas panggung favorit Anda ke folder koleksi, atau sesuaikan panggung secara real-time dengan meluncurkan Run Mode yang bersenjatakantimer interaktif.')}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="flex items-center gap-1 text-[10px] bg-slate-950/40 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono">
              <Star className="h-3 w-3 fill-amber-400 text-amber-450 inline-block" />
              <span>{t('Estimasi Fun Level: 4.9/5.0')}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] bg-slate-950/40 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono">
              <Users className="h-3 w-3 text-cyan-400 animate-pulse inline-block" />
              <span>{t('Simulasi Kapasitas: 1 - 500+ Audiens')}</span>
            </div>
          </div>
        </div>
        
        {/* Generated tactical vector map image section */}
        <div className="w-full md:w-80 h-36 md:h-40 shrink-0 relative bg-slate-900 flex items-center justify-center overflow-hidden border-t md:border-t-0 md:border-l border-slate-800">
          <img 
            src="/src/assets/images/aktipan_main_hero_1781686227742.jpg" 
            alt="Aktipan Illustration" 
            className="w-full h-full object-cover select-none pointer-events-none hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent md:bg-gradient-to-r md:from-slate-950 md:via-transparent md:to-transparent" />
        </div>
      </div>

      {/* Main Directory Header and Add Custom */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase">{t('Direktori Aktivitas Utama')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{t('Filter multi-dimensi instan untuk meramu aktivitas trainer secara taktis.')}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => { sound.playClick(); setIsTourOpen(true); }}
            className="inline-flex items-center justify-center space-x-1 py-1.5 px-3 rounded bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-xs font-black text-indigo-700 dark:text-indigo-300 transition-all cursor-pointer"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>{t('Panduan Tur 💡')}</span>
          </button>

          <button 
            onClick={() => { 
              sound.playClick();
              if (!isLoggedIn && onRequireAuth) {
                onRequireAuth();
                return;
              }
              sound.playSparkle(); 
              setIsModalOpen(true); 
            }}
            className="inline-flex items-center justify-center space-x-1 py-1.5 px-3 rounded bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t('Buat Aktivitas Custom')}</span>
          </button>
        </div>
      </div>

      {/* Search and Sort layout */}
      <div className="bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-3 mb-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Cari kata kunci, nomor aktivitas, atau ketersediaan alat...')}
              className="pl-8 pr-3 py-1.5 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1.5 px-2 w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded text-xs text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="popular">{t('Terpopuler (Usage Count)')}</option>
              <option value="rating">{t('Rating Tertinggi')}</option>
              <option value="duration_fast">{t('Durasi Tercepat')}</option>
              <option value="difficulty_easy">{t('Paling Mudah')}</option>
            </select>
          </div>

          <div className="flex items-center justify-between border border-slate-200 dark:border-slate-700 rounded p-0.5 bg-slate-100 dark:bg-slate-900">
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex-1 py-1 rounded text-[10px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
            >
              <Grid className="h-3 w-3" /> {t('GRID')}
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`flex-1 py-1 rounded text-[10px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
            >
              <Table className="h-3 w-3" /> {t('TABEL')}
            </button>
          </div>
        </div>

        {/* Multi selections filtration tags */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-700">
          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase mb-0.5 tracking-wider">{t('Kategori')}</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {categories.map(c => <option key={c} value={c} className="bg-white dark:bg-slate-800">{c === 'All' ? t('Semua Kategori') : t(c)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase mb-0.5 tracking-wider">{t('Format')}</label>
            <select 
              value={selectedFormat} 
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {formats.map(f => <option key={f} value={f} className="bg-white dark:bg-slate-800">{f === 'All' ? t('Semua Format') : t(f)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase mb-0.5 tracking-wider">{t('Energi')}</label>
            <select 
              value={selectedEnergy} 
              onChange={(e) => setSelectedEnergy(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {energies.map(e => <option key={e} value={e} className="bg-white dark:bg-slate-800">{e === 'All' ? t('Semua Energi') : t(e)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase mb-0.5 tracking-wider">{t('Kesulitan')}</label>
            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {difficulties.map(d => <option key={d} value={d} className="bg-white dark:bg-slate-800">{d === 'All' ? t('Semua Kesulitan') : t(d)}</option>)}
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase mb-0.5 tracking-wider">{t('Kebutuhan Alat')}</label>
            <select 
              value={selectedTools} 
              onChange={(e) => setSelectedTools(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All" className="bg-white dark:bg-slate-800">{t('Semua Alat')}</option>
              <option value="NoTools" className="bg-white dark:bg-slate-800">{t('Hanya Tanpa Alat')}</option>
              <option value="WithTools" className="bg-white dark:bg-slate-800">{t('Butuh Alat Tambahan')}</option>
            </select>
          </div>
        </div>

        {/* Clear active filter indicator */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{t('Ditemukan')} <strong className="font-mono text-slate-800 dark:text-slate-200">{filteredActivities.length}</strong> {t('dari total')} <strong className="font-mono text-slate-800 dark:text-slate-200">{activities.length}</strong> {t('aktivitas interaktif.')}</span>
          {(searchQuery !== '' || selectedCategory !== 'All' || selectedFormat !== 'All' || selectedEnergy !== 'All' || selectedDifficulty !== 'All' || selectedTools !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedFormat('All');
                setSelectedEnergy('All');
                setSelectedDifficulty('All');
                setSelectedTools('All');
              }}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
            >
              {t('Clear filters')}
            </button>
          )}
        </div>
      </div>

      {/* Grid or Table layout list render */}
      {filteredActivities.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center text-slate-500 dark:text-slate-400">
          <SlidersHorizontal className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{t('Belum ada aktivitas yang cocok')}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">{t('“Belum ada aktivitas yang cocok. Coba ubah filter pencarian Anda atau gunakan fitur AI Generator.”')}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <motion.div 
          id="grid-layout-container" 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.03
              }
            }
          }}
        >
          {filteredActivities.map((act) => {
            const isSaved = savedActivities.some(sa => sa.id === act.id);
            const badgeStyle = getCategoryTheme(act.category);

            return (
              <motion.div 
                key={act.id}
                id={`act-card-${act.id}`}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
                }}
                whileHover={{ y: -5, scale: 1.015, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)" }}
                onMouseEnter={() => sound.playHover()}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/85 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm dark:shadow-black/25 transition-all flex flex-col group overflow-hidden"
              >
                {/* Activity Illustration Thumbnail */}
                <div 
                  onClick={() => onSelectActivity(act)}
                  className="w-full h-32 md:h-36 relative bg-slate-100 dark:bg-slate-900 overflow-hidden cursor-pointer"
                >
                  <ActivityIllustration
                    id={act.id}
                    name={act.activity_name}
                    category={act.category}
                    illustrationUrl={act.illustration_url}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>

                {/* Header info */}
                <div className="p-5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">#{act.activity_number}</span>
                    <div className="flex items-center space-x-1">
                      <span className={`text-[10px] uppercase font-bold py-0.5 px-2 rounded-full tracking-wider ${badgeStyle}`}>
                        {act.category}
                      </span>
                      {act.is_free ? (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-green-50 dark:bg-green-950/40 text-green-750 dark:text-green-300 border border-green-200/40 dark:border-green-900/40">Free</span>
                      ) : (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-750 dark:text-amber-300 border border-amber-200/40 dark:border-amber-900/40">Premium</span>
                      )}
                    </div>
                  </div>

                  <h3 
                    onClick={() => onSelectActivity(act)}
                    className="text-base font-black text-slate-900 dark:text-white mt-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    {act.activity_name}
                  </h3>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {act.short_description}
                  </p>

                  <div className="mt-3 text-xs bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2.5 border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                    <span className="text-slate-400 dark:text-slate-500 font-bold text-[9px] uppercase">{t('Tujuan / Goal')}</span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold truncate leading-none">{act.objective}</span>
                  </div>

                  {/* Badges specifications list */}
                  <div className="flex flex-wrap gap-1 mt-4">
                    <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-slate-800 rounded px-1.5 py-0.5">⏱ {act.duration_min}-{act.duration_max} {t('Menit')}</span>
                    <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-slate-800 rounded px-1.5 py-0.5">👥 {act.participant_min}-{act.participant_max} {t('Orang')}</span>
                    <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-slate-800 rounded px-1.5 py-0.5">🏷 {t(act.difficulty_level)}</span>
                  </div>
                </div>

                {/* Grid Footer tools list */}
                <div className="bg-slate-50 dark:bg-slate-900/30 p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button 
                    onClick={() => onSaveToggle(act)}
                    className={`font-bold transition-all px-2.5 py-1.5 rounded flex items-center gap-1 cursor-pointer ${
                      isSaved ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40' : 'text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isSaved ? 'fill-rose-600' : ''}`} />
                    {isSaved ? t('Favorit') : t('Simpan')}
                  </button>

                  <div className="flex items-center space-x-1">
                    {onAddToCollectionDirect && (
                      <button 
                        onClick={() => onAddToCollectionDirect(act)}
                        className="text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-200/50 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-600 px-2.5 py-1.5 rounded"
                        title={t('Tambah ke Koleksi')}
                      >
                        + {t('Koleksi')}
                      </button>
                    )}
                    {onNavigateToRun && (
                      <button 
                        onClick={() => onNavigateToRun(act)}
                        className="text-xs font-extrabold bg-orange-500 hover:bg-orange-400 text-white rounded px-3 py-1.5 transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        Run Mode
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* TABLE VIEW RENDER */
        <div id="table-layout-container" className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/90 dark:border-slate-700 overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse text-xs text-slate-700 dark:text-slate-200">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase font-black text-slate-500 dark:text-slate-400">
                <th className="p-3.5 pl-5">{t('Aktivitas')}</th>
                <th className="p-3.5 max-w-sm">{t('Deskripsi & Tujuan')}</th>
                <th className="p-3.5 text-center">{t('Estimasi Sesi')}</th>
                <th className="p-3.5 text-center">{t('Atribut')}</th>
                <th className="p-3.5 text-center">{t('Aksi')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium text-slate-700 dark:text-slate-300">
              {filteredActivities.map((act) => {
                const isSaved = savedActivities.some(sa => sa.id === act.id);
                return (
                  <tr key={act.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-colors">
                    {/* AKTIVITAS COL (NO, IMAGE, NAME, CATEGORY STACKED) */}
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono">#{act.activity_number}</span>
                        <ActivityIllustration
                          id={act.id}
                          name={act.activity_name}
                          category={act.category}
                          illustrationUrl={act.illustration_url}
                          className="w-11 h-9 object-cover rounded-lg border border-slate-200/80 dark:border-slate-700 shrink-0 shadow-2xs"
                        />
                        <div className="flex flex-col min-w-0">
                          <span 
                            onClick={() => onSelectActivity(act)}
                            className="font-extrabold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xs truncate"
                          >
                            {act.activity_name}
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">
                            {t('Kategori')}: <strong className="text-slate-600 dark:text-slate-350">{t(act.category)}</strong>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* DESKRIPSI & TUJUAN */}
                    <td className="p-3.5 max-w-sm">
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold line-clamp-1">
                          {act.short_description}
                        </span>
                        <span className="text-[10px] text-slate-450 dark:text-slate-500 italic line-clamp-1">
                          {t('Tujuan / Goal')}: {act.objective}
                        </span>
                      </div>
                    </td>

                    {/* ESTIMASI SESI */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center space-y-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1">
                          ⏱️ {act.duration_min}-{act.duration_max} {t('Menit')}
                        </span>
                        <span className="flex items-center gap-1 text-[9px] text-slate-450 dark:text-slate-500">
                          👥 {act.participant_min}-{act.participant_max} {t('Orang')}
                        </span>
                      </div>
                    </td>

                    {/* ATRIBUT PILLS */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getCategoryTheme(act.category)}`}>
                          {t(act.format)}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                          ⚡ {t(act.energy_level)} • ⭐ {t(act.difficulty_level)}
                        </span>
                      </div>
                    </td>

                    {/* AKSI BUTTONS */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button 
                          onClick={() => onSelectActivity(act)}
                          className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-1 px-2 rounded-lg font-extrabold text-[10px] cursor-pointer transition-colors"
                          title={t('Detail')}
                        >
                          {t('Detail')}
                        </button>
                        
                        <button 
                          onClick={() => onSaveToggle(act)}
                          className={`py-1 px-2 rounded-lg font-extrabold text-[10px] cursor-pointer transition-colors ${
                            isSaved 
                              ? 'bg-rose-50 dark:bg-rose-950/45 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100' 
                              : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                          }`}
                          title={isSaved ? t('Hapus dari Favorit') : t('Simpan ke Favorit')}
                        >
                          {isSaved ? `♥ ${t('Favorit')}` : `♡ ${t('Simpan')}`}
                        </button>

                        {onNavigateToRun && (
                          <button
                            onClick={() => onNavigateToRun(act)}
                            className="bg-orange-500 hover:bg-orange-600 text-white py-1 px-2.5 rounded-lg font-extrabold text-[10px] cursor-pointer shadow-2xs transition-transform hover:scale-102"
                          >
                            Run ⚡
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE CUSTOM ACTIVITY MODAL DRAW PANEL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
            <div className="bg-slate-900 dark:bg-slate-950 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-blue-400" /> Tambah Aktivitas Custom Anda
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Nama Aktivitas <span className="text-rose-500">*</span></label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Tebak Gaya Karyawan"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 px-3 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Kategori Utama</label>
                  <select 
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Ice Breaking" className="bg-white dark:bg-slate-800">Ice Breaking</option>
                    <option value="Energizer" className="bg-white dark:bg-slate-800">Energizer</option>
                    <option value="Fun Games" className="bg-white dark:bg-slate-800">Fun Games</option>
                    <option value="Team Building" className="bg-white dark:bg-slate-800">Team Building</option>
                    <option value="Communication" className="bg-white dark:bg-slate-800">Communication</option>
                    <option value="Leadership" className="bg-white dark:bg-slate-800">Leadership</option>
                    <option value="Problem Solving" className="bg-white dark:bg-slate-800">Problem Solving</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Durasi Maksimal (Menit)</label>
                  <input 
                    type="number"
                    min={1}
                    value={customDurationMax}
                    onChange={(e) => setCustomDurationMax(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Format</label>
                  <select 
                    value={customFormat}
                    onChange={(e) => setCustomFormat(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Offline" className="bg-white dark:bg-slate-800">Offline</option>
                    <option value="Online" className="bg-white dark:bg-slate-800">Online</option>
                    <option value="Hybrid" className="bg-white dark:bg-slate-800">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Tingkat Energi</label>
                  <select 
                    value={customEnergy}
                    onChange={(e) => setCustomEnergy(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Calm" className="bg-white dark:bg-slate-800">Calm (Tenang)</option>
                    <option value="Medium" className="bg-white dark:bg-slate-800">Medium (Sedang)</option>
                    <option value="High" className="bg-white dark:bg-slate-800">High (Heboh / Fisik)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Tujuan / Goal</label>
                <input 
                  type="text"
                  placeholder="e.g. Mencairkan rasa canggung dan melatih spontanitas"
                  value={customObjective}
                  onChange={(e) => setCustomObjective(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 px-3 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Deskripsi Singkat Cara Main</label>
                <textarea 
                  rows={2}
                  placeholder="Tulis instruksi singkat di sini bagaimana fasilitator memulai aktivitas..."
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 px-3 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-2 px-6 rounded-lg shadow-md cursor-pointer"
                >
                  Tambah Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Interactive Tour Overlay */}
      <InteractiveTour 
        isOpen={isTourOpen} 
        onClose={() => setIsTourOpen(false)} 
      />

      {/* Dashboard Footer */}
      <footer id="dashboard-footer" className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pb-4 gap-2">
        <div>
          &copy; {new Date().getFullYear()} AKTIPAN. Semangat Partisipan Aktif & Fun.
        </div>
        <div className="flex items-center gap-1">
          <span>Dibuat oleh</span>
          <a 
            id="contech-copyright-link"
            href="https://contech.id" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-700 font-extrabold transition-colors hover:underline"
          >
            Contech ID
          </a>
        </div>
      </footer>
    </div>
  );
}
