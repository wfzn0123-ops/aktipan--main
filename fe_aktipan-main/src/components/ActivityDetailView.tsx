import React, { useState } from 'react';
import { 
  ArrowLeft, Clock, Users, Heart, Share2, Clipboard, ShieldCheck, 
  BookOpen, Sparkles, AlertTriangle, Lightbulb, Play, Printer, CheckSquare, Gamepad2, ThumbsUp,
  Volume2, FastForward, PlayCircle, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity } from '../data/activities';
import ActivityIllustration from './ActivityIllustration';
import { sound } from '../utils/sound';
import { useLanguage } from '../contexts/LanguageContext';

// Local Sound Synthesis redirected to central sound utility
function playTapSound(type: 'tap' | 'chime' | 'success') {
  if (type === 'tap') {
    sound.playClick();
  } else if (type === 'chime') {
    sound.playSwoosh();
  } else if (type === 'success') {
    sound.playSuccess();
  }
}

const CATEGORY_TUTORIALS: { 
  [key: string]: { 
    videoUrl: string; 
    title: string;
    description: string;
    checklist: {
      beforeTitle: string;
      beforeDesc: string;
      durTitle: string;
      durDesc: string;
      afterTitle: string;
      afterDesc: string;
    }
  } 
} = {
  "Ice Breaking": {
    videoUrl: "https://www.youtube.com/embed/bFiL886U6Z8?modestbranding=1&rel=0",
    title: "Teknik Memandu Ice Breaking Pemicu Antusiasme",
    description: "Pelajari cara memecahkan kekakuan (break the ice) dalam 3 menit pertama dengan nada suara tinggi penuh energi dan bahasa tubuh terbuka.",
    checklist: {
      beforeTitle: "Pembuka Gokil (High Energy Check)",
      beforeDesc: "Sapa peserta dengan yel-yel gembira, yakinkan Anda tersenyum lebar sebelum panggung dimulai.",
      durTitle: "Aturan Bebas Tekanan (Rules Check)",
      durDesc: "Fokus pada tawa dan kesenangan, jangan menghukum peserta yang salah secara berlebihan.",
      afterTitle: "Transisi Sesi Singkat (Debrief Check)",
      afterDesc: "Cukup tanyakan 'Bagaimana rasanya?' lalu sambungkan refleksinya dengan materi inti."
    }
  },
  "Energizer": {
    videoUrl: "https://www.youtube.com/embed/E-6z9bI7gB8?modestbranding=1&rel=0",
    title: "Mengembalikan Fokus Menggunakan Gerak Motorik",
    description: "Panduan membangkitkan fokus kelompok yang mengantuk pasca makan siang dengan gerakan fisik terkoordinasi dan tempo cepat.",
    checklist: {
      beforeTitle: "Instruksi Cepat & Jelas",
      beforeDesc: "Peserta harus berdiri tegak, singkirkan tas atau kursi yang menghalangi ruang gerak.",
      durTitle: "Musik Tempo Upbeat",
      durDesc: "Putar lagu dengan tempo cepat (misal disko/pop ceria) untuk memicu adrenalin motorik.",
      afterTitle: "Kondisi Duduk Tenang",
      afterDesc: "Ajak peserta menarik napas dalam-dalam 3 kali sebelum dipersilakan duduk kembali."
    }
  },
  "Team Building": {
    videoUrl: "https://www.youtube.com/embed/gka_uUunv2c?modestbranding=1&rel=0",
    title: "Membangun 'Trust' & Sinergi antar Anggota Tim",
    description: "Simak bagaimana fasilitator memancing dinamika kolaborasi, mengatasi ego individu, dan membagi peran kepemimpinan tim.",
    checklist: {
      beforeTitle: "Metode Acak Pembentukan Tim",
      beforeDesc: "Hindari pembagian tim mandiri (kubu-kubuan). Gunakan hitungan angka atau warna pelangi.",
      durTitle: "Pemantauan Konflik Positif",
      durDesc: "Biarkan mereka berdebat taktis menguji strategi, intervensi hanya jika terjadi kebuntuan total.",
      afterTitle: "Debrief 'We Over I' (Kebersamaan)",
      afterDesc: "Gali porsi kontribusi masing-masing anggota dan pentingnya saling percaya di dunia kerja."
    }
  },
  "Communication": {
    videoUrl: "https://www.youtube.com/embed/8oWkX9_rXxs?modestbranding=1&rel=0",
    title: "Kunci Menyampaikan Pesan Verbal & Non-Verbal",
    description: "Demonstrasi praktis melatih peserta mendengarkan secara aktif (active listening) serta kejelasan menyampaikan perintah tanpa asumsi.",
    checklist: {
      beforeTitle: "Aturan Filter Kebisingan",
      beforeDesc: "Tetapkan rule pembatasan komunikasi (seperti dilarang berbicara, hanya boleh isyarat tangan).",
      durTitle: "Rintangan Komunikasi Tambahan",
      durDesc: "Gunakan rintangan spontan seperti menutup mata salah satu anggota untuk memperumit misi.",
      afterTitle: "Evaluasi Ambiguitas Pesan",
      afterDesc: "Diskusikan mengapa pesan bisa bergeser artinya dan bagaimana konfirmasi dua arah menolong."
    }
  },
  "Leadership": {
    videoUrl: "https://www.youtube.com/embed/s1Y_zJkMhH8?modestbranding=1&rel=0",
    title: "Melatih Keputusan Taktis di Bawah Tekanan",
    description: "Panduan untuk memimpin kelompok dalam merancang strategi tim, membagi tugas kerja secara seimbang, dan mengelola waktu.",
    checklist: {
      beforeTitle: "Penetapan Peran Pemimpin",
      beforeDesc: "Tunjuk kapten secara acak atau biarkan kelompok menyepakati calon pemimpin dalam 30 detik.",
      durTitle: "Perubahan Kondisi Dadakan (Pivot)",
      durDesc: "Berikan instruksi kejutan di tengah ronde untuk menguji fleksibilitas pengambilan keputusan kapten.",
      afterTitle: "Refleksi Delegasi & Kepercayaan",
      afterDesc: "Ajak leader mengevaluasi cara delegasi tugas, apakah mereka bertindak otoriter atau kolaboratif."
    }
  },
  "Problem Solving": {
    videoUrl: "https://www.youtube.com/embed/s1Y_zJkMhH8?modestbranding=1&rel=0",
    title: "Alur Berpikir Kreatif & Analisis Penyebab Utama",
    description: "Belajar memfasilitasi sesi brainstorming kreatif demi merancang solusi di bawah batasan logistik dan waktu ketat.",
    checklist: {
      beforeTitle: "Logistik Tantangan Tersegel",
      beforeDesc: "Siapkan semua alat pemecah masalah (kertas, sumpit, sedotan) dalam paket terpisah per tim.",
      durTitle: "Batasan Waktu Ketat (Scarcity)",
      durDesc: "Ingatkan sisa waktu secara berkala demi memacu kerja otak dalam menyelesaikan kepelikan.",
      afterTitle: "Uji Coba Hasil Karya",
      afterDesc: "Lakukan pengujian hasil karya secara adil di depan semua peserta untuk membuktikan kekokohan solusi."
    }
  },
  "Sales & Service": {
    videoUrl: "https://www.youtube.com/embed/gY49fIofS5A?modestbranding=1&rel=0",
    title: "Seni Menghadapi Obor Penolakan & Pemulihan Layanan",
    description: "Bagaimana melatih tim pelayanan prima melakukan respon cepat mengatasi keluhan pelanggan serta melakukan pitch persuasif.",
    checklist: {
      beforeTitle: "Skenario Kasus Nyata (Case Study)",
      beforeDesc: "Siapkan lembar petunjuk rahasia peran pelanggan (misal: marah-marah, banyak tanya, pelit).",
      durTitle: "Role-Play Estafet Tanpa Jeda",
      durDesc: "Minta peserta bergantian merespon keluhan dalam waktu masing-masing 45 detik secara acak.",
      afterTitle: "Asesmen Empati & Solutif",
      afterDesc: "Fokuskan debrief pada pemilihan kosakata yang menenangkan pelanggan dan solusi cepat."
    }
  },
  "Quiz & Polling": {
    videoUrl: "https://www.youtube.com/embed/N-rU_uOqis8?modestbranding=1&rel=0",
    title: "Memicu Kompetisi Sehat Menggunakan Kuisioner",
    description: "Teknik menyusun pertanyaan interaktif, memandu bel kuis cepat, serta menghidupkan persaingan poin antar meja.",
    checklist: {
      beforeTitle: "Pengujian Skor Proyektor",
      beforeDesc: "Pastikan sistem penghitungan poin atau bel suara kuis telah diuji coba berbunyi nyaring.",
      durTitle: "Pengawalan Keadilan Jawaban",
      durDesc: "Bertindaklah sebagai hakim yang tegas namun ceria dalam menentukan tim mana yang menolak/menjawab.",
      afterTitle: "Apresiasi Juara & Hiburan",
      afterDesc: "Sediakan reward kecil yang lucu untuk pemenang agar panggung kuis berujung gembira."
    }
  },
  "Simulation & Role Play": {
    videoUrl: "https://www.youtube.com/embed/gY49fIofS5A?modestbranding=1&rel=0",
    title: "Mendesain Skenario Simulasi Profesional",
    description: "Langkah mematangkan kesiapan mental peserta sebelum masuk ke dalam peran profesional baru agar bertindak natural.",
    checklist: {
      beforeTitle: "Penyusunan Aturan Main (Rules)",
      beforeDesc: "Jelaskan dengan gamblang batasan simulasi agar tidak berubah menjadi gurauan berlebihan.",
      durTitle: "Intervensi Sebagai 'Kamerawan'",
      durDesc: "Biarkan simulasi berjalan mandiri, catat poin-poin krusial untuk dievaluasi tanpa menghentikan akting.",
      afterTitle: "Refleksi Debrief 360-Derajat",
      afterDesc: "Minta tanggapan dari pelaku simulasi terlebih dahulu, baru minta feedback dari peserta penonton."
    }
  },
  "Challenge": {
    videoUrl: "https://www.youtube.com/embed/bFiL886U6Z8?modestbranding=1&rel=0",
    title: "Mengelola Adrenalin dan Ketahanan Mental Kelompok",
    description: "Tips menghadirkan nuansa kompetitif berskala besar demi membakar fighting spirit peserta melampaui limit ketahanan diri.",
    checklist: {
      beforeTitle: "Inspeksi Keamanan & Safety",
      beforeDesc: "Pastikan tidak ada logam tajam, kabel melintang, atau lantai licin yang membahayakan rombongan.",
      durTitle: "Pemandangan Skoring Klasemen",
      durDesc: "Tulis update skor secara real-time di whiteboard agar ketegangan persaingan tetap terjaga.",
      afterTitle: "Pengakuan Perjuangan Tim",
      afterDesc: "Berikan penghargaan bagi tim yang menunjukkan daya juang terbaik, bukan hanya yang menang."
    }
  },
  "Reflection": {
    videoUrl: "https://www.youtube.com/embed/9A4-dGcoOas?modestbranding=1&rel=0",
    title: "Memicu Kontemplasi Mendalam & Komitmen Nyata",
    description: "Metode menurunkan tempo panggung menuju keheningan reflektif, menyentuh batin peserta, serta merancang komitmen aksi.",
    checklist: {
      beforeTitle: "Atmosfer Keheningan (Ambient Sound)",
      beforeDesc: "Redupkan lampu jika memungkinkan, putar lagu akustik instrumental yang menenangkan hati.",
      durTitle: "Pertanyaan Terarah Tanpa Penghakiman",
      durDesc: "Gunakan nada suara lembut (rendah, tempo pelan) memandu ingatan mereka pada perjuangan harian.",
      afterTitle: "Lembar Komitmen Aksi (Action Plan)",
      afterDesc: "Yakinkan setiap peserta menulis minimal satu rencana konkret yang bisa dilakukan besok pagi."
    }
  },
  "Travel & Special": {
    videoUrl: "https://www.youtube.com/embed/E-6z9bI7gB8?modestbranding=1&rel=0",
    title: "Memandu Dinamika Acara Khusus & Perjalanan Wisata",
    description: "Strategi membawa keceriaan di dalam bus, tempat wisata terbuka, maupun panggung khusus keluarga besar.",
    checklist: {
      beforeTitle: "Asesmen Kondisi Kendaraan / Cuaca",
      beforeDesc: "Sesuaikan game dengan keterbatasan bangku atau keadaan terik matahari/hujan lokasi wisata.",
      durTitle: "Interaksi Pengikat Kekompakan",
      durDesc: "Ajak semua orang tanpa terkecuali ikut bertepuk tangan bersama, jaga panggung tetap inklusif.",
      afterTitle: "Cendera Mata Kenang-kenangan",
      afterDesc: "Akhiri dengan sesi swafoto bersama seluruh rombongan dengan pose kreatif andalan."
    }
  }
};

