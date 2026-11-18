import React from 'react';
import { ArrowLeft, Coins, Zap, ArrowUpCircle } from 'lucide-react';
import { PlayerStats } from '../types';
import { INITIAL_POWERUPS, TRANSLATIONS } from '../utils/constants';
import { soundManager } from '../utils/sound';

interface ShopScreenProps {
  stats: PlayerStats;
  onBack: () => void;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({ stats, onBack, onUpdateStats }) => {
  const t = TRANSLATIONS[stats.language];

  const handleUpgrade = (powerUpId: 'magnet' | 'shield' | 'speed' | 'doubleCoin') => {
    soundManager.playClick(stats.soundEnabled);
    const currentLevel = stats.powerUpLevels[powerUpId];
    const powerUpDef = INITIAL_POWERUPS.find((p) => p.id === powerUpId);
    if (!powerUpDef) return;

    if (currentLevel >= powerUpDef.maxLevel) return;

    const cost = powerUpDef.cost * currentLevel;
    if (stats.coins >= cost) {
      const newCoins = stats.coins - cost;
      const newLevels = { ...stats.powerUpLevels, [powerUpId]: currentLevel + 1 };
      onUpdateStats({
        coins: newCoins,
        powerUpLevels: newLevels,
      });
      soundManager.playPowerUp(stats.soundEnabled);
    } else {
      soundManager.playCrash(stats.soundEnabled);
      alert(t.notEnoughCoins);
    }
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
          {t.shop}
        </h2>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 font-bold text-sm">
          <Coins className="w-4 h-4" />
          <span>{stats.coins}</span>
        </div>
      </div>

      {/* PowerUps List */}
      <div className="flex flex-col gap-3.5 my-auto pb-4">
        {INITIAL_POWERUPS.map((pu) => {
          const currentLevel = stats.powerUpLevels[pu.id];
          const isMax = currentLevel >= pu.maxLevel;
          const cost = pu.cost * currentLevel;

          return (
            <div
              key={pu.id}
              className="flex items-center justify-between p-4 bg-emerald-950/70 border border-emerald-500/30 rounded-2xl shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-900/60 border border-emerald-500/40 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                  {pu.icon}
                </div>
                <div>
                  <div className="font-bold text-base text-white">{pu.name[stats.language]}</div>
                  <div className="text-xs text-emerald-300/80 mb-1">{pu.description[stats.language]}</div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <span>{t.level}: {currentLevel}/{pu.maxLevel}</span>
                  </div>
                </div>
              </div>

              <div>
                {isMax ? (
                  <div className="px-3 py-1.5 bg-emerald-900/80 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-700">
                    MAX
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(pu.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    <span>{cost}</span>
                    <Coins className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
