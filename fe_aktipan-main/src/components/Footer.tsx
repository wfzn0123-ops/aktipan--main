import React from 'react';
import { sound } from '../utils/sound';
import { useLanguage } from '../contexts/LanguageContext';

interface FooterProps {
  onOpenTerms: (tab: 'terms' | 'disclaimer' | 'privacy') => void;
}

export default function Footer({ onOpenTerms }: FooterProps) {
  const { t } = useLanguage();

  return (
    <footer id="app-footer" className="bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between border-b border-slate-800 pb-8 gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white select-none">
              AKTI<span className="text-orange-500">PAN</span>
            </span>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              {t('Platform direktori aktivitas interaktif siap pakai yang mengubah peserta pasif menjadi partisipan aktif dan ceria.')}
            </p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm">
            <span className="text-white font-semibold">{t('Tujuan Acara:')}</span>
            <span>{t('Ice Breaking')}</span>
            <span>{t('Energizer')}</span>
            <span>{t('Team Building')}</span>
            <span>{t('Seminar')}</span>
            <span>{t('Travel Games')}</span>
            <span>{t('Wedding Games')}</span>
          </div>
        </div>
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between text-[11px] sm:text-xs text-slate-500 gap-4 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5">
            <span>&copy; {new Date().getFullYear()} AKTIPAN. {t('Semangat Partisipan Aktif & Fun.')}</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              {t('Dibuat oleh')}
              <a 
                href="https://contech.id" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-orange-500 hover:text-orange-400 font-bold transition-colors hover:underline"
              >
                Contech ID
              </a>
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 font-medium">
            <span 
              onClick={() => { sound.playClick(); onOpenTerms('disclaimer'); }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t('Sangkalan (Disclaimer)')}
            </span>
            <span 
              onClick={() => { sound.playClick(); onOpenTerms('terms'); }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t('Syarat & Ketentuan')}
            </span>
            <span 
              onClick={() => { sound.playClick(); onOpenTerms('privacy'); }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {t('Kebijakan Privasi')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