const DEFAULT_TUTORIAL = {
  videoUrl: "https://www.youtube.com/embed/bFiL886U6Z8?modestbranding=1&rel=0",
  title: "Panduan Masterclass Membawakan Game Panggung",
  description: "Dapatkan petunjuk kunci mengelola dinamika panggung, intonasi berbicara, hingga cara mencairkan kebekuan rombongan peserta.",
  checklist: {
    beforeTitle: "Metode Briefing Awal",
    beforeDesc: "Pastikan semua peserta mendengar naskah briefing dengan formasi berdiri melingkar.",
    durTitle: "Monitoring & Scoring Rubrik",
    durDesc: "Telah memahami cara menghitung pemenang berdasarkan ketepatan, loyalitas, atau kecepatan.",
    afterTitle: "Fase Debriefing Menarik",
    afterDesc: "Sudah menyiapkan minimal 3 pertanyaan kunci agar game tidak sekadar lelucon gembira semata."
  }
};

const SIMULATOR_STAGES = [
  {
    phase: "1. PENGENALAN (BRIEFING AMAN)",
    action: "Menghadap peserta secara utuh, sapa dengan lantang, jelaskan peraturan dan tujuan game.",
    atmosphere: "Energetik, Ceria, Fokus",
    sound: "Atmosfir Suara: Gemuruh Tepuk Tangan Pembuka 👏",
    tips: "Tunjukkan ekspresi antusias (senyum lebar!) agar emosi gembira menular ke seluruh ruangan."
  },
  {
    phase: "2. PEMBAGIAN TIM (TEAM SPLIT)",
    action: "Gunakan metode berhitung estafet ubin untuk memecah kelompok lama menjadi formasi super segar.",
    atmosphere: "Tertib, Dinamis, Berbaur",
    sound: "Atmosfir Suara: Musik Upbeat Ceria Menghentak 🎵",
    tips: "Beri tantangan tiap kelompok menentukan nama tim unik & sorakan semangat (yel-yel) dalam 60 detik!"
  },
  {
    phase: "3. JALANNYA PERMAINAN (COUNTED DOWN)",
    action: "Nyalakan timer mundur! Jalankan penalti jika ada tim yang melanggar batasan secara bersahabat.",
    atmosphere: "Kompetitif, Seru, Penuh Gelak Tawa",
    sound: "Atmosfir Suara: Musik Detak Jam Menegangkan ⏱️",
    tips: "Kelilingi area bermain secara interaktif demi mengontrol ritme permainan agar tidak terjadi chaos fisik."
  },
  {
    phase: "4. REKAP & PENENTUAN JUARA (SCORING)",
    action: "Hitung poin kualifikasi terakhir atau waktu tercepat kelompok. Nobatkan juara panggung.",
    atmosphere: "Apresiatif, Meriah, Ramai",
    sound: "Atmosfir Suara: Backsound Kemenangan & Sorakan Meriah 🏆",
    tips: "Jangan lupa berikan yel-yel apresiasi untuk kelompok paling rusuh tetapi paling kolaboratif!"
  },
  {
    phase: "5. PEMETIKAN HIKMAH (DEBRIEFING)",
    action: "Turunkan tempo panggung. Ajukan 3 pertanyaan reflektif untuk membongkar esensi game.",
    atmosphere: "Sore, Tenang, Fokus Kontemplasi",
    sound: "Atmosfir Suara: Lantunan Akustik Slow Piano Menggugah 🎹",
    tips: "Biarkan peserta berbicara lebih dominan untuk menyuarakan implementasi game di tempat kerja nyata."
  }
];

