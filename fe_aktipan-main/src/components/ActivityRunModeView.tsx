import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Play, Pause, RotateCcw, Check, Plus, Minus, Star, 
  BookOpen, Clipboard, AlertCircle, Gamepad2, Volume2, Bookmark, Flame,
  ChevronLeft, ChevronRight, Trophy, Zap, Sparkles, Clock, RefreshCw, Bell,
  CheckCircle, Tv, Headphones, Award, Maximize2, Minimize2, Copy, Sparkle, LayoutGrid, CheckSquare,
  Edit, Dices, Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity } from '../data/activities';
import { sound } from '../utils/sound';

interface ActivityRunModeViewProps {
  activity: Activity;
  onBack: () => void;
  onFinishRun: (stats: { id: number; name: string; durationUsed: number; teamsScores: any[] }) => void;
}

// Internal synthesis engine for offline SFX using browser Web Audio API
function playSynthesizedSound(type: 'whistle' | 'buzzer' | 'applause' | 'alert' | 'ding' | 'bonk' | 'fanfare' | 'tick') {
  if (!sound.isEnabled) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'whistle') {
      // Whistle: high sine with fast modulation
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, ctx.currentTime);
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(32, ctx.currentTime);
      
      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(180, ctx.currentTime);
      
      osc2.connect(modGain);
      modGain.connect(osc.frequency);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      
      osc.start();
      osc2.start();
      osc.stop(ctx.currentTime + 0.6);
      osc2.stop(ctx.currentTime + 0.6);
    } else if (type === 'buzzer') {
      // Coarse saw wave buzzer
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'applause') {
      // High-frequency sweep that simulates noise-like popcorn sound for clap waves
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 1.2);
      
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } else if (type === 'alert') {
      // Bright musical bell/chime
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, ctx.currentTime); // E6
      
      const merger = ctx.createChannelMerger(2);
      osc.connect(merger);
      osc2.connect(merger);
      
      merger.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
      
      osc.start();
      osc2.start();
      osc.stop(ctx.currentTime + 1.0);
      osc2.stop(ctx.currentTime + 1.0);
    } else if (type === 'ding') {
      // High, sweet, pleasant coin/chime sound (synthesized FM/Bell style)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.setValueAtTime(987.77, ctx.currentTime + 0.08); // B5 (quick step up)
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'bonk') {
      // Humorous low "bonk" bounce
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      osc.frequency.exponentialRampToValueAtTime(85, ctx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'fanfare') {
      // High bright celebratory trumpets-like arpeggio (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const durations = [0.07, 0.07, 0.07, 0.45];
      let timeOffset = 0;
      
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0.2, ctx.currentTime + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + timeOffset + durations[idx]);
        
        osc.start(ctx.currentTime + timeOffset);
        osc.stop(ctx.currentTime + timeOffset + durations[idx]);
        
        timeOffset += 0.08;
      });
    } else if (type === 'tick') {
      // Subtle clock tick/click sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000, ctx.currentTime);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    }
  } catch (e) {
    console.warn("Audio Context not supported or blocked by user gesture:", e);
  }
}

