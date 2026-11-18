import React from 'react';
import { ArrowLeft, Hand, Keyboard, CheckCircle } from 'lucide-react';
import { PlayerStats } from '../types';
import { TRANSLATIONS } from '../utils/constants';
import { soundManager } from '../utils/sound';

interface HowToPlayModalProps {
  stats: PlayerStats;
  onBack: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ stats, onBack }) => {
  const t = TRANSLATIONS[stats.language];

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
          {t.howToPlay}
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Instructions list */}
      <div className="flex flex-col gap-4 my-auto pb-4">
        <div className="flex items-start gap-3.5 p-4 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl shadow-md">
          <Hand className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-amber-300 mb-1">मोबाइल नियंत्रण (Mobile Controls)</div>
            <ul className="text-xs text-emerald-200/90 space-y-1.5 list-disc pl-4">
              <li>{t.tutorialSwipeLeft}</li>
              <li>{t.tutorialSwipeRight}</li>
              <li>{t.tutorialSwipeUp}</li>
              <li>{t.tutorialSwipeDown}</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-4 bg-emerald-950/80 border border-emerald-500/30 rounded-2xl shadow-md">
          <Keyboard className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-emerald-300 mb-1">कीबोर्ड नियंत्रण (Desktop Controls)</div>
            <p className="text-xs text-emerald-200/90">{t.tutorialKeys}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          soundManager.playClick(stats.soundEnabled);
          onBack();
        }}
        className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-amber-900/40 transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        <CheckCircle className="w-5 h-5" />
        <span>{t.okGotIt}</span>
      </button>
    </div>
  );
};