interface ActivityDetailViewProps {
  activity: Activity;
  onBack: () => void;
  onSaveToggle: (activity: Activity) => void;
  isSaved: boolean;
  onNavigateToRun?: (activity: Activity) => void;
  onAddToCollectionDirect?: (activity: Activity) => void;
  isLoggedIn?: boolean;
  onRequireAuth?: () => void;
}

export default function ActivityDetailView({
  activity,
  onBack,
  onSaveToggle,
  isSaved,
  onNavigateToRun,
  onAddToCollectionDirect,
  isLoggedIn = false,
  onRequireAuth
}: ActivityDetailViewProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'panduan' | 'script' | 'variasi' | 'risiko' | 'tutorial'>('tutorial');
  const [copiedScript, setCopiedScript] = useState(false);
  const [customVariationQuery, setCustomVariationQuery] = useState('');
  const [customVariationResult, setCustomVariationResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Gameplay simulator state
  const [simulatorStep, setSimulatorStep] = useState(0);

  // Handle MC script clipboard copy
  const handleCopyScript = () => {
    navigator.clipboard.writeText(activity.mc_script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Simulated AI Variant Instant Generator
  const handleGenerateVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customVariationQuery.trim()) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      setCustomVariationResult(
        `[Varian Kustom AI Aktipan]: Untuk kebutuhan "${customVariationQuery}", modifikasi ${activity.activity_name} menjadi format kelompok terfokus: Bagikan lembar kerja khusus bertema tersebut. Setiap kelompok memilih draf dalam 120 detik, lalu melakukan presentasi estafet. Aturan skor ditambahkan bonus +25 poin untuk tim terkeren pilihan narasumber.`
      );
      setIsGenerating(false);
      playTapSound('success');
    }, 1200);
  };

  // Progress Checklist for Tutorial
  const [tutorialChecklist, setTutorialChecklist] = useState({
    before: false,
    dur: false,
    after: false,
    donts: false
  });

  const detailTabs = [
    {
      id: 'tutorial' as const,
      label: t('Cara Main & Video Tutorial'),
      icon: Gamepad2,
      activeColor: 'border-orange-500 text-orange-600 bg-orange-50/20',
      inactiveColor: 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-transparent',
      badge: t('Baru!')
    },
    {
      id: 'panduan' as const,
      label: t('Panduan & Debrief'),
      icon: BookOpen,
      activeColor: 'border-blue-500 text-blue-600 bg-blue-50/20',
      inactiveColor: 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-transparent'
    },
    {
      id: 'script' as const,
      label: t('Script MC & Tips'),
      icon: Clipboard,
      activeColor: 'border-blue-500 text-blue-600 bg-blue-50/20',
      inactiveColor: 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-transparent'
    },
    {
      id: 'variasi' as const,
      label: t('Variasi & AI Generator'),
      icon: Sparkles,
      activeColor: 'border-blue-500 text-blue-600 bg-blue-50/20',
      inactiveColor: 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-transparent'
    },
    {
      id: 'risiko' as const,
      label: t('Risiko & Mitigasi'),
      icon: AlertTriangle,
      activeColor: 'border-rose-500 text-rose-600 bg-rose-50/20',
      inactiveColor: 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-transparent'
    }
  ];

  return (
    <div id="activity-detail-view-panel" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Navigation breadcrumbs */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="inline-flex items-center text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Direktori
        </button>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onSaveToggle(activity)}
            className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border text-xs font-black transition-all cursor-pointer ${
              isSaved 
                ? 'bg-rose-50 dark:bg-rose-950/45 text-rose-600 dark:text-rose-450 border-rose-200 dark:border-rose-900/40 shadow-sm' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
            <span>{isSaved ? 'Favorit Saya' : 'Simpan ke Favorit'}</span>
          </button>

          {onAddToCollectionDirect && (
            <button
              onClick={() => onAddToCollectionDirect(activity)}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              + Koleksi
            </button>
          )}

          {onNavigateToRun && (
            <button
              onClick={() => onNavigateToRun(activity)}
              className="bg-orange-500 hover:bg-orange-400 text-white font-extrabold text-xs px-4 py-1.5 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-white" /> Jalankan Aktivitas (Run Mode)
            </button>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute inset-0 w-full h-full">
          <ActivityIllustration
            id={activity.id}
            name={activity.activity_name}
            category={activity.category}
            illustrationUrl={activity.illustration_url}
            className="w-full h-full object-cover opacity-40 select-none pointer-events-none hover:scale-[1.02] transition-transform duration-700 ease-out mix-blend-luminosity"
            isHero={true}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-transparent" />
        </div>

        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Gamepad2 className="h-40 w-40" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold px-3 py-1 rounded-full">{activity.category}</span>
            <span className="text-xs bg-slate-800 text-slate-300 font-bold px-3 py-1 rounded-full">#{activity.activity_number}</span>
            <span className="text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30 font-bold px-3 py-1 rounded-full">Dijalankan {activity.usage_count} kali</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">{activity.activity_name}</h2>
          <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">{activity.long_description}</p>
        </div>
      </div>

      {/* Quick Info Grid Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">⏱</div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Durasi Total</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{activity.duration_min} - {activity.duration_max} Menit</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300 flex items-center justify-center font-bold">👥</div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Kapasitas Peserta</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{activity.participant_min} - {activity.participant_max} Orang</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-300 flex items-center justify-center font-bold">🏷</div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Tingkat Kesulitan</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{activity.difficulty_level} Level</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 flex items-center justify-center font-bold">📺</div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Format Media</span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{activity.format}</span>
          </div>
        </div>
      </div>

      {/* Icon-only Tabs with Tooltips */}
      <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-700 pb-3 mb-6 overflow-x-visible">
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono hidden sm:inline">
          Menu Tab:
        </span>
        <div className="flex items-center space-x-2.5">
          {detailTabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <div key={tab.id} className="relative group">
                <button
                  onClick={() => {
                    setActiveTab(tab.id);
                    playTapSound('tap');
                  }}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? `${tab.activeColor} border-current shadow-xs scale-102` 
                      : `${tab.inactiveColor} dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 border-slate-200/85 dark:border-slate-700 hover:scale-102`
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  {tab.badge && (
                    <span className="absolute -top-1.5 -right-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 text-[8px] font-black text-white px-1 shadow-sm ring-2 ring-white animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                </button>

                {/* Highly Polished Floating Tooltip */}
                <div className="absolute top-13 left-1/2 transform -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 translate-y-1.5 transition-all duration-200 bg-slate-950 text-white text-[10px] font-black tracking-tight py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap z-30 border border-slate-800">
                  {tab.label}
                  {/* Small arrow */}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-950 rotate-45 border-t border-l border-slate-800" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs Content */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm min-h-[300px] text-slate-800 dark:text-slate-100">
        {/* PANDUAN & DEBRIEF TAB */}
        {activeTab === 'panduan' && (
          <div className="space-y-6 text-xs">
            {/* Alat Needed */}
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-1.5 mb-2 flex items-center gap-1">🛠 Alat dan Bahan Persiapan</h3>
              <div className="flex flex-wrap gap-2">
                {activity.tools_needed.map((tool, idx) => (
                  <span key={idx} className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Steps execution process */}
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-1.5 mb-2">🎯 Langkah Pelaksanaan (Step-by-step)</h3>
              <div className="relative border-l border-slate-200 dark:border-slate-700 pl-4 space-y-4 ml-2">
                {activity.step_by_step.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[24px] top-0 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white">
                      {idx + 1}
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Debrief questions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-1.5 mb-2 flex items-center gap-1">💬 Pertanyaan Debrief Pembelajaran</h3>
              <ul className="space-y-2 list-disc list-inside text-slate-700 dark:text-slate-300 font-semibold pl-1">
                {activity.debrief_questions.map((q, idx) => (
                  <li key={idx} className="leading-relaxed hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{q}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* SCRIPT MC & TIPS TAB */}
        {activeTab === 'script' && (
          <div className="space-y-6 text-xs">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5 mb-2">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">🗣 Naskah Script MC / Fasilitator (Siap Baca)</h3>
                <button 
                  onClick={handleCopyScript}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {copiedScript ? 'Tersalin!' : 'Salin Script'}
                </button>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 italic font-medium text-slate-700 dark:text-slate-300 max-h-[160px] overflow-y-auto leading-relaxed">
                {activity.mc_script}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-indigo-850 dark:text-indigo-300 mb-2 flex items-center gap-1"><Lightbulb className="h-4 w-4 text-amber-500" /> Tips Profesional Menjalankan Sesi</h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold bg-amber-50/50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-100 dark:border-amber-900/45 text-amber-900 dark:text-amber-200">{activity.professional_tips}</p>
            </div>
          </div>
        )}

        {/* VARIASI & AI GENERATOR TAB */}
        {activeTab === 'variasi' && (
          <div className="space-y-6 text-xs">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-1.5 mb-2">🔖 Alternatif Variasi Permainan</h3>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300 font-semibold list-disc list-inside">
                {activity.variations.map((v, idx) => (
                  <li key={idx} className="leading-relaxed">{v}</li>
                ))}
              </ul>
            </div>

            {/* AI Custom Variation Generator Form */}
            <div className="pt-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                <Sparkles className="h-4 w-4 text-orange-500" /> AI Activity Variation Generator
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Butuh modifikasi game ini untuk audiens khusus Anda? Minta AI Aktipan membuat variasi seketika.</p>

              <form onSubmit={handleGenerateVariant} className="flex gap-2">
                <input 
                  type="text"
                  required
                  placeholder="e.g. Ubah game ini agar aman dimainkan lansia atau anak PAUD..."
                  value={customVariationQuery}
                  onChange={(e) => setCustomVariationQuery(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-lg p-2.5 font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  disabled={isGenerating}
                  className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-750 text-white font-extrabold px-4 rounded-lg flex items-center gap-1 cursor-pointer disabled:opacity-50 text-[11px]"
                >
                  {isGenerating ? 'Menyusun...' : 'Generate Kustom'}
                </button>
              </form>

              {customVariationResult && (
                <div className="bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 p-3 mt-4 rounded-lg border border-blue-100 dark:border-blue-900/50 font-medium leading-relaxed">
                  {customVariationResult}
                </div>
              )}
            </div>
          </div>
        )}

        {/* RISIKO & MITIGASI TAB */}
        {activeTab === 'risiko' && (
          <div className="space-y-6 text-xs">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-1.5 mb-2 flex items-center gap-1">⚠️ Risiko Pelaksanaan</h3>
              <p className="text-slate-700 dark:text-slate-350 leading-relaxed font-semibold bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300 p-3 rounded-lg border border-rose-100 dark:border-rose-900/40">{activity.risk_notes}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 p-1 mb-2">🛡 Tips Mitigasi Pencegahan</h3>
              <p className="text-slate-700 dark:text-slate-350 leading-relaxed font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/40">{activity.mitigation_tips}</p>
            </div>
          </div>
        )}

        {/* CHECKLIST TUTORIAL TAB */}
        {activeTab === 'tutorial' && (() => {
          const tutor = CATEGORY_TUTORIALS[activity.category] || DEFAULT_TUTORIAL;
          const currentStage = SIMULATOR_STAGES[simulatorStep];
          const preparationCount = [tutorialChecklist.before, tutorialChecklist.dur, tutorialChecklist.after].filter(Boolean).length;
          const readinessPercentage = Math.round((preparationCount / 3) * 100);

          return (
            <div className="space-y-8 text-xs">
              {/* Part 1: Video and Categorized Checklist */}
              <div>
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <PlayCircle className="h-4.5 w-4.5 text-blue-600 dark:text-blue-450" /> 
                      Tutorial Video & Checklist Persiapan Sesi #{activity.activity_number}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">Panduan & demonstrasi video khusus kategori <strong className="text-blue-600 dark:text-blue-400">{activity.category}</strong>.</p>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-full font-bold border border-blue-100 dark:border-blue-900/40">
                    Kategori: {activity.category}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left checklist */}
                  <div className="md:col-span-6 space-y-4">
                    <span className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                      Checklist Kesiapan Trainer
                    </span>
                    <div className="space-y-3 pl-1">
                      <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all">
                        <input 
                          type="checkbox"
                          checked={tutorialChecklist.before}
                          onChange={(e) => setTutorialChecklist({...tutorialChecklist, before: e.target.checked})}
                          className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 border-slate-350 dark:border-slate-700 focus:ring-blue-500 rounded cursor-pointer"
                        />
                        <div>
                          <span className="block font-black text-slate-800 dark:text-slate-200 text-[11px]">{tutor.checklist.beforeTitle}</span>
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px] mt-0.5 leading-relaxed">{tutor.checklist.beforeDesc}</span>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all">
                        <input 
                          type="checkbox"
                          checked={tutorialChecklist.dur}
                          onChange={(e) => setTutorialChecklist({...tutorialChecklist, dur: e.target.checked})}
                          className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 border-slate-350 dark:border-slate-700 focus:ring-blue-500 rounded cursor-pointer"
                        />
                        <div>
                          <span className="block font-black text-slate-800 dark:text-slate-200 text-[11px]">{tutor.checklist.durTitle}</span>
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px] mt-0.5 leading-relaxed">{tutor.checklist.durDesc}</span>
                        </div>
                      </label>

                      <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all">
                        <input 
                          type="checkbox"
                          checked={tutorialChecklist.after}
                          onChange={(e) => setTutorialChecklist({...tutorialChecklist, after: e.target.checked})}
                          className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 border-slate-350 dark:border-slate-700 focus:ring-blue-500 rounded cursor-pointer"
                        />
                        <div>
                          <span className="block font-black text-slate-800 dark:text-slate-200 text-[11px]">{tutor.checklist.afterTitle}</span>
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px] mt-0.5 leading-relaxed">{tutor.checklist.afterDesc}</span>
                        </div>
                      </label>
                    </div>

                    {/* Readiness bar */}
                    <div className="pt-2 bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="bg-slate-200 dark:bg-slate-950 rounded-full h-2.5 overflow-hidden shadow-inner">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-500"
                          style={{ width: `${readinessPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Persiapan Mental Fasilitasi</span>
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-450 uppercase font-mono">
                          Kesiapan: {readinessPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right YouTube Embed */}
                  <div className="md:col-span-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                        {tutor.title}
                      </span>
                      <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-extrabold px-1.5 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider">
                        Play Video
                      </span>
                    </div>

                    <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-lg relative aspect-video">
                      <iframe
                        src={tutor.videoUrl}
                        title={tutor.title}
                        className="w-full h-full border-0 absolute inset-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed italic bg-blue-50/40 dark:bg-blue-950/20 p-2.5 rounded-lg border border-blue-50/80 dark:border-blue-900/30">
                      💡 <strong>Petunjuk Video:</strong> {tutor.description} Serta ikuti instruksi yel-yel, modulasi intonasi suara, dan permainan isyarat tubuh panggung yang dicontohkan di atas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Part 2: Interactive Gameplay Simulator */}
              <div className="pt-6 border-t border-slate-200">
                <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Trophy className="h-32 w-32" />
                  </div>

                  <div className="relative z-10 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-black uppercase text-orange-400 tracking-wider">🎮 Simulator Terpandu Cara Main & MC</h4>
                        <h3 className="text-sm font-black text-white mt-0.5">Let's Play: Langkah Dinamis Membawakan "{activity.activity_name}"</h3>
                      </div>
                      <div className="flex items-center space-x-1 font-mono text-[10px] text-slate-400">
                        {SIMULATOR_STAGES.map((_, i) => (
                          <span 
                            key={i} 
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold transition-all ${
                              i === simulatorStep ? 'bg-orange-500 text-white animate-pulse' : i < simulatorStep ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {i + 1}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Inner Screen Panel */}
                    <div className="bg-slate-950 rounded-xl p-4 sm:p-5 border border-slate-800 space-y-3 shadow-inner">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-[10px] bg-slate-800 text-slate-300 font-black px-2.5 py-1 rounded">
                          FASE: {currentStage.phase}
                        </span>
                        <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1 font-mono">
                          <Volume2 className="h-3.5 w-3.5" /> {currentStage.sound}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] text-slate-500 uppercase font-bold block tracking-wider">Tindakan Fisik Instruktur</span>
                        <p className="text-slate-100 font-bold text-xs leading-relaxed">{currentStage.action}</p>
                      </div>

                      <div className="space-y-1 pt-1.5 border-t border-slate-900/50">
                        <span className="text-[9px] text-slate-500 uppercase font-bold block tracking-wider">Modus Script MC Pendukung</span>
                        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 italic text-slate-300 leading-relaxed text-[11px]">
                          {simulatorStep === 0 && `"${activity.mc_script}"`}
                          {simulatorStep === 1 && `"Baik semuanya, ayo kita bagi kelompok! Dengarkan nomor urut berhitung Anda ya... Satu, Dua, Tiga..."`}
                          {simulatorStep === 2 && `"Aturan bermain untuk game '${activity.activity_name}' ini adalah kalian harus bekerjasama menyelesaikan tantangan. Bersedia? Tiga, Dua, Satu... Mulai!"`}
                          {simulatorStep === 3 && `"Luar biasa! Skor tertinggi jatuh kepada tim nomor ${Math.floor(Math.random() * 5) + 1}! Mari berikan tepuk tangan terkeras kita!"`}
                          {simulatorStep === 4 && `"Bagaimana rasanya setelah mencoba tadi? Adakah hikmah atau tantangan komunikasi terbongkar? Mari kita ulas bersama."`}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-2 bg-slate-900/30 p-2.5 rounded-lg border border-slate-900/50">
                        <span className="text-amber-400">💡</span>
                        <p className="text-[10px] text-slate-400 font-semibold leading-tight">
                          <strong className="text-slate-200">Tips Sukses Game:</strong> {currentStage.tips}
                        </p>
                      </div>
                    </div>

                     {/* Navigation inside simulator */}
                    <div className="flex items-center justify-between pt-1">
                      <button 
                        disabled={simulatorStep === 0}
                        onClick={() => {
                          setSimulatorStep(prev => prev - 1);
                          playTapSound('tap');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-xs border border-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        Kembali
                      </button>

                      <div className="text-[10px] text-slate-400 font-medium">
                        Atmosfer Panggung: <strong className="text-orange-400">{currentStage.atmosphere}</strong>
                      </div>

                      <button 
                        onClick={() => {
                          if (simulatorStep < SIMULATOR_STAGES.length - 1) {
                            setSimulatorStep(prev => prev + 1);
                            playTapSound('chime');
                          } else {
                            setSimulatorStep(0);
                            playTapSound('success');
                          }
                        }}
                        className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-black text-xs flex items-center gap-1 shadow-md hover:shadow-orange-500/20 transition-all cursor-pointer"
                      >
                        {simulatorStep < SIMULATOR_STAGES.length - 1 ? (
                          <>
                            Tahap Berikutnya <FastForward className="h-3 w-3" />
                          </>
                        ) : (
                          "Selesai & Ulangi Simulasi"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Visual Flow diagram representation mapping */}
      <div className="mt-8 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm text-xs text-center">
        <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-350 tracking-wider uppercase mb-4">Mekanisme Alur Visual Aktivitas</h4>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg px-4 py-2 font-bold shadow-sm max-w-[120px] text-slate-800 dark:text-slate-200">Briefing Awal</div>
          <span className="text-slate-400 dark:text-slate-500 font-extrabold text-sm sm:rotate-0 rotate-90">➔</span>
          <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg px-4 py-2 font-bold shadow-sm max-w-[120px] text-slate-800 dark:text-slate-200 font-bold shadow-sm">Mulai Timer</div>
          <span className="text-slate-400 dark:text-slate-500 font-extrabold text-sm sm:rotate-0 rotate-90">➔</span>
          <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/40 text-orange-700 dark:text-orange-300 rounded-lg px-4 py-2 font-black shadow-sm max-w-[120px]">Aktivitas Inti</div>
          <span className="text-slate-400 dark:text-slate-500 font-extrabold text-sm sm:rotate-0 rotate-90">➔</span>
          <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg px-4 py-2 font-bold shadow-sm max-w-[120px] text-slate-800 dark:text-slate-200">Scoring Juara</div>
          <span className="text-slate-400 dark:text-slate-500 font-extrabold text-sm sm:rotate-0 rotate-90">➔</span>
          <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg px-4 py-2 font-bold shadow-sm max-w-[120px] text-slate-800 dark:text-slate-200">Sesi Debrief</div>
        </div>
      </div>
    </div>
  );
}
