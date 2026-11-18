/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlayerStats, GameScreen } from './types';
import { HomeScreen } from './components/HomeScreen';
import { CharacterSelect } from './components/CharacterSelect';
import { MissionScreen } from './components/MissionScreen';
import { ShopScreen } from './components/ShopScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { HowToPlayModal } from './components/HowToPlayModal';
import { ThreeGameCanvas } from './components/ThreeGameCanvas';
import { soundManager } from './utils/sound';

const STORAGE_KEY = 'jungle_survival_runner_save_v1';

const DEFAULT_STATS: PlayerStats = {
  coins: 50,
  highScore: 0,
  maxDistance: 0,
  selectedCharacterId: 'leo',
  language: 'hi', // Default language Hindi as requested
  soundEnabled: true,
  musicEnabled: false,
  unlockedCharacters: ['leo'],
  completedMissions: [],
  claimedMissions: [],
  powerUpLevels: {
    magnet: 1,
    shield: 1,
    speed: 1,
    doubleCoin: 1,
  },
};

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('home');
  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_STATS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_STATS;
  });

  // Save to localStorage whenever stats change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error(e);
    }
  }, [stats]);

  const updateStats = (newValues: Partial<PlayerStats>) => {
    setStats((prev) => ({ ...prev, ...newValues }));
  };

  const handleReset = () => {
    setStats(DEFAULT_STATS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-slate-950 overflow-hidden select-none">
      {/* Mobile Portrait 9:16 Container */}
      <div className="relative w-full h-full max-w-md max-h-[900px] sm:h-[90vh] sm:rounded-3xl sm:border-4 sm:border-emerald-800 shadow-2xl overflow-hidden bg-slate-900 flex flex-col">
        {screen === 'home' && (
          <HomeScreen
            stats={stats}
            onNavigate={(s) => setScreen(s)}
            onStartGame={() => setScreen('game')}
          />
        )}

        {screen === 'game' && (
          <ThreeGameCanvas
            stats={stats}
            onUpdateStats={updateStats}
            onHome={() => setScreen('home')}
          />
        )}

        {screen === 'characters' && (
          <CharacterSelect
            stats={stats}
            onBack={() => setScreen('home')}
            onUpdateStats={updateStats}
          />
        )}

        {screen === 'missions' && (
          <MissionScreen
            stats={stats}
            onBack={() => setScreen('home')}
            onUpdateStats={updateStats}
          />
        )}

        {screen === 'shop' && (
          <ShopScreen
            stats={stats}
            onBack={() => setScreen('home')}
            onUpdateStats={updateStats}
          />
        )}

        {screen === 'settings' && (
          <SettingsScreen
            stats={stats}
            onBack={() => setScreen('home')}
            onUpdateStats={updateStats}
            onReset={handleReset}
          />
        )}

        {screen === 'tutorial' && (
          <HowToPlayModal
            stats={stats}
            onBack={() => setScreen('home')}
          />
        )}
      </div>
    </div>
  );
}
