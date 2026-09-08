import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Sliders, RefreshCw, Zap, Play, Lightbulb, Users, Clock, Target, 
  ListTodo, Copy, Check, ArrowRight, Cpu, Terminal, ArrowUpRight, CheckCircle, 
  Award, HelpCircle, Laptop, ChevronRight, MessageSquare, Info
} from 'lucide-react';
import { Activity, ACTIVITIES } from '../data/activities';
import { sound } from '../utils/sound';
import { useLanguage } from '../contexts/LanguageContext';

interface ActivityGeneratorViewProps {
  onSelectActivity: (activity: Activity) => void;
  onNavigateToRun?: (activity: Activity) => void;
  isLoggedIn?: boolean;
  onRequireAuth?: () => void;
}

export default function ActivityGeneratorView({
  onSelectActivity,
  onNavigateToRun,
  isLoggedIn = false,
  onRequireAuth
}: ActivityGeneratorViewProps) {
  const { t } = useLanguage();
  const [purpose, setPurpose] = useState('Pencair Suasana (Ice Breaking)');
  const [participantCount, setParticipantCount] = useState<number>(30);
  const [duration, setDuration] = useState<number>(10);
  const [format, setFormat] = useState('Offline');
  const [energyLevel, setEnergyLevel] = useState('Medium');
  const [audienceType, setAudienceType] = useState('Karyawan Korporasi / Eksekutif');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  // Custom interactive UX states
  const [activeTab, setActiveTab] = useState<'concept' | 'steps' | 'mc' | 'debrief'>('concept');
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);

  // Quick-apply presets to help user understand and test the generator instantly
  const presets = [
    {
      id: 1,
      label: '🏢 Corporate Icebreaker',
      desc: 'Peserta: Direksi & Karyawan',
      icon: '🧊',
      purpose: 'Pencair Suasana (Ice Breaking)',
      audience: 'Direksi & Karyawan Korporasi',
      pax: 25,
      dur: 15,
      format: 'Offline',
      energy: 'Medium'
    },
    {
      id: 2,
      label: '🌐 Webinar Energizer',
      desc: 'Peserta: Umum & Mahasiswa',
      icon: '⚡',
      purpose: 'Menaikkan Energi (Energizer)',
      audience: 'Peserta Webinar Zoom',
      pax: 120,
      dur: 10,
      format: 'Online',
      energy: 'High'
    },
    {
      id: 3,
      label: '🤝 Hybrid Team Building',
      desc: 'Peserta: Tim Developer',
      icon: '🤝',
      purpose: 'Membangun Teamwork Sinergi',
      audience: 'Tim Developer & Desainer',
      pax: 40,
      dur: 20,
      format: 'Hybrid',
      energy: 'Medium'
    },
    {
      id: 4,
      label: '💡 Problem Solving C-Level',
      desc: 'Peserta: Eksekutif Senior',
      icon: '💡',
      purpose: 'Problem Solving & Kreativitas',
      audience: 'Manajer & Eksekutif Senior',
      pax: 15,
      dur: 25,
      format: 'Offline',
      energy: 'Calm'
    }
  ];

  // Run simulated loading step sequence
  useEffect(() => {
    if (!isGenerating) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 320);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleApplyPreset = (p: typeof presets[0]) => {
    sound.playClick();
    setSelectedPresetId(p.id);
    setPurpose(p.purpose);
    setAudienceType(p.audience);
    setParticipantCount(p.pax);
    setDuration(p.dur);
    setFormat(p.format);
    setEnergyLevel(p.energy);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn && onRequireAuth) {
      onRequireAuth();
      return;
    }
    sound.playClick();
    setIsGenerating(true);
    setIsCopied(false);

    setTimeout(() => {
      let recommendation: Activity = ACTIVITIES[0];
      if (purpose.includes('Ice')) {
        recommendation = ACTIVITIES[0]; // Kenalan 3 fakta
      } else if (purpose.includes('Energi') || energyLevel === 'High') {
        recommendation = ACTIVITIES[10]; // Tepuk Fokus
      } else if (purpose.includes('Team') || purpose.includes('Sinergi')) {
        recommendation = ACTIVITIES[30]; // Tower Challenge
      } else {
        // Find recommendation with similar category or matching characteristics
        const matched = ACTIVITIES.find(a => a.category.toLowerCase().includes(purpose.split(' ')[0].toLowerCase())) || ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
        recommendation = matched;
      }

      setGeneratedResult({
        recommendation,
        customActivity: {
          name: `Ekstravaganza ${purpose.split(' ')[0]} Adaptif`,
          format: format,
          duration: `${duration} Menit`,
          tools: ['Tanpa Alat Khusus', 'Hanya Smartphone'],
          overview: `Metode pembelajaran interaktif canggih yang dirancang khusus untuk mempererat kedekatan di lingkungan kelompok ${audienceType}. Peserta diajak berpartisipasi aktif dalam rangkaian estafet berenergi ${energyLevel} guna melebur kecanggungan dan memicu kreativitas bersama secara inklusif.`,
          steps: [
            "Fasilitator mengkondisikan audiens berpasangan secara acak untuk membentuk formasi tapal kuda.",
            "Setiap pasang peserta diberi waktu 60 detik menentukan komitmen kolaboratif yang unik.",
            "Tantangan bergulir cepat dengan perputaran pasangan ke arah jarum jam setiap 2 menit sekali.",
            "Evaluasi & Skor: Tim dengan respons verbal paling sinkron dalam sandi ritmis akan memenangkan sesi."
          ],
          script: `"Selamat datang rekan-rekan luar biasa sekalian dari kelompok ${audienceType}! Saatnya kita melepaskan kepenatan dan menyatukan frekuensi pikiran lewat petualangan interaktif berenergi ${energyLevel} ini. Dengarkan aba-aba dari saya, persiapkan senyum terbaik Anda, dan mari kita mulai keseruannya!"`,
          debrief: [
            "Bagaimana proses adaptasi Anda saat harus menyelaraskan ritme gerakan dengan rekan baru dalam hitungan detik?",
            "Bagaimana kita bisa merefleksikan keselarasan komunikasi tadi ke dalam efektivitas kerja tim sehari-hari?"
          ]
        }
      });
      setIsGenerating(false);
      setActiveTab('concept');
      sound.playSuccess();
    }, 1400);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    sound.playClick();
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getStepText = (step: number) => {
    switch (step) {
      case 1: return t('🧠 Menganalisis profil target audiens & segmentasi kognitif...');
      case 2: return t('⚡ Menyelaraskan intensitas energi, durasi, & format pelaksanaan...');
      case 3: return t('🎙️ Merumuskan naskah pemandu MC interaktif dengan tone adaptif...');
      case 4: return t('🎖️ Menyusun butir debrief refleksi mendalam dan skenario evaluasi...');
      default: return t('🔮 Menginisialisasi modul kecerdasan buatan Aktipan...');
    }
  };

  return (
    <div id="ai-generator-panel" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 text-slate-800 animate-in fade-in duration-500">
      
      {/* 1. Modern Header Hero & Ambient Glow Backdrop */}
      <div className="relative text-center max-w-3xl mx-auto mb-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-gradient-to-tr from-orange-200/40 to-amber-200/30 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative inline-flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-full text-[11px] font-extrabold uppercase tracking-widest mb-6 shadow-sm select-none">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
          </span>
          <Cpu className="h-4 w-4 text-orange-600 animate-pulse" /> 
          <span className="font-mono">{t('SINTESIS CERDAS • ENGINE AKTIPAN v3.2')}</span>
        </div>
        
        <h1 className="relative text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
          AI Activity <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600">Intelligent</span> Generator
        </h1>
        
        <p className="relative text-slate-500 text-xs sm:text-sm md:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
          {t('Hadirkan keajaiban panggung dalam hitungan detik. Atur parameter target audiens Anda dan biarkan kecerdasan buatan Aktipan merumuskan skenario game kustom, naskah MC pemandu, serta butir debrief refleksi kelas yang mendalam.')}
        </p>
      </div>

      {/* 2. Interactive Quick Scenario Preset Section */}
      <div id="presets-section" className="mb-12 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-5 border-b border-slate-200/60 pb-4">
          <div className="flex items-center gap-2.5 text-[11px] font-black text-slate-600 uppercase tracking-widest">
            <Sparkles className="h-4.5 w-4.5 text-orange-500 fill-orange-500/10" />
            <span>{t('PILIH PRESET SKENARIO CEPAT (AUTO-FILL SATU KLIK)')}</span>
          </div>
          <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-slate-400 bg-slate-200/50 px-2.5 py-1 rounded-md">{t('4 PRESETS READY')}</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {presets.map((p) => (
            <button
              id={`preset-btn-${p.id}`}
              key={p.id}
              onClick={() => handleApplyPreset(p)}
              className={`p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                selectedPresetId === p.id 
                  ? 'bg-white border-orange-500 ring-2 ring-orange-500/15 scale-[1.02] shadow-md'
                  : 'bg-white border-slate-200 hover:border-orange-300 hover:bg-orange-50/5 hover:scale-[1.01] shadow-xs hover:shadow-sm'
              }`}
            >
              {selectedPresetId === p.id && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-orange-500 text-white flex items-center justify-center rounded-bl-xl shadow-sm">
                  <Check className="h-4 w-4 stroke-[3px]" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl p-2 bg-slate-50 group-hover:bg-orange-50 rounded-xl select-none border border-slate-100 transition-colors shrink-0">
                  {p.icon}
                </span>
                <span className="text-[12px] font-black text-slate-900 uppercase tracking-tight line-clamp-2 leading-snug">
                  {t(p.label)}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                {t(p.desc)}
              </p>
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {p.pax} PAX
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {p.dur} {t('MIN')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 3. Interactive Input Panel (Left Column) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[5px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600"></div>
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 select-none">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md">
                <Sliders className="h-5.5 w-5.5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                  {t('Konfigurator Sesi')}
                </h3>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">{t('Kriteria & Target Sesi')}</p>
              </div>
            </div>
            <span className="text-[9.5px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-mono font-black tracking-tight animate-pulse">SYSTEM ONLINE</span>
          </div>
          
          <form id="session-configurator-form" onSubmit={handleGenerate} className="space-y-5 text-xs">
            <div>
              <label className="block font-black text-slate-700 uppercase tracking-wider mb-2 text-[10px] flex items-center gap-1.5 select-none">
                <span>🎯 {t('TUJUAN UTAMA ACARA')}</span>
              </label>
              <select 
                id="input-session-purpose"
                value={purpose}
                onChange={(e) => { setPurpose(e.target.value); sound.playClick(); }}
                className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl py-3 px-4 font-bold text-slate-800 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none cursor-pointer text-[12.5px] shadow-sm"
              >
                <option value="Pencair Suasana (Ice Breaking)">🧊 {t('Pencair Suasana (Ice Breaking)')}</option>
                <option value="Menaikkan Energi (Energizer)">⚡ {t('Menaikkan Energi (Energizer)')}</option>
                <option value="Membangun Teamwork Sinergi">🤝 {t('Membangun Teamwork Sinergi')}</option>
                <option value="Melatih Komunikasi Efektif">🗣️ {t('Melatih Komunikasi Efektif')}</option>
                <option value="Problem Solving & Kreativitas">💡 {t('Problem Solving & Kreativitas')}</option>
                <option value="Sales Pitching & Negosiasi">📈 {t('Sales Pitching & Negosiasi')}</option>
                <option value="Refleksi Kelas Penutup">🎯 {t('Refleksi Kelas Penutup')}</option>
              </select>
            </div>
 
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-black text-slate-700 uppercase tracking-wider mb-2 text-[10px] flex items-center gap-1.5 select-none">
                  <Users className="h-3.5 w-3.5 text-slate-400" /> <span>{t('JUMLAH PESERTA')}</span>
                </label>
                <div className="relative">
                  <input 
                    id="input-session-pax"
                    type="number" 
                    value={participantCount}
                    onChange={(e) => setParticipantCount(Number(e.target.value))}
                    min={1}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pl-4 pr-12 font-black text-slate-800 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-[12.5px] shadow-sm"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[9px] text-slate-400 font-extrabold select-none">PAX</span>
                </div>
              </div>
 
              <div>
                <label className="block font-black text-slate-700 uppercase tracking-wider mb-2 text-[10px] flex items-center gap-1.5 select-none">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> <span>{t('DURASI SESI')}</span>
                </label>
                <div className="relative">
                  <input 
                    id="input-session-duration"
                    type="number" 
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={1}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pl-4 pr-14 font-black text-slate-800 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-[12.5px] shadow-sm"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[9px] text-slate-400 font-extrabold select-none">{t('MENIT')}</span>
                </div>
              </div>
            </div>
 
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-black text-slate-700 uppercase tracking-wider mb-2 text-[10px] select-none">
                  {t('FORMAT SINKRON')}
                </label>
                <select 
                  id="input-session-format"
                  value={format}
                  onChange={(e) => { setFormat(e.target.value); sound.playClick(); }}
                  className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl py-3 px-4 font-bold text-slate-800 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none cursor-pointer text-[12.5px] shadow-sm"
                >
                  <option value="Offline">{t('Offline / Tatap Muka')}</option>
                  <option value="Online">{t('Online / Webinar Zoom')}</option>
                  <option value="Hybrid">{t('Hybrid (Kombinasi)')}</option>
                </select>
              </div>
 
              <div>
                <label className="block font-black text-slate-700 uppercase tracking-wider mb-2 text-[10px] select-none">
                  {t('LEVEL INTENSITAS')}
                </label>
                <select 
                  id="input-session-energy"
                  value={energyLevel}
                  onChange={(e) => { setEnergyLevel(e.target.value); sound.playClick(); }}
                  className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl py-3 px-4 font-bold text-slate-800 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none cursor-pointer text-[12.5px] shadow-sm"
                >
                  <option value="Calm">{t('Calm (Tenang & Reflektif)')}</option>
                  <option value="Medium">{t('Medium (Sedang & Menarik)')}</option>
                  <option value="High">{t('High (Aktif & Heboh)')}</option>
                </select>
              </div>
            </div>
 
            <div>
              <label className="block font-black text-slate-700 uppercase tracking-wider mb-2 text-[10px] flex items-center gap-1.5 select-none">
                <Target className="h-3.5 w-3.5 text-slate-400" /> <span>{t('PROFIL AUDIENS / PESERTA')}</span>
              </label>
              <input 
                id="input-session-audience"
                type="text"
                value={audienceType}
                onChange={(e) => setAudienceType(e.target.value)}
                placeholder={t('Misal: Karyawan HRD, Mahasiswa Baru, Siswa SD')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-bold text-slate-800 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none text-[12.5px] shadow-sm"
              />
            </div>

            <button
              id="btn-synthesis-submit"
              type="submit"
              disabled={isGenerating}
              className="w-full py-4 mt-6 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer transition-all duration-300 disabled:opacity-85 disabled:cursor-not-allowed select-none flex items-center justify-center gap-2.5"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4.5 w-4.5 animate-spin text-white" />
                  <span>{t('Sintesis Sedang Berlangsung...')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4.5 w-4.5 fill-white text-white animate-pulse" />
                  <span>{t('Sintesis Konsep dengan AI')}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* 4. Elegant Output Result Dashboard (Right Column) */}
        <div id="synthesis-results-wrapper" className="lg:col-span-7 space-y-8">
          
          {/* A. If Generator is generating */}
          {isGenerating && (
            <div className="bg-slate-950 text-white rounded-3xl p-8 md:p-10 border border-slate-800 shadow-2xl min-h-[530px] flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-950/20 via-slate-950 to-black"></div>
              
              {/* Spinning visual radar scanner */}
              <div className="relative z-10 mb-8">
                <div className="h-32 w-32 rounded-full border-4 border-dashed border-orange-500/50 animate-spin flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center animate-pulse">
                    <Cpu className="h-10 w-10 text-orange-400 animate-bounce" />
                  </div>
                </div>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                </span>
              </div>

              <div className="relative z-10 text-center w-full max-w-md space-y-6">
                <div className="space-y-1">
                  <h3 className="font-black text-white text-lg sm:text-xl uppercase tracking-wider animate-pulse font-mono">
                    {t('PROSES SINTESIS SKENARIO')}
                  </h3>
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest font-mono">
                    {t('Aktipan Deep Learning Engine')}
                  </p>
                </div>
                
                {/* Step loading bar progress */}
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(20, loadingStep * 25)}%` }}
                  ></div>
                </div>

                {/* Progress message and logs */}
                <div className="space-y-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl font-mono text-left shadow-inner">
                  <div className="flex items-center gap-2 text-[10px] text-amber-400 font-bold border-b border-slate-800 pb-2.5 mb-1.5">
                    <Terminal className="h-4 w-4 shrink-0" />
                    <span>{t('LOG ANALISA KOGNITIF')}</span>
                  </div>
                  <p className="text-slate-200 text-[12px] font-medium h-12 flex items-center leading-relaxed">
                    {getStepText(loadingStep)}
                  </p>
                  <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold pt-1.5 border-t border-slate-900">
                    <span>PLAYBOOK DATABASE CHECKED</span>
                    <span>Aktipan Engine v3.2</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* B. Default screen if no result generated yet */}
          {!isGenerating && generatedResult === null && (
            <div className="bg-gradient-to-br from-orange-50/40 via-amber-50/15 to-white rounded-3xl p-8 md:p-12 text-center text-slate-700 min-h-[530px] flex flex-col justify-center items-center shadow-xs relative overflow-hidden border border-amber-200/50">
              <div className="absolute top-0 right-0 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-indigo-200/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px]"></div>
              
              <div className="relative z-10 max-w-md space-y-6">
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 animate-pulse opacity-20"></div>
                  <div className="absolute inset-2 rounded-2xl bg-white border border-orange-100 shadow-md flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-orange-500 animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-3.5">
                  <span className="text-[10px] text-orange-800 font-extrabold uppercase tracking-widest bg-orange-100/80 border border-orange-200 px-4 py-2 rounded-full shadow-sm select-none font-mono">
                    READY FOR SENSATIONAL RESULTS
                  </span>
                  <h4 className="font-black text-2xl text-slate-900 tracking-tight pt-2">
                    {t('Layar Hasil Sintesis Aktipan AI')}
                  </h4>
                  <p className="text-slate-500 text-[12.5px] leading-relaxed max-w-sm mx-auto font-medium">
                    {t('Konfigurasikan sasaran sesi di panel sebelah kiri atau gunakan tombol preset cepat di atas, lalu klik')} <strong className="text-orange-600 font-extrabold">{t('Sintesis Konsep dengan AI')}</strong> {t('untuk melahirkan acara kustom luar biasa.')}
                  </p>
                </div>
                
                <div className="pt-8 border-t border-slate-200/60 flex flex-wrap gap-2.5 justify-center select-none">
                  <div className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-[11.5px] font-bold flex items-center gap-2 shadow-xs hover:border-orange-200 transition-colors">
                    <Zap className="h-4.5 w-4.5 text-orange-500 fill-orange-500/10 shrink-0" />
                    <span>High Engagement</span>
                  </div>
                  <div className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-[11.5px] font-bold flex items-center gap-2 shadow-xs hover:border-orange-200 transition-colors">
                    <Terminal className="h-4.5 w-4.5 text-orange-500 shrink-0" />
                    <span>{t('Naskah Pemandu MC')}</span>
                  </div>
                  <div className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-[11.5px] font-bold flex items-center gap-2 shadow-xs hover:border-orange-200 transition-colors">
                    <Lightbulb className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                    <span>{t('Panduan Debrief Sesi')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* C. Generated result ready */}
          {!isGenerating && generatedResult !== null && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
              
              {/* recommended existing playbook */}
              <div id="best-match-playbook-card" className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-44 h-44 bg-gradient-to-tr from-orange-100/30 to-amber-100/30 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2 select-none">
                    <span className="flex h-3 w-3 rounded-full bg-orange-500 animate-ping"></span>
                    <span className="text-[10.5px] font-black uppercase text-orange-800 bg-orange-100/80 border border-orange-200 px-3 py-1.5 rounded-full tracking-wider font-mono shadow-3xs">
                      {t('PLAYBOOK UTAMA COCOK')}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px] font-mono font-black tracking-widest uppercase select-none bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60">MATCH: 99.4%</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3">
                    <h3 className="text-lg md:text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors tracking-tight leading-snug">
                      {generatedResult.recommendation.activity_name}
                    </h3>
                    <p className="text-slate-500 text-[12.5px] leading-relaxed max-w-xl font-medium">
                      {generatedResult.recommendation.short_description}
                    </p>
                    <div className="flex flex-wrap gap-2.5 pt-2 select-none">
                      <span className="bg-slate-50 border border-slate-150 text-slate-700 px-3.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-2 shadow-3xs">
                        <Clock className="h-4 w-4 text-slate-400 shrink-0" /> {generatedResult.recommendation.duration_max} {t('Menit')}
                      </span>
                      <span className="bg-slate-50 border border-slate-150 text-slate-700 px-3.5 py-1.5 rounded-xl text-[11px] font-bold shadow-3xs">
                        🏷️ {generatedResult.recommendation.category}
                      </span>
                      <span className="bg-slate-50 border border-slate-150 text-slate-700 px-3.5 py-1.5 rounded-xl text-[11px] font-bold shadow-3xs">
                        ⚡ {generatedResult.recommendation.energy_level}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto pt-3 md:pt-0">
                    <button 
                      id="btn-view-playbook-detail"
                      onClick={() => { sound.playClick(); onSelectActivity(generatedResult.recommendation); }}
                      className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 px-6 rounded-2xl text-[12px] uppercase tracking-wider transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md active:scale-98"
                    >
                      <span>{t('Detail Panduan')}</span>
                      <ArrowUpRight className="h-4 w-4 stroke-[2.5px]" />
                    </button>
                    {onNavigateToRun && (
                      <button 
                        id="btn-run-playbook-game"
                        onClick={() => { sound.playClick(); onNavigateToRun(generatedResult.recommendation); }}
                        className="flex-1 md:flex-none bg-orange-500 hover:bg-orange-600 text-white font-black py-3.5 px-6 rounded-2xl text-[12px] uppercase tracking-wider transition-all cursor-pointer text-center flex items-center justify-center gap-2 shadow-md active:scale-98"
                      >
                        <Play className="h-4 w-4 fill-white text-white shrink-0" />
                        <span>{t('Luncurkan Game')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Newly Formulated Custom AI Activity Segment with Tabs */}
              <div id="custom-ai-concept-card" className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-7 relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-[5px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500"></div>

                {/* Concept Banner Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 select-none">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-orange-600 font-extrabold text-[10px] uppercase tracking-widest font-mono">
                      <Zap className="h-4 w-4 fill-orange-400 text-orange-500 animate-pulse" /> 
                      <span>{t('HASIL SINTESIS DOCK INSTAN')}</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                      {generatedResult.customActivity.name}
                    </h2>
                  </div>
                  <span className="text-[10.5px] bg-amber-50 border border-amber-200 px-4 py-2 text-orange-800 font-black uppercase rounded-2xl tracking-wider shadow-sm shrink-0 flex items-center gap-1.5 font-mono">
                    <Award className="h-4.5 w-4.5 text-orange-500 fill-orange-500/10" />
                    <span>AI CUSTOM CONCEPT</span>
                  </span>
                </div>

                {/* Tab Navigation Controls */}
                <div className="flex border-b border-slate-150 pb-2 overflow-x-auto gap-2 scrollbar-none select-none">
                  <button
                    id="tab-btn-concept"
                    onClick={() => { sound.playClick(); setActiveTab('concept'); }}
                    className={`py-2.5 px-4.5 rounded-xl text-[11.5px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 border ${
                      activeTab === 'concept'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-transparent text-white shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    📋 {t('Konsep Utama')}
                  </button>
                  <button
                    id="tab-btn-steps"
                    onClick={() => { sound.playClick(); setActiveTab('steps'); }}
                    className={`py-2.5 px-4.5 rounded-xl text-[11.5px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 border ${
                      activeTab === 'steps'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-transparent text-white shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    🚶 {t('Skenario Langkah')}
                  </button>
                  <button
                    id="tab-btn-mc"
                    onClick={() => { sound.playClick(); setActiveTab('mc'); }}
                    className={`py-2.5 px-4.5 rounded-xl text-[11.5px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 border ${
                      activeTab === 'mc'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-transparent text-white shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    🎙️ {t('Naskah MC')}
                  </button>
                  <button
                    id="tab-btn-debrief"
                    onClick={() => { sound.playClick(); setActiveTab('debrief'); }}
                    className={`py-2.5 px-4.5 rounded-xl text-[11.5px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 border ${
                      activeTab === 'debrief'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-transparent text-white shadow-md'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    🧠 {t('Debrief Refleksi')}
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="mt-6 min-h-[240px]">
                  
                  {/* Tab 1: Konsep Utama */}
                  {activeTab === 'concept' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="bg-orange-50/50 border-l-4 border-orange-500 p-5 rounded-r-2xl shadow-3xs">
                        <span className="text-[10px] font-black uppercase text-orange-800 tracking-wider block mb-1.5 font-mono">{t('Sinopsis Sesi Hasil AI')}</span>
                        <p className="text-slate-700 text-[13px] font-semibold leading-relaxed">
                          {generatedResult.customActivity.overview}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-3xs">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 font-mono">{t('FORMAT SINKRON')}</span>
                          <span className="text-[13px] font-extrabold text-slate-800">{generatedResult.customActivity.format}</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-3xs">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 font-mono">{t('DURASI')}</span>
                          <span className="text-[13px] font-extrabold text-slate-800">{generatedResult.customActivity.duration}</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-3xs">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 font-mono">{t('LEVEL INTENSITAS')}</span>
                          <span className="text-[13px] font-extrabold text-slate-800">{energyLevel}</span>
                        </div>
                        <div className="bg-slate-50 p-4 md:p-5 rounded-xl border border-slate-200 col-span-1 sm:col-span-3 shadow-3xs">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2.5 font-mono">{t('ALAT & KELENGKAPAN SESI')}</span>
                          <div className="flex flex-wrap gap-2">
                            {generatedResult.customActivity.tools.map((t: string, idx: number) => (
                              <span key={idx} className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-[11px] text-slate-700 font-bold shadow-3xs hover:border-orange-200 transition-colors">
                                🛠️ {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Skenario Langkah */}
                  {activeTab === 'steps' && (
                    <div className="space-y-5 animate-in fade-in duration-300">
                      <div className="flex items-center gap-2 text-[10.5px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3">
                        <ListTodo className="h-4.5 w-4.5 text-orange-500" />
                        <span>{t('Skenario Langkah Pelaksanaan')}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {generatedResult.customActivity.steps.map((st: string, idx: number) => (
                          <div key={idx} className="bg-slate-50/50 border border-slate-200 p-5 rounded-2xl flex gap-4 hover:border-orange-200 hover:bg-orange-50/5 transition-all duration-300 group shadow-3xs">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black flex items-center justify-center shrink-0 text-[12px] shadow-md group-hover:scale-105 transition-transform">
                              {idx + 1}
                            </div>
                            <p className="text-slate-700 text-[12.5px] font-medium leading-relaxed pt-0.5">
                              {st}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Naskah Pemandu MC */}
                  {activeTab === 'mc' && (
                    <div className="space-y-5 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2 text-[10.5px] font-black text-slate-900 uppercase tracking-widest">
                          <Terminal className="h-4.5 w-4.5 text-orange-500" />
                          <span>{t('Naskah Pro MC / Script Pemandu')}</span>
                        </div>
                        <button 
                          id="btn-copy-mc-script"
                          onClick={() => copyToClipboard(generatedResult.customActivity.script)}
                          className="bg-slate-50 hover:bg-orange-50 hover:text-orange-950 text-slate-700 py-2 px-4 rounded-xl border border-slate-200 shadow-3xs cursor-pointer flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-wider transition-all active:scale-98"
                          title={t('Salin Naskah')}
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3px]" />
                              <span className="text-emerald-600">{t('Tersalin!')}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-slate-400" />
                              <span>{t('Salin Naskah')}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="relative bg-amber-50/10 border border-amber-200/60 p-6 rounded-2xl shadow-3xs">
                        <span className="absolute left-2 top-0.5 text-7xl text-amber-300/40 select-none font-serif font-bold">“</span>
                        <div className="pl-6 my-2 relative z-10">
                          <p className="italic font-medium text-slate-800 text-[13px] leading-relaxed">
                            {generatedResult.customActivity.script}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 bg-gradient-to-r from-orange-50/60 to-amber-50/50 border border-orange-100/80 p-4 rounded-2xl">
                        <span className="text-xl select-none shrink-0 mt-0.5">💡</span>
                        <p className="text-[11.5px] text-orange-900 font-semibold leading-relaxed">
                          <strong>{t('Tips Karisma:')}</strong> {t('Lakukan kontak mata acak saat mengucapkan bagian pembuka, senyum lebar, dan buat gerak isyarat tangan terbuka untuk mentransfer antusiasme ke seluruh ruangan.')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Debrief & Refleksi */}
                  {activeTab === 'debrief' && (
                    <div className="space-y-5 animate-in fade-in duration-300">
                      <div className="flex items-center gap-2 text-[10.5px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3">
                        <Lightbulb className="h-4.5 w-4.5 text-amber-500" />
                        <span>{t('Pertanyaan Evaluasi & Debrief Sesi')}</span>
                      </div>
                      <p className="text-slate-500 text-[12px] leading-relaxed font-semibold">
                        {t('Setelah keseruan selesai, arahkan forum ke dalam diskusi refleksi mendalam berikut agar nilai pembelajaran tertanam secara emosional dan kognitif:')}
                      </p>
                      <div className="space-y-3">
                        {generatedResult.customActivity.debrief.map((dq: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 text-slate-700 font-semibold text-[12.5px] leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-200 shadow-3xs hover:border-orange-300 hover:bg-orange-50/5 transition-all duration-300">
                            <CheckCircle className="h-4.5 w-4.5 text-orange-500 shrink-0 mt-0.5" />
                            <span>{dq}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
