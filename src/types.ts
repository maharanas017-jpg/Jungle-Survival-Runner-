export type GameScreen = 'home' | 'game' | 'characters' | 'missions' | 'shop' | 'settings' | 'tutorial';

export type Language = 'hi' | 'en';

export interface Character {
  id: string;
  name: { hi: string; en: string };
  title: { hi: string; en: string };
  price: number;
  unlocked: boolean;
  avatar: string;
  color: string;
  shirtColor: string;
  hairColor: string;
  speedBonus: number;
  coinBonus: number;
  jumpPower: number;
}

export interface Mission {
  id: number;
  title: { hi: string; en: string };
  description: { hi: string; en: string };
  targetType: 'distance' | 'coins' | 'obstacles' | 'score';
  targetValue: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
}

export interface PowerUpUpgrade {
  id: 'magnet' | 'shield' | 'speed' | 'doubleCoin';
  name: { hi: string; en: string };
  level: number;
  maxLevel: number;
  cost: number;
  duration: number; // in seconds
  description: { hi: string; en: string };
  icon: string;
}

export interface PlayerStats {
  coins: number;
  highScore: number;
  maxDistance: number;
  selectedCharacterId: string;
  language: Language;
  soundEnabled: boolean;
  musicEnabled: boolean;
  unlockedCharacters: string[];
  completedMissions: number[];
  claimedMissions: number[];
  powerUpLevels: {
    magnet: number;
    shield: number;
    speed: number;
    doubleCoin: number;
  };
}

export interface ActivePowerUps {
  magnet: number; // time remaining in ms
  shield: number;
  speed: number;
  doubleCoin: number;
}

export interface Obstacle {
  id: string;
  lane: number; // 0: left, 1: center, 2: right
  z: number; // depth from 0 (far) to 1 (near player)
  type: 'log' | 'rock' | 'branch' | 'hole' | 'crocodile' | 'snake' | 'boar';
  width: number;
  height: number;
}

export interface Coin {
  id: string;
  lane: number;
  z: number;
  collected: boolean;
}

export interface PowerUpItem {
  id: string;
  lane: number;
  z: number;
  type: 'magnet' | 'shield' | 'speed' | 'doubleCoin';
  collected: boolean;
}
