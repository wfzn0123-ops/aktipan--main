import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Trophy, Zap, Clock, Send, Volume2, VolumeX, Shield, Award, Play, 
  AlertCircle, RotateCcw, CheckCircle2, ChevronRight, User, Key, HelpCircle, 
  Star, Heart, Flame, RefreshCw, Copy, Check, LogOut, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GameMultiplayerProps {
  playerName: string;
  playerTitle: string;
  soundEnabled: boolean;
  triggerSound: (type: 'success' | 'fail' | 'click' | 'buzzer' | 'foul') => void;
  onFinish: (score: number) => void;
  initialRoomId?: string;
}

interface Player {
  id: string;
  name: string;
  title: string;
  team: 'red' | 'blue' | 'none';
  isReady: boolean;
  score: number;
}

interface RoomState {
  id: string;
  state: 'LOBBY' | 'PLAYING' | 'QUESTION' | 'BUZZED' | 'ROUND_OVER' | 'SUMMARY';
  players: Player[];
  currentRound: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  buzzedPlayerId: string | null;
  buzzTime: number | null;
  roundWinner: string | null;
  bellSignalActive: boolean;
}

export default function GameMultiplayer({ 
  playerName, 
  playerTitle, 
  soundEnabled, 
  triggerSound, 
  onFinish,
  initialRoomId
}: GameMultiplayerProps) {
  // Connection states: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'
  const [connectionStatus, setConnectionStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'>('DISCONNECTED');
  const [roomIdInput, setRoomIdInput] = useState<string>(initialRoomId || 'ARENA-1');
  const [selectedTeam, setSelectedTeam] = useState<'red' | 'blue' | 'none'>('none');
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [myRoomId, setMyRoomId] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [foulMessage, setFoulMessage] = useState<string | null>(null);

  // Chat states inside room
  const [roomChats, setRoomChats] = useState<{ sender: string; text: string; role?: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState<string>('');

  const wsRef = useRef<WebSocket | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Connect to the WebSocket Server
  const connectToWs = () => {
    if (soundEnabled) triggerSound('click');
    setConnectionStatus('CONNECTING');

    // Use environment variable for WebSocket URL, fallback to Railway production
    const envWsUrl = import.meta.env.VITE_WS_ARENA_URL;
    const wsUrl = envWsUrl || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
      ? `ws://${window.location.host}/ws/arena` 
      : 'wss://aktipan-main-production.up.railway.app/ws/arena');
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus('CONNECTED');
        if (soundEnabled) triggerSound('success');
        
        // Join immediately with parameters
        ws.send(JSON.stringify({
          type: 'JOIN_ROOM',
          roomId: roomIdInput,
          playerName,
          playerTitle,
          playerTeam: selectedTeam
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'JOIN_SUCCESS') {
            setMyPlayerId(data.playerId);
            setMyRoomId(data.roomId);
            setRoomState(data.roomState);
            addSystemMsg(`Sukses bergabung di room: ${data.roomId}`);
          }
          
          else if (data.type === 'ROOM_UPDATE') {
            setRoomState(data.roomState);
          }
          
          else if (data.type === 'GAME_STARTED') {
            setRoomState(data.roomState);
            setFoulMessage(null);
            if (soundEnabled) triggerSound('buzzer');
          }
          
          else if (data.type === 'BUZZED') {
            setRoomState(data.roomState);
            if (soundEnabled) triggerSound('buzzer');
          }
          
          else if (data.type === 'FOUL') {
            setFoulMessage(data.message);
            if (soundEnabled) triggerSound('foul');
            setTimeout(() => setFoulMessage(null), 3000);
          }
          
          else if (data.type === 'ROUND_RESULT') {
            setRoomState(data.roomState);
            if (soundEnabled) {
              triggerSound(data.isCorrect ? 'success' : 'fail');
            }
          }
          
          else if (data.type === 'BELL_SIGNAL_ACTIVE') {
            setRoomState(data.roomState);
            if (soundEnabled) triggerSound('buzzer');
          }
          
          else if (data.type === 'GAME_OVER') {
            setRoomState(data.roomState);
            if (soundEnabled) triggerSound('success');
          }
          
          else if (data.type === 'ARENA_CHAT_MSG') {
            const { sender, text, role, time } = data;
            setRoomChats(prev => [...prev, { sender, text, role, time }]);
          }

        } catch (err) {
          console.error("WS Parse Error:", err);
        }
      };

      ws.onclose = () => {
        setConnectionStatus('DISCONNECTED');
        setRoomState(null);
        setMyPlayerId(null);
        setMyRoomId(null);
      };

      ws.onerror = () => {
        setConnectionStatus('ERROR');
      };

    } catch (e) {
      console.error(e);
      setConnectionStatus('ERROR');
    }
  };

  const disconnectFromWs = () => {
    if (soundEnabled) triggerSound('click');
    if (wsRef.current) {
      wsRef.current.close();
    }
    setConnectionStatus('DISCONNECTED');
    setRoomState(null);
    setMyPlayerId(null);
    setMyRoomId(null);
  };

  const addSystemMsg = (text: string) => {
    setRoomChats(prev => [
      ...prev,
      { sender: 'SISTEM', text, role: 'Moderator', time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }
    ]);
  };

  // Toggle Ready inside room
  const toggleReady = () => {
    if (soundEnabled) triggerSound('click');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'TOGGLE_READY' }));
    }
  };

  // Start multiplayer game loop
  const startGame = () => {
    if (soundEnabled) triggerSound('click');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'START_GAME' }));
    }
  };

  // Click the buzzer in real-time
  const handleBuzzClick = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'BUZZ' }));
    }
  };

  // Submit Answer to trivia question
  const submitTriviaAnswer = (option: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'SUBMIT_ANSWER',
        answer: option
      }));
    }
  };

  // Move to next round
  const triggerNextRound = () => {
    if (soundEnabled) triggerSound('click');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'NEXT_ROUND' }));
    }
  };

  // Reset Game
  const triggerReset = () => {
    if (soundEnabled) triggerSound('click');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'RESET_LOBBY' }));
    }
  };

  // Send Chat message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    if (soundEnabled) triggerSound('click');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'SEND_ARENA_CHAT',
        sender: playerName,
        role: playerTitle,
        text: chatInput
      }));
      setChatInput('');
    }
  };

  // Copy invitation code helper
  const handleCopyCode = () => {
    if (myRoomId) {
      navigator.clipboard.writeText(myRoomId);
      setCopiedLink(true);
      if (soundEnabled) triggerSound('success');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Scroll chats down
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [roomChats]);

  // Clean up socket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Determine current user object
  const myPlayerInfo = roomState?.players.find(p => p.id === myPlayerId);
  const listTeamRed = roomState?.players.filter(p => p.team === 'red') || [];
  const listTeamBlue = roomState?.players.filter(p => p.team === 'blue') || [];
  const listTeamFFA = roomState?.players.filter(p => p.team === 'none') || [];

  return (
    <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between min-h-[520px] shadow-sm relative overflow-hidden">
      
      {/* GLOW DECORATIONS */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-slate-150 pb-3.5 relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 animate-pulse">
            <Flame className="h-4.5 w-4.5" />
          </span>
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
              ARENA DUEL MULTIPLAYER REAL-TIME
              <span className="text-[7.5px] font-black uppercase bg-indigo-600 px-1 py-0.5 rounded text-white tracking-widest">BETA-WS</span>
            </h3>
            <p className="text-[9px] text-slate-500 font-mono">Buka tab baru atau berikan Room ID ke rekan untuk bermain bersama!</p>
          </div>
        </div>
        
        {connectionStatus === 'CONNECTED' && myRoomId && (
          <button 
            onClick={disconnectFromWs}
            className="text-[9px] font-black uppercase px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="h-2.5 w-2.5" /> Keluar Room
          </button>
        )}
      </div>

      {/* SCREEN 1: ROOM SETUP (DISCONNECTED OR FORM PHASE) */}
      {connectionStatus !== 'CONNECTED' && (
        <div className="my-6 flex flex-col items-center justify-center py-6 relative z-10 max-w-sm mx-auto">
          <div className="h-14 w-14 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600 mb-4 animate-bounce-slow shadow-sm">
            <Users className="h-7 w-7" />
          </div>

          <h4 className="text-sm font-black uppercase text-slate-900 tracking-wide text-center">Buat / Join Room Duel</h4>
          <p className="text-[10.5px] text-slate-500 text-center leading-relaxed mt-1 mb-5">
            Bertandinglah 1-on-1 atau Team Versus bersama MC dan Trainer lain di gadget mereka masing-masing secara sinkron!
          </p>

          <div className="w-full space-y-4">
            <div>
              <label className="text-[9px] uppercase font-black tracking-wider text-slate-500 block mb-1 font-mono">1. MASUKKAN ROOM ID</label>
              <input 
                type="text" 
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                placeholder="CONTOH: KELOMPOK-A..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-[9px] uppercase font-black tracking-wider text-slate-500 block mb-1 font-mono">2. PILIH TIM ANDA</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => { triggerSound('click'); setSelectedTeam('red'); }}
                  className={`py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all cursor-pointer ${
                    selectedTeam === 'red' 
                      ? 'bg-rose-50 border-rose-300 text-rose-600 scale-102 shadow-sm' 
                      : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  🔴 Team Merah
                </button>
                <button 
                  onClick={() => { triggerSound('click'); setSelectedTeam('blue'); }}
                  className={`py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all cursor-pointer ${
                    selectedTeam === 'blue' 
                      ? 'bg-blue-50 border-blue-300 text-blue-600 scale-102 shadow-sm' 
                      : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  🔵 Team Biru
                </button>
                <button 
                  onClick={() => { triggerSound('click'); setSelectedTeam('none'); }}
                  className={`py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all cursor-pointer ${
                    selectedTeam === 'none' 
                      ? 'bg-amber-50 border-amber-300 text-amber-600 scale-102 shadow-sm' 
                      : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  ⚔️ FFA (1v1)
                </button>
              </div>
            </div>

            <button 
              onClick={connectToWs}
              disabled={connectionStatus === 'CONNECTING'}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider py-3 rounded-lg shadow-md active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              {connectionStatus === 'CONNECTING' ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> MENGHUBUNGKAN SERVER...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" /> MASUK KE ARENA MULTIPLAYER
                </>
              )}
            </button>
            
            {connectionStatus === 'ERROR' && (
              <p className="text-[10px] text-rose-600 font-bold text-center">
                ⚠️ Gagal terhubung ke server real-time. Pastikan dev server berjalan di port 3000.
              </p>
            )}
          </div>
        </div>
      )}

      {/* SCREEN 2: GAMEPLAY LOBBY / INTERACTIVE PLAYING */}
      {connectionStatus === 'CONNECTED' && roomState && (
        <div className="flex-grow flex flex-col md:grid md:grid-cols-12 gap-5 mt-4 relative z-10">
          
          {/* LEFT COLUMN: ACTIVE SCREEN STATE (8 COLS) */}
          <div className="md:col-span-8 flex flex-col justify-between min-h-[380px] bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm">
            
            {/* LOBBY ROOM PRE-START */}
            {roomState.state === 'LOBBY' && (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3.5 rounded-xl mb-4 shadow-inner-sm">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">KODE ROOM UNDANGAN</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-800 tracking-widest uppercase font-mono">{roomState.id}</span>
                        <button 
                          onClick={handleCopyCode}
                          className="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer shadow-sm"
                          title="Salin Kode Room"
                        >
                          {copiedLink ? <Check className="h-3 w-3 text-emerald-600 animate-pulse" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-mono text-emerald-600 uppercase block font-bold">● SERVER ONLINE</span>
                      <span className="text-[10px] font-black text-slate-600 font-mono">{roomState.players.length} Pemain</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-black uppercase text-indigo-600 tracking-wider mb-2.5 font-mono">📋 STATUS PEMAIN ARENA:</h4>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {roomState.players.map((p) => (
                      <div 
                        key={p.id} 
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all shadow-sm ${
                          p.id === myPlayerId 
                            ? 'bg-indigo-50 border-indigo-200' 
                            : 'bg-white border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">
                            {p.team === 'red' ? '🔴' : p.team === 'blue' ? '🔵' : '⚔️'}
                          </span>
                          <div>
                            <span className={`font-extrabold ${p.id === myPlayerId ? 'text-indigo-750' : 'text-slate-800'}`}>
                              {p.name} {p.id === myPlayerId && '(Anda)'}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono block leading-none">{p.title}</span>
                          </div>
                        </div>

                        <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                          p.isReady 
                            ? 'bg-emerald-50 border border-emerald-250 text-emerald-600' 
                            : 'bg-slate-50 border border-slate-200 text-slate-400'
                        }`}>
                          {p.isReady ? 'SIAP ✔' : 'LOBBY'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-150 flex items-center gap-3">
                  <button 
                    onClick={toggleReady}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                      myPlayerInfo?.isReady 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-600 shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 shadow-sm'
                    }`}
                  >
                    {myPlayerInfo?.isReady ? 'BATAL SIAP' : 'SAYA SIAP MEMULAI'}
                  </button>

                  <button 
                    onClick={startGame}
                    disabled={!roomState.players.every(p => p.isReady) || roomState.players.length === 0}
                    className="py-2.5 px-5 rounded-lg text-xs font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-50 disabled:text-slate-400 border border-indigo-500/20 disabled:border-slate-250 text-white transition-all cursor-pointer shadow-md flex items-center justify-center gap-1"
                  >
                    MULAI GAME <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TRIVIA OR BUZZER ACTIVE */}
            {roomState.state === 'PLAYING' && (
              <div className="flex-1 flex flex-col justify-between">
                
                {/* Round gauge header */}
                <div className="flex items-center justify-between border-b border-slate-150 pb-2 mb-3 select-none">
                  <span className="text-[10px] font-black uppercase tracking-widest font-mono text-amber-600 flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5" /> RONDE {roomState.currentRound} / 3
                  </span>
                  
                  <span className="text-[10px] font-mono text-slate-500">
                    Sistem: {roomState.currentRound === 2 ? 'Refleks Cepat' : 'Adu Cepat & Jawaban Tepat'}
                  </span>
                </div>

                {/* Challenge description card */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center mb-5 flex flex-col justify-center min-h-[100px] shadow-inner-sm">
                  <h4 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 font-mono tracking-widest mb-1.5">TANTANGAN:</h4>
                  <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed">
                    {roomState.questionText}
                  </p>
                </div>

                {/* ROUND 1 & 3: TRIVIA COMPONENT WITH BUZZING */}
                {(roomState.currentRound === 1 || roomState.currentRound === 3) && (
                  <div className="flex-1 flex flex-col justify-center items-center gap-4">
                    
                    {/* State: No one has buzzed yet. Render Giant Buzz Button! */}
                    {!roomState.buzzedPlayerId ? (
                      <div className="text-center space-y-3">
                        <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest animate-pulse">
                          BEL DIKUNCI SEMENTARA... TEKAN SEGERA JIKA TAHU JAWABANNYA!
                        </p>
                        
                        <button 
                          onClick={handleBuzzClick}
                          className="h-28 w-28 rounded-full bg-rose-600 border-4 border-rose-400 hover:bg-rose-500 cursor-pointer shadow-lg shadow-rose-500/20 flex flex-col items-center justify-center font-black text-white hover:scale-105 active:scale-95 transition-all text-sm tracking-wider"
                        >
                          TEKAN BEL
                        </button>
                      </div>
                    ) : (
                      /* State: Someone has buzzed! */
                      <div className="w-full text-center space-y-4">
                        
                        {/* Answering indicator banner */}
                        <div className="p-2.5 bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-bold rounded-lg animate-pulse max-w-xs mx-auto shadow-sm">
                          ⚡ {roomState.buzzedPlayerId === myPlayerId ? 'ANDA' : roomState.players.find(p => p.id === roomState.buzzedPlayerId)?.name} SEDANG MENJAWAB!
                        </div>

                        {/* If current player is the one who buzzed, render multiple choices! */}
                        {roomState.buzzedPlayerId === myPlayerId ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                            {roomState.options.map((opt, oIdx) => (
                              <button 
                                key={oIdx}
                                onClick={() => submitTriviaAnswer(opt)}
                                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-left text-xs font-semibold text-slate-800 border border-slate-200 hover:border-indigo-300 hover:text-indigo-950 transition-all cursor-pointer flex items-center justify-between shadow-sm"
                              >
                                <span>{opt}</span>
                                <ArrowRight className="h-3.5 w-3.5 text-indigo-600 opacity-0 hover:opacity-100 shrink-0" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          /* Other players just wait */
                          <div className="py-6 text-center text-slate-500 text-xs italic">
                            Harap tunggu... Jawaban sedang dipilih oleh rival Anda.
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                )}

                {/* ROUND 2: SPEED REFLEX CHANCE */}
                {roomState.currentRound === 2 && (
                  <div className="flex-1 flex flex-col justify-center items-center gap-4">
                    
                    {foulMessage && (
                      <div className="p-2 bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-black uppercase rounded-lg animate-shake shadow-sm">
                        ⚠️ {foulMessage}
                      </div>
                    )}

                    <div className="text-center space-y-4">
                      <button 
                        onClick={handleBuzzClick}
                        className={`h-32 w-32 rounded-full border-4 shadow-xl flex flex-col items-center justify-center transition-all ${
                          roomState.bellSignalActive 
                            ? 'bg-red-600 border-rose-300 animate-bounce cursor-pointer brightness-110 shadow-red-500/40' 
                            : 'bg-slate-100 border-slate-200 text-slate-400 cursor-pointer shadow-inner-sm'
                        }`}
                      >
                        <span className={`font-black text-xs tracking-wider uppercase ${roomState.bellSignalActive ? 'text-white' : 'text-slate-400'}`}>
                          {roomState.bellSignalActive ? 'BUZZ SEKARANG!!!' : 'TUNGGU ISYARAT'}
                        </span>
                      </button>

                      <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">
                        MENEKAN SEBELUM SINYAL MERAH AKAN KENA DENDA -30 POIN!
                      </p>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* ROUND OVER STATUS */}
            {roomState.state === 'ROUND_OVER' && (
              <div className="flex-grow flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-150 pb-2 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest font-mono text-emerald-600">
                    HASIL RONDE SELESAI
                  </span>
                </div>

                <div className="text-center space-y-4 my-auto p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto shadow-inner-sm">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-150 text-emerald-600 flex items-center justify-center mx-auto text-lg shadow-sm">
                    🎖️
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-500">Pemenang Ronde:</h4>
                    <p className="text-sm font-black text-emerald-600">
                      {roomState.players.find(p => p.id === roomState.roundWinner)?.name || 'Seseorang'}
                    </p>
                  </div>

                  {roomState.currentRound !== 2 && (
                    <div className="text-[11px] text-slate-600 leading-relaxed font-mono">
                      Jawaban Benar: <span className="text-emerald-600 font-bold block mt-0.5">{roomState.correctAnswer}</span>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 font-mono italic">
                    Acara panggung terus berjalan dinamis & adil!
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-150">
                  <button 
                    onClick={triggerNextRound}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    {roomState.currentRound < 3 ? 'Lanjut Ronde Berikutnya' : 'Lihat Rekap Juara Akhir'}
                  </button>
                </div>
              </div>
            )}

            {/* SUMMARY SCOREBOARD OF MULTIPLAYER DUEL */}
            {roomState.state === 'SUMMARY' && (
              <div className="flex-grow flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-150 pb-2 mb-3 select-none">
                  <span className="text-[10px] font-black uppercase tracking-widest font-mono text-amber-600 flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5" /> REKAP JUARA ARENA DUEL
                  </span>
                </div>

                <div className="my-auto space-y-4">
                  <div className="text-center max-w-md mx-auto space-y-1">
                    <h4 className="text-sm font-black uppercase text-slate-800">🏆 KLASEMEN AKHIR DUEL 🏆</h4>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed">
                      Luar biasa, pertandingan selesai! Rekap perolehan skor real-time seluruh gadget adalah sebagai berikut:
                    </p>
                  </div>

                  <div className="space-y-1.5 max-w-xs mx-auto max-h-[160px] overflow-y-auto">
                    {[...roomState.players].sort((a, b) => b.score - a.score).map((p, idx) => {
                      const rankIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️';
                      return (
                        <div key={p.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs shadow-sm">
                          <div className="flex items-center gap-1.5">
                            <span>{rankIcon}</span>
                            <span className="font-bold text-slate-700 truncate max-w-[120px]">
                              {p.name} {p.id === myPlayerId && '(Anda)'}
                            </span>
                          </div>
                          <span className="font-mono font-black text-amber-600">{p.score} Pts</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-150 flex gap-2">
                  <button 
                    onClick={triggerReset}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-black text-xs uppercase rounded-lg transition-all cursor-pointer shadow-sm"
                  >
                    Main Lagi (Reset Lobby)
                  </button>

                  <button 
                    onClick={() => {
                      // Claim half points towards total personal points
                      const pts = Math.max(0, myPlayerInfo?.score || 0);
                      onFinish(pts);
                    }}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-lg transition-all cursor-pointer shadow-md"
                  >
                    Klaim Skor & Pulang
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: TEAM STATS & PRIVATE ROOM CHATBOX (4 COLS) */}
          <div className="md:col-span-4 bg-slate-50/70 border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between h-[450px] md:h-full select-none shadow-sm">
            
            {/* TEAM SCORE TALLY SUMMARY */}
            <div className="p-3 bg-slate-100/60 border-b border-slate-200 space-y-1">
              <span className="text-[8.5px] font-black uppercase text-slate-500 tracking-wider block font-mono">STANDINGS KELOMPOK</span>
              
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono select-none">
                <div className="bg-rose-50 border border-rose-200/60 p-1.5 rounded flex flex-col justify-center shadow-sm">
                  <span className="text-[7.5px] text-rose-600 font-extrabold uppercase leading-none">🟥 TIM MERAH</span>
                  <span className="text-xs font-black text-rose-750 font-mono mt-0.5">
                    {listTeamRed.reduce((sum, p) => sum + p.score, 0)} Pts
                  </span>
                  <span className="text-[6.5px] text-slate-400">{listTeamRed.length} Anggota</span>
                </div>

                <div className="bg-blue-50 border border-blue-200/60 p-1.5 rounded flex flex-col justify-center shadow-sm">
                  <span className="text-[7.5px] text-blue-600 font-extrabold uppercase leading-none">🟦 TIM BIRU</span>
                  <span className="text-xs font-black text-blue-750 font-mono mt-0.5">
                    {listTeamBlue.reduce((sum, p) => sum + p.score, 0)} Pts
                  </span>
                  <span className="text-[6.5px] text-slate-400">{listTeamBlue.length} Anggota</span>
                </div>
              </div>
            </div>

            {/* LIVE ROOM CHAT LOGS */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5" id="multiplayer-room-chats">
              {roomChats.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-[10px] italic py-12">
                  <Send className="h-4 w-4 mb-1 text-slate-450" />
                  Belum ada percakapan. Mulai obrolan di room Anda!
                </div>
              ) : (
                roomChats.map((msg, mIdx) => (
                  <div key={mIdx} className="text-[10px] leading-relaxed">
                    <div className="flex items-baseline justify-between mb-0.5">
                      <div className="flex items-center gap-1">
                        <span className={`font-black hover:underline cursor-pointer ${
                          msg.sender === 'SISTEM' ? 'text-amber-600' : 'text-blue-600'
                        }`}>
                          {msg.sender}
                        </span>
                        {msg.role && (
                          <span className="text-[7px] bg-slate-150 text-slate-600 border border-slate-200 px-1 rounded font-mono scale-90">
                            {msg.role}
                          </span>
                        )}
                      </div>
                      <span className="text-[7.5px] text-slate-400 font-mono">{msg.time}</span>
                    </div>
                    <p className={`p-1.5 rounded border ${
                      msg.sender === 'SISTEM' 
                        ? 'bg-amber-50 border-amber-250 text-amber-800 italic' 
                        : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                    }`}>
                      {msg.text}
                    </p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* SEND CHAT FORM */}
            <form onSubmit={handleSendChat} className="p-2 bg-slate-100/60 border-t border-slate-200 flex items-center gap-1.5">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ketik obrolan room..."
                className="flex-1 bg-white border border-slate-200 rounded-lg py-1 px-2.5 text-[10.5px] focus:outline-none focus:border-indigo-500 text-slate-800 shadow-sm"
              />
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <Send className="h-3 w-3" />
              </button>
            </form>

          </div>

        </div>
      )}

      {/* FOOTER TIPS */}
      <div className="text-center border-t border-slate-150 pt-2.5 mt-4 relative z-10">
        <p className="text-[9px] text-slate-400 font-mono">
          🎮 DUA GADGET SINKRON: Pasang Room ID yang sama di perangkat handphone Anda yang lain untuk menguji refleks dual-gadget!
        </p>
      </div>

    </div>
  );
}