export default function ActivityRunModeView({
  activity,
  onBack,
  onFinishRun
}: ActivityRunModeViewProps) {
  // Timer settings
  const totalDurationSeconds = activity.duration_max * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalDurationSeconds);
  const [isActive, setIsActive] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Teams with unique icons, colors and sound indicators
  const [teams, setTeams] = useState<Array<{ name: string; score: number; color: string; icon: string }>>([
    { name: 'Red Lion Squad', score: 0, color: 'from-rose-500 to-red-600', icon: '🦁' },
    { name: 'Blue Eagles Squad', score: 0, color: 'from-blue-500 to-indigo-600', icon: '🦅' },
    { name: 'Green Forest Squad', score: 0, color: 'from-emerald-500 to-teal-500', icon: '🌲' },
    { name: 'Gold Sun Squad', score: 0, color: 'from-amber-400 to-orange-500', icon: '☀️' }
  ]);

  // Sorting mode
  const [autoSort, setAutoSort] = useState(false);

  // Custom targets checklist (Evaluasi Panggung)
  const [milestones, setMilestones] = useState([
    { text: "Briefing dipahami seluruh audiens 👋", checked: false },
    { text: "Kekakuan mencair / Seluruh kelompok tertawa 😁", checked: false },
    { text: "Tidak ada kubu peserta terisolasi 🤝", checked: false },
    { text: "Sirkulasi & mobilitas fisik aktif berjalan 🏃‍♂️", checked: false },
    { text: "Debriefing & refleksi tuntas dipetik 🎓", checked: false }
  ]);

  // Facilitator feedback notes
  const [facNotes, setFacNotes] = useState('');

  // Projector view screen toggle
  const [showProjector, setShowProjector] = useState(false);

  // Floating score popups state for dynamic gameplay
  const [floatingScores, setFloatingScores] = useState<Array<{ id: number; teamIdx: number; value: number }>>([]);

  // Clipboard copied animation feedback
  const [copiedScript, setCopiedScript] = useState(false);

  // Sesi Done modal / custom alert triggers
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [activeSoundFeedback, setActiveSoundFeedback] = useState<string | null>(null);

  // Interactive Facilitator Upgrades
  const [editingTeamIdx, setEditingTeamIdx] = useState<number | null>(null);
  const [tempTeamName, setTempTeamName] = useState('');
  const [tempTeamIcon, setTempTeamIcon] = useState('🦁');
  const [customMcScript, setCustomMcScript] = useState(activity.mc_script);
  const [isSpinning, setIsSpinning] = useState(false);
  const [randomTeamResult, setRandomTeamResult] = useState<string | null>(null);

  // Timer loop logic
  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          const nextVal = prev - 1;
          if (nextVal <= 10 && nextVal > 0) {
            playSynthesizedSound('tick');
          }
          return nextVal;
        });
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      triggerSfx('alert');
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  // Time formatting mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Adjust score helpers
  const handleUpdateScore = (idx: number, delta: number) => {
    setTeams((prev) => {
      const copy = [...prev];
      copy[idx].score = Math.max(0, copy[idx].score + delta);
      return copy;
    });

    // Spawn a temporary floating animation bubble
    const newFloat = { id: Date.now() + Math.random(), teamIdx: idx, value: delta };
    setFloatingScores(prev => [...prev, newFloat]);
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(item => item.id !== newFloat.id));
    }, 1200);

    if (delta > 0) {
      triggerSfx('ding');
    } else if (delta < 0) {
      triggerSfx('bonk');
    }
  };

  // Reset scores back to zero
  const resetAllScores = () => {
    setTeams((prev) => prev.map(t => ({ ...t, score: 0 })));
  };

  // Time scaler helper (+1 / -1 min)
  const scaleTime = (minutesDelta: number) => {
    setSecondsLeft(prev => Math.max(0, prev + minutesDelta * 60));
  };

  // Step navigator buttons
  const stepForward = () => {
    if (currentStepIdx < activity.step_by_step.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const stepBackward = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  // Sound effector master trigger
  const triggerSfx = (type: 'whistle' | 'buzzer' | 'applause' | 'alert' | 'ding' | 'bonk' | 'fanfare' | 'tick') => {
    setActiveSoundFeedback(type);
    playSynthesizedSound(type);
    setTimeout(() => {
      setActiveSoundFeedback(null);
    }, 450);
  };

  // Sorted teams array based on score if autoSort is active
  const processedTeams = autoSort 
    ? [...teams].sort((a, b) => b.score - a.score)
    : teams;

  const handleMilestoneCheck = (idx: number) => {
    const updated = [...milestones];
    const newChecked = !updated[idx].checked;
    updated[idx].checked = newChecked;
    setMilestones(updated);
    if (newChecked) {
      triggerSfx('fanfare');
    } else {
      triggerSfx('bonk');
    }
  };

  const handleFinishSesiClick = () => {
    setShowDoneModal(true);
  };

  const handleConfirmFinish = () => {
    setShowDoneModal(false);
    onFinishRun({
      id: activity.id,
      name: activity.activity_name,
      durationUsed: Math.max(1, activity.duration_max - Math.round(secondsLeft / 60)),
      teamsScores: teams
    });
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(customMcScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleRandomizeSquad = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setRandomTeamResult(null);
    triggerSfx('whistle');
    
    let spinCount = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * teams.length);
      setRandomTeamResult(teams[randomIdx].name);
      playSynthesizedSound('tick');
      spinCount++;
      if (spinCount > 10) {
        clearInterval(interval);
        const finalIdx = Math.floor(Math.random() * teams.length);
        const winner = teams[finalIdx];
        setRandomTeamResult(winner.name);
        setIsSpinning(false);
        triggerSfx('fanfare');
      }
    }, 120);
  };

  const startEditTeam = (idx: number) => {
    setEditingTeamIdx(idx);
    setTempTeamName(teams[idx].name);
    setTempTeamIcon(teams[idx].icon);
  };

  const saveTeamEdit = () => {
    if (editingTeamIdx !== null) {
      setTeams(prev => prev.map((t, idx) => {
        if (idx === editingTeamIdx) {
          return { ...t, name: tempTeamName.trim() || t.name, icon: tempTeamIcon };
        }
        return t;
      }));
      setEditingTeamIdx(null);
    }
  };

  const elapsedPercent = Math.min(100, Math.max(0, ((totalDurationSeconds - secondsLeft) / totalDurationSeconds) * 100));
  const activeStepText = activity.step_by_step[currentStepIdx] || '';
  const checkedMilestonesCount = milestones.filter(m => m.checked).length;

  return (
    <div id="run-mode-panel" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 min-h-screen rounded-2xl border border-slate-900/90 relative shadow-2xl">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

      {/* HEADER SECTION WITH CONTROL ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-6 mb-8 gap-4 relative z-10">
        <div className="space-y-3">
          <button 
            onClick={onBack}
            className="group inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-black border border-slate-800 transition-all cursor-pointer shadow-sm hover:border-slate-700"
          >
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform text-indigo-400" />
            Kembali ke Detail Game
          </button>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase font-mono bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 shadow-2xs">
              Live Stage Console Aktif
            </span>
            <span className="h-2 w-2 rounded-full bg-indigo-500 ml-1.5" />
            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase font-mono bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20 shadow-2xs">
              UAT READY
            </span>
          </div>
        </div>

        <div className="md:text-right space-y-2">
          <div className="flex items-center md:justify-end gap-2 text-xs">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-3 py-1 rounded-full font-black uppercase tracking-tight text-[9px]">
              {activity.category}
            </span>
            <span className="bg-slate-900 text-slate-400 font-bold px-2.5 py-1 rounded border border-slate-800 font-mono text-[9px]">
              KODE #{activity.activity_number}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
            {activity.activity_name}
          </h2>
        </div>
      </div>

      {/* CORE CONTROL GRID SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT COMPONENT: STAGE RUNNER CHECKLIST (4 COLS) */}
        <div className="lg:col-span-4 bg-slate-900/35 border border-slate-800 rounded-2xl p-6.5 space-y-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-400" />
                  Alur & Langkah Game
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded font-mono font-black">
                  {currentStepIdx + 1} / {activity.step_by_step.length}
                </span>
              </h3>
              
              {/* Step progression bar */}
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-3">
                <div 
                  className="bg-indigo-500 h-1.5 transition-all duration-300"
                  style={{ width: `${((currentStepIdx + 1) / activity.step_by_step.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2.5 max-h-[330px] overflow-y-auto pr-1">
              {activity.step_by_step.map((step, idx) => {
                const isSelected = currentStepIdx === idx;
                const isCompleted = idx < currentStepIdx;

                return (
                  <div 
                    key={idx}
                    onClick={() => setCurrentStepIdx(idx)}
                    className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all duration-200 ${
                      isSelected 
                        ? 'bg-indigo-600/15 border-indigo-500/80 text-indigo-50 font-extrabold shadow-md scale-[1.01]' 
                        : isCompleted
                          ? 'bg-slate-900/20 border-slate-900/40 text-slate-500 line-through'
                          : 'bg-slate-900/40 border-slate-900 text-slate-300 hover:border-slate-800 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <span className={`inline-flex shrink-0 h-5.5 w-5.5 items-center justify-center rounded-full text-[10px] font-mono font-black transition-all ${
                        isSelected 
                          ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/15' 
                          : isCompleted 
                            ? 'bg-slate-800 text-slate-600'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isCompleted ? '✓' : idx + 1}
                      </span>
                      <span className="text-xs leading-relaxed">{step}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-5 pt-3">
            {/* Quick previous/next button selectors */}
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={currentStepIdx === 0}
                onClick={stepBackward}
                className="py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] font-black text-slate-300 inline-flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all hover:scale-102"
              >
                <ChevronLeft className="h-4 w-4" /> SEBELUMNYA
              </button>
              <button
                disabled={currentStepIdx === activity.step_by_step.length - 1}
                onClick={stepForward}
                className="py-3 px-4 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-[11px] font-black inline-flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all shadow-md hover:scale-102"
              >
                BERIKUTNYA <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Logistics Tools card */}
            <div className="pt-4 border-t border-slate-900 space-y-2.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">
                Alat & Perlengkapan Kerja:
              </span>
              <div className="flex flex-wrap gap-2">
                {activity.tools_needed.length > 0 ? (
                  activity.tools_needed.map((tool, idx) => (
                    <span key={idx} className="bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-300 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-450 animate-pulse" />
                      {tool}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-500 italic">Tanpa Alat Logistik Khusus (Fleksibel)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COMPONENT: MAIN COUNTDOWN & LIVE SOUND EFFECT PANEL (4 COLS) */}
        <div className="lg:col-span-4 bg-slate-900/45 border border-slate-800 rounded-2xl p-7 flex flex-col justify-between items-center text-center relative overflow-hidden min-h-[500px] shadow-xl">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-950">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-1.5 transition-all duration-1000"
              style={{ width: `${100 - elapsedPercent}%` }}
            />
          </div>

          <div className="w-full space-y-2 mt-2">
            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase font-mono flex items-center justify-center gap-1.5">
              <Clock className="h-4 w-4 text-indigo-400" /> SISA WAKTU GAMEPLAY
            </span>

            {/* GIANT DYNAMIC SCOREBOARD TIMER */}
            <motion.div 
              style={{ textShadow: isActive ? '0 0 25px rgba(16,185,129,0.2)' : 'none' }}
              animate={isActive ? { scale: [1, 1.018, 1] } : { scale: 1 }}
              transition={isActive ? { repeat: Infinity, duration: 1.0, ease: "easeInOut" } : undefined}
              className={`text-6xl sm:text-7xl font-extrabold font-mono tracking-tighter py-6 select-none transition-all duration-300 relative inline-block w-full bg-slate-950/70 rounded-2xl border border-slate-900 ${
                secondsLeft === 0 
                  ? 'text-rose-500 animate-pulse border-rose-500/25 bg-rose-500/5' 
                  : isActive 
                    ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.01]' 
                    : 'text-slate-300'
              }`}
            >
              {formatTime(secondsLeft)}
              
              {isActive && (
                <span className="absolute top-2 right-4 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </motion.div>

            {/* Control triggers & offset timers */}
            <div className="flex items-center justify-center gap-2.5 pt-2.5 pb-5 border-b border-slate-900">
              <button
                onClick={() => scaleTime(-1)}
                className="p-1.5 px-3 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-lg text-[10px] font-extrabold border border-slate-800 transition-colors cursor-pointer"
                title="Kurangi 1 menit"
              >
                -1 M
              </button>

              <button 
                onClick={() => setIsActive(!isActive)}
                className={`py-2.5 px-6 rounded-xl text-xs font-black tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md hover:scale-102 ${
                  isActive 
                    ? 'bg-amber-600 hover:bg-amber-550 text-white' 
                    : 'bg-emerald-600 hover:bg-emerald-550 text-white'
                }`}
              >
                {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isActive ? 'PAUSE TIMER' : 'MULAI TIMER'}
              </button>

              <button 
                onClick={() => {
                  setIsActive(false);
                  setSecondsLeft(activity.duration_max * 60);
                }}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-450 hover:text-slate-200 p-2.5 rounded-xl transition-colors cursor-pointer hover:scale-102"
                title="Setel Ulang Asli"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={() => scaleTime(1)}
                className="p-1.5 px-3 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-lg text-[10px] font-extrabold border border-slate-800 transition-colors cursor-pointer"
                title="Tambah 1 menit"
              >
                +1 M
              </button>
            </div>
          </div>

          {/* DYNAMIC SOUND COCKPIT BAR */}
          <div className="w-full py-5 space-y-4 border-b border-slate-900">
            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase font-mono flex items-center justify-center gap-1.5">
              <Headphones className="h-3.5 w-3.5 text-orange-400" />
              SFX SOUNDBOARD CONTROLLER
            </span>

            <div className="grid grid-cols-2 gap-2.5 text-center">
              <button 
                onClick={() => triggerSfx('whistle')}
                className={`py-2.5 px-3.5 rounded-xl text-[11px] font-black tracking-tight border text-left flex items-center justify-between transition-all cursor-pointer hover:scale-102 ${
                  activeSoundFeedback === 'whistle' 
                    ? 'bg-orange-500/20 border-orange-400 text-white scale-[0.98]' 
                    : 'bg-slate-950 border-slate-900 hover:bg-slate-900 text-orange-400'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5 text-orange-500" />
                  <span>Peluit Wasit</span>
                </span>
                <span>🔔</span>
              </button>

              <button 
                onClick={() => triggerSfx('buzzer')}
                className={`py-2.5 px-3.5 rounded-xl text-[11px] font-black tracking-tight border text-left flex items-center justify-between transition-all cursor-pointer hover:scale-102 ${
                  activeSoundFeedback === 'buzzer' 
                    ? 'bg-rose-500/20 border-rose-400 text-white scale-[0.98]' 
                    : 'bg-slate-950 border-slate-900 hover:bg-slate-900 text-rose-400'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                  <span>Bel Buzzer</span>
                </span>
                <span>🚨</span>
              </button>

              <button 
                onClick={() => triggerSfx('applause')}
                className={`py-2.5 px-3.5 rounded-xl text-[11px] font-black tracking-tight border text-left flex items-center justify-between transition-all cursor-pointer hover:scale-102 ${
                  activeSoundFeedback === 'applause' 
                    ? 'bg-indigo-500/20 border-indigo-400 text-white scale-[0.98]' 
                    : 'bg-slate-950 border-slate-900 hover:bg-slate-900 text-indigo-400'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Tepuk Tangan</span>
                </span>
                <span>👏</span>
              </button>

              <button 
                onClick={() => triggerSfx('alert')}
                className={`py-2.5 px-3.5 rounded-xl text-[11px] font-black tracking-tight border text-left flex items-center justify-between transition-all cursor-pointer hover:scale-102 ${
                  activeSoundFeedback === 'alert' 
                    ? 'bg-amber-500/20 border-amber-400 text-white scale-[0.98]' 
                    : 'bg-slate-950 border-slate-900 hover:bg-slate-900 text-amber-400'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-amber-500" />
                  <span>Gong Sesi</span>
                </span>
                <span>🛎️</span>
              </button>
            </div>

            {/* LEVEL METER SIMULATOR */}
            <div className="flex gap-0.5 justify-center h-4 items-end mt-1 px-1 opacity-60">
              {[...Array(16)].map((_, i) => {
                const isPulse = activeSoundFeedback !== null;
                const height = isPulse ? Math.floor(Math.random() * 12) + 4 : 2;
                let color = "bg-emerald-500";
                if (i > 11) color = "bg-rose-500";
                else if (i > 8) color = "bg-yellow-500";
                
                return (
                  <div 
                    key={i} 
                    className={`w-1 rounded-sm ${color} transition-all duration-75`}
                    style={{ height: `${height}px` }}
                  />
                );
              })}
            </div>
          </div>

          {/* AUDIENCE DISPLAY SIMULATION */}
          <div className="w-full pt-4 text-left space-y-2.5">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
              <span>PROYEKSI LAYAR AUDIENS</span>
              <span className="text-emerald-500 flex items-center gap-1.5 font-bold">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                ONLINE
              </span>
            </div>
            
            <button 
              onClick={() => {
                triggerSfx('alert');
                setShowProjector(true);
              }}
              className="group w-full bg-gradient-to-r from-indigo-950/45 to-slate-900 hover:from-indigo-900/60 hover:to-slate-800 text-indigo-350 hover:text-white py-3.5 px-4 rounded-xl font-bold border border-indigo-900/40 flex items-center justify-center gap-2.5 text-xs transition-all cursor-pointer shadow-sm hover:scale-[1.01]"
            >
              <Tv className="h-4.5 w-4.5 text-indigo-450 group-hover:scale-110 transition-transform" />
              📺 Tampilkan Layar Proyektor (Screen Mode)
            </button>
          </div>
        </div>

        {/* RIGHT COMPONENT: SCOREKEEPING, METADATA & CATATAN GAMIFIED (4 COLS) */}
        <div className="lg:col-span-4 bg-slate-900/35 border border-slate-800 rounded-2xl p-6.5 space-y-6 flex flex-col justify-between shadow-xl">
          
          {/* SCRIPT MC SNAPSHOT */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Clipboard className="h-4 w-4 text-orange-450" />
                NASKAH SCRIPT MC AKTIF (LIVE EDITABLE)
              </h3>
              <button 
                onClick={handleCopyScript}
                className="text-[10px] font-bold text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
                title="Salin Naskah MC"
              >
                <Copy className="h-3 w-3" />
                {copiedScript ? 'Tersalin' : 'Salin'}
              </button>
            </div>
            
            <textarea 
              value={customMcScript}
              onChange={(e) => setCustomMcScript(e.target.value)}
              placeholder="Ubah naskah MC Anda di sini untuk menyesuaikan situasi panggung..."
              className="w-full bg-slate-950 p-3.5 rounded-xl border border-slate-900 italic text-slate-200 leading-relaxed text-[11px] h-[95px] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none font-serif shadow-2xs"
            />
          </div>

          {/* SQUADS SCOREBOARD / LEADERBOARD */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-500" />
                Skor & Klasemen (Klik Nama Untuk Edit)
              </h3>
              
              <button 
                onClick={() => setAutoSort(!autoSort)}
                className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  autoSort 
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30' 
                    : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
              >
                Auto Sort
              </button>
            </div>

            <div className="space-y-2.5">
              {processedTeams.map((team, idx) => {
                // Find original index inside mutable state teams array to avoid updating wrong element in sorted lists
                const originalIndex = teams.findIndex(t => t.name === team.name);
                
                // Rank calculation
                const sortedRanks = [...teams].sort((a,b) => b.score - a.score);
                const rankIdx = sortedRanks.findIndex(t => t.name === team.name);
                const rankIcon = rankIdx === 0 ? '🥇' : rankIdx === 1 ? '🥈' : rankIdx === 2 ? '🥉' : '🎖️';

                return (
                  <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-900/70 hover:bg-slate-900/30 transition-all flex flex-col gap-2 relative overflow-visible">
                    {/* Floating score feedback animations */}
                    <AnimatePresence>
                      {floatingScores.filter(fs => fs.teamIdx === originalIndex).map(fs => (
                        <motion.span
                          key={fs.id}
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: -25, scale: 1.25 }}
                          exit={{ opacity: 0, scale: 0.8, y: -40 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`absolute right-12 top-2 text-[10px] font-black px-2 py-0.5 rounded-full pointer-events-none z-20 shadow-md ${
                            fs.value > 0 
                              ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/25' 
                              : 'text-rose-400 bg-rose-500/15 border border-rose-500/25'
                          }`}
                        >
                          {fs.value > 0 ? `+${fs.value}` : fs.value}
                        </motion.span>
                      ))}
                    </AnimatePresence>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{rankIcon}</span>
                        <button 
                          onClick={() => startEditTeam(originalIndex)}
                          className="text-xs font-black text-slate-100 hover:text-indigo-400 flex items-center gap-1.5 transition-colors cursor-pointer group text-left"
                          title="Klik untuk ubah nama atau emoji squad"
                        >
                          <span className="text-sm shrink-0">{team.icon}</span>
                          <span className="hover:underline">{team.name}</span>
                          <Edit className="h-2.5 w-2.5 text-slate-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleUpdateScore(originalIndex, -10)}
                          className="h-6 w-6 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs cursor-pointer border border-slate-800 transition-colors"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-amber-400 w-8 text-center font-mono">{team.score}</span>
                        <button 
                          onClick={() => handleUpdateScore(originalIndex, 10)}
                          className="h-6 w-6 rounded bg-indigo-600 hover:bg-indigo-550 text-white flex items-center justify-center font-bold text-xs cursor-pointer transition-all"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Progress score bar */}
                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-1 transition-all duration-300"
                        style={{ width: `${Math.min(100, (team.score / Math.max(100, ...teams.map(t=>t.score))) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick reset of scores */}
            <div className="flex justify-between pt-1 text-[9px]">
              <span className="text-slate-500 font-bold">Lomba berjalan adil & sportif</span>
              <button 
                onClick={resetAllScores}
                className="font-black uppercase tracking-wider text-rose-500/75 hover:text-rose-400 transition-all flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-2.5 w-2.5 animate-spin-slow" /> Reset Semua Nilai
              </button>
            </div>
          </div>

          {/* SQUADS RANDOMIZER ENGINE */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 space-y-3 shadow-2xs">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
                <Dices className="h-3.5 w-3.5 text-emerald-400 animate-spin-slow" /> PENENTU GILIRAN / SQUAD ACAK
              </span>
              {randomTeamResult && (
                <button 
                  onClick={() => setRandomTeamResult(null)}
                  className="text-[8px] font-bold text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRandomizeSquad}
                disabled={isSpinning}
                className={`flex-1 py-2 px-3.5 bg-indigo-600/10 hover:bg-indigo-600/25 text-indigo-400 hover:text-indigo-350 rounded-xl text-[10px] font-black border border-indigo-950 flex items-center justify-center gap-1.5 cursor-pointer transition-all ${isSpinning ? 'animate-pulse' : ''}`}
              >
                <Dices className="h-3.5 w-3.5" /> 
                {isSpinning ? 'MEMILIH...' : 'ACAK SQUAD SEKARANG'}
              </button>
              
              {randomTeamResult && (
                <div className="bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-extrabold text-[10px] px-3 py-2 rounded-xl flex items-center gap-1 animate-bounce-slow shrink-0 max-w-[130px] truncate">
                  🎉 {randomTeamResult}
                </div>
              )}
            </div>
          </div>

          {/* DYNAMIC TARGETS EVALUATION PANEL */}
          <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-mono">
              🎯 TARGET EVALUASI KEBERHASILAN ({checkedMilestonesCount} / {milestones.length})
            </span>

            <div className="space-y-2 text-[11px]">
              {milestones.map((m, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleMilestoneCheck(idx)}
                  className="flex items-center gap-3 text-slate-300 cursor-pointer select-none bg-slate-950 p-2.5 rounded-xl border border-slate-900 hover:border-slate-800 hover:bg-slate-950/80 transition-all"
                >
                  <span className={`h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                    m.checked ? 'bg-emerald-500 border-emerald-400 text-white shadow-2xs' : 'border-slate-800 bg-slate-900'
                  }`}>
                    {m.checked && <Check className="h-3 w-3" />}
                  </span>
                  <span className={m.checked ? 'line-through text-slate-550' : 'text-slate-300 font-semibold'}>
                    {m.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FACILITATOR LOG VALUE */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
              Catatan Lapangan & Feedback:
            </label>
            <textarea 
              rows={2}
              value={facNotes}
              onChange={(e) => setFacNotes(e.target.value)}
              placeholder="Amati respon audiens, kendala logistik, rintangan cuaca, atau letupan tawa peserta..."
              className="w-full bg-slate-950 border border-slate-900 rounded-xl p-2.5 text-xs text-slate-100 placeholder:text-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-650 transition-all"
            />
          </div>

          {/* FINISH TRIGGER */}
          <button
            onClick={handleFinishSesiClick}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-450 hover:to-amber-450 text-xs font-black text-white rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] text-center"
          >
            Selesaikan Sesi & Catat Laporan Acara 🏆
          </button>

        </div>
      </div>

      {/* DYNAMIC VIRTUAL OVERHEAD PROJECTOR MODAL */}
      <AnimatePresence>
        {showProjector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProjector(false)}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-md"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="relative bg-slate-900 text-slate-100 rounded-3xl p-6 md:p-8 border border-indigo-900/50 shadow-2xl max-w-4xl w-full z-10 flex flex-col space-y-6 overflow-y-auto max-h-[90vh]"
            >
              {/* Projector Header */}
              <div className="flex justify-between items-center border-b border-indigo-950 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-black tracking-widest text-emerald-400 font-mono bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-900/30">
                    VIRTUAL AUDIENCE SCREEN SIMULATOR
                  </span>
                </div>
                
                <button 
                  onClick={() => setShowProjector(false)}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white p-2 rounded-xl transition-all cursor-pointer"
                  title="Kembali ke Konsol"
                >
                  <Minimize2 className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Layout Content Proyektor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* Left side: Countdown and active step details */}
                <div className="space-y-5 bg-slate-950 p-6 rounded-2xl border border-indigo-950/60 flex flex-col items-center justify-center text-center py-8">
                  <span className="text-xs font-black text-indigo-400 tracking-wider uppercase font-mono">
                    WAKTU TERSISA
                  </span>
                  
                  <div className="text-6xl md:text-7xl font-extrabold text-white font-mono tracking-tighter">
                    {formatTime(secondsLeft)}
                  </div>
                  
                  <div className="space-y-2 border-t border-indigo-950/50 pt-4 w-full">
                    <span className="text-[10px] text-slate-555 font-black uppercase tracking-wider font-mono">
                      TAHAPAN SEKARANG
                    </span>
                    <p className="text-sm text-slate-200 font-extrabold max-w-sm mx-auto leading-relaxed">
                      {activeStepText || "Persiapan Sesi Game"}
                    </p>
                  </div>
                </div>

                {/* Right side: Live Leaderboard Podest */}
                <div className="space-y-4 bg-slate-950/40 p-5 rounded-2xl border border-slate-800">
                  <span className="text-xs font-black text-amber-450 tracking-wider uppercase font-mono block text-center">
                    PAPAN KLASEMEN SQUAD
                  </span>

                  <div className="space-y-2.5">
                    {[...teams].sort((a,b) => b.score - a.score).map((team, index) => {
                      const progress = Math.min(100, (team.score / Math.max(10, ...teams.map(t=>t.score))) * 100);
                      const rankEmblems = index === 0 ? '🏆 1st' : index === 1 ? '🥈 2nd' : index === 2 ? '🥉 3rd' : '🎗️ 4th';
                      
                      return (
                        <div key={index} className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-900">
                          <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{team.icon}</span>
                              <span className="font-extrabold text-slate-200">{team.name}</span>
                            </div>
                            <span className="font-mono text-indigo-400 font-black">{team.score} PT</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-grow bg-slate-900 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-indigo-500 h-2 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-black text-slate-400 w-10 text-right">{rankEmblems}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Bottom message */}
              <div className="text-center py-2 bg-slate-950/50 border border-slate-900 rounded-xl">
                <p className="text-xs text-indigo-350 font-bold tracking-tight animate-pulse">
                  🌟 "Main bersama, tumbuh bersama! Raih skor setinggi mungkin untuk Squad Anda!" 🌟
                </p>
              </div>

              {/* Quick instructions to projectionist */}
              <div className="text-[10px] text-slate-500 text-center leading-relaxed font-mono">
                Tip Fasilitator: Hubungkan laptop/tablet Anda ke layar proyektor utama melalui HDMI / AirPlay, lalu tekan tombol Fullscreen di browser.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DYNAMIC INTERNAL SUCCESS MODAL OVERLAY (REPLACES WINDOW.ALERT) */}
      <AnimatePresence>
        {showDoneModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDoneModal(false)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white text-slate-900 rounded-2xl p-6 border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden z-10 flex flex-col space-y-4"
            >
              {/* Gold trophy decoration */}
              <div className="mx-auto h-16 w-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-inner">
                <Trophy className="h-8 w-8 animate-bounce" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">
                  Laporan Run Sesi Berhasil! 🎓
                </h3>
                <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                  Apakah Anda berniat menutup panggung simulasi game <strong>"{activity.activity_name}"</strong> ini dan merangkum seluruh poin ke dalam statistik?
                </p>
              </div>

              {/* Game outcome scoreboard preview inside modal */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">
                  Hasil Rekap Klasemen:
                </span>
                <div className="space-y-1 text-xs">
                  {[...teams].sort((a,b)=>b.score-a.score).map((t, i) => (
                    <div key={i} className="flex justify-between font-bold text-slate-755">
                      <span>{i+1}. {t.icon} {t.name}</span>
                      <span className="font-mono text-indigo-600 font-extrabold">{t.score} Poin</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal trigger buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => setShowDoneModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 bg-white text-slate-500 rounded-xl text-xs font-black uppercase transition-colors cursor-pointer"
                >
                  Ubah Nilai
                </button>
                <button
                  onClick={handleConfirmFinish}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/15 cursor-pointer transition-colors"
                >
                  Kirim & Tutup ✓
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TEAM EDIT MODAL */}
      <AnimatePresence>
        {editingTeamIdx !== null && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingTeamIdx(null)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white text-slate-900 rounded-2xl p-6 border border-slate-200 shadow-2xl max-w-sm w-full z-10 flex flex-col space-y-4"
            >
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">
                  Ubah Identitas Squad 🛡️
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Ganti nama kelompok atau ubah lambang emoji agar sesuai dengan tim di lokasi acara.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Nama Squad:</label>
                  <input 
                    type="text" 
                    value={tempTeamName} 
                    onChange={(e) => setTempTeamName(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Contoh: Kelompok Merdeka"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Pilih Icon Emoji:</label>
                  <div className="grid grid-cols-5 gap-2 text-center text-xl">
                    {['🦁', '🦅', '🌲', '☀️', '🐼', '🦊', '🐙', '🚀', '💎', '🍕'].map(em => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setTempTeamIcon(em)}
                        className={`p-2 rounded-lg hover:bg-slate-100 transition-all cursor-pointer ${tempTeamIcon === em ? 'bg-indigo-50 border border-indigo-200 scale-105' : 'border border-transparent'}`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditingTeamIdx(null)}
                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-black uppercase transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={saveTeamEdit}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-black uppercase transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
                >
                  Simpan ✓
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
