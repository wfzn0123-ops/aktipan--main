import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Users, Gamepad2, Calendar, Layers, Activity as ActivityIcon,
  Search, Filter, Plus, Edit2, Trash2, CheckCircle2, XCircle, AlertTriangle,
  RefreshCw, TrendingUp, ShieldAlert, Key, Sparkles, UserCheck, UserX,
  Clock, Database, ArrowUpRight, Check, X, Award, ChevronDown,
  Settings, Server, Download, Upload, Cpu, Wifi, LogOut, Menu,
  ExternalLink, Globe, HardDrive, Terminal, UserPlus, RotateCcw
} from 'lucide-react';
import { adminApi, activitiesApi, authApi } from '../services/api';
import { sound } from '../utils/sound';
import { useLanguage } from '../contexts/LanguageContext';
import { Activity, ACTIVITIES } from '../data/activities';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
  triggerToast: (msg: string) => void;
  currentUserRole: string;
  onAdminLogin?: () => void;
  onLogout?: () => void;
}

export default function AdminDashboard({ 
  onNavigate, 
  triggerToast, 
  currentUserRole, 
  onAdminLogin,
  onLogout 
}: AdminDashboardProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activities' | 'settings' | 'logs'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const [stats, setStats] = useState<any>({
    totalUsers: 3,
    activeUsers: 3,
    totalActivities: 132,
    freeActivities: 120,
    premiumActivities: 12,
    totalPacks: 10,
    totalSessions: 2,
    roleDistribution: {
      'Admin': 1,
      'Trainer': 1,
      'MC / Host': 1,
      'Fasilitator': 0,
      'HR / L&D': 0,
      'Guru / Dosen': 0,
      'EO': 0
    },
    systemHealth: {
      status: 'ONLINE',
      uptimeSeconds: 1200,
      nodeVersion: 'v22.23.2',
      memoryUsageMb: 24,
      serverTime: new Date().toISOString()
    }
  });

  const [users, setUsers] = useState<any[]>([
    {
      id: 'usr_admin_001',
      name: 'Super Admin Aktipan',
      email: 'admin@aktipan.com',
      phone: '+62 811-9988-7766',
      role: 'Admin',
      location: 'Jakarta Headquarter',
      whatsapp: '+62 811-9988-7766',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_trainer_002',
      name: 'Andika Pratama',
      email: 'andika@aktipan.com',
      phone: '+62 812-3456-7890',
      role: 'Trainer',
      location: 'Jakarta, Indonesia',
      whatsapp: '+62 812-3456-7890',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_mc_003',
      name: 'Sarah Amanda',
      email: 'sarah@aktipan.com',
      phone: '+62 813-5566-7788',
      role: 'MC / Host',
      location: 'Bandung, Indonesia',
      whatsapp: '+62 813-5566-7788',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ]);

  const [activities, setActivities] = useState<Activity[]>(ACTIVITIES);
  const [auditLogs, setAuditLogs] = useState<any[]>([
    {
      id: 'log-1',
      action: 'USER_LOGIN',
      userName: 'Super Admin Aktipan',
      details: 'Login sukses: Super Admin Aktipan (admin@aktipan.com) - Peran: Admin',
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString()
    },
    {
      id: 'log-2',
      action: 'SYSTEM_INIT',
      userName: 'System AutoSeeder',
      details: '132 Aktivitas & 10 Activity Packs berhasil dimuat ke database.',
      ipAddress: 'localhost',
      timestamp: new Date().toISOString()
    }
  ]);

  // User Filter & Search
  const [userSearch, setUserSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');

  // Add User Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Trainer'
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Edit User Role Modal
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);
  const [newRole, setNewRole] = useState<string>('Trainer');
  const [isActiveStatus, setIsActiveStatus] = useState<boolean>(true);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  // Delete User Confirmation
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  // Activity Search & Filter & Delete
  const [activitySearch, setActivitySearch] = useState('');
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('all');
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);

  // Reset Seed Modal
  const [showResetSeedModal, setShowResetSeedModal] = useState(false);
  const [isResettingSeed, setIsResettingSeed] = useState(false);

  // Audit Logs Search
  const [logSearch, setLogSearch] = useState('');

  // Hidden File input ref for JSON restore
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Add/Edit Activity Modal
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any | null>(null);
  const [activityForm, setActivityForm] = useState({
    activity_name: '',
    category: 'Ice Breaking',
    short_description: '',
    energy_level: 'Medium',
    format: 'Offline',
    participant_min: 5,
    participant_max: 50,
    duration_min: 5,
    duration_max: 15,
    tools_needed: 'Tanpa Alat',
    is_free: true
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, actRes, logsRes] = await Promise.all([
        adminApi.getStats().catch(() => ({ success: false })),
        adminApi.getUsers().catch(() => ({ success: false })),
        activitiesApi.getAll().catch(() => ({ success: false })),
        adminApi.getAuditLogs(50).catch(() => ({ success: false }))
      ]);

      if (statsRes && (statsRes as any).success && (statsRes as any).stats) {
        setStats((statsRes as any).stats);
      }
      if (usersRes && (usersRes as any).success && (usersRes as any).users && (usersRes as any).users.length > 0) {
        setUsers((usersRes as any).users);
      }
      if (actRes && (actRes as any).success && (actRes as any).activities && (actRes as any).activities.length > 0) {
        setActivities((actRes as any).activities);
      } else {
        setActivities(ACTIVITIES);
      }
      if (logsRes && (logsRes as any).success && (logsRes as any).logs && (logsRes as any).logs.length > 0) {
        setAuditLogs((logsRes as any).logs);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const pingBackend = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await fetch('http://localhost:5000/api/health', { cache: 'no-store' });
      const duration = Math.round(performance.now() - start);
      if (res.ok) {
        setApiLatency(duration);
        sound.playSparkle();
        triggerToast(`⚡ Backend Online! Respon: ${duration}ms (Port 5000)`);
      } else {
        setApiLatency(null);
        triggerToast(`⚠️ Backend merespons status ${res.status}`);
      }
    } catch (err: any) {
      setApiLatency(null);
      triggerToast('❌ Backend tidak dapat dihubungi di http://localhost:5000');
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    if (currentUserRole === 'Admin') {
      loadAdminData();
      pingBackend();
    }
  }, [currentUserRole]);

  // Filtered users list
  const filteredUsers = users.filter(u => {
    const matchesSearch = !userSearch || 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearch));
    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered activities list
  const filteredActivities = activities.filter(act => {
    const matchesSearch = !activitySearch || 
      act.activity_name.toLowerCase().includes(activitySearch.toLowerCase()) || 
      (act.short_description && act.short_description.toLowerCase().includes(activitySearch.toLowerCase()));
    const matchesCategory = activityCategoryFilter === 'all' || act.category === activityCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered logs list
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = !logSearch || 
      log.action.toLowerCase().includes(logSearch.toLowerCase()) || 
      (log.userName && log.userName.toLowerCase().includes(logSearch.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(logSearch.toLowerCase())) ||
      (log.ipAddress && log.ipAddress.includes(logSearch));
    return matchesSearch;
  });

  // Handle Update User Role
  const handleSaveUserRole = async () => {
    if (!selectedUserForEdit) return;
    setIsUpdatingUser(true);
    try {
      const res = await adminApi.updateUserRole(selectedUserForEdit.id, {
        role: newRole,
        isActive: isActiveStatus
      });
      if (res.success) {
        sound.playSuccess();
        triggerToast(`✅ Berhasil memperbarui user ${selectedUserForEdit.name} menjadi ${newRole}`);
        setSelectedUserForEdit(null);
        loadAdminData();
      } else {
        triggerToast(`❌ ${res.message || 'Gagal memperbarui user'}`);
      }
    } catch (err: any) {
      triggerToast(`❌ ${err.message}`);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // Handle Delete User
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const res = await adminApi.deleteUser(userToDelete.id);
      if (res.success) {
        sound.playSuccess();
        triggerToast(`✅ User ${userToDelete.name} berhasil dihapus.`);
        setUserToDelete(null);
        loadAdminData();
      } else {
        triggerToast(`❌ ${res.message || 'Gagal menghapus user'}`);
      }
    } catch (err: any) {
      triggerToast(`❌ ${err.message}`);
    }
  };

  // Handle Create User directly from Admin Panel
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    try {
      const res = await adminApi.createUser(newUserForm);
      if (res.success) {
        sound.playSuccess();
        triggerToast(`✅ User '${newUserForm.name}' (${newUserForm.role}) berhasil ditambahkan ke database!`);
        setShowAddUserModal(false);
        setNewUserForm({
          name: '',
          email: '',
          phone: '',
          password: '',
          role: 'Trainer'
        });
        loadAdminData();
      } else {
        triggerToast(`❌ ${res.message || 'Gagal menambahkan user baru'}`);
      }
    } catch (err: any) {
      triggerToast(`❌ ${err.message}`);
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Handle Delete Activity
  const handleConfirmDeleteActivity = async () => {
    if (!activityToDelete) return;
    try {
      const res = await activitiesApi.delete(activityToDelete.id);
      if (res.success) {
        sound.playSuccess();
        triggerToast(`✅ Aktivitas '${activityToDelete.activity_name}' berhasil dihapus.`);
        setActivityToDelete(null);
        loadAdminData();
      } else {
        triggerToast(`❌ ${res.message || 'Gagal menghapus aktivitas'}`);
      }
    } catch (err: any) {
      triggerToast(`❌ ${err.message}`);
    }
  };

  // Handle Reset Database Seed to Standard Defaults
  const handleConfirmResetSeed = async () => {
    setIsResettingSeed(true);
    try {
      const res = await adminApi.resetSeed();
      if (res.success) {
        sound.playSparkle();
        triggerToast('🎉 Database berhasil di-reset ke data bawaan awal (132 Aktivitas)!');
        setShowResetSeedModal(false);
        loadAdminData();
      } else {
        triggerToast(`❌ ${res.message || 'Gagal mereset database'}`);
      }
    } catch (err: any) {
      triggerToast(`❌ ${err.message}`);
    } finally {
      setIsResettingSeed(false);
    }
  };

  // Handle Restore Database JSON file
  const handleRestoreDatabaseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && (parsed.users || parsed.activities)) {
          if (Array.isArray(parsed.activities)) setActivities(parsed.activities);
          if (Array.isArray(parsed.users)) setUsers(parsed.users);
          sound.playSuccess();
          triggerToast(`💾 Berhasil memulihkan snapshot database dari file: ${file.name}`);
        } else {
          triggerToast('❌ Format file JSON backup tidak valid.');
        }
      } catch (err: any) {
        triggerToast(`❌ Gagal membaca file backup: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle Create or Update Activity
  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...activityForm,
        tools_needed: typeof activityForm.tools_needed === 'string' 
          ? activityForm.tools_needed.split(',').map(s => s.trim()) 
          : activityForm.tools_needed
      };

      if (editingActivity) {
        const res = await activitiesApi.update(editingActivity.id, payload);
        if (res.success) {
          sound.playSuccess();
          triggerToast(`✅ Aktivitas '${activityForm.activity_name}' berhasil diperbarui!`);
          setShowActivityModal(false);
          setEditingActivity(null);
          loadAdminData();
        } else {
          triggerToast(`❌ ${res.message}`);
        }
      } else {
        const res = await activitiesApi.create(payload);
        if (res.success) {
          sound.playSparkle();
          triggerToast(`🎉 Aktivitas '${activityForm.activity_name}' berhasil ditambahkan ke database!`);
          setShowActivityModal(false);
          loadAdminData();
        } else {
          triggerToast(`❌ ${res.message}`);
        }
      }
    } catch (err: any) {
      triggerToast(`❌ ${err.message}`);
    }
  };

  // Handle Backup Database Download
  const handleBackupDatabase = () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        users,
        activities,
        auditLogs
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aktipan_database_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      sound.playSparkle();
      triggerToast('💾 Berhasil mengunduh salinan backup database.');
    } catch (err: any) {
      triggerToast('❌ Gagal backup: ' + err.message);
    }
  };

  const rolesList = ['Admin', 'Trainer', 'MC / Host', 'Fasilitator', 'HR / L&D', 'Guru / Dosen', 'EO'];
  const categoriesList = ['Ice Breaking', 'Energizer', 'Fun Games', 'Team Building', 'Communication', 'Leadership', 'Problem Solving', 'Sales & Service', 'Quiz & Polling', 'Reflection'];

  // Route Guard / Gatekeeper when not logged in as Admin
  if (currentUserRole !== 'Admin') {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-2xl p-8 space-y-6"
        >
          <div className="w-18 h-18 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Panel Khusus Administrator</h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
              Halaman ini membutuhkan hak akses <strong>Super Admin</strong>. Anda dapat langsung masuk dengan akun administrator bawaan di bawah ini.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-left space-y-1 text-xs">
            <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Akun Super Admin Bawaan:
            </div>
            <div className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
              Email: <strong>admin@aktipan.com</strong> | Password: <strong>admin123</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={async () => {
                try {
                  sound.playSparkle();
                  const res = await authApi.login({ email: 'admin@aktipan.com', password: 'admin123' });
                  if (res.success && res.user) {
                    triggerToast('👑 Berhasil masuk sebagai Super Admin!');
                    if (onAdminLogin) onAdminLogin();
                    loadAdminData();
                  } else {
                    triggerToast('❌ ' + (res.message || 'Gagal login admin'));
                  }
                } catch (e: any) {
                  triggerToast('❌ Gagal login admin: ' + e.message);
                }
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Buka Sebagai Admin (1-Klik)</span>
            </button>
            
            <button
              onClick={() => onNavigate('public-home')}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
            >
              Kembali
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const navMenuItems = [
    { id: 'overview', label: 'Dashboard & Metrik', icon: TrendingUp },
    { id: 'users', label: `Kelola Pengguna (${users.length})`, icon: Users },
    { id: 'activities', label: `Kelola Game (${activities.length})`, icon: Gamepad2 },
    { id: 'settings', label: 'Settings & Data Utama', icon: Settings },
    { id: 'logs', label: `Audit Security Logs (${auditLogs.length})`, icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col md:flex-row">
      
      {/* MOBILE SIDEBAR BACKDROP */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* 1. ADMIN SIDEBAR */}
      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-black text-white tracking-wider block">AKTIPAN</span>
                <span className="text-[10px] font-mono text-amber-400 font-bold tracking-widest uppercase">ADMIN PANEL</span>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white md:hidden cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Menu Items */}
        <div className="px-3 py-4 space-y-1.5 flex-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            Navigasi Utama
          </div>
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(item.id as any);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            Pintasan Eksternal
          </div>
          <button
            onClick={() => onNavigate('public-home')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <Globe className="h-4 w-4 text-emerald-400" />
              <span>Lihat Website Publik</span>
            </div>
            <ExternalLink className="h-3 w-3 text-slate-500" />
          </button>
        </div>

        {/* Sidebar Bottom Profile Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-xs shrink-0">
                👑
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">Super Admin</span>
                <span className="text-[10px] text-amber-400 font-mono">admin@aktipan.com</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (onLogout) onLogout();
                else onNavigate('public-home');
              }}
              title="Keluar (Logout)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA WITH TOPBAR */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header / Navbar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 md:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {activeTab === 'overview' && 'Dashboard & Rangkuman Sistem'}
                {activeTab === 'users' && 'Manajemen Pengguna (RBAC)'}
                {activeTab === 'activities' && 'Katalog Game & Aktivitas Outbound'}
                {activeTab === 'settings' && 'Pengaturan Platform & Kelola Data Utama'}
                {activeTab === 'logs' && 'Audit Log & Keamanan Sistem'}
              </h1>
              <span className="text-[11px] text-slate-400 hidden sm:inline-block">
                AKTIPAN Workspace Control Center
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2">
            {/* Live Backend Indicator */}
            <div 
              onClick={pingBackend}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs cursor-pointer hover:border-emerald-500/50 transition-colors"
              title="Klik untuk tes latensi API"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200">
                Port 5000 {apiLatency !== null ? `(${apiLatency}ms)` : 'ONLINE'}
              </span>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                loadAdminData();
                triggerToast('🔄 Data admin berhasil disinkronkan!');
              }}
              disabled={loading}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setEditingActivity(null);
                setActivityForm({
                  activity_name: '',
                  category: 'Ice Breaking',
                  short_description: '',
                  energy_level: 'Medium',
                  format: 'Offline',
                  participant_min: 5,
                  participant_max: 50,
                  duration_min: 5,
                  duration_max: 15,
                  tools_needed: 'Tanpa Alat',
                  is_free: true
                });
                setShowActivityModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 text-xs font-black shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Tambah Game</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
          
          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metric Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Total Pengguna</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-0.5">
                      {stats?.totalUsers ?? users.length} <span className="text-xs font-normal text-emerald-500">({stats?.activeUsers ?? users.length} aktif)</span>
                    </h3>
                    <span className="text-[10px] text-slate-400">Pengguna Terdaftar</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-2xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <Gamepad2 className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Total Aktivitas</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-0.5">
                      {stats?.totalActivities ?? activities.length} <span className="text-xs font-normal text-blue-500">({stats?.freeActivities ?? 0} Free)</span>
                    </h3>
                    <span className="text-[10px] text-slate-400">Game & Outbound Siap Pakai</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Activity Packs</span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-0.5">
                      {stats?.totalPacks ?? 10}
                    </h3>
                    <span className="text-[10px] text-slate-400">Bundel Game Kategori</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Database className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Server Backend</span>
                    <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-none mt-0.5 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      ONLINE
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">Port 5000 • Express TS</span>
                  </div>
                </div>
              </div>

              {/* Role Distribution & System Health Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Role Distribution */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Award className="h-4 w-4 text-orange-500" />
                    Distribusi Peran Pengguna (Role-Based Access Control)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {rolesList.map(role => {
                      const count = stats?.roleDistribution?.[role] || users.filter(u => u.role === role).length;
                      return (
                        <div key={role} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 block">{role}</span>
                          <div className="flex items-baseline justify-between mt-1">
                            <span className="text-xl font-black text-slate-900 dark:text-white">{count}</span>
                            <span className="text-[10px] font-extrabold text-blue-500">
                              {users.length > 0 ? Math.round((count / users.length) * 100) : 0}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Server Info Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Key className="h-4 w-4 text-blue-500" />
                      Spesifikasi Keamanan & Runtime
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                        <span>Metode Auth:</span>
                        <strong className="text-slate-900 dark:text-white">JWT + Cookies</strong>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                        <span>Password Hash:</span>
                        <strong className="text-slate-900 dark:text-white">bcryptjs (10 rounds)</strong>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                        <span>Engine Database:</span>
                        <strong className="text-slate-900 dark:text-white">Persistent JSON Storage</strong>
                      </div>
                      <div className="flex justify-between py-1.5 text-slate-600 dark:text-slate-400">
                        <span>Live Arena WS:</span>
                        <strong className="text-emerald-500">ws://localhost:5000/ws/arena</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300">
                    💡 <strong>Status:</strong> Anda dapat mengelola akun pengguna, mengubah status, serta menambah atau memperbarui aktivitas secara langsung.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama, email, nomor HP..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="all">Semua Peran ({users.length})</option>
                    {rolesList.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowAddUserModal(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah User</span>
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Pengguna</th>
                      <th className="py-3 px-4">Peran (Role)</th>
                      <th className="py-3 px-4">Kontak</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Terdaftar</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                          Tidak ada pengguna yang cocok dengan kriteria pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isAdmin = u.role === 'Admin';
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-black flex items-center justify-center text-xs uppercase shrink-0">
                                  {u.name ? u.name.charAt(0) : 'U'}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white block">{u.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{u.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${
                                isAdmin 
                                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                  : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                              }`}>
                                {isAdmin && <span>👑</span>}
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[11px] block">{u.phone || '-'}</span>
                              <span className="text-[10px] text-slate-400">{u.location || 'Indonesia'}</span>
                            </td>
                            <td className="py-3 px-4">
                              {u.isActive ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Aktif
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-bold">
                                  <XCircle className="h-3.5 w-3.5" /> Nonaktif
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-[11px]">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => {
                                    sound.playClick();
                                    setSelectedUserForEdit(u);
                                    setNewRole(u.role);
                                    setIsActiveStatus(u.isActive);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                                  title="Ubah Peran / Status"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    sound.playClick();
                                    setUserToDelete(u);
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                                  title="Hapus User"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY MANAGEMENT */}
          {activeTab === 'activities' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Katalog Game & Aktivitas ({filteredActivities.length} dari {activities.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">Kelola master aktivitas outbound, ice breaking, dan game interaktif</span>
                </div>
                <button
                  onClick={() => {
                    sound.playClick();
                    setEditingActivity(null);
                    setActivityForm({
                      activity_name: '',
                      category: 'Ice Breaking',
                      short_description: '',
                      energy_level: 'Medium',
                      format: 'Offline',
                      participant_min: 5,
                      participant_max: 50,
                      duration_min: 5,
                      duration_max: 15,
                      tools_needed: 'Tanpa Alat',
                      is_free: true
                    });
                    setShowActivityModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Game Baru</span>
                </button>
              </div>

              {/* Activity Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari judul game, deskripsi, kategori..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                  <select
                    value={activityCategoryFilter}
                    onChange={(e) => setActivityCategoryFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="all">Semua Kategori ({categoriesList.length})</option>
                    {categoriesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Activity Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {filteredActivities.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400">
                    Tidak ada aktivitas yang sesuai dengan kriteria pencarian "{activitySearch}".
                  </div>
                ) : (
                  filteredActivities.slice(0, 48).map((act) => (
                    <div key={act.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:border-orange-500/30 transition-colors">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-mono font-bold text-orange-500">{act.activity_number}</span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {act.category}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug line-clamp-1">{act.activity_name}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{act.short_description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400">
                        <span>⏱️ {act.duration_min}-{act.duration_max} Menit</span>
                        <span>⚡ {act.energy_level}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              sound.playClick();
                              setEditingActivity(act);
                              setActivityForm({
                                activity_name: act.activity_name,
                                category: act.category,
                                short_description: act.short_description,
                                energy_level: act.energy_level,
                                format: act.format,
                                participant_min: act.participant_min,
                                participant_max: act.participant_max,
                                duration_min: act.duration_min,
                                duration_max: act.duration_max,
                                tools_needed: Array.isArray(act.tools_needed) ? act.tools_needed.join(', ') : (act.tools_needed || 'Tanpa Alat'),
                                is_free: act.is_free
                              });
                              setShowActivityModal(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              sound.playClick();
                              setActivityToDelete(act);
                            }}
                            className="text-rose-500 hover:text-rose-600 font-bold p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                            title="Hapus Game"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {filteredActivities.length > 48 && (
                <p className="text-center text-[11px] text-slate-400 pt-2 font-medium">
                  Menampilkan 48 dari {filteredActivities.length} aktivitas game yang cocok.
                </p>
              )}
            </div>
          )}

          {/* TAB 4: SETTINGS & KELOLA DATA UTAMA */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Database & Data Controls */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Database className="h-4.5 w-4.5 text-blue-500" />
                    Manajemen Database & Data Utama
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Kontrol replikasi data, cadangan (backup JSON), pemulihan data, serta sinkronisasi aktivitas bawaan.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Backup Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ekspor & Cadangkan Data</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Unduh snapshot data pengguna dan aktivitas dalam format JSON.</p>
                    </div>
                    <button
                      onClick={handleBackupDatabase}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 ml-3"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Backup
                    </button>
                  </div>

                  {/* API Test Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tes Latensi Backend API</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Status endpoint <code className="text-orange-500 font-mono">/api/health</code>: {apiLatency !== null ? `${apiLatency}ms` : 'Klik tes'}
                      </p>
                    </div>
                    <button
                      onClick={pingBackend}
                      disabled={isPinging}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 ml-3 disabled:opacity-60"
                    >
                      <Wifi className={`h-3.5 w-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                      Ping API
                    </button>
                  </div>

                  {/* Restore / Import Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pulihkan / Impor Data</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Unggah file JSON backup untuk memulihkan katalog.</p>
                    </div>
                    <label className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 ml-3">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Impor JSON</span>
                      <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        onChange={handleRestoreDatabaseFile}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Reset Seed Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-rose-200/70 dark:border-rose-900/40 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400">Reset ke Data Awal Bawaan</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Kembalikan database ke 132 aktivitas & akun default.</p>
                    </div>
                    <button
                      onClick={() => setShowResetSeedModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 ml-3"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Reset Seed</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Security & System Environment Specifications */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Server className="h-4.5 w-4.5 text-orange-500" />
                  Konfigurasi Lingkungan & Keamanan Backend
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block">Port Backend API</span>
                    <span className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5 block">5000</span>
                    <span className="text-[10px] text-emerald-500 font-bold">Express v4.21 + TSX</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block">Masa Berlaku Token (JWT)</span>
                    <span className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5 block">7 Hari</span>
                    <span className="text-[10px] text-blue-500 font-bold">Bearer & Cookie Supported</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block">Kredensial Admin Bawaan</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono mt-1 block truncate">admin@aktipan.com</span>
                    <span className="text-[10px] text-amber-500 font-bold">Password: admin123</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Riwayat Audit Keamanan & Aktivitas Sistem ({filteredLogs.length})
                </h3>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari aksi, user, IP address..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">Belum ada riwayat audit log yang cocok.</p>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{log.action}</span>
                          {log.userName && (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
                              {log.userName}
                            </span>
                          )}
                          {log.ipAddress && (
                            <span className="text-[9px] font-mono text-slate-400">
                              {log.ipAddress}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{log.details}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* EDIT USER ROLE MODAL */}
      <AnimatePresence>
        {selectedUserForEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">Ubah Peran & Status Pengguna</h3>
                <button
                  onClick={() => setSelectedUserForEdit(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs">
                <span className="font-bold text-slate-900 dark:text-white block">{selectedUserForEdit.name}</span>
                <span className="text-slate-400">{selectedUserForEdit.email}</span>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Pilih Peran Baru:</label>
                <div className="grid grid-cols-2 gap-2">
                  {rolesList.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewRole(r)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        newRole === r
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-300'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {r === 'Admin' ? '👑 Admin' : r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Status Akun:</span>
                <button
                  type="button"
                  onClick={() => setIsActiveStatus(!isActiveStatus)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActiveStatus
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {isActiveStatus ? '✓ Aktif' : '✕ Dinonaktifkan'}
                </button>
              </div>

              <div className="flex space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveUserRole}
                  disabled={isUpdatingUser}
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {isUpdatingUser ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE USER CONFIRMATION MODAL */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-rose-200 dark:border-rose-900 shadow-2xl space-y-4 text-center"
            >
              <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Hapus Pengguna?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Apakah Anda yakin ingin menghapus akun <strong>{userToDelete.name}</strong> ({userToDelete.email})? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => setUserToDelete(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDeleteUser}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Hapus Permanen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT ACTIVITY MODAL */}
      <AnimatePresence>
        {showActivityModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {editingActivity ? 'Edit Aktivitas Game' : 'Tambah Aktivitas Game Baru'}
                </h3>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveActivity} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Game / Aktivitas *</label>
                  <input
                    type="text"
                    required
                    value={activityForm.activity_name}
                    onChange={(e) => setActivityForm({ ...activityForm, activity_name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Contoh: Tepuk Sinergi Cepat"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kategori *</label>
                    <select
                      value={activityForm.category}
                      onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold cursor-pointer"
                    >
                      {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Energi Panggung</label>
                    <select
                      value={activityForm.energy_level}
                      onChange={(e) => setActivityForm({ ...activityForm, energy_level: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold cursor-pointer"
                    >
                      <option value="Calm">Calm (Tenang / Refleksi)</option>
                      <option value="Medium">Medium (Sedang)</option>
                      <option value="High">High (Heboh & Energik)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    value={activityForm.short_description}
                    onChange={(e) => setActivityForm({ ...activityForm, short_description: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ringkasan aturan main dan keseruan aktivitas..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Durasi (Menit)</label>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        value={activityForm.duration_min}
                        onChange={(e) => setActivityForm({ ...activityForm, duration_min: parseInt(e.target.value, 10) || 5 })}
                        className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        value={activityForm.duration_max}
                        onChange={(e) => setActivityForm({ ...activityForm, duration_max: parseInt(e.target.value, 10) || 15 })}
                        className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Perlengkapan / Alat</label>
                    <input
                      type="text"
                      value={activityForm.tools_needed}
                      onChange={(e) => setActivityForm({ ...activityForm, tools_needed: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      placeholder="Kertas, Pulpen atau Tanpa Alat"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowActivityModal(false)}
                    className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-md cursor-pointer"
                  >
                    {editingActivity ? 'Simpan Perubahan' : 'Terbitkan Game'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD USER MODAL */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Tambah Pengguna Baru</h3>
                </div>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Budi Santoso"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Aktif *</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="nama@email.com"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nomor Telepon / WhatsApp</label>
                  <input
                    type="tel"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="081234567890"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Kata Sandi (Password) *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Peran / Role Pengguna</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {rolesList.map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setNewUserForm({ ...newUserForm, role: r })}
                        className={`p-2 rounded-xl border text-[11px] font-bold text-left transition-all cursor-pointer ${
                          newUserForm.role === r
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-300'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {r === 'Admin' ? '👑 Admin' : r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingUser}
                    className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isCreatingUser ? 'Menyimpan...' : 'Tambah Pengguna'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE ACTIVITY CONFIRMATION MODAL */}
      <AnimatePresence>
        {activityToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-rose-200 dark:border-rose-900 shadow-2xl space-y-4 text-center"
            >
              <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Hapus Aktivitas Game?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Apakah Anda yakin ingin menghapus aktivitas <strong>&quot;{activityToDelete.activity_name}&quot;</strong> ({activityToDelete.category})? Tindakan ini akan menghapusnya dari database.
                </p>
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => setActivityToDelete(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDeleteActivity}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Hapus Permanen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESET DATABASE SEED CONFIRMATION MODAL */}
      <AnimatePresence>
        {showResetSeedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-amber-200 dark:border-amber-900/50 shadow-2xl space-y-4 text-center"
            >
              <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <RotateCcw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Reset Database ke Data Bawaan?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Tindakan ini akan mengembalikan seluruh database ke data bawaan awal:
                </p>
                <div className="mt-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[11px] text-amber-800 dark:text-amber-300 text-left space-y-1 font-medium">
                  <div className="flex items-center gap-1.5">✓ <strong>132 Aktivitas Game</strong> lengkap kategori Ice Breaking & Outbound</div>
                  <div className="flex items-center gap-1.5">✓ <strong>10 Activity Packs</strong> terkurasi</div>
                  <div className="flex items-center gap-1.5">✓ <strong>3 Akun Bawaan</strong> (Admin, Trainer, MC)</div>
                  <div className="flex items-center gap-1.5">✓ Sesi workshop sampel</div>
                </div>
                <p className="text-[11px] text-rose-500 font-bold mt-2">
                  ⚠️ Perubahan aktivitas custom yang dibuat sebelumnya akan ditimpa!
                </p>
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetSeedModal(false)}
                  disabled={isResettingSeed}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResetSeed}
                  disabled={isResettingSeed}
                  className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isResettingSeed ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Mereset Data...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Ya, Reset Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
