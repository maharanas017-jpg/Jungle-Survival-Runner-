import React, { useEffect, useRef, useState } from 'react';
import { Pause, Heart, Shield, Zap, Magnet, Coins, Trophy } from 'lucide-react';
import { PlayerStats, ActivePowerUps, Obstacle, Coin, PowerUpItem } from '../types';
import { INITIAL_CHARACTERS, INITIAL_MISSIONS, TRANSLATIONS } from '../utils/constants';
import { soundManager } from '../utils/sound';
import { PauseModal } from './PauseModal';
import { GameOverModal } from './GameOverModal';

interface GameCanvasProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
  onHome: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ stats, onUpdateStats, onHome }) => {
  const t = TRANSLATIONS[stats.language];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game UI State
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [lives, setLives] = useState(3);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUps>({
    magnet: 0,
    shield: 0,
    speed: 0,
    doubleCoin: 0,
  });

  // Mutable game refs for 60fps loop
  const gameStateRef = useRef({
    lane: 1, // 0: left, 1: center, 2: right
    targetLane: 1,
    yOffset: 0, // for jump
    yVelocity: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
    speed: 6.5,
    distance: 0,
    score: 0,
    coins: 0,
    lives: 3,
    obstacles: [] as Obstacle[],
    coinsList: [] as Coin[],
    powerUpsList: [] as PowerUpItem[],
    activePowerUps: { magnet: 0, shield: 0, speed: 0, doubleCoin: 0 } as ActivePowerUps,
    spawnTimer: 0,
    shieldActive: false,
    animFrame: 0,
  });

  const character = INITIAL_CHARACTERS.find((c) => c.id === stats.selectedCharacterId) || INITIAL_CHARACTERS[0];

  // Touch / Swipe handling variables
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || isGameOver) return;
      const state = gameStateRef.current;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (state.targetLane > 0) {
          state.targetLane--;
          soundManager.playClick(stats.soundEnabled);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (state.targetLane < 2) {
          state.targetLane++;
          soundManager.playClick(stats.soundEnabled);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        if (!state.isJumping && !state.isSliding) {
          state.isJumping = true;
          state.yVelocity = 13 * character.jumpPower;
          soundManager.playJump(stats.soundEnabled);
        }
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        if (!state.isJumping && !state.isSliding) {
          state.isSliding = true;
          state.slideTimer = 50; // frames
          soundManager.playSlide(stats.soundEnabled);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, isGameOver, stats.soundEnabled, character]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isPaused || isGameOver) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const state = gameStateRef.current;

    const threshold = 30;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > threshold && state.targetLane < 2) {
        state.targetLane++;
        soundManager.playClick(stats.soundEnabled);
      } else if (dx < -threshold && state.targetLane > 0) {
        state.targetLane--;
        soundManager.playClick(stats.soundEnabled);
      }
    } else {
      if (dy < -threshold && !state.isJumping && !state.isSliding) {
        state.isJumping = true;
        state.yVelocity = 13 * character.jumpPower;
        soundManager.playJump(stats.soundEnabled);
      } else if (dy > threshold && !state.isJumping && !state.isSliding) {
        state.isSliding = true;
        state.slideTimer = 50;
        soundManager.playSlide(stats.soundEnabled);
      }
    }
  };

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let bgOffset = 0;

    const state = gameStateRef.current;

    const gameLoop = () => {
      if (!isPaused && !isGameOver) {
        state.animFrame++;
        // Update physics & positions
        const speedMultiplier = state.activePowerUps.speed > 0 ? 1.6 : character.speedBonus;
        const currentSpeed = state.speed * speedMultiplier;

        state.distance += currentSpeed * 0.1;
        state.score += Math.floor(currentSpeed * 0.5);
        setDistance(state.distance);
        setScore(state.score);

        // Smooth lane transition
        const laneDiff = state.targetLane - state.lane;
        state.lane += laneDiff * 0.25;

        // Jump physics
        if (state.isJumping) {
          state.yOffset += state.yVelocity;
          state.yVelocity -= 0.85; // gravity
          if (state.yOffset <= 0) {
            state.yOffset = 0;
            state.isJumping = false;
          }
        }

        // Slide timer
        if (state.isSliding) {
          state.slideTimer--;
          if (state.slideTimer <= 0) {
            state.isSliding = false;
          }
        }

        // Power-ups countdown
        ['magnet', 'shield', 'speed', 'doubleCoin'].forEach((key) => {
          const k = key as keyof ActivePowerUps;
          if (state.activePowerUps[k] > 0) {
            state.activePowerUps[k] -= 16;
            if (state.activePowerUps[k] < 0) state.activePowerUps[k] = 0;
          }
        });
        setActivePowerUps({ ...state.activePowerUps });

        // Spawn obstacles & items
        state.spawnTimer++;
        if (state.spawnTimer > Math.max(30, 70 - Math.floor(state.distance / 200))) {
          state.spawnTimer = 0;
          const lane = Math.floor(Math.random() * 3);
          const types: ('log' | 'rock' | 'branch' | 'hole' | 'crocodile' | 'snake' | 'boar')[] = [
            'log',
            'rock',
            'branch',
            'hole',
            'crocodile',
            'snake',
            'boar',
          ];
          const type = types[Math.floor(Math.random() * types.length)];

          state.obstacles.push({
            id: Math.random().toString(),
            lane,
            z: 0.05,
            type,
            width: 55,
            height: 55,
          });

          // Spawn coins
          if (Math.random() > 0.25) {
            const coinLane = Math.random() > 0.5 ? lane : (lane + 1) % 3;
            for (let i = 0; i < 3; i++) {
              state.coinsList.push({
                id: Math.random().toString(),
                lane: coinLane,
                z: 0.05 + i * 0.03,
                collected: false,
              });
            }
          }

          // Spawn powerup occasionally
          if (Math.random() > 0.85) {
            const puTypes: ('magnet' | 'shield' | 'speed' | 'doubleCoin')[] = ['magnet', 'shield', 'speed', 'doubleCoin'];
            const puType = puTypes[Math.floor(Math.random() * puTypes.length)];
            state.powerUpsList.push({
              id: Math.random().toString(),
              lane: (lane + 2) % 3,
              z: 0.05,
              type: puType,
              collected: false,
            });
          }
        }

        // Move obstacles
        const approachSpeed = 0.016 * (currentSpeed / 6.5);
        state.obstacles.forEach((obs) => {
          obs.z += approachSpeed;
        });
        state.coinsList.forEach((coin) => {
          coin.z += approachSpeed;
        });
        state.powerUpsList.forEach((pu) => {
          pu.z += approachSpeed;
        });

        // Magnet attraction
        if (state.activePowerUps.magnet > 0) {
          state.coinsList.forEach((coin) => {
            if (!coin.collected && coin.z > 0.6 && coin.z < 0.95) {
              if (Math.abs(coin.lane - Math.round(state.lane)) <= 1) {
                coin.lane = state.lane;
                if (coin.z > 0.82) {
                  coin.collected = true;
                  const addCoins = state.activePowerUps.doubleCoin > 0 ? 2 : 1;
                  state.coins += addCoins;
                  setCoinsCollected(state.coins);
                  soundManager.playCoin(stats.soundEnabled);
                }
              }
            }
          });
        }

        // Collision detection with player at z ~ 0.85
        const playerLaneRounded = Math.round(state.lane);

        state.obstacles = state.obstacles.filter((obs) => {
          if (obs.z >= 0.80 && obs.z <= 0.92 && Math.round(obs.lane) === playerLaneRounded) {
            const isAirborne = state.yOffset > 30;
            const isSlidingActive = state.isSliding;

            let hit = true;
            if (obs.type === 'branch' && isSlidingActive) hit = false;
            if ((obs.type === 'log' || obs.type === 'rock' || obs.type === 'hole' || obs.type === 'crocodile' || obs.type === 'snake' || obs.type === 'boar') && isAirborne) hit = false;

            if (hit) {
              if (state.activePowerUps.shield > 0 || state.shieldActive) {
                state.activePowerUps.shield = 0;
                state.shieldActive = false;
                soundManager.playCrash(stats.soundEnabled);
                return false;
              } else {
                state.lives--;
                setLives(state.lives);
                soundManager.playCrash(stats.soundEnabled);
                if (state.lives <= 0) {
                  setIsGameOver(true);
                  soundManager.playGameOver(stats.soundEnabled);
                }
                return false;
              }
            }
          }
          return obs.z < 1.1;
        });

        // Check coin collection
        state.coinsList = state.coinsList.filter((coin) => {
          if (!coin.collected && coin.z >= 0.80 && coin.z <= 0.92 && Math.round(coin.lane) === playerLaneRounded) {
            coin.collected = true;
            const addCoins = state.activePowerUps.doubleCoin > 0 ? 2 : 1;
            state.coins += addCoins;
            setCoinsCollected(state.coins);
            soundManager.playCoin(stats.soundEnabled);
            return false;
          }
          return coin.z < 1.1;
        });

        // Check powerup collection
        state.powerUpsList = state.powerUpsList.filter((pu) => {
          if (!pu.collected && pu.z >= 0.80 && pu.z <= 0.92 && Math.round(pu.lane) === playerLaneRounded) {
            pu.collected = true;
            soundManager.playPowerUp(stats.soundEnabled);
            const upgradeLevel = stats.powerUpLevels[pu.type as keyof typeof stats.powerUpLevels] || 1;
            const duration = 5000 + upgradeLevel * 1000;
            state.activePowerUps[pu.type as keyof ActivePowerUps] = duration;
            if (pu.type === 'shield') state.shieldActive = true;
            return false;
          }
          return pu.z < 1.1;
        });
      }

      // --- RENDER CANVAS ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Sky & Background gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#064e3b');
      skyGrad.addColorStop(0.5, '#047857');
      skyGrad.addColorStop(1, '#166534');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Background jungle parallax trees & hills
      bgOffset = (bgOffset + (isPaused || isGameOver ? 0 : 0.8)) % canvas.width;
      ctx.fillStyle = '#022c22';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.45);
      for (let x = 0; x <= canvas.width + 40; x += 40) {
        ctx.lineTo(x, canvas.height * 0.35 + Math.sin((x + bgOffset) * 0.02) * 20);
      }
      ctx.lineTo(canvas.width, canvas.height * 0.5);
      ctx.lineTo(0, canvas.height * 0.5);
      ctx.fill();

      // 2. Perspective Ground & Lanes
      const horizonY = canvas.height * 0.45;
      const groundGrad = ctx.createLinearGradient(0, horizonY, 0, canvas.height);
      groundGrad.addColorStop(0, '#14532d');
      groundGrad.addColorStop(1, '#064e3b');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, horizonY, canvas.width, canvas.height - horizonY);

      // Jungle Road / Paths (3 lanes perspective)
      const bottomWidth = canvas.width * 0.85;
      const topWidth = canvas.width * 0.2;
      const centerX = canvas.width / 2;

      ctx.fillStyle = '#1e293b'; // jungle dirt path
      ctx.beginPath();
      ctx.moveTo(centerX - topWidth / 2, horizonY);
      ctx.lineTo(centerX + topWidth / 2, horizonY);
      ctx.lineTo(centerX + bottomWidth / 2, canvas.height);
      ctx.lineTo(centerX - bottomWidth / 2, canvas.height);
      ctx.fill();

      // Lane dividers
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.setLineDash([15, 15]);
      ctx.lineDashOffset = -(bgOffset * 2.5) % 30;

      ctx.beginPath();
      ctx.moveTo(centerX - topWidth / 6, horizonY);
      ctx.lineTo(centerX - bottomWidth / 6, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX + topWidth / 6, horizonY);
      ctx.lineTo(centerX + bottomWidth / 6, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Render Coins
      state.coinsList.forEach((coin) => {
        if (coin.collected) return;
        const z = coin.z;
        const laneX = centerX + (coin.lane - 1) * (topWidth + (bottomWidth - topWidth) * z) * 0.33;
        const y = horizonY + (canvas.height - horizonY) * z;
        const size = 12 * (0.5 + z * 0.5);

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(laneX, y - size, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // 4. Render PowerUps
      state.powerUpsList.forEach((pu) => {
        if (pu.collected) return;
        const z = pu.z;
        const laneX = centerX + (pu.lane - 1) * (topWidth + (bottomWidth - topWidth) * z) * 0.33;
        const y = horizonY + (canvas.height - horizonY) * z;
        const size = 18 * (0.5 + z * 0.5);

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(laneX, y - size, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.floor(size * 1.2)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pu.type === 'magnet' ? '🧲' : pu.type === 'shield' ? '🛡️' : pu.type === 'speed' ? '⚡' : '🪙', laneX, y - size);
      });

      // 5. Render Obstacles
      state.obstacles.forEach((obs) => {
        const z = obs.z;
        const laneX = centerX + (obs.lane - 1) * (topWidth + (bottomWidth - topWidth) * z) * 0.33;
        const y = horizonY + (canvas.height - horizonY) * z;
        const scale = 0.4 + z * 0.6;
        const w = obs.width * scale;
        const h = obs.height * scale;

        ctx.save();
        ctx.translate(laneX - w / 2, y - h);

        if (obs.type === 'log') {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(0, h * 0.4, w, h * 0.6);
          ctx.fillStyle = '#92400e';
          ctx.fillRect(w * 0.1, h * 0.5, w * 0.8, h * 0.4);
        } else if (obs.type === 'rock') {
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'branch') {
          ctx.fillStyle = '#065f46';
          ctx.fillRect(0, 0, w, h * 0.3);
        } else if (obs.type === 'hole') {
          ctx.fillStyle = '#020617';
          ctx.beginPath();
          ctx.ellipse(w / 2, h / 2, w / 2, h / 3, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#b91c1c';
          ctx.fillRect(0, h * 0.3, w, h * 0.7);
        }

        ctx.restore();
      });

      // 6. RENDER REAL RUNNING CHARACTER WITH STRIDE ANIMATION
      const playerZ = 0.85;
      const playerLaneX = centerX + (state.lane - 1) * (topWidth + (bottomWidth - topWidth) * playerZ) * 0.33;
      const playerY = horizonY + (canvas.height - horizonY) * playerZ - state.yOffset * 1.8;

      ctx.save();
      ctx.translate(playerLaneX, playerY);

      // Running bobbing cycle
      const runCycle = isPaused || isGameOver ? 0 : state.animFrame * 0.35;
      const bob = state.isJumping ? 0 : state.isSliding ? 0 : Math.sin(runCycle) * 6;
      const lean = (state.targetLane - state.lane) * 0.15; // lean into lane change

      ctx.rotate(lean);

      const explorerColor = character.color;

      if (state.isSliding) {
        // --- SLIDING POSE ---
        ctx.fillStyle = explorerColor;
        ctx.fillRect(-22, -25, 44, 25); // flattened body
        // Head
        ctx.beginPath();
        ctx.arc(-15, -35, 14, 0, Math.PI * 2);
        ctx.fill();
        // Hat
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-26, -48, 24, 6);
      } else if (state.isJumping) {
        // --- JUMPING POSE ---
        ctx.fillStyle = explorerColor;
        // Torso tucked
        ctx.fillRect(-16, -65, 32, 40);
        // Head
        ctx.beginPath();
        ctx.arc(0, -82, 16, 0, Math.PI * 2);
        ctx.fill();
        // Hat
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-14, -98, 28, 7);
        // Arms up
        ctx.strokeStyle = explorerColor;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-12, -55);
        ctx.lineTo(-28, -75);
        ctx.moveTo(12, -55);
        ctx.lineTo(28, -75);
        ctx.stroke();
        // Legs tucked up
        ctx.beginPath();
        ctx.moveTo(-8, -25);
        ctx.lineTo(-18, -10);
        ctx.moveTo(8, -25);
        ctx.lineTo(18, -10);
        ctx.stroke();
      } else {
        // --- REAL RUNNING POSE (STRIDE CYCLE) ---
        const legAngle1 = Math.sin(runCycle) * 0.8;
        const legAngle2 = Math.sin(runCycle + Math.PI) * 0.8;
        const armAngle1 = Math.sin(runCycle + Math.PI) * 0.8;
        const armAngle2 = Math.sin(runCycle) * 0.8;

        // Torso with vertical bob
        ctx.fillStyle = explorerColor;
        ctx.fillRect(-16, -70 + bob, 32, 45);

        // Backpack / Explorer vest details
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-14, -62 + bob, 8, 25);

        // Head
        ctx.fillStyle = '#fde047'; // skin tone
        ctx.beginPath();
        ctx.arc(0, -88 + bob, 15, 0, Math.PI * 2);
        ctx.fill();

        // Explorer Hat / Hair
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-16, -106 + bob, 32, 8);
        ctx.fillRect(-10, -116 + bob, 20, 12);

        // Arms (swinging opposite)
        ctx.strokeStyle = explorerColor;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';

        // Left arm
        ctx.save();
        ctx.translate(-12, -60 + bob);
        ctx.rotate(armAngle1);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 22);
        ctx.stroke();
        ctx.restore();

        // Right arm
        ctx.save();
        ctx.translate(12, -60 + bob);
        ctx.rotate(armAngle2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 22);
        ctx.stroke();
        ctx.restore();

        // Legs (striding)
        // Left leg
        ctx.save();
        ctx.translate(-8, -25 + bob);
        ctx.rotate(legAngle1);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 25);
        ctx.stroke();
        // Boot
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-4, 20, 10, 8);
        ctx.restore();

        // Right leg
        ctx.save();
        ctx.translate(8, -25 + bob);
        ctx.rotate(legAngle2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 25);
        ctx.stroke();
        // Boot
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-4, 20, 10, 8);
        ctx.restore();
      }

      // Shield visual effect
      if (state.activePowerUps.shield > 0 || state.shieldActive) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, -45, 42, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused, isGameOver, character, stats.soundEnabled, stats.powerUpLevels]);

  const handlePause = () => {
    soundManager.playClick(stats.soundEnabled);
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleRestart = () => {
    const state = gameStateRef.current;
    state.lane = 1;
    state.targetLane = 1;
    state.yOffset = 0;
    state.yVelocity = 0;
    state.isJumping = false;
    state.isSliding = false;
    state.distance = 0;
    state.score = 0;
    state.coins = 0;
    state.lives = 3;
    state.obstacles = [];
    state.coinsList = [];
    state.powerUpsList = [];
    state.activePowerUps = { magnet: 0, shield: 0, speed: 0, doubleCoin: 0 };
    setScore(0);
    setDistance(0);
    setCoinsCollected(0);
    setLives(3);
    setIsPaused(false);
    setIsGameOver(false);
  };

  const handleGameOverHome = () => {
    const newHighScore = Math.max(stats.highScore, score);
    const newMaxDistance = Math.max(stats.maxDistance, Math.floor(distance));
    const newTotalCoins = stats.coins + coinsCollected;

    const newCompletedMissions = [...stats.completedMissions];
    INITIAL_MISSIONS.forEach((m) => {
      if (!newCompletedMissions.includes(m.id)) {
        let achieved = false;
        if (m.targetType === 'distance' && Math.floor(distance) >= m.targetValue) achieved = true;
        if (m.targetType === 'coins' && coinsCollected >= m.targetValue) achieved = true;
        if (m.targetType === 'score' && score >= m.targetValue) achieved = true;
        if (achieved) newCompletedMissions.push(m.id);
      }
    });

    onUpdateStats({
      highScore: newHighScore,
      maxDistance: newMaxDistance,
      coins: newTotalCoins,
      completedMissions: newCompletedMissions,
    });

    onHome();
  };

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between select-none overflow-hidden touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <canvas
        ref={canvasRef}
        width={400}
        height={700}
        className="absolute inset-0 w-full h-full object-cover"
      ></canvas>

      {/* Top HUD */}
      <div className="relative z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Heart
              key={idx}
              className={`w-6 h-6 ${
                idx < lives ? 'text-rose-500 fill-rose-500 animate-pulse' : 'text-stone-500'
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-yellow-300 font-black text-lg drop-shadow">
            <Trophy className="w-5 h-5" />
            <span>{score}</span>
          </div>
          <div className="text-emerald-300 text-xs font-bold drop-shadow">
            {Math.floor(distance)} {t.meters}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-300 font-bold text-sm backdrop-blur-md">
            <Coins className="w-4 h-4" />
            <span>{coinsCollected}</span>
          </div>

          <button
            onClick={handlePause}
            className="p-2.5 bg-black/50 hover:bg-black/70 border border-emerald-500/30 rounded-xl text-emerald-300 backdrop-blur-md transition-all"
          >
            <Pause className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Power-up Active Indicators HUD */}
      <div className="relative z-20 flex gap-2 px-4 pointer-events-none">
        {activePowerUps.magnet > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-sky-500/30 border border-sky-400/50 rounded-xl text-sky-200 text-xs font-bold backdrop-blur-md">
            <Magnet className="w-3.5 h-3.5 animate-bounce" />
            <span>{Math.ceil(activePowerUps.magnet / 1000)}s</span>
          </div>
        )}
        {activePowerUps.shield > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-sky-500/30 border border-sky-400/50 rounded-xl text-sky-200 text-xs font-bold backdrop-blur-md">
            <Shield className="w-3.5 h-3.5" />
            <span>{Math.ceil(activePowerUps.shield / 1000)}s</span>
          </div>
        )}
        {activePowerUps.speed > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/30 border border-amber-400/50 rounded-xl text-amber-200 text-xs font-bold backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            <span>{Math.ceil(activePowerUps.speed / 1000)}s</span>
          </div>
        )}
      </div>

      {/* Swipe guide banner at bottom for mobile */}
      <div className="relative z-10 pb-4 text-center pointer-events-none opacity-60">
        <span className="text-[11px] text-emerald-200 font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
          Swipe Left/Right/Up/Down or Arrow Keys
        </span>
      </div>

      {/* Modals */}
      {isPaused && (
        <PauseModal
          stats={stats}
          onResume={handleResume}
          onRestart={handleRestart}
          onHome={handleGameOverHome}
        />
      )}

      {isGameOver && (
        <GameOverModal
          stats={stats}
          score={score}
          distance={distance}
          coinsCollected={coinsCollected}
          onRestart={handleRestart}
          onHome={handleGameOverHome}
        />
      )}
    </div>
  );
};
