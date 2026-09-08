import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PublicWebsite from './components/PublicWebsite';
import DirectoryDashboard from './components/DirectoryDashboard';
import ActivityDetailView from './components/ActivityDetailView';
import ActivityRunModeView from './components/ActivityRunModeView';
import ActivityGeneratorView from './components/ActivityGeneratorView';
import MyCollectionsView from './components/MyCollectionsView';
import SessionsView from './components/SessionsView';
import PacksView from './components/PacksView';
import MarketplaceView from './components/MarketplaceView';
import TutorialCenterView from './components/TutorialCenterView';
import LiveArenaView from './components/LiveArenaView';

import { ACTIVITIES, ACTIVITY_PACKS, VENDORS, Activity, ActivityPack, Vendor } from './data/activities';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Info } from 'lucide-react';
import { sound } from './utils/sound';
import TermsView from './components/TermsView';
import AuthModal from './components/AuthModal';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { authApi, activitiesApi, packsApi, sessionsApi, getAuthToken, getStoredUser } from './services/api';
import { useLanguage } from './contexts/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [customActivities, setCustomActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [savedActivities, setSavedActivities] = useState<Activity[]>([]);

  // Reset/restore-able states
  const [activitiesList, setActivitiesList] = useState<Activity[]>(() => {
    const cached = localStorage.getItem('aktipan_activities');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return ACTIVITIES;
  });

  const [packsList, setPacksList] = useState<ActivityPack[]>(() => {
    const cached = localStorage.getItem('aktipan_packs');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return ACTIVITY_PACKS;
  });

  const [sessionsList, setSessionsList] = useState<any[]>(() => {
    const cached = localStorage.getItem('aktipan_sessions');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return [
      { id: 'sess-1', name: 'Rapat Kerja Tahunan 2026', date: '2026-06-25', context: 'Corporate Gathering', audience: 'Manager & Staf Divisi HR', participantCount: 45, activityIds: [1, 11, 31], notes: 'Buka dengan ice breaking fakta, pertengahan beri tepuk fokus.', status: 'Draft' },
      { id: 'sess-2', name: 'Seminar Motivasi Mahasiswa Baru', date: '2026-07-02', context: 'MPLS Campus', audience: 'Mahasiswa Baru angkatan 2026', participantCount: 150, activityIds: [2, 13, 112], notes: 'Fokus refleksi di penutup panggung.', status: 'Berjalan' }
    ];
  });

  const [vendorsList, setVendorsList] = useState<Vendor[]>(() => {
    const cached = localStorage.getItem('aktipan_vendors');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return VENDORS;
  });

  // Master total list of activities combining standard + user custom
  const allActivitiesList = [...customActivities, ...activitiesList];

  const [currentView, _setCurrentView] = useState<string>('public-home');

  const setCurrentView = (view: string) => {
    _setCurrentView(view);
    
    let targetPath = '/';
    if (view === 'public-home') targetPath = '/';
    else if (view === 'directory') targetPath = '/game-directory';
    else if (view === 'generator') targetPath = '/generator';
    else if (view === 'collections') targetPath = '/collections';
    else if (view === 'packs') targetPath = '/packs';
    else if (view === 'sessions') targetPath = '/sessions';
    else if (view === 'marketplace') targetPath = '/marketplace';
    else if (view === 'tutorials') targetPath = '/tutorials';
    else if (view === 'live-arena') targetPath = '/live-arena';
    else if (view === 'profile') targetPath = '/profile';
    else if (view === 'settings') targetPath = '/settings';
    else if (view === 'terms') targetPath = '/terms';
    else if (view === 'admin') targetPath = '/admin';
    else if (view === 'login') targetPath = '/login';
    else if (view === 'register') targetPath = '/register';
    else if (view === 'detail' && selectedActivity) targetPath = `/activity/${selectedActivity.id}`;
    else if (view === 'run' && selectedActivity) targetPath = `/run/${selectedActivity.id}`;
    else return;
    
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  // Synchronize URL with currentView and selectedActivity
  useEffect(() => {
    const path = location.pathname;
    let targetView = 'public-home';
    if (path === '/') targetView = 'public-home';
    else if (path === '/game-directory') targetView = 'directory';
    else if (path === '/generator') targetView = 'generator';
    else if (path === '/collections') targetView = 'collections';
    else if (path === '/packs') targetView = 'packs';
    else if (path === '/sessions') targetView = 'sessions';
    else if (path === '/marketplace') targetView = 'marketplace';
    else if (path === '/tutorials') targetView = 'tutorials';
    else if (path === '/live-arena') targetView = 'live-arena';
    else if (path === '/profile') targetView = 'profile';
    else if (path === '/settings') targetView = 'settings';
    else if (path === '/terms') targetView = 'terms';
    else if (path === '/login') targetView = 'login';
    else if (path === '/register') targetView = 'register';
    else if (path === '/admin') {
      const token = getAuthToken();
      if (!token && !isLoggedIn) {
        sound.playClick();
        triggerToast('⚠️ Silakan login terlebih dahulu untuk mengakses Admin Panel.');
        navigate('/login?redirect=admin', { replace: true });
        _setCurrentView('login');
        return;
      }
      targetView = 'admin';
    }
    else if (path.startsWith('/activity/')) {
      targetView = 'detail';
      const idStr = path.split('/').pop();
      if (idStr) {
        const id = parseInt(idStr, 10);
        const matched = allActivitiesList.find(a => a.id === id);
        if (matched) {
          setSelectedActivity(matched);
        }
      }
    } else if (path.startsWith('/run/')) {
      targetView = 'run';
      const idStr = path.split('/').pop();
      if (idStr) {
        const id = parseInt(idStr, 10);
        const matched = allActivitiesList.find(a => a.id === id);
        if (matched) {
          setSelectedActivity(matched);
        }
      }
    } else {
      navigate('/', { replace: true });
      return;
    }

    if (currentView !== targetView) {
      _setCurrentView(targetView);
    }
  }, [location.pathname, allActivitiesList]);

  useEffect(() => {
    localStorage.setItem('aktipan_activities', JSON.stringify(activitiesList));
  }, [activitiesList]);

  useEffect(() => {
    localStorage.setItem('aktipan_packs', JSON.stringify(packsList));
  }, [packsList]);

  useEffect(() => {
    localStorage.setItem('aktipan_sessions', JSON.stringify(sessionsList));
  }, [sessionsList]);

  useEffect(() => {
    localStorage.setItem('aktipan_vendors', JSON.stringify(vendorsList));
  }, [vendorsList]);

  // Initialize from stored token so page refresh doesn't flicker to logged-out state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => Boolean(getAuthToken()));
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Profile and Role States loaded from local storage
  const [profileName, setProfileName] = useState<string>(() => {
    return localStorage.getItem('aktipan_profile_name') || 'Andika Pratama';
  });
  const [userRole, setUserRole] = useState<string>(() => {
    return localStorage.getItem('aktipan_user_role') || 'Trainer';
  });
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>(() => {
    const cachedProfile = localStorage.getItem('aktipan_profile_data');
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        return parsed.photoUrl || '';
      } catch (e) {}
    }
    return '';
  });

  // Sound State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('aktipan_sound_disabled') !== 'true';
  });

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('aktipan_sound_disabled', enabled ? 'false' : 'true');
  };

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('aktipan_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('aktipan_theme', theme);
  }, [theme]);

  // Auth Modal States
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [intendedView, setIntendedView] = useState<string | null>(null);

  // States for Disclaimer, Terms & Conditions
  const [termsActiveTab, setTermsActiveTab] = useState<'terms' | 'disclaimer' | 'privacy'>('terms');

  const triggerToast = (msg: string) => {
    sound.playToast();
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Unified Logout Handler
  const handleLogout = () => {
    authApi.logout().finally(() => {
      setIsLoggedIn(false);
      // Clear all auth-related keys from storage
      localStorage.removeItem('aktipan_auth_token');
      localStorage.removeItem('aktipan_profile_name');
      localStorage.removeItem('aktipan_user_role');
      // Remove cookie if any
      document.cookie = 'aktipan_token=; Max-Age=0; path=/';
      setUserRole('Trainer');
      setProfileName('Tamu');
      setCurrentView('login');
      triggerToast(t("👋 Anda telah keluar dari akun. Silakan masuk kembali."));
    });
  };

  // SEO Dynamic Meta Optimization
  useEffect(() => {
    let title = 'AKTIPAN - Active & Fun Workspace | No.1 Event Activity SaaS';
    let description = 'AKTIPAN adalah platform SaaS interaktif penunjang acara dan training paling komprehensif. Temukan 132+ game outbound, ice breaking, team building berbasis kecerdasan buatan (AI) secara instan.';
    
    switch (currentView) {
      case 'public-home':
        title = 'AKTIPAN - Platform Game & Aktivitas Event Interaktif Terbesar';
        break;
      case 'directory':
        title = 'Direktori Game & Aktivitas Outbound Terlengkap | AKTIPAN';
        description = 'Cari dan filter ratusan aktivitas outbound, ice breaking, energizer, dan team building interaktif di direktori AKTIPAN.';
        break;
      case 'detail':
        if (selectedActivity) {
          title = `${selectedActivity.activity_name} - Panduan Langkah Game Event | AKTIPAN`;
          description = `Panduan detail, cara bermain, perlengkapan, dan estimasi waktu untuk aktivitas: ${selectedActivity.activity_name}.`;
        }
        break;
      case 'generator':
        title = 'AI Activity Generator - Buat Game Kustom Instan | AKTIPAN';
        description = 'Gunakan kecerdasan buatan (AI) AKTIPAN untuk menghasilkan rancangan game ice breaking dan team building yang disesuaikan khusus untuk audiens Anda.';
        break;
      case 'collections':
        title = 'Koleksi Game & Aktivitas Saya | AKTIPAN';
        break;
      case 'sessions':
        title = 'Kelola Sesi & Agenda Acara Interaktif | AKTIPAN';
        break;
      case 'packs':
        title = 'Activity Packs - Paket Bundel Game Premium | AKTIPAN';
        break;
      case 'marketplace':
        title = 'Talent Marketplace - Cari Trainer & Fasilitator Profesional | AKTIPAN';
        break;
      case 'tutorials':
        title = 'Tutorial Academy - Kuasai Seni Fasilitasi Acara | AKTIPAN';
        break;
      case 'live-arena':
        title = 'Live Arena - Simulasi Praktik Panggung Interaktif | AKTIPAN';
        break;
      case 'profile':
        title = 'Profil Professional Trainer & Fasilitator | AKTIPAN';
        break;
      case 'settings':
        title = 'Pengaturan Sistem & Keamanan Data | AKTIPAN';
        break;
      case 'terms':
        title = 'Syarat, Ketentuan & Kebijakan Privasi | AKTIPAN';
        break;
    }
    
    document.title = title;
    
    // Update Meta Description dynamically
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Update Meta Keywords dynamically
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'game outbound, ice breaking, team building, fasilitator event, trainer outbound, socrates game, aktipan, generator game ai');

    // Update Open Graph tags for rich link preview SEO
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', description);
  }, [currentView, selectedActivity]);

  // Backup Data
  const handleBackupData = () => {
    try {
      const keys = [
        'aktipan_skills',
        'aktipan_certifications',
        'aktipan_activity_history',
        'aktipan_saved_v2',
        'aktipan_profile_data',
        'aktipan_profile_name',
        'aktipan_user_role',
        'aktipan_theme',
        'aktipan_language',
        'aktipan_sound_disabled',
        'aktipan_tour_completed'
      ];
      const backupObj: Record<string, any> = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {}
      };
      keys.forEach(k => {
        const val = localStorage.getItem(k);
        if (val !== null) {
          try {
            backupObj.data[k] = JSON.parse(val);
          } catch (e) {
            backupObj.data[k] = val;
          }
        }
      });

      // Add customActivities state
      backupObj.data['custom_activities'] = customActivities;

      const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `aktipan_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      triggerToast('❌ ' + t('Gagal melakukan backup data!'));
    }
  };

  // Reset Data
  const handleResetData = () => {
    // Clear state
    setSavedActivities([]);
    setCustomActivities([]);
    setProfileName('');
    setUserRole('Trainer');
    setProfilePhotoUrl('');
    setSoundEnabled(true);
    
    // Clear and set reset-able states to empty arrays (0 data)
    setActivitiesList([]);
    setPacksList([]);
    setSessionsList([]);
    setVendorsList([]);

    // Clear localStorage keys
    localStorage.removeItem('aktipan_skills');
    localStorage.removeItem('aktipan_certifications');
    localStorage.removeItem('aktipan_activity_history');
    localStorage.removeItem('aktipan_saved_v2');
    localStorage.removeItem('aktipan_profile_data');
    localStorage.removeItem('aktipan_profile_name');
    localStorage.removeItem('aktipan_user_role');
    localStorage.removeItem('aktipan_tour_completed');
    localStorage.removeItem('aktipan_sound_disabled');
    
    localStorage.removeItem('aktipan_activities');
    localStorage.removeItem('aktipan_packs');
    localStorage.removeItem('aktipan_sessions');
    localStorage.removeItem('aktipan_vendors');

    // Reset profile view keys if cached, we can set default values in storage
    localStorage.setItem('aktipan_skills', '[]');
    localStorage.setItem('aktipan_certifications', '[]');
    localStorage.setItem('aktipan_activity_history', '[]');
    localStorage.setItem('aktipan_saved_v2', '[]');
    
    localStorage.setItem('aktipan_activities', '[]');
    localStorage.setItem('aktipan_packs', '[]');
    localStorage.setItem('aktipan_sessions', '[]');
    localStorage.setItem('aktipan_vendors', '[]');
    
    localStorage.setItem('aktipan_profile_data', JSON.stringify({
      location: '',
      whatsapp: '',
      email: '',
      password: 'password123',
      photoUrl: ''
    }));
  };

  // Restore Data Seed
  const handleRestoreData = () => {
    // Set states
    setCustomActivities([]);
    setProfileName('Andika Pratama');
    setUserRole('Trainer');
    setSoundEnabled(true);
    setProfilePhotoUrl('');
    
    // Restore states to standard default values
    setActivitiesList(ACTIVITIES);
    setPacksList(ACTIVITY_PACKS);
    
    const defaultSessions = [
      { id: 'sess-1', name: 'Rapat Kerja Tahunan 2026', date: '2026-06-25', context: 'Corporate Gathering', audience: 'Manager & Staf Divisi HR', participantCount: 45, activityIds: [1, 11, 31], notes: 'Buka dengan ice breaking fakta, pertengahan beri tepuk fokus.', status: 'Draft' },
      { id: 'sess-2', name: 'Seminar Motivasi Mahasiswa Baru', date: '2026-07-02', context: 'MPLS Campus', audience: 'Mahasiswa Baru angkatan 2026', participantCount: 150, activityIds: [2, 13, 112], notes: 'Fokus refleksi di penutup panggung.', status: 'Berjalan' }
    ];
    setSessionsList(defaultSessions);
    setVendorsList(VENDORS);
    
    const defaultSaved = ACTIVITIES.filter(a => [1, 11, 21].includes(a.id));
    setSavedActivities(defaultSaved);

    // Write to storage
    localStorage.setItem('aktipan_profile_name', 'Andika Pratama');
    localStorage.setItem('aktipan_user_role', 'Trainer');
    localStorage.setItem('aktipan_tour_completed', 'true');
    localStorage.setItem('aktipan_sound_disabled', 'false');
    localStorage.setItem('aktipan_saved_v2', JSON.stringify([1, 11, 21]));
    
    localStorage.setItem('aktipan_activities', JSON.stringify(ACTIVITIES));
    localStorage.setItem('aktipan_packs', JSON.stringify(ACTIVITY_PACKS));
    localStorage.setItem('aktipan_sessions', JSON.stringify(defaultSessions));
    localStorage.setItem('aktipan_vendors', JSON.stringify(VENDORS));

    const defaultSkills = [
      { id: 1, name: 'Ice Breaking & Energizers', category: 'Ice Breaking', level: 'Ahli / Expert', rating: 5, sessionsCount: 15 },
      { id: 2, name: 'Team Building Facilitation', category: 'Team Building', level: 'Ahli / Expert', rating: 5, sessionsCount: 12 },
      { id: 3, name: 'Gamification & Quiz Design', category: 'Quiz & Polling', level: 'Menengah / Intermediate', rating: 4, sessionsCount: 8 },
      { id: 4, name: 'Public Speaking & MC', category: 'Travel & Special', level: 'Menengah / Intermediate', rating: 4, sessionsCount: 10 }
    ];
    localStorage.setItem('aktipan_skills', JSON.stringify(defaultSkills));

    const defaultCerts = [
      { id: 1, name: 'Certified Professional Facilitator (CPF)', issuer: 'International Association of Facilitators', year: '2024' },
      { id: 2, name: 'Hypnotherapy & Ice Breaking Specialist', issuer: 'Indonesian Board of Hypnotherapy', year: '2023' }
    ];
    localStorage.setItem('aktipan_certifications', JSON.stringify(defaultCerts));

    const defaultHistory = [
      { id: 'hist-1', activityId: 1, date: '2026-06-29', participants: 45, duration: 15, status: 'Selesai' },
      { id: 'hist-2', activityId: 11, date: '2026-06-28', participants: 120, duration: 10, status: 'Selesai' },
      { id: 'hist-3', activityId: 31, date: '2026-06-26', participants: 30, duration: 30, status: 'Selesai' },
      { id: 'hist-4', activityId: 81, date: '2026-06-25', participants: 80, duration: 20, status: 'Selesai' }
    ];
    localStorage.setItem('aktipan_activity_history', JSON.stringify(defaultHistory));

    localStorage.setItem('aktipan_profile_data', JSON.stringify({
      location: 'Jakarta, Indonesia',
      whatsapp: '+62 812-3456-7890',
      email: 'adityaalfito4348@gmail.com',
      password: 'password123',
      photoUrl: ''
    }));
  };

  // Import Backup from JSON string
  const handleImportBackup = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed || typeof parsed !== 'object' || !parsed.data) {
        return false;
      }

      const backup = parsed.data;
      
      // Update localStorage keys
      Object.keys(backup).forEach(key => {
        if (key === 'custom_activities') return;
        const val = backup[key];
        if (typeof val === 'object') {
          localStorage.setItem(key, JSON.stringify(val));
        } else {
          localStorage.setItem(key, String(val));
        }
      });

      // Update States
      if (backup['aktipan_profile_name']) {
        setProfileName(backup['aktipan_profile_name']);
      }
      if (backup['aktipan_user_role']) {
        setUserRole(backup['aktipan_user_role']);
      }
      if (backup['aktipan_profile_data']) {
        const parsedData = typeof backup['aktipan_profile_data'] === 'object' 
          ? backup['aktipan_profile_data'] 
          : JSON.parse(backup['aktipan_profile_data']);
        if (parsedData.photoUrl) {
          setProfilePhotoUrl(parsedData.photoUrl);
        }
      }
      if (backup['aktipan_saved_v2']) {
        const savedIds = typeof backup['aktipan_saved_v2'] === 'string'
          ? JSON.parse(backup['aktipan_saved_v2'])
          : backup['aktipan_saved_v2'];
        const matched = ACTIVITIES.filter(a => savedIds.includes(a.id));
        setSavedActivities(matched);
      }
      if (backup['custom_activities']) {
        setCustomActivities(backup['custom_activities']);
      }
      if (backup['aktipan_sound_disabled'] !== undefined) {
        setSoundEnabled(backup['aktipan_sound_disabled'] !== 'true');
      }
      if (backup['aktipan_theme']) {
        setTheme(backup['aktipan_theme'] === 'dark' ? 'dark' : 'light');
      }

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Load and synchronize active user session & backend data on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      authApi.getMe().then(res => {
        if (res.success && res.user) {
          setIsLoggedIn(true);
          setProfileName(res.user.name);
          setUserRole(res.user.role);
          if (res.user.photoUrl) setProfilePhotoUrl(res.user.photoUrl);

          // Fetch user-specific saved activities & sessions from backend
          activitiesApi.getSaved().then(savedRes => {
            if (savedRes.success && savedRes.activities) {
              setSavedActivities(savedRes.activities);
            }
          }).catch(console.error);

          sessionsApi.getAll().then(sessRes => {
            if (sessRes.success && sessRes.sessions) {
              setSessionsList(sessRes.sessions);
            }
          }).catch(console.error);
        }
      }).catch(console.error);
    }

    // Fetch latest activities from backend API
    activitiesApi.getAll().then(actRes => {
      if (actRes.success && actRes.activities && actRes.activities.length > 0) {
        setActivitiesList(actRes.activities);
      }
    }).catch(console.error);

    // Fetch packs from backend API
    packsApi.getAll().then(pRes => {
      if (pRes.success && pRes.packs && pRes.packs.length > 0) {
        setPacksList(pRes.packs);
      }
    }).catch(console.error);
  }, []);

  // Load saved list from LocalStorage for durable offline persistence fallback
  useEffect(() => {
    const cached = localStorage.getItem('aktipan_saved_v2');
    if (cached) {
      try {
        const ids = JSON.parse(cached) as number[];
        const matched = ACTIVITIES.filter(a => ids.includes(a.id));
        setSavedActivities(matched);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Sync to local storage
  const saveToCache = (updatedList: Activity[]) => {
    const ids = updatedList.map(a => a.id);
    localStorage.setItem('aktipan_saved_v2', JSON.stringify(ids));
  };

  // Auth helper
  const requireAuth = (callback: () => void) => {
    if (!isLoggedIn) {
      sound.playClick();
      setShowAuthModal(true);
    } else {
      callback();
    }
  };

  // Toggle favorite / save list
  const handleSaveToggle = (activity: Activity) => {
    if (!isLoggedIn) {
      sound.playClick();
      setShowAuthModal(true);
      return;
    }

    const exists = savedActivities.some(a => a.id === activity.id);
    let updated: Activity[] = [];
    if (exists) {
      updated = savedActivities.filter(a => a.id !== activity.id);
      triggerToast(t("📋 '") + activity.activity_name + t("' dihapus dari Koleksi Saya."));
    } else {
      updated = [...savedActivities, activity];
      sound.playSuccess();
      triggerToast(t("⭐ Sukses menambahkan '") + activity.activity_name + t("' ke Koleksi Saya!"));
    }
    setSavedActivities(updated);
    saveToCache(updated);

    // Sync to backend API
    activitiesApi.toggleSave(activity.id).catch(console.error);
  };

  // Add custom activity created by the user
  const handleAddCustomActivity = (newAct: Activity) => {
    setCustomActivities([newAct, ...customActivities]);
    sound.playSparkle();
    triggerToast(t("🎉 Sukses membuat game custom '") + newAct.activity_name + t("'! Game ini sekarang tayang di list direktori Anda."));
    
    // Sync to backend API if logged in
    if (isLoggedIn) {
      activitiesApi.create(newAct).then(res => {
        if (res.success && res.activity) {
          // Re-fetch activities from backend
          activitiesApi.getAll().then(all => {
            if (all.success && all.activities) setActivitiesList(all.activities);
          });
        }
      }).catch(console.error);
    }
  };

  // Handler for directory navigations
  const handleNavigate = (view: string) => {
    sound.playSwoosh();
    setCurrentView(view);
    setSelectedActivity(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSelectActivity = (activity: Activity) => {
    sound.playClick();
    setSelectedActivity(activity);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleNavigateToRun = (activity: Activity) => {
    sound.playClick();
    if (!isLoggedIn) {
      setSelectedActivity(activity);
      setIntendedView('run');
      setShowAuthModal(true);
      return;
    }
    setSelectedActivity(activity);
    setCurrentView('run');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };



  return (
    <div id="saas-aktipan-applet" className={`flex flex-col min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} font-sans`}>
      {/* Universal header notification block */}
      {currentView !== 'admin' && (
        <div id="promo-banner" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-1.5 px-4 text-center text-[11px] font-black uppercase tracking-wider transition-all select-none">
          {t('🚀 AKTIPAN SAAS SIAP JUAL • 132 AKTIVITAS PREMIUM & ALAT BERSENJATA AI AKTIF MENUNGGU ACARA ANDA!')}
        </div>
      )}

      {currentView !== 'admin' && (
        <Navbar 
          currentView={currentView}
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          onLoginToggle={() => {
            if (isLoggedIn) {
              handleLogout();
            } else {
              handleNavigate('login');
            }
          }}
          userRole={userRole}
          onRoleChange={setUserRole}
          savedActivitiesCount={savedActivities.length}
          userName={profileName}
          userPhotoUrl={profilePhotoUrl}
          onUpdateProfile={(newName, newRole, newPhotoUrl) => {
            setProfileName(newName);
            setUserRole(newRole);
            localStorage.setItem('aktipan_profile_name', newName);
            localStorage.setItem('aktipan_user_role', newRole);
            if (newPhotoUrl !== undefined) {
              setProfilePhotoUrl(newPhotoUrl);
            }
            triggerToast(t(`✅ Profil berhasil diperbarui menjadi ${newName} (${newRole})`));
          }}
          theme={theme}
          onThemeToggle={() => {
            sound.playSparkle();
            setTheme(prev => prev === 'light' ? 'dark' : 'light');
          }}
        />
      )}

      {/* View routing rendering layout */}
      <main className="flex-grow overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }} // Elegant cubic-bezier easeOut
          >
            {currentView === 'login' && (
              <LoginPage
                onLoginSuccess={(role, name, userObj) => {
                  setIsLoggedIn(true);
                  setUserRole(role);
                  setProfileName(name);
                  // Persist to localStorage so refresh keeps state
                  localStorage.setItem('aktipan_profile_name', name);
                  localStorage.setItem('aktipan_user_role', role);
                  if (userObj?.photoUrl) {
                    setProfilePhotoUrl(userObj.photoUrl);
                  }
                  const searchParams = new URLSearchParams(window.location.search);
                  const redirect = searchParams.get('redirect');
                  if (redirect === 'admin' || role === 'Admin') {
                    setCurrentView('admin');
                  } else {
                    setCurrentView('directory');
                  }
                  triggerToast(`🎉 Selamat datang kembali, ${name}!`);
                }}
                onNavigate={handleNavigate}
                redirectTarget={new URLSearchParams(window.location.search).get('redirect')}
              />
            )}

            {currentView === 'register' && (
              <RegisterPage
                onRegisterSuccess={(role, name, userObj) => {
                  setIsLoggedIn(true);
                  setUserRole(role);
                  setProfileName(name);
                  // Persist to localStorage so refresh keeps state
                  localStorage.setItem('aktipan_profile_name', name);
                  localStorage.setItem('aktipan_user_role', role);
                  if (userObj?.photoUrl) {
                    setProfilePhotoUrl(userObj.photoUrl);
                  }
                  setCurrentView('directory');
                  triggerToast(`🎉 Pendaftaran sukses! Selamat datang, ${name}.`);
                }}
                onNavigate={handleNavigate}
                onOpenTerms={(tab) => {
                  setTermsActiveTab(tab);
                  setCurrentView('terms');
                }}
              />
            )}

            {currentView === 'public-home' && (
              <PublicWebsite 
                onNavigate={handleNavigate}
                onSelectActivity={handleSelectActivity}
                onSaveToggle={handleSaveToggle}
                savedActivities={savedActivities}
                isLoggedIn={isLoggedIn}
                onLoginToggle={() => {
                  if (isLoggedIn) {
                    handleLogout();
                  } else {
                    handleNavigate('login');
                  }
                }}
              />
            )}

            {currentView === 'admin' && (
              <AdminDashboard
                onNavigate={handleNavigate}
                triggerToast={triggerToast}
                currentUserRole={userRole}
                onAdminLogin={() => {
                  setIsLoggedIn(true);
                  setUserRole('Admin');
                  setProfileName('Super Admin Aktipan');
                  setCurrentView('admin');
                }}
                onLogout={handleLogout}
              />
            )}

            {currentView === 'directory' && (
              <DirectoryDashboard 
                activities={allActivitiesList}
                onSelectActivity={handleSelectActivity}
                onSaveToggle={handleSaveToggle}
                savedActivities={savedActivities}
                onAddCustomActivity={handleAddCustomActivity}
                onNavigateToRun={handleNavigateToRun}
                onAddToCollectionDirect={(activity) => {
                  requireAuth(() => {
                    if (!savedActivities.some(a => a.id === activity.id)) {
                      handleSaveToggle(activity);
                    }
                    handleNavigate('collections');
                  });
                }}
                isLoggedIn={isLoggedIn}
                onRequireAuth={() => setShowAuthModal(true)}
              />
            )}

            {currentView === 'detail' && selectedActivity && (
              <ActivityDetailView
                activity={selectedActivity}
                onBack={() => handleNavigate('directory')}
                onSaveToggle={handleSaveToggle}
                isSaved={savedActivities.some(a => a.id === selectedActivity.id)}
                onNavigateToRun={handleNavigateToRun}
                onAddToCollectionDirect={(activity: Activity) => {
                  requireAuth(() => {
                    if (!savedActivities.some(a => a.id === activity.id)) {
                      handleSaveToggle(activity);
                    }
                    handleNavigate('collections');
                  });
                }}
                isLoggedIn={isLoggedIn}
                onRequireAuth={() => setShowAuthModal(true)}
              />
            )}

            {currentView === 'run' && selectedActivity && (
              <ActivityRunModeView
                activity={selectedActivity}
                onBack={() => handleNavigate('directory')}
                onFinishRun={(stats: any) => {
                  console.log('Run Stats saved:', stats);
                  handleNavigate('directory');
                }}
              />
            )}

            {currentView === 'generator' && (
              <ActivityGeneratorView
                onSelectActivity={handleSelectActivity}
                onNavigateToRun={handleNavigateToRun}
                isLoggedIn={isLoggedIn}
                onRequireAuth={() => setShowAuthModal(true)}
              />
            )}

            {currentView === 'collections' && (
              <MyCollectionsView
                savedActivities={savedActivities}
                onSelectActivity={handleSelectActivity}
                onRemoveFromSaved={handleSaveToggle}
                isLoggedIn={isLoggedIn}
                onRequireAuth={() => setShowAuthModal(true)}
              />
            )}

            {currentView === 'packs' && (
              <PacksView 
                packs={packsList}
                onPacksChange={(updatedPacks) => {
                  setPacksList(updatedPacks);
                  localStorage.setItem('aktipan_packs', JSON.stringify(updatedPacks));
                }}
                isLoggedIn={isLoggedIn}
                onRequireAuth={() => setShowAuthModal(true)}
              />
            )}

            {currentView === 'sessions' && (
              <SessionsView
                sessions={sessionsList}
                onSessionsChange={(updatedSessions) => {
                  setSessionsList(updatedSessions);
                  localStorage.setItem('aktipan_sessions', JSON.stringify(updatedSessions));
                }}
                onSelectActivity={handleSelectActivity}
                onNavigateToRun={handleNavigateToRun}
                isLoggedIn={isLoggedIn}
                onRequireAuth={() => setShowAuthModal(true)}
              />
            )}

            {currentView === 'marketplace' && (
              <MarketplaceView 
                vendors={vendorsList}
                isLoggedIn={isLoggedIn}
                onRequireAuth={() => setShowAuthModal(true)}
              />
            )}

            {currentView === 'tutorials' && (
              <TutorialCenterView />
            )}

            {currentView === 'live-arena' && (
              <LiveArenaView 
                isLoggedIn={isLoggedIn}
                onLoginToggle={() => {
                  if (isLoggedIn) {
                    authApi.logout().finally(() => {
                      setIsLoggedIn(false);
                      setCurrentView('public-home');
                      triggerToast("👋 Anda telah keluar dari akun.");
                    });
                  } else {
                    setShowAuthModal(true);
                  }
                }}
                userRole={userRole}
              />
            )}

            {currentView === 'profile' && (
              <ProfileView
                currentName={profileName}
                currentRole={userRole}
                onSave={(newName, newRole, newPhotoUrl) => {
                  setProfileName(newName);
                  setUserRole(newRole);
                  localStorage.setItem('aktipan_profile_name', newName);
                  localStorage.setItem('aktipan_user_role', newRole);
                  if (newPhotoUrl !== undefined) {
                    setProfilePhotoUrl(newPhotoUrl);
                  }
                  triggerToast(t(`✅ Profil berhasil diperbarui menjadi ${newName} (${newRole})`));
                }}
                onNavigate={handleNavigate}
                triggerToast={triggerToast}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                theme={theme}
                onThemeToggle={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                language={language}
                onLanguageToggle={() => setLanguage(language === 'id' ? 'en' : 'id')}
                soundEnabled={soundEnabled}
                onSoundToggle={handleSoundToggle}
                onResetData={handleResetData}
                onRestoreData={handleRestoreData}
                onBackupData={handleBackupData}
                onImportBackup={handleImportBackup}
                triggerToast={triggerToast}
              />
            )}

            {currentView === 'terms' && (
              <TermsView 
                initialTab={termsActiveTab} 
                onBack={() => handleNavigate('public-home')} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* GLOBAL TOAST NOTIFICATION CONTAINER */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 max-w-sm w-11/12 border-l-4 border-l-indigo-500"
          >
            <Sparkles className="h-4.5 w-4.5 text-indigo-400 shrink-0 animate-pulse" />
            <span className="text-[11px] font-black leading-tight tracking-tight text-slate-100">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {currentView !== 'admin' && (
        <Footer onOpenTerms={(tab) => { setTermsActiveTab(tab); setCurrentView('terms'); window.scrollTo(0, 0); }} />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setIntendedView(null);
        }}
        onOpenTerms={(tab) => { 
          setShowAuthModal(false);
          setTermsActiveTab(tab); 
          setCurrentView('terms');
          window.scrollTo(0, 0);
        }}
        onSuccess={(role, name, userObj) => {
          setIsLoggedIn(true);
          setUserRole(role);
          setProfileName(name);
          if (userObj?.photoUrl) setProfilePhotoUrl(userObj.photoUrl);
          setShowAuthModal(false);
          triggerToast(t("🎉 Selamat datang kembali, ") + name + "! " + t("Masuk sebagai ") + t(role) + ".");
          
          if (role === 'Admin') {
            setCurrentView('admin');
          } else if (intendedView) {
            setCurrentView(intendedView);
            setIntendedView(null);
          } else {
            setCurrentView('directory');
          }
        }}
      />
    </div>
  );
}
