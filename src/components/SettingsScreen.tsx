import React from 'react';
import { ArrowLeft, Volume2, VolumeX, Music, Globe, RotateCcw } from 'lucide-react';
import { PlayerStats, Language } from '../types';
import { TRANSLATIONS } from '../utils/constants';
import { soundManager } from '../utils/sound';

interface SettingsScreenProps {
  stats: PlayerStats;
  onBack: () => void;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
  onReset: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ stats, onBack, onUpdateStats, onReset }) => {
  const t = TRANSLATIONS[stats.language];

  const toggleSound = () => {
    const next = !stats.soundEnabled;
    soundManager.playClick(next);
    onUpdateStats({ soundEnabled: next });
  };

  const toggleMusic = () => {
    soundManager.playClick(stats.soundEnabled);
    const next = !stats.musicEnabled;
    if (next) {
      soundManager.startMusic(true);
    } else {
      soundManager.stopMusic();
    }
    onUpdateStats({ musicEnabled: next });
  };

  const changeLanguage = (lang: Language) => {
    soundManager.playClick(stats.soundEnabled);
    onUpdateStats({ language: lang });
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 bg-gradient-to-b from-emerald-950 via-green-900 to-slate-950 text-white overflow-y-auto select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            soundManager.playClick(stats.soundEnabled);
            onBack();
          }}
          className="p-2.5 bg-emerald-900/60 hover:bg-emerald-800/80 rounded-xl border border-emerald-500/30 text-emerald-300 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-amber-300">
          {t.settings}
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Settings Options */}
      <div className="flex flex-col gap-4 my-auto pb-4">
        {/* Language Selection */}
        <div className="flex items-center justify-between p-4 bg-emerald-950/70 border border-emerald-500/30 rounded-2xl shadow-md">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-emerald-400" />
            <span className="font-semibold text-sm">{t.language}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeLanguage('hi')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                stats.language === 'hi'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                stats.language === 'en'
                  ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Sound FX Toggle */}
        <div className="flex items-center justify-between p-4 bg-emerald-950/70 border border-emerald-500/30 rounded-2xl shadow-md">
          <div className="flex items-center gap-3">
            {stats.soundEnabled ? <Volume2 className="w-6 h-6 text-emerald-400" /> : <VolumeX className="w-6 h-6 text-rose-400" />}
            <span className="font-semibold text-sm">{t.sound}</span>
          </div>
          <button
            onClick={toggleSound}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-all ${
              stats.soundEnabled ? 'bg-emerald-500 justify-end' : 'bg-stone-700 justify-start'
            }`}
          >
            <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
          </button>
        </div>

        {/* Music Toggle */}
        <div className="flex items-center justify-between p-4 bg-emerald-950/70 border border-emerald-500/30 rounded-2xl shadow-md">
          <div className="flex items-center gap-3">
            <Music className="w-6 h-6 text-emerald-400" />
            <span className="font-semibold text-sm">{t.music}</span>
          </div>
          <button
            onClick={toggleMusic}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-all ${
              stats.musicEnabled ? 'bg-emerald-500 justify-end' : 'bg-stone-700 justify-start'
            }`}
          >
            <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
          </button>
        </div>

        {/* Reset Progress */}
        <div className="flex items-center justify-between p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl shadow-md mt-6">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-6 h-6 text-rose-400" />
            <span className="font-semibold text-sm text-rose-200">{t.resetProgress}</span>
          </div>
          <button
            onClick={() => {
              if (window.confirm(t.confirmReset)) {
                onReset();
              }
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            रीसेट
          </button>
        </div>
      </div>
    </div>
  );
};
