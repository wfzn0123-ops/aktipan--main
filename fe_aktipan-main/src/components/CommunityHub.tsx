import React, { useState } from 'react';
import { 
  MessageSquare, Plus, ThumbsUp, Users, Gamepad2, Search, Tag, 
  ChevronLeft, User, Clock, Sparkles, Filter, Check, Send, 
  ArrowRight, Flame, HelpCircle, BookOpen, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CommunityHubProps {
  playerName: string;
  playerTitle: string;
  onJoinMabarRoom: (roomCode: string) => void;
  soundEnabled: boolean;
  triggerSound: (type: 'success' | 'fail' | 'click' | 'buzzer' | 'foul') => void;
}

interface ForumThread {
  id: string;
  title: string;
  category: 'Diskusi MC' | 'Tips Game' | 'Skenario Sesi' | 'Tanya Jawab';
  content: string;
  authorName: string;
  authorTitle: string;
  upvotes: number;
  hasUpvoted?: boolean;
  time: string;
  replies: {
    id: string;
    authorName: string;
    authorTitle: string;
    content: string;
    time: string;
  }[];
}

interface MabarGroup {
  id: string;
  roomCode: string;
  groupName: string;
  hostName: string;
  hostTitle: string;
  gameMode: string;
  slotsMax: number;
  slotsFilled: number;
  status: 'LOBBY' | 'PLAYING';
}

export default function CommunityHub({
  playerName,
  playerTitle,
  onJoinMabarRoom,
  soundEnabled,
  triggerSound
}: CommunityHubProps) {
  // Tabs: 'forum' | 'mabar'
  const [currentTab, setCurrentTab] = useState<'forum' | 'mabar'>('forum');
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Creation Modals
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);

  // Thread Detailed View
  const [activeThread, setActiveThread] = useState<ForumThread | null>(null);
  const [replyInput, setReplyInput] = useState('');

  // Form Inputs for New Thread
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadCategory, setNewThreadCategory] = useState<'Diskusi MC' | 'Tips Game' | 'Skenario Sesi' | 'Tanya Jawab'>('Diskusi MC');
  const [newThreadContent, setNewThreadContent] = useState('');

  // Form Inputs for New Group
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupGameMode, setNewGroupGameMode] = useState('Multiplayer Arena Duel');
  const [newGroupSlots, setNewGroupSlots] = useState(4);

  // Initial Seed Data for Forum Threads
  const [threads, setThreads] = useState<ForumThread[]>([
    {
      id: 't-1',
      title: 'Bagaimana mengatasi audiens bapak-bapak yang acuh di baris depan?',
      category: 'Diskusi MC',
      content: 'Kemarin membawakan acara gathering perusahaan, kursi baris depan diisi direksi dan manajer senior yang sibuk main HP terus. Saya coba pakai icebreaker berhitung ditolak halus. Ada tips skenario naskah pembuka MC yang elegan untuk menarik atensi mereka tanpa terkesan memaksa?',
      authorName: 'Rony_MC',
      authorTitle: 'Senior MC & Host',
      upvotes: 24,
      hasUpvoted: false,
      time: '2 jam yang lalu',
      replies: [
        {
          id: 'r-1',
          authorName: 'Siti_EO',
          authorTitle: 'Fasilitator',
          content: 'Coba trik "Apresiasi Ego" kak. Alih-alih menyuruh mereka bertepuk tangan secara kolektif, panggil salah satu nama direksi secara santun: "Selamat pagi Pak Budi, saya dengar pencapaian kuartal ini luar biasa ya...". Ketika mereka merasa dihargai secara personal, HP langsung disimpan.',
          time: '1 jam yang lalu'
        },
        {
          id: 'r-2',
          authorName: 'Andika Pratama',
          authorTitle: 'Elite Trainer',
          content: 'Setuju dengan Siti! Tambahan: gunakan perbandingan panggung. MC jangan terlalu dominan di awal, tapi buat mereka merasa panggung itu milik mereka dengan dialog interaktif tipis-tipis.',
          time: '30 menit yang lalu'
        }
      ]
    },
    {
      id: 't-2',
      title: 'Skenario Game "Tebak Kata Beruntun" untuk Karyawan Pabrik',
      category: 'Skenario Sesi',
      content: 'Butuh rekomendasi daftar 10 kata kunci bernada humoris tapi sopan untuk game berkelompok karyawan operasional pabrik makanan. Targetnya melatih komunikasi instruksi pendek.',
      authorName: 'Jessica_L&D',
      authorTitle: 'HRD Manager',
      upvotes: 18,
      hasUpvoted: false,
      time: '5 jam yang lalu',
      replies: [
        {
          id: 'r-3',
          authorName: 'Gita_Guru',
          authorTitle: 'Instruktur',
          content: 'Bisa pakai istilah yang berdekatan dengan keseharian pabrik dicampur kata nyeleneh seperti: "Mesin Cetak", "Bonus Lembur", "Goyang Oven", "Kopi Sachet", "Keripik Pedas". Kombinasi ini dijamin bikin tawa pecah!',
          time: '3 jam yang lalu'
        }
      ]
    },
    {
      id: 't-3',
      title: 'Trik Aturan Skor Bel Kawat di Live Arena',
      category: 'Tips Game',
      content: 'Tips buat yang sering kalah di Ronde 2 (Bel Refleks). Sebaiknya jangan spam klik bel dari detik pertama, melainkan tunggu lampu indikator berubah warna merah menyala tepat di tengah layar. Spam klik justru mengaktifkan denda foul denda -30 poin!',
      authorName: 'Eko_Host',
      authorTitle: 'Co-Host',
      upvotes: 15,
      hasUpvoted: false,
      time: '1 hari yang lalu',
      replies: []
    }
  ]);

  // Initial Seed Data for Mabar Groups
  const [mabarGroups, setMabarGroups] = useState<MabarGroup[]>([
    {
      id: 'g-1',
      roomCode: 'ARENA-1',
      groupName: 'Latihan MC Wedding EO',
      hostName: 'Siti_EO',
      hostTitle: 'Fasilitator',
      gameMode: 'Multiplayer Arena Duel',
      slotsMax: 4,
      slotsFilled: 2,
      status: 'LOBBY'
    },
    {
      id: 'g-2',
      roomCode: 'MABAR-HRD',
      groupName: 'Uji Coba Game Icebreaker L&D',
      hostName: 'Jessica_L&D',
      hostTitle: 'HRD Manager',
      gameMode: 'Adu Cepat Refleks Bel',
      slotsMax: 8,
      slotsFilled: 3,
      status: 'LOBBY'
    },
    {
      id: 'g-3',
      roomCode: 'TRIVIA-PRO',
      groupName: 'Speedrun Tebak Naskah MC',
      hostName: 'Andika Pratama',
      hostTitle: 'Elite Trainer',
      gameMode: 'Multiplayer Arena Duel',
      slotsMax: 2,
      slotsFilled: 1,
      status: 'PLAYING'
    }
  ]);

  // Handle Thread Upvote
  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (soundEnabled) triggerSound('click');
    setThreads(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          upvotes: t.hasUpvoted ? t.upvotes - 1 : t.upvotes + 1,
          hasUpvoted: !t.hasUpvoted
        };
      }
      return t;
    }));
  };

  // Submit New Thread Form
  const handleCreateThreadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    if (soundEnabled) triggerSound('success');

    const createdThread: ForumThread = {
      id: `t-${Date.now()}`,
      title: newThreadTitle,
      category: newThreadCategory,
      content: newThreadContent,
      authorName: playerName,
      authorTitle: playerTitle,
      upvotes: 1,
      hasUpvoted: true,
      time: 'Baru saja',
      replies: []
    };

    setThreads([createdThread, ...threads]);
    
    // Clear forms & close modal
    setNewThreadTitle('');
    setNewThreadContent('');
    setShowNewThreadModal(false);
  };

  // Submit New Reply to Thread
  const handleCreateReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !activeThread) return;

    if (soundEnabled) triggerSound('success');

    const newReply = {
      id: `r-${Date.now()}`,
      authorName: playerName,
      authorTitle: playerTitle,
      content: replyInput,
      time: 'Baru saja'
    };

    // Update specific thread replies list
    setThreads(prev => prev.map(t => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          replies: [...t.replies, newReply]
        };
      }
      return t;
    }));

    // Local update inside detailed view state
    setActiveThread(prev => prev ? {
      ...prev,
      replies: [...prev.replies, newReply]
    } : null);

    setReplyInput('');
  };

  // Submit New Mabar Group Form
  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    if (soundEnabled) triggerSound('success');

    const generatedCode = `MABAR-${Math.floor(1000 + Math.random() * 9000)}`;

    const createdGroup: MabarGroup = {
      id: `g-${Date.now()}`,
      roomCode: generatedCode,
      groupName: newGroupName,
      hostName: playerName,
      hostTitle: playerTitle,
      gameMode: newGroupGameMode,
      slotsMax: newGroupSlots,
      slotsFilled: 1,
      status: 'LOBBY'
    };

    setMabarGroups([createdGroup, ...mabarGroups]);
    setShowNewGroupModal(false);
    setNewGroupName('');

    // Trigger Join to newly created room code
    onJoinMabarRoom(generatedCode);
  };

  // Join action for Group Mabar
  const handleJoinGroupClick = (group: MabarGroup) => {
    if (soundEnabled) triggerSound('click');
    onJoinMabarRoom(group.roomCode);
  };

  // Filter Thread calculation
  const filteredThreads = threads.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col min-h-[520px] shadow-sm relative overflow-hidden">
      
      {/* HEADER SECTION TAB SELECTION */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 relative z-10">
        <div className="flex items-center gap-1.5">
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => { if (soundEnabled) triggerSound('click'); setCurrentTab('forum'); setActiveThread(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'forum' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/40 dark:hover:bg-slate-800/40'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" /> Forum Diskusi
            </button>
            <button 
              onClick={() => { if (soundEnabled) triggerSound('click'); setCurrentTab('mabar'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'mabar' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/40 dark:hover:bg-slate-800/40'
              }`}
            >
              <Users className="h-3.5 w-3.5" /> Grup Mabar ({mabarGroups.length})
            </button>
          </div>
        </div>

        {/* Action Button depending on active Tab */}
        {currentTab === 'forum' ? (
          !activeThread && (
            <button 
              onClick={() => { if (soundEnabled) triggerSound('click'); setShowNewThreadModal(true); }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider py-1.5 px-3.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Buat Diskusi
            </button>
          )
        ) : (
          <button 
            onClick={() => { if (soundEnabled) triggerSound('click'); setShowNewGroupModal(true); }}
            className="bg-emerald-600 hover:bg-emerald-550 text-white font-black text-xs uppercase tracking-wider py-1.5 px-3.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Buat Mabar
          </button>
        )}
      </div>

      {/* RENDER TAB 1: DISCUSSION FORUM */}
      {currentTab === 'forum' && (
        <div className="flex-grow flex flex-col justify-between">
          
          {/* Forum Thread Detailed View */}
          {activeThread ? (
            <div className="space-y-4 flex-grow flex flex-col justify-between">
              
              {/* Back to threads header */}
              <button 
                onClick={() => { if (soundEnabled) triggerSound('click'); setActiveThread(null); }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer py-1 font-bold transition-all"
              >
                <ChevronLeft className="h-4 w-4" /> Kembali ke Semua Diskusi
              </button>

              {/* Thread Core Content */}
              <div className="p-5 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3 shadow-3xs">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-200/55 px-2 py-0.5 rounded-md font-mono">
                    {activeThread.category}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">{activeThread.time}</span>
                </div>

                <h3 className="text-sm font-black text-slate-900 leading-snug">{activeThread.title}</h3>
                
                <p className="text-xs text-slate-650 leading-relaxed font-normal whitespace-pre-line">
                  {activeThread.content}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 text-[10px]">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <User className="h-3.5 w-3.5 text-indigo-600" />
                    <div>
                      <span className="font-bold text-slate-800">{activeThread.authorName}</span>
                      <span className="text-[8px] font-mono text-slate-500 block leading-none">{activeThread.authorTitle}</span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => handleUpvote(activeThread.id, e)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
                      activeThread.hasUpvoted 
                        ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                        : 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                    }`}
                  >
                    <ThumbsUp className="h-3 w-3" /> {activeThread.upvotes} Upvote
                  </button>
                </div>
              </div>

              {/* Replies Thread Feed */}
              <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1 font-mono">
                  <MessageSquare className="h-3.5 w-3.5 text-slate-400" /> Komentar ({activeThread.replies.length}):
                </h4>

                {activeThread.replies.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-450 text-xs italic bg-slate-50/20">
                    Belum ada balasan. Jadilah yang pertama memberikan solusi panggung!
                  </div>
                ) : (
                  activeThread.replies.map((rep) => (
                    <div key={rep.id} className="p-3 bg-slate-50/55 border border-slate-150 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-[9px] font-mono">
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-indigo-600">{rep.authorName}</span>
                          <span className="text-[7.5px] bg-slate-200/85 text-slate-600 border border-slate-300 px-1 py-0.5 rounded leading-none">{rep.authorTitle}</span>
                        </div>
                        <span className="text-slate-400">{rep.time}</span>
                      </div>
                      <p className="text-xs text-slate-650 leading-relaxed font-normal">
                        {rep.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Write Reply Form */}
              <form onSubmit={handleCreateReplySubmit} className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <input 
                  type="text" 
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="Ketik balasan solusi atau saran panggung Anda..."
                  className="flex-grow bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-800"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl flex items-center gap-1 shadow transition-colors cursor-pointer"
                >
                  Kirim <Send className="h-3 w-3" />
                </button>
              </form>

            </div>
          ) : (
            /* Forum Threads Feed Index List */
            <div className="space-y-4 flex-grow flex flex-col justify-between">
              <div>
                {/* Search & Category Filter Header Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-4 select-none">
                  <div className="sm:col-span-7 relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari kata kunci diskusi forum..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-805 font-sans"
                    />
                  </div>

                  <div className="sm:col-span-5 flex items-center gap-1">
                    <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-xs text-slate-705 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Semua">Semua Kategori</option>
                      <option value="Diskusi MC">Diskusi MC</option>
                      <option value="Tips Game">Tips Game</option>
                      <option value="Skenario Sesi">Skenario Sesi</option>
                      <option value="Tanya Jawab">Tanya Jawab</option>
                    </select>
                  </div>
                </div>

                {/* Feed Cards list */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {filteredThreads.length === 0 ? (
                    <div className="py-12 border border-dashed border-slate-200 bg-slate-50/10 rounded-2xl text-center space-y-2">
                      <HelpCircle className="h-8 w-8 text-slate-400 mx-auto" />
                      <p className="text-slate-450 text-xs italic">
                        Tidak ada thread diskusi ditemukan yang cocok dengan kriteria Anda.
                      </p>
                    </div>
                  ) : (
                    filteredThreads.map((thread) => (
                      <div 
                        key={thread.id} 
                        onClick={() => { if (soundEnabled) triggerSound('click'); setActiveThread(thread); }}
                        className="p-4 bg-slate-50/45 hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-2xl cursor-pointer transition-all space-y-2.5 group shadow-3xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                            {thread.category}
                          </span>
                          <span className="text-[8.5px] text-slate-405 font-mono">{thread.time}</span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 group-hover:text-indigo-600 leading-snug transition-colors">
                          {thread.title}
                        </h4>

                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {thread.content}
                        </p>

                        <div className="flex items-center justify-between text-[9px] text-slate-500 pt-2 border-t border-slate-100">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 text-slate-450" /> {thread.authorName} • <span className="text-slate-500 truncate max-w-[120px]">{thread.authorTitle}</span>
                          </span>

                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 hover:text-slate-800" onClick={(e) => handleUpvote(thread.id, e)}>
                              <ThumbsUp className="h-3 w-3 text-rose-500" /> {thread.upvotes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" /> {thread.replies.length} Balasan
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tip block at the bottom */}
              <div className="text-center pt-2.5 border-t border-slate-100 text-[9.5px] text-slate-450 font-mono select-none">
                💡 Diskusikan naskah intro MC, taktik outbound, atau bagikan feedback game interaktif Anda!
              </div>

            </div>
          )}

        </div>
      )}

      {/* RENDER TAB 2: GRUP MABAR LIST (GROUP FINDER) */}
      {currentTab === 'mabar' && (
        <div className="flex-grow flex flex-col justify-between">
          
          <div className="space-y-4">
            
            {/* Banner info */}
            <div className="p-3 bg-indigo-50/60 border border-indigo-150 rounded-2xl flex items-center justify-between gap-3 text-xs leading-relaxed select-none">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-100 text-indigo-600 border border-indigo-200/50">
                  <Flame className="h-4 w-4 animate-pulse" />
                </span>
                <p className="text-slate-650">
                  <strong>Butuh Partner?</strong> Masuk ke salah satu grup mabar aktif di bawah untuk bertanding atau berlatih bersama public secara real-time.
                </p>
              </div>
            </div>

            {/* Groups Grid List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {mabarGroups.map((group) => {
                const isFull = group.slotsFilled >= group.slotsMax;
                const isPlaying = group.status === 'PLAYING';
                
                return (
                  <div 
                    key={group.id} 
                    className="p-4 bg-slate-50/60 border border-slate-200 rounded-2xl flex flex-col justify-between min-h-[140px] hover:border-indigo-300 hover:bg-slate-50 hover:shadow-xs transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[9px] font-mono select-none">
                        <span className="text-amber-700 font-bold bg-amber-55 text-amber-650 px-1.5 py-0.5 rounded leading-none border border-amber-200">
                          CODE: {group.roomCode}
                        </span>
                        
                        <span className={`px-1.5 py-0.5 rounded leading-none uppercase font-black tracking-wider ${
                          isPlaying 
                            ? 'bg-rose-50 text-rose-600 border border-rose-200/60' 
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                        }`}>
                          {isPlaying ? '🔴 Sedang Main' : '🟢 Waiting'}
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-slate-800 mt-2 leading-snug line-clamp-1">{group.groupName}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Host: {group.hostName} ({group.hostTitle})</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-150 flex items-center justify-between">
                      <div>
                        <span className="text-[8px] text-slate-400 uppercase block font-mono">GAME MODE</span>
                        <span className="text-[10px] font-black text-indigo-600 font-mono">{group.gameMode}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-mono text-slate-600 block mb-1">
                          👤 {group.slotsFilled} / {group.slotsMax} Player
                        </span>

                        <button 
                          onClick={() => handleJoinGroupClick(group)}
                          disabled={isFull || isPlaying}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                            isFull 
                              ? 'bg-slate-100 border border-slate-200 text-slate-400 disabled:pointer-events-none' 
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/10'
                          }`}
                        >
                          Join <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          <div className="text-center pt-2.5 border-t border-slate-150 text-[9.5px] text-slate-450 font-mono select-none">
            🤝 Bagikan kode undangan room Anda ke grup WhatsApp/Telegram Trainer untuk memulai duel panggung!
          </div>

        </div>
      )}

      {/* NEW THREAD DISCUSSION CREATION DIALOG (MODAL SIMULATOR) */}
      <AnimatePresence>
        {showNewThreadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl text-slate-805"
            >
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-wide">Buat Thread Diskusi Baru</h3>
              
              <form onSubmit={handleCreateThreadSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[9.5px] uppercase font-black tracking-wider text-slate-500 block mb-1 font-mono">1. JUDUL DISKUSI</label>
                  <input 
                    type="text" 
                    required
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    placeholder="Contoh: Aturan durasi mic di panggung outbound..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[9.5px] uppercase font-black tracking-wider text-slate-500 block mb-1 font-mono">2. KATEGORI FORUM</label>
                  <select 
                    value={newThreadCategory}
                    onChange={(e) => setNewThreadCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Diskusi MC">Diskusi MC</option>
                    <option value="Tips Game">Tips Game</option>
                    <option value="Skenario Sesi">Skenario Sesi</option>
                    <option value="Tanya Jawab">Tanya Jawab</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9.5px] uppercase font-black tracking-wider text-slate-500 block mb-1 font-mono">3. DETAIL ISI DISKUSI / PERTANYAAN</label>
                  <textarea 
                    rows={4}
                    required
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    placeholder="Jabarkan case studi, pertanyaan, atau ide game panggung Anda di sini secara detail..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 select-none">
                  <button 
                    type="button"
                    onClick={() => { if (soundEnabled) triggerSound('click'); setShowNewThreadModal(false); }}
                    className="flex-1 py-2 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Terbitkan Thread
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW MABAR GROUP CREATION DIALOG (MODAL SIMULATOR) */}
      <AnimatePresence>
        {showNewGroupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl text-slate-805"
            >
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-wide">Buat Room Grup Mabar</h3>
              
              <form onSubmit={handleCreateGroupSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[9.5px] uppercase font-black tracking-wider text-slate-500 block mb-1 font-mono">NAMA GRUP MABAR</label>
                  <input 
                    type="text" 
                    required
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Contoh: Latihan Outbound Asyik HRD..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[9.5px] uppercase font-black tracking-wider text-slate-500 block mb-1 font-mono">MODE PERMAINAN</label>
                  <select 
                    value={newGroupGameMode}
                    onChange={(e) => setNewGroupGameMode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Multiplayer Arena Duel">Multiplayer Arena Duel</option>
                    <option value="Adu Cepat Refleks Bel">Adu Cepat Refleks Bel</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9.5px] uppercase font-black tracking-wider text-slate-500 block mb-1 font-mono">JUMLAH SLOT MAKSIMAL</label>
                  <select 
                    value={newGroupSlots}
                    onChange={(e) => setNewGroupSlots(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={2}>2 Pemain (Duel 1v1)</option>
                    <option value={4}>4 Pemain (Team Versus 2v2)</option>
                    <option value={6}>6 Pemain (Team Versus 3v3)</option>
                    <option value={8}>8 Pemain (Rivalry Match)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2 select-none">
                  <button 
                    type="button"
                    onClick={() => { if (soundEnabled) triggerSound('click'); setShowNewGroupModal(false); }}
                    className="flex-1 py-2 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-550 text-white text-xs font-black uppercase tracking-wider cursor-pointer"
                  >
                    Kunci & Buka Room
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
