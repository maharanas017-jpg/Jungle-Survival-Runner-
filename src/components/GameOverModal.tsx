import React from 'react';
import { RotateCcw, Home, Trophy, Coins, Footprints } from 'lucide-react';
import { PlayerStats } from '../types';
import { TRANSLATIONS } from '../utils/constants';
import { soundManager } from '../utils/sound';

interface GameOverModalProps {
  stats: PlayerStats;
  score: number;
  distance: number;
  coinsCollected: number;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  score,
  distance,
  coinsCollected,
  onRestart,
  onHome,
}) => {
  const t = TRANSLATIONS[stats.language];

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 select-none animate-fadeIn">
      <div className="w-full max-w-sm bg-gradient-to-b from-emerald-950 via-green-950 to-slate-950 border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-white flex flex-col items-center">
        <div className="text-5xl mb-2 animate-bounce">💀🌴</div>
        <h2 className="text-3xl font-black text-rose-400 mb-6 drop-shadow">{t.gameOver}</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          <div className="flex flex-col items-center justify-center p-3 bg-emerald-900/40 border border-emerald-500/30 rounded-2xl">
            <Trophy className="w-5 h-5 text-yellow-400 mb-1" />
            <div className="text-[10px] text-emerald-300 uppercase tracking-wider">{t.score}</div>
            <div className="font-black text-xl text-yellow-300">{score}</div>
          </div>

          <div className="flex flex-col items-center justify-center p-3 bg-emerald-900/40 border border-emerald-500/30 rounded-2xl">
            <Footprints className="w-5 h-5 text-emerald-400 mb-1" />
            <div className="text-[10px] text-emerald-300 uppercase tracking-wider">{t.distance}</div>
            <div className="font-black text-xl text-emerald-200">{Math.floor(distance)} m</div>
          </div>

          <div className="col-span-2 flex items-center justify-between p-3 bg-amber-500/15 border border-amber-500/40 rounded-2xl px-6">
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-amber-400" />
              <span className="text-xs text-amber-200 font-bold uppercase">{t.coinsEarned}</span>
            </div>
            <div className="font-black text-2xl text-amber-300">+{coinsCollected}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => {
              soundManager.playClick(stats.soundEnabled);
              onRestart();
            }}
            className="flex items-center justify-center gap-2 w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-lg rounded-xl shadow-xl shadow-amber-900/40 transition-all active:scale-95"
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
