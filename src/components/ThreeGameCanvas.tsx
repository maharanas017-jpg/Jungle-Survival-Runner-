import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { Pause, Heart, Shield, Zap, Magnet, Coins, Trophy, Loader2 } from 'lucide-react';
import { PlayerStats, ActivePowerUps } from '../types';
import { INITIAL_CHARACTERS, INITIAL_MISSIONS, TRANSLATIONS } from '../utils/constants';
import { soundManager } from '../utils/sound';
import { PauseModal } from './PauseModal';
import { GameOverModal } from './GameOverModal';

interface ThreeGameCanvasProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
  onHome: () => void;
}

const MODEL_URL = 'https://github.com/maharanas017-jpg/Jungle-Survival-Runner/releases/download/v1.0.0/Fast.Run.fbx';

export const ThreeGameCanvas: React.FC<ThreeGameCanvasProps> = ({ stats, onUpdateStats, onHome }) => {
  const t = TRANSLATIONS[stats.language];
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Game UI & Loading State
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

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

  const character = INITIAL_CHARACTERS.find((c) => c.id === stats.selectedCharacterId) || INITIAL_CHARACTERS[0];
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const gameInstanceRef = useRef<any>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x064e3b);
    scene.fog = new THREE.FogExp2(0x064e3b, 0.035);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 4.2, -5.5);
    camera.lookAt(0, 1.5, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfef08a, 1.3);
    dirLight.position.set(10, 20, -10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // --- ROAD & ENVIRONMENT ---
    const roadWidth = 6;
    const roadLength = 200;

    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0, roadLength / 2 - 10);
    scene.add(road);

    const grassGeo = new THREE.PlaneGeometry(30, roadLength);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.95 });
    const grassLeft = new THREE.Mesh(grassGeo, grassMat);
    grassLeft.rotation.x = -Math.PI / 2;
    grassLeft.position.set(-18, -0.02, roadLength / 2 - 10);
    scene.add(grassLeft);

    const grassRight = new THREE.Mesh(grassGeo, grassMat);
    grassRight.rotation.x = -Math.PI / 2;
    grassRight.position.set(18, -0.02, roadLength / 2 - 10);
    scene.add(grassRight);

    // Trees along road
    for (let z = 0; z < roadLength; z += 12) {
      [-4.5, 4.5].forEach((xOffset) => {
        const treeGroup = new THREE.Group();
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 3, 6);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 1.5;
        treeGroup.add(trunk);

        const leavesGeo = new THREE.ConeGeometry(1.5, 4, 6);
        const leavesMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.y = 3.5;
        treeGroup.add(leaves);

        treeGroup.position.set(xOffset + (Math.random() - 0.5) * 1.5, 0, z);
        scene.add(treeGroup);
      });
    }

    // --- CHARACTER GROUP & FALLBACK / FBX LOADER ---
    let mixer: THREE.AnimationMixer | null = null;
    const clock = new THREE.Clock();
    let playerGroup = new THREE.Group();
    playerGroup.position.set(0, 0, 2);
    scene.add(playerGroup);

    // Helper to create procedural 3D runner model for preview environment
    const createProceduralRunner = () => {
      const group = new THREE.Group();
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.6 });
      const shirtMat = new THREE.MeshStandardMaterial({ color: character.shirtColor, roughness: 0.7 });
      const jeansMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.8 });
      const shoeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
      const hairMat = new THREE.MeshStandardMaterial({ color: character.hairColor, roughness: 0.9 });

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 16), skinMat);
      head.position.y = 1.85;
      group.add(head);

      // Hair
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), hairMat);
      hair.position.set(0, 1.95, -0.05);
      group.add(hair);

      // Torso
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.8, 12), shirtMat);
      torso.position.y = 1.25;
      group.add(torso);

      // Legs
      const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.9, 8), jeansMat);
      leftLeg.position.set(-0.12, 0.55, 0);
      group.add(leftLeg);

      const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.9, 8), jeansMat);
      rightLeg.position.set(0.12, 0.55, 0);
      group.add(rightLeg);

      // Shoes
      const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.25), shoeMat);
      leftShoe.position.set(-0.12, 0.08, 0.05);
      group.add(leftShoe);

      const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.25), shoeMat);
      rightShoe.position.set(0.12, 0.08, 0.05);
      group.add(rightShoe);

      // Arms
      const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.7, 8), shirtMat);
      leftArm.position.set(-0.32, 1.3, 0);
      group.add(leftArm);

      const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.7, 8), shirtMat);
      rightArm.position.set(0.32, 1.3, 0);
      group.add(rightArm);

      return { group, leftLeg, rightLeg, leftArm, rightArm };
    };

    let proceduralRunner: ReturnType<typeof createProceduralRunner> | null = null;

    // Try loading FBX from GitHub Release URL
    const fbxLoader = new FBXLoader();
    fbxLoader.load(
      MODEL_URL,
      (object) => {
        object.scale.set(0.012, 0.012, 0.012);
        object.position.set(0, 0, 0);

        if (object.animations && object.animations.length > 0) {
          mixer = new THREE.AnimationMixer(object);
          const action = mixer.clipAction(object.animations[0]);
          action.play();
        }

        scene.remove(playerGroup);
        playerGroup = new THREE.Group();
        playerGroup.add(object);
        playerGroup.position.set(0, 0, 2);
        scene.add(playerGroup);

        setIsLoading(false);
      },
      (xhr) => {
        if (xhr.total > 0) {
          setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (error) => {
        // Fallback for AI Studio preview CORS restriction
        console.warn('FBX Load fallback active (AI Studio sandbox CORS): using procedural 3D runner model.');
        proceduralRunner = createProceduralRunner();
        playerGroup.add(proceduralRunner.group);
        setIsLoading(false);
      }
    );

    // --- GAME STATE REFS ---
    const gameState = {
      lane: 1,
      targetLane: 1,
      yOffset: 0,
      yVelocity: 0,
      isJumping: false,
      isSliding: false,
      slideTimer: 0,
      speed: 0.35,
      distance: 0,
      score: 0,
      coins: 0,
      lives: 3,
      obstacles: [] as { mesh: THREE.Group; lane: number; z: number; type: string }[],
      coinsList: [] as { mesh: THREE.Mesh; lane: number; z: number; collected: boolean }[],
      powerUpsList: [] as { mesh: THREE.Group; lane: number; z: number; type: string; collected: boolean }[],
      activePowerUps: { magnet: 0, shield: 0, speed: 0, doubleCoin: 0 } as ActivePowerUps,
      spawnTimer: 0,
      shieldActive: false,
      animTime: 0,
    };

    gameInstanceRef.current = {
      setLane: (newLane: number) => {
        gameState.targetLane = newLane;
      },
      jump: () => {
        if (!gameState.isJumping && !gameState.isSliding) {
          gameState.isJumping = true;
          gameState.yVelocity = 0.28;
          soundManager.playJump(stats.soundEnabled);
        }
      },
      slide: () => {
        if (!gameState.isJumping && !gameState.isSliding) {
          gameState.isSliding = true;
          gameState.slideTimer = 45;
          soundManager.playSlide(stats.soundEnabled);
        }
      },
    };

    // --- ANIMATION & GAME LOOP ---
    let animationFrameId: number;

    const animate = () => {
      const delta = clock.getDelta();
      if (mixer) {
        mixer.update(delta);
      } else if (proceduralRunner) {
        gameState.animTime += 0.2;
        const runCycle = gameState.animTime * 4;
        proceduralRunner.leftLeg.rotation.x = Math.sin(runCycle) * 0.6;
        proceduralRunner.rightLeg.rotation.x = Math.sin(runCycle + Math.PI) * 0.6;
        proceduralRunner.leftArm.rotation.x = Math.sin(runCycle + Math.PI) * 0.5;
        proceduralRunner.rightArm.rotation.x = Math.sin(runCycle) * 0.5;
        proceduralRunner.group.position.y = Math.abs(Math.sin(runCycle * 2)) * 0.08;
      }

      if (!isPaused && !isGameOver) {
        const currentSpeed = gameState.activePowerUps.speed > 0 ? gameState.speed * 1.6 : gameState.speed * character.speedBonus;

        gameState.distance += currentSpeed * 10;
        gameState.score += Math.floor(currentSpeed * 20);
        setDistance(gameState.distance);
        setScore(gameState.score);

        const targetX = (gameState.targetLane - 1) * 2;
        gameState.lane += (targetX - gameState.lane) * 0.25;
        playerGroup.position.x = gameState.lane;

        if (gameState.isJumping) {
          gameState.yOffset += gameState.yVelocity;
          gameState.yVelocity -= 0.018;
          if (gameState.yOffset <= 0) {
            gameState.yOffset = 0;
            gameState.isJumping = false;
          }
        }
        playerGroup.position.y = gameState.yOffset;

        if (gameState.isSliding) {
          gameState.slideTimer--;
          playerGroup.scale.set(1, 0.5, 1);
          if (gameState.slideTimer <= 0) {
            gameState.isSliding = false;
            playerGroup.scale.set(1, 1, 1);
          }
        }

        ['magnet', 'shield', 'speed', 'doubleCoin'].forEach((key) => {
          const k = key as keyof ActivePowerUps;
          if (gameState.activePowerUps[k] > 0) {
            gameState.activePowerUps[k] -= 16;
            if (gameState.activePowerUps[k] < 0) gameState.activePowerUps[k] = 0;
          }
        });
        setActivePowerUps({ ...gameState.activePowerUps });

        gameState.spawnTimer++;
        if (gameState.spawnTimer > Math.max(35, 80 - Math.floor(gameState.distance / 300))) {
          gameState.spawnTimer = 0;
          const laneIdx = Math.floor(Math.random() * 3);
          const laneX = (laneIdx - 1) * 2;
          const obsType = Math.random() > 0.5 ? 'log' : 'rock';

          const obsGroup = new THREE.Group();
          if (obsType === 'log') {
            const logGeo = new THREE.CylinderGeometry(0.4, 0.4, 2, 8);
            const logMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
            const log = new THREE.Mesh(logGeo, logMat);
            log.rotation.z = Math.PI / 2;
            log.position.y = 0.4;
            obsGroup.add(log);
          } else {
            const rockGeo = new THREE.DodecahedronGeometry(0.6, 1);
            const rockMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
            const rock = new THREE.Mesh(rockGeo, rockMat);
            rock.position.y = 0.5;
            obsGroup.add(rock);
          }

          obsGroup.position.set(laneX, 0, 70);
          scene.add(obsGroup);
          gameState.obstacles.push({ mesh: obsGroup, lane: laneIdx, z: 70, type: obsType });

          if (Math.random() > 0.3) {
            for (let i = 0; i < 3; i++) {
              const coinGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16);
              const coinMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.8, roughness: 0.2 });
              const coin = new THREE.Mesh(coinGeo, coinMat);
              coin.rotation.x = Math.PI / 2;
              coin.position.set(laneX, 1.0, 75 + i * 2);
              scene.add(coin);
              gameState.coinsList.push({ mesh: coin, lane: laneIdx, z: 75 + i * 2, collected: false });
            }
          }
        }

        gameState.obstacles.forEach((obs) => {
          obs.z -= currentSpeed;
          obs.mesh.position.z = obs.z;
        });

        gameState.coinsList.forEach((coin) => {
          coin.z -= currentSpeed;
          coin.mesh.position.z = coin.z;
          coin.mesh.rotation.z += 0.05;
        });

        gameState.obstacles = gameState.obstacles.filter((obs) => {
          if (obs.z < 2.5 && obs.z > 1.2 && Math.round(gameState.lane) === (obs.lane - 1)) {
            const isAirborne = gameState.yOffset > 0.5;
            if (!isAirborne) {
              if (gameState.activePowerUps.shield > 0 || gameState.shieldActive) {
                gameState.activePowerUps.shield = 0;
                gameState.shieldActive = false;
                soundManager.playCrash(stats.soundEnabled);
                scene.remove(obs.mesh);
                return false;
              } else {
                gameState.lives--;
                setLives(gameState.lives);
                soundManager.playCrash(stats.soundEnabled);
                if (gameState.lives <= 0) {
                  setIsGameOver(true);
                  soundManager.playGameOver(stats.soundEnabled);
                }
                scene.remove(obs.mesh);
                return false;
              }
            }
          }
          if (obs.z < -5) {
            scene.remove(obs.mesh);
            return false;
          }
          return true;
        });

        gameState.coinsList = gameState.coinsList.filter((coin) => {
          if (!coin.collected && coin.z < 2.5 && coin.z > 1.2 && Math.round(gameState.lane) === (coin.lane - 1)) {
            coin.collected = true;
            const addCoins = gameState.activePowerUps.doubleCoin > 0 ? 2 : 1;
            gameState.coins += addCoins;
            setCoinsCollected(gameState.coins);
            soundManager.playCoin(stats.soundEnabled);
            scene.remove(coin.mesh);
            return false;
          }
          if (coin.z < -5) {
            scene.remove(coin.mesh);
            return false;
          }
          return true;
        });

        camera.position.x = gameState.lane * 0.4;
        camera.lookAt(gameState.lane * 0.2, 1.5, 5);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [character, stats.soundEnabled]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || isGameOver || !gameInstanceRef.current) return;
      const inst = gameInstanceRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        inst.setLane(0);
        soundManager.playClick(stats.soundEnabled);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        inst.setLane(2);
        soundManager.playClick(stats.soundEnabled);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        inst.jump();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        inst.slide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, isGameOver, stats.soundEnabled]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isPaused || isGameOver || !gameInstanceRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const inst = gameInstanceRef.current;

    const threshold = 30;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > threshold) {
        inst.setLane(2);
        soundManager.playClick(stats.soundEnabled);
      } else if (dx < -threshold) {
        inst.setLane(0);
        soundManager.playClick(stats.soundEnabled);
      }
    } else {
      if (dy < -threshold) {
        inst.jump();
      } else if (dy > threshold) {
        inst.slide();
      }
    }
  };

  const handlePause = () => {
    soundManager.playClick(stats.soundEnabled);
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleRestart = () => {
    window.location.reload();
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
      ref={containerRef}
      className="relative w-full h-full flex flex-col justify-between select-none overflow-hidden touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-white p-6">
          <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
          <h3 className="text-xl font-bold mb-2">Loading 3D Character FBX...</h3>
          <p className="text-sm text-emerald-300/80 mb-4">{loadProgress}% loaded</p>
          <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-200"
              style={{ width: `${loadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Top HUD */}
      <div className="absolute top-0 inset-x-0 z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
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
      <div className="absolute top-20 left-4 z-20 flex gap-2 pointer-events-none">
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
      <div className="absolute bottom-4 inset-x-0 z-20 text-center pointer-events-none opacity-70">
        <span className="text-[11px] text-emerald-200 font-medium bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-sm">
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
