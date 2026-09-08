export interface Activity {
  id: number;
  activity_number: string;
  activity_name: string;
  category: string;
  short_description: string;
  long_description: string;
  objective: string;
  main_goal: string;
  suitable_for: string[];
  suitable_event_filter: string[];
  participant_min: number;
  participant_max: number;
  duration_min: number;
  duration_max: number;
  format: 'Offline' | 'Online' | 'Hybrid';
  indoor_outdoor: 'Indoor' | 'Outdoor' | 'Both';
  energy_level: 'Calm' | 'Medium' | 'High';
  difficulty_level: 'Easy' | 'Medium' | 'Advanced';
  tools_needed: string[];
  step_by_step: string[];
  mc_script: string;
  debrief_questions: string[];
  variations: string[];
  risk_notes: string;
  mitigation_tips: string;
  professional_tips: string;
  rating: number;
  usage_count: number;
  is_free: boolean;
  estimated_fun_level: number; // 1-5
  estimated_impact_level: number; // 1-5
  illustration_url: string;
}

// Generate templates per category to easily build 132 detailed activities without bloating the file.
const CATEGORIES: { [key: string]: string } = {
  "Ice Breaking": "Pencair suasana, memecahkan kecanggungan, dan meningkatkan keceriaan peserta.",
  "Energizer": "Meningkatkan tingkat energi fisik dan konsentrasi saat fokus peserta mulai turun.",
  "Fun Games": "Aktivitas rekreasi yang memicu tawa, kebahagiaan, dan interaksi spontan.",
  "Team Building": "Membangun kolaborasi, kerja sama tim, kepercayaan, dan pemecahan masalah bersama.",
  "Communication": "Melatih keterampilan mendengar aktif, artikulasi pesan, dan mengurangi asumsi salah.",
  "Leadership": "Mengidentifikasi, melatih, dan menyimulasikan peran kepemimpinan dan pengambilan keputusan.",
  "Problem Solving": "Menguji kemampuan diagnosis masalah, penentuan prioritas, dan desain solusi strategis.",
  "Sales & Service": "Skenario role play untuk melatih pitching, objection handling, dan service recovery.",
  "Quiz & Polling": "Menguji pengetahuan, mengukur tingkat pemahaman, dan melakukan survei interaktif.",
  "Simulation & Role Play": "Menyimulasikan kondisi nyata profesional untuk mengasah keterampilan praktis peserta.",
  "Challenge": "Menantang kreativitas, keberanian, dan kerja keras tim/individu untuk mencapai misi tertentu.",
  "Reflection": "Sesi penutup untuk merenungkan makna pembelajaran dan menyusun komitmen aksi konkret.",
  "Travel & Special": "Aktivitas untuk mempererat bonding di perjalanan, acara keluarga, pernikahan, atau keagamaan."
};

