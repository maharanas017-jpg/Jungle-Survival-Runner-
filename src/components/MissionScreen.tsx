import React from 'react';
import { ArrowLeft, Target, Coins, CheckCircle, Award } from 'lucide-react';
import { PlayerStats, Mission } from '../types';
import { INITIAL_MISSIONS, TRANSLATIONS } from '../utils/constants';
import { soundManager } from '../utils/sound';

interface MissionScreenProps {
  stats: PlayerStats;
  onBack: () => void;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
}

export const MissionScreen: React.FC<MissionScreenProps> = ({ stats, onBack, onUpdateStats }) => {
  const t = TRANSLATIONS[stats.language];

  const handleClaim = (mission: Mission) => {
    soundManager.playClick(stats.soundEnabled);
    if (stats.completedMissions.includes(mission.id) && !stats.claimedMissions.includes(mission.id)) {
      const newCoins = stats.coins + mission.reward;
      const newClaimed = [...stats.claimedMissions, mission.id];
      onUpdateStats({
        coins: newCoins,
        claimedMissions: newClaimed,
      });
      soundManager.playPowerUp(stats.soundEnabled);
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
          {t.missions} (30)
        </h2>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 font-bold text-sm">
          <Coins className="w-4 h-4" />
          <span>{stats.coins}</span>
        </div>
      </div>

      {/* Missions List */}
      <div className="flex flex-col gap-3 my-auto pb-4">
        {INITIAL_MISSIONS.map((mission) => {
          const isCompleted = stats.completedMissions.includes(mission.id);
          const isClaimed = stats.claimedMissions.includes(mission.id);

          return (
            <div
              key={mission.id}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                isClaimed
                  ? 'bg-emerald-950/40 border-emerald-500/20 opacity-70'
                  : isCompleted
                  ? 'bg-emerald-900/70 border-emerald-400 shadow-lg shadow-emerald-900/40 ring-1 ring-emerald-400'
                  : 'bg-emerald-950/70 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border ${
                    isClaimed
                      ? 'bg-emerald-950 border-emerald-800 text-emerald-600'
                      : isCompleted
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
                      : 'bg-emerald-900/50 border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">{mission.title[stats.language]}</div>
                  <div className="text-xs text-emerald-300/80 mb-1">{mission.description[stats.language]}</div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
                    <Coins className="w-3.5 h-3.5" />
                    <span>+{mission.reward}</span>
                  </div>
                </div>
              </div>

              <div>
                {isClaimed ? (
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-950 text-emerald-500 font-bold text-xs rounded-xl border border-emerald-800">
                    <CheckCircle className="w-4 h-4" />
                    <span>{t.claimed}</span>
                  </div>
                ) : isCompleted ? (
                  <button
                    onClick={() => handleClaim(mission)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>{t.claimReward}</span>
                  </button>
                ) : (
                  <div className="px-3 py-1.5 bg-stone-900/60 text-stone-400 font-semibold text-xs rounded-xl border border-stone-800">
                    प्रगति पर
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
