import React from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';
import { PlayerStats } from '../types';
import { TRANSLATIONS } from '../utils/constants';
import { soundManager } from '../utils/sound';

interface PauseModalProps {
  stats: PlayerStats;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({ stats, onResume, onRestart, onHome }) => {
  const t = TRANSLATIONS[stats.language];

  return (
    <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6 select-none animate-fadeIn">
      <div className="w-full max-w-xs bg-gradient-to-b from-emerald-900 to-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-white flex flex-col items-center">
        <h2 className="text-2xl font-black text-amber-300 mb-6">{t.pause}</h2>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => {
              soundManager.playClick(stats.soundEnabled);
              onResume();
            }}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>{t.resume}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick(stats.soundEnabled);
              onRestart();
            }}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{t.restart}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick(stats.soundEnabled);
              onHome();
            }}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl shadow-lg transition-all active:scale-95 border border-stone-700"
          >
            <Home className="w-5 h-5" />
            <span>{t.home}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
