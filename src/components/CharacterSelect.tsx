import React from 'react';
import { ArrowLeft, Coins, Check, Lock, Zap } from 'lucide-react';
import { PlayerStats, Character } from '../types';
import { INITIAL_CHARACTERS, TRANSLATIONS } from '../utils/constants';
import { soundManager } from '../utils/sound';

interface CharacterSelectProps {
  stats: PlayerStats;
  onBack: () => void;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ stats, onBack, onUpdateStats }) => {
  const t = TRANSLATIONS[stats.language];

  const handleSelect = (character: Character) => {
    soundManager.playClick(stats.soundEnabled);
    if (character.unlocked) {
      onUpdateStats({ selectedCharacterId: character.id });
    } else if (stats.coins >= character.price) {
      const newCoins = stats.coins - character.price;
      const newUnlocked = [...stats.unlockedCharacters, character.id];
      onUpdateStats({
        coins: newCoins,
        unlockedCharacters: newUnlocked,
        selectedCharacterId: character.id,
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
          {t.characters}
        </h2>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 font-bold text-sm">
          <Coins className="w-4 h-4" />
          <span>{stats.coins}</span>
        </div>
      </div>

      {/* Character List */}
      <div className="flex flex-col gap-3.5 my-auto pb-4">
        {INITIAL_CHARACTERS.map((char) => {
          const isUnlocked = stats.unlockedCharacters.includes(char.id);
          const isSelected = stats.selectedCharacterId === char.id;

          return (
            <div
              key={char.id}
              onClick={() => handleSelect({ ...char, unlocked: isUnlocked })}
              className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-900/80 border-emerald-400 shadow-lg shadow-emerald-900/50 ring-2 ring-emerald-500/50'
                  : isUnlocked
                  ? 'bg-emerald-950/60 hover:bg-emerald-900/60 border-emerald-500/30'
                  : 'bg-stone-900/80 border-stone-700/50 hover:border-stone-600'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/10"
                  style={{ backgroundColor: char.shirtColor + '33' }}
                >
                  {char.avatar}
                </div>
                <div>
                  <div className="font-bold text-base text-white">{char.name[stats.language]}</div>
                  <div className="text-xs text-emerald-300/80 font-medium mb-1">{char.title[stats.language]}</div>
                  <div className="text-[11px] text-sky-300/90 font-medium mb-1">Denim Jeans & Sports Shoes</div>
                  <div className="flex items-center gap-3 text-[11px] text-amber-300/90 font-semibold">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" /> +{Math.round((char.coinBonus - 1) * 100)}% {t.coins}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {isSelected ? (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl">
                    <Check className="w-4 h-4" />
                    <span>{t.selected}</span>
                  </div>
                ) : isUnlocked ? (
                  <div className="px-3 py-1.5 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 font-semibold text-xs rounded-xl border border-emerald-500/40">
                    {t.select}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{char.price}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
