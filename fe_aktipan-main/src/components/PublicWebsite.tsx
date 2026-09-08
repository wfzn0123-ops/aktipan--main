import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, SlidersHorizontal, Sparkles, Zap, Hand, Smile, Users, MessageSquare, 
  Flag, Lightbulb, Target, HelpCircle, Flame, Clock, Laptop, Compass, Heart, 
  Map, Gift, BookOpen, Star, RefreshCw, Layers, ArrowRight, CheckCircle2, ShieldCheck, Gamepad2, Quote,
  Play, Pause, Volume2, VolumeX, Tv, Video
} from 'lucide-react';
import { ACTIVITIES, Activity, ACTIVITY_PACKS, ActivityPack } from '../data/activities';
import { useLanguage } from '../contexts/LanguageContext';

interface PublicWebsiteProps {
  onNavigate: (view: string) => void;
  onSelectActivity: (activity: Activity) => void;
  onSaveToggle: (activity: Activity) => void;
  savedActivities: Activity[];
  isLoggedIn: boolean;
  onLoginToggle: () => void;
}

export default function PublicWebsite({
  onNavigate,
  onSelectActivity,
  onSaveToggle,
  savedActivities,
  isLoggedIn,
  onLoginToggle
}: PublicWebsiteProps) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [energyFilter, setEnergyFilter] = useState<string>('All');
  const [formatFilter, setFormatFilter] = useState<string>('All');
  const [durationFilter, setDurationFilter] = useState<string>('All');

  // Real Interactive Video Demo states
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoProgress, setVideoProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setIsPlaying(false);
      setVideoProgress(0);
      setCurrentTime(0);
      videoRef.current.muted = isMuted;
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [activeVideoIndex]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => console.log("Video play error:", err));
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 0;
      setCurrentTime(current);
      setDuration(dur);
      if (dur > 0) {
        setVideoProgress((current / dur) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (videoRef.current && duration > 0) {
      const newTime = (value / 100) * duration;
      videoRef.current.currentTime = newTime;
      setVideoProgress(value);
      setCurrentTime(newTime);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const handlePipToggle = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.error("Picture-in-Picture error:", err);
      }
    }
  };

  const formatVideoTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const DEMO_VIDEOS = [
    {
      id: 'main-demo',
      title: 'Video Demo Utama: Cara Kerja Aktipan',
      category: 'Main Demo',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      poster: '/src/assets/images/aktipan_main_hero_1781686227742.jpg',
      description: 'Tonton bagaimana fasilitator mengorganisir games, menyalakan timer, dan menampilkan papan skor real-time di layar proyektor.',
      duration: '0:15',
      tag: 'Fitur Utama'
    },
    {
      id: 'instructor-guide',
      title: 'Panduan Instruktur: Tips Ice Breaking Sukses',
      category: 'Instructor Guide',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      poster: '/src/assets/images/academy_instructor_1781686248688.jpg',
      description: 'Pelajari cara praktis membawakan ice breaking di panggung, menjaga energi kelas, dan memecah kecanggungan audiens dengan taktik de-brief.',
      duration: '0:15',
      tag: 'Tips & Trik'
    },
    {
      id: 'runmode-tutorial',
      title: 'Demo Run-Mode & Live Arena',
      category: 'Run Mode Demo',
      src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      poster: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
      description: 'Uji coba instan bagaimana mode jalankan aktivitas bekerja: dilengkapi background music, interactive countdown timer, dan scoring system.',
      duration: '0:15',
      tag: 'Tutorial'
    }
  ];

  // Quick Filter Chips
  const categoryChips = [
    { label: 'Semua', emoji: '🔥', value: 'All' },
    { label: 'Ice Breaking', emoji: '👋', value: 'Ice Breaking' },
    { label: 'Energizer', emoji: '⚡', value: 'Energizer' },
    { label: 'Fun Games', emoji: '🎮', value: 'Fun Games' },
    { label: 'Team Building', emoji: '🤝', value: 'Team Building' },
    { label: 'Komunikasi', emoji: '🗣️', value: 'Communication' },
    { label: 'Kepemimpinan', emoji: '👑', value: 'Leadership' },
    { label: 'Problem Solving', emoji: '🧩', value: 'Problem Solving' },
    { label: 'Sales & Service', emoji: '🎯', value: 'Sales & Service' },
    { label: 'Kuis & Polling', emoji: '📝', value: 'Quiz & Polling' },
    { label: 'Refleksi', emoji: '🌟', value: 'Reflection' },
    { label: 'Travel & Special', emoji: '✈️', value: 'Travel & Special' }
  ];

  // Map category to styles/colors to make the dashboard colorful and visual-first
  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'Ice Breaking': return { bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-300', badge: 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200/50 dark:border-blue-800/50' };
      case 'Energizer': return { bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/40 text-orange-700 dark:text-orange-300', badge: 'bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200 border border-orange-200/50 dark:border-orange-800/50' };
      case 'Fun Games': return { bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300', badge: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200/50 dark:border-amber-800/50' };
      case 'Team Building': return { bg: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-300', badge: 'bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-200 border border-green-200/50 dark:border-green-800/50' };
      case 'Communication': return { bg: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900/40 text-teal-700 dark:text-teal-300', badge: 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-200/50 dark:border-teal-800/50' };
      case 'Leadership': return { bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/40 text-purple-700 dark:text-purple-300', badge: 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 border border-purple-200/50 dark:border-purple-800/50' };
      case 'Problem Solving': return { bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300', badge: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border border-indigo-200/50 dark:border-indigo-800/50' };
      case 'Sales & Service': return { bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300', badge: 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border border-rose-200/50 dark:border-rose-800/50' };
      case 'Quiz & Polling': return { bg: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-900/40 text-pink-700 dark:text-pink-300', badge: 'bg-pink-100 dark:bg-pink-900/60 text-pink-800 dark:text-pink-200 border border-pink-200/50 dark:border-pink-800/50' };
      case 'Reflection': return { bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200/50 dark:border-emerald-800/50' };
      default: return { bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900/40 text-sky-700 dark:text-sky-300', badge: 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 border border-sky-200/50 dark:border-sky-800/50' };
    }
  };

  // Filter 132 activities
  const filteredActivities = useMemo(() => {
    return ACTIVITIES.filter(activity => {
      // 1. Search Query
      const query = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        activity.activity_name.toLowerCase().includes(query) ||
        activity.category.toLowerCase().includes(query) ||
        activity.short_description.toLowerCase().includes(query) ||
        activity.tools_needed.some(t => t.toLowerCase().includes(query)) ||
        activity.suitable_event_filter.some(e => e.toLowerCase().includes(query));

      // 2. Category
      const matchesCategory = categoryFilter === 'All' || activity.category === categoryFilter;

      // 3. Energy
      const matchesEnergy = energyFilter === 'All' || activity.energy_level === energyFilter;

      // 4. Format
      const matchesFormat = formatFilter === 'All' || activity.format === formatFilter;

      // 5. Duration
      let matchesDuration = true;
      if (durationFilter !== 'All') {
        const minVal = activity.duration_min;
        if (durationFilter === '1_3') matchesDuration = minVal <= 3;
        else if (durationFilter === '5') matchesDuration = minVal === 5;
        else if (durationFilter === '10') matchesDuration = minVal === 10;
        else if (durationFilter === '15') matchesDuration = minVal === 15;
        else if (durationFilter === '30') matchesDuration = minVal >= 30;
      }

      return matchesSearch && matchesCategory && matchesEnergy && matchesFormat && matchesDuration;
    });
  }, [searchQuery, categoryFilter, energyFilter, formatFilter, durationFilter]);

  // Extract a few popular ones for the direct popular list
  const popularActivities = useMemo(() => {
    return ACTIVITIES.filter(a => [1, 2, 3, 11, 13, 31, 33, 35, 41, 51, 53, 71, 81, 101, 112].includes(a.id));
  }, []);

  return (
    <div id="public-website-view" className="bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors text-slate-900 dark:text-slate-100">
      {/* 1. Hero Section */}
      <section id="hero-heading-section" className="relative overflow-hidden bg-gradient-to-b from-blue-900 to-indigo-950 py-20 px-4 text-center text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent"></div>
        
        <div className="relative mx-auto max-w-4xl z-10">
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full border border-orange-500/30 tracking-wider mb-6">
            <Sparkles className="h-3 w-3 text-orange-400 animate-pulse" /> {t('TERBARU: AKTIVITAS GENERATOR DENGAN AI')}
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white leading-tight">
            {t('Temukan Aktivitas Interaktif untuk Membuat Peserta Lebih ')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">{t('Aktif dan Fun')}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-slate-300 font-light">
            {t('Aktipan adalah direktori games, ice breaking, energizer, quiz, challenge, role play, simulasi, dan reflection activity siap pakai untuk berbagai kebutuhan acara Anda.')}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onNavigate('directory')}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-400 hover:scale-105 cursor-pointer"
            >
              {t('Cari Aktivitas')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={() => onNavigate('packs')}
              className="w-full sm:w-auto border border-slate-700 bg-slate-900/40 rounded-xl px-6 py-3.5 text-base font-semibold hover:border-slate-500 transition-colors"
            >
              {t('Lihat Activity Pack')}
            </button>
            <button 
              onClick={() => onNavigate('generator')}
              className="w-full sm:w-auto border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 rounded-xl px-6 py-3.5 text-base font-semibold hover:bg-yellow-500/20 transition-colors"
            >
              {t('Uji Coba AI Democall')}
            </button>
          </div>
        </div>

        {/* Visual Hero Floating Badges */}
        <div className="mt-12 mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40 p-3 sm:p-5 backdrop-blur-md shadow-2xl">
          <div className="flex flex-wrap justify-center gap-3">
            <span className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-blue-400 border border-blue-500/20"><Hand className="h-3.5 w-3.5" /> {t('Ice Breaking')}</span>
            <span className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-orange-400 border border-orange-500/20"><Zap className="h-3.5 w-3.5" /> {t('Energizer')}</span>
            <span className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-emerald-400 border border-emerald-500/20"><Users className="h-3.5 w-3.5" /> {t('Team Building')}</span>
            <span className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-purple-400 border border-purple-500/20"><Flag className="h-3.5 w-3.5" /> {t('Corporate Training')}</span>
            <span className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-yellow-400 border border-yellow-500/20"><Star className="h-3.5 w-3.5" /> {t('Family Gathering')}</span>
            <span className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-rose-400 border border-rose-500/20"><Heart className="h-3.5 w-3.5" /> {t('Wedding Host')}</span>
          </div>
        </div>
      </section>

      {/* 1.5. Interactive Video Demo Theater Section */}
      <section id="interactive-video-demo-section" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-20">
        <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 mb-6 gap-4">
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md border border-blue-500/20 uppercase tracking-widest">
                <Video className="h-3 w-3 animate-pulse text-blue-400" /> {t('Wadah Video Demo Interaktif')}
              </span>
              <h2 className="text-2xl font-bold text-white mt-2 flex items-center gap-2">
                {t('Tonton Bagaimana Aktipan Menghidupkan Acara Anda')}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {t('Saksikan kemudahan panitia mengendalikan game directory dan menjalankan live timer dalam hitungan detik.')}
              </p>
            </div>

            {/* Video Selector Tabs */}
            <div className="flex flex-wrap gap-2">
              {DEMO_VIDEOS.map((video, idx) => (
                <button
                  key={video.id}
                  onClick={() => setActiveVideoIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    activeVideoIndex === idx
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/15'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="mr-1">{idx === 0 ? '📺' : idx === 1 ? '🎓' : '⚡'}</span>
                  {t(video.category)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Video Player Container */}
            <div className="lg:col-span-8">
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video group shadow-inner">
                {/* Real HTML5 Video Player */}
                <video
                  ref={videoRef}
                  src={DEMO_VIDEOS[activeVideoIndex].src}
                  poster={DEMO_VIDEOS[activeVideoIndex].poster}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onClick={handlePlayPause}
                  className="w-full h-full object-contain cursor-pointer"
                  playsInline
                />

                {/* Big Center Play Button Overlay (shown when not playing) */}
                {!isPlaying && (
                  <div 
                    onClick={handlePlayPause}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors cursor-pointer"
                  >
                    <div className="h-16 w-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-blue-500 transition-colors ring-4 ring-blue-500/30 group-hover:scale-110 duration-350 transform ease-out">
                      <Play className="h-8 w-8 fill-white ml-1" />
                    </div>
                  </div>
                )}

                {/* Custom Video Control Bar Overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 flex flex-col gap-2 translate-y-1 group-hover:translate-y-0 transition-transform duration-200 opacity-90 hover:opacity-100">
                  {/* Seek Slider progress */}
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={videoProgress}
                      onChange={handleSeek}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-4">
                      {/* Play/Pause icon control */}
                      <button 
                        onClick={handlePlayPause} 
                        className="hover:text-blue-400 transition-colors cursor-pointer"
                        title={isPlaying ? t('Pause') : t('Play')}
                      >
                        {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white" />}
                      </button>

                      {/* Mute/Unmute */}
                      <button 
                        onClick={handleMuteToggle} 
                        className="hover:text-blue-400 transition-colors cursor-pointer"
                        title={isMuted ? t('Unmute') : t('Mute')}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>

                      {/* Duration/Timing Info */}
                      <span className="font-mono text-[11px] text-slate-400">
                        {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Playback rate speed controller */}
                      <div className="flex items-center gap-1 bg-slate-800/80 rounded px-1.5 py-0.5 border border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('Speed')}:</span>
                        {[1, 1.5, 2].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={`text-[10px] font-extrabold px-1.5 rounded transition-colors ${
                              playbackSpeed === speed 
                                ? 'bg-blue-600 text-white' 
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>

                      {/* Picture-in-picture mode */}
                      <button 
                        onClick={handlePipToggle} 
                        className="hover:text-blue-400 transition-colors cursor-pointer"
                        title={t('Mini Player')}
                      >
                        <Tv className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Floating Tag */}
                <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-750 text-xs px-2 py-0.5 rounded font-extrabold text-blue-400 uppercase tracking-wide">
                  {DEMO_VIDEOS[activeVideoIndex].tag}
                </div>
              </div>
            </div>

            {/* Right Column: Video Description details */}
            <div className="lg:col-span-4 flex flex-col justify-center text-white">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">{t('Sedang Diputar:')}</span>
              <h3 className="text-xl font-extrabold text-white mt-1 leading-tight">
                {DEMO_VIDEOS[activeVideoIndex].title}
              </h3>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                {DEMO_VIDEOS[activeVideoIndex].description}
              </p>

              <div className="mt-6 pt-6 border-t border-slate-800 space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-slate-300 font-medium">{t('Real Video Player: Bukan Simulator / Mockup UI')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  <span className="text-slate-300 font-medium">{t('Full Media Controls: Seek, Mute, Speed, & PiP')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                  <span className="text-slate-300 font-medium">{t('Pilihan Skenario: Demo Utama, Instruktur, & Run-Mode')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Search & Filter Section (Interactive Catalog Showcase!) */}
      <section id="interactive-catalog-section" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-6">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              {t('Saran & Cari Aktivitas Langsung dari 132 Database Aktipan')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('Coba cari atau gunakan filter di bawah ini untuk melihat keajaiban direktori kami.')}</p>
          </div>

          {/* Search bar */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Cari ice breaking 5 menit, games teamwork, energizer tanpa alat, quiz online, role play sales...')}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-4 pl-10 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-base transition-all"
            />
          </div>

          {/* Filters Chips row */}
          <div className="mt-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">{t('Filter Kategori Aktivitas:')}</span>
            <div className="flex flex-wrap gap-2">
              {categoryChips.map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => setCategoryFilter(chip.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                    categoryFilter === chip.value 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {chip.emoji} {t(chip.label)}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Multi Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-1">{t('Level Energi:')}</label>
              <select 
                value={energyFilter}
                onChange={(e) => setEnergyFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('Semua Energi')}</option>
                <option value="Calm" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('Calm (Tenang / Refleksif)')}</option>
                <option value="Medium" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('Medium (Interaktif / Fokus)')}</option>
                <option value="High" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('High Energy (Fisik / Sangat Ramai)')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-1">{t('Format Permainan:')}</label>
              <select 
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('Semua Format')}</option>
                <option value="Offline" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('Offline / Tatap Muka')}</option>
                <option value="Online" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('Online / Virtual Gmeet/Zoom')}</option>
                <option value="Hybrid" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('Hybrid')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase mb-1">{t('Durasi Maksimal:')}</label>
              <select 
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('Semua Durasi')}</option>
                <option value="1_3" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('Sangat Singkat (1 - 3 Menit)')}</option>
                <option value="5" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('Cepat (5 Menit)')}</option>
                <option value="10" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('Standar (10 database)')}</option>
                <option value="15" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('Menengah (15 Menit)')}</option>
                <option value="30" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">{t('Lebih Panjang (>= 30 Menit)')}</option>
              </select>
            </div>
          </div>

          {/* Quick Count Badge */}
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 rounded-lg p-2 px-3">
            <span>{t('Ditemukan')} <strong className="text-slate-900 dark:text-white">{filteredActivities.length}</strong> {t('aktivitas interaktif cocok.')}</span>
            {(categoryFilter !== 'All' || searchQuery !== '' || energyFilter !== 'All' || formatFilter !== 'All' || durationFilter !== 'All') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('All');
                  setEnergyFilter('All');
                  setFormatFilter('All');
                  setDurationFilter('All');
                }}
                className="text-blue-500 dark:text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <RefreshCw className="h-3 w-3" /> {t('Reset Filter')}
              </button>
            )}
          </div>
        </div>

        {/* 132 Activities Explorer Result Showcase */}
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredActivities.slice(0, 9).map((activity) => {
              const theme = getCategoryTheme(activity.category);
              const isSaved = savedActivities.some(a => a.id === activity.id);

              return (
                <div 
                  key={activity.id} 
                  id={`activity-card-${activity.id}`}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/80 shadow-sm dark:shadow-black/20 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600 transition-all overflow-hidden flex flex-col group"
                >
                  {/* Card Header Tag & Favorite */}
                  <div className="px-5 pt-5 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider">#{activity.activity_number}</span>
                      <div className="flex items-center space-x-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide inline-block ${theme.badge}`}>
                          {t(activity.category)}
                        </span>
                        {activity.is_free ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-900/30">{t('Free')}</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900/30">{t('Premium')}</span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer" onClick={() => onSelectActivity(activity)}>
                      {activity.activity_name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5">{activity.short_description}</p>
                  </div>

                  {/* Quick Specs */}
                  <div className="px-5 py-3 bg-slate-50/60 dark:bg-slate-900/40 border-t border-b border-slate-100 dark:border-slate-700/60 grid grid-cols-3 text-center text-[11px] font-medium text-slate-500 dark:text-slate-400 gap-2">
                    <div>
                      <span className="block text-slate-400 dark:text-slate-500 font-bold uppercase text-[9px]">{t('Durasi')}</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{activity.duration_min}-{activity.duration_max} {t('Menit')}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 dark:text-slate-500 font-bold uppercase text-[9px]">{t('Format')}</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t(activity.format)}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 dark:text-slate-500 font-bold uppercase text-[9px]">{t('Energi')}</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t(activity.energy_level)}</span>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-4 mt-auto flex items-center justify-between bg-white dark:bg-slate-800 border-t border-slate-50 dark:border-slate-700/55">
                    <button
                      onClick={() => onSaveToggle(activity)}
                      className={`text-xs font-bold transition-all flex items-center gap-1 cursor-pointer py-1.5 px-3 rounded-lg ${
                        isSaved ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' : 'text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isSaved ? 'fill-rose-600' : ''}`} />
                      {isSaved ? t('Tersimpan') : t('Simpan')}
                    </button>

                    <button 
                      onClick={() => onSelectActivity(activity)}
                      className="text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors py-1.5 px-4 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t('Lihat Detail')}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredActivities.length > 9 && (
            <div className="text-center mt-10">
              <button
                onClick={() => {
                  if (!isLoggedIn) onLoginToggle();
                  onNavigate('directory');
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 font-bold px-6 py-3 transition-colors shadow-sm cursor-pointer"
              >
                <span>{t('Lihat Seluruh')} {filteredActivities.length} {t('Aktivitas Lainnya')}</span>
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. Kategori Aktivitas Section */}
      <section id="categories-grid-showcase" className="bg-white dark:bg-slate-800/40 py-16 border-t border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('Jelajahi Berdasarkan Kategori Aktivitas')}</h2>
            <p className="mt-4 text-base text-slate-500 dark:text-slate-400 font-light">{t('Pencarian yang berpusat pada dinamika aktivitas demi menyulut motivasi & interaksi peserta di setiap momen.')}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="border border-slate-100 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900 p-5 rounded-xl text-center hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer group" onClick={() => { setCategoryFilter('Ice Breaking'); window.scrollTo({top: 600, behavior: 'smooth'}); }}>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"><Hand className="h-6 w-6" /></div>
              <span className="block font-bold text-xs text-slate-800 dark:text-slate-200">{t('Ice Breaking')}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">10 {t('Aktivitas')}</span>
            </div>
            
            <div className="border border-slate-100 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900 p-5 rounded-xl text-center hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800 transition-all cursor-pointer group" onClick={() => { setCategoryFilter('Energizer'); window.scrollTo({top: 600, behavior: 'smooth'}); }}>
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"><Zap className="h-6 w-6" /></div>
              <span className="block font-bold text-xs text-slate-800 dark:text-slate-200">{t('Energizer')}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">10 {t('Aktivitas')}</span>
            </div>

            <div className="border border-slate-100 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900 p-5 rounded-xl text-center hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800 transition-all cursor-pointer group" onClick={() => { setCategoryFilter('Fun Games'); window.scrollTo({top: 600, behavior: 'smooth'}); }}>
              <div className="h-12 w-12 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"><Smile className="h-6 w-6" /></div>
              <span className="block font-bold text-xs text-slate-800 dark:text-slate-200">{t('Fun Games')}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">10 {t('Aktivitas')}</span>
            </div>

            <div className="border border-slate-100 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900 p-5 rounded-xl text-center hover:shadow-md hover:border-green-200 dark:hover:border-green-800 transition-all cursor-pointer group" onClick={() => { setCategoryFilter('Team Building'); window.scrollTo({top: 600, behavior: 'smooth'}); }}>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"><Users className="h-6 w-6" /></div>
              <span className="block font-bold text-xs text-slate-800 dark:text-slate-200">{t('Team Building')}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">10 {t('Aktivitas')}</span>
            </div>

            <div className="border border-slate-100 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900 p-5 rounded-xl text-center hover:shadow-md hover:border-cyan-200 dark:hover:border-cyan-800 transition-all cursor-pointer group" onClick={() => { setCategoryFilter('Communication'); window.scrollTo({top: 600, behavior: 'smooth'}); }}>
              <div className="h-12 w-12 bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"><BookOpen className="h-6 w-6" /></div>
              <span className="block font-bold text-xs text-slate-800 dark:text-slate-200">{t('Komunikasi')}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">10 {t('Aktivitas')}</span>
            </div>

            <div className="border border-slate-100 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900 p-5 rounded-xl text-center hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800 transition-all cursor-pointer group" onClick={() => { setCategoryFilter('Leadership'); window.scrollTo({top: 600, behavior: 'smooth'}); }}>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"><Flag className="h-6 w-6" /></div>
              <span className="block font-bold text-xs text-slate-800 dark:text-slate-200">{t('Kepemimpinan')}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">10 {t('Aktivitas')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Aktivitas Populer - Horizontal list display */}
      <section id="popular-activities-section" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="border-l-4 border-orange-500 pl-4 mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t('Aktivitas Terpopuler Pilihan MC & Fasilitator')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('Paling direkomendasikan dengan tingkat antusiasme luar biasa tinggi dari dewan audiens.')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {popularActivities.slice(0, 6).map((pa) => (
            <div key={pa.id} className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl p-4 flex items-start space-x-3 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer" onClick={() => onSelectActivity(pa)}>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/60 text-xs font-extrabold text-orange-700 dark:text-orange-300 shrink-0">★</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{pa.activity_name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{pa.short_description}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400 dark:text-slate-550">
                  <span className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded uppercase">{t(pa.category)}</span>
                  <span>{pa.duration_min} {t('Menit')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works-timeline" className="bg-slate-900 dark:bg-slate-950 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold">{t('Bagaimana Langkah Kerja Aktipan?')}</h2>
            <p className="mt-4 text-sm text-slate-400">{t('Dapatkan workflow run-mode komplit untuk mengaktifkan keriuhan acara secara instan dan cemerlang.')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-8 text-center relative">
            <div className="p-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/30 text-lg font-bold mb-4">1</span>
              <h4 className="font-bold text-sm text-white">1. {t('Cari Aktivitas')}</h4>
              <p className="text-xs text-slate-400 mt-2">{t('Telusuri ribuan data berdasarkan nama/tools.')}</p>
            </div>
            <div className="p-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-600/30 text-orange-400 border border-orange-500/30 text-lg font-bold mb-4">2</span>
              <h4 className="font-bold text-sm text-white">2. {t('Filter Kebutuhan')}</h4>
              <p className="text-xs text-slate-400 mt-2">{t('Dapatkan opsi instan menurut energy & format.')}</p>
            </div>
            <div className="p-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-lg font-bold mb-4">3</span>
              <h4 className="font-bold text-sm text-white">3. {t('Buka Detail')}</h4>
              <p className="text-xs text-slate-400 mt-2">{t('Pelajari script MC, do & donts, dan mitigasi.')}</p>
            </div>
            <div className="p-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-yellow-600/30 text-yellow-400 border border-yellow-500/30 text-lg font-bold mb-4">4</span>
              <h4 className="font-bold text-sm text-white">4. {t('Pelajari Tutorial')}</h4>
              <p className="text-xs text-slate-400 mt-2">{t('Dapatkan video preview instruksi peserta.')}</p>
            </div>
            <div className="p-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/30 text-purple-400 border border-purple-500/30 text-lg font-bold mb-4">5</span>
              <h4 className="font-bold text-sm text-white">5. {t('Simpan Koleksi')}</h4>
              <p className="text-xs text-slate-400 mt-2">{t('Kelompokkan ke pack custom milik Anda.')}</p>
            </div>
            <div className="p-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-600/30 text-rose-400 border border-rose-500/30 text-lg font-bold mb-4">6</span>
              <h4 className="font-bold text-sm text-white">6. {t('Jalankan Aktivitas')}</h4>
              <p className="text-xs text-slate-400 mt-2">{t('Hadirkan timer layar penuh, scoring, & leaderboard.')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials-section" className="bg-slate-50 dark:bg-slate-900/60 py-16 border-t border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3 border border-orange-200 dark:border-orange-900/40">
              💬 {t('TESTIMONI PENGGUNA')}
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t('Kata Mereka yang Telah Menggunakan Aktipan')}</h2>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-light">
              {t('Dengarkan langsung cerita sukses dari para trainer, MC, guru, HR, dan event organizer yang sukses meningkatkan antusiasme peserta hingga 200%.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700 p-6 shadow-sm dark:shadow-black/20 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col justify-between relative group">
              <div className="absolute top-6 right-6 text-slate-100 dark:text-slate-700/80 group-hover:text-slate-200 dark:group-hover:text-slate-600 transition-colors pointer-events-none">
                <Quote className="h-8 w-8 rotate-180" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-500" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic mb-6">
                  {t('"Aktipan benar-benar game changer! Dulu saya butuh waktu berjam-jam untuk meriset ice breaking yang cocok untuk corporate workshop. Sekarang tinggal filter berdasarkan energi, durasi, dan format, semuanya langsung tersedia dalam hitungan detik."')}
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                  AW
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{t('Andri Wijaya')}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t('Senior Corporate Trainer')}</p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700 p-6 shadow-sm dark:shadow-black/20 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col justify-between relative group">
              <div className="absolute top-6 right-6 text-slate-100 dark:text-slate-700/80 group-hover:text-slate-200 dark:group-hover:text-slate-600 transition-colors pointer-events-none">
                <Quote className="h-8 w-8 rotate-180" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-500" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic mb-6">
                  {t('"Menghadapi murid-murid generasi Z yang gampang bosan adalah tantangan besar. Berkat Aktipan, saya selalu punya ide game interaktif seru setiap memulai kelas. Murid-murid jadi jauh lebih antusias dan fokus belajar meningkat drastis!"')}
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                  SR
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{t('Siti Rahmawati')}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t('Guru SMA')}</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700 p-6 shadow-sm dark:shadow-black/20 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col justify-between relative group">
              <div className="absolute top-6 right-6 text-slate-100 dark:text-slate-700/80 group-hover:text-slate-200 dark:group-hover:text-slate-600 transition-colors pointer-events-none">
                <Quote className="h-8 w-8 rotate-180" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-500" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic mb-6">
                  {t('"Sebagai MC acara besar, saya dituntut untuk selalu bisa mencairkan suasana di awal panggung (opening ice breaking). Direktori Aktipan memberikan saya ratusan variasi taktis petunjuk MC siap pakai yang interaktif. Penonton langsung heboh!"')}
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                  CH
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{t('Christian Hartono')}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t('Professional Wedding MC')}</p>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700 p-6 shadow-sm dark:shadow-black/20 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col justify-between relative group">
              <div className="absolute top-6 right-6 text-slate-100 dark:text-slate-700/80 group-hover:text-slate-200 dark:group-hover:text-slate-600 transition-colors pointer-events-none">
                <Quote className="h-8 w-8 rotate-180" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-500" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic mb-6">
                  {t('"Kami memakai Aktipan untuk acara bulanan Team Building internal perusahaan. Sangat menghemat anggaran EO eksternal karena tim HR mandiri pun bisa mengeksekusi aktivitas seru dengan panduan de-brief yang berbobot."')}
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                  JA
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{t('Jessica Amalia')}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{t('HR People Development')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing Section */}
      <section id="pricing-saas-section" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900/40">{t('Paket Langganan')}</span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-3">{t('Akses Fleksibel untuk Segala Kebutuhan')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">{t('Mulai dengan gratis lalu upgrade sewaktu-waktu untuk melengkapi toolsets event organizer Anda.')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-slate-400 dark:text-slate-500 uppercase">{t('Plan Free')}</h4>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">Rp 0</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('Uji coba akses direktori dasar.')}</p>
              <ul className="text-xs space-y-2 mt-6 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500 rounded-full" /> {t('Akses 30 Aktivitas Gratis')}</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500 rounded-full" /> {t('Fitur Pencarian Dasar')}</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500 rounded-full" /> {t('Simpan 5 Aktivitas')}</li>
              </ul>
            </div>
            <button onClick={() => { if(!isLoggedIn)onLoginToggle(); onNavigate('directory'); }} className="mt-8 w-full py-2.5 text-xs font-bold text-center block bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">{t('Gunakan Versi Free')}</button>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-slate-400 dark:text-slate-500 uppercase">{t('Plan Starter')}</h4>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">Rp 49rb <span className="text-xs text-slate-400">/bln</span></div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('Sangat ramah bagi MC pemula kelas privat.')}</p>
              <ul className="text-xs space-y-2 mt-6 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t('Akses 80+ Aktivitas')}</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t('Unlimited Saved List')}</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t('Ekspor PDF Rundown')}</li>
              </ul>
            </div>
            <button onClick={() => { if(!isLoggedIn)onLoginToggle(); onNavigate('directory'); }} className="mt-8 w-full py-2.5 text-xs font-bold text-center block bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">{t('Upgrade Starter')}</button>
          </div>

          {/* Card 3 (Pro - Best Value) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-blue-600 p-6 flex flex-col justify-between relative shadow-lg">
            <span className="absolute -top-3 right-4 bg-orange-500 text-white font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">{t('POPULER • PENUH FITUR')}</span>
            <div>
              <h4 className="text-sm font-extrabold text-blue-600 dark:text-blue-400 uppercase font-extrabold">{t('Plan Pro')}</h4>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">Rp 99rb <span className="text-xs text-slate-400">/bln</span></div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('Untuk guru, trainer, korporat profesional.')}</p>
              <ul className="text-xs space-y-2 mt-6 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t('Semua 132 Aktivitas Premium')}</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t('AI Generator Tanpa Batas')}</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t('Mode Run & Timer Besar Layar')}</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t('Scoring & Leaderboard Real-time')}</li>
              </ul>
            </div>
            <button onClick={() => { if(!isLoggedIn)onLoginToggle(); onNavigate('directory'); }} className="mt-8 w-full py-2.5 text-xs font-bold text-center block bg-blue-600 text-white rounded-lg hover:bg-blue-500">{t('Mulai Langganan Pro')}</button>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-slate-450 dark:text-slate-500 uppercase">{t('Plan Business')}</h4>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">Rp 249rb <span className="text-xs text-slate-400">/bln</span></div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('Untuk Tim EO / Divisi HR Perusahaan.')}</p>
              <ul className="text-xs space-y-2 mt-6 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t('Integrasi Multi-Workspace')}</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t('Custom Activity Editor Tim')}</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t('Laporan Analitik Keaktifan')}</li>
              </ul>
            </div>
            <button onClick={() => { if(!isLoggedIn)onLoginToggle(); onNavigate('directory'); }} className="mt-8 w-full py-2.5 text-xs font-bold text-center block bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">{t('Hubungi Penjualan')}</button>
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section id="final-cta-footer-section" className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold">{t('Mulai cari aktivitas yang cocok untuk acara Anda')}</h2>
            <p className="text-slate-200 text-base mt-3 max-w-xl mx-auto">{t('Bergabunglah bersama ribuan panitia yang menghentikan kecanggungan audiens menggunakan Aktipan.')}</p>
            <button 
              onClick={() => {
                if(!isLoggedIn) onLoginToggle();
                onNavigate('directory');
              }}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-400 transition-colors font-bold px-8 py-3.5 shadow-lg max-w-xs text-sm cursor-pointer"
            >
              <span>{t('Daftar Akun & Coba Sekarang')}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
