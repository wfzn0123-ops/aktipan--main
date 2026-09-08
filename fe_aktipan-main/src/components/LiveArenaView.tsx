import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Gamepad2, Users, Trophy, Zap, Clock, Send, Volume2, VolumeX, 
  Shield, Award, Play, AlertCircle, RotateCcw, CheckCircle2, ChevronRight, 
  User, Key, HelpCircle, Star, Heart, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import GameMultiplayer from './GameMultiplayer';
import CommunityHub from './CommunityHub';
import { sound } from '../utils/sound';

interface LiveArenaViewProps {
  isLoggedIn: boolean;
  onLoginToggle: () => void;
  userRole: string;
}

// Redirect old synthesis to high-fidelity sound utility
const playSynthSound = (type: 'success' | 'fail' | 'click' | 'buzzer' | 'foul') => {
  if (type === 'success') {
    sound.playSuccess();
  } else if (type === 'buzzer') {
    sound.playBuzzer();
  } else if (type === 'fail' || type === 'foul') {
    sound.playFail();
  } else if (type === 'click') {
    sound.playClick();
  }
};

export default function LiveArenaView({ isLoggedIn, onLoginToggle, userRole }: LiveArenaViewProps) {
  // Navigation states: 'lobby' | 'game1_buzzer' | 'game2_mood' | 'game3_words' | 'game_multiplayer'
  const [activeScreen, setActiveScreen] = useState<'lobby' | 'game1_buzzer' | 'game2_mood' | 'game3_words' | 'game_multiplayer'>('lobby');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.isEnabled);
  const [lobbyMode, setLobbyMode] = useState<'games' | 'community'>('games');
  const [mabarRoomId, setMabarRoomId] = useState<string | undefined>(undefined);
  
  // Custom temporary user details
  const [playerName, setPlayerName] = useState<string>('Andika Pratama');
  const [playerTitle, setPlayerTitle] = useState<string>('Elite Trainer');
  const [totalPoints, setTotalPoints] = useState<number>(1250);
  const [completedGames, setCompletedGames] = useState<number>(12);
  const [medals, setMedals] = useState<string[]>(['Buzzer Master ⚡', 'Stage Master 🎤', 'Flash Mind 🧠']);
  
  // Interactive Chat Feed
  const [chatLog, setChatLog] = useState<{ sender: string; text: string; role?: string; time: string }[]>([
    { sender: 'Siti_EO', text: 'Halo semuanya, selamat datang di Live Arena!', role: 'Fasilitator', time: 'Baru saja' },
    { sender: 'Budi_Gamer', text: 'Game Buzzers seru bgt parah, butuh refleks kawat ⚡', role: 'Trainer', time: '1m lalu' },
    { sender: 'Jessica_L&D', text: 'Aku baru lolos level Mood Master, dapet bintang 5!', role: 'HRD', time: '2m lalu' }
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  // Live Match Polling Simulation
  const [liveMatches, setLiveMatches] = useState<Array<{
    id: string;
    game: string;
    player1: string;
    player2: string;
    status: 'Bertanding' | 'Bersiap' | 'Selesai';
    score: string;
    round: string;
    winner?: string;
  }>>([
    { id: 'ROOM-102', game: 'Refleks Bel', player1: 'Rudy_Fasilitator', player2: 'Diana_MC', status: 'Bertanding', score: '120 - 90', round: 'Round 2/3' },
    { id: 'ROOM-308', game: 'Asosiasi Kata', player1: 'Hendra_Presenter', player2: 'Jessica_L&D', status: 'Bersiap', score: '0 - 0', round: 'Menunggu' },
    { id: 'ROOM-415', game: 'Mood Master', player1: 'Budi_Gamer', player2: 'Santi_Kreatif', status: 'Selesai', score: '240 - 210', round: 'Selesai', winner: 'Budi_Gamer' }
  ]);

  const [recentJoins, setRecentJoins] = useState<Array<{
    id: string;
    name: string;
    action: string;
    badge?: string;
    time: string;
  }>>([
    { id: 'join-1', name: 'Rony_MC', action: 'Bergabung ke Arena Utama', badge: 'Pro MC', time: 'Baru saja' },
    { id: 'join-2', name: 'Amelia_Announcer', action: 'Memasuki Room #ROOM-308', badge: 'Announcer', time: '1m lalu' },
    { id: 'join-3', name: 'Yusuf_Instruktur', action: 'Membuat Room Baru #ROOM-501', badge: 'Instruktur', time: '2m lalu' }
  ]);

  // Integrated real-time Polling & Simulation Service
  useEffect(() => {
    const comments = [
      "Wah seru banget simulasi interaktifnya!",
      "Hahaha lawannya bot Siti cepet banget pencet bel!",
      "Ayo tunjukkan aura panggung mumpuni kalian 🔥",
      "Ada yang dapet skor di atas 1000 poin?",
      "Setuju, game Mood Master melatih mentalku sebelum naik panggung sungguhan.",
      "Keren, suara buzzer-nya mirip arena kuis TV!",
      "Makin siap buat briefing besok pagi."
    ];
    const senders = ["Rony_MC", "Gita_Guru", "Eko_Host", "Santi_Kreatif", "Yusuf_Instruktur", "Amelia_Announcer", "Hendra_Presenter", "Bambang_EO", "Sarah_Presenter", "Farhan_Host"];
    const actions = [
      "Bergabung ke Arena Utama",
      "Mencari Lawan Versus 1v1",
      "Memasuki Room #ROOM-102",
      "Menonton duel Refleks Bel",
      "Membuka Lemari Medali",
      "Mengunduh Panduan Ice-breaking"
    ];
    const badges = ["Elite", "Pro MC", "Trainer", "Fasilitator", "SeniMC", "Junior"];
    const games = ["Refleks Bel", "Mood Master", "Asosiasi Kata"];
    
    // Timer 1: Simulated Chat logs (every 12s)
    const chatInterval = setInterval(() => {
      const randomSender = senders[Math.floor(Math.random() * senders.length)];
      const randomMsg = comments[Math.floor(Math.random() * comments.length)];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      setChatLog(prev => [...prev.slice(-15), { sender: randomSender, text: randomMsg, time: timeStr }]);
    }, 12000);

    // Timer 2: Polling simulation for User Joins and Versus Match updates (every 4.5s)
    const pollingInterval = setInterval(() => {
      // A. Simulate player join activity
      const randomName = senders[Math.floor(Math.random() * senders.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomBadge = badges[Math.floor(Math.random() * badges.length)];
      
      setRecentJoins(prev => [
        {
          id: `join-${Date.now()}`,
          name: randomName,
          action: randomAction,
          badge: randomBadge,
          time: 'Baru saja'
        },
        ...prev.map(j => ({
          ...j,
          time: j.time === 'Baru saja' ? '1m lalu' : j.time.includes('m lalu') ? `${parseInt(j.time) + 1}m lalu` : '3m lalu'
        })).slice(0, 4)
      ]);

      // B. Simulate real-time Match updates (score progression, rounds, finish)
      setLiveMatches(prevMatches => {
        return prevMatches.map(m => {
          if (m.status === 'Bertanding') {
            const parts = m.score.split(' - ');
            let s1 = parseInt(parts[0]);
            let s2 = parseInt(parts[1]);
            
            // Randomly increase score for player 1 or 2
            if (Math.random() > 0.5) s1 += Math.floor(Math.random() * 25) + 15;
            else s2 += Math.floor(Math.random() * 25) + 15;

            const isFinished = s1 >= 250 || s2 >= 250;
            if (isFinished) {
              const winner = s1 > s2 ? m.player1 : m.player2;
              
              // Push system announcement to public chat
              const now = new Date();
              const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
              setChatLog(chatPrev => [
                ...chatPrev.slice(-15),
                {
                  sender: 'SISTEM_LIVE 🤖',
                  text: `🏆 MATCH SELESAI: ${winner} memenangkan Match #${m.id} (${m.game}) dengan skor akhir ${s1} - ${s2}!`,
                  role: 'Sistem',
                  time: timeStr
                }
              ]);

              return {
                ...m,
                status: 'Selesai',
                score: `${s1} - ${s2}`,
                round: 'Selesai',
                winner
              };
            } else {
              const currentRoundNum = Math.min(3, Math.floor((s1 + s2) / 140) + 1);
              return {
                ...m,
                score: `${s1} - ${s2}`,
                round: `Round ${currentRoundNum}/3`
              };
            }
          } else if (m.status === 'Selesai') {
            // 25% chance to start a new match with random players
            if (Math.random() > 0.75) {
              const p1 = senders[Math.floor(Math.random() * senders.length)];
              let p2 = senders[Math.floor(Math.random() * senders.length)];
              while (p1 === p2) {
                p2 = senders[Math.floor(Math.random() * senders.length)];
              }
              const game = games[Math.floor(Math.random() * games.length)];
              return {
                id: `ROOM-${Math.floor(Math.random() * 800) + 100}`,
                game,
                player1: p1,
                player2: p2,
                status: 'Bertanding',
                score: '0 - 0',
                round: 'Round 1/3',
                winner: undefined
              };
            }
          } else if (m.status === 'Bersiap') {
            // 40% chance to transition to active match
            if (Math.random() > 0.6) {
              return {
                ...m,
                status: 'Bertanding',
                round: 'Round 1/3'
              };
            }
          }
          return m;
        });
      });
    }, 4500);

    return () => {
      clearInterval(chatInterval);
      clearInterval(pollingInterval);
    };
  }, []);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    if (soundEnabled) playSynthSound('click');
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setChatLog(prev => [...prev, { sender: playerName, text: chatInput, role: userRole, time: timeStr }]);
    setChatInput('');
  };

  // Login action simulation inside the Live Arena context
  const handleArenaLogin = () => {
    if (soundEnabled) playSynthSound('success');
    onLoginToggle(); // Trigger parent App's login state
  };

  const selectGame = (game: 'game1_buzzer' | 'game2_mood' | 'game3_words' | 'game_multiplayer') => {
    if (soundEnabled) playSynthSound('click');
    setActiveScreen(game);
  };

  // Sound triggering proxy
  const triggerSound = (type: 'success' | 'fail' | 'click' | 'buzzer' | 'foul') => {
    if (soundEnabled) playSynthSound(type);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Immersive Sub-Header */}
      <div className="bg-white border-b border-slate-200/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-sm">
              <Gamepad2 className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider flex items-center gap-1.5 text-slate-900">
                KOKPIT ARENA INTERAKTIF <span className="bg-red-500 text-[8px] text-white font-black tracking-normal px-1.5 py-0.5 rounded animate-pulse">LIVE PRACTICE</span>
              </h1>
              <p className="text-[10.5px] text-slate-500">Asah insting, refleks, dan mental panggung Anda secara live.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button 
              onClick={() => {
                const nextVal = !soundEnabled;
                setSoundEnabled(nextVal);
                sound.setEnabled(nextVal);
                sound.playClick();
              }}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors font-medium cursor-pointer ${
                soundEnabled 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm' 
                  : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
              title="Aktifkan/Matikan Efek Suara Synthesizer"
              id="sound-toggle-btn"
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span className="text-[9px] font-bold font-mono tracking-tight uppercase hidden md:inline">
                {soundEnabled ? 'Suara ON' : 'Mute'}
              </span>
            </button>
            
            {activeScreen !== 'lobby' && (
              <button 
                onClick={() => {
                  triggerSound('click');
                  setActiveScreen('lobby');
                }}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[11px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-sm"
              >
                <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Kembali ke Lobby
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* VIEW 1: NOT LOGGED IN SHIELD */}
        {!isLoggedIn ? (
          <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white scale-105 shadow-md">
                <Shield className="h-8 w-8" />
              </div>
              <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 font-mono text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider">
                AKSES OTENTIKASI DIPERLUKAN
              </span>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                Masuk Untuk Membuka Live Arena
              </h2>
              <p className="text-slate-550 dark:text-slate-400 text-xs leading-relaxed max-w-xs">
                Bergabunglah dengan ribuan Master MC & Trainer terkemuka di Indonesia untuk melatih keterampilan panggung interaktif Anda dengan masuk menggunakan akun Anda.
              </p>

              <div className="w-full pt-4 space-y-3">
                <div className="relative text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Pilih Nickname Anda</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Masukkan nama arena Anda..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-9 pr-4 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="relative text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Tingkatan Profesi</label>
                  <select 
                    value={playerTitle} 
                    onChange={(e) => setPlayerTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Junior MC" className="bg-white dark:bg-slate-800">Junior MC (Pemula)</option>
                    <option value="Elite Trainer" className="bg-white dark:bg-slate-800">Elite Trainer (Praktisi senior)</option>
                    <option value="Ice Breaker Champion" className="bg-white dark:bg-slate-800">Ice Breaker Champion</option>
                    <option value="HRD Facilitator" className="bg-white dark:bg-slate-800">HRD Facilitator</option>
                  </select>
                </div>

                <button 
                  onClick={handleArenaLogin}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-3 rounded-lg text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Key className="h-4 w-4" /> Masuk Akun Premium & Main
                </button>
              </div>

              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono pt-2">
                🔒 Enkripsi Sesi Aktif • 132 Sesi Tersinkronisasi
              </div>
            </div>
          </div>
        ) : (
          
          /* VIEW 2: LOGGED IN LOBBY & CHAT SCREEN */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* SCREEN SELECTOR (IF IN LOBBY) */}
            {activeScreen === 'lobby' && (
              <div className="lg:col-span-8 space-y-6">
                
                {/* Visual Banner */}
                <div className="bg-gradient-to-br from-indigo-50/60 via-slate-50 to-indigo-50/40 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="space-y-2.5 max-w-md relative z-10">
                    <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded tracking-wide font-mono">
                      ARENA TERBUKA
                    </span>
                    <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase sm:text-xl">
                      Live Arena Kampus Aktipan!
                    </h2>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Latih kecepatan berpikir, emosi, dan reflex panggung Anda. Menangkan Medali Emas untuk dipajang di portofolio Talent Marketplace Anda.
                    </p>
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono pt-1">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-cyan-600 font-bold" /> 1,424 Trainer Online</span>
                      <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-500 animate-pulse" /> Ping: 14ms (Lancar)</span>
                    </div>
                  </div>
                  
                  {/* Stats Counter Widget */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shrink-0 w-full md:w-36 flex flex-col justify-center shadow-sm relative z-10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Skor Anda</span>
                    <span className="text-3xl font-black text-indigo-600 tracking-tight font-mono">{totalPoints}</span>
                    <span className="text-[9px] font-bold text-emerald-600 uppercase mt-1.5">Level 4: {playerTitle}</span>
                  </div>
                </div>

                {/* TAB SWITCHER: GAMES VS COMMUNITY */}
                <div className="flex bg-white border border-slate-200 p-1.5 rounded-xl gap-1.5 select-none shadow-sm">
                  <button 
                    onClick={() => { triggerSound('click'); setLobbyMode('games'); }}
                    className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      lobbyMode === 'games' 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Gamepad2 className="h-4 w-4" /> Game Center 🎮
                  </button>
                  <button 
                    onClick={() => { triggerSound('click'); setLobbyMode('community'); }}
                    className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      lobbyMode === 'community' 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="h-4 w-4" /> Forum & Grup Mabar 💬
                  </button>
                </div>

                {lobbyMode === 'games' ? (
                  <div className="space-y-6">
                    {/* Game Modes Catalogue */}
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <Gamepad2 className="h-4 w-4 text-indigo-500" /> Pilihlah Mode Permainan Menantang
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Game Card 1 */}
                      <div className="bg-white hover:bg-slate-50/20 border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md flex flex-col justify-between group transition-all">
                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 shadow-inner-sm">
                              <Zap className="h-5 w-5" />
                            </span>
                            <span className="bg-orange-50 text-orange-700 font-mono text-[9px] px-2.5 py-0.5 rounded-lg border border-orange-100 font-bold uppercase">Refleks Cepat</span>
                          </div>
                          <h4 className="text-xs font-black uppercase text-slate-900 tracking-wide pt-1">
                            Tantangan Buzzer Cepat
                          </h4>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            Teka-teki taktis MC. Klik buzzer secepat kilat mendahului 3 rival bot panggung cerdas.
                          </p>
                        </div>
                        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-150 flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-mono">Kesulitan: Medium</span>
                          <button 
                            onClick={() => selectGame('game1_buzzer')}
                            className="bg-orange-500 hover:bg-orange-400 text-white font-extrabold text-[9px] px-3.5 py-1.5 rounded-lg transition-colors uppercase flex items-center gap-0.5 cursor-pointer shadow-sm"
                          >
                            Main <Play className="h-2.5 w-2.5 fill-current" />
                          </button>
                        </div>
                      </div>

                      {/* Game Card 2 */}
                      <div className="bg-white hover:bg-slate-50/20 border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md flex flex-col justify-between group transition-all">
                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-inner-sm">
                              <Users className="h-5 w-5" />
                            </span>
                            <span className="bg-blue-50 text-blue-700 font-mono text-[9px] px-2.5 py-0.5 rounded-lg border border-blue-100 font-bold uppercase">Psikologi MC</span>
                          </div>
                          <h4 className="text-xs font-black uppercase text-slate-900 tracking-wide pt-1">
                            Mood Master MC
                          </h4>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            Skenario darurat panggung. Ambil tindakan taktis untuk menjaga kegembiraan audiens di atas 80%.
                          </p>
                        </div>
                        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-150 flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-mono">Kesulitan: Sulit</span>
                          <button 
                            onClick={() => selectGame('game2_mood')}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[9px] px-3.5 py-1.5 rounded-lg transition-colors uppercase flex items-center gap-0.5 cursor-pointer shadow-sm"
                          >
                            Main <Play className="h-2.5 w-2.5 fill-current" />
                          </button>
                        </div>
                      </div>

                      {/* Game Card 3 */}
                      <div className="bg-white hover:bg-slate-50/20 border border-slate-200 hover:border-slate-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md flex flex-col justify-between group transition-all">
                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-inner-sm">
                              <Star className="h-5 w-5" />
                            </span>
                            <span className="bg-indigo-50 text-indigo-700 font-mono text-[9px] px-2.5 py-0.5 rounded-lg border border-indigo-100 font-bold uppercase">Kosakata</span>
                          </div>
                          <h4 className="text-xs font-black uppercase text-slate-900 tracking-wide pt-1">
                            Asosiasi Kata Kilat
                          </h4>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            Bangun rangkaian asosiasi kata dinamis dengan tim penonton Anda untuk menguji konsistensi alur.
                          </p>
                        </div>
                        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-150 flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-mono">Kesulitan: Mudah</span>
                          <button 
                            onClick={() => selectGame('game3_words')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[9px] px-3.5 py-1.5 rounded-lg transition-colors uppercase flex items-center gap-0.5 cursor-pointer shadow-sm"
                          >
                            Main <Play className="h-2.5 w-2.5 fill-current" />
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Real-time multiplayer card */}
                    <div className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50 rounded-2xl p-6 border border-indigo-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden group hover:border-indigo-300 hover:shadow-md transition-all">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                      <div className="space-y-1.5 max-w-lg relative z-10">
                        <span className="text-[9px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg tracking-wide font-mono">
                          BARU: MULTIPLAYER INTERAKTIF
                        </span>
                        <h3 className="text-sm font-black uppercase text-slate-900 tracking-wide flex items-center gap-1.5">
                          🎮 Main Bareng Real-Time (Gadget Versus)
                        </h3>
                        <p className="text-slate-600 text-[11.5px] leading-relaxed">
                          Saling adu refleks menekan bel dan tebak naskah MC secara langsung dengan rekan Anda di gadget masing-masing! Hubungkan kode Room yang sama untuk duel 1v1 atau Team Versus Merah vs Biru.
                        </p>
                      </div>
                      <button 
                        onClick={() => selectGame('game_multiplayer')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 relative z-10"
                      >
                        Masuk Arena Real-Time <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Trainer Medals Wardrobe */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wide mb-4.5 flex items-center gap-1">
                        <Award className="h-4 w-4 text-amber-500 animate-bounce-slow" /> Lemari Penghargaan Anda ({medals.length} Medali)
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {medals.map((medal, i) => (
                          <span key={i} className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                            <span>🎖️</span> {medal}
                          </span>
                        ))}
                        <span className="text-[10px] font-mono text-slate-400 flex items-center px-1">
                          + Selesaikan simulasi baru untuk membuka Medali "Aura Sempurna"!
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <CommunityHub 
                    playerName={playerName}
                    playerTitle={playerTitle}
                    soundEnabled={soundEnabled}
                    triggerSound={triggerSound}
                    onJoinMabarRoom={(roomCode) => {
                      setMabarRoomId(roomCode);
                      selectGame('game_multiplayer');
                    }}
                  />
                )}

              </div>
            )}

            {/* SCREEN GAME 1: BUZZER CHALLENGE */}
            {activeScreen === 'game1_buzzer' && (
              <GameBuzzer 
                playerName={playerName} 
                triggerSound={triggerSound} 
                onFinish={(pointsGained) => {
                  setTotalPoints(p => p + pointsGained);
                  setCompletedGames(c => c + 1);
                  if (pointsGained > 150 && !medals.includes('Buzzer King 👑')) {
                    setMedals(prev => [...prev, 'Buzzer King 👑']);
                  }
                  setActiveScreen('lobby');
                }}
              />
            )}

            {/* SCREEN GAME 2: MOOD MASTER */}
            {activeScreen === 'game2_mood' && (
              <GameMoodMaster 
                playerName={playerName}
                triggerSound={triggerSound}
                onFinish={(pointsGained) => {
                  setTotalPoints(p => p + pointsGained);
                  setCompletedGames(c => c + 1);
                  if (pointsGained > 200 && !medals.includes('Aura Sempurna 🌟')) {
                    setMedals(prev => [...prev, 'Aura Sempurna 🌟']);
                  }
                  setActiveScreen('lobby');
                }}
              />
            )}

            {/* SCREEN GAME 3: WORD ASSOCIATION */}
            {activeScreen === 'game3_words' && (
              <GameWordAssociation 
                playerName={playerName}
                triggerSound={triggerSound}
                onFinish={(pointsGained) => {
                  setTotalPoints(p => p + pointsGained);
                  setCompletedGames(c => c + 1);
                  if (pointsGained > 100 && !medals.includes('Lexical Giant 📖')) {
                    setMedals(prev => [...prev, 'Lexical Giant 📖']);
                  }
                  setActiveScreen('lobby');
                }}
              />
            )}

            {/* SCREEN GAME MULTIPLAYER: REAL-TIME ARENA DUEL */}
            {activeScreen === 'game_multiplayer' && (
              <GameMultiplayer 
                playerName={playerName}
                playerTitle={playerTitle}
                soundEnabled={soundEnabled}
                triggerSound={triggerSound}
                initialRoomId={mabarRoomId}
                onFinish={(pointsGained) => {
                  setTotalPoints(p => p + pointsGained);
                  setCompletedGames(c => c + 1);
                  if (pointsGained > 100 && !medals.includes('Duo Gladiator ⚔️')) {
                    setMedals(prev => [...prev, 'Duo Gladiator ⚔️']);
                  }
                  setMabarRoomId(undefined);
                  setActiveScreen('lobby');
                }}
              />
            )}

            {/* UNIVERSAL RIGHT SIDE PANELS: LIVE POLLING & CHAT */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* SUBPANEL A: REAL-TIME LOBBY POLLING & VERSUS BOARD */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[300px] shadow-sm">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
                    <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">📡 Live Polling Versus</span>
                  </div>
                  <span className="text-[8px] bg-indigo-50 text-indigo-600 border border-indigo-150 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-widest animate-pulse">
                    MOCK SERVICE
                  </span>
                </div>

                {/* Sub-tabs for Polling Panel */}
                <div className="bg-slate-50/50 p-2 border-b border-slate-250 grid grid-cols-2 gap-1.5">
                  <div className="text-center text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100/60 rounded-lg py-1 font-mono tracking-wider">
                    🟢 Duel Aktif ({liveMatches.filter(m => m.status === 'Bertanding').length})
                  </div>
                  <div className="text-center text-[9px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-100/60 rounded-lg py-1 font-mono tracking-wider">
                    👥 Aktivitas
                  </div>
                </div>

                {/* Combined Polling Scroll Feed */}
                <div className="p-3 flex-grow overflow-y-auto space-y-3.5 scrollbar-thin select-none">
                  {/* Live Matches List */}
                  <div className="space-y-2">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Pertandingan Berlangsung:</div>
                    {liveMatches.map((match) => (
                      <div 
                        key={match.id} 
                        className="bg-slate-50/50 rounded-xl p-2.5 border border-slate-200/80 flex items-center justify-between hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded-md">
                              {match.id}
                            </span>
                            <span className="text-[10.5px] font-black text-slate-800 uppercase">
                              {match.game}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            <span className="text-blue-600 font-bold">{match.player1}</span>
                            <span className="text-slate-400 px-1 font-mono">vs</span>
                            <span className="text-rose-600 font-bold">{match.player2}</span>
                          </div>
                        </div>

                        <div className="text-right space-y-0.5">
                          <div className="text-[11.5px] font-black font-mono text-emerald-600 tracking-wider">
                            {match.score}
                          </div>
                          <div className="flex items-center justify-end gap-1 text-[8px] font-mono text-slate-500">
                            {match.status === 'Bertanding' ? (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                                <span className="text-emerald-600 font-black">{match.round}</span>
                              </>
                            ) : match.status === 'Bersiap' ? (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                <span className="text-amber-600 font-bold">Menunggu</span>
                              </>
                            ) : (
                              <span className="text-slate-400 text-[8px] uppercase font-bold">Selesai 🏁</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Divider line */}
                  <div className="border-t border-slate-200/80 my-2" />

                  {/* Recent Player Joins Ticker */}
                  <div className="space-y-2">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Aktivitas Server & Join:</div>
                    <div className="space-y-1.5">
                      {recentJoins.map((join) => (
                        <div key={join.id} className="flex items-center justify-between text-[10px] bg-slate-50 p-2 rounded-xl border border-slate-200/60 shadow-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-cyan-600">{join.name}</span>
                            <span className="text-[8px] bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.2 rounded uppercase font-mono font-bold tracking-tight">
                              {join.badge}
                            </span>
                            <span className="text-slate-600 text-[9px]">{join.action}</span>
                          </div>
                          <span className="text-[8px] text-slate-400 font-mono shrink-0">{join.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* SUBPANEL B: UNIVERSAL GLOBAL CHATROOM */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[280px] shadow-sm">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider">Lobby Chat Global</span>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 font-mono tracking-tight uppercase">AKTIF</span>
                </div>

                {/* Chat Feed Messages */}
                <div className="p-3 flex-grow overflow-y-auto space-y-3.5 select-none scrollbar-thin" id="global-chat-box">
                  {chatLog.map((chat, idx) => {
                    const isSystem = chat.sender.includes('SISTEM_LIVE');
                    return (
                      <div key={idx} className="text-[11px] leading-relaxed">
                        <div className="flex items-baseline justify-between mb-0.5">
                          <div className="flex items-center gap-1">
                            <span className={`font-extrabold ${isSystem ? 'text-amber-700 font-black' : 'text-indigo-600'} hover:underline cursor-pointer`}>{chat.sender}</span>
                            {chat.role && (
                              <span className="text-[8px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-1 rounded font-bold uppercase font-mono scale-90">
                                {chat.role}
                              </span>
                            )}
                          </div>
                          <span className="text-[8px] text-slate-400 font-mono">{chat.time}</span>
                        </div>
                        <p className={`text-[11.5px] p-2.5 rounded-xl border ${isSystem ? 'text-amber-800 bg-amber-50/80 border-amber-200/60 shadow-sm' : 'text-slate-700 bg-slate-50/80 border-slate-100 shadow-inner-sm'}`}>
                          {chat.text}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Form */}
                <form onSubmit={handleSendChat} className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ketik komentar panggung Anda..."
                    className="flex-1 bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
                  />
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors cursor-pointer shadow-sm active:scale-95"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ----------------------------------------------------
// SUBMODULE GAME 1: BUZZER CHALLENGE
// ----------------------------------------------------
interface GameBuzzerProps {
  playerName: string;
  triggerSound: (type: 'success' | 'fail' | 'click' | 'buzzer' | 'foul') => void;
  onFinish: (score: number) => void;
}

function GameBuzzer({ playerName, triggerSound, onFinish }: GameBuzzerProps) {
  const [gameState, setGameState] = useState<'intro' | 'wait' | 'countdown' | 'signal' | 'buzzed' | 'round_over' | 'summary'>('intro');
  const [round, setRound] = useState<number>(1);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<{ name: string; score: number }[]>([
    { name: 'Diana MC', score: 0 },
    { name: 'Rudy Fasilitator', score: 0 },
    { name: 'Bambang EO', score: 0 }
  ]);
  const [signalActive, setSignalActive] = useState<boolean>(false);
  const [promptMsg, setPromptMsg] = useState<string>('Bersiaplah...');
  const [buzzResultText, setBuzzResultText] = useState<string>('');
  
  // Timer references
  const signalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRound = () => {
    triggerSound('click');
    setGameState('wait');
    setPromptMsg('Pembicara sedang menjelaskan materi panggung...');
    setSignalActive(false);

    // Wait random delay between 3000ms - 6000ms for the "SIGNAL TO BUZZ"
    const randomDelay = Math.floor(Math.random() * 3000) + 3000;
    
    if (signalTimerRef.current) clearTimeout(signalTimerRef.current);
    signalTimerRef.current = setTimeout(() => {
      setGameState('signal');
      setSignalActive(true);
      setPromptMsg('🚨 TEKAN SEKARANG!!! 🚨');
      triggerSound('buzzer');
      startTimeRef.current = Date.now();
    }, randomDelay);
  };

  const handleBuzzerClick = () => {
    // Foul if clicked too early
    if (gameState === 'wait') {
      if (signalTimerRef.current) clearTimeout(signalTimerRef.current);
      triggerSound('foul');
      setBuzzResultText('FOUL! Anda menekan terlalu cepat sebelum aba-aba!');
      setPlayerScore(p => Math.max(0, p - 30));
      setGameState('round_over');
      return;
    }

    if (gameState === 'signal') {
      const clickTime = (Date.now() - startTimeRef.current) / 1000;
      triggerSound('success');
      
      // Opponent times
      const rSolo = Math.random() * 0.4 + 0.5; // Diana time (0.5s - 0.9s)
      const rRudy = Math.random() * 0.5 + 0.65; // Rudy time
      const rBambang = Math.random() * 0.6 + 0.8; // Bambang time

      let place = 1;
      if (clickTime > rSolo) place++;
      if (clickTime > rRudy) place++;
      if (clickTime > rBambang) place++;

      let roundPoints = 0;
      if (place === 1) {
        roundPoints = 100;
        setBuzzResultText(`🥇 JUARA 1! Anda menekan bel dalam waktu ${clickTime.toFixed(2)} detik! (+100 Poin)`);
      } else if (place === 2) {
        roundPoints = 60;
        setBuzzResultText(`🥈 Juara 2! Waktu Anda ${clickTime.toFixed(2)}s. Dikalahkan oleh Diana (${rSolo.toFixed(2)}s). (+60 Poin)`);
      } else if (place === 3) {
        roundPoints = 30;
        setBuzzResultText(`🥉 Juara 3! Waktu Anda ${clickTime.toFixed(2)}s. Rudy lebih cepat (${rRudy.toFixed(2)}s). (+30 Poin)`);
      } else {
        roundPoints = 0;
        setBuzzResultText(`❌ Juara Akhir! Semua lawan lebih cepat dari ${clickTime.toFixed(2)}s!`);
      }

      setPlayerScore(p => p + roundPoints);
      
      // Add points to opponents based on their places
      setOpponentScore(prev => {
        return prev.map(o => {
          let extra = 0;
          if (o.name === 'Diana MC') {
            if (rSolo < clickTime && rSolo < rRudy && rSolo < rBambang) extra = 100;
            else if (rSolo < clickTime && (rSolo < rRudy || rSolo < rBambang)) extra = 60;
            else extra = 30;
          }
          if (o.name === 'Rudy Fasilitator') {
            if (rRudy < clickTime && rRudy < rSolo && rRudy < rBambang) extra = 100;
            else if (rRudy < clickTime && (rRudy < rSolo || rRudy < rBambang)) extra = 60;
            else extra = 30;
          }
          if (o.name === 'Bambang EO') {
            if (rBambang < clickTime && rBambang < rSolo && rBambang < rRudy) extra = 100;
            else if (rBambang < clickTime && (rBambang < rSolo || rBambang < rRudy)) extra = 60;
            else extra = 30;
          }
          return { ...o, score: o.score + extra };
        });
      });

      setSignalActive(false);
      setGameState('round_over');
    }
  };

  const handleNextRound = () => {
    if (round < 3) {
      setRound(r => r + 1);
      startRound();
    } else {
      setGameState('summary');
      triggerSound('success');
    }
  };

  useEffect(() => {
    return () => {
      if (signalTimerRef.current) clearTimeout(signalTimerRef.current);
    };
  }, []);

  return (
    <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between min-h-[460px] shadow-sm">
      
      {/* HEADER GAUGES */}
      <div className="flex items-center justify-between border-b border-slate-150 pb-3.5">
        <div className="flex items-center gap-1.5">
          <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
            <Zap className="h-4 w-4" />
          </span>
          <span className="text-xs font-black uppercase text-slate-800 tracking-wider">Tantangan Buzzer Refleks</span>
        </div>
        <div className="text-xs font-mono font-bold text-slate-500">
          Ronde atau Tahap: <span className="text-slate-800 font-extrabold">{round === 4 ? 3 : round}/3</span>
        </div>
      </div>

      {/* RIVAL SCOREBOARD */}
      <div className="grid grid-cols-4 gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-2 select-none shadow-inner-sm">
        <div className="text-center rounded-lg bg-white border border-slate-200 p-1.5 shadow-sm">
          <div className="text-[8px] font-black uppercase text-indigo-600">Anda ({playerName})</div>
          <div className="text-sm font-black text-indigo-600 font-mono">{playerScore}</div>
        </div>
        {opponentScore.map((op, i) => (
          <div key={i} className="text-center rounded-lg bg-white/60 border border-slate-200/50 p-1.5 shadow-sm">
            <div className="text-[8px] text-slate-500 font-bold truncate">{op.name}</div>
            <div className="text-sm font-black text-slate-700 font-mono">{op.score}</div>
          </div>
        ))}
      </div>

      {/* GAME STAGES CONTROLS */}
      <div className="my-8 flex flex-col items-center justify-center space-y-4">
        
        {gameState === 'intro' && (
          <div className="text-center space-y-3.5 max-w-sm">
            <span className="text-[10px] bg-indigo-50 border border-indigo-150 text-indigo-600 px-2.5 py-0.5 rounded-lg font-mono font-bold uppercase tracking-wider shadow-sm">PREPARASI</span>
            <h4 className="text-sm font-black uppercase text-slate-900 tracking-normal">Genggam Kejuaraan Bel Terbaik!</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Aturan main: Tunggu aba-aba, saat tulisan berubah jadi berwarna merah bersuara tinggi <span className="text-rose-600 font-black">"TEKAN SEKARANG!!!"</span>, klik tombol merah secepatnya. Jika menyentuh sebelum bersuara, Anda dipinalti!
            </p>
            <button 
              onClick={startRound}
              className="bg-orange-500 hover:bg-orange-400 text-white font-black uppercase text-xs tracking-wider px-6 py-2.5 rounded-lg transition-transform active:scale-95 cursor-pointer shadow-md"
            >
              Mulai Arena 🚀
            </button>
          </div>
        )}

        {(gameState === 'wait' || gameState === 'signal') && (
          <div className="text-center space-y-6 w-full max-w-md">
            <div className={`p-4 rounded-xl border text-xs font-black uppercase tracking-wider font-mono transition-all duration-300 ${
              gameState === 'signal' 
                ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-sm animate-pulse scale-102 font-extrabold' 
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              {promptMsg}
            </div>

            {/* Giant Buzzer Trigger Button */}
            <button 
              onClick={handleBuzzerClick}
              className={`h-36 w-36 rounded-full border-4 shadow-xl flex flex-col items-center justify-center transition-all active:scale-90 cursor-pointer ${
                gameState === 'signal'
                  ? 'bg-red-500 border-rose-200 animate-bounce cursor-pointer brightness-110 shadow-red-200'
                  : 'bg-red-800 border-red-950 cursor-pointer hover:bg-red-700 shadow-inner'
              }`}
            >
              <span className="text-white font-black text-sm tracking-wider uppercase drop-shadow-md">
                {gameState === 'signal' ? 'BUZZ!!!' : 'TUNGGU'}
              </span>
              <span className="text-[9px] text-red-100 uppercase tracking-tighter block font-mono mt-0.5">
                Refleks Tekan
              </span>
            </button>
          </div>
        )}

        {gameState === 'round_over' && (
          <div className="text-center space-y-3.5 p-5 bg-slate-50 rounded-xl border border-slate-200 max-w-sm shadow-sm">
            <h4 className="text-sm font-black uppercase text-orange-600">Ronde Selesai</h4>
            <p className="text-xs text-slate-700 leading-relaxed font-bold">{buzzResultText}</p>
            
            <button 
              onClick={handleNextRound}
              className="mt-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase px-4 py-2 rounded-lg transition-all cursor-pointer shadow-sm"
            >
              {round < 3 ? 'Lanjut Ronde Berikutnya' : 'Lihat Hasil Akhir'}
            </button>
          </div>
        )}

        {gameState === 'summary' && (
          <div className="text-center space-y-4 max-w-md p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-amber-50 border border-amber-150 text-amber-600 flex items-center justify-center mx-auto text-lg shadow-sm">
              <Trophy className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-black uppercase text-slate-900 tracking-wider">Ringkasan Score Live Anda: +{playerScore} Poin</h4>
            <p className="text-xs text-slate-500">
              Kerja bagus! Refleks teoretis & taktis panggung Anda sangat mantap. Poin ini akan otomatis disimpan untuk meningkatkan peringkat level Trainer Anda.
            </p>

            <button 
              onClick={() => onFinish(playerScore)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase px-6 py-2.5 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 mx-auto shadow-sm"
            >
              Simpan Hasil Permainan <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        )}

      </div>

      {/* footer advice */}
      <p className="text-[9px] text-slate-400 font-mono text-center border-t border-slate-150 pt-3">
        ⚡ TIP ARENA: Latency bernilai rendah berkolerasi pada kemudahan Anda menekan bel mendahului lawan AI!
      </p>

    </div>
  );
}

// ----------------------------------------------------
// SUBMODULE GAME 2: MC MOOD MASTER
// ----------------------------------------------------
interface GameMoodMasterProps {
  playerName: string;
  triggerSound: (type: 'success' | 'fail' | 'click' | 'buzzer' | 'foul') => void;
  onFinish: (score: number) => void;
}

function GameMoodMaster({ playerName, triggerSound, onFinish }: GameMoodMasterProps) {
  const [stage, setStage] = useState<'intro' | 'playing' | 'end'>('intro');
  const [scenarioIndex, setScenarioIndex] = useState<number>(0);
  const [mood, setMood] = useState<number>(50); // percentage 1-100
  const [aura, setAura] = useState<number>(50); // percentage 1-100
  const [score, setScore] = useState<number>(0);
  const [reactionLog, setReactionLog] = useState<string>('Panggung sepi...');

  const scenarios = [
    {
      title: "Darurat Sound System",
      desc: "Satu menit sebelum sesi game pemecah suasana dimulai, speaker kiri-kanan mengeluarkan bunyi dengung nyaring yang memekakkan telinga audiens seluruh baris depan!",
      choices: [
        {
          text: "Minta maaf sebesar-besarnya sambil memarahi tim operator didekat panggung dengan mimik kesal agar penonton tahu itu kecerobohan panitia.",
          moodMod: -15, auraMod: -20, points: 10,
          reaction: "Audiens merasa canggung melihat MC menyalahkan panitia internal secara terbuka. Aura kepemimpinan runtuh!"
        },
        {
          text: "Tetap tenang, tersenyum lebar, berjalan ke bagian panggung yang jauh dari sound, dan bercanda: 'Wah, itu tadi tes suara detak jantung naga untuk kuis spesial kita!'",
          moodMod: 20, auraMod: 30, points: 100,
          reaction: "Hebat! Anda mengubah bencana suara menjadi bahan lelucon spontan yang menghibur. Audiens tertawa lebar!"
        },
        {
          text: "Berdiri diam di panggung tanpa ekspresi, bersedekap menyilangkan tangan menunggu teknisi mematikan colokan.",
          moodMod: -5, auraMod: -5, points: 30,
          reaction: "Situasi cukup membosankan. Atmosfer panggung terasa dingin berkepanjangan."
        }
      ]
    },
    {
      title: "Audiens Diam Seribu Bahasa",
      desc: "Anda mengajukan pertanyaan pembuka yang energik: 'Siapa yang siap berbahagia hari ini?!' Namun, seluruh ruangan bergeming sunyi, menatap layar laptop mereka masing-masing.",
      choices: [
        {
          text: "Ejek penonton: 'Aduh bapak-bapak sepi amat kayak di kuburan! Masih pagi masa loyo semua!'",
          moodMod: -20, auraMod: -10, points: 10,
          reaction: "Waduh! Ejekan kasar membuat beberapa petinggi HRD tersinggung ringan. Mood anjlok!"
        },
        {
          text: "Hampiri bapak di barisan kedua yang mukanya paling ramah, julurkan mikrofon sambil berkata santai: 'Wah bapak baju biru senyumnya manis banget, sebutkan satu nama game kesukaan bapak?'",
          moodMod: 25, auraMod: 20, points: 100,
          reaction: "Luar biasa! Strategi micro-engagement ini berhasil mencairkan suasana es dalam sekejap. Audiens tersenyum melihat interaksi tulus."
        },
        {
          text: "Abaikan saja kesunyian tersebut, langsung klik slide PowerPoint berikutnya dan membacakan teks dengan nada datar.",
          moodMod: -5, auraMod: -10, points: 20,
          reaction: "Pertemuan berjalan sangat mekanis. Peserta makin asyik dengan HP mereka."
        }
      ]
    },
    {
      title: "The Heckler (Pembantah Agresif)",
      desc: "Saat memaparkan instruksi game 'Tepuk Ganjil Genap', salah satu penonton menyela angkuh: 'Ah game jadul begitu buat apa dimainkan lagi mas? Ga bermutu!'",
      choices: [
        {
          text: "Tantang dia di hadapan semua orang: 'Kalau mas merasa hebat, silakan mas maju ganti posisi saya jadi MC panggung!'",
          moodMod: -20, auraMod: -15, points: 15,
          reaction: "Suasana mendadak tegang luar biasa. Konfrontasi MC dinilai tidak profesional."
        },
        {
          text: "Tersenyum bersyukur, tawarkan: 'Setuju sekali pak! Ini kearifan lokal. Tetapi bagaimana jika justru ANDA saya tunjuk sebagai Dewan Juri Kehormatan untuk memburu siapa yang salah tepuk?'",
          moodMod: 35, auraMod: 35, points: 120,
          reaction: "Masterpiece MC! Anda merangkul kritik negatif, memberdayakan pengkritik sebagai fasilitator pembantu. Seluruh ruangan memberi tepuk tangan kehormatan untuk kebijaksanaan Anda!"
        },
        {
          text: "Bilang 'Oh oke maaf', lalu batalkan game tepuk-tepukan itu dan langsung menggantinya ke sesi kuis tenang.",
          moodMod: -10, auraMod: -20, points: 20,
          reaction: "Peserta merasa MC tidak punya pilar wibawa panggung yang mantap ketika digertak audiens."
        }
      ]
    }
  ];

  const handleChoice = (choice: any) => {
    const newMood = Math.max(0, Math.min(100, mood + choice.moodMod));
    const newAura = Math.max(0, Math.min(100, aura + choice.auraMod));
    
    setMood(newMood);
    setAura(newAura);
    setScore(s => s + choice.points);
    setReactionLog(choice.reaction);

    if (choice.points > 80) {
      triggerSound('success');
    } else {
      triggerSound('fail');
    }

    // Advance to next or finish
    if (scenarioIndex < scenarios.length - 1) {
      setScenarioIndex(i => i + 1);
    } else {
      setTimeout(() => {
        setStage('end');
      }, 1500);
    }
  };

  const handleRestart = () => {
    triggerSound('click');
    setMood(50);
    setAura(50);
    setScore(0);
    setScenarioIndex(0);
    setReactionLog('Panggung sepi...');
    setStage('playing');
  };

  return (
    <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between min-h-[460px] shadow-sm">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-slate-150 pb-3.5">
        <div className="flex items-center gap-1.5">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Users className="h-4 w-4" />
          </span>
          <span className="text-xs font-black uppercase text-slate-800 tracking-wider">Simulasi Skenario Mood Master</span>
        </div>
        <span className="text-xs font-mono font-bold text-slate-500">
          Kasus: <span className="text-slate-800 font-extrabold">{stage === 'intro' ? 0 : scenarioIndex + 1}/{scenarios.length}</span>
        </span>
      </div>

      {/* METERS (ONLY SHOWN IN PLAYING/END MODE) */}
      {stage !== 'intro' && (
        <div className="grid grid-cols-2 gap-4 my-2 select-none">
          {/* Mood Meter */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-inner-sm">
            <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-wider mb-1.5">
              <span className="text-rose-600 flex items-center gap-0.5"><Heart className="h-3 w-3 fill-rose-500 text-rose-600 inline-block" /> Kehadiran Audiens / Mood</span>
              <span className="font-mono text-slate-800 text-xs">{mood}%</span>
            </div>
            <div className="w-full bg-slate-200/50 rounded-full h-2 overflow-hidden border border-slate-200/60">
              <div 
                className="bg-gradient-to-r from-rose-500 to-rose-400 h-full transition-all duration-500"
                style={{ width: `${mood}%` }}
              />
            </div>
          </div>
          {/* Aura Meter */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 shadow-inner-sm">
            <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-wider mb-1.5">
              <span className="text-blue-600 flex items-center gap-0.5"><Award className="h-3 w-3 inline-block" /> Wibawa Panggung / Aura</span>
              <span className="font-mono text-slate-800 text-xs">{aura}%</span>
            </div>
            <div className="w-full bg-slate-200/50 rounded-full h-2 overflow-hidden border border-slate-200/60">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-full transition-all duration-500"
                style={{ width: `${aura}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* SCREEN ROUTING */}
      <div className="my-6">
        {stage === 'intro' && (
          <div className="text-center space-y-4 max-w-sm mx-auto">
            <span className="text-[10px] bg-blue-50 border border-blue-150 text-blue-600 px-2.5 py-0.5 rounded-lg font-mono font-bold uppercase tracking-wider shadow-sm">PSIKOLOGI MC</span>
            <h4 className="text-sm font-black uppercase text-slate-900 tracking-normal">Atur Keadaan Panggung Sempurna</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Mainkan peran sebagai fasilitator senior. Skenario ekstrem panggung akan bermunculan secara tiba-tiba. Pilih solusi paling humanis, kreatif, dan menepis situasi canggung.
            </p>
            <button 
              onClick={() => { triggerSound('click'); setStage('playing'); }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-wider px-6 py-2.5 rounded-lg active:scale-95 transition-transform cursor-pointer shadow-md"
            >
              Mulai Skenario Panggung 🎤
            </button>
          </div>
        )}

        {stage === 'playing' && (
          <div className="space-y-4">
            {/* Scenario block card */}
            <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 space-y-2.5 shadow-inner-sm">
              <span className="text-[9px] font-black uppercase text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg font-mono tracking-wider">
                {scenarios[scenarioIndex].title}
              </span>
              <p className="text-slate-800 text-xs leading-relaxed font-bold">
                "{scenarios[scenarioIndex].desc}"
              </p>
            </div>

            {/* Simulated Live Feed result comment */}
            <div className="text-[10px] text-slate-600 bg-slate-50 px-3.5 py-2 border border-slate-200 rounded-lg font-mono">
              📢 <span className="text-amber-700 font-bold">Respon Terbaru:</span> {reactionLog}
            </div>

            {/* Answer Options list */}
            <div className="space-y-2.5 pt-1.5">
              {scenarios[scenarioIndex].choices.map((choice, cidx) => (
                <button 
                  key={cidx}
                  onClick={() => handleChoice(choice)}
                  className="w-full text-left bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 p-3.5 rounded-xl transition-all cursor-pointer text-xs text-slate-700 hover:text-indigo-600 font-bold block shadow-sm hover:shadow-md"
                >
                  <span className="text-blue-600 font-black font-mono mr-1.5">{String.fromCharCode(65 + cidx)})</span>
                  {choice.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === 'end' && (
          <div className="text-center space-y-4 max-w-md mx-auto p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto text-lg shadow-sm ${
              mood > 70 ? 'bg-emerald-50 text-emerald-600 border border-emerald-150' : 'bg-red-50 text-red-600 border border-red-150'
            }`}>
              {mood > 70 ? '🏆' : '⚠️'}
            </div>
            <h4 className="text-sm font-black uppercase text-slate-900 tracking-wider">Hasil Panggung: {mood > 70 ? 'MC LEGENDARISIS!' : 'Latihan Diperlukan'}</h4>
            <p className="text-xs text-slate-500">
              Skor Perhitungan Terakhir: <em className="text-slate-800 font-black font-mono not-italic">{score} Poin</em>. Keberhasilan menjaga emosi audiens tetap riang: <em className="text-emerald-600 font-bold not-italic font-mono">{mood}%</em>.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button 
                onClick={handleRestart}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-xs uppercase px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Ulangi Sesi
              </button>
              
              <button 
                onClick={() => onFinish(score)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase px-5 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm"
              >
                Selesai & Simpan <CheckCircle2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* footer text */}
      <span className="text-[10px] text-slate-400 font-mono text-center block border-t border-slate-150 pt-3">
        💡 TIP ARENA: Melatih teknik micro-engagement membuat audiens merasa dihargai secara subjektif.
      </span>

    </div>
  );
}

// ----------------------------------------------------
// SUBMODULE GAME 3: WORD ASSOCIATION
// ----------------------------------------------------
interface GameWordAssociationProps {
  playerName: string;
  triggerSound: (type: 'success' | 'fail' | 'click' | 'buzzer' | 'foul') => void;
  onFinish: (score: number) => void;
}

function GameWordAssociation({ playerName, triggerSound, onFinish }: GameWordAssociationProps) {
  const [stage, setStage] = useState<'intro' | 'playing' | 'end'>('intro');
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [userVal, setUserVal] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [timerCount, setTimerCount] = useState<number>(10);
  const [runningChain, setRunningChain] = useState<{ origin: string; userReply: string; opponentReply: string }[]>([]);

  const stimulusWords = [
    { word: "KERJA SAMA", botOptions: ["Kekompakan", "Kolaborasi", "Tim Sinergi"] },
    { word: "GELAK TAWA", botOptions: ["Bahagia", "Kegembiraan", "Lelucon Lucu"] },
    { word: "PEMIMPIN", botOptions: ["Tanggung Jawab", "Visi Kuat", "Inspiratif"] },
    { word: "KREATIF", botOptions: ["Inovasi Baru", "Gagasan Unik", "Out of Box"] }
  ];

  // Game timer logic during gameplay
  useEffect(() => {
    if (stage !== 'playing') return;
    if (timerCount === 0) {
      handleSkipWord();
      return;
    }
    const timer = setTimeout(() => {
      setTimerCount(c => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [stage, timerCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userVal.trim()) return;

    triggerSound('success');
    const options = stimulusWords[wordIndex].botOptions;
    const botPick = options[Math.floor(Math.random() * options.length)];

    // Calculate score based on time remaining to reward high reflexes
    const roundPoints = timerCount * 12;
    setScore(s => s + roundPoints);

    setRunningChain(prev => [
      ...prev, 
      { 
        origin: stimulusWords[wordIndex].word, 
        userReply: userVal, 
        opponentReply: botPick 
      }
    ]);

    setUserVal('');

    // Advance
    if (wordIndex < stimulusWords.length - 1) {
      setWordIndex(i => i + 1);
      setTimerCount(10);
    } else {
      setStage('end');
    }
  };

  const handleSkipWord = () => {
    triggerSound('foul');
    setRunningChain(prev => [
      ...prev, 
      { 
        origin: stimulusWords[wordIndex].word, 
        userReply: "(Waktu Habis)", 
        opponentReply: "Hampa" 
      }
    ]);
    setUserVal('');

    if (wordIndex < stimulusWords.length - 1) {
      setWordIndex(i => i + 1);
      setTimerCount(10);
    } else {
      setStage('end');
    }
  };

  return (
    <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between min-h-[460px] shadow-sm">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-slate-150 pb-3.5">
        <div className="flex items-center gap-1.5">
          <span className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-150 text-indigo-600">
            <Star className="h-4 w-4" />
          </span>
          <span className="text-xs font-black uppercase text-slate-800 tracking-wider">Asosiasi Kata Kilat</span>
        </div>
        <span className="text-xs font-mono font-bold text-slate-500">
          Kosakata: <span className="text-slate-800 font-extrabold">{stage === 'intro' ? 0 : wordIndex + 1}/{stimulusWords.length}</span>
        </span>
      </div>

      {/* GAME VIEWPORT */}
      <div className="my-4">
        {stage === 'intro' && (
          <div className="text-center space-y-4 max-w-xs mx-auto">
            <span className="text-[10px] bg-indigo-50 border border-indigo-150 text-indigo-600 px-2.5 py-0.5 rounded-lg font-mono font-bold uppercase tracking-wider shadow-sm">KOSAKATA</span>
            <h4 className="text-sm font-black uppercase text-slate-900 tracking-normal">Gali Pemikiran Asosiatif</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Ketikkan kata pertama yang terlintas di kepala Anda yang merujuk pada kata stimulus yang ditampilkan. Anda mengumpulkan skor poin makin besar jika mengetik kilat!
            </p>
            <button 
              onClick={() => { triggerSound('click'); setStage('playing'); }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-wider px-6 py-2.5 rounded-lg active:scale-95 transition-all cursor-pointer shadow-md"
            >
              Mulai Sambung Kata 🧠
            </button>
          </div>
        )}

        {stage === 'playing' && (
          <div className="space-y-6">
            
            {/* STIMULUS DISPLAY */}
            <div className="text-center p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto space-y-1.5 relative overflow-hidden shadow-inner-sm">
              <span className="text-[9px] uppercase font-mono font-bold text-slate-400 tracking-widest block">Kata Stimulus Utama</span>
              <h2 className="text-xl font-black tracking-widest text-indigo-600 animate-pulse uppercase">
                {stimulusWords[wordIndex].word}
              </h2>
              
              {/* Floating timer */}
              <div className="inline-flex items-center gap-1.5 text-[10px] bg-white border border-slate-200 px-3 py-1 rounded-full mt-2.5 font-mono text-rose-600 font-bold shadow-sm">
                <Clock className="h-3 w-3 animate-spin" /> {timerCount} Detik Tersisa
              </div>
            </div>

            {/* INPUT FORM */}
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
              <div className="relative">
                <input 
                  type="text"
                  value={userVal}
                  onChange={(e) => setUserVal(e.target.value)}
                  placeholder="Ketik asosiasi kata Anda lalu tekan Enter..."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 text-slate-800 rounded-lg py-2.5 px-4 text-xs font-bold text-center placeholder-slate-400 focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={handleSkipWord}
                  className="w-1/3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 font-bold py-2 text-[11px] rounded-lg cursor-pointer transition-colors shadow-sm"
                >
                  Lewati Kata
                </button>
                <button 
                  type="submit"
                  disabled={!userVal.trim()}
                  className="w-2/3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-2 text-[11px] rounded-lg cursor-pointer uppercase tracking-wider transition-colors shadow-sm"
                >
                  Kirim Jawaban
                </button>
              </div>
            </form>

            {/* CURRENT ROUND CHAIN LIST */}
            {runningChain.length > 0 && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 max-w-md mx-auto space-y-2 shadow-inner-sm">
                <span className="text-[9px] font-black uppercase text-slate-500 font-mono tracking-wider block">Rantai Asosiasi Terkumpul:</span>
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {runningChain.map((chain, cidx) => (
                    <div key={cidx} className="flex justify-between text-[10px] border-b border-slate-200/60 pb-1 font-mono text-slate-600">
                      <span className="text-slate-500 font-semibold">{chain.origin}</span>
                      <span className="text-indigo-600 font-bold ml-1.5">{chain.userReply}</span>
                      <span className="text-slate-400">➜</span>
                      <span className="text-emerald-600 font-extrabold">{chain.opponentReply}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {stage === 'end' && (
          <div className="text-center space-y-4 max-w-md mx-auto p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-indigo-50 border border-indigo-150 text-indigo-600 flex items-center justify-center mx-auto text-lg shadow-sm">
              🏆
            </div>
            <h4 className="text-sm font-black uppercase text-slate-900 tracking-wider">Hasil Asosiasi Alur Selesai</h4>
            <p className="text-xs text-slate-500">
              Skor Performa Berpikir Anda: <em className="text-slate-800 font-black font-mono not-italic">{score} Poin</em>. Rantai asosiasi kosa kata Anda dinilai sangat kaya dan kreatif.
            </p>

            <button 
              onClick={() => onFinish(score)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase px-6 py-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 mx-auto shadow-sm"
            >
              Simpan & Keluar <CheckCircle2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* footer hint */}
      <span className="text-[10px] text-slate-400 font-mono text-center block border-t border-slate-150 pt-3">
        💡 TIP ARENA: Menghubungkan kata stimulus secara cepat meningkatkan sinergi otak kanan dalam menyusun naskah MC spontan.
      </span>

    </div>
  );
}
