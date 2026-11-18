import { Character, Mission, PowerUpUpgrade } from '../types';

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'maya',
    name: { hi: 'माया (Maya)', en: 'Maya Explorer' },
    title: { hi: 'मुख्य खोजकर्ता', en: 'Lead Explorer' },
    price: 0,
    unlocked: true,
    avatar: '👩🏽‍🦰',
    color: '#0284c7', // denim blue & coral t-shirt
    shirtColor: '#f43f5e', // coral pink
    hairColor: '#b45309', // auburn hair
    speedBonus: 1.0,
    coinBonus: 1.0,
    jumpPower: 1.0,
  },
  {
    id: 'kiara',
    name: { hi: 'कियारा (Kiara)', en: 'Kiara Ranger' },
    title: { hi: 'जंगल रेंजर', en: 'Jungle Ranger' },
    price: 300,
    unlocked: false,
    avatar: '👩🏻‍🦱',
    color: '#0284c7', // denim blue & teal t-shirt
    shirtColor: '#14b8a6', // teal
    hairColor: '#3f3f46', // dark hair
    speedBonus: 1.05,
    coinBonus: 1.25,
    jumpPower: 1.0,
  },
  {
    id: 'zara',
    name: { hi: 'ज़ारा (Zara)', en: 'Zara Scout' },
    title: { hi: 'सफारी स्काउट', en: 'Safari Scout' },
    price: 600,
    unlocked: false,
    avatar: '👩🏾‍🦱',
    color: '#0284c7', // denim blue & emerald t-shirt
    shirtColor: '#10b981', // emerald green
    hairColor: '#18181b', // black hair
    speedBonus: 1.1,
    coinBonus: 1.5,
    jumpPower: 1.1,
  },
  {
    id: 'luna',
    name: { hi: 'लूना (Luna)', en: 'Luna Adventurer' },
    title: { hi: 'साहसी यात्री', en: 'Wild Adventurer' },
    price: 1200,
    unlocked: false,
    avatar: '👩🏼‍🦰',
    color: '#0284c7', // denim blue & lavender t-shirt
    shirtColor: '#8b5cf6', // lavender purple
    hairColor: '#d97706', // golden hair
    speedBonus: 1.2,
    coinBonus: 2.0,
    jumpPower: 1.2,
  },
];

export const INITIAL_POWERUPS: PowerUpUpgrade[] = [
  {
    id: 'magnet',
    name: { hi: 'सिक्का चुंबक', en: 'Coin Magnet' },
    level: 1,
    maxLevel: 5,
    cost: 100,
    duration: 8,
    description: { hi: 'दूर से सभी सिक्के खींचता है', en: 'Attracts all coins from a distance' },
    icon: '🧲',
  },
  {
    id: 'shield',
    name: { hi: 'सुरक्षा कवच', en: 'Shield' },
    level: 1,
    maxLevel: 5,
    cost: 150,
    duration: 6,
    description: { hi: 'बाधाओं से बचाता है', en: 'Protects from obstacles' },
    icon: '🛡️',
  },
  {
    id: 'speed',
    name: { hi: 'सुपर स्पीड', en: 'Speed Boost' },
    level: 1,
    maxLevel: 5,
    cost: 200,
    duration: 5,
    description: { hi: 'अजेय गति से आगे बढ़ें', en: 'Run fast and break through obstacles' },
    icon: '⚡',
  },
  {
    id: 'doubleCoin',
    name: { hi: 'डबल सिक्के', en: 'Double Coins' },
    level: 1,
    maxLevel: 5,
    cost: 250,
    duration: 10,
    description: { hi: 'दोगुने सिक्के प्राप्त करें', en: 'Collect 2x gold coins' },
    icon: '🪙',
  },
];

// Generate 30 missions
export const INITIAL_MISSIONS: Mission[] = Array.from({ length: 30 }, (_, i) => {
  const id = i + 1;
  let targetType: 'distance' | 'coins' | 'obstacles' | 'score' = 'distance';
  let targetValue = id * 100;
  let reward = id * 20;

  if (i % 4 === 1) {
    targetType = 'coins';
    targetValue = id * 15;
  } else if (i % 4 === 2) {
    targetType = 'obstacles';
    targetValue = Math.max(5, id * 2);
  } else if (i % 4 === 3) {
    targetType = 'score';
    targetValue = id * 250;
  }

  const titleHi = `मिशन ${id}: ${targetType === 'distance' ? 'लंबी दौड़' : targetType === 'coins' ? 'धन संग्रह' : targetType === 'obstacles' ? 'बाधा पार' : 'हाई स्कोर'}`;
  const titleEn = `Mission ${id}: ${targetType === 'distance' ? 'Long Run' : targetType === 'coins' ? 'Gold Rush' : targetType === 'obstacles' ? 'Dodge Master' : 'High Scorer'}`;

  const descHi = `लक्ष्य: ${targetValue} ${targetType === 'distance' ? 'मीटर दौड़ें' : targetType === 'coins' ? 'सिक्के इकट्ठा करें' : targetType === 'obstacles' ? 'बाधाओं से बचें' : 'अंक बनाएं'}`;
  const descEn = `Goal: Reach ${targetValue} ${targetType === 'distance' ? 'meters run' : targetType === 'coins' ? 'coins collected' : targetType === 'obstacles' ? 'obstacles avoided' : 'score'}`;

  return {
    id,
    title: { hi: titleHi, en: titleEn },
    description: { hi: descHi, en: descEn },
    targetType,
    targetValue,
    reward,
    completed: false,
    claimed: false,
  };
});

