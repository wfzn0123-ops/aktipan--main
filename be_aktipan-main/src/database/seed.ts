import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { User, Activity, ActivityPack, Session } from '../types/index.js';

export async function seedDatabase() {
  const users = db.getUsers();
  
  // Seed Users if empty
  if (users.length === 0) {
    console.log('🌱 Seeding default users...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedTrainerPassword = await bcrypt.hash('password123', 10);
    const hashedMcPassword = await bcrypt.hash('password123', 10);

    const adminUser: User = {
      id: 'usr_admin_001',
      name: 'Super Admin Aktipan',
      email: 'admin@aktipan.com',
      phone: '+62 811-9988-7766',
      password: hashedAdminPassword,
      role: 'Admin',
      location: 'Jakarta Headquarter',
      whatsapp: '+62 811-9988-7766',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const trainerUser: User = {
      id: 'usr_trainer_002',
      name: 'Andika Pratama',
      email: 'andika@aktipan.com',
      phone: '+62 812-3456-7890',
      password: hashedTrainerPassword,
      role: 'Trainer',
      location: 'Jakarta, Indonesia',
      whatsapp: '+62 812-3456-7890',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const mcUser: User = {
      id: 'usr_mc_003',
      name: 'Sarah Amanda',
      email: 'sarah@aktipan.com',
      phone: '+62 813-5566-7788',
      password: hashedMcPassword,
      role: 'MC / Host',
      location: 'Bandung, Indonesia',
      whatsapp: '+62 813-5566-7788',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.insertUser(adminUser);
    db.insertUser(trainerUser);
    db.insertUser(mcUser);

    db.insertAuditLog('SYSTEM_INIT', 'Database seeded with default Admin and Demo accounts.', adminUser.id, adminUser.name);
    console.log('✅ Users seeded: admin@aktipan.com (admin123), andika@aktipan.com (password123)');
  }

  // Seed All 132 Activities if less than 100
  const activities = db.getActivities();
  if (activities.length < 100) {
    console.log('🌱 Seeding full 132 standard activities...');
    const generatedActivities = generateAll132Activities();
    for (const act of generatedActivities) {
      if (!db.getActivityById(act.id)) {
        db.insertActivity(act);
      }
    }
    console.log(`✅ Database now has ${db.getActivities().length} activities.`);
  }

  // Seed Activity Packs if empty or less than 10
  const packs = db.getPacks();
  if (packs.length < 10) {
    console.log('🌱 Seeding activity packs...');
    const defaultPacks: ActivityPack[] = [
      { id: 1, title: 'Ice Breaking Pack', category: 'Ice Breaking', description: 'Koleksi 10 aktivitas pemecah kebekuan suasana tercepat.', activityCount: 10, price: 'Free', isPro: false, activities: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], highlights: ['100% Praktis', 'Tanpa Ribet'] },
      { id: 2, title: 'Energizer Pack', category: 'Energizer', description: 'Koleksi 10 aktivitas pengusir kantuk dan penambah fokus.', activityCount: 10, price: 'Rp 49.000', isPro: true, activities: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], highlights: ['Super Energik', 'Meningkatkan Fokus'] },
      { id: 3, title: 'Team Building Pack', category: 'Team Building', description: 'Koleksi lengkap aktivitas mengasah sinergi dan trust tim.', activityCount: 10, price: 'Rp 99.000', isPro: true, activities: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40], highlights: ['Bonding Kuat', 'Problem Solving'] },
      { id: 4, title: 'Communication Games Pack', category: 'Communication', description: 'Asah kejelasan instruksi verbal dan non-verbal tim.', activityCount: 10, price: 'Rp 79.000', isPro: true, activities: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50], highlights: ['Active Listening', 'Bebas Miskom'] },
      { id: 5, title: 'Leadership Games Pack', category: 'Leadership', description: 'Melatih delegasi krisis, pengambilan keputusan taktis.', activityCount: 10, price: 'Rp 149.000', isPro: true, activities: [51, 52, 53, 54, 55, 56, 57, 58, 59, 60], highlights: ['Kepemimpinan Nyata', 'Crisis Management'] },
      { id: 6, title: 'Problem Solving Pack', category: 'Problem Solving', description: 'Kasus pelik, alokasi budget, brainstorming kolaboratif.', activityCount: 10, price: 'Rp 99.000', isPro: true, activities: [61, 62, 63, 64, 65, 66, 67, 68, 69, 70], highlights: ['Analisis Mendalam', 'Solusi Strategis'] },
      { id: 7, title: 'Sales Role Play Pack', category: 'Sales & Service', description: 'Handling objection, elevator pitch battle siap pakai.', activityCount: 10, price: 'Rp 149.000', isPro: true, activities: [71, 72, 73, 74, 75, 76, 77, 78, 79, 80], highlights: ['Negosiasi Tajam', 'Closing Ampuh'] },
      { id: 8, title: 'Quiz & Polling Pack', category: 'Quiz & Polling', description: 'Bank soal interaktif penarik antusiasme masa rapat.', activityCount: 10, price: 'Free', isPro: false, activities: [81, 82, 83, 84, 85, 86, 87, 88, 89, 90], highlights: ['Live Polling', 'Seru & Cepat'] },
      { id: 9, title: 'Reflection Pack', category: 'Reflection', description: 'Menutup sesi dengan meaning mendalam dan komitmen aksi.', activityCount: 10, price: 'Rp 49.000', isPro: true, activities: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120], highlights: ['Meaningful Closing', 'Action Plan'] },
      { id: 10, title: 'Special & Travel Games Pack', category: 'Travel & Special', description: 'Pencair kantuk sepanjang jalan di bus wisata atau tour.', activityCount: 12, price: 'Rp 59.000', isPro: true, activities: [121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132], highlights: ['Tour & Bus', 'Acara Spesial'] }
    ];
    for (const p of defaultPacks) {
      if (!db.getPackById(p.id)) {
        db.insertPack(p);
      }
    }
    console.log(`✅ ${defaultPacks.length} packs seeded successfully.`);
  }

  // Seed Sessions if empty
  const sessions = db.getSessions();
  if (sessions.length === 0) {
    console.log('🌱 Seeding initial sessions...');
    const defaultSessions: Session[] = [
      {
        id: 'sess-1',
        userId: 'usr_trainer_002',
        name: 'Rapat Kerja Tahunan 2026',
        date: '2026-06-25',
        context: 'Corporate Gathering',
        audience: 'Manager & Staf Divisi HR',
        participantCount: 45,
        activityIds: [1, 11, 31],
        notes: 'Buka dengan ice breaking fakta, pertengahan beri tepuk fokus.',
        status: 'Draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'sess-2',
        userId: 'usr_trainer_002',
        name: 'Seminar Motivasi Mahasiswa Baru',
        date: '2026-07-02',
        context: 'MPLS Campus',
        audience: 'Mahasiswa Baru angkatan 2026',
        participantCount: 150,
        activityIds: [2, 13, 112],
        notes: 'Fokus refleksi di penutup panggung.',
        status: 'Berjalan',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    for (const s of defaultSessions) {
      db.insertSession(s);
    }
  }
}

export async function resetSeedToDefaults(): Promise<void> {
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedTrainerPassword = await bcrypt.hash('password123', 10);
  const hashedMcPassword = await bcrypt.hash('password123', 10);

  const adminUser: User = {
    id: 'usr_admin_001',
    name: 'Super Admin Aktipan',
    email: 'admin@aktipan.com',
    phone: '+62 811-9988-7766',
    password: hashedAdminPassword,
    role: 'Admin',
    location: 'Jakarta Headquarter',
    whatsapp: '+62 811-9988-7766',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const trainerUser: User = {
    id: 'usr_trainer_002',
    name: 'Andika Pratama',
    email: 'andika@aktipan.com',
    phone: '+62 812-3456-7890',
    password: hashedTrainerPassword,
    role: 'Trainer',
    location: 'Jakarta, Indonesia',
    whatsapp: '+62 812-3456-7890',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mcUser: User = {
    id: 'usr_mc_003',
    name: 'Sarah Amanda',
    email: 'sarah@aktipan.com',
    phone: '+62 813-5566-7788',
    password: hashedMcPassword,
    role: 'MC / Host',
    location: 'Bandung, Indonesia',
    whatsapp: '+62 813-5566-7788',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const defaultPacks: ActivityPack[] = [
    { id: 1, title: 'Ice Breaking Pack', category: 'Ice Breaking', description: 'Koleksi 10 aktivitas pemecah kebekuan suasana tercepat.', activityCount: 10, price: 'Free', isPro: false, activities: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], highlights: ['100% Praktis', 'Tanpa Ribet'] },
    { id: 2, title: 'Energizer Pack', category: 'Energizer', description: 'Koleksi 10 aktivitas pengusir kantuk dan penambah fokus.', activityCount: 10, price: 'Rp 49.000', isPro: true, activities: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], highlights: ['Super Energik', 'Meningkatkan Fokus'] },
    { id: 3, title: 'Team Building Pack', category: 'Team Building', description: 'Koleksi lengkap aktivitas mengasah sinergi dan trust tim.', activityCount: 10, price: 'Rp 99.000', isPro: true, activities: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40], highlights: ['Bonding Kuat', 'Problem Solving'] },
    { id: 4, title: 'Communication Games Pack', category: 'Communication', description: 'Asah kejelasan instruksi verbal dan non-verbal tim.', activityCount: 10, price: 'Rp 79.000', isPro: true, activities: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50], highlights: ['Active Listening', 'Bebas Miskom'] },
    { id: 5, title: 'Leadership Games Pack', category: 'Leadership', description: 'Melatih delegasi krisis, pengambilan keputusan taktis.', activityCount: 10, price: 'Rp 149.000', isPro: true, activities: [51, 52, 53, 54, 55, 56, 57, 58, 59, 60], highlights: ['Kepemimpinan Nyata', 'Crisis Management'] },
    { id: 6, title: 'Problem Solving Pack', category: 'Problem Solving', description: 'Kasus pelik, alokasi budget, brainstorming kolaboratif.', activityCount: 10, price: 'Rp 99.000', isPro: true, activities: [61, 62, 63, 64, 65, 66, 67, 68, 69, 70], highlights: ['Analisis Mendalam', 'Solusi Strategis'] },
    { id: 7, title: 'Sales Role Play Pack', category: 'Sales & Service', description: 'Handling objection, elevator pitch battle siap pakai.', activityCount: 10, price: 'Rp 149.000', isPro: true, activities: [71, 72, 73, 74, 75, 76, 77, 78, 79, 80], highlights: ['Negosiasi Tajam', 'Closing Ampuh'] },
    { id: 8, title: 'Quiz & Polling Pack', category: 'Quiz & Polling', description: 'Bank soal interaktif penarik antusiasme masa rapat.', activityCount: 10, price: 'Free', isPro: false, activities: [81, 82, 83, 84, 85, 86, 87, 88, 89, 90], highlights: ['Live Polling', 'Seru & Cepat'] },
    { id: 9, title: 'Reflection Pack', category: 'Reflection', description: 'Menutup sesi dengan meaning mendalam dan komitmen aksi.', activityCount: 10, price: 'Rp 49.000', isPro: true, activities: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120], highlights: ['Meaningful Closing', 'Action Plan'] },
    { id: 10, title: 'Special & Travel Games Pack', category: 'Travel & Special', description: 'Pencair kantuk sepanjang jalan di bus wisata atau tour.', activityCount: 12, price: 'Rp 59.000', isPro: true, activities: [121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132], highlights: ['Tour & Bus', 'Acara Spesial'] }
  ];

  const defaultSessions: Session[] = [
    {
      id: 'sess-1',
      userId: 'usr_trainer_002',
      name: 'Rapat Kerja Tahunan 2026',
      date: '2026-06-25',
      context: 'Corporate Gathering',
      audience: 'Manager & Staf Divisi HR',
      participantCount: 45,
      activityIds: [1, 11, 31],
      notes: 'Buka dengan ice breaking fakta, pertengahan beri tepuk fokus.',
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sess-2',
      userId: 'usr_trainer_002',
      name: 'Seminar Motivasi Mahasiswa Baru',
      date: '2026-07-02',
      context: 'MPLS Campus',
      audience: 'Mahasiswa Baru angkatan 2026',
      participantCount: 150,
      activityIds: [2, 13, 112],
      notes: 'Fokus refleksi di penutup panggung.',
      status: 'Berjalan',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const allActivities = generateAll132Activities();

  db.resetData({
    users: [adminUser, trainerUser, mcUser],
    activities: allActivities,
    packs: defaultPacks,
    sessions: defaultSessions,
    savedActivities: [],
    auditLogs: [{
      id: `log_${Date.now()}_seed_reset`,
      action: 'SYSTEM_SEED_RESET',
      details: 'Database berhasil di-reset ulang ke data bawaan lengkap (132 Aktivitas, 10 Paket, 3 Akun).',
      userName: 'Super Admin',
      timestamp: new Date().toISOString()
    }]
  });
}

export function generateAll132Activities(): Activity[] {
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

    // D. Team Building (31 - 40)
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

    // E. Communication (41 - 50)
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

    // F. Leadership (51 - 60)
    { id: 51, name: "Leader Rotation", cat: "Leadership", energy: "High", format: "Offline", tools: ["Tantangan Fisik"], limit: [10, 100], dur: [20, 30], desc: "Pemimpin ditunjuk bergilir setiap 5 menit dalam memandu penyelesaian rintangan." },
    { id: 52, name: "Captain Challenge", cat: "Leadership", energy: "High", format: "Offline", tools: ["Peta Ruangan"], limit: [10, 100], dur: [20, 30], desc: "Satu kapten menyusun strategi delegasi tugas untuk anggotanya menyelesaikan misi rahasia." },
    { id: 53, name: "Crisis Simulation", cat: "Leadership", energy: "High", format: "Offline", tools: ["Lembar Krisis"], limit: [10, 80], dur: [30, 45], desc: "Tim menghadapi skenario bencana bisnis mendadak dan harus merespons taktis." },
    { id: 54, name: "Priority Ranking", cat: "Leadership", energy: "Calm", format: "Offline", tools: ["Daftar Tugas Bisnis"], limit: [10, 100], dur: [15, 25], desc: "Setiap pemimpin berlatih memprioritaskan 15 masalah mendesak di tempat kerja." },
    { id: 55, name: "Delegation Game", cat: "Leadership", energy: "Medium", format: "Offline", tools: ["Matriks Talenta"], limit: [10, 80], dur: [20, 30], desc: "Menugaskan pekerjaan berdasarkan kompetensi khusus individu tim secara klop." },
    { id: 56, name: "Leadership Dilemma", cat: "Leadership", energy: "Calm", format: "Offline", tools: ["Kartu Studi Kasus"], limit: [10, 80], dur: [20, 30], desc: "Memutuskan permasalahan pelik yang menguji moralitas, integritas, dan hasil bisnis." },
    { id: 57, name: "Trust the Leader", cat: "Leadership", energy: "Medium", format: "Offline", tools: ["Tutup Mata"], limit: [10, 80], dur: [15, 25], desc: "Seluruh tim ditutup matanya kecuali ketua, yang harus meneriakkan instruksi jalur." },
    { id: 58, name: "Leaderless Group Discussion", cat: "Leadership", energy: "Calm", format: "Offline", tools: ["Topik Masalah"], limit: [10, 80], dur: [20, 40], desc: "Kelompok menyelesaikan debat krusial tanpa ditunjuk pemimpin baku." },
    { id: 59, name: "Vision Mapping", cat: "Leadership", energy: "Medium", format: "Offline", tools: ["Karton", "Spidol"], limit: [10, 100], dur: [20, 40], desc: "Menvisualisasikan peta target masa depan tim dan rencana peta jalannya." },
    { id: 60, name: "Coaching Practice", cat: "Leadership", energy: "Calm", format: "Offline", tools: ["Panduan GROW"], limit: [6, 60], dur: [30, 45], desc: "Praktik simulasi coaching formal menggunakan kerangka GROW model." },

    // G. Problem Solving (61 - 70)
    { id: 61, name: "Survival Scenario", cat: "Problem Solving", energy: "Calm", format: "Offline", tools: ["Daftar 15 Benda"], limit: [10, 100], dur: [20, 30], desc: "Tim harus memilah dan menilai 5 benda terpenting untuk bertahan hidup di pulau terasing." },
    { id: 62, name: "Root Cause Game", cat: "Problem Solving", energy: "Calm", format: "Offline", tools: ["Metode 5 Whys"], limit: [10, 80], dur: [20, 30], desc: "Menelusuri akar masalah sejati dari kegagalan fiktif menggunakan teknik 5 kali mengapa." },
    { id: 63, name: "Case Solving Race", cat: "Problem Solving", energy: "High", format: "Offline", tools: ["Lembar Kasus Bisnis"], limit: [10, 100], dur: [20, 40], desc: "Mengadu kecepatan antar tim menganalisis masalah korporasi." },
    { id: 64, name: "Limited Budget Challenge", cat: "Problem Solving", energy: "Medium", format: "Offline", tools: ["Rencana Kasus"], limit: [10, 100], dur: [20, 40], desc: "Merancang proposal program bernilai tinggi dengan potongan dana 70%." },
    { id: 65, name: "Broken Process Game", cat: "Problem Solving", energy: "Medium", format: "Offline", tools: ["Alur Flowchart"], limit: [10, 80], dur: [20, 40], desc: "Mencari kemacetan bottleneck dalam diagram proses pengiriman barang." },
    { id: 66, name: "Find the Error", cat: "Problem Solving", energy: "Calm", format: "Offline", tools: ["Laporan Mock"], limit: [5, 80], dur: [10, 20], desc: "Menemukan kesalahan logika tersembunyi berdasar data neraca keuangan." },
    { id: 67, name: "Decision Matrix Game", cat: "Problem Solving", energy: "Calm", format: "Offline", tools: ["Metode Score"], limit: [10, 80], dur: [20, 30], desc: "Menilai opsi ekspansi cabang menggunakan matriks kriteria pembobotan." },
    { id: 68, name: "Resource Allocation", cat: "Problem Solving", energy: "Medium", format: "Offline", tools: ["Kertas Token Kas"], limit: [10, 100], dur: [20, 30], desc: "Menyeimbangkan pembagian staf terbatas ke 4 proyek bersamaan." },
    { id: 69, name: "Mystery Problem", cat: "Problem Solving", energy: "Medium", format: "Offline", tools: ["Amplop Petunjuk"], limit: [10, 100], dur: [30, 45], desc: "Memecahkan misteri prototipe hilang dengan petunjuk acak." },
    { id: 70, name: "Solution Pitch", cat: "Problem Solving", energy: "High", format: "Offline", tools: ["Timer Pitch"], limit: [10, 100], dur: [30, 60], desc: "Tim merancang solusi masalah perkotaan dan mempresentasikannya." },

    // H. Sales & Service (71 - 80)
    { id: 71, name: "Handling Objection Role Play", cat: "Sales & Service", energy: "Medium", format: "Offline", tools: ["Flashcard Keberatan"], limit: [6, 60], dur: [20, 30], desc: "Satu berperan pembeli skeptis pelit, lawan tanding harus meng-handle keberatan harganya." },
    { id: 72, name: "Product Pitch Battle", cat: "Sales & Service", energy: "High", format: "Offline", tools: ["Benda Acak"], limit: [10, 100], dur: [20, 40], desc: "Mengadu kemampuan menjual benda konyol agar bernilai tinggi." },
    { id: 73, name: "Closing Challenge", cat: "Sales & Service", energy: "Medium", format: "Offline", tools: ["Skenario Penjualan"], limit: [6, 60], dur: [20, 30], desc: "Sesi penajaman teknik menutup negosiasi penjualan." },
    { id: 74, name: "Customer Persona Game", cat: "Sales & Service", energy: "Calm", format: "Offline", tools: ["Kartu Persona"], limit: [10, 80], dur: [15, 30], desc: "Merajut tawaran fitur yang paling pas dengan tipe psikologis pembeli." },
    { id: 75, name: "Need Analysis Practice", cat: "Sales & Service", energy: "Calm", format: "Offline", tools: ["Suara Mandiri"], limit: [6, 60], dur: [20, 30], desc: "Hanya boleh bertanya untuk menggali kebutuhan terdalam pelanggan." },
    { id: 76, name: "Customer Complaint Simulation", cat: "Sales & Service", energy: "Medium", format: "Offline", tools: ["Naskah Komplain"], limit: [6, 80], dur: [20, 30], desc: "Menangani keluhan serius kesalahan sistem billing pelanggan." },
    { id: 77, name: "Angry Customer Role Play", cat: "Sales & Service", energy: "Medium", format: "Offline", tools: ["Skenario Emosional"], limit: [6, 80], dur: [20, 30], desc: "Latihan mengelola emosi meredam kemarahan pelanggan secara elegan." },
    { id: 78, name: "Service Recovery Game", cat: "Sales & Service", energy: "Medium", format: "Offline", tools: ["Lembar Dampak"], limit: [10, 100], dur: [20, 40], desc: "Menyusun strategi kompensasi dan maaf pasca kecelakaan layanan." },
    { id: 79, name: "Product Knowledge Quiz", cat: "Sales & Service", energy: "Medium", format: "Offline", tools: ["Kartu Soal"], limit: [10, 500], dur: [10, 20], desc: "Mengadu ketepatan detail deskripsi spek produk baru." },
    { id: 80, name: "Customer Journey Mapping", cat: "Sales & Service", energy: "Calm", format: "Offline", tools: ["Sticky Notes"], limit: [10, 80], dur: [30, 45], desc: "Memetakan titik-titik krusial interaksi pembeli sejak awal." },

    // I. Quiz & Polling (81 - 90)
    { id: 81, name: "Live Quiz", cat: "Quiz & Polling", energy: "High", format: "Offline", tools: ["Aplikasi Kuis"], limit: [10, 1000], dur: [5, 20], desc: "Kuis trivia interaktif cepat bersaing di papan peringkat langsung." },
    { id: 82, name: "True or False", cat: "Quiz & Polling", energy: "Medium", format: "Offline", tools: ["Kartu Merah Hijau"], limit: [10, 1000], dur: [5, 15], desc: "Mengeliminasi peserta di tiap pertanyaan benar atau salah." },
    { id: 83, name: "Fastest Finger", cat: "Quiz & Polling", energy: "High", format: "Offline", tools: ["Smartphone / Bell"], limit: [10, 500], dur: [10, 20], desc: "Menjawab secepat-cepatnya pertanyaan lisan fasilitator dengan bel." },
    { id: 84, name: "Team Quiz Battle", cat: "Quiz & Polling", energy: "High", format: "Offline", tools: ["Papan Skor"], limit: [15, 500], dur: [15, 30], desc: "Cerdas cermat beregu antar divisi materi training." },
    { id: 85, name: "Ranking Quiz", cat: "Quiz & Polling", energy: "Medium", format: "Offline", tools: ["Layar Interaktif"], limit: [10, 500], dur: [10, 20], desc: "Mengurutkan tahapan dari awal sampai akhir secara tepat." },
    { id: 86, name: "Mood Poll", cat: "Quiz & Polling", energy: "Calm", format: "Offline", tools: ["Aplikasi Polling"], limit: [10, 1000], dur: [2, 5], desc: "Survei seketika mengukur keyakinan tim sebelum rapat." },
    { id: 87, name: "Opinion Poll", cat: "Quiz & Polling", energy: "Calm", format: "Offline", tools: ["Aplikasi Polling"], limit: [10, 1000], dur: [3, 10], desc: "Mengumpulkan suara seputar isu transisi kerja kantor." },
    { id: 88, name: "Decision Poll", cat: "Quiz & Polling", energy: "Calm", format: "Offline", tools: ["Aplikasi Keputusan"], limit: [10, 1000], dur: [5, 10], desc: "Memilih secara demokratis program CSR tahunan." },
    { id: 89, name: "Word Cloud Reflection", cat: "Quiz & Polling", energy: "Calm", format: "Online", tools: ["Platform Wordcloud"], limit: [10, 1000], dur: [3, 7], desc: "Membentuk awan kata visual interaktif di proyektor." },
    { id: 90, name: "Q&A Voting", cat: "Quiz & Polling", energy: "Calm", format: "Offline", tools: ["Slido / HP"], limit: [20, 1000], dur: [10, 30], desc: "Mengajukan pertanyaan umum, pertanyaan terpopuler divote." },

    // J. Simulation (91 - 100)
    { id: 91, name: "Customer Service Simulation", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Meja CS"], limit: [6, 80], dur: [20, 40], desc: "Simulasi fisik lengkap melayani komplain pelanggan." },
    { id: 92, name: "Sales Meeting Simulation", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Materi CS"], limit: [6, 60], dur: [20, 40], desc: "Menyimulasikan presentasi formal B2B direktur utama." },
    { id: 93, name: "Conflict Handling Role Play", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Skenario Konflik"], limit: [6, 80], dur: [20, 40], desc: "Menengahi perdebatan tanggung jawab tim." },
    { id: 94, name: "Feedback Conversation", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Form Penilaian"], limit: [6, 60], dur: [20, 30], desc: "Latihan menanggapi bawahan mangkir secara bijaksana." },
    { id: 95, name: "Interview Simulation", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["CV Mock"], limit: [6, 60], dur: [20, 40], desc: "Latihan wawancara penerimaan kerja melatih ketenangan." },
    { id: 96, name: "Negotiation Simulation", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Lembar Deal"], limit: [6, 80], dur: [30, 45], desc: "Latihan tawar-menawar kontrak kerja sama." },
    { id: 97, name: "Crisis Meeting Simulation", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Siaran Pers"], limit: [10, 80], dur: [30, 45], desc: "Skenario rapat tanggap darurat kebocoran data penting." },
    { id: 98, name: "Coaching Session Simulation", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Checklist Coaching"], limit: [6, 60], dur: [30, 45], desc: "Penerapan model bimbingan berkala mingguan 1-on-1." },
    { id: 99, name: "Public Speaking Practice", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Podium"], limit: [5, 50], dur: [20, 60], desc: "Latihan berpidato memotivasi masa dalam rapat umum." },
    { id: 100, name: "Event Handling Simulation", cat: "Simulation & Role Play", energy: "Medium", format: "Offline", tools: ["Radio HT"], limit: [10, 80], dur: [30, 45], desc: "Simulasi menangani kerusuhan pintu masuk konser." },

    // K. Challenge (101 - 110)
    { id: 101, name: "Photo Mission", cat: "Challenge", energy: "High", format: "Offline", tools: ["Kamera HP"], limit: [10, 300], dur: [20, 60], desc: "Misi memotret 5 objek estetik yang mewakili core values tim." },
    { id: 102, name: "Video Challenge", cat: "Challenge", energy: "High", format: "Offline", tools: ["Video Editor HP"], limit: [10, 300], dur: [30, 90], desc: "Membuat video TikTok sapaan kreatif mengenalkan divisi." },
    { id: 103, name: "Scavenger Hunt", cat: "Challenge", energy: "High", format: "Offline", tools: ["Daftar Clue"], limit: [20, 300], dur: [30, 90], desc: "Lomba berburu harta karun petunjuk misterius di taman." },
    { id: 104, name: "Social Media Challenge", cat: "Challenge", energy: "Medium", format: "Hybrid", tools: ["Instagram"], limit: [10, 500], dur: [30, 120], desc: "Berkompetisi menulis utas inspiratif tentang integritas kerja." },
    { id: 105, name: "Creative Pitch Challenge", cat: "Challenge", energy: "High", format: "Offline", tools: ["Karton", "Spidol"], limit: [10, 100], dur: [30, 60], desc: "Tim mendesain logo kaos unik bertema teamwork." },
    { id: 106, name: "Booth Challenge", cat: "Challenge", energy: "High", format: "Offline", tools: ["Kartu Stempel"], limit: [50, 1000], dur: [30, 120], desc: "Melintasi 7 pos tantangan ketangkasan tim." },
    { id: 107, name: "Stamp Mission", cat: "Challenge", energy: "High", format: "Offline", tools: ["Peta Stempel"], limit: [50, 1000], dur: [30, 120], desc: "Mengumpulkan cap validasi dari narasumber penting." },
    { id: 108, name: "Team Mission Card", cat: "Challenge", energy: "High", format: "Offline", tools: ["Amplop Misi"], limit: [10, 300], dur: [20, 60], desc: "Menuntaskan deretan misi kecil pengerjaan kolektif." },
    { id: 109, name: "Creativity Wall", cat: "Challenge", energy: "Medium", format: "Offline", tools: ["Sticky Notes"], limit: [10, 500], dur: [10, 30], desc: "Menempel mural gambar kreatif impian masa depan." },
    { id: 110, name: "Mini Hackathon", cat: "Challenge", energy: "High", format: "Offline", tools: ["Laptop"], limit: [10, 200], dur: [60, 180], desc: "Merajut purwarupa inovatif masalah limbah plastik." },

    // L. Reflection (111 - 120)
    { id: 111, name: "3 Hal yang Saya Pelajari", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Kertas Memo"], limit: [5, 500], dur: [5, 10], desc: "Menulis 3 penemuan berharga dari keseluruhan aktivitas." },
    { id: 112, name: "Satu Komitmen Aksi", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Sticky Notes"], limit: [5, 500], dur: [5, 10], desc: "Menulis satu tindakan realistis dalam 48 jam ke depan." },
    { id: 113, name: "Surat untuk Diri Sendiri", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Amplop"], limit: [5, 200], dur: [10, 15], desc: "Menulis pesan motivasi yang dikirim kembali 6 bulan lagi." },
    { id: 114, name: "Appreciation Circle", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Tanpa Alat"], limit: [5, 80], dur: [10, 20], desc: "Peserta saling melingkar memberi pujian tulus." },
    { id: 115, name: "Before After Reflection", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Form Penilaian"], limit: [10, 500], dur: [5, 10], desc: "Menilai perbedaan tingkat keyakinan sebelum dan sesudah." },
    { id: 116, name: "Insight Wall", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Post It"], limit: [10, 500], dur: [10, 20], desc: "Menyertakan pesan kesimpulan terbesar di dinding galeri." },
    { id: 117, name: "Lesson Learned Sharing", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Tanpa Alat"], limit: [10, 100], dur: [10, 30], desc: "Menceritakan kegagalan awal dan revisi strategi." },
    { id: 118, name: "My Next Step", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Lembar Komitmen"], limit: [5, 500], dur: [5, 10], desc: "Menyusun skema milestone taktis minggu depan." },
    { id: 119, name: "One Word Closing", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Tanpa Alat"], limit: [5, 500], dur: [3, 5], desc: "Meneriakkan berantai satu patah kata perasaan." },
    { id: 120, name: "Commitment Board", cat: "Reflection", energy: "Calm", format: "Offline", tools: ["Papan Besar"], limit: [10, 500], dur: [10, 15], desc: "Menandatangani piagam kesepakatan nilai baru tim." },

    // M. Travel & Special (121 - 132)
    { id: 121, name: "Bus Games", cat: "Travel & Special", energy: "Medium", format: "Offline", tools: ["Tanpa Alat"], limit: [10, 60], dur: [10, 30], desc: "Tebak kata-kata berantai atau nyanyi sambung di bus." },
    { id: 122, name: "Destination Quiz", cat: "Travel & Special", energy: "Medium", format: "Offline", tools: ["Soal Sejarah"], limit: [10, 100], dur: [10, 20], desc: "Teka-teki seru mengenai destinasi liburan." },
    { id: 123, name: "Travel Photo Hunt", cat: "Travel & Special", energy: "High", format: "Offline", tools: ["Kamera HP"], limit: [10, 300], dur: [30, 90], desc: "Berlomba menangkap momen kelucuan warga lokal atau ikon kota." },
    { id: 124, name: "Journey Reflection", cat: "Travel & Special", energy: "Calm", format: "Offline", tools: ["Tanpa Alat"], limit: [5, 100], dur: [10, 20], desc: "Duduk santai di pinggir pantai berbagi pengalaman spiritual." },
    { id: 125, name: "Manasik Quiz", cat: "Travel & Special", energy: "Calm", format: "Offline", tools: ["Panduan Umroh"], limit: [10, 300], dur: [10, 20], desc: "Menguji ketepatan rukun dan doa penting Haji & Umroh." },
    { id: 126, name: "Manasik Simulation", cat: "Travel & Special", energy: "Medium", format: "Offline", tools: ["Kain Ihram"], limit: [10, 300], dur: [30, 90], desc: "Simulasi gerak thawaf, sa'i, dan wukuf dipandu tertib." },
    { id: 127, name: "Islamic Quiz Battle", cat: "Travel & Special", energy: "High", format: "Offline", tools: ["Bel Suara"], limit: [10, 500], dur: [10, 30], desc: "Kompetisi tanya-jawab ceria seputar sirah nabawiyah." },
    { id: 128, name: "Mission Amal", cat: "Travel & Special", energy: "Medium", format: "Offline", tools: ["Bungkus Sedekah"], limit: [10, 500], dur: [30, 120], desc: "Misi sosial membagikan paket nasi gratis di jalanan." },
    { id: 129, name: "Couple Quiz", cat: "Travel & Special", energy: "Medium", format: "Offline", tools: ["Papan Tulis Mini"], limit: [20, 300], dur: [10, 20], desc: "Pengantin menjawab seberapa dalam mengenal pasangan." },
    { id: 130, name: "Family Memory Game", cat: "Travel & Special", energy: "Calm", format: "Offline", tools: ["Foto Lama"], limit: [20, 300], dur: [10, 30], desc: "Menebak masa kecil paman/tante dari foto usang." },
    { id: 131, name: "Wishes Wall", cat: "Travel & Special", energy: "Calm", format: "Offline", tools: ["Spidol Emas"], limit: [20, 500], dur: [10, 30], desc: "Undangan menulis coretan doa restu terbaik pengantin." },
    { id: 132, name: "Guest Interaction Quiz", cat: "Travel & Special", energy: "Medium", format: "Offline", tools: ["Kertas Soal"], limit: [20, 500], dur: [10, 20], desc: "MC melibatkan para tamu undangan tebak-tebakan kenangan seru." }
  ];

  return RAW_ACTIVITIES_LIST.map(raw => ({
    id: raw.id,
    activity_number: `ACT-${String(raw.id).padStart(3, '0')}`,
    activity_name: raw.name,
    category: raw.cat,
    short_description: raw.desc,
    long_description: `${raw.desc} Dirancang secara khusus untuk meningkatkan partisipasi aktif peserta secara terukur, interaktif, dan penuh dengan keceriaan.`,
    objective: `Meningkatkan partisipasi aktif peserta melatih ${raw.cat.toLowerCase()} dan membangun suasana kolaboratif.`,
    main_goal: `Mencapai target sesi lewat media ${raw.cat.toLowerCase()} interaktif.`,
    suitable_for: ["Trainer", "MC / Host", "Fasilitator", "HR / Learning & Development", "Guru / Dosen", "Komunitas", "Event Organizer"],
    suitable_event_filter: ["Corporate Training", "Employee Gathering", "Team Building", "Outbound Kantor", "Seminar Bisnis"],
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
    mc_script: `"Halo rekan-rekan sekalian! Ayo kita rilekskan suasana sejenak melalui game '${raw.name}'. Dengarkan aturan mainnya dan mari kita mulai bersama!"`,
    debrief_questions: [
      "Apa hal terberat yang dirasakan tim saat mencoba menyelaraskan jalannya aktivitas tadi?",
      "Pola komunikasi seperti apa yang terbukti berhasil mempercepat pencapaian tujuan kita?",
      "Bagaimana pelajaran dari aktivitas ini bisa kita bawa langsung ke dalam pekerjaan sehari-hari?"
    ],
    variations: [
      "Versi 5 menit: Hilangkan fase pembagian kelompok, jalankan langsung secara massal.",
      "Versi tanpa alat: Modifikasi rules menggunakan bahasa tubuh murni atau kode suara."
    ],
    risk_notes: "Beberapa peserta mungkin merasa enggan bergerak di ranah publik atau takut salah bertindak.",
    mitigation_tips: "Fasilitator wajib menunjukkan contoh gerakan lucu terlebih dahulu agar mencairkan rasa malu.",
    professional_tips: "Selalu pertahankan senyum lebar, intonasi suara dinamis naik-turun, serta berikan apresiasi hangat.",
    rating: Number((4.5 + (raw.id % 5) * 0.1).toFixed(1)),
    usage_count: 40 + (raw.id * 3) % 150,
    is_free: raw.id <= 30 || raw.id % 4 !== 0,
    estimated_fun_level: 4 + (raw.id % 2),
    estimated_impact_level: 3 + (raw.id % 3),
    illustration_url: `https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&auto=format&fit=crop&q=60`,
    created_by: 'system',
    created_at: new Date().toISOString()
  }));
}
