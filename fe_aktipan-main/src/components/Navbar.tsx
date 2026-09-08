import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Gamepad2, Shield, ShieldAlert, Award, FolderHeart, Laptop, Users, LogIn,
  Home, Compass, Layers, Calendar, BookOpen, ChevronDown, User, LogOut, Menu, X,
  Sun, Moon, Globe, Languages, Settings
} from 'lucide-react';
import { sound } from '../utils/sound';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isLoggedIn: boolean;
  onLoginToggle: () => void;
  userRole: string;
  onRoleChange: (role: string) => void;
  savedActivitiesCount: number;
  userName?: string;
  userPhotoUrl?: string;
  onUpdateProfile?: (name: string, role: string, newPhotoUrl?: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export default function Navbar({
  currentView,
  onNavigate,
  isLoggedIn,
  onLoginToggle,
  userRole,
  onRoleChange,
  savedActivitiesCount,
  userName = 'Andika Pratama',
  userPhotoUrl,
  onUpdateProfile,
  theme,
  onThemeToggle
}: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();
  // Navigation items layout with custom styles & icons
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when view changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentView]);

  const navItems = [
    { 
      view: 'public-home', 
      label: t('Beranda'), 
      icon: Home, 
      activeClass: 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/50 dark:border-blue-900/30', 
      inactiveClass: 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60' 
    },
    { 
      view: 'directory', 
      label: t('Direktori Game'), 
      icon: Compass, 
      activeClass: 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/50 dark:border-blue-900/30', 
      inactiveClass: 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
    },
    { 
      view: 'packs', 
      label: t('Activity Packs'), 
      icon: Layers, 
      activeClass: 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/50 dark:border-blue-900/30', 
      inactiveClass: 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60' 
    },
    { 
      view: 'generator', 
      label: t('AI Generator'), 
      icon: Sparkles, 
      activeClass: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200/50 dark:border-orange-900/30', 
      inactiveClass: 'text-orange-500 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50/30 dark:hover:bg-orange-900/20' 
    },
    ...(isLoggedIn ? [
      { 
        view: 'collections', 
        label: t('Koleksi Saya'), 
        icon: FolderHeart, 
        activeClass: 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/50 dark:border-blue-900/30', 
        inactiveClass: 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60',
        badge: savedActivitiesCount
      },
      { 
        view: 'sessions', 
        label: t('Sesi Acara'), 
        icon: Calendar, 
        activeClass: 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/50 dark:border-blue-900/30', 
        inactiveClass: 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60' 
      }
    ] : []),
    ...(isLoggedIn && userRole === 'Admin' ? [
      { 
        view: 'admin', 
        label: t('👑 Admin Panel'), 
        icon: Shield, 
        activeClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800', 
        inactiveClass: 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-950/30' 
      }
    ] : []),
    { 
      view: 'marketplace', 
      label: t('Talent Marketplace'), 
      icon: Users, 
      activeClass: 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/50 dark:border-blue-900/30', 
      inactiveClass: 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60' 
    },
    { 
      view: 'tutorials', 
      label: t('Tutorial Academy'), 
      icon: BookOpen, 
      activeClass: 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 border-blue-200/50 dark:border-blue-900/30', 
      inactiveClass: 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60' 
    },
    { 
      view: 'live-arena', 
      label: t('Live Arena 🎮'), 
      icon: Gamepad2, 
      activeClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200/50 dark:border-indigo-900/30', 
      inactiveClass: 'text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20',
      pulse: true
    }
  ];

  return (
    <header id="app-header" className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:bg-slate-900/95 dark:border-slate-800 transition-colors">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          id="brand-logo-container" 
          className="flex cursor-pointer items-center space-x-2 shrink-0 select-none"
          onClick={() => onNavigate('public-home')}
        >
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 via-blue-500 to-orange-500 shadow-sm shadow-blue-500/10">
            <Gamepad2 className="h-4.5 w-4.5 text-white animate-bounce-slow" />
          </div>
          <div>
            <span className="text-sm md:text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-none block">
              AKTI<span className="text-orange-500">PAN</span>
            </span>
            <span className="hidden sm:block text-[8px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase leading-none mt-0.5 font-mono">
              ACTIVE & FUN WORKSPACE
            </span>
          </div>
        </div>

        {/* Elegant Icon-only Navigation with Interactive Tooltips (DESKTOP) */}
        <nav className="hidden lg:flex items-center space-x-1.5 px-2 py-1 bg-slate-50/50 border border-slate-100/80 dark:bg-slate-800/50 dark:border-slate-800/80 rounded-xl shadow-inner-sm">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentView === item.view;
            
            return (
              <div key={item.view} className="relative group">
                <button
                  id={`nav-item-desktop-${item.view}`}
                  onClick={item.action ? item.action : () => onNavigate(item.view)}
                  className={`relative flex h-9.5 w-9.5 items-center justify-center rounded-lg border transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? `${item.activeClass} shadow-xs scale-102 border-slate-200 dark:border-slate-700` 
                      : `${item.inactiveClass} border-transparent`
                  }`}
                >
                  <IconComponent className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-105`} />
                  
                  {/* Optional Live Indicator Pulse */}
                  {item.pulse && (
                    <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                  )}

                  {/* Optional Counter Badge (for Saved Items) */}
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 text-[8px] font-black text-white px-1 shadow-sm ring-2 ring-white">
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Highly Polished Floating Tooltip */}
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 translate-y-1 transition-all duration-150 bg-slate-950 text-white text-[10px] font-black tracking-tight py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap z-50 border border-slate-800">
                  {item.label}
                  {/* Small arrow */}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-950 rotate-45 border-t border-l border-slate-800" />
                </div>
              </div>
            );
          })}
        </nav>

        {/* Right actions (Role picker, Auth, & Mobile Hamburger Toggle) */}
        <div className="flex items-center space-x-2">
          {/* Light/Dark Mode Switch */}
          <button
            onClick={onThemeToggle}
            className="flex h-8.5 w-8.5 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer text-slate-600 dark:text-slate-300 shrink-0"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <Moon className="h-4.5 w-4.5" />
            ) : (
              <Sun className="h-4.5 w-4.5 text-amber-400" />
            )}
          </button>

          {/* Language Selector */}
          <button
            onClick={() => {
              sound.playClick();
              setLanguage(language === 'id' ? 'en' : 'id');
            }}
            className="flex items-center space-x-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs font-black text-slate-600 dark:text-slate-300 cursor-pointer shadow-2xs uppercase shrink-0"
            title={language === 'id' ? 'Switch to English' : 'Ubah ke Bahasa Indonesia'}
          >
            <Languages className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="text-[10px] tracking-wide">{language}</span>
          </button>
          {isLoggedIn ? (
            <div className="flex items-center space-x-2">
              <div className="relative flex items-center space-x-2" ref={dropdownRef}>
                {/* The clickable Profile button containing username and role info */}
                <button
                  id="navbar-profile-dropdown-btn"
                  onClick={() => {
                    sound.playClick();
                    setDropdownOpen(!dropdownOpen);
                  }}
                  className="flex items-center space-x-2 text-left cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-[11px] font-black text-slate-900 dark:text-slate-100 flex items-center gap-1">
                      {userName}
                      <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                    <div className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center justify-end gap-0.5 leading-none">
                      <Award className="h-2.5 w-2.5 inline text-blue-500" /> {userRole}
                    </div>
                  </div>
                  {/* Small Avatar bubble to serve as touch/click target on mobile */}
                  <div className="h-8.5 w-8.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm uppercase shadow-sm overflow-hidden">
                    {userPhotoUrl ? (
                      <img src={userPhotoUrl} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      userName ? userName.charAt(0) : 'U'
                    )}
                  </div>
                </button>

                {/* Dropdown Options Box */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 z-50 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <button
                        id="dropdown-profile-btn"
                        onClick={() => {
                          sound.playClick();
                          setDropdownOpen(false);
                          onNavigate('profile');
                        }}
                        className="w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <User className="h-3.5 w-3.5 text-blue-500" />
                        <span>{t('Edit Profile')}</span>
                      </button>
                      <button
                        id="dropdown-settings-btn"
                        onClick={() => {
                          sound.playClick();
                          setDropdownOpen(false);
                          onNavigate('settings');
                        }}
                        className="w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <Settings className="h-3.5 w-3.5 text-blue-500" />
                        <span>{t('Settings')}</span>
                      </button>
                      {userRole === 'Admin' && (
                        <button
                          id="dropdown-admin-btn"
                          onClick={() => {
                            sound.playClick();
                            setDropdownOpen(false);
                            onNavigate('admin');
                          }}
                          className="w-full text-left px-4 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors font-black flex items-center gap-2 cursor-pointer"
                        >
                          <Shield className="h-3.5 w-3.5 text-amber-500" />
                          <span>{t('👑 Admin Panel')}</span>
                        </button>
                      )}
                      <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                      <button
                        id="dropdown-logout-btn"
                        onClick={() => {
                          sound.playClick();
                          setDropdownOpen(false);
                          onLoginToggle();
                        }}
                        className="w-full text-left px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5 text-rose-500" />
                        <span>{t('Keluar (Logout)')}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <button 
                id="navbar-login-btn-direct"
                onClick={() => onNavigate('login')}
                className="inline-flex items-center justify-center space-x-1 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-500 cursor-pointer min-h-[36px]"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{t('Masuk')}</span>
              </button>
              <button 
                id="navbar-register-btn-direct"
                onClick={() => onNavigate('register')}
                className="inline-flex items-center justify-center space-x-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-3.5 py-1.5 text-xs font-black text-white shadow-sm shadow-orange-500/20 transition-all cursor-pointer min-h-[36px]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t('Daftar')}</span>
              </button>
            </div>
          )}

          {/* Hamburger Menu Icon for Mobile screens (< lg) */}
          <button
            id="mobile-hamburger-btn"
            onClick={() => {
              sound.playClick();
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            className="flex lg:hidden h-9.5 w-9.5 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors active:scale-95 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5 text-slate-800 dark:text-slate-200" />
            ) : (
              <Menu className="h-5 w-5 text-slate-800 dark:text-slate-200" />
            )}
          </button>
        </div>
      </div>

      {/* Elegant Responsive Dropdown Drawer (MOBILE) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-nav-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2 max-h-[calc(100vh-4.5rem)] overflow-y-auto">
              {/* Heading */}
              <div className="px-2 pb-2 text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase font-mono">
                {t('Navigasi Menu')}
              </div>

              {/* Navigation Items list */}
              <div className="grid grid-cols-1 gap-1.5">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = currentView === item.view;

                  return (
                    <button
                      id={`mobile-nav-item-${item.view}`}
                      key={item.view}
                      onClick={() => {
                        sound.playClick();
                        if (item.action) {
                          item.action();
                        } else {
                          onNavigate(item.view);
                        }
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer min-h-[44px] ${
                        isActive
                          ? `${item.activeClass} border-slate-200/80 shadow-3xs`
                          : `${item.inactiveClass} border-transparent bg-slate-50/50`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`h-4.5 w-4.5 ${isActive ? 'scale-105' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {item.pulse && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}
                        
                        {typeof item.badge === 'number' && item.badge > 0 && (
                          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white px-1.5 shadow-xs">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Theme & Language row in mobile drawer */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'id' ? 'Tema & Bahasa' : 'Theme & Language'}
                </span>
                <div className="flex items-center space-x-2">
                  {/* Theme Switch */}
                  <button
                    onClick={onThemeToggle}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer text-slate-600 dark:text-slate-300"
                  >
                    {theme === 'light' ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4 text-amber-400" />
                    )}
                  </button>

                  {/* Language Switch */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      setLanguage(language === 'id' ? 'en' : 'id');
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-xs font-black text-slate-600 dark:text-slate-300 cursor-pointer shadow-2xs uppercase"
                  >
                    <Languages className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span>{language}</span>
                  </button>
                </div>
              </div>

              {/* Footer inside mobile menu */}
              {!isLoggedIn ? (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="mobile-menu-login-btn"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onNavigate('login');
                      }}
                      className="w-full text-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-sm"
                    >
                      {t('Masuk')}
                    </button>
                    <button
                      id="mobile-menu-register-btn"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onNavigate('register');
                      }}
                      className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs cursor-pointer shadow-sm"
                    >
                      {t('Daftar')}
                    </button>
                  </div>
                  <button
                    id="mobile-menu-demo-btn"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigate('directory');
                    }}
                    className="w-full text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer transition-all"
                  >
                    {t('Coba Demo Gratis')}
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <button
                    id="mobile-menu-logout-btn"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLoginToggle();
                    }}
                    className="w-full text-center py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 font-bold text-xs cursor-pointer"
                  >
                    {t('Keluar (Logout)')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