export const TRANSLATIONS = {
  hi: {
    gameTitle: 'जंगल सर्वाइवल रनर',
    subtitle: 'वाइल्ड एडवेंचर - 3D',
    play: 'खेलें (Play)',
    characters: 'महिला खोजकर्ता (Characters)',
    missions: 'मिशन (Missions)',
    shop: 'दुकान (Shop)',
    settings: 'सेटिंग्स (Settings)',
    howToPlay: 'कैसे खेलें (How to Play)',
    highScore: 'हाई स्कोर',
    coins: 'सिक्के',
    meters: 'मीटर',
    pause: 'रोकें',
    resume: 'जारी रखें',
    restart: 'पुनः आरंभ करें',
    home: 'मुख्य पृष्ठ',
    gameOver: 'खेल समाप्त!',
    score: 'स्कोर',
    distance: 'दूरी',
    coinsEarned: 'कमाए गए सिक्के',
    claimReward: 'इनाम पाएं',
    claimed: 'प्राप्त हो गया',
    unlock: 'अनलॉक करें',
    select: 'चुनें',
    selected: 'चुना हुआ',
    upgrade: 'अपग्रेड',
    level: 'लेवल',
    cost: 'मूल्य',
    sound: 'ध्वनि प्रभाव (Sound)',
    music: 'संगीत (Music)',
    language: 'भाषा (Language)',
    back: 'वापस',
    tutorialTitle: 'कैसे खेलें - नियम',
    tutorialSwipeLeft: 'बाएं स्वाइप करें: बाएं लेन में जाएं',
    tutorialSwipeRight: 'दाएं स्वाइप करें: दाएं लेन में जाएं',
    tutorialSwipeUp: 'ऊपर स्वाइप करें: छलांग लगाएं (Jump)',
    tutorialSwipeDown: 'नीचे स्वाइप करें: झुकें (Slide)',
    tutorialKeys: 'कम्प्यूटर पर तीर कुंजियों (Arrow Keys) और स्पेसबार का प्रयोग करें',
    okGotIt: 'समझ गया!',
    resetProgress: 'डेटा रीसेट करें',
    confirmReset: 'क्या आप सभी प्रगति रीसेट करना चाहते हैं?',
    congratsMission: 'बधाई हो! मिशन पूरा हुआ!',
    notEnoughCoins: 'पर्याप्त सिक्के नहीं हैं!',
  },
  en: {
    gameTitle: 'Jungle Survival Runner',
    subtitle: 'Wild Adventure - 3D',
    play: 'Play Game',
    characters: 'Explorer Characters',
    missions: 'Missions',
    shop: 'Shop',
    settings: 'Settings',
    howToPlay: 'How to Play',
    highScore: 'High Score',
    coins: 'Coins',
    meters: 'Meters',
    pause: 'Pause',
    resume: 'Resume',
    restart: 'Restart',
    home: 'Home Screen',
    gameOver: 'Game Over!',
    score: 'Score',
    distance: 'Distance',
    coinsEarned: 'Coins Earned',
    claimReward: 'Claim Reward',
    claimed: 'Claimed',
    unlock: 'Unlock',
    select: 'Select',
    selected: 'Selected',
    upgrade: 'Upgrade',
    level: 'Level',
    cost: 'Cost',
    sound: 'Sound Effects',
    music: 'Background Music',
    language: 'Language',
    back: 'Back',
    tutorialTitle: 'How to Play - Instructions',
    tutorialSwipeLeft: 'Swipe Left: Move to Left Lane',
    tutorialSwipeRight: 'Swipe Right: Move to Right Lane',
    tutorialSwipeUp: 'Swipe Up: Jump over logs & rocks',
    tutorialSwipeDown: 'Swipe Down: Slide under branches',
    tutorialKeys: 'Desktop: Use Arrow keys and Spacebar',
    okGotIt: 'Got It!',
    resetProgress: 'Reset Progress',
    confirmReset: 'Are you sure you want to reset all progress?',
    congratsMission: 'Congrats! Mission completed!',
    notEnoughCoins: 'Not enough coins!',
  },
};