// Raw list of names and their attributes to generate exactly 132 complete activities.
const RAW_ACTIVITIES_LIST = [
  // A. Ice Breaking (1 - 10)
  { id: 1, name: "Kenalan 3 Fakta", cat: "Ice Breaking", energy: "Medium", format: "Offline", tools: ["Kertas", "Pulpen"], limit: [5, 50], dur: [5, 10], desc: "Peserta memperkenalkan diri dengan menyebut nama, asal divisi, dan satu fakta unik tentang dirinya." },
  { id: 2, name: "Satu Kata Hari Ini", cat: "Ice Breaking", energy: "Calm", format: "Offline", tools: ["Tanpa Alat"], limit: [5, 200], dur: [3, 5], desc: "Peserta menyebutkan satu kata yang mewakili perasaan mereka hari ini." },
  { id: 3, name: "Mood Check Emoji", cat: "Ice Breaking", energy: "Calm", format: "Hybrid", tools: ["Smartphone / HP"], limit: [10, 500], dur: [3, 5], desc: "Peserta memilih atau mengirim emoji yang mewakili mood saat ini di layar proyektor." },
  { id: 4, name: "Human Bingo", cat: "Ice Breaking", energy: "Medium", format: "Offline", tools: ["Kertas Bingo", "Pulpen"], limit: [20, 200], dur: [10, 15], desc: "Mencari teman yang memiliki kesamaan minat sesuai dengan kotak bingo." },
  { id: 5, name: "Name & Movement", cat: "Ice Breaking", energy: "High", format: "Offline", tools: ["Tanpa Alat"], limit: [10, 50], dur: [5, 10], desc: "Peserta menyebut nama disertai gerakan tubuh unik yang harus ditirukan peserta lain." },
  { id: 6, name: "Two Truths One Lie", cat: "Ice Breaking", energy: "Medium", format: "Offline", tools: ["Tanpa Alat"], limit: [5, 40], dur: [10, 20], desc: "Peserta membagikan 2 fakta benar dan 1 fakta bohong untuk ditebak oleh rekannya." },
  { id: 7, name: "Find Your Match", cat: "Ice Breaking", energy: "Medium", format: "Offline", tools: ["Kartu Pasangan"], limit: [20, 100], dur: [10, 15], desc: "Peserta mencari pasangan gambar/kata rahasia yang acak di ruangan." },
  { id: 8, name: "Speed Networking", cat: "Ice Breaking", energy: "Medium", format: "Hybrid", tools: ["Timer"], limit: [20, 200], dur: [10, 25], desc: "Peserta berganti rekan bicara setiap 2 menit untuk memperluas jaringan perkenalan." },
  { id: 9, name: "Siapa Dia?", cat: "Ice Breaking", energy: "Calm", format: "Offline", tools: ["Kertas Fakta"], limit: [10, 80], dur: [10, 15], desc: "Fasilitator membacakan fakta anonim, peserta menebak siapa pemilik fakta tersebut." },
  { id: 10, name: "Salam Unik", cat: "Ice Breaking", energy: "High", format: "Offline", tools: ["Tanpa Alat"], limit: [10, 100], dur: [5, 10], desc: "Setiap kelompok berdiskusi membuat salam fisik khas yang ramah dan energetik." },

  // B. Energizer (11 - 20)
  { id: 11, name: "Tepuk Fokus", cat: "Energizer", energy: "High", format: "Offline", tools: ["Suara Mandiri"], limit: [10, 500], dur: [3, 5], desc: "Fasilitator memberikan aba-aba tepukan yang berubah-ubah untuk menguji fokus peserta." },
  { id: 12, name: "Gerak Kebalikan", cat: "Energizer", energy: "High", format: "Offline", tools: ["Tanpa Alat"], limit: [10, 300], dur: [5, 7], desc: "Melakukan gerakan fisik kebalikan dari instruksi verbal fasilitator." },
  { id: 13, name: "Stand Up If", cat: "Energizer", energy: "Medium", format: "Offline", tools: ["Tanpa Alat"], limit: [20, 500], dur: [5, 10], desc: "Peserta berdiri jika pernyataan fasilitator sesuai dengan pengalaman pribadinya." },
  { id: 14, name: "Simon Says", cat: "Energizer", energy: "High", format: "Offline", tools: ["Suara Mandiri"], limit: [10, 300], dur: [5, 10], desc: "Mengikuti instruksi fisik hanya jika diawali kalimat khas 'Simon Says'." },
  { id: 15, name: "Quick Reaction", cat: "Energizer", energy: "High", format: "Offline", tools: ["Tanpa Alat"], limit: [10, 500], dur: [3, 7], desc: "Bereaksi secepat kilat menyentuh benda di ruangan sesuai instruksi warna fisik." },
  { id: 16, name: "Freeze Game", cat: "Energizer", energy: "High", format: "Offline", tools: ["Musik"], limit: [10, 200], dur: [5, 10], desc: "Menari bebas sesuai irama musik dan berpose patung secara instan ketika musik dimatikan." },
  { id: 17, name: "Angka Fokus", cat: "Energizer", energy: "Medium", format: "Offline", tools: ["Tanpa Alat"], limit: [10, 100], dur: [5, 10], desc: "Peserta menghitung melingkar, kelipatan angka tertentu harus diganti tepukan tangan." },
  { id: 18, name: "Beat Clap", cat: "Energizer", energy: "Medium", format: "Offline", tools: ["Suara Mandiri"], limit: [10, 300], dur: [3, 5], desc: "Belajar membuat ritme perkusi tubuh kompak bersama seluruh peserta." },
  { id: 19, name: "One Minute Move", cat: "Energizer", energy: "High", format: "Offline", tools: ["Musik Upbeat"], limit: [10, 500], dur: [1, 3], desc: "Peregangan fisik dan joget ringan bersama selama satu menit untuk melancarkan darah." },
  { id: 20, name: "Energy Circle", cat: "Energizer", energy: "High", format: "Offline", tools: ["Tanpa Alat"], limit: [10, 80], dur: [5, 10], desc: "Menyalurkan getaran tepuk tangan secara berantai dalam lingkaran secepat mungkin." },

  // C. Fun Games (21 - 30)
  { id: 21, name: "Tebak Kata", cat: "Fun Games", energy: "Medium", format: "Offline", tools: ["Kartu Kata"], limit: [10, 100], dur: [10, 20], desc: "Satu tim menebak kata misteri berdasarkan petunjuk kata kunci rekan setimnya." },
  { id: 22, name: "Tebak Gambar", cat: "Fun Games", energy: "Medium", format: "Offline", tools: ["Papan Tulis", "Spidol"], limit: [10, 100], dur: [10, 20], desc: "Menilai kreativitas menebak gambar cepat rupa benda yang diproses bergiliran." },
  { id: 23, name: "Charades", cat: "Fun Games", energy: "High", format: "Offline", tools: ["Daftar Istilah"], limit: [10, 100], dur: [10, 20], desc: "Memperagakan aksi bisu (bahasa tubuh) untuk menebak judul film, profesi atau hewan." },
  { id: 24, name: "Pictionary Race", cat: "Fun Games", energy: "High", format: "Offline", tools: ["Kertas Gambar", "Spidol"], limit: [10, 100], dur: [15, 25], desc: "Lomba menggambar kata kunci bergantian dalam tim untuk secepatnya ditebak." },
  { id: 25, name: "Tebak Lagu", cat: "Fun Games", energy: "High", format: "Offline", tools: ["Speaker", "Playlist Lagu"], limit: [10, 300], dur: [10, 15], desc: "Peserta berebut mengangkat tangan menebak judul lagu dari instrumen terdengar." },
  { id: 26, name: "Memory Challenge", cat: "Fun Games", energy: "Calm", format: "Offline", tools: ["Proyektor", "Benda Nyata"], limit: [10, 100], dur: [10, 15], desc: "Menghafal 20 benda acak dalam 30 detik kemudian menulisnya kembali." },
  { id: 27, name: "Spin Challenge", cat: "Fun Games", energy: "Medium", format: "Offline", tools: ["Roda Putar Hukuman"], limit: [10, 300], dur: [10, 20], desc: "Memutar roda digital untuk mendapatkan tantangan spontan yang seru dan lucu." },
  { id: 28, name: "Lucky Draw Game", cat: "Fun Games", energy: "Medium", format: "Offline", tools: ["Kupon Undian"], limit: [20, 1000], dur: [10, 20], desc: "Pengundian nomor berhadiah dipadu dengan tantangan kecil sebelum klaim reward." },
  { id: 29, name: "Photo Pose Challenge", cat: "Fun Games", energy: "High", format: "Offline", tools: ["Kamera / HP"], limit: [10, 300], dur: [10, 20], desc: "Berpose kelompok heboh membentuk tema visual tertentu melatih ekspresi." },
  { id: 30, name: "Kursi Panas", cat: "Fun Games", energy: "High", format: "Offline", tools: ["Kursi", "Speaker"], limit: [10, 80], dur: [10, 20], desc: "Rebutan duduk di kursi ketika musik berhenti, kursi berkurang di setiap babak." },

  // D. Team Building Games (31 - 40)
  { id: 31, name: "Tower Challenge", cat: "Team Building", energy: "High", format: "Offline", tools: ["Kertas", "Sedotan", "Selotip"], limit: [10, 100], dur: [20, 30], desc: "Membangun struktur menara mandiri setinggi mungkin yang stabil menggunakan sedotan." },
  { id: 32, name: "Marshmallow Challenge", cat: "Team Building", energy: "High", format: "Offline", tools: ["Spageti", "Benang", "Marshmallow"], limit: [10, 80], dur: [20, 30], desc: "Membangun struktur penyangga dengan atasnya diletakkan marshmallow." },
  { id: 33, name: "Blind Drawing", cat: "Team Building", energy: "Medium", format: "Offline", tools: ["Kertas", "Pulpen"], limit: [6, 100], dur: [10, 20], desc: "Satu peserta memberi instruksi kata, peserta lain menggambar mata tertutup." },
  { id: 34, name: "Human Knot", cat: "Team Building", energy: "High", format: "Offline", tools: ["Tanpa Alat"], limit: [8, 40], dur: [10, 20], desc: "Peserta saling menggandeng tangan acak dan harus mengurainya tanpa melepas pegangan." },
  { id: 35, name: "Mission Impossible", cat: "Team Building", energy: "High", format: "Offline", tools: ["Kartu Misi"], limit: [20, 300], dur: [30, 60], desc: "Tim bekerja sama menyelesaikan 5 misi berturut-turut dalam waktu terbatas." },
  { id: 36, name: "Bridge Building", cat: "Team Building", energy: "High", format: "Offline", tools: ["Karton", "Stik Es Krim"], limit: [10, 100], dur: [30, 45], desc: "Membuat jembatan mini yang mampu menahan beban tumpukan buku standar." },
  { id: 37, name: "Puzzle Team Race", cat: "Team Building", energy: "Medium", format: "Offline", tools: ["Kepingan Puzzle"], limit: [10, 150], dur: [15, 30], desc: "Menyusun kepingan puzzle besar bersaing dengan tim lain secara paralel." },
  { id: 38, name: "Trust Walk", cat: "Team Building", energy: "Medium", format: "Offline", tools: ["Penutup Mata"], limit: [10, 80], dur: [15, 25], desc: "Berjalan melintasi medan berliku dengan mata tertutup, diarahkan oleh partner." },
  { id: 39, name: "Minefield", cat: "Team Building", energy: "Medium", format: "Offline", tools: ["Hambatan Plastik", "Penutup Mata"], limit: [10, 100], dur: [15, 30], desc: "Peserta bersuara memandu partnernya melompati ranjau mainan di lantai." },
  { id: 40, name: "Silent Teamwork", cat: "Team Building", energy: "Calm", format: "Offline", tools: ["Teka-teki tertulis"], limit: [10, 100], dur: [15, 25], desc: "Menyelesaikan tugas kelompok yang rumit tanpa diperbolehkan berkomunikasi verbal." },

  // E. Communication Games (41 - 50)
  { id: 41, name: "Instruksi Berantai", cat: "Communication", energy: "Medium", format: "Offline", tools: ["Naskah Cerita"], limit: [10, 100], dur: [10, 15], desc: "Membisikkan kalimat kompleks berantai dari orang pertama sampai orang terakhir." },
  { id: 42, name: "One Way vs Two Way", cat: "Communication", energy: "Calm", format: "Offline", tools: ["Kertas", "Gambar Pola"], limit: [10, 80], dur: [15, 25], desc: "Menguji perbedaan efektivitas komunikasi satu arah (instruksi mutlak) vs dua arah." },
  { id: 43, name: "Active Listening Circle", cat: "Communication", energy: "Calm", format: "Offline", tools: ["Topik Diskusi"], limit: [6, 60], dur: [15, 30], desc: "Menyimak pasangan bercerita dan melatih merangkum esensi ucapan tanpa asumsi." },
  { id: 44, name: "Story Relay", cat: "Communication", energy: "Medium", format: "Offline", tools: ["Timer"], limit: [10, 80], dur: [10, 15], desc: "Kelompok melanjutkan naskah cerita fiksi secara bergiliran tiap 15 detik." },
  { id: 45, name: "Pesan Rahasia", cat: "Communication", energy: "Medium", format: "Offline", tools: ["Simbol Kertas"], limit: [10, 100], dur: [10, 20], desc: "Mengirim sinyal non-verbal dari baris paling belakang ke paling depan ruangan." },
  { id: 46, name: "Body Language Game", cat: "Communication", energy: "Medium", format: "Offline", tools: ["Papan Kategori"], limit: [10, 100], dur: [10, 20], desc: "Menebak emosi atau maksud lawan bicara murni dari ekspresi mikro wajah." },
  { id: 47, name: "Empathy Talk", cat: "Communication", energy: "Calm", format: "Offline", tools: ["Pertanyaan Intim"], limit: [6, 60], dur: [15, 25], desc: "Melatih mendengarkan keluh kesah pasangan tanpa menyela atau memberi saran menghakimi." },
  { id: 48, name: "Feedback Practice", cat: "Communication", energy: "Calm", format: "Offline", tools: ["Template Kritik Konstruktif"], limit: [6, 80], dur: [20, 30], desc: "Latihan simulasi memberi evaluasi menggunakan metode sandwich feedback." },
  { id: 49, name: "Clarify the Message", cat: "Communication", energy: "Medium", format: "Offline", tools: ["Kasus Ambigu"], limit: [10, 80], dur: [15, 20], desc: "Menelaah email atau pesan rancu untuk menggali klarifikasi data sebelum bertindak." },
  { id: 50, name: "Presentasi 1 Menit", cat: "Communication", energy: "Medium", format: "Offline", tools: ["Random Topic Cards"], limit: [5, 50], dur: [15, 30], desc: "Melatih berbicara spontan tentang topik acak secara terstruktur dalam 60 detik." },

  // F. Leadership Games (51 - 60)
  { id: 51, name: "Leader Rotation", cat: "Leadership", energy: "High", format: "Offline", tools: ["Tantangan Fisik"], limit: [10, 100], dur: [20, 30], desc: "Pemimpin ditunjuk bergilir setiap 5 menit dalam memandu penyelesaian rintangan." },
  { id: 52, name: "Captain Challenge", cat: "Leadership", energy: "High", format: "Offline", tools: ["Peta Ruangan"], limit: [10, 100], dur: [20, 30], desc: "Satu kapten menyusun strategi delegasi tugas untuk anggotanya menyelesaikan misi rahasia." },
  { id: 53, name: "Crisis Simulation", cat: "Leadership", energy: "High", format: "Offline", tools: ["Lembar Krisis"], limit: [10, 80], dur: [30, 45], desc: "Tim menghadapi skenario bencana bisnis mendadak dan harus merespons taktis." },
  { id: 54, name: "Priority Ranking", cat: "Leadership", energy: "Calm", format: "Offline", tools: ["Daftar Tugas Bisnis"], limit: [10, 100], dur: [15, 25], desc: "Setiap pemimpin berlatih memprioritaskan 15 masalah mendesak di tempat kerja." },
  { id: 55, name: "Delegation Game", cat: "Leadership", energy: "Medium", format: "Offline", tools: ["Matriks Talenta"], limit: [10, 80], dur: [20, 30], desc: "Menugaskan pekerjaan berdasarkan kompetensi khusus individu tim secara klop." },
  { id: 56, name: "Leadership Dilemma", cat: "Leadership", energy: "Calm", format: "Offline", tools: ["Kartu Studi Kasus"], limit: [10, 80], dur: [20, 30], desc: "Memutuskan permasalahan pelik yang menguji moralitas, integritas, dan hasil bisnis." },
  { id: 57, name: "Trust the Leader", cat: "Leadership", energy: "Medium", format: "Offline", tools: ["Tutup Mata"], limit: [10, 80], dur: [15, 25], desc: "Seluruh tim ditutup matanya kecuali ketua, yang harus meneriakkan instruksi jalur." },
  { id: 58, name: "Leaderless Group Discussion", cat: "Leadership", energy: "Calm", format: "Offline", tools: ["Topik Masalah"], limit: [10, 80], dur: [20, 40], desc: "Kelompok menyelesaikan debat krusial tanpa ditunjuk pemimpin baku, melihat siapa yang inisiatif." },
  { id: 59, name: "Vision Mapping", cat: "Leadership", energy: "Medium", format: "Offline", tools: ["Kertas Karton", "Spidol Warna"], limit: [10, 100], dur: [20, 40], desc: "Menvisualisasikan peta target masa depan tim dan rencana peta jalannya secara gamblang." },
  { id: 60, name: "Coaching Practice", cat: "Leadership", energy: "Calm", format: "Offline", tools: ["Panduan GROW Model"], limit: [6, 60], dur: [30, 45], desc: "Praktik simulasi coaching formal menggunakan kerangka GROW (Goal, Reality, Options, Will)." },

  // G. Problem Solving Games (61 - 70)
  { id: 61, name: "Survival Scenario", cat: "Problem Solving", energy: "Calm", format: "Offline", tools: ["Daftar 15 Benda"], limit: [10, 100], dur: [20, 30], desc: "Tim harus memilah dan menilai 5 benda terpenting untuk bertahan hidup di pulau terasing." },
  { id: 62, name: "Root Cause Game", cat: "Problem Solving", energy: "Calm", format: "Offline", tools: ["Metode 5 Whys"], limit: [10, 80], dur: [20, 30], desc: "Menelusuri akar masalah sejati dari kegagalan fiktif menggunakan teknik 5 kali mengapa." },
  { id: 63, name: "Case Solving Race", cat: "Problem Solving", energy: "High", format: "Offline", tools: ["Lembar Kasus Bisnis"], limit: [10, 100], dur: [20, 40], desc: "Mengadu kecepatan antar tim menganalisis dan mempresentasikan tanggapan atas masalah korporasi." },
  { id: 64, name: "Limited Budget Challenge", cat: "Problem Solving", energy: "Medium", format: "Offline", tools: ["Rencana Kasus"], limit: [10, 100], dur: [20, 40], desc: "Merancang proposal implementasi program bernilai tinggi dengan potongan dana 70%." },
  { id: 65, name: "Broken Process Game", cat: "Problem Solving", energy: "Medium", format: "Offline", tools: ["Alur Flowchart"], limit: [10, 80], dur: [20, 40], desc: "Mencari kemacetan (bottleneck) dalam diagram proses pengiriman barang yang membengkak biayanya." },
  { id: 66, name: "Find the Error", cat: "Problem Solving", energy: "Calm", format: "Offline", tools: ["Laporan Keuangan Mock"], limit: [5, 80], dur: [10, 20], desc: "Menemukan kesalahan aritmatika dan logika tersembunyi berdasar data neraca keuangan." },
  { id: 67, name: "Decision Matrix Game", cat: "Problem Solving", energy: "Calm", format: "Offline", tools: ["Metode Weighted Score"], limit: [10, 80], dur: [20, 30], desc: "Menilai opsi ekspansi cabang menggunakan matriks kriteria pembobotan objektif." },
  { id: 68, name: "Resource Allocation", cat: "Problem Solving", energy: "Medium", format: "Offline", tools: ["Kertas Token Kas"], limit: [10, 100], dur: [20, 30], desc: "Latihan menyeimbangkan pembagian staf terbatas ke 4 proyek bersamaan demi hasil optimal." },
  { id: 69, name: "Mystery Problem", cat: "Problem Solving", energy: "Medium", format: "Offline", tools: ["Amplop Petunjuk"], limit: [10, 100], dur: [30, 45], desc: "Memecahkan misteri hilangnya prototipe penting dengan mengumpulkan petunjuk acak." },
  { id: 70, name: "Solution Pitch", cat: "Problem Solving", energy: "High", format: "Offline", tools: ["Timer Pitch"], limit: [10, 100], dur: [30, 60], desc: "Tim merancang solusi atas masalah kota dan mempresentasikannya di depan dewan juri." },

  // H. Sales & Service Games (71 - 80)
  { id: 71, name: "Handling Objection Role Play", cat: "Sales & Service", energy: "Medium", format: "Offline", tools: ["Flashcard Keberatan"], limit: [6, 60], dur: [20, 30], desc: "Satu berperan pembeli skeptis pelit, lawan tanding harus meng-handle keberatan harganya." },
  { id: 72, name: "Product Pitch Battle", cat: "Sales & Service", energy: "High", format: "Offline", tools: ["Benda Acak"], limit: [10, 100], dur: [20, 40], desc: "Mengadu kemampuan menjual benda konyol (seperti peniti rusak/angin) agar bernilai miliaran." },
  { id: 73, name: "Closing Challenge", cat: "Sales & Service", energy: "Medium", format: "Offline", tools: ["Skenario Penjualan"], limit: [6, 60], dur: [20, 30], desc: "Sesi penajaman teknik menutup negosiasi (Assumptive close, Now or Never close)." },
  { id: 74, name: "Customer Persona Game", cat: "Sales & Service", energy: "Calm", format: "Offline", tools: ["Kartu Persona"], limit: [10, 80], dur: [15, 30], desc: "Merajut tawaran fitur yang paling pas dengan tipe psikologis pembeli tertentu (Analytical, Driver)." },
  { id: 75, name: "Need Analysis Practice", cat: "Sales & Service", energy: "Calm", format: "Offline", tools: ["Suara Mandiri"], limit: [6, 60], dur: [20, 30], desc: "Hanya boleh bertanya tanpa menjawab untuk menggali kebutuhan terdalam pelanggan secara persuasif." },
  { id: 76, name: "Customer Complaint Simulation", cat: "Sales & Service", energy: "Medium", format: "Offline", tools: ["Naskah Komplain"], limit: [6, 80], dur: [20, 30], desc: "Menangani keluhan serius kesalahan sistem billing di depan pelanggan kecewa berat." },
  { id: 77, name: "Angry Customer Role Play", cat: "Sales & Service", energy: "Medium", format: "Offline", tools: ["Skenario Emosional"], limit: [6, 80], dur: [20, 30], desc: "Latihan mengelola emosi pribadi meredam kemarahan berapi-api pelanggan secara elegan." },
  { id: 78, name: "Service Recovery Game", cat: "Sales & Service", energy: "Medium", format: "Offline", tools: ["Lembar Dampak"], limit: [10, 100], dur: [20, 40], desc: "Menyusun strategi kompensasi dan maaf pasca kecelakaan layanan katering batal datang." },
  { id: 79, name: "Product Knowledge Quiz", cat: "Sales & Service", energy: "Medium", format: "Offline", tools: ["Kartu Soal / HP"], limit: [10, 500], dur: [10, 20], desc: "Mengadu ketepatan detail deskripsi spek teknis produk baru dengan sistem kuis interaktif." },
  { id: 80, name: "Customer Journey Mapping", cat: "Sales & Service", energy: "Calm", format: "Offline", tools: ["Sticky Notes"], limit: [10, 80], dur: [30, 45], desc: "Memetakan titik-titik krusial interaksi pembeli sejak tidak kenal hingga loyal berbelanja." },

  // I. Quiz & Polling Activities (81 - 90)
  { id: 81, name: "Live Quiz", cat: "Quiz & Polling", energy: "High", format: "Offline", tools: ["Aplikasi Kuis / HP"], limit: [10, 1000], dur: [5, 20], desc: "Kuis trivia interaktif cepat di mana peserta bersaing di papan peringkat langsung layar ponsel." },
  { id: 82, name: "True or False", cat: "Quiz & Polling", energy: "Medium", format: "Offline", tools: ["Kartu Merah Hijau"], limit: [10, 1000], dur: [5, 15], desc: "Mengeliminasi peserta di tiap pertanyaan benar atau salah hingga tersisa juara utama." },
  { id: 83, name: "Fastest Finger", cat: "Quiz & Polling", energy: "High", format: "Offline", tools: ["Smartphone / Bell"], limit: [10, 500], dur: [10, 20], desc: "Menjawab secepat-cepatnya pertanyaan lisan fasilitator dengan memencet tombol suara bell." },
  { id: 84, name: "Team Quiz Battle", cat: "Quiz & Polling", energy: "High", format: "Offline", tools: ["Papan Skor"], limit: [15, 500], dur: [15, 30], desc: "Cerdas cermat beregu antar divisi mengenai pemahaman materi training korporat." },
  { id: 85, name: "Ranking Quiz", cat: "Quiz & Polling", energy: "Medium", format: "Offline", tools: ["Layar Interaktif"], limit: [10, 500], dur: [10, 20], desc: "Mengurutkan rangkaian sejarah proses atau tahapan dari awal sampai akhir secara tepat bernilai." },
  { id: 86, name: "Mood Poll", cat: "Quiz & Polling", energy: "Calm", format: "Offline", tools: ["Aplikasi Polling"], limit: [10, 1000], dur: [2, 5], desc: "Survei seketika (live poll) mengukur keyakinan tim sebelum memulai kuartal baru." },
  { id: 87, name: "Opinion Poll", cat: "Quiz & Polling", energy: "Calm", format: "Offline", tools: ["Aplikasi Polling"], limit: [10, 1000], dur: [3, 10], desc: "Mengumpulkan suara seputar isu transisi kerja kantor hybrid (WFA/WFO)." },
  { id: 88, name: "Decision Poll", cat: "Quiz & Polling", energy: "Calm", format: "Offline", tools: ["Aplikasi Keputusan"], limit: [10, 1000], dur: [5, 10], desc: "Memilih secara demokratis satu dari tiga program CSR tahunan yang akan dideploy." },
  { id: 89, name: "Word Cloud Reflection", cat: "Quiz & Polling", energy: "Calm", format: "Online", tools: ["Platform Wordcloud"], limit: [10, 1000], dur: [3, 7], desc: "Mengisi satu kata berantai yang secara real-time membentuk awan kata visual di proyektor." },
  { id: 90, name: "Q&A Voting", cat: "Quiz & Polling", energy: "Calm", format: "Offline", tools: ["Layar Slido / HP"], limit: [20, 1000], dur: [10, 30], desc: "Mengajukan pertanyaan umum ke narasumber, pertanyaan terpopuler divote teratas." },

  // J. Simulation & Role Play (91 - 100)
  { id: 91, name: "Customer Service Simulation", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Meja CS", "Telepon"], limit: [6, 80], dur: [20, 40], desc: "Simulasi fisik lengkap melayani komplain kesalahan pengiriman struk belanja." },
  { id: 92, name: "Sales Meeting Simulation", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Materi Presentasi CS"], limit: [6, 60], dur: [20, 40], desc: "Menyimulasikan presentasi formal B2B di depan direktur utama calon pembeli." },
  { id: 93, name: "Conflict Handling Role Play", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Skenario Konflik"], limit: [6, 80], dur: [20, 40], desc: "Menengahi perdebatan sengit tentang batas tanggung jawab project manager vs developer." },
  { id: 94, name: "Feedback Conversation", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Form Penilaian CS"], limit: [6, 60], dur: [20, 30], desc: "Latihan menanggapi bawahan yang mangkir rapat dua kali berturut-turut secara bijaksana." },
  { id: 95, name: "Interview Simulation", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Daftar CV Mock"], limit: [6, 60], dur: [20, 40], desc: "Latihan wawancara penerimaan kerja fiktif untuk melatih ketenangan cara bicara peserta." },
  { id: 96, name: "Negotiation Simulation", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Lembar Kesepakatan"], limit: [6, 80], dur: [30, 45], desc: "Latihan tawar-menawar kontrak kerja sama katering makan siang diskon besar-besaran." },
  { id: 97, name: "Crisis Meeting Simulation", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Siaran Pers Mock"], limit: [10, 80], dur: [30, 45], desc: "Skenario rapat tanggap darurat akibat kebocoran data penting perusahaan ke publik." },
  { id: 98, name: "Coaching Session Simulation", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Checklist Coaching"], limit: [6, 60], dur: [30, 45], desc: "Penerapan model bimbingan berkala mingguan (weekly 1-on-1 coaching) yang empati." },
  { id: 99, name: "Public Speaking Practice", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Mic / Podium"], limit: [5, 50], dur: [20, 60], desc: "Latihan berpidato memotivasi masa dalam rapat umum secara dinamis berkarisma." },
  { id: 100, name: "Event Handling Simulation", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Peta Acara", "Radio HT"], limit: [10, 80], dur: [30, 45], desc: "Simulasi menangani kerusuhan pintu masuk konser tanpa kepanikan panitia EO liar." },

  // K. Challenge (101 - 110)
  { id: 101, name: "Photo Mission", cat: "Challenge", energy: "High", format: "Offline", tools: ["Kamera HP"], limit: [10, 300], dur: [20, 60], desc: "Misi memotret 5 objek estetik dan simbolik yang mewakili core values tim di sekitar tempat acara." },
  { id: 102, name: "Video Challenge", cat: "Challenge", energy: "High", format: "Offline", tools: ["Video Editor HP"], limit: [10, 300], dur: [30, 90], desc: "Membuat video TikTok sapaan kreatif mengenalkan divisi Anda dalam waktu 45 menit." },
  { id: 103, name: "Scavenger Hunt", cat: "Challenge", energy: "High", format: "Offline", tools: ["Daftar Clue Teka-teki"], limit: [20, 300], dur: [30, 90], desc: "Lomba berburu harta karun petunjuk misterius yang disembunyikan di seluruh penjuru taman." },
  { id: 104, name: "Social Media Challenge", cat: "Challenge", energy: "Medium", format: "Hybrid", tools: ["Instagram / Twitter"], limit: [10, 500], dur: [30, 120], desc: "Berkompetisi menulis utas reflektif inspiratif terbaik tentang value integritas kerja." },
  { id: 105, name: "Creative Pitch Challenge", cat: "Challenge", energy: "High", format: "Offline", tools: ["Kertas Raksasa", "Spidol"], limit: [10, 100], dur: [30, 60], desc: "Tim mendesain logo kaos unik bertema teamwork lalu membawakan pitch model iklan TV." },
  { id: 106, name: "Booth Challenge", cat: "Challenge", energy: "High", format: "Offline", tools: ["Kartu Stempel"], limit: [50, 1000], dur: [30, 120], desc: "Melintasi 7 pos tantangan permainan ketangkasan untuk melengkapi cap kelulusan tim." },
  { id: 107, name: "Stamp Mission", cat: "Challenge", energy: "High", format: "Offline", tools: ["Peta Cap Stempel"], limit: [50, 1000], dur: [30, 120], desc: "Mengumpulkan cap validasi dari narasumber penting setelah melakukan tanya jawab berbobot." },
  { id: 108, name: "Team Mission Card", cat: "Challenge", energy: "High", format: "Offline", tools: ["Amplop Misi Segel"], limit: [10, 300], dur: [20, 60], desc: "Menuntaskan deretan misi kecil di sekitar ruangan yang membutuhkan pengerjaan kolektif kompak." },
  { id: 109, name: "Creativity Wall", cat: "Challenge", energy: "Medium", format: "Offline", tools: ["Papan Tulis", "Sticky Notes Warna"], limit: [10, 500], dur: [10, 30], desc: "Menempel mural kolase gambar kreatif impian pertumbuhan perusahaan di masa depan." },
  { id: 110, name: "Mini Hackathon", cat: "Challenge", energy: "High", format: "Offline", tools: ["Laptop / Kertas Pola"], limit: [10, 200], dur: [60, 180], desc: "Merajut purwarupa aplikasi atau solusi inovatif untuk masalah limbah plastik dalam waktu singkat." },

  // L. Reflection (111 - 120)
  { id: 111, name: "3 Hal yang Saya Pelajari", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Kertas Memo"], limit: [5, 500], dur: [5, 10], desc: "Mengambil jeda menulis 3 penemuan berharga (aha-moment) dari keseluruhan aktivitas." },
  { id: 112, name: "Satu Komitmen Aksi", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Sticky Notes"], limit: [5, 500], dur: [5, 10], desc: "Menulis satu tindakan realistis spesifik yang berjanji akan dilakukan dalam 48 jam ke depan." },
  { id: 113, name: "Surat untuk Diri Sendiri", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Amplop", "Kertas"], limit: [5, 200], dur: [10, 15], desc: "Menulis pesan motivasi penuh mimpi yang akan dikirim kembali ke alamat pribadi 6 bulan lagi." },
  { id: 114, name: "Appreciation Circle", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Benang Rajut / Tanpa Alat"], limit: [5, 80], dur: [10, 20], desc: "Peserta saling melingkar bergiliran memberi pujian tulus atas kontribusi koleganya seharian." },
  { id: 115, name: "Before After Reflection", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Form Penilaian"], limit: [10, 500], dur: [5, 10], desc: "Menilai perbedaan tingkat pemahaman dan keyakinan sebelum dan setelah pelatihan." },
  { id: 116, name: "Insight Wall", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Papan Buat", "Post It"], limit: [10, 500], dur: [10, 20], desc: "Menyertakan pesan kesimpulan terbesar di dinding galeri penutup training." },
  { id: 117, name: "Lesson Learned Sharing", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Tanpa Alat"], limit: [10, 100], dur: [10, 30], desc: "Peserta menceritakan kegagalan tim di awal games dan bagaimana mereka belajar merevisi strategi." },
  { id: 118, name: "My Next Step", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Lembar Komitmen"], limit: [5, 500], dur: [5, 10], desc: "Menyusun skema milestone taktis minggu depan demi mengaplikasikan ilmu baru." },
  { id: 119, name: "One Word Closing", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Tanpa Alat"], limit: [5, 500], dur: [3, 5], desc: "Setiap peserta meneriakkan berantai satu patah kata ringkas gambaran perasaannya." },
  { id: 120, name: "Commitment Board", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Papan Besar", "Spidol Permanen"], limit: [10, 500], dur: [10, 15], desc: "Menandatangani piagam kesepakatan nilai baru tim pelaksana demi kejayaan bersama." },

  // M. Travel, Religious, Wedding & Special Activities (121 - 132)
  { id: 121, name: "Bus Games", cat: "Travel & Special", energy: "Medium", format: "Offline", tools: ["Tanpa Alat"], limit: [10, 60], dur: [10, 30], desc: "Tebak kata-kata berantai atau nyanyi sambung melingkar menyemarakkan perjalanan di bus." },
  { id: 122, name: "Destination Quiz", cat: "Travel & Special", energy: "Medium", format: "Offline", tools: ["Soal Sejarah"], limit: [10, 100], dur: [10, 20], desc: "Teka-teki seru mengenai tempat-tempat bersejarah destinasi liburan yang sedang dituju." },
  { id: 123, name: "Travel Photo Hunt", cat: "Travel & Special", energy: "High", format: "Offline", tools: ["Kamera HP"], limit: [10, 300], dur: [30, 90], desc: "Berlomba menangkap momen kelucuan warga lokal atau ikon kota yang eksotik." },
  { id: 124, name: "Journey Reflection", cat: "Travel & Special", energy: "Calm", format: "Offline", tools: ["Tanpa Alat"], limit: [5, 100], dur: [10, 20], desc: "Duduk santai di pinggir pantai berbagi pengalaman spiritual perjalanan yang membuka mata." },
  { id: 125, name: "Manasik Quiz", cat: "Travel & Special", energy: "Calm", format: "Offline", tools: ["Panduan Ibadah Umroh"], limit: [10, 300], dur: [10, 20], desc: "Menguji ketepatan rukun, urutan, dan doa-doa penting pelaksanaan Haji maupun Umroh." },
  { id: 126, name: "Manasik Simulation", cat: "Travel & Special", energy: "Medium", format: "Offline", tools: ["Kain Ihram Mock", "Replika Ka'bah"], limit: [10, 300], dur: [30, 90], desc: "Simulasi gerak thawaf, sa'i, dan wukuf dipandu ustadz secara tertib sebelum keberangkatan." },
  { id: 127, name: "Islamic Quiz Battle", cat: "Travel & Special", energy: "High", format: "Offline", tools: ["Bel Suara"], limit: [10, 500], dur: [10, 30], desc: "Kompetisi tanya-jawab ceria seputar sirah nabawiyah melatih akhlak siswa sekolah." },
  { id: 128, name: "Mission Amal", cat: "Travel & Special", energy: "Medium", format: "Offline", tools: ["Bungkus Sedekah"], limit: [10, 500], dur: [30, 120], desc: "Misi sosial menyebarkan kebaikan membagikan paket nasi gratis di jalanan sekitar yayasan." },
  { id: 129, name: "Couple Quiz", cat: "Travel & Special", energy: "Medium", format: "Offline", tools: ["Papan Tulis Mini"], limit: [20, 300], dur: [10, 20], desc: "Pengantin menjawab pertanyaan seberapa dalam mereka mengenal kebiasaan unik pasangannya." },
  { id: 130, name: "Family Memory Game", cat: "Travel & Special", energy: "Calm", format: "Offline", tools: ["Foto Lama Keluarga"], limit: [20, 300], dur: [10, 30], desc: "Menebak identitas masa kecil paman/tante dari foto-foto usang album keluarga besar." },
  { id: 131, name: "Wishes Wall", cat: "Travel & Special", energy: "Calm", format: "Offline", tools: ["Papan Kayu", "Spidol Emas"], limit: [20, 500], dur: [10, 30], desc: "Undangan menulis coretan doa restu terbaik di sudut gapura pernikahan sahabat tercinta." },
  { id: 132, name: "Guest Interaction Quiz", cat: "Travel & Special", energy: "Medium", format: "Offline", tools: ["Kertas Soal"], limit: [20, 500], dur: [10, 20], desc: "MC melibatkan para tamu undangan memecah kebosanan lewat tebak-tebakan kenangan seru pengantin." }
];

// Dynamically generate all 132 activities with full fields matching requirements.
export function getIllustrationUrl(category: string, id: number): string {
  const images: { [key: string]: string } = {
    "Ice Breaking": "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846",
    "Energizer": "https://images.unsplash.com/photo-1511632765486-a01980e01a18",
    "Fun Games": "https://images.unsplash.com/photo-1606167668584-78701c57f13d",
    "Team Building": "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    "Communication": "https://images.unsplash.com/photo-1543269865-cbf427effbad",
    "Leadership": "https://images.unsplash.com/photo-1515187029135-18ee286d815b",
    "Problem Solving": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
    "Sales & Service": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d",
    "Quiz & Polling": "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b",
    "Simulation & Role Play": "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83",
    "Challenge": "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368",
    "Reflection": "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
    "Travel & Special": "https://images.unsplash.com/photo-1488646953014-85cb44e25828"
  };
  const base = images[category] || "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846";
  return `${base}?q=80&w=600&auto=format&fit=crop&sig=${id}`;
}

export const ACTIVITIES: Activity[] = RAW_ACTIVITIES_LIST.map((raw) => {
  const catDesc = CATEGORIES[raw.cat] || "Aktivitas interaktif siap pakai.";
  
  return {
    id: raw.id,
    activity_number: `ACT-${String(raw.id).padStart(3, '0')}`,
    activity_name: raw.name,
    category: raw.cat,
    short_description: raw.desc,
    long_description: `${raw.desc} Dirancang secara khusus untuk meningkatkan partisipasi aktif peserta secara terukur, interaktif, dan penuh dengan keceriaan. Cocok diimplementasikan ke dalam rangkaian sesi Anda demi hasil optimal.`,
    objective: `Meningkatkan partisipasi aktif peserta melatih ${raw.cat.toLowerCase()} dan membangun suasana kolaboratif.`,
    main_goal: `Mencapai target sesi lewat media ${raw.cat.toLowerCase()} interaktif.`,
    suitable_for: ["Trainer", "MC / Host", "Fasilitator", "HR / Learning & Development", "Guru / Dosen", "Komunitas", "Event Organizer"],
    suitable_event_filter: [
      "Corporate Training",
      "Employee Gathering",
      "Team Building",
      "Outbound Kantor",
      "Seminar Bisnis",
      "MPLS",
      "Webinar Online",
      "Family Gathering",
      "Manasik Umroh",
      "Wedding Reception"
    ],
    participant_min: raw.limit[0],
    participant_max: raw.limit[1],
    duration_min: raw.dur[0],
    duration_max: raw.dur[1],
    format: raw.format as 'Offline' | 'Online' | 'Hybrid',
    indoor_outdoor: 'Indoor',
    energy_level: raw.energy as 'Calm' | 'Medium' | 'High',
    difficulty_level: raw.id % 3 === 0 ? 'Advanced' : (raw.id % 2 === 0 ? 'Medium' : 'Easy'),
    tools_needed: raw.tools,
    step_by_step: [
      "Fasilitator melakukan briefing pembukaan aktivitas selama 2 menit menjelaskan tujuan permainan.",
      "Membagi seluruh peserta menjadi kelompok-kelompok kecil sesuai proporsi jumlah peserta.",
      "Fasilitator membagikan alat penunjang aktivitas atau memicu kesiapan jika tanpa alat.",
      "Memulai jalannya aktivitas utama dengan menghidupkan countdown timer terintegrasi.",
      "Monitoring pergerakan, memberikan dorongan motivasi, serta mencatat performa.",
      "Aktivitas selesai, fasilitator mengumpulkan hasil penilaian serta pemenang utama.",
      "Melakukan de-briefing mengajukan pertanyaan esensial untuk mengunci pembelajaran."
    ],
    mc_script: `"Halo teman-teman sekalian! Sebelum masuk ke sesi materi utama, ayo kita rilekskan tubuh kita sejenak melalui aktivitas interaktif bernama '${raw.name}'. Caranya sangat gampang, dengarkan instruksi saya secara teliti ya. Kita akan mulai dalam hitungan tiga, dua, satu... go!"`,
    debrief_questions: [
      "Apa hal terberat yang dirasakan tim saat mencoba menyelaraskan jalannya aktivitas tadi?",
      "Pola komunikasi seperti apa yang terbukti berhasil mempercepat pencapaian tujuan kita?",
      "Bagaimana pelajaran dari aktivitas ini bisa kita bawa langsung ke dalam pekerjaan sehari-hari?"
    ],
    variations: [
      "Versi 5 menit: Hilangkan fase pembagian kelompok, jalankan langsung secara massal.",
      "Versi tanpa alat: Modifikasi rules menggunakan bahasa tubuh murni atau kode suara.",
      "Versi Virtual / Online: Gunakan fitur whiteboard kolaboratif dan breakout room Zoom."
    ],
    risk_notes: "Beberapa peserta mungkin merasa enggan bergerak di ranah publik atau takut salah bertindak.",
    mitigation_tips: "Fasilitator wajib menunjukkan contoh gerakan lucu terlebih dahulu agar mencairkan rasa malu.",
    professional_tips: "Selalu pertahankan senyum lebar, intonasi suara dinamis naik-turun, serta berikan apresiasi hangat kepada kelompok yang paling kompak.",
    rating: Number((4.5 + (raw.id % 5) * 0.1).toFixed(1)),
    usage_count: 40 + (raw.id * 3) % 150,
    is_free: raw.id <= 30 || raw.id % 4 !== 0, // mix of free and premium items
    estimated_fun_level: 4 + (raw.id % 2),
    estimated_impact_level: 3 + (raw.id % 3),
    illustration_url: getIllustrationUrl(raw.cat, raw.id)
  };
});

// Mock Activity Packs matching exactly the list of require packs
export interface ActivityPack {
  id: string;
  name: string;
  description: string;
  activitiesCount: number;
  price: string;
  isUnlocked: boolean;
  category: string;
}

export const ACTIVITY_PACKS: ActivityPack[] = [
  { id: 'pack-1', name: 'Ice Breaking Pack', description: 'Koleksi 10 aktivitas pemecah kebekuan suasana tercepat.', activitiesCount: 10, price: 'Free', isUnlocked: true, category: 'Ice Breaking' },
  { id: 'pack-2', name: 'Energizer Pack', description: 'Koleksi 10 aktivitas pengusir kantuk dan penambah fokus.', activitiesCount: 10, price: 'Rp 49.000', isUnlocked: false, category: 'Energizer' },
  { id: 'pack-3', name: 'Team Building Pack', description: 'Koleksi lengkap aktivitas mengasah sinergi dan trust tim.', activitiesCount: 10, price: 'Rp 99.000', isUnlocked: false, category: 'Team Building' },
  { id: 'pack-4', name: 'Communication Games Pack', description: 'Asah kejelasan instruksi verbal dan non-verbal tim.', activitiesCount: 10, price: 'Rp 79.000', isUnlocked: false, category: 'Communication' },
  { id: 'pack-5', name: 'Leadership Games Pack', description: 'Melatih delegasi krisis, pengambilan keputusan taktis.', activitiesCount: 10, price: 'Rp 149.000', isUnlocked: false, category: 'Leadership' },
  { id: 'pack-6', name: 'Problem Solving Pack', description: 'Kasus pelik, alokasi budget, brainstorming kolaboratif.', activitiesCount: 10, price: 'Rp 99.000', isUnlocked: false, category: 'Problem Solving' },
  { id: 'pack-7', name: 'Sales Role Play Pack', description: 'Handling objection, elevator pitch battle siap pakai.', activitiesCount: 10, price: 'Rp 149.000', isUnlocked: false, category: 'Sales & Service' },
  { id: 'pack-8', name: 'Service Simulation Pack', description: 'Service recovery, manajemen amarah pelanggan.', activitiesCount: 10, price: 'Rp 129.000', isUnlocked: false, category: 'Sales & Service' },
  { id: 'pack-9', name: 'Quiz & Polling Pack', description: 'Bank soal interaktif penarik antusiasme masa rapat.', activitiesCount: 10, price: 'Free', isUnlocked: true, category: 'Quiz & Polling' },
  { id: 'pack-10', name: 'Reflection Pack', description: 'Menutup sesi dengan meaning mendalam dan komitmen aksi.', activitiesCount: 10, price: 'Rp 49.000', isUnlocked: false, category: 'Reflection' },
  { id: 'pack-11', name: 'Online Games Pack', description: 'Aktivitas yang optimal dimainkan via zoom/gmeet webinar.', activitiesCount: 12, price: 'Rp 99.000', isUnlocked: false, category: 'Online' },
  { id: 'pack-12', name: 'Outdoor Games Pack', description: 'Aktivitas seru luar ruangan tanpa risiko cedera fisik.', activitiesCount: 10, price: 'Rp 129.000', isUnlocked: false, category: 'Outdoor' },
  { id: 'pack-13', name: 'Wedding Games Pack', description: 'Ice breaker pengantin dan tamu undangan interaktif.', activitiesCount: 5, price: 'Rp 159.000', isUnlocked: false, category: 'Wedding' },
  { id: 'pack-14', name: 'Travel Games Pack', description: 'Pencair kantuk sepanjang jalan di bus wisata atau tour.', activitiesCount: 4, price: 'Rp 49.000', isUnlocked: false, category: 'Travel' }
];

// Mock Help Articles / Tutorial Center items
export interface Tutorial {
  id: string;
  title: string;
  duration: string;
  level: 'Pemula' | 'Menengah' | 'Profesional';
  icon: string;
  category: string;
  youtubeId: string;
  description: string;
  highlights: string[];
}

export const TUTORIALS: Tutorial[] = [
  {
    id: 'tut-1',
    title: 'Cara Mencari Aktivitas dengan Cepat & Efektif',
    duration: '3 Menit',
    level: 'Pemula',
    icon: 'Search',
    category: 'Umum',
    youtubeId: 'bFiL886U6Z8',
    description: 'Panduan taktis menyaring 132 aktivitas berdasarkan jumlah peserta, durasi, ketersediaan alat, dan energi panggung secara instan menggunakan Kokpit Aktipan.',
    highlights: ['Penyaringan multi-dimensi', 'Menentukan filter "Tanpa Alat"', 'Membedakan energi Calm vs High']
  },
  {
    id: 'tut-2',
    title: 'Cara Membaca & Menganalisis Detail Aktivitas',
    duration: '5 Menit',
    level: 'Pemula',
    icon: 'BookOpen',
    category: 'Dasar',
    youtubeId: '3_g2_Y-7EBY',
    description: 'Pelajari anatomi petunjuk Aktipan seperti Estimasi Fun Level, Impact Level, catatan risiko panggung, serta trik mitigasi kegaduhan peserta.',
    highlights: ['Mengartikan Metrik Fun & Impact', 'Memetakan kebutuhan space (Indoor/Outdoor)', 'Mempersiapkan tools cadangan']
  },
  {
    id: 'tut-3',
    title: 'Panduan Menggunakan Script Fasilitator Secara Natural',
    duration: '7 Menit',
    level: 'Menengah',
    icon: 'MessageSquare',
    category: 'Fasilitator',
    youtubeId: 'J9fSg0S2KqQ',
    description: 'Kunci vokal, intonasi, dan bahasa tubuh saat membacakan MC script bawaan Aktipan. Bagaimana berimprovisasi tanpa kehilangan alur instruksi utama.',
    highlights: ['Teknik blocking di panggung', 'Intonasi ice breaking energis', 'Jeda dramatis saat memberikan instruksi']
  },
  {
    id: 'tut-4',
    title: 'Cara Mengaktifkan Run Mode & Timer di Tengah Demo',
    duration: '4 Menit',
    level: 'Pemula',
    icon: 'Play',
    category: 'Fitur',
    youtubeId: '2L-3PhgY98U',
    description: 'Memahami fungsionalitas panel Run Mode. Menjalankan modul Stopwatch panggung terintegrasi, tracker interaktif per tahapan game, dan instruktur script otomatis.',
    highlights: ['Aktivasi overlay Run Mode', 'Penyesuaian timer panggung secara real-time', 'Navigasi instan step-by-step']
  },
  {
    id: 'tut-5',
    title: 'Panduan Memandu Sesi Debrief & Menolak Kejenuhan',
    duration: '10 Menit',
    level: 'Profesional',
    icon: 'Lightbulb',
    category: 'Metodologi',
    youtubeId: 'Z3x8V_T_7tE',
    description: 'Latihan pasca-game (Debriefing) yang bermakna. Mengaitkan game receh dengan value kepemimpinan, kerja sama tim, komunikasi asertif, dan korelasi dunia kerja nyata.',
    highlights: ['Seni mengajukan pertanyaan reflektif', 'Menghubungkan game dengan KPI korporasi', 'Teknik closing emosional tingkat tinggi']
  },
  {
    id: 'tut-6',
    title: 'Praktik Terbaik Menangani Peserta Super Pasif',
    duration: '8 Menit',
    level: 'Menengah',
    icon: 'HelpCircle',
    category: 'Fasilitator',
    youtubeId: 'p9h9_S_bclY',
    description: 'Taktik empati memecah kekauan peserta introvert atau peserta senior yang enggan bergerak. Merangkul partisipasi aktif tanpa intimidasi fisik di panggung.',
    highlights: ['Aturan kesukarelaan non-coercive', 'Strategi "buddy-system" berpasangan', 'Modifikasi taktis aturan game demi inklusivitas']
  },
  {
    id: 'tut-7',
    title: 'Cara Membuat Koleksi Aktivitas Custom Sendiri',
    duration: '5 Menit',
    level: 'Pemula',
    icon: 'FolderPlus',
    category: 'Dasar',
    youtubeId: 'R07E7W2q9mU',
    description: 'Maksimalkan fitur "Koleksi Saya" & "Buat Aktivitas". Atur urutan game (rundown) berdasarkan plot kurva energi (low-high-reflection) agar audiens terkesima hingga akhir.',
    highlights: ['Menyimpan favorit sekali klik', 'Mengekspor draft rundown acara', 'Custom penamaan kode acara trainer']
  }
];

// Mock Marketplace Vendors
export interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  price: string;
  services: string[];
}

export const VENDORS: Vendor[] = [
  { id: 'v-1', name: 'Andi Wijaya, C.T (Certified Trainer)', category: 'Trainer Professional', rating: 4.9, location: 'Jakarta, Indonesia', price: 'Rp 3.500.000 / Sesi', services: ['Corporate Teamwork', 'Leadership Outbound'] },
  { id: 'v-2', name: 'Siska Amanda (Fun Wedding MC)', category: 'MC / Host', rating: 4.8, location: 'Bandung, Indonesia', price: 'Rp 2.500.000 / Acara', services: ['Wedding Games Specialist', 'Family Gathering Host'] },
  { id: 'v-3', name: 'Kurniawan Pratama, S.Psi', category: 'Fasilitator Outbound', rating: 4.9, location: 'Bogor, Indonesia', price: 'Rp 1.800.000 / Hari', services: ['High Rope Iceberg', 'Character Building'] },
  { id: 'v-4', name: 'FunProps Indonesia (Alat & Merchandise)', category: 'Vendor Alat Games', rating: 4.7, location: 'Surabaya, Indonesia', price: 'Katalog Sewa Heboh', services: ['Sewa Papan Puzzle Raksasa', 'Import Tarik Tambang Profesional'] }
];
