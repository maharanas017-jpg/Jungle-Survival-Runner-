import React from 'react';
import { Play, Users, Target, ShoppingBag, Settings, HelpCircle, Trophy, Coins } from 'lucide-react';
import { PlayerStats, GameScreen } from '../types';
import { TRANSLATIONS } from '../utils/constants';
import { soundManager } from '../utils/sound';

interface HomeScreenProps {
  stats: PlayerStats;
  onNavigate: (screen: GameScreen) => void;
  onStartGame: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ stats, onNavigate, onStartGame }) => {
  const t = TRANSLATIONS[stats.language];

  const handleBtn = (action: () => void) => {
    soundManager.playClick(stats.soundEnabled);
    action();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-6 bg-gradient-to-b from-emerald-900 via-green-800 to-stone-900 text-white overflow-hidden select-none">
      {/* Decorative Jungle Background Elements */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px]"></div>
      <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar Stats */}
      <div className="w-full flex justify-between items-center z-10 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-500/30 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-emerald-300/80">{t.coins}</div>
            <div className="font-bold text-amber-300 text-lg">{stats.coins}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-yellow-500/20 rounded-xl border border-yellow-500/40 text-yellow-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-emerald-300/80">{t.highScore}</div>
            <div className="font-bold text-yellow-300 text-lg">{stats.highScore}</div>
          </div>
        </div>
      </div>

      {/* Center Logo and Title */}
      <div className="flex flex-col items-center text-center z-10 my-auto">
        <div className="text-6xl mb-3 animate-bounce">🌴🏃‍♂️🐆</div>
        <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-200 to-amber-300 drop-shadow-md">
          {t.gameTitle}
        </h1>
        <p className="text-emerald-300/90 text-sm font-medium tracking-widest uppercase mt-1">
          {t.subtitle}
        </p>

        {/* Play Button */}
        <button
          onClick={() => {
            soundManager.playClick(stats.soundEnabled);
            onStartGame();
          }}
          className="mt-8 group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xl rounded-2xl shadow-xl shadow-orange-900/40 transform active:scale-95 transition-all border-2 border-amber-300/50"
        >
          <Play className="w-7 h-7 fill-slate-950 animate-pulse" />
          <span>{t.play}</span>
          <div className="absolute inset-0 rounded-2xl ring-2 ring-white/30 animate-ping opacity-25"></div>
        </button>
      </div>

      {/* Menu Navigation Grid */}
      <div className="grid grid-cols-3 gap-3 w-full z-10 mb-4">
        <button
          onClick={() => handleBtn(() => onNavigate('characters'))}
          className="flex flex-col items-center justify-center p-3 bg-emerald-950/80 hover:bg-emerald-900/85 border border-emerald-500/30 rounded-2xl backdrop-blur-sm active:scale-95 transition-all shadow-md group"
        >
          <Users className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform mb-1" />
          <span className="text-xs font-semibold text-emerald-200">{t.characters}</span>
        </button>

        <button
          onClick={() => handleBtn(() => onNavigate('missions'))}
          className="flex flex-col items-center justify-center p-3 bg-emerald-950/80 hover:bg-emerald-900/85 border border-emerald-500/30 rounded-2xl backdrop-blur-sm active:scale-95 transition-all shadow-md group"
        >
          <Target className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform mb-1" />
          <span className="text-xs font-semibold text-emerald-200">{t.missions}</span>
        </button>

        <button
          onClick={() => handleBtn(() => onNavigate('shop'))}
          className="flex flex-col items-center justify-center p-3 bg-emerald-950/80 hover:bg-emerald-900/85 border border-emerald-500/30 rounded-2xl backdrop-blur-sm active:scale-95 transition-all shadow-md group"
        >
          <ShoppingBag className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform mb-1" />
          <span className="text-xs font-semibold text-emerald-200">{t.shop}</span>
        </button>

        <button
          onClick={() => handleBtn(() => onNavigate('settings'))}
          className="flex flex-col items-center justify-center p-3 bg-emerald-950/80 hover:bg-emerald-900/85 border border-emerald-500/30 rounded-2xl backdrop-blur-sm active:scale-95 transition-all shadow-md group"
        >
          <Settings className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform mb-1" />
          <span className="text-xs font-semibold text-emerald-200">{t.settings}</span>
        </button>

        <button
          onClick={() => handleBtn(() => onNavigate('tutorial'))}
          className="col-span-2 flex items-center justify-center gap-2 p-3 bg-emerald-950/80 hover:bg-emerald-900/85 border border-emerald-500/30 rounded-2xl backdrop-blur-sm active:scale-95 transition-all shadow-md group"
        >
          <HelpCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-emerald-200">{t.howToPlay}</span>
        </button>
      </div>
    </div>
  );
};
