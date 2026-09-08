import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldAlert, 
  FileText, 
  Lock, 
  Search, 
  Check, 
  Download, 
  Copy, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Printer
} from 'lucide-react';
import { sound } from '../utils/sound';

interface TermsViewProps {
  initialTab?: 'terms' | 'disclaimer' | 'privacy';
  onBack: () => void;
}

export default function TermsView({ initialTab = 'terms', onBack }: TermsViewProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'disclaimer' | 'privacy'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);

  // Sync active tab with initial tab on open
  React.useEffect(() => {
    setActiveTab(initialTab);
    setSearchQuery('');
    setCopied(false);
  }, [initialTab]);

  const handleCopyText = () => {
    sound.playClick();
    const textToCopy = activeTab === 'terms' ? termsText : activeTab === 'disclaimer' ? disclaimerText : privacyText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  // Structured Content for Search & Highlight
  const termsSections = useMemo(() => [
    {
      id: 't1',
      title: '1. Pengantar & Penerimaan Ketentuan',
      content: 'Selamat datang di AKTIPAN. Dengan mengakses, mendaftar, atau menggunakan platform direktori aktivitas interaktif kami (baik versi web, aplikasi, maupun modul SaaS), Anda secara sadar dan tanpa paksaan menyatakan menyetujui untuk terikat oleh seluruh Syarat dan Ketentuan yang tercantum di sini. Jika Anda tidak menyetujui salah satu bagian dari ketentuan ini, Anda dilarang keras menggunakan layanan kami.'
    },
    {
      id: 't2',
      title: '2. Penggunaan Akun & Keamanan',
      content: 'Pengguna wajib memberikan data registrasi yang valid, akurat, dan terbaru. Anda bertanggung jawab penuh atas kerahasiaan kata sandi serta segala bentuk aktivitas yang terjadi di bawah akun Anda. Penyalahgunaan akun untuk spamming, scraping data secara ilegal, merusak server, atau menyebarkan konten bernada SARA dan kebencian akan berakibat pada pemblokiran akun permanen tanpa pengembalian dana (refund).'
    },
    {
      id: 't3',
      title: '3. Lisensi Konten & Hak Cipta',
      content: 'Semua hak kekayaan intelektual atas desain platform, kode program, logo, ilustrasi, dan database aktivitas default AKTIPAN dilindungi oleh undang-undang hak cipta. Pengguna yang membuat aktivitas kustom (Custom Activities) melalui generator AI tetap memiliki hak cipta atas karyanya, namun memberikan lisensi non-eksklusif, bebas royalti, dan berlaku di seluruh dunia kepada AKTIPAN untuk menayangkan, mendistribusikan, dan mempromosikan aktivitas tersebut di direktori publik kami.'
    },
    {
      id: 't4',
      title: '4. Skema Langganan SaaS & Komersial',
      content: 'AKTIPAN menawarkan paket gratis dan paket premium (SaaS Berlangganan). Pembayaran diproses secara aman melalui gerbang pembayaran resmi. Anda dilarang menjual kembali (reselling), membundel ulang, atau mendistribusikan ulang API kunci serta database aktivitas AKTIPAN ke platform eksternal tanpa izin tertulis yang sah dari manajemen kami.'
    },
    {
      id: 't5',
      title: '5. Batasan Tanggung Jawab',
      content: 'AKTIPAN tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari ketidakmampuan Anda menggunakan platform atau kesalahan teknis sementara pada server kami.'
    }
  ], []);

  const disclaimerSections = useMemo(() => [
    {
      id: 'd1',
      title: 'Sangkalan Tanggung Jawab Aktivitas Fisik & Sosial',
      content: 'AKTIPAN adalah platform direktori panduan ice breaking, energizer, dan team building. Segala bentuk aktivitas fisik, lari, lompat, interaksi sosial, atau kontak fisik yang dilakukan oleh peserta acara di lapangan sepenuhnya merupakan keputusan dan risiko mandiri dari Penyelenggara Acara (Event Organizer/User) dan para Peserta. AKTIPAN tidak bertanggung jawab atas cedera fisik, kelelahan medis, atau kerugian material apa pun selama pelaksanaan kegiatan berlangsung.'
    },
    {
      id: 'd2',
      title: 'Sangkalan Output Kecerdasan Buatan (AI Generator)',
      content: 'Fitur pembuatan aktivitas kustom berbasis kecerdasan buatan (AI) menggunakan model pemrosesan bahasa alami pihak ketiga untuk menghasilkan saran teks kreatif. AKTIPAN tidak menjamin akurasi 100%, kesesuaian moral, atau ketiadaan duplikasi dari ide game yang dihasilkan AI tersebut. Pengguna diharapkan melakukan moderasi mandiri sebelum mengaplikasikannya di acara nyata.'
    },
    {
      id: 'd3',
      title: 'Sangkalan Kemitraan Pihak Ketiga',
      content: 'Tautan eksternal, referensi lokasi, atau integrasi dengan API eksternal (seperti Google Maps, audio synthesizer, dll) disediakan sebagai pelengkap kegunaan. Kami tidak memiliki kontrol atas kebijakan privasi atau kestabilan sistem platform eksternal tersebut.'
    }
  ], []);

  const privacySections = useMemo(() => [
    {
      id: 'p1',
      title: '1. Informasi yang Kami Kumpulkan',
      content: 'Kami mengumpulkan data pribadi terbatas berupa alamat email (saat registrasi), nama profil, riwayat aktivitas yang Anda simpan di koleksi, statistik permainan Live Arena lokal, serta log interaksi dasar untuk mengoptimalkan pengalaman penggunaan aplikasi.'
    },
    {
      id: 'p2',
      title: '2. Penggunaan Data Anda',
      content: 'Data yang terkumpul murni digunakan untuk mempersonalisasi rekomendasi game ice-breaking, mengelola transaksi paket premium, memfasilitasi sesi multiplayer Live Arena, serta mengirimkan info penting berkala mengenai pembaruan platform.'
    },
    {
      id: 'p3',
      title: '3. Kebijakan Kuki & Keamanan',
      content: 'Kami menggunakan kuki (cookies) browser dan teknologi penyimpanan lokal (localStorage) untuk mempertahankan sesi login Anda dan menyimpan preferensi tema atau suara agar pengalaman berselancar tetap mulus. Kami menerapkan enkripsi SSL/TLS bersertifikat tinggi untuk mencegah kebocoran data.'
    },
    {
      id: 'p4',
      title: '4. Tidak Ada Penjualan Data',
      content: 'AKTIPAN menjamin bahwa kami tidak akan pernah menjual, menyewakan, atau membagikan database pribadi pengguna kami kepada agensi periklanan atau pihak ketiga lainnya untuk tujuan komersial sepihak.'
    }
  ], []);

  // Concatenated flat texts for copying
  const termsText = termsSections.map(s => `${s.title}\n${s.content}`).join('\n\n');
  const disclaimerText = disclaimerSections.map(s => `${s.title}\n${s.content}`).join('\n\n');
  const privacyText = privacySections.map(s => `${s.title}\n${s.content}`).join('\n\n');

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    const sections = activeTab === 'terms' 
      ? termsSections 
      : activeTab === 'disclaimer' 
      ? disclaimerSections 
      : privacySections;

    if (!searchQuery.trim()) return sections;

    const query = searchQuery.toLowerCase();
    return sections.filter(
      s => s.title.toLowerCase().includes(query) || s.content.toLowerCase().includes(query)
    );
  }, [activeTab, searchQuery, termsSections, disclaimerSections, privacySections]);

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() 
            ? <mark key={i} className="bg-amber-100 text-slate-900 px-0.5 rounded font-medium">{part}</mark> 
            : part
        )}
      </span>
    );
  };

  return (
    <div id="terms-page-container" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 relative min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-200/60 flex flex-col overflow-hidden text-slate-800"
      >
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50/50 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-2xl text-orange-600">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
                Informasi Hukum & Kebijakan
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Transparansi, keamanan, dan kepatuhan bersama AKTIPAN
              </p>
            </div>
          </div>
          <button 
            onClick={() => { sound.playClick(); onBack(); }}
            className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer text-sm font-bold flex items-center gap-2 shadow-sm"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Kembali
          </button>
        </div>

        {/* Quick Stats Banner */}
        <div className="bg-indigo-600 text-indigo-100 text-xs px-6 sm:px-8 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold">Pembaharuan Terakhir: 24 Juni 2026</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold tracking-wide bg-indigo-700/80 px-2.5 py-1 rounded text-white">
            <span>Versi Dokumen: 2.1 LTS</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-100 px-6 sm:px-8 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-4">
          <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => { sound.playSwoosh(); setActiveTab('terms'); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'terms'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="h-4 w-4" />
              Syarat & Ketentuan
            </button>
            <button
              onClick={() => { sound.playSwoosh(); setActiveTab('disclaimer'); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'disclaimer'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              Sangkalan (Disclaimer)
            </button>
            <button
              onClick={() => { sound.playSwoosh(); setActiveTab('privacy'); setSearchQuery(''); }}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'privacy'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lock className="h-4 w-4" />
              Privasi
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Actions */}
            <button 
              onClick={handlePrint}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
              title="Cetak Dokumen"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button 
              onClick={handleCopyText}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer relative"
              title="Salin ke Clipboard"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Search Bar inside legal text */}
        <div className="px-6 sm:px-8 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder={`Cari dalam dokumen ${activeTab === 'terms' ? 'Syarat Ketentuan' : activeTab === 'disclaimer' ? 'Sangkalan' : 'Kebijakan Privasi'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm border-0 outline-none ring-0 focus:ring-0 text-slate-800 placeholder-slate-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-xs text-indigo-500 hover:underline font-bold"
            >
              Bersihkan
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white custom-scrollbar min-h-[40vh]">
          {activeTab === 'terms' && (
            <div className="mb-6 pb-6 border-b border-slate-100 flex items-start gap-4">
              <div className="p-2.5 bg-slate-100 rounded-xl shrink-0"><FileText className="h-6 w-6 text-slate-600" /></div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Syarat dan Ketentuan Penggunaan Layanan (Terms of Service)</h3>
                <p className="text-sm text-slate-500">Pembaruan Efektif: 12 Januari 2026. Harap baca secara saksama sebelum menggunakan platform AKTIPAN.</p>
              </div>
            </div>
          )}
          {activeTab === 'disclaimer' && (
            <div className="mb-6 pb-6 border-b border-slate-100 flex items-start gap-4">
              <div className="p-2.5 bg-slate-100 rounded-xl shrink-0"><ShieldAlert className="h-6 w-6 text-slate-600" /></div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Pernyataan Sangkalan (Legal Disclaimer)</h3>
                <p className="text-sm text-slate-500">Batasan tanggung jawab atas cedera, aktivitas lapangan, dan output AI.</p>
              </div>
            </div>
          )}
          {activeTab === 'privacy' && (
            <div className="mb-6 pb-6 border-b border-slate-100 flex items-start gap-4">
              <div className="p-2.5 bg-slate-100 rounded-xl shrink-0"><Lock className="h-6 w-6 text-slate-600" /></div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Kebijakan Privasi Data (Privacy Policy)</h3>
                <p className="text-sm text-slate-500">Bagaimana kami mengumpulkan, memproses, dan melindungi data personal serta riwayat aktivitas Anda.</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {filteredSections.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm flex flex-col items-center">
                <HelpCircle className="h-8 w-8 text-slate-300 mb-3" />
                Tidak ditemukan hasil untuk "{searchQuery}"
              </div>
            ) : (
              filteredSections.map((section, idx) => (
                <motion.div 
                  key={section.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-2.5">
                    <ChevronRight className="h-4.5 w-4.5 text-orange-500 shrink-0" />
                    {highlightText(section.title, searchQuery)}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed pl-6 text-justify">
                    {highlightText(section.content, searchQuery)}
                  </p>
                </motion.div>
              ))
            )}

            {/* Informational Warning Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 text-amber-900 mt-8">
              <ShieldAlert className="h-6 w-6 shrink-0 mt-0.5" />
              <div className="text-sm leading-relaxed">
                <p className="font-bold">Pemberitahuan Kepatuhan Acara</p>
                <p className="mt-1">
                  AKTIPAN berkomitmen menyediakan panduan ice-breaking terbaik. Sebagai penyelenggara, Anda disarankan untuk memeriksa kesiapan kesehatan fisik seluruh audiens sebelum melangsungkan sesi yang bertanda energi tinggi.
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer Consent & Action */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={hasAgreed} 
                onChange={(e) => {
                  sound.playClick();
                  setHasAgreed(e.target.checked);
                }}
                className="rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5 transition-colors cursor-pointer"
              />
              <span className="text-sm text-slate-600 font-medium">
                Saya memahami & menyetujui dokumen {activeTab === 'terms' ? 'Syarat & Ketentuan' : activeTab === 'disclaimer' ? 'Sangkalan' : 'Kebijakan Privasi'} AKTIPAN.
              </span>
            </label>

            <button
              onClick={() => {
                sound.playSuccess();
                onBack();
              }}
              disabled={!hasAgreed}
              className={`w-full sm:w-auto px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm ${
                hasAgreed 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-95' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="h-4 w-4" />
              Setujui & Lanjutkan
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
