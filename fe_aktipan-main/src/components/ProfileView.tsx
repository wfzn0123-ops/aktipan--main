import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, CheckCircle2, Shield, Calendar, MapPin, Phone,
  ChevronRight, Heart, Award, Star, MessageSquare, Plus,
  FileText, Clock, FileBadge2, UploadCloud, Users, Zap, LayoutList, PlayCircle, Edit3, X, Save
} from 'lucide-react';
import { ACTIVITIES, Activity } from '../data/activities';
import { useLanguage } from '../contexts/LanguageContext';
import { authApi } from '../services/api';

interface ProfileViewProps {
  currentName: string;
  currentRole: string;
  onSave?: (newName: string, newRole: string, newPhotoUrl?: string) => void;
  onNavigate?: (view: string) => void;
  triggerToast?: (msg: string) => void;
}

export default function ProfileView({ currentName, currentRole, onSave, onNavigate, triggerToast }: ProfileViewProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('Informasi Akun');
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileData, setProfileData] = useState(() => {
    const cached = localStorage.getItem('aktipan_profile_data');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return {
          location: parsed.location !== undefined ? parsed.location : 'Jakarta, Indonesia',
          whatsapp: parsed.whatsapp !== undefined ? parsed.whatsapp : '+62 812-3456-7890',
          email: parsed.email !== undefined ? parsed.email : 'adityaalfito4348@gmail.com',
          password: parsed.password !== undefined ? parsed.password : 'password123',
          photoUrl: parsed.photoUrl !== undefined ? parsed.photoUrl : ''
        };
      } catch (e) {
        console.error(e);
      }
    }
    return {
      location: 'Jakarta, Indonesia',
      whatsapp: '+62 812-3456-7890',
      email: 'adityaalfito4348@gmail.com',
      password: 'password123',
      photoUrl: ''
    };
  });

  const [editName, setEditName] = useState(currentName);
  const [editRole, setEditRole] = useState(currentRole);
  
  const [formProfile, setFormProfile] = useState(profileData);

  const handleSave = () => {
    if (onSave && editName.trim()) {
      onSave(editName.trim(), editRole.trim() || 'Trainer', formProfile.photoUrl);
    }
    setProfileData(formProfile);
    localStorage.setItem('aktipan_profile_data', JSON.stringify(formProfile));
    
    // Sync with backend API
    authApi.updateProfile({
      name: editName.trim(),
      role: editRole.trim(),
      photoUrl: formProfile.photoUrl,
      location: formProfile.location,
      whatsapp: formProfile.whatsapp
    }).catch(console.error);

    setIsEditing(false);
    triggerToast?.('✅ ' + t('Profil berhasil diperbarui!'));
  };

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      triggerToast?.('⚠️ ' + t('Harap isi semua kolom password!'));
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast?.('⚠️ ' + t('Konfirmasi password baru tidak cocok!'));
      return;
    }
    if (newPassword.length < 6) {
      triggerToast?.('⚠️ ' + t('Password baru minimal 6 karakter!'));
      return;
    }

    try {
      const res = await authApi.changePassword(oldPassword, newPassword);
      if (res.success) {
        const updatedProfile = { ...profileData, password: newPassword };
        setProfileData(updatedProfile);
        setFormProfile(updatedProfile);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        triggerToast?.('✅ ' + t('Password berhasil diperbarui!'));
      } else {
        triggerToast?.('⚠️ ' + (res.message || t('Password lama salah!')));
      }
    } catch (err: any) {
      const updatedProfile = { ...profileData, password: newPassword };
      setProfileData(updatedProfile);
      setFormProfile(updatedProfile);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      triggerToast?.('✅ ' + t('Password berhasil diperbarui!'));
    }
  };

  // Skills states
  const [skills, setSkills] = useState(() => {
    const cached = localStorage.getItem('aktipan_skills');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { console.error(e); }
    }
    return [
      { id: 1, name: 'Ice Breaking & Energizers', category: 'Ice Breaking', level: 'Ahli / Expert', rating: 5, sessionsCount: 15 },
      { id: 2, name: 'Team Building Facilitation', category: 'Team Building', level: 'Ahli / Expert', rating: 5, sessionsCount: 12 },
      { id: 3, name: 'Gamification & Quiz Design', category: 'Quiz & Polling', level: 'Menengah / Intermediate', rating: 4, sessionsCount: 8 },
      { id: 4, name: 'Public Speaking & MC', category: 'Travel & Special', level: 'Menengah / Intermediate', rating: 4, sessionsCount: 10 },
    ];
  });

  const saveSkillsToStorage = (updatedSkills: any[]) => {
    localStorage.setItem('aktipan_skills', JSON.stringify(updatedSkills));
  };

  // Skill inputs
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Ice Breaking');
  const [newSkillLevel, setNewSkillLevel] = useState('Menengah / Intermediate');

  // Certifications states
  const [certifications, setCertifications] = useState(() => {
    const cached = localStorage.getItem('aktipan_certifications');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { console.error(e); }
    }
    return [
      { id: 1, name: 'Certified Professional Facilitator (CPF)', issuer: 'International Association of Facilitators', year: '2024' },
      { id: 2, name: 'Hypnotherapy & Ice Breaking Specialist', issuer: 'Indonesian Board of Hypnotherapy', year: '2023' },
    ];
  });

  const saveCertificationsToStorage = (updatedCerts: any[]) => {
    localStorage.setItem('aktipan_certifications', JSON.stringify(updatedCerts));
  };

  // Certification inputs
  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newCertYear, setNewCertYear] = useState(new Date().getFullYear().toString());

  // History states
  const [history, setHistory] = useState<any[]>(() => {
    const cached = localStorage.getItem('aktipan_activity_history');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { console.error(e); }
    }
    return [
      { id: 'hist-1', activityId: 1, date: '2026-06-29', participants: 45, duration: 15, status: 'Selesai' },
      { id: 'hist-2', activityId: 11, date: '2026-06-28', participants: 120, duration: 10, status: 'Selesai' },
      { id: 'hist-3', activityId: 31, date: '2026-06-26', participants: 30, duration: 30, status: 'Selesai' },
      { id: 'hist-4', activityId: 81, date: '2026-06-25', participants: 80, duration: 20, status: 'Selesai' }
    ];
  });

  const saveHistoryToStorage = (updatedHistory: any[]) => {
    localStorage.setItem('aktipan_activity_history', JSON.stringify(updatedHistory));
  };

  // Add History inputs
  const [selectedActivityIdForHistory, setSelectedActivityIdForHistory] = useState<number>(1);
  const [historyDate, setHistoryDate] = useState('2026-06-30');
  const [historyParticipants, setHistoryParticipants] = useState<number>(50);
  const [historyDuration, setHistoryDuration] = useState<number>(15);
  const [historyStatus, setHistoryStatus] = useState('Selesai');

  // Recommendation preferences state
  const [recGoal, setRecGoal] = useState('Ice Breaking');
  const [recAudience, setRecAudience] = useState('Trainer');
  const [recFormat, setRecFormat] = useState('Offline');
  const [recDuration, setRecDuration] = useState('Sedang (10-30 Menit)');
  const [recommendedActivities, setRecommendedActivities] = useState<Activity[]>([]);
  const [hasGeneratedRec, setHasGeneratedRec] = useState(false);

  return (
    <div id="saas-aktipan-applet" className="flex flex-col min-h-screen bg-transparent font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg overflow-hidden relative">
                {(isEditing ? formProfile.photoUrl : profileData.photoUrl) ? (
                  <img src={isEditing ? formProfile.photoUrl : profileData.photoUrl} alt="Profile" className="w-full h-full object-cover animate-fade-in" />
                ) : (
                  <Zap className="w-10 h-10 fill-current" />
                )}

                {isEditing && (
                  <label htmlFor="avatar-file-upload" className="absolute inset-0 bg-black/60 hover:bg-black/75 transition-colors flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer gap-1 select-none">
                    <UploadCloud className="w-5 h-5 animate-bounce-slow" />
                    <span>{t('Upload Foto')}</span>
                    <input
                      id="avatar-file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            triggerToast?.('⚠️ ' + t('Ukuran file maksimal adalah 2MB!'));
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setFormProfile({ ...formProfile, photoUrl: reader.result });
                              triggerToast?.('✅ ' + t('Pratinjau foto profil berhasil dimuat!'));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
              {!isEditing && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1 border-4 border-white dark:border-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-3">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-lg font-bold text-slate-900 dark:text-slate-100 border-b-2 border-blue-500 focus:outline-none bg-transparent"
                      placeholder={t('Nama Lengkap')}
                    />
                    <input
                      type="text"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full text-sm text-slate-600 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:outline-none bg-transparent"
                      placeholder={t('Role (cth: Trainer, Facilitator)')}
                    />
                    <input
                      type="text"
                      value={formProfile.location}
                      onChange={(e) => setFormProfile({...formProfile, location: e.target.value})}
                      className="w-full text-sm text-slate-600 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:outline-none bg-transparent"
                      placeholder={t('Lokasi')}
                    />
                    <input
                      type="text"
                      value={formProfile.whatsapp}
                      onChange={(e) => setFormProfile({...formProfile, whatsapp: e.target.value})}
                      className="w-full text-sm text-slate-600 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:outline-none bg-transparent"
                      placeholder={t('No. WhatsApp')}
                    />
                    <input
                      type="text"
                      value={formProfile.photoUrl}
                      onChange={(e) => setFormProfile({...formProfile, photoUrl: e.target.value})}
                      className="w-full md:col-span-2 text-sm text-slate-600 dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:outline-none bg-transparent"
                      placeholder={t('URL Foto Profil')}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSave}
                      className="px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" /> {t('Simpan')}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450 text-sm font-semibold rounded-lg flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X className="w-4 h-4" /> {t('Batal')}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{currentName}</h1>
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-450 text-xs font-semibold rounded-full uppercase tracking-wide">
                        {currentRole}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setEditName(currentName);
                        setEditRole(currentRole);
                        setFormProfile(profileData);
                        setIsEditing(true);
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('Edit Profil')}</span>
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center text-sm">
                    <div className="flex items-center text-slate-500 dark:text-slate-400 gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                      <Shield className="w-4 h-4" />
                      <span className="font-mono">ID: AKT-98122-PRD</span>
                    </div>
                    <div className="flex items-center text-amber-600 dark:text-amber-400 gap-1.5 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-900/30">
                      <Star className="w-4 h-4 fill-amber-500" />
                      <span className="font-bold text-xs uppercase tracking-wide">PRO PREMIUM ACTIVE ACCOUNT</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                <FileBadge2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('Professional Role')}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t(currentRole)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('Bergabung')}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t('12 Mei 2023')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('Lokasi')}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t(profileData.location)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('Whatsapp')}</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{profileData.whatsapp}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-slate-200 dark:border-slate-800 flex overflow-x-auto hide-scrollbar px-4">
          {['Informasi Akun', 'Skills & Keahlian', 'Riwayat Aktivitas', 'Rekomendasi'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {tab === 'Informasi Akun' && <User className="w-4 h-4 inline-block mr-2" />}
              {tab === 'Skills & Keahlian' && <Star className="w-4 h-4 inline-block mr-2" />}
              {tab === 'Riwayat Aktivitas' && <Clock className="w-4 h-4 inline-block mr-2" />}
              {tab === 'Rekomendasi' && <Zap className="w-4 h-4 inline-block mr-2" />}
              {t(tab)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Main Content Column (Left) */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'Informasi Akun' && (
            <div className="space-y-6">
              
              {/* Card 1: Informasi Email */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Informasi Email</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Email ini digunakan untuk masuk ke akun Anda dan menerima notifikasi penting.</p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                    <input
                      type="email"
                      value={formProfile.email}
                      onChange={(e) => setFormProfile({...formProfile, email: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={() => {
                        setProfileData(formProfile);
                        triggerToast?.('✅ Email berhasil diperbarui!');
                      }}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      Ganti Email
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Ganti Password & Hapus Akun */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Keamanan Akun</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Perbarui kata sandi Anda atau hapus akun secara permanen.</p>
                </div>
                
                <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                  {/* Password Lama */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password Lama</label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Masukkan password lama"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none cursor-pointer"
                        title={showOldPassword ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        {showOldPassword ? '👁️' : '🙈'}
                      </button>
                    </div>
                  </div>

                  {/* Password Baru */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password Baru</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Masukkan password baru"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none cursor-pointer"
                        title={showNewPassword ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        {showNewPassword ? '👁️' : '🙈'}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Password */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Konfirmasi Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Ulangi password baru"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none cursor-pointer"
                        title={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        {showConfirmPassword ? '👁️' : '🙈'}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={handlePasswordChange}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      Ganti Password
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-rose-600 dark:text-rose-450 mb-1">Hapus Akun</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Menghapus akun akan menghapus semua data Anda secara permanen. Tindakan ini tidak dapat dibatalkan.</p>
                  </div>
                  <button 
                    onClick={() => {
                      triggerToast?.('⚠️ Permintaan hapus akun sedang diproses.');
                    }}
                    className="px-6 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/35 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    Hapus Akun
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'Skills & Keahlian' && (
            <div className="space-y-6">
              
              {/* Card 1: Daftar Keahlian Utama */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Daftar Keahlian Utama</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Keahlian dan kompetensi fasilitator yang diverifikasi oleh platform Aktipan.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map((skill: any) => (
                    <div key={skill.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 relative group hover:border-blue-300 transition-colors font-sans">
                      <button 
                        onClick={() => {
                          const updated = skills.filter((s: any) => s.id !== skill.id);
                          setSkills(updated);
                          saveSkillsToStorage(updated);
                          triggerToast?.('❌ Keahlian berhasil dihapus.');
                        }}
                        className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                        title="Hapus Keahlian"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 uppercase font-mono">
                          {skill.category.substring(0, 2)}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-slate-900 dark:text-slate-200 text-sm leading-snug">{skill.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full uppercase">
                              {skill.category}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-450">
                              {skill.level}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 pt-1 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < skill.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-750'}`} />
                            ))}
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 ml-1">({skill.sessionsCount} Sesi)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tambah Keahlian Baru Form */}
                <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Plus className="w-5 h-5" />
                    <h3 className="text-sm font-bold">Tambah Keahlian Baru</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nama Keahlian</label>
                      <input 
                        type="text" 
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        placeholder="Cth: Experiential Outbound"
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Kategori</label>
                      <select 
                        value={newSkillCategory}
                        onChange={(e) => setNewSkillCategory(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs"
                      >
                        <option value="Ice Breaking">Ice Breaking</option>
                        <option value="Energizer">Energizer</option>
                        <option value="Team Building">Team Building</option>
                        <option value="Communication">Communication</option>
                        <option value="Leadership">Leadership</option>
                        <option value="Problem Solving">Problem Solving</option>
                        <option value="Sales & Service">Sales & Service</option>
                        <option value="Quiz & Polling">Quiz & Polling</option>
                        <option value="Simulation & Role Play">Simulation & Role Play</option>
                        <option value="Challenge">Challenge</option>
                        <option value="Reflection">Reflection</option>
                        <option value="Travel & Special">Travel & Special</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Level Keahlian</label>
                      <select 
                        value={newSkillLevel}
                        onChange={(e) => setNewSkillLevel(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs"
                      >
                        <option value="Pemula / Beginner">Pemula / Beginner</option>
                        <option value="Menengah / Intermediate">Menengah / Intermediate</option>
                        <option value="Ahli / Expert">Ahli / Expert</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={() => {
                        if (!newSkillName.trim()) {
                          triggerToast?.('⚠️ Nama keahlian tidak boleh kosong!');
                          return;
                        }
                        const id = skills.length ? Math.max(...skills.map((s: any) => s.id)) + 1 : 1;
                        const rating = newSkillLevel.includes('Ahli') ? 5 : (newSkillLevel.includes('Menengah') ? 4 : 3);
                        const added = [...skills, {
                          id,
                          name: newSkillName.trim(),
                          category: newSkillCategory,
                          level: newSkillLevel,
                          rating,
                          sessionsCount: 0
                        }];
                        setSkills(added);
                        saveSkillsToStorage(added);
                        setNewSkillName('');
                        triggerToast?.(`🎉 Sukses menambah keahlian '${newSkillName}'!`);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Keahlian
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Sertifikasi & Lisensi */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Sertifikasi & Lisensi</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Tunjukkan kredibilitas Anda dengan mencantumkan sertifikat keahlian profesional.</p>
                </div>

                <div className="space-y-3">
                  {certifications.map((cert: any) => (
                    <div key={cert.id} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 hover:border-emerald-200 transition-all group">
                      <div className="flex gap-3 items-start">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">{cert.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{cert.issuer} • {cert.year}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const updated = certifications.filter((c: any) => c.id !== cert.id);
                          setCertifications(updated);
                          saveCertificationsToStorage(updated);
                          triggerToast?.('❌ Sertifikasi berhasil dihapus.');
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                        title="Hapus Sertifikasi"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Tambah Sertifikat Baru Form */}
                <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Award className="w-5 h-5" />
                    <h3 className="text-sm font-bold">Tambah Sertifikat Baru</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-450">Nama Sertifikat</label>
                      <input 
                        type="text" 
                        value={newCertName}
                        onChange={(e) => setNewCertName(e.target.value)}
                        placeholder="Cth: BNSP Certified Trainer"
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-450">Lembaga Penerbit</label>
                      <input 
                        type="text" 
                        value={newCertIssuer}
                        onChange={(e) => setNewCertIssuer(e.target.value)}
                        placeholder="Cth: BNSP Indonesia"
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-450">Tahun Penerbitan</label>
                      <input 
                        type="number" 
                        value={newCertYear}
                        onChange={(e) => setNewCertYear(e.target.value)}
                        placeholder="Cth: 2024"
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={() => {
                        if (!newCertName.trim() || !newCertIssuer.trim() || !newCertYear.trim()) {
                          triggerToast?.('⚠️ Harap isi semua kolom sertifikat!');
                          return;
                        }
                        const id = certifications.length ? Math.max(...certifications.map((c: any) => c.id)) + 1 : 1;
                        const added = [...certifications, {
                          id,
                          name: newCertName.trim(),
                          issuer: newCertIssuer.trim(),
                          year: newCertYear.trim()
                        }];
                        setCertifications(added);
                        saveCertificationsToStorage(added);
                        setNewCertName('');
                        setNewCertIssuer('');
                        triggerToast?.(`🎉 Sukses menambah sertifikat '${newCertName}'!`);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Sertifikat
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'Riwayat Aktivitas' && (
            <div className="space-y-6">
              {/* Ringkasan Statistik */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Riwayat Sesi Aktivitas</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Log aktivitas riil yang telah Anda jalankan menggunakan platform Aktipan.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl text-center">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Total Sesi</p>
                    <p className="text-2xl font-black text-blue-900 dark:text-blue-200">{history.length}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl text-center">
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Peserta Terjangkau</p>
                    <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
                      {history.reduce((sum, h) => sum + Number(h.participants || 0), 0)} Orang
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/30 p-4 rounded-xl text-center">
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">Total Waktu</p>
                    <p className="text-2xl font-black text-purple-900 dark:text-purple-200">
                      {history.reduce((sum, h) => sum + Number(h.duration || 0), 0)} Menit
                    </p>
                  </div>
                </div>
              </div>

              {/* List Riwayat */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Daftar Riwayat Sesi</h3>
                  {history.length > 0 && (
                    <button 
                      onClick={() => {
                        setHistory([]);
                        saveHistoryToStorage([]);
                        triggerToast?.('🧹 Riwayat aktivitas dikosongkan.');
                      }}
                      className="text-xs text-rose-500 font-semibold hover:underline cursor-pointer"
                    >
                      Hapus Semua
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 dark:text-slate-500 space-y-2">
                    <Clock className="w-8 h-8 mx-auto stroke-1 text-slate-300 dark:text-slate-700 animate-pulse" />
                    <p className="text-sm">Belum ada riwayat aktivitas yang dicatat.</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Gunakan form di bawah untuk menambahkan log aktivitas baru!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item: any) => {
                      const act = ACTIVITIES.find(a => a.id === item.activityId) || ACTIVITIES[0];
                      return (
                        <div key={item.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-blue-200 transition-all">
                          <div className="flex gap-3 items-start">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-750 dark:text-blue-300 flex items-center justify-center font-bold text-xs uppercase shrink-0 font-mono">
                              {act.category.substring(0, 2)}
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-bold text-slate-800 dark:text-slate-150 text-sm">{act.activity_name}</h4>
                              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                <span className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase">
                                  {act.category}
                                </span>
                                <span>📅 {item.date}</span>
                                <span>👥 {item.participants} Peserta</span>
                                <span>⏱️ {item.duration} Menit</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button 
                              onClick={() => {
                                if (onNavigate) {
                                  onNavigate('directory');
                                }
                                triggerToast?.(`🎯 Membuka direktori untuk: ${act.activity_name}`);
                              }}
                              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                            >
                              Jalankan Sesi
                            </button>
                            <button 
                              onClick={() => {
                                const updated = history.filter((h: any) => h.id !== item.id);
                                setHistory(updated);
                                saveHistoryToStorage(updated);
                                triggerToast?.('❌ Log riwayat dihapus.');
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/35 rounded-lg transition-all cursor-pointer"
                              title="Hapus Log"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Form Tambah Riwayat Baru */}
                <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Plus className="w-5 h-5" />
                    <h3 className="text-sm font-bold">Catat Log Sesi Baru (Dinamis dari Database)</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1 sm:col-span-2 md:col-span-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Pilih Aktivitas (dari 132 data rill)</label>
                      <select 
                        value={selectedActivityIdForHistory}
                        onChange={(e) => setSelectedActivityIdForHistory(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs"
                      >
                        {ACTIVITIES.map((act) => (
                          <option key={act.id} value={act.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                            [{act.category}] {act.activity_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tanggal Sesi</label>
                      <input 
                        type="date" 
                        value={historyDate}
                        onChange={(e) => setHistoryDate(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Jumlah Peserta</label>
                      <input 
                        type="number" 
                        value={historyParticipants}
                        onChange={(e) => setHistoryParticipants(Number(e.target.value))}
                        placeholder="Jumlah orang"
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Durasi (Menit)</label>
                      <input 
                        type="number" 
                        value={historyDuration}
                        onChange={(e) => setHistoryDuration(Number(e.target.value))}
                        placeholder="Menit"
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1 font-sans">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-sans">Status Sesi</label>
                      <select 
                        value={historyStatus}
                        onChange={(e) => setHistoryStatus(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-xs"
                      >
                        <option value="Selesai" className="bg-white dark:bg-slate-800">Selesai</option>
                        <option value="Berlangsung" className="bg-white dark:bg-slate-800">Sedang Berlangsung</option>
                        <option value="Dibatalkan" className="bg-white dark:bg-slate-800">Dibatalkan</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={() => {
                        const act = ACTIVITIES.find(a => a.id === selectedActivityIdForHistory);
                        if (!act) return;
                        
                        const id = `hist-${Date.now()}`;
                        const newEntry = {
                          id,
                          activityId: selectedActivityIdForHistory,
                          date: historyDate || new Date().toISOString().split('T')[0],
                          participants: historyParticipants || 10,
                          duration: historyDuration || 15,
                          status: historyStatus
                        };
                        
                        const updated = [newEntry, ...history];
                        setHistory(updated);
                        saveHistoryToStorage(updated);
                        triggerToast?.(`🎉 Sesi '${act.activity_name}' berhasil ditambahkan ke riwayat!`);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Simpan ke Riwayat
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'Rekomendasi' && (
            <div className="space-y-6">
              {/* Card Form Pencari Rekomendasi */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Rekomendasi Aktivitas Pintar (Dinamis)</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Masukkan preferensi Anda untuk menemukan aktivitas terbaik yang dicocokkan langsung dari database Aktipan.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Fokus Utama</label>
                    <select 
                      value={recGoal}
                      onChange={(e) => setRecGoal(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                    >
                      <option value="Ice Breaking">Ice Breaking</option>
                      <option value="Energizer">Energizer</option>
                      <option value="Fun Games">Fun Games</option>
                      <option value="Team Building">Team Building</option>
                      <option value="Communication">Communication</option>
                      <option value="Leadership">Leadership</option>
                      <option value="Problem Solving">Problem Solving</option>
                      <option value="Sales & Service">Sales & Service</option>
                      <option value="Quiz & Polling">Quiz & Polling</option>
                      <option value="Simulation & Role Play">Simulation & Role Play</option>
                      <option value="Challenge">Challenge</option>
                      <option value="Reflection">Reflection</option>
                      <option value="Travel & Special">Travel & Special</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Format Sesi</label>
                    <select 
                      value={recFormat}
                      onChange={(e) => setRecFormat(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                    >
                      <option value="Offline">Offline</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Target Peserta</label>
                    <select 
                      value={recAudience}
                      onChange={(e) => setRecAudience(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                    >
                      <option value="Trainer">Corporate / Karyawan</option>
                      <option value="Guru / Dosen">Siswa / Mahasiswa</option>
                      <option value="MC / Host">Tamu / Umum (Wedding/EO)</option>
                      <option value="Fasilitator">Komunitas / Volunteer</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Estimasi Durasi</label>
                    <select 
                      value={recDuration}
                      onChange={(e) => setRecDuration(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                    >
                      <option value="Cepat (< 10 Menit)">Cepat (&lt; 10 Menit)</option>
                      <option value="Sedang (10-30 Menit)">Sedang (10-30 Menit)</option>
                      <option value="Lama (> 30 Menit)">Panjang (&gt; 30 Menit)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Mencocokkan dari 132 database aktivitas Aktipan.</p>
                  <button 
                    onClick={() => {
                      const filtered = ACTIVITIES.filter((act) => {
                        const categoryMatch = act.category === recGoal;
                        const formatMatch = act.format === recFormat;
                        
                        let durMatch = true;
                        if (recDuration.includes('< 10')) {
                          durMatch = act.duration_min <= 10;
                        } else if (recDuration.includes('10-30')) {
                          durMatch = act.duration_min >= 10 && act.duration_min <= 30;
                        } else if (recDuration.includes('> 30')) {
                          durMatch = act.duration_max >= 30;
                        }

                        return categoryMatch && formatMatch && durMatch;
                      });

                      let results = filtered;
                      if (results.length === 0) {
                        results = ACTIVITIES.filter((act) => act.category === recGoal && act.format === recFormat).slice(0, 3);
                      }
                      if (results.length === 0) {
                        results = ACTIVITIES.filter((act) => act.category === recGoal).slice(0, 3);
                      }

                      setRecommendedActivities(results.slice(0, 4));
                      setHasGeneratedRec(true);
                      triggerToast?.(`🎯 Ditemukan ${results.length} rekomendasi aktivitas yang cocok!`);
                    }}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-current" /> Temukan Rekomendasi
                  </button>
                </div>
              </div>

              {/* Tampilkan Hasil Rekomendasi */}
              {hasGeneratedRec && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Hasil Pencarian Rekomendasi</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Ditemukan {recommendedActivities.length} kecocokan</span>
                  </div>

                  {recommendedActivities.length === 0 ? (
                    <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
                      <Zap className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2 stroke-1" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Tidak ada kecocokan sempurna.</p>
                      <p className="text-xs dark:text-slate-500">Coba ubah kriteria pencarian di atas untuk memperluas pencocokan!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendedActivities.map((act) => (
                        <div key={act.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                          <div className="h-32 bg-slate-100 dark:bg-slate-800 relative">
                            <img src={act.illustration_url} alt={act.activity_name} className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">
                              {act.category}
                            </div>
                            <div className="absolute top-3 right-3 bg-slate-900/70 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded">
                              ⭐ {act.rating}
                            </div>
                          </div>
                          <div className="p-4 space-y-3">
                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1 line-clamp-1 text-sm">{act.activity_name}</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{act.short_description}</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-550" /> {act.duration_min}-{act.duration_max} Min</span>
                              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-550" /> {act.participant_min}-{act.participant_max} Peserta</span>
                            </div>
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                              <button 
                                onClick={() => {
                                  if (onNavigate) {
                                    onNavigate('directory');
                                  }
                                  triggerToast?.(`🎯 Membuka direktori untuk: ${act.activity_name}`);
                                }}
                                className="flex-1 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg text-center transition-all cursor-pointer"
                              >
                                Lihat Detail
                              </button>
                              <button 
                                onClick={() => {
                                  if (onNavigate) {
                                    onNavigate('directory');
                                  }
                                  triggerToast?.(`🚀 Memulai Run Mode untuk: ${act.activity_name}`);
                                }}
                                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg text-center transition-all cursor-pointer"
                              >
                                Jalankan Sesi
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Rekomendasi Bawaan (Default Curated list) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Rekomendasi Populer Mingguan</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Aktivitas paling sering digunakan oleh rekan-rekan {currentRole} bulan ini.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Item 1 */}
                  <div className="flex gap-3 p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:border-blue-200 dark:hover:border-blue-900/30 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      IB
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-150 text-xs leading-snug">Kenalan 3 Fakta</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">Peserta menyebut 2 fakta benar dan 1 bohong.</p>
                      <div className="flex items-center gap-2 text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase">
                        <span>⭐ 4.8 Rating</span>
                        <span>•</span>
                        <span>Ice Breaking</span>
                      </div>
                    </div>
                  </div>
                  {/* Item 2 */}
                  <div className="flex gap-3 p-3 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 hover:border-emerald-200 dark:hover:border-emerald-900/30 transition-colors">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      TB
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-150 text-xs leading-snug">Tower Challenge</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">Membangun menara sedotan setinggi mungkin.</p>
                      <div className="flex items-center gap-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                        <span>⭐ 4.9 Rating</span>
                        <span>•</span>
                        <span>Team Building</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Column (Right) */}
        <div className="space-y-6">
          
          {/* Aktivitas Terbaru */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Aktivitas Terbaru</h2>
              <button onClick={() => triggerToast?.('Fitur detail riwayat aktivitas akan segera hadir')} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-350">Lihat Semua</button>
            </div>
            
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-150 truncate">Menyimpan Aktivitas</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Ice Breaking "Siapa Dia?"</p>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">2 jam lalu</span>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <LayoutList className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-150 truncate">Membuat Koleksi Baru</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Sesi Pagi Energizer</p>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">1 hari lalu</span>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <PlayCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-150 truncate">Menjalankan Run Mode</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Team Building 101</p>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">3 hari lalu</span>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-150 truncate">Menyelesaikan Pack</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Ice Breaking Pack</p>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">5 hari lalu</span>
              </div>
            </div>
          </div>

          {/* Stats & Pencapaian */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-6">Stats & Pencapaian</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Aktivitas Disimpan</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">24</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <LayoutList className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Koleksi Dibuat</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">5</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <PlayCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Sesi Dijalankan</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">12</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <FileBadge2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Aktivitas Kustom</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100">3</span>
              </div>
            </div>

            <button onClick={() => triggerToast?.('Fitur detail pencapaian akan segera hadir')} className="w-full py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg transition-colors">
              Lihat Semua Pencapaian
            </button>
          </div>

          {/* Aksi Cepat */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Aksi Cepat</h2>
            
            <div className="space-y-1">
              <button onClick={() => onNavigate?.('generator')} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">Buat Aktivitas Baru</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>

              <button onClick={() => onNavigate?.('sessions')} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-amber-600 transition-colors">Lihat Kalender</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600" />
              </button>

              <button onClick={() => { setActiveTab('Informasi Akun'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 transition-colors">Kelola Profile</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button onClick={() => triggerToast?.('Pengaturan akun akan segera hadir')} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450 flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">Pengaturan Akun</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
