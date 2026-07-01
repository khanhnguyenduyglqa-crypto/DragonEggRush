const GRID_SIZE = 6;
const ROWS = GRID_SIZE;
const COLS = GRID_SIZE;
const TILE_SIZE = 100;
const BOARD_RENDER_WIDTH = COLS * TILE_SIZE;
const BOARD_RENDER_HEIGHT = ROWS * TILE_SIZE;
const MOBILE_DESIGN_WIDTH = 1120;
const MOBILE_DESIGN_HEIGHT = 860;
const MOBILE_PORTRAIT_WIDTH_THRESHOLD = 780;
// Playable inset for eggs: keeps sprites inside the decorative frame.
const BOARD_INSET_X = 48;
const BOARD_INSET_Y = 48;
const EGG_SIZE_RATIO = 0.72;

const config = {
  type: Phaser.AUTO,
  parent: 'gameContainer',
  width: BOARD_RENDER_WIDTH,
  height: BOARD_RENDER_HEIGHT,
  transparent: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: BOARD_RENDER_WIDTH,
    height: BOARD_RENDER_HEIGHT,
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};
const EGG_TYPES = ['fire', 'water', 'leaf', 'earth'];
const EGG_VISUALS = [
  {
    key: 'egg-fire',
    path: 'assets/eggs/fire.png',
    fallbackColor: 0xff4d4d,
  },
  {
    key: 'egg-ice',
    path: 'assets/eggs/ice.png',
    fallbackColor: 0x4d8bff,
  },
  {
    key: 'egg-leaf',
    path: 'assets/eggs/leaf.png',
    fallbackColor: 0x5ec25e,
  },
  {
    key: 'egg-earth',
    path: 'assets/eggs/earth.png',
    fallbackColor: 0xd8aa55,
  },
];
const DRAGON_TYPES = ['Fire', 'Ice', 'Leaf', 'Earth'];
const DRAGON_SKILL_TYPES = ['fire', 'ice', 'leaf', 'earth'];
const DRAGON_SKILL_PRIORITY = {
  fire: 1,
  earth: 2,
  leaf: 3,
  ice: 4,
};
// Dragon cut-in audio is file-name based. Replace these files in assets/audio/dragons/
// with the same names to reskin roar sounds without changing code.
const DRAGON_ROAR_ASSETS = {
  fire: {
    key: 'fire-roar',
    path: 'assets/audio/dragons/fire-roar.mp3',
  },
  ice: {
    key: 'ice-roar',
    path: 'assets/audio/dragons/ice-roar.mp3',
  },
  leaf: {
    key: 'leaf-roar',
    path: 'assets/audio/dragons/leaf-roar.mp3',
  },
  earth: {
    key: 'earth-roar',
    path: 'assets/audio/dragons/earth-roar.mp3',
  },
};
// Dragon skill effect audio is also file-name based. Replace files in assets/audio/skills/
// with the same names to reskin skill SFX without changing code.
const DRAGON_SKILL_SFX_ASSETS = {
  fireMeteorFall: {
    key: 'fire-meteor-fall',
    path: 'assets/audio/skills/fire-meteor-fall.mp3',
  },
  fireMeteorImpact: {
    key: 'fire-meteor-impact',
    path: 'assets/audio/skills/fire-meteor-impact.mp3',
  },
  iceFreezeStart: {
    key: 'ice-freeze-start',
    path: 'assets/audio/skills/ice-freeze-start.mp3',
  },
  iceFreezeEnd: {
    key: 'ice-freeze-end',
    path: 'assets/audio/skills/ice-freeze-end.mp3',
  },
  leafBlessingStart: {
    key: 'leaf-blessing-start',
    path: 'assets/audio/skills/leaf-blessing-start.mp3',
  },
  leafChargeUsed: {
    key: 'leaf-charge-used',
    path: 'assets/audio/skills/leaf-charge-used.mp3',
  },
  earthPetrify: {
    key: 'earth-petrify',
    path: 'assets/audio/skills/earth-petrify.mp3',
  },
  earthShatter: {
    key: 'earth-shatter',
    path: 'assets/audio/skills/earth-shatter.mp3',
  },
};
const DRAGON_CUT_IN_CONFIGS = {
  fire: {
    dragonType: 'fire',
    title: 'HÀ NỘI GIỮA THÁNG 6',
    portraitKey: 'fire_dragon',
    portraitPath: 'assets/dragons/fire-dragon.png',
    roarKey: DRAGON_ROAR_ASSETS.fire.key,
    visualStyle: 'fire',
    accentColor: 0xff6a1a,
    overlayColor: 0x050309,
    flashColor: 0xffffff,
    flashAlpha: 0.88,
    titleColor: '#ffbf42',
  },
  ice: {
    dragonType: 'ice',
    title: 'LỜI TỪ CHỐI CỦA CRUSH',
    portraitKey: 'ice_dragon',
    portraitPath: 'assets/dragons/ice-dragon.png',
    roarKey: DRAGON_ROAR_ASSETS.ice.key,
    visualStyle: 'ice',
    accentColor: 0x7ed8ff,
    overlayColor: 0x061627,
    flashColor: 0xcff7ff,
    flashAlpha: 0.46,
    titleColor: '#dff6ff',
  },
  leaf: {
    dragonType: 'leaf',
    title: 'RAU SẠCH CẤP ĐẠI HỌC',
    portraitKey: 'leaf_dragon',
    portraitPath: 'assets/dragons/leaf-dragon.png',
    roarKey: DRAGON_ROAR_ASSETS.leaf.key,
    visualStyle: 'leaf',
    accentColor: 0x72ff66,
    overlayColor: 0x071b0b,
    flashColor: 0xd8ffd1,
    flashAlpha: 0.56,
    titleColor: '#baff8a',
  },
  earth: {
    dragonType: 'earth',
    title: 'BÀNH TRƯỚNG LÃNH ĐỊA',
    portraitKey: 'earth_dragon',
    portraitPath: 'assets/dragons/earth-dragon.png',
    roarKey: DRAGON_ROAR_ASSETS.earth.key,
    visualStyle: 'earth',
    accentColor: 0xd8aa55,
    overlayColor: 0x1f1408,
    flashColor: 0xf1d08a,
    flashAlpha: 0.5,
    titleColor: '#e8c978',
  },
};
const EARTH_TYPE = EGG_TYPES.indexOf('earth');
const DRAGON_ENERGY_MAX = 30;
const NORMAL_SCALE = 1;
const SELECTED_SCALE = 1.15;
const MATCH_SCORE = 10;
const TIMER_SECONDS = 90;
const EGG_DESTROY_DURATION = 260;
const SWIPE_SWAP_THRESHOLD = 32;
const MAX_PLAYER_CASCADE_STEPS = 8;
const MAX_SKILL_CASCADE_STEPS = 5;
const EARTH_CONVERSION_STAGGER = 55;
const EARTH_CONVERSION_HOLD = 520;
const EGG_DESTROY_THEMES = [
  {
    primary: 0xff4d2e,
    secondary: 0xffb347,
    glow: 0xff6a1a,
    shape: 'ember',
  },
  {
    primary: 0x7ed8ff,
    secondary: 0xe8fbff,
    glow: 0x4db8ff,
    shape: 'shard',
  },
  {
    primary: 0x56d86a,
    secondary: 0xc7ff8a,
    glow: 0x2ecc71,
    shape: 'leaf',
  },
  {
    primary: 0xb8860b,
    secondary: 0xe0c068,
    glow: 0x8a6230,
    shape: 'stone',
  },
];
const DRAGON_CUT_IN_TIMING = {
  overlayIn: 160,
  accentSweep: 340,
  portraitIn: 360,
  firePortraitIn: 300,
  titleIn: 260,
  fireTitleIn: 220,
  titleDelay: 260,
  fireTitleDelay: 360,
  flashAt: 1380,
  flashDuration: 90,
  exitAt: 1450,
  exitDuration: 250,
  total: 1700,
};
const DEFAULT_BOARD_SKIN = {
  key: 'board-default',
  path: 'assets/boards/default-board.png',
};
const HEADER_BACKGROUND_ASSET = {
  key: 'header-bg',
  path: 'assets/ui/header-bg.png',
};
const STAT_CARD_ASSETS = [
  {
    key: 'stat-card-gold',
    path: 'assets/ui/stat-card-gold.png',
  },
  {
    key: 'stat-card-blue',
    path: 'assets/ui/stat-card-blue.png',
  },
];
const STAT_CARD_ASSET_BY_KEY = Object.fromEntries(STAT_CARD_ASSETS.map((asset) => [asset.key, asset]));
const AUDIO_SETTINGS_KEY = 'dragonEggRushAudioSettings';
const TUTORIAL_PAGES = [
  {
    title: 'HOW TO PLAY',
    lines: [
      'Swap adjacent eggs to make matches.',
      'Click one egg, then click a neighboring egg.',
      'Or drag/swipe an egg toward a neighboring cell.',
      'Match 3 or more eggs of the same type to score points.',
    ],
  },
  {
    title: 'SPECIAL MATCHES',
    lines: [
      'Match 4: fires a beam that clears a row or column.',
      'Match 5: links to all eggs of the same type and destroys them.',
      'L / T shape: creates a powerful 3x3 explosion.',
    ],
  },
  {
    title: 'DRAGON SKILLS',
    lines: [
      'Matching eggs charges the dragon of that element.',
      'When energy reaches 30, the dragon skill becomes ready.',
      'Skills activate automatically after the combo finishes.',
      'Fire, Ice, Leaf, and Earth each have different effects.',
    ],
  },
];
let board = [];
let tileSprites = [];
let selectedEgg = null;
let lastSwappedCells = [];
let activeDragInput = null;
let isAnimating = false;
let isGameOver = false;
let isGameOverPending = false;
let isResolving = false;
let gameStarted = false;
let score = 0;
let timer = TIMER_SECONDS;
let countdownEvent;
let comboCount = 0;
let dragonEnergy = [0, 0, 0, 0];
let dragonEnergyText = [];
let dragonEnergyFill = [];
let dragonReadyBadge = [];
let pendingDragonSkills = [];
let dragonEnergyLocked = {
  fire: false,
  ice: false,
  leaf: false,
  earth: false,
};
let dragonSkillReady = {
  fire: false,
  ice: false,
  leaf: false,
  earth: false,
};
let pendingFireStorm = null;
let pendingEarthPetrify = false;
let delayedSpecialQueue = [];
let earthPetrifyTimeout = null;
let earthPetrifyToken = 0;
let scoreMultiplier = 1;
let leafDoubleScoreMovesRemaining = 0;
let leafDoubleScoreActiveForCurrentMove = false;
let leafSkillRefreshedDuringCurrentMove = false;
let leafBuffIndicatorElement = null;
let frozenTimeActive = false;
let frozenTimeEvent = null;
let frozenTimeRemaining = 0;
let iceFreezeOverlay = null;
let timerFrozenVisualElements = [];
let scoreText;
let timerText;
let comboText;
let gameOverOverlay;
let finalScoreText;
let restartButton;
let optionsButton;
let optionsOverlay;
let optionsPanel;
let tutorialButton;
let tutorialOverlay;
let tutorialTitle;
let tutorialContent;
let tutorialPageIndicator;
let tutorialBackButton;
let tutorialNextButton;
let tutorialCloseButton;
let musicToggle;
let sfxToggle;
let musicVolumeSlider;
let sfxVolumeSlider;
let overlayRestartButton;
let gameInstance;
let boardSkinSprite;
let activeDragonCutIn = null;
let dragonCutInToken = 0;
let isOptionsPanelOpen = false;
let isTutorialOpen = false;
let tutorialPageIndex = 0;
let gameRunId = 0;
let audioManager = null;
let currentComboChainId = 0;
let currentComboCascadeStep = 0;
let isComboChainActive = false;

function preload() {
  this.load.image(DEFAULT_BOARD_SKIN.key, DEFAULT_BOARD_SKIN.path);
  this.load.image(HEADER_BACKGROUND_ASSET.key, HEADER_BACKGROUND_ASSET.path);
  STAT_CARD_ASSETS.forEach((asset) => {
    this.load.image(asset.key, asset.path);
  });
  EGG_VISUALS.forEach((egg) => {
    this.load.image(egg.key, egg.path);
  });
  Object.values(DRAGON_CUT_IN_CONFIGS).forEach((dragon) => {
    this.load.image(dragon.portraitKey, dragon.portraitPath);
  });
  Object.values(DRAGON_ROAR_ASSETS).forEach((asset) => {
    this.load.audio(asset.key, asset.path);
  });
  Object.values(DRAGON_SKILL_SFX_ASSETS).forEach((asset) => {
    this.load.audio(asset.key, asset.path);
  });
}

function create() {
  gameInstance = this;
  setupResponsiveLayout();
  generateEggTextures();

  scoreText = document.getElementById('scoreValue');
  timerText = document.getElementById('timerValue');
  comboText = document.getElementById('comboText');
  setupStatCardBackgrounds();
  gameOverOverlay = document.getElementById('gameOverOverlay');
  finalScoreText = document.getElementById('finalScore');
  restartButton = document.getElementById('restartButton');
  optionsButton = document.getElementById('optionsButton');
  optionsOverlay = document.getElementById('optionsOverlay');
  optionsPanel = document.getElementById('optionsPanel');
  tutorialButton = document.getElementById('tutorialButton');
  tutorialOverlay = document.getElementById('tutorialOverlay');
  tutorialTitle = document.getElementById('tutorialTitle');
  tutorialContent = document.getElementById('tutorialContent');
  tutorialPageIndicator = document.getElementById('tutorialPageIndicator');
  tutorialBackButton = document.getElementById('tutorialBackButton');
  tutorialNextButton = document.getElementById('tutorialNextButton');
  tutorialCloseButton = document.getElementById('tutorialCloseButton');
  musicToggle = document.getElementById('musicToggle');
  sfxToggle = document.getElementById('sfxToggle');
  musicVolumeSlider = document.getElementById('musicVolume');
  sfxVolumeSlider = document.getElementById('sfxVolume');
  overlayRestartButton = document.getElementById('overlayRestart');

  dragonEnergyText = DRAGON_TYPES.map((type) => document.getElementById(`${type.toLowerCase()}EnergyProgress`));
  dragonEnergyFill = DRAGON_TYPES.map((type) => document.getElementById(`${type.toLowerCase()}EnergyFill`));
  dragonReadyBadge = DRAGON_TYPES.map((type) => document.getElementById(`${type.toLowerCase()}ReadyBadge`));

  restartButton.addEventListener('click', resetGame);
  audioManager = createAudioManager();
  setupAudioControls();
  setupOptionsPanel();
  setupTutorial();
  setupDragonInfoTooltips();
  overlayRestartButton.addEventListener('click', resetGame);
  this.input.on('pointermove', handleBoardPointerMove);
  this.input.on('pointerup', handleBoardPointerUp);
  this.input.on('pointerupoutside', handleBoardPointerUp);

  initializeBoard();
  createBoardSkinLayer();
  createBoardSprites();
  updateUi();
  showTutorialOnLaunch();
  console.log('Game waiting for first move');
}

function setupOptionsPanel() {
  if (!optionsButton || !optionsOverlay || !optionsPanel) {
    return;
  }

  optionsButton.addEventListener('click', (event) => {
    event.stopPropagation();
    const shouldOpen = optionsOverlay.classList.contains('hidden');
    setOptionsPanelOpen(shouldOpen);
  });

  optionsOverlay.addEventListener('click', () => {
    setOptionsPanelOpen(false);
  });

  optionsPanel.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  if (restartButton) {
    restartButton.addEventListener('click', () => {
      setOptionsPanelOpen(false);
    });
  }

  if (tutorialButton) {
    tutorialButton.addEventListener('click', () => {
      setOptionsPanelOpen(false);
      openTutorial(0);
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (isTutorialOpen) {
        closeTutorial();
        return;
      }
      setOptionsPanelOpen(false);
    }
  });
}

function setOptionsPanelOpen(isOpen) {
  if (!optionsButton || !optionsOverlay) {
    return;
  }

  const wasOpen = isOptionsPanelOpen;
  isOptionsPanelOpen = isOpen;
  activeDragInput = null;
  optionsOverlay.classList.toggle('hidden', !isOpen);
  optionsButton.setAttribute('aria-expanded', String(isOpen));
  if (audioManager && wasOpen !== isOpen) {
    audioManager.unlock();
    audioManager.playSfx(isOpen ? 'uiOpen' : 'uiClose');
  }
}

function isCurrentRun(runId) {
  return runId === gameRunId;
}

function createAudioManager() {
  const savedSettings = loadAudioSettings();
  let audioContext = null;
  let musicGain = null;
  let sfxGain = null;
  let bgmTimer = null;
  let bgmStep = 0;
  let unlocked = false;
  const lastPlayed = {};
  let activeCutInSound = null;
  const warnedMissingDragonRoars = new Set();
  const warnedMissingSkillSfx = new Set();
  const bgmPattern = [
    { root: 196, bell: 392 },
    { root: 220, bell: 440 },
    { root: 247, bell: 494 },
    { root: 165, bell: 330 },
  ];
  const settings = {
    musicEnabled: savedSettings.musicEnabled,
    sfxEnabled: savedSettings.sfxEnabled,
    musicVolume: savedSettings.musicVolume,
    sfxVolume: savedSettings.sfxVolume,
  };

  function initContext() {
    if (audioContext) {
      return audioContext;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('Web Audio is not supported in this browser.');
      return null;
    }

    audioContext = new AudioContextClass();
    musicGain = audioContext.createGain();
    sfxGain = audioContext.createGain();
    musicGain.connect(audioContext.destination);
    sfxGain.connect(audioContext.destination);
    updateGains();
    return audioContext;
  }

  function unlock() {
    const context = initContext();
    if (!context) {
      return;
    }

    if (context.state === 'suspended') {
      context.resume().catch(() => {});
    }
    unlocked = true;
  }

  function updateGains() {
    if (!musicGain || !sfxGain) {
      return;
    }

    const now = audioContext.currentTime;
    musicGain.gain.setTargetAtTime(settings.musicEnabled ? settings.musicVolume : 0, now, 0.035);
    sfxGain.gain.setTargetAtTime(settings.sfxEnabled ? settings.sfxVolume : 0, now, 0.02);
  }

  function saveSettings() {
    try {
      window.localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
  }

  function playTone(frequency, duration = 0.18, options = {}) {
    const context = initContext();
    if (!context || !sfxGain || !settings.sfxEnabled) {
      return;
    }

    const now = context.currentTime + (options.delay || 0);
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = options.type || 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    if (options.toFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, options.toFrequency), now + duration);
    }
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(options.gain || 0.16, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain);
    gain.connect(sfxGain);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }

  function playNoise(duration = 0.22, options = {}) {
    const context = initContext();
    if (!context || !sfxGain || !settings.sfxEnabled) {
      return;
    }

    const sampleRate = context.sampleRate;
    const buffer = context.createBuffer(1, Math.max(1, Math.floor(sampleRate * duration)), sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }

    const now = context.currentTime + (options.delay || 0);
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = options.filterType || 'lowpass';
    filter.frequency.setValueAtTime(options.frequency || 900, now);
    if (options.toFrequency) {
      filter.frequency.exponentialRampToValueAtTime(Math.max(40, options.toFrequency), now + duration);
    }
    gain.gain.setValueAtTime(options.gain || 0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain);
    source.start(now);
    source.stop(now + duration + 0.02);
  }

  function playBgmNote(frequency, startTime, duration, gainValue, type = 'sine') {
    if (!audioContext || !musicGain || !settings.musicEnabled) {
      return;
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainValue, startTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    oscillator.connect(gain);
    gain.connect(musicGain);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.04);
  }

  function scheduleBgmPhrase() {
    if (!audioContext || !settings.musicEnabled) {
      return;
    }

    const phrase = bgmPattern[bgmStep % bgmPattern.length];
    const now = audioContext.currentTime;
    playBgmNote(phrase.root, now, 2.6, 0.035, 'triangle');
    playBgmNote(phrase.root * 1.5, now + 0.04, 2.4, 0.018, 'sine');
    [0, 0.42, 0.84, 1.28].forEach((offset, index) => {
      const multiplier = [1, 1.125, 1.5, 2][index];
      playBgmNote(phrase.bell * multiplier, now + offset, 0.55, 0.028, 'sine');
    });
    bgmStep += 1;
  }

  function startBgm() {
    if (!unlocked || bgmTimer || !settings.musicEnabled) {
      updateGains();
      return;
    }

    initContext();
    scheduleBgmPhrase();
    bgmTimer = window.setInterval(scheduleBgmPhrase, 2300);
    updateGains();
  }

  function stopBgm() {
    if (bgmTimer) {
      window.clearInterval(bgmTimer);
      bgmTimer = null;
    }
    updateGains();
  }

  function playSfx(name, options = {}) {
    const context = initContext();
    if (!context || !settings.sfxEnabled) {
      return;
    }

    const nowMs = performance.now();
    const throttle = options.throttle || 0;
    if (throttle && lastPlayed[name] && nowMs - lastPlayed[name] < throttle) {
      return;
    }
    lastPlayed[name] = nowMs;

    if (name === 'button') {
      playTone(740, 0.07, { type: 'triangle', gain: 0.06 });
      playTone(960, 0.08, { delay: 0.035, type: 'sine', gain: 0.045 });
    } else if (name === 'uiOpen') {
      playTone(420, 0.12, { toFrequency: 680, type: 'triangle', gain: 0.08 });
    } else if (name === 'uiClose') {
      playTone(620, 0.1, { toFrequency: 360, type: 'triangle', gain: 0.07 });
    } else if (name === 'tutorial') {
      playTone(520, 0.09, { type: 'sine', gain: 0.055 });
      playTone(780, 0.11, { delay: 0.045, type: 'sine', gain: 0.05 });
    } else if (name === 'match') {
      playNoise(0.14, { frequency: 1200, toFrequency: 420, gain: 0.075, throttle: 80 });
      playTone(520, 0.11, { type: 'triangle', gain: 0.045 });
    } else if (name === 'match4') {
      playTone(240, 0.34, { toFrequency: 980, type: 'sawtooth', gain: 0.08 });
      playNoise(0.22, { filterType: 'bandpass', frequency: 1600, gain: 0.05 });
    } else if (name === 'match5') {
      [440, 660, 880, 1320].forEach((frequency, index) => {
        playTone(frequency, 0.2, { delay: index * 0.06, type: 'sine', gain: 0.055 });
      });
    } else if (name === 'areaExplosion') {
      playNoise(0.34, { frequency: 420, toFrequency: 90, gain: 0.16 });
      playTone(92, 0.36, { type: 'sine', gain: 0.11 });
    } else if (name === 'fireSkill') {
      playNoise(0.5, { frequency: 520, toFrequency: 130, gain: 0.13 });
      playTone(110, 0.48, { type: 'sawtooth', gain: 0.07 });
    } else if (name === 'meteor') {
      playNoise(0.32, { frequency: 380, toFrequency: 80, gain: 0.18 });
      playTone(74, 0.28, { type: 'sine', gain: 0.12 });
    } else if (name === 'iceSkill') {
      playNoise(0.42, { filterType: 'highpass', frequency: 1800, toFrequency: 420, gain: 0.1 });
      playTone(880, 0.22, { toFrequency: 440, type: 'triangle', gain: 0.07 });
    } else if (name === 'leafSkill') {
      [523, 659, 784].forEach((frequency, index) => {
        playTone(frequency, 0.32, { delay: index * 0.08, type: 'sine', gain: 0.055 });
      });
      playNoise(0.24, { filterType: 'highpass', frequency: 1300, gain: 0.035 });
    } else if (name === 'earthSkill') {
      playNoise(0.48, { frequency: 260, toFrequency: 70, gain: 0.16 });
      playTone(62, 0.52, { type: 'sine', gain: 0.13 });
    }
  }

  function stopCutInSound() {
    if (!activeCutInSound) {
      return;
    }

    try {
      if (activeCutInSound.isPlaying && activeCutInSound.stop) {
        activeCutInSound.stop();
      }
      if (activeCutInSound.destroy) {
        activeCutInSound.destroy();
      }
    } catch (e) {}
    activeCutInSound = null;
  }

  function playDragonRoar(dragonType, roarKey) {
    stopCutInSound();
    if (!settings.sfxEnabled) {
      return;
    }

    unlock();

    const fallbackSfx = {
      fire: 'fireSkill',
      ice: 'iceSkill',
      leaf: 'leafSkill',
      earth: 'earthSkill',
    };

    if (gameInstance && roarKey && gameInstance.sound && gameInstance.cache && gameInstance.cache.audio) {
      try {
        if (gameInstance.cache.audio.exists(roarKey)) {
          const roar = gameInstance.sound.add(roarKey, {
            volume: settings.sfxVolume,
          });
          activeCutInSound = roar;
          roar.once('complete', () => {
            if (activeCutInSound === roar) {
              activeCutInSound = null;
            }
            if (roar.destroy) {
              roar.destroy();
            }
          });
          roar.play();
          return;
        }
      } catch (e) {
        console.warn('Dragon roar audio unavailable, using fallback:', roarKey);
      }
    }

    if (roarKey && !warnedMissingDragonRoars.has(roarKey)) {
      warnedMissingDragonRoars.add(roarKey);
      console.warn('Dragon roar audio missing, using fallback:', roarKey);
    }

    playSfx(fallbackSfx[dragonType] || 'uiOpen', { throttle: 0 });
  }

  function playSkillSfx(assetKey, fallbackName, options = {}) {
    if (!settings.sfxEnabled) {
      return;
    }

    unlock();

    const nowMs = performance.now();
    const throttle = options.throttle || 0;
    const throttleKey = `asset:${assetKey}`;
    if (throttle && lastPlayed[throttleKey] && nowMs - lastPlayed[throttleKey] < throttle) {
      return;
    }
    lastPlayed[throttleKey] = nowMs;

    if (gameInstance && assetKey && gameInstance.sound && gameInstance.cache && gameInstance.cache.audio) {
      try {
        if (gameInstance.cache.audio.exists(assetKey)) {
          const sound = gameInstance.sound.add(assetKey, {
            volume: settings.sfxVolume,
          });
          sound.once('complete', () => {
            if (sound.destroy) {
              sound.destroy();
            }
          });
          sound.play();
          return;
        }
      } catch (e) {
        console.warn('Skill SFX audio unavailable, using fallback:', assetKey);
      }
    }

    if (assetKey && !warnedMissingSkillSfx.has(assetKey)) {
      warnedMissingSkillSfx.add(assetKey);
      console.warn('Skill SFX audio missing, using fallback:', assetKey);
    }

    if (fallbackName) {
      playSfx(fallbackName, options);
    }
  }

  return {
    settings,
    unlock,
    playSfx,
    playDragonRoar,
    playSkillSfx,
    stopCutInSound,
    startBgm,
    stopBgm,
    setMusicEnabled(value) {
      settings.musicEnabled = Boolean(value);
      if (settings.musicEnabled && gameStarted) {
        startBgm();
      } else {
        stopBgm();
      }
      saveSettings();
    },
    setSfxEnabled(value) {
      settings.sfxEnabled = Boolean(value);
      if (!settings.sfxEnabled) {
        stopCutInSound();
      }
      updateGains();
      saveSettings();
    },
    setMusicVolume(value) {
      settings.musicVolume = Phaser.Math.Clamp(Number(value) / 100, 0, 1);
      updateGains();
      saveSettings();
    },
    setSfxVolume(value) {
      settings.sfxVolume = Phaser.Math.Clamp(Number(value) / 100, 0, 1);
      if (activeCutInSound && activeCutInSound.setVolume) {
        activeCutInSound.setVolume(settings.sfxVolume);
      }
      updateGains();
      saveSettings();
    },
  };
}

function loadAudioSettings() {
  const fallback = {
    musicEnabled: true,
    sfxEnabled: true,
    musicVolume: 0.35,
    sfxVolume: 0.25,
  };

  try {
    const parsed = JSON.parse(window.localStorage.getItem(AUDIO_SETTINGS_KEY));
    if (!parsed) {
      return fallback;
    }
    return {
      musicEnabled: parsed.musicEnabled !== false,
      sfxEnabled: parsed.sfxEnabled !== false,
      musicVolume: Phaser.Math.Clamp(Number(parsed.musicVolume ?? fallback.musicVolume), 0, 1),
      sfxVolume: Phaser.Math.Clamp(Number(parsed.sfxVolume ?? fallback.sfxVolume), 0, 1),
    };
  } catch (e) {
    return fallback;
  }
}

function setupAudioControls() {
  if (!audioManager) {
    return;
  }

  if (musicToggle) {
    musicToggle.checked = audioManager.settings.musicEnabled;
    musicToggle.addEventListener('change', () => {
      audioManager.unlock();
      audioManager.setMusicEnabled(musicToggle.checked);
    });
  }
  if (sfxToggle) {
    sfxToggle.checked = audioManager.settings.sfxEnabled;
    sfxToggle.addEventListener('change', () => {
      audioManager.unlock();
      audioManager.setSfxEnabled(sfxToggle.checked);
      audioManager.playSfx('button');
    });
  }
  if (musicVolumeSlider) {
    musicVolumeSlider.value = Math.round(audioManager.settings.musicVolume * 100);
    musicVolumeSlider.addEventListener('input', () => {
      audioManager.unlock();
      audioManager.setMusicVolume(musicVolumeSlider.value);
    });
  }
  if (sfxVolumeSlider) {
    sfxVolumeSlider.value = Math.round(audioManager.settings.sfxVolume * 100);
    sfxVolumeSlider.addEventListener('input', () => {
      audioManager.unlock();
      audioManager.setSfxVolume(sfxVolumeSlider.value);
      audioManager.playSfx('button', { throttle: 120 });
    });
  }

  document.addEventListener('pointerdown', () => {
    audioManager.unlock();
  }, { once: true });

  document.addEventListener('click', (event) => {
    if (event.target && event.target.closest && event.target.closest('button')) {
      audioManager.unlock();
      audioManager.playSfx('button', { throttle: 45 });
    }
  });
}

function setupTutorial() {
  if (!tutorialOverlay || !tutorialTitle || !tutorialContent || !tutorialPageIndicator) {
    return;
  }

  tutorialOverlay.addEventListener('click', () => {
    closeTutorial();
  });

  const tutorialPanel = tutorialOverlay.querySelector('.tutorial-panel');
  if (tutorialPanel) {
    tutorialPanel.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }

  if (tutorialBackButton) {
    tutorialBackButton.addEventListener('click', () => {
      if (audioManager) audioManager.playSfx('tutorial');
      setTutorialPage(tutorialPageIndex - 1);
    });
  }

  if (tutorialNextButton) {
    tutorialNextButton.addEventListener('click', () => {
      if (audioManager) audioManager.playSfx('tutorial');
      if (tutorialPageIndex >= TUTORIAL_PAGES.length - 1) {
        closeTutorial();
        return;
      }
      setTutorialPage(tutorialPageIndex + 1);
    });
  }

  if (tutorialCloseButton) {
    tutorialCloseButton.addEventListener('click', closeTutorial);
  }

  renderTutorialPage();
}

function showTutorialOnLaunch() {
  window.setTimeout(() => {
    if (!isGameOver && !isTutorialOpen) {
      openTutorial(0);
    }
  }, 0);
}

function openTutorial(pageIndex = 0) {
  if (!tutorialOverlay) {
    return;
  }

  setOptionsPanelOpen(false);
  isTutorialOpen = true;
  activeDragInput = null;
  if (audioManager) {
    audioManager.unlock();
    audioManager.playSfx('uiOpen');
  }
  setTutorialPage(pageIndex);
  tutorialOverlay.classList.remove('hidden');
}

function closeTutorial() {
  if (!tutorialOverlay) {
    return;
  }

  isTutorialOpen = false;
  activeDragInput = null;
  tutorialOverlay.classList.add('hidden');
  destroyTutorialDemoObjects();
  if (audioManager) audioManager.playSfx('uiClose');
}

function destroyTutorialDemoObjects() {
  // Tutorial is DOM-only. This hook keeps tutorial visuals isolated if a demo is added later.
}

function setTutorialPage(pageIndex) {
  tutorialPageIndex = Phaser.Math.Clamp(pageIndex, 0, TUTORIAL_PAGES.length - 1);
  renderTutorialPage();
}

function renderTutorialPage() {
  if (!tutorialTitle || !tutorialContent || !tutorialPageIndicator) {
    return;
  }

  const page = TUTORIAL_PAGES[tutorialPageIndex];
  tutorialTitle.textContent = page.title;
  tutorialPageIndicator.textContent = `${tutorialPageIndex + 1}/${TUTORIAL_PAGES.length}`;
  tutorialContent.innerHTML = '';
  page.lines.forEach((line) => {
    const item = document.createElement('li');
    item.textContent = line;
    tutorialContent.appendChild(item);
  });

  if (tutorialBackButton) {
    tutorialBackButton.disabled = tutorialPageIndex === 0;
  }
  if (tutorialNextButton) {
    tutorialNextButton.textContent = tutorialPageIndex === TUTORIAL_PAGES.length - 1 ? 'Start' : 'Next';
  }
}

function setupDragonInfoTooltips() {
  const icons = document.querySelectorAll('.info-icon[data-tooltip]');
  if (!icons.length) {
    return;
  }

  const tooltip = document.createElement('div');
  tooltip.className = 'dragon-tooltip hidden';
  document.body.appendChild(tooltip);
  let hoverTimer = null;

  const clearHoverTimer = () => {
    if (hoverTimer) {
      window.clearTimeout(hoverTimer);
      hoverTimer = null;
    }
  };

  const hideTooltip = () => {
    clearHoverTimer();
    tooltip.classList.add('hidden');
    tooltip.textContent = '';
  };

  const positionTooltip = (icon) => {
    const iconRect = icon.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const gap = 10;
    const margin = 12;
    let left = iconRect.right + gap;
    let top = iconRect.top + iconRect.height / 2 - tooltipRect.height / 2;

    if (left + tooltipRect.width + margin > window.innerWidth) {
      left = iconRect.left - tooltipRect.width - gap;
    }
    if (left < margin) {
      left = margin;
    }
    if (top + tooltipRect.height + margin > window.innerHeight) {
      top = window.innerHeight - tooltipRect.height - margin;
    }
    if (top < margin) {
      top = margin;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  };

  icons.forEach((icon) => {
    icon.addEventListener('pointerenter', () => {
      clearHoverTimer();
      hoverTimer = window.setTimeout(() => {
        hoverTimer = null;
        tooltip.textContent = icon.dataset.tooltip || '';
        tooltip.classList.remove('hidden');
        positionTooltip(icon);
      }, 150);
    });

    icon.addEventListener('pointerleave', hideTooltip);
    icon.addEventListener('pointercancel', hideTooltip);
  });

  window.addEventListener('resize', hideTooltip);
  window.addEventListener('scroll', hideTooltip, true);
}

function generateEggTextures() {
  const width = 120;
  const height = 140;
  const radius = 36;
  const offsetY = 10;

  const graphics = gameInstance.make.graphics({ x: 0, y: 0, add: false });
  EGG_VISUALS.forEach((egg) => {
    if (gameInstance.textures.exists(egg.key)) {
      return;
    }

    graphics.clear();
    graphics.fillStyle(egg.fallbackColor, 1);
    graphics.fillEllipse(width / 2, height / 2 + offsetY, radius, radius * 1.25);
    graphics.lineStyle(4, 0xffffff, 0.24);
    graphics.strokeEllipse(width / 2, height / 2 + offsetY, radius, radius * 1.25);
    graphics.fillStyle(0xffffff, 0.22);
    graphics.fillEllipse(width / 2 + 10, height / 2 - 10 + offsetY, radius * 0.24, radius * 0.14);
    graphics.generateTexture(egg.key, width, height);
  });
  graphics.destroy();
}

function update() {
  // No per-frame updates needed for this game.
}

function getVisibleViewportSize() {
  const visualViewport = window.visualViewport;
  return {
    width: visualViewport ? visualViewport.width : window.innerWidth,
    height: visualViewport ? visualViewport.height : window.innerHeight,
  };
}

function updateResponsiveLayout() {
  const appShell = document.getElementById('appShell');
  const rotateOverlay = document.getElementById('rotatePhoneOverlay');
  if (!appShell) {
    return;
  }

  const viewport = getVisibleViewportSize();
  const scale = Math.min(
    viewport.width / MOBILE_DESIGN_WIDTH,
    viewport.height / MOBILE_DESIGN_HEIGHT,
    1
  );
  const scaledWidth = MOBILE_DESIGN_WIDTH * scale;
  const scaledHeight = MOBILE_DESIGN_HEIGHT * scale;
  const left = Math.max(0, (viewport.width - scaledWidth) / 2);
  const top = Math.max(0, (viewport.height - scaledHeight) / 2);
  const isNarrowPortrait = viewport.width < viewport.height && viewport.width < MOBILE_PORTRAIT_WIDTH_THRESHOLD;

  document.documentElement.style.setProperty('--viewport-height', `${viewport.height}px`);
  appShell.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;

  if (rotateOverlay) {
    rotateOverlay.classList.toggle('hidden', !isNarrowPortrait);
  }
}

function setupResponsiveLayout() {
  updateResponsiveLayout();
  window.addEventListener('resize', updateResponsiveLayout);
  window.addEventListener('orientationchange', () => {
    updateResponsiveLayout();
    window.setTimeout(updateResponsiveLayout, 120);
    window.setTimeout(updateResponsiveLayout, 360);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateResponsiveLayout);
    window.visualViewport.addEventListener('scroll', updateResponsiveLayout);
  }
}

function createStatCardBackground(cardElement, textureKey) {
  if (!cardElement) {
    return null;
  }

  const asset = STAT_CARD_ASSET_BY_KEY[textureKey];
  if (!asset) {
    return null;
  }

  const existingImage = cardElement.querySelector('.stat-card-bg');
  if (existingImage) {
    existingImage.src = asset.path;
    existingImage.alt = '';
    existingImage.dataset.textureKey = textureKey;
    return existingImage;
  }

  const backgroundImage = document.createElement('img');
  backgroundImage.className = 'stat-card-bg';
  backgroundImage.src = asset.path;
  backgroundImage.alt = '';
  backgroundImage.dataset.textureKey = textureKey;
  backgroundImage.draggable = false;
  backgroundImage.decoding = 'async';
  backgroundImage.onerror = () => {
    backgroundImage.hidden = true;
  };
  cardElement.prepend(backgroundImage);
  return backgroundImage;
}

function setupStatCardBackgrounds() {
  document.querySelectorAll('.stat[data-stat-card]').forEach((cardElement) => {
    createStatCardBackground(cardElement, cardElement.dataset.statCard);
  });
}

function initializeBoard() {
  board = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      board[row][col] = getSafeRandomType(row, col);
    }
  }
}

function getSafeRandomType(row, col) {
  const blocked = new Set();
  if (col >= 2 && board[row][col - 1] === board[row][col - 2]) {
    blocked.add(board[row][col - 1]);
  }
  if (row >= 2 && board[row - 1][col] === board[row - 2][col]) {
    blocked.add(board[row - 1][col]);
  }

  const allowed = [];
  for (let type = 0; type < EGG_TYPES.length; type++) {
    if (!blocked.has(type)) {
      allowed.push(type);
    }
  }
  return Phaser.Math.RND.pick(allowed);
}

function createBoardSprites() {
  tileSprites = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    tileSprites[row] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      const position = getEggPosition(row, col);
      tileSprites[row][col] = createTileSprite(row, col, position.x, position.y, board[row][col]);
    }
  }
}

function createBoardSkinLayer() {
  const metrics = getBoardMetrics();
  console.log('boardX', metrics.boardX);
  console.log('boardY', metrics.boardY);
  console.log('boardWidth', metrics.boardWidth);
  console.log('boardHeight', metrics.boardHeight);
  console.log('playableX', metrics.playableX);
  console.log('playableY', metrics.playableY);
  console.log('playableWidth', metrics.playableWidth);
  console.log('playableHeight', metrics.playableHeight);
  console.log('cellWidth', metrics.cellWidth);
  console.log('cellHeight', metrics.cellHeight);

  // Board uses default background only. Dragon skills use visual effects instead of board skin switching.
  if (!gameInstance.textures.exists(DEFAULT_BOARD_SKIN.key)) {
    console.warn('Default board texture missing; using CSS board background fallback.');
    boardSkinSprite = null;
    return;
  }

  boardSkinSprite = gameInstance.add.image(metrics.boardX, metrics.boardY, DEFAULT_BOARD_SKIN.key);
  boardSkinSprite.setOrigin(0, 0);
  boardSkinSprite.setDisplaySize(metrics.boardWidth, metrics.boardHeight);
  boardSkinSprite.setDepth(0);
}

function getBoardMetrics() {
  // Board image position: the decorative frame starts at the canvas origin.
  const boardX = 0;
  const boardY = 0;
  const boardWidth = BOARD_RENDER_WIDTH;
  const boardHeight = BOARD_RENDER_HEIGHT;
  const playableX = boardX + BOARD_INSET_X;
  const playableY = boardY + BOARD_INSET_Y;
  const playableWidth = boardWidth - BOARD_INSET_X * 2;
  const playableHeight = boardHeight - BOARD_INSET_Y * 2;
  const cellWidth = playableWidth / COLS;
  const cellHeight = playableHeight / ROWS;

  return {
    boardX,
    boardY,
    boardWidth,
    boardHeight,
    playableX,
    playableY,
    playableWidth,
    playableHeight,
    cellWidth,
    cellHeight,
  };
}

function getEggPosition(row, col) {
  const metrics = getBoardMetrics();
  return {
    x: metrics.playableX + col * metrics.cellWidth + metrics.cellWidth / 2,
    y: metrics.playableY + row * metrics.cellHeight + metrics.cellHeight / 2,
  };
}

function getPlayableBoardCenter() {
  const metrics = getBoardMetrics();
  return {
    x: metrics.playableX + metrics.playableWidth / 2,
    y: metrics.playableY + metrics.playableHeight / 2,
  };
}

function setEggDisplaySize(sprite) {
  const scale = getEggScale(sprite);
  sprite.setScale(scale.x, scale.y);
}

function getEggScale(sprite, ratio = 1) {
  const metrics = getBoardMetrics();
  const eggSize = Math.min(metrics.cellWidth, metrics.cellHeight) * EGG_SIZE_RATIO;
  return {
    x: (eggSize / sprite.width) * ratio,
    y: (eggSize / sprite.height) * ratio,
  };
}

function setEggSelectedSize(sprite) {
  const scale = getEggScale(sprite, SELECTED_SCALE);
  sprite.setScale(scale.x, scale.y);
}

function getEggTextureKey(type) {
  const egg = EGG_VISUALS[type];
  return egg ? egg.key : EGG_VISUALS[0].key;
}

function canAcceptBoardInput() {
  return !isOptionsPanelOpen && !isTutorialOpen && !isGameOver && !isGameOverPending && !isAnimating && timer > 0;
}

function attachEggInputHandlers(sprite) {
  if (!sprite) return;

  sprite.setInteractive();
  try { sprite.off && sprite.off('pointerdown'); } catch (e) {}
  sprite.on && sprite.on('pointerdown', function (pointer) {
    const r = this.getData('row');
    const c = this.getData('col');
    const t = this.getData('type');
    console.log('egg pointer down', r, c, t);
    handleEggPointerDown(r, c, pointer);
  });
}

function createTileSprite(row, col, x, y, type) {
  const texture = getEggTextureKey(type);
  const sprite = gameInstance.add.sprite(x, y, texture);
  sprite.setDepth(10);
  setEggDisplaySize(sprite);
  sprite.setAlpha(1);
  sprite.clearTint();
  sprite.setData('row', row);
  sprite.setData('col', col);
  sprite.setData('type', type);
  attachEggInputHandlers(sprite);
  console.log('created egg', row, col, type);
  console.log('interactive attached', row, col);
  return sprite;
}

function handleEggPointerDown(row, col, pointer) {
  if (!canAcceptBoardInput()) {
    return;
  }

  activeDragInput = {
    row,
    col,
    startX: pointer.x,
    startY: pointer.y,
    pointerId: pointer.id,
    dragSwapTriggered: false,
  };
}

function getSwipeTarget(start, dx, dy) {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_SWAP_THRESHOLD) {
    return null;
  }

  let row = start.row;
  let col = start.col;
  if (Math.abs(dx) >= Math.abs(dy)) {
    col += dx > 0 ? 1 : -1;
  } else {
    row += dy > 0 ? 1 : -1;
  }

  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
    return { outOfBounds: true };
  }

  return { row, col };
}

function handleBoardPointerMove(pointer) {
  if (!activeDragInput || activeDragInput.dragSwapTriggered) {
    return;
  }

  if (pointer.id !== activeDragInput.pointerId || !canAcceptBoardInput()) {
    return;
  }

  const dx = pointer.x - activeDragInput.startX;
  const dy = pointer.y - activeDragInput.startY;
  const target = getSwipeTarget(activeDragInput, dx, dy);
  if (!target) {
    return;
  }

  activeDragInput.dragSwapTriggered = true;
  if (target.outOfBounds) {
    return;
  }

  console.log('drag swap triggered', activeDragInput.row, activeDragInput.col, '->', target.row, target.col);
  deselectEgg();
  swapEggs({ row: activeDragInput.row, col: activeDragInput.col }, target);
}

function handleBoardPointerUp(pointer) {
  if (!activeDragInput || pointer.id !== activeDragInput.pointerId) {
    return;
  }

  const dragInput = activeDragInput;
  activeDragInput = null;
  if (dragInput.dragSwapTriggered) {
    return;
  }

  console.log('egg clicked', dragInput.row, dragInput.col);
  handleTileClick(dragInput.row, dragInput.col);
}

function handleTileClick(row, col) {
  if (isGameOver) {
    console.log('Input ignored because game over');
    return;
  }

  if (isAnimating || timer <= 0) {
    return;
  }

  if (!selectedEgg) {
    selectEgg({ row, col });
    console.log('first selected', row, col);
    return;
  }

  if (selectedEgg.row === row && selectedEgg.col === col) {
    deselectEgg();
    console.log('selection cleared');
    return;
  }

  console.log('second selected', row, col);
  const adjacent = isAdjacent(selectedEgg, { row, col });
  console.log('is adjacent', adjacent);

  if (!adjacent) {
    deselectEgg();
    selectEgg({ row, col });
    console.log('new egg selected', row, col);
    return;
  }

  const firstEgg = selectedEgg;
  deselectEgg();
  swapEggs(firstEgg, { row, col });
}

function selectEgg(egg) {
  if (!egg) return;
  selectedEgg = egg;
  const sprite = tileSprites[egg.row] && tileSprites[egg.row][egg.col];
  if (sprite) {
    setEggSelectedSize(sprite);
    sprite.setTint(0xffffff);
  }
}

function deselectEgg() {
  if (!selectedEgg) return;
  resetEggVisual(selectedEgg);
  selectedEgg = null;
}

function resetEggVisual(egg) {
  if (!egg) return;
  const sprite = tileSprites[egg.row] && tileSprites[egg.row][egg.col];
  if (sprite) {
    sprite.setScale(NORMAL_SCALE);
    setEggDisplaySize(sprite);
    sprite.setAlpha(1);
    sprite.clearTint();
  }
}

function resetBoardVisuals() {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const sprite = tileSprites[row] && tileSprites[row][col];
      if (sprite) {
        sprite.setScale(NORMAL_SCALE);
        setEggDisplaySize(sprite);
        sprite.setAlpha(1);
        sprite.clearTint();
      }
    }
  }
}

function getBoardSprites() {
  const sprites = [];
  tileSprites.forEach((rowSprites) => {
    rowSprites.forEach((sprite) => {
      if (sprite) {
        sprites.push(sprite);
      }
    });
  });
  return sprites;
}

function disableBoardInput() {
  activeDragInput = null;
  getBoardSprites().forEach((sprite) => {
    try { sprite.disableInteractive(); } catch (e) {}
  });
}

function enableBoardInput() {
  if (isGameOver || isGameOverPending || timer <= 0) {
    disableBoardInput();
    return;
  }

  getBoardSprites().forEach((sprite) => {
    try { sprite.setInteractive(); } catch (e) {}
  });
}

function stopBoardTweens() {
  if (!gameInstance || !gameInstance.tweens) return;
  gameInstance.tweens.killTweensOf(getBoardSprites());
}

function stopGameplayTweensAndTimers() {
  if (!gameInstance) return;

  try {
    if (gameInstance.tweens) {
      gameInstance.tweens.killAll();
    }
  } catch (e) {}

  try {
    if (gameInstance.time && gameInstance.time.removeAllEvents) {
      gameInstance.time.removeAllEvents();
    }
  } catch (e) {}

  countdownEvent = null;
}

function clearPhaserGameplayObjects() {
  if (!gameInstance || !gameInstance.children) {
    clearBoardSprites();
    return;
  }

  try {
    gameInstance.children.removeAll(true);
  } catch (e) {
    clearBoardSprites();
  }

  boardSkinSprite = null;
  tileSprites = [];
}

function rebuildGameplayBoard() {
  clearPhaserGameplayObjects();
  initializeBoard();
  createBoardSkinLayer();
  createBoardSprites();
}

function isAdjacent(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

function swapEggs(first, second) {
  if (isGameOver || isGameOverPending || timer <= 0) {
    console.log('Input ignored because game over');
    return;
  }

  if (!first || !second) {
    return;
  }
  const runId = gameRunId;
  isAnimating = true;
  console.log('input disabled');
  // Ensure sprites exist at these positions (they may be null after animations)
  const firstSprite = ensureSpriteAt(first.row, first.col);
  const secondSprite = ensureSpriteAt(second.row, second.col);
  const firstPos = { x: firstSprite.x, y: firstSprite.y };
  const secondPos = { x: secondSprite.x, y: secondSprite.y };

  swapCells(first, second);

  gameInstance.tweens.add({
    targets: firstSprite,
    x: secondPos.x,
    y: secondPos.y,
    duration: 180,
    ease: 'Power2',
  });
  gameInstance.tweens.add({
    targets: secondSprite,
    x: firstPos.x,
    y: firstPos.y,
    duration: 180,
    ease: 'Power2',
    onComplete: () => {
      if (isGameOver || !isCurrentRun(runId)) {
        console.log('Resolve stopped because game over');
        return;
      }

      tileSprites[first.row][first.col] = secondSprite;
      tileSprites[second.row][second.col] = firstSprite;
      updateSpriteData(firstSprite, second.row, second.col);
      updateSpriteData(secondSprite, first.row, first.col);

      const patterns = detectPatterns();
      if (patterns.length === 0) {
        console.log('no match, swapping back');
        lastSwappedCells = [];
        swapCells(first, second);
        gameInstance.tweens.add({
          targets: firstSprite,
          x: firstPos.x,
          y: firstPos.y,
          duration: 180,
          ease: 'Power2',
        });
        gameInstance.tweens.add({
          targets: secondSprite,
          x: secondPos.x,
          y: secondPos.y,
          duration: 180,
          ease: 'Power2',
          onComplete: () => {
            if (isGameOver || !isCurrentRun(runId)) {
              console.log('Resolve stopped because game over');
              return;
            }

            tileSprites[first.row][first.col] = firstSprite;
            tileSprites[second.row][second.col] = secondSprite;
            updateSpriteData(firstSprite, first.row, first.col);
            updateSpriteData(secondSprite, second.row, second.col);
            selectedEgg = null;
            isAnimating = false;
            completePendingGameOverIfReady();
          },
        });
        return;
      }

      console.log('swap completed');
      if (!gameStarted) {
        gameStarted = true;
        console.log('First valid move detected');
        if (audioManager) {
          audioManager.unlock();
          audioManager.startBgm();
        }
        startTimer();
      }
      lastSwappedCells = [
        { row: second.row, col: second.col },
        { row: first.row, col: first.col }
      ];
      console.log('lastSwappedCells', lastSwappedCells);
      selectedEgg = null;
      startComboChain();
      startLeafScoreForSuccessfulMove();
      updateUi();
      resolveBoard(false);
    },
  });
}

// Detect match effects with priority and return a full list of effect objects.
function detectPatterns() {
  const effects = [];

  function addEffect(effect) {
    effects.push(effect);
  }

  for (let row = 0; row < GRID_SIZE; row++) {
    let col = 0;
    while (col < GRID_SIZE) {
      const current = board[row][col];
      if (current === null || current === undefined) { col++; continue; }
      let end = col + 1;
      while (end < GRID_SIZE && board[row][end] === current) end++;
      const len = end - col;
      if (len >= 3) {
        const tiles = [];
        for (let c = col; c < end; c++) tiles.push({ row, col: c });
        const type = len >= 5 ? 'match5' : len === 4 ? 'match4' : 'match3';
        const centerCell = type === 'match4' ? selectMatch4CenterCell(tiles) : null;
        addEffect({
          type,
          priority: type === 'match5' ? 5 : type === 'match4' ? 4 : 3,
          eggType: current,
          matchedCells: tiles,
          direction: 'horizontal',
          centerCell,
        });
      }
      col = end;
    }
  }

  for (let col = 0; col < GRID_SIZE; col++) {
    let row = 0;
    while (row < GRID_SIZE) {
      const current = board[row][col];
      if (current === null || current === undefined) { row++; continue; }
      let end = row + 1;
      while (end < GRID_SIZE && board[end][col] === current) end++;
      const len = end - row;
      if (len >= 3) {
        const tiles = [];
        for (let r = row; r < end; r++) tiles.push({ row: r, col });
        const type = len >= 5 ? 'match5' : len === 4 ? 'match4' : 'match3';
        const centerCell = type === 'match4' ? selectMatch4CenterCell(tiles) : null;
        addEffect({
          type,
          priority: type === 'match5' ? 5 : type === 'match4' ? 4 : 3,
          eggType: current,
          matchedCells: tiles,
          direction: 'vertical',
          centerCell,
        });
      }
      row = end;
    }
  }

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const type = board[row][col];
      if (type === null || type === undefined) continue;
      const combos = [ ['up', 'right'], ['up', 'left'], ['down', 'right'], ['down', 'left'] ];
      combos.forEach(([dirA, dirB]) => {
        const dA = dirToDelta(dirA);
        const dB = dirToDelta(dirB);
        const armA = countLine(row, col, dA[0], dA[1], type);
        const armB = countLine(row, col, dB[0], dB[1], type);
        const vLen = armA + 1;
        const hLen = armB + 1;
        if (vLen >= 3 && hLen >= 3) {
          const positions = [{ row, col }];
          positions.push(...collectLine(row, col, dirA, type, armA));
          positions.push(...collectLine(row, col, dirB, type, armB));
          const unique = uniqPositions(positions);
          addEffect({
            type: 'lshape',
            priority: 4,
            eggType: type,
            matchedCells: unique,
            centerCell: { row, col },
          });
        }
      });
    }
  }

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const type = board[row][col];
      if (type === null || type === undefined) continue;
      const up = countLine(row, col, -1, 0, type);
      const down = countLine(row, col, 1, 0, type);
      const left = countLine(row, col, 0, -1, type);
      const right = countLine(row, col, 0, 1, type);
      const vLen = up + down + 1;
      const hLen = left + right + 1;
      if (vLen >= 3 && hLen >= 3) {
        const positions = [];
        for (let r = row - up; r <= row + down; r++) positions.push({ row: r, col });
        for (let c = col - left; c <= col + right; c++) positions.push({ row, col: c });
        const unique = uniqPositions(positions);
        addEffect({
          type: 'tshape',
          priority: 4,
          eggType: type,
          matchedCells: unique,
          centerCell: { row, col },
        });
      }
    }
  }

  console.log('detected effects', effects.map((effect) => ({ type: effect.type, eggType: effect.eggType, count: effect.matchedCells.length, direction: effect.direction, center: effect.centerCell })));
  return effects;
}

// Ensure a sprite exists for a given board cell. Create it if missing.
function ensureSpriteAt(row, col) {
  if (!tileSprites[row]) tileSprites[row] = [];
  let sprite = tileSprites[row][col];
  const type = board[row] && typeof board[row][col] !== 'undefined' ? board[row][col] : Phaser.Math.Between(0, EGG_TYPES.length - 1);
  const position = getEggPosition(row, col);
  const x = position.x;
  const y = position.y;
  if (!sprite) {
    sprite = createTileSprite(row, col, x, y, type);
    tileSprites[row][col] = sprite;
    console.log('recreated missing sprite at', row, col);
  }
  // ensure it's at the correct position and visual state
  sprite.x = x;
  sprite.y = y;
  sprite.setScale(NORMAL_SCALE);
  setEggDisplaySize(sprite);
  sprite.setAlpha(1);
  sprite.clearTint();
  attachEggInputHandlers(sprite);
  return sprite;
}

function swapCells(a, b) {
  const temp = board[a.row][a.col];
  board[a.row][a.col] = board[b.row][b.col];
  board[b.row][b.col] = temp;
}

function updateSpriteData(sprite, row, col) {
  sprite.setData('row', row);
  sprite.setData('col', col);
}

function dirToDelta(dir) {
  if (dir === 'up') return [-1, 0];
  if (dir === 'down') return [1, 0];
  if (dir === 'left') return [0, -1];
  if (dir === 'right') return [0, 1];
  return [0, 0];
}

function countLine(row, col, dRow, dCol, type) {
  let count = 0;
  let r = row + dRow;
  let c = col + dCol;
  while (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && board[r][c] === type) {
    count += 1;
    r += dRow;
    c += dCol;
  }
  return count;
}

function collectLine(row, col, direction, type, maxCount) {
  const offsets = {
    up: [-1, 0],
    down: [1, 0],
    left: [0, -1],
    right: [0, 1],
  };
  const [dRow, dCol] = offsets[direction];
  const tiles = [];
  let r = row + dRow;
  let c = col + dCol;
  while (tiles.length < maxCount && r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && board[r][c] === type) {
    tiles.push({ row: r, col: c });
    r += dRow;
    c += dCol;
  }
  return tiles;
}

function uniqPositions(tiles) {
  const unique = {};
  tiles.forEach((tile) => {
    unique[`${tile.row}-${tile.col}`] = tile;
  });
  return Object.values(unique);
}

function sortCellsForLine(cells) {
  return cells.slice().sort((a, b) => {
    if (a.row !== b.row) {
      return a.row - b.row;
    }
    return a.col - b.col;
  });
}

function selectMatch4FallbackCell(matchedCells) {
  const sortedCells = sortCellsForLine(matchedCells);
  return sortedCells[2] || sortedCells[Math.floor(sortedCells.length / 2)] || sortedCells[0];
}

function selectMatch4CenterCell(matchedCells) {
  const sortedCells = sortCellsForLine(matchedCells);
  console.log('lastSwappedCells', lastSwappedCells);
  console.log('Match 4 matchedCells', sortedCells);

  const swappedCell = lastSwappedCells.find((swapped) => (
    sortedCells.some((cell) => cell.row === swapped.row && cell.col === swapped.col)
  ));

  if (swappedCell) {
    console.log('Match 4 center selected from swapped cell', swappedCell.row, swappedCell.col);
    return { row: swappedCell.row, col: swappedCell.col };
  }

  const fallbackCell = selectMatch4FallbackCell(matchedCells);
  console.log('Match 4 fallback center used', fallbackCell.row, fallbackCell.col);
  return { row: fallbackCell.row, col: fallbackCell.col };
}

function isDelayedSpecialEffect(effect) {
  return effect.type === 'match4' || effect.type === 'match5' || effect.type === 'lshape' || effect.type === 'tshape';
}

function cellsContain(cells, target) {
  return cells.some((cell) => cell.row === target.row && cell.col === target.col);
}

function selectSpecialTriggerCell(effect, useSwappedTrigger) {
  if (useSwappedTrigger) {
    const swappedCell = lastSwappedCells.find((swapped) => cellsContain(effect.matchedCells, swapped));
    if (swappedCell) {
      console.log('Trigger egg selected', swappedCell.row, swappedCell.col);
      return { row: swappedCell.row, col: swappedCell.col };
    }
  }

  const fallbackCell = effect.type === 'match4'
    ? selectMatch4FallbackCell(effect.matchedCells)
    : effect.centerCell || effect.matchedCells[Math.floor(effect.matchedCells.length / 2)] || effect.matchedCells[0];
  console.log('Trigger egg selected', fallbackCell.row, fallbackCell.col);
  return { row: fallbackCell.row, col: fallbackCell.col };
}

function startTriggerEggBlink(triggerCell) {
  const sprite = tileSprites[triggerCell.row] && tileSprites[triggerCell.row][triggerCell.col];
  if (!sprite) {
    return null;
  }

  console.log('Trigger egg blinking');
  sprite.setTint(0xfff2a8);
  return gameInstance.tweens.add({
    targets: sprite,
    alpha: 0.38,
    duration: 260,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

function stopTriggerEggBlink(delayedSpecial) {
  const sprite = delayedSpecial.triggerSprite;
  if (delayedSpecial.blinkTween) {
    try { delayedSpecial.blinkTween.stop(); } catch (e) {}
  }
  if (sprite && sprite.active) {
    sprite.setAlpha(1);
    sprite.clearTint();
  }
}

function getDelayedSpecialTriggerCell(delayedSpecial) {
  const sprite = delayedSpecial.triggerSprite;
  if (sprite && sprite.active) {
    return {
      row: sprite.getData('row'),
      col: sprite.getData('col'),
    };
  }

  return delayedSpecial.triggerCell;
}

function queueDelayedSpecial(effect, triggerCell) {
  console.log('Special match delayed');
  const triggerSprite = tileSprites[triggerCell.row] && tileSprites[triggerCell.row][triggerCell.col];
  delayedSpecialQueue.push({
    type: effect.type,
    direction: effect.direction,
    eggType: effect.eggType,
    triggerCell,
    triggerSprite,
    blinkTween: startTriggerEggBlink(triggerCell),
  });
}

function getDelayedSpecialTargets(delayedSpecial, triggerCell) {
  if (delayedSpecial.type === 'match5') {
    return getAllSameType(delayedSpecial.eggType);
  }

  if (delayedSpecial.type === 'match4') {
    const effect = {
      type: 'match4',
      direction: delayedSpecial.direction,
      centerCell: triggerCell,
      matchedCells: [triggerCell],
    };
    return getMatch4Targets(effect);
  }

  return getExplosionArea(triggerCell.row, triggerCell.col);
}

function processDelayedSpecialQueue(onComplete, runId = gameRunId) {
  if (isGameOver || !isCurrentRun(runId)) {
    console.log('Resolve stopped because game over');
    return;
  }

  if (!delayedSpecialQueue.length) {
    if (onComplete) onComplete();
    return;
  }

  const delayedSpecial = delayedSpecialQueue.shift();
  const triggerCell = getDelayedSpecialTriggerCell(delayedSpecial);
  console.log('Activating delayed special');
  stopTriggerEggBlink(delayedSpecial);

  const destroyedCells = new Set();
  getDelayedSpecialTargets(delayedSpecial, triggerCell).forEach((tile) => {
    if (
      tile.row >= 0 &&
      tile.row < GRID_SIZE &&
      tile.col >= 0 &&
      tile.col < GRID_SIZE &&
      board[tile.row][tile.col] !== null &&
      board[tile.row][tile.col] !== undefined
    ) {
      destroyedCells.add(`${tile.row}-${tile.col}`);
    }
  });

  let totalScoreGain = destroyedCells.size * MATCH_SCORE;
  if (delayedSpecial.type === 'match5') {
    totalScoreGain *= 2;
  }

  grantDragonEnergyForDestroyedCells(destroyedCells, 'match');

  addScore(totalScoreGain, runId);
  const popupPosition = getEggPosition(triggerCell.row, triggerCell.col);
  if (totalScoreGain > 0) {
    createScorePopup(popupPosition.x, popupPosition.y, `+${totalScoreGain}`, 32);
  }

  playDelayedSpecialActivationEffect(delayedSpecial, triggerCell, destroyedCells, () => {
    if (!isCurrentRun(runId)) {
      return;
    }
    animateRemovals(destroyedCells, () => {
      if (!isCurrentRun(runId)) {
        return;
      }
      console.log('Delayed special complete');
      processDelayedSpecialQueue(onComplete, runId);
    }, { source: 'match', runId });
  });
}

function clearDelayedSpecialQueue() {
  delayedSpecialQueue.forEach((delayedSpecial) => {
    stopTriggerEggBlink(delayedSpecial);
  });
  delayedSpecialQueue = [];
}

function startComboChain() {
  currentComboChainId += 1;
  currentComboCascadeStep = 0;
  isComboChainActive = true;
  console.log('Combo chain started:', currentComboChainId);
}

function ensureComboChainActive() {
  if (!isComboChainActive) {
    startComboChain();
  }
}

function endComboChain() {
  if (!isComboChainActive) {
    return;
  }

  console.log('Combo chain ended:', currentComboChainId);
  currentComboCascadeStep = 0;
  isComboChainActive = false;
}

function getCascadeLimit(isAutomatic) {
  return isAutomatic ? Math.min(MAX_PLAYER_CASCADE_STEPS, MAX_SKILL_CASCADE_STEPS) : MAX_PLAYER_CASCADE_STEPS;
}

function getCellsFromEffects(effects) {
  const cellsByKey = new Map();
  effects.forEach((effect) => {
    effect.matchedCells.forEach((cell) => {
      cellsByKey.set(`${cell.row}-${cell.col}`, cell);
    });
  });
  return Array.from(cellsByKey.values());
}

function rerollCellType(row, col) {
  const currentType = board[row] && board[row][col];
  let nextType = currentType;
  let attempts = 0;
  while (nextType === currentType && attempts < 8) {
    nextType = Phaser.Math.Between(0, EGG_TYPES.length - 1);
    attempts += 1;
  }
  board[row][col] = nextType;
}

function syncBoardSpritesToBoard() {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const sprite = ensureSpriteAt(row, col);
      const type = board[row][col];
      sprite.setData('type', type);
      sprite.setTexture(getEggTextureKey(type));
      setEggDisplaySize(sprite);
    }
  }
  resetBoardVisuals();
}

function stabilizeBoardAfterCascadeCap() {
  let attempts = 0;
  let effects = detectPatterns();
  while (effects.length && attempts < 20) {
    getCellsFromEffects(effects).forEach((cell) => {
      rerollCellType(cell.row, cell.col);
    });
    attempts += 1;
    effects = detectPatterns();
  }
  syncBoardSpritesToBoard();
  console.log('Board stabilized after cascade cap');
}

function finishResolveBoardChain(isAutomatic, stepNumber, wasCascadeCapped = false) {
  console.log(wasCascadeCapped ? 'Combo chain capped' : 'chain finished');
  console.log('Combo chain finished');
  isResolving = false;
  updateUi();
  if (activatePendingDragonSkills(true)) {
    return;
  }
  finishLeafScoreForSuccessfulMove();
  unlockAllDragonEnergy();
  endComboChain();
  comboCount = 0;
  updateUi();
  isAnimating = false;
  if (completePendingGameOverIfReady()) {
    return;
  }
  enableBoardInput();
}

function resolveBoard(isAutomatic = false) {
  const runId = gameRunId;
  if (isGameOver || !isCurrentRun(runId)) {
    console.log('Resolve stopped because game over');
    return;
  }

  isResolving = true;
  isAnimating = true;
  ensureComboChainActive();
  deselectEgg();
  console.log('selection cleared after destroy');

  let stepNumber = 0;
  const cascadeLimit = getCascadeLimit(isAutomatic);
  let firstStep = !isAutomatic;

  const runStep = () => {
    if (isGameOver || !isCurrentRun(runId)) {
      isResolving = false;
      console.log('Resolve stopped because game over');
      return;
    }

    stepNumber += 1;
    console.log('resolve step', stepNumber);

    const effects = detectPatterns();
    console.log('effects detected in chain', effects.length);
    if (!effects.length) {
      if (delayedSpecialQueue.length) {
        processDelayedSpecialQueue(() => {
          if (isGameOver || !isCurrentRun(runId)) {
            isResolving = false;
            console.log('Resolve stopped because game over');
            return;
          }
          runStep();
        }, runId);
        return;
      }

      if (pendingFireStorm) {
        const destroyedCells = new Set();
        const totalScoreGain = applyPendingFireStorm(destroyedCells);
        grantDragonEnergyForDestroyedCells(destroyedCells, 'dragonSkill');

        addScore(totalScoreGain, runId);
        if (isGameOver || !isCurrentRun(runId)) {
          isResolving = false;
          console.log('Resolve stopped because game over');
          return;
        }

        animateRemovals(destroyedCells, () => {
          if (isGameOver || !isCurrentRun(runId)) {
            isResolving = false;
            console.log('Resolve stopped because game over');
            return;
          }
          runStep();
        }, { source: 'dragonSkill', runId });
        return;
      }

      finishResolveBoardChain(isAutomatic, stepNumber);
      return;
    }

    const countsTowardCascadeLimit = isAutomatic || !firstStep;
    if (countsTowardCascadeLimit && currentComboCascadeStep >= cascadeLimit) {
      console.log('Cascade cap reached:', currentComboCascadeStep, '/', cascadeLimit);
      stabilizeBoardAfterCascadeCap();
      const center = getPlayableBoardCenter();
      createScorePopup(center.x, center.y, 'Board Stabilized!', 24);
      finishResolveBoardChain(isAutomatic, stepNumber, true);
      return;
    }

    if (countsTowardCascadeLimit) {
      currentComboCascadeStep += 1;
      console.log('Global cascade step:', currentComboCascadeStep, '/', cascadeLimit);
    }

    const useSwappedTrigger = firstStep && !isAutomatic;

    firstStep = false;

    effects.sort((a, b) => b.priority - a.priority);
    console.log('sorted effects by priority', effects.map((effect) => ({ type: effect.type, priority: effect.priority, eggType: effect.eggType })));

    const destroyedCells = new Set();
    const reservedDelayedTriggerKeys = new Set();
    const delayedTriggerCells = new Map();
    let totalScoreGain = 0;

    effects.forEach((effect) => {
      if (!isDelayedSpecialEffect(effect)) {
        return;
      }

      const triggerCell = selectSpecialTriggerCell(effect, useSwappedTrigger);
      delayedTriggerCells.set(effect, triggerCell);
      reservedDelayedTriggerKeys.add(`${triggerCell.row}-${triggerCell.col}`);
    });

    effects.forEach((effect) => {
      console.log('applying special effect in chain', effect.type, effect.direction || '', effect.centerCell ? `${effect.centerCell.row}-${effect.centerCell.col}` : '');
      let effectTargets = [];
      let triggerKey = null;

      if (isDelayedSpecialEffect(effect)) {
        const triggerCell = delayedTriggerCells.get(effect);
        triggerKey = `${triggerCell.row}-${triggerCell.col}`;
        queueDelayedSpecial(effect, triggerCell);
        effectTargets = effect.matchedCells.filter((cell) => `${cell.row}-${cell.col}` !== triggerKey);
      } else {
        effectTargets = effect.matchedCells;
      }

      let newDestroyed = 0;
      const sampleTile = effect.centerCell || effect.matchedCells[0] || { row: 0, col: 0 };
      const popupPosition = getEggPosition(sampleTile.row, sampleTile.col);
      const px = popupPosition.x;
      const py = popupPosition.y;
      const isBigPopup = effect.type === 'match5' || effect.type === 'match4' || effect.type === 'lshape' || effect.type === 'tshape';

      effectTargets.forEach((tile) => {
        const key = `${tile.row}-${tile.col}`;
        if (reservedDelayedTriggerKeys.has(key)) {
          return;
        }
        if (destroyedCells.has(key)) {
          console.log('skipped duplicate cell', key);
          return;
        }
        destroyedCells.add(key);
        newDestroyed += 1;
      });

      let effectScore = newDestroyed * MATCH_SCORE;

      totalScoreGain += effectScore;
      console.log('score gained from effect', effect.type, effectScore);
      console.log('total destroyed cells', destroyedCells.size);
      if (effectScore > 0) {
        createScorePopup(px, py, `+${effectScore}`, isBigPopup ? 32 : 20);
      }
    });

    grantDragonEnergyForDestroyedCells(destroyedCells, 'match');

    addScore(totalScoreGain, runId);
    if (isGameOver || !isCurrentRun(runId)) {
      isResolving = false;
      console.log('Resolve stopped because game over');
      return;
    }

    animateRemovals(destroyedCells, () => {
      if (isGameOver || !isCurrentRun(runId)) {
        isResolving = false;
        console.log('Resolve stopped because game over');
        return;
      }
      processDelayedSpecialQueue(() => {
        if (isGameOver || !isCurrentRun(runId)) {
          isResolving = false;
          console.log('Resolve stopped because game over');
          return;
        }
        runStep();
      }, runId);
    }, { source: 'match', runId });
  };

  runStep();
}

function getExplosionArea(row, col) {
  const cells = [];
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        cells.push({ row: r, col: c });
      }
    }
  }
  return cells;
}

function getAllSameType(type) {
  const cells = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === type) {
        cells.push({ row, col });
      }
    }
  }
  return cells;
}

function getMatch4Targets(effect) {
  const centerCell = effect.centerCell || effect.matchedCells[Math.floor(effect.matchedCells.length / 2)];
  console.log('Match 4 center cell', centerCell.row, centerCell.col);

  let lineTargets = [];
  if (effect.direction === 'horizontal') {
    console.log('Match 4 horizontal detected, clearing vertical column');
    console.log('Clearing column', centerCell.col);
    lineTargets = getFullLine('vertical', centerCell);
  } else {
    console.log('Match 4 vertical detected, clearing horizontal row');
    console.log('Clearing row', centerCell.row);
    lineTargets = getFullLine('horizontal', centerCell);
  }

  return effect.matchedCells.concat(lineTargets);
}

function getFullLine(direction, tile) {
  const cells = [];
  if (direction === 'horizontal') {
    for (let c = 0; c < GRID_SIZE; c++) {
      cells.push({ row: tile.row, col: c });
    }
  } else {
    for (let r = 0; r < GRID_SIZE; r++) {
      cells.push({ row: r, col: tile.col });
    }
  }
  return cells;

}

function getCellsFromRemovalSet(removalSet) {
  return Array.from(removalSet).map((key) => {
    const [row, col] = key.split('-').map(Number);
    return { row, col };
  });
}

function createCellImpactFlash(cell, theme, delay = 0) {
  if (!gameInstance) return;

  const position = getEggPosition(cell.row, cell.col);
  gameInstance.time.delayedCall(delay, () => {
    if (isGameOver) return;

    const flash = gameInstance.add.circle(position.x, position.y, 18, theme.secondary, 0.46);
    flash.setDepth(910);
    gameInstance.tweens.add({
      targets: flash,
      scale: 1.9,
      alpha: 0,
      duration: 150,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        try { flash.destroy(); } catch (e) {}
      },
    });
  });
}

function playMatch4BeamEffect(triggerCell, affectedCells, direction, onComplete) {
  if (!gameInstance) {
    if (onComplete) onComplete();
    return;
  }
  if (audioManager) audioManager.playSfx('match4', { throttle: 180 });

  const triggerType = board[triggerCell.row] && board[triggerCell.row][triggerCell.col];
  const theme = getEggDestroyTheme(triggerType);
  const metrics = getBoardMetrics();
  const origin = getEggPosition(triggerCell.row, triggerCell.col);
  const clearsColumn = direction === 'horizontal';
  const beamThickness = Math.min(metrics.cellWidth, metrics.cellHeight) * 0.18;
  const positiveLength = clearsColumn
    ? (metrics.playableY + metrics.playableHeight) - origin.y
    : (metrics.playableX + metrics.playableWidth) - origin.x;
  const negativeLength = clearsColumn
    ? origin.y - metrics.playableY
    : origin.x - metrics.playableX;
  const beamObjects = [];

  const makeBeam = (isPositive) => {
    const actualLength = Math.max(6, isPositive ? positiveLength : negativeLength);
    const beam = gameInstance.add.rectangle(
      origin.x,
      origin.y,
      clearsColumn ? beamThickness : actualLength,
      clearsColumn ? actualLength : beamThickness,
      theme.secondary,
      0.82
    );
    beam.setDepth(905);
    if (clearsColumn) {
      beam.setOrigin(0.5, isPositive ? 0 : 1);
      beam.setScale(1, 0.02);
    } else {
      beam.setOrigin(isPositive ? 0 : 1, 0.5);
      beam.setScale(0.02, 1);
    }
    beamObjects.push(beam);

    const glow = gameInstance.add.rectangle(
      origin.x,
      origin.y,
      clearsColumn ? beamThickness * 2.8 : actualLength,
      clearsColumn ? actualLength : beamThickness * 2.8,
      theme.glow,
      0.22
    );
    glow.setDepth(904);
    if (clearsColumn) {
      glow.setOrigin(0.5, isPositive ? 0 : 1);
      glow.setScale(1, 0.02);
    } else {
      glow.setOrigin(isPositive ? 0 : 1, 0.5);
      glow.setScale(0.02, 1);
    }
    beamObjects.push(glow);

    const targetScale = clearsColumn ? { scaleY: 1 } : { scaleX: 1 };
    gameInstance.tweens.add({
      targets: [beam, glow],
      ...targetScale,
      duration: 280,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        gameInstance.tweens.add({
          targets: [beam, glow],
          alpha: 0,
          duration: 90,
          ease: 'Sine.easeOut',
        });
      },
    });
  };

  makeBeam(false);
  makeBeam(true);

  const pulse = gameInstance.add.circle(origin.x, origin.y, beamThickness * 1.15, theme.primary, 0.38);
  pulse.setDepth(906);
  beamObjects.push(pulse);
  gameInstance.tweens.add({
    targets: pulse,
    scale: 2.6,
    alpha: 0,
    duration: 260,
    ease: 'Cubic.easeOut',
  });

  affectedCells.forEach((cell) => {
    const distance = clearsColumn
      ? Math.abs(cell.row - triggerCell.row)
      : Math.abs(cell.col - triggerCell.col);
    createCellImpactFlash(cell, theme, Math.min(260, distance * 46));
  });

  gameInstance.time.delayedCall(360, () => {
    beamObjects.forEach((object) => {
      try { gameInstance.tweens.killTweensOf(object); } catch (e) {}
      try { object.destroy(); } catch (e) {}
    });
    if (!isGameOver && onComplete) onComplete();
  });
}

function drawWavyEnergyLink(graphics, start, end, color, alpha, waveOffset) {
  const segments = 10;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
  const normalX = -dy / distance;
  const normalY = dx / distance;

  graphics.lineStyle(3, color, alpha);
  graphics.beginPath();
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const wave = Math.sin(t * Math.PI * 3 + waveOffset) * 8;
    const x = start.x + dx * t + normalX * wave;
    const y = start.y + dy * t + normalY * wave;
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.strokePath();
}

function playMatch5LinkEffect(triggerCell, affectedCells, eggType, onComplete) {
  if (!gameInstance) {
    if (onComplete) onComplete();
    return;
  }
  if (audioManager) audioManager.playSfx('match5', { throttle: 240 });

  const theme = getEggDestroyTheme(eggType);
  const origin = getEggPosition(triggerCell.row, triggerCell.col);
  const graphics = gameInstance.add.graphics();
  graphics.setDepth(907);
  const tempObjects = [graphics];

  const pulse = gameInstance.add.circle(origin.x, origin.y, 24, theme.glow, 0.34);
  pulse.setDepth(908);
  tempObjects.push(pulse);
  gameInstance.tweens.add({
    targets: pulse,
    scale: 2.8,
    alpha: 0,
    duration: 360,
    ease: 'Cubic.easeOut',
  });

  let waveOffset = 0;
  const redrawLinks = () => {
    graphics.clear();
    affectedCells.forEach((cell) => {
      if (cell.row === triggerCell.row && cell.col === triggerCell.col) {
        return;
      }
      const target = getEggPosition(cell.row, cell.col);
      drawWavyEnergyLink(graphics, origin, target, theme.primary, 0.74, waveOffset);
      drawWavyEnergyLink(graphics, origin, target, theme.secondary, 0.28, waveOffset + 1.4);
    });
    waveOffset += 0.34;
  };

  redrawLinks();
  const redrawTimer = gameInstance.time.addEvent({
    delay: 45,
    repeat: 8,
    callback: redrawLinks,
  });

  affectedCells.forEach((cell, index) => {
    createCellImpactFlash(cell, theme, 250 + (index % 4) * 24);
  });

  gameInstance.tweens.add({
    targets: graphics,
    alpha: 0,
    duration: 190,
    delay: 400,
    ease: 'Sine.easeOut',
  });

  gameInstance.time.delayedCall(560, () => {
    try { redrawTimer.remove(false); } catch (e) {}
    tempObjects.forEach((object) => {
      try { gameInstance.tweens.killTweensOf(object); } catch (e) {}
      try { object.destroy(); } catch (e) {}
    });
    if (!isGameOver && onComplete) onComplete();
  });
}

function playAreaExplosionEffect(centerCell, affectedCells, onComplete) {
  if (!gameInstance) {
    if (onComplete) onComplete();
    return;
  }
  if (audioManager) audioManager.playSfx('areaExplosion', { throttle: 220 });

  const centerType = board[centerCell.row] && board[centerCell.row][centerCell.col];
  const theme = getEggDestroyTheme(centerType);
  const center = getEggPosition(centerCell.row, centerCell.col);
  const metrics = getBoardMetrics();
  const radius = Math.min(metrics.cellWidth, metrics.cellHeight) * 1.55;
  const tempObjects = [];

  const shockwave = gameInstance.add.circle(center.x, center.y, radius * 0.24, theme.glow, 0.14);
  shockwave.setStrokeStyle(5, theme.secondary, 0.78);
  shockwave.setDepth(906);
  tempObjects.push(shockwave);
  gameInstance.tweens.add({
    targets: shockwave,
    scale: 2.15,
    alpha: 0,
    duration: 430,
    ease: 'Cubic.easeOut',
  });

  const blast = gameInstance.add.circle(center.x, center.y, radius * 0.64, theme.primary, 0.2);
  blast.setDepth(905);
  tempObjects.push(blast);
  gameInstance.tweens.add({
    targets: blast,
    scale: 1.45,
    alpha: 0,
    duration: 320,
    ease: 'Sine.easeOut',
  });

  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16 + Phaser.Math.FloatBetween(-0.16, 0.16);
    const distance = radius * Phaser.Math.FloatBetween(0.72, 1.18);
    createDestroyParticle(center.x, center.y, theme, angle, distance, i);
  }

  affectedCells.forEach((cell, index) => {
    createCellImpactFlash(cell, theme, 90 + (index % 3) * 32);
  });

  if (gameInstance.cameras && gameInstance.cameras.main) {
    gameInstance.cameras.main.shake(120, 0.0035);
  }

  gameInstance.time.delayedCall(460, () => {
    tempObjects.forEach((object) => {
      try { gameInstance.tweens.killTweensOf(object); } catch (e) {}
      try { object.destroy(); } catch (e) {}
    });
    if (!isGameOver && onComplete) onComplete();
  });
}

function playChargedAreaExplosionEffect(centerCell, affectedCells, onComplete) {
  if (!gameInstance) {
    if (onComplete) onComplete();
    return;
  }

  const sprite = tileSprites[centerCell.row] && tileSprites[centerCell.row][centerCell.col];
  if (!sprite) {
    playAreaExplosionEffect(centerCell, affectedCells, onComplete);
    return;
  }

  const centerType = board[centerCell.row] && board[centerCell.row][centerCell.col];
  const theme = getEggDestroyTheme(centerType);
  const center = getEggPosition(centerCell.row, centerCell.col);
  const metrics = getBoardMetrics();
  const chargeRadius = Math.min(metrics.cellWidth, metrics.cellHeight) * 0.44;
  const originalScaleX = sprite.scaleX;
  const originalScaleY = sprite.scaleY;
  const targetScale = getEggScale(sprite, SELECTED_SCALE * 2);
  const tempObjects = [];

  try { gameInstance.tweens.killTweensOf(sprite); } catch (e) {}
  try { sprite.disableInteractive(); } catch (e) {}
  sprite.setDepth(945);
  sprite.setAlpha(1);
  sprite.setTint(theme.secondary);

  const chargeGlow = gameInstance.add.circle(center.x, center.y, chargeRadius, theme.glow, 0.2);
  chargeGlow.setStrokeStyle(4, theme.secondary, 0.56);
  chargeGlow.setDepth(940);
  tempObjects.push(chargeGlow);
  gameInstance.tweens.add({
    targets: chargeGlow,
    scale: 2.4,
    alpha: 0.04,
    duration: 320,
    ease: 'Sine.easeInOut',
  });

  const innerPulse = gameInstance.add.circle(center.x, center.y, chargeRadius * 0.52, theme.primary, 0.24);
  innerPulse.setDepth(941);
  tempObjects.push(innerPulse);
  gameInstance.tweens.add({
    targets: innerPulse,
    scale: 1.85,
    alpha: 0,
    duration: 150,
    yoyo: true,
    repeat: 1,
    ease: 'Sine.easeInOut',
  });

  gameInstance.tweens.add({
    targets: sprite,
    scaleX: targetScale.x,
    scaleY: targetScale.y,
    duration: 310,
    ease: 'Back.easeOut',
    onComplete: () => {
      tempObjects.forEach((object) => {
        try { gameInstance.tweens.killTweensOf(object); } catch (e) {}
        try { object.destroy(); } catch (e) {}
      });

      if (isGameOver) {
        return;
      }

      sprite.clearTint();
      sprite.setScale(originalScaleX, originalScaleY);
      sprite.setAlpha(0.08);
      if (gameInstance.cameras && gameInstance.cameras.main) {
        gameInstance.cameras.main.shake(90, 0.0045);
      }
      playAreaExplosionEffect(centerCell, affectedCells, () => {
        if (sprite && sprite.active) {
          sprite.setAlpha(1);
          sprite.setScale(originalScaleX, originalScaleY);
        }
        if (onComplete) onComplete();
      });
    },
  });
}

function playDelayedSpecialActivationEffect(delayedSpecial, triggerCell, destroyedCells, onComplete) {
  const affectedCells = getCellsFromRemovalSet(destroyedCells);
  if (!affectedCells.length) {
    if (onComplete) onComplete();
    return;
  }

  if (delayedSpecial.type === 'match4') {
    playMatch4BeamEffect(triggerCell, affectedCells, delayedSpecial.direction, onComplete);
    return;
  }

  if (delayedSpecial.type === 'match5') {
    playMatch5LinkEffect(triggerCell, affectedCells, delayedSpecial.eggType, onComplete);
    return;
  }

  if (delayedSpecial.type === 'lshape' || delayedSpecial.type === 'tshape') {
    playChargedAreaExplosionEffect(triggerCell, affectedCells, onComplete);
    return;
  }

  if (onComplete) onComplete();
}

// Create a floating score popup at pixel position x,y
function createScorePopup(x, y, text, fontSize = 20) {
  if (!gameInstance) return;
  const isLeafBoostedScore = leafDoubleScoreActiveForCurrentMove && scoreMultiplier > 1 && typeof text === 'string' && text.startsWith('+');
  let popupText = text;
  if (isLeafBoostedScore) {
    const basePopupScore = Number(text.replace('+', ''));
    popupText = Number.isFinite(basePopupScore) ? `+${basePopupScore * scoreMultiplier} 🌿` : `${text} 🌿`;
  }
  const style = {
    font: `${fontSize}px Arial`,
    fill: isLeafBoostedScore ? '#baff8a' : '#fff',
    stroke: isLeafBoostedScore ? '#173d16' : '#000',
    strokeThickness: isLeafBoostedScore ? 5 : 3,
  };
  const txt = gameInstance.add.text(x, y, popupText, style).setOrigin(0.5);
  txt.setDepth(1000);
  gameInstance.tweens.add({
    targets: txt,
    y: y - 40,
    alpha: 0,
    duration: 800,
    ease: 'Power1',
    onComplete: () => {
      try { txt.destroy(); } catch (e) {}
    },
  });
}

function getEggDestroyTheme(type) {
  return EGG_DESTROY_THEMES[type] || EGG_DESTROY_THEMES[0];
}

function createDestroyParticle(x, y, theme, angle, distance, index) {
  const particleSize = Phaser.Math.Between(4, 8);
  let particle;

  if (theme.shape === 'leaf') {
    particle = gameInstance.add.ellipse(x, y, particleSize * 1.5, particleSize * 0.75, theme.primary, 0.9);
    particle.setRotation(angle);
  } else if (theme.shape === 'stone') {
    particle = gameInstance.add.rectangle(x, y, particleSize, particleSize * 0.8, index % 2 ? theme.primary : theme.secondary, 0.9);
    particle.setRotation(angle * 0.7);
  } else if (theme.shape === 'shard') {
    particle = gameInstance.add.triangle(
      x,
      y,
      0,
      -particleSize,
      particleSize * 0.8,
      particleSize,
      -particleSize * 0.8,
      particleSize,
      index % 2 ? theme.primary : theme.secondary,
      0.9
    );
    particle.setRotation(angle);
  } else {
    particle = gameInstance.add.circle(x, y, particleSize * 0.5, index % 2 ? theme.primary : theme.secondary, 0.95);
  }

  particle.setDepth(940);
  gameInstance.tweens.add({
    targets: particle,
    x: x + Math.cos(angle) * distance,
    y: y + Math.sin(angle) * distance,
    alpha: 0,
    scale: 0.25,
    duration: Phaser.Math.Between(190, 250),
    ease: 'Cubic.easeOut',
    onComplete: () => {
      try { particle.destroy(); } catch (e) {}
    },
  });
}

function playEggDestroyEffect(entry, onComplete, runId = gameRunId) {
  if (!gameInstance || !entry.sprite) {
    if (onComplete) onComplete();
    return;
  }

  const sprite = entry.sprite;
  const type = entry.eggType !== null && entry.eggType !== undefined ? entry.eggType : sprite.getData('type');
  const theme = getEggDestroyTheme(type);
  const x = sprite.x;
  const y = sprite.y;
  const metrics = getBoardMetrics();
  const burstRadius = Math.min(metrics.cellWidth, metrics.cellHeight) * 0.34;
  const originalScaleX = sprite.scaleX;
  const originalScaleY = sprite.scaleY;
  const tempObjects = [];

  try { sprite.disableInteractive(); } catch (e) {}
  sprite.setDepth(930);

  const flash = gameInstance.add.circle(x, y, burstRadius * 0.62, theme.glow, 0.38);
  flash.setDepth(928);
  tempObjects.push(flash);
  gameInstance.tweens.add({
    targets: flash,
    scale: 1.55,
    alpha: 0,
    duration: 170,
    ease: 'Cubic.easeOut',
  });

  const crack = gameInstance.add.graphics();
  crack.setDepth(935);
  crack.lineStyle(2, 0xffffff, 0.9);
  crack.beginPath();
  crack.moveTo(x - burstRadius * 0.18, y - burstRadius * 0.34);
  crack.lineTo(x - burstRadius * 0.04, y - burstRadius * 0.08);
  crack.lineTo(x - burstRadius * 0.22, y + burstRadius * 0.18);
  crack.moveTo(x + burstRadius * 0.12, y - burstRadius * 0.28);
  crack.lineTo(x + burstRadius * 0.02, y + burstRadius * 0.02);
  crack.lineTo(x + burstRadius * 0.24, y + burstRadius * 0.3);
  crack.moveTo(x - burstRadius * 0.02, y + burstRadius * 0.02);
  crack.lineTo(x + burstRadius * 0.28, y - burstRadius * 0.08);
  crack.strokePath();
  tempObjects.push(crack);
  gameInstance.tweens.add({
    targets: crack,
    alpha: 0,
    duration: 140,
    ease: 'Sine.easeOut',
  });

  const particleCount = 7;
  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount + Phaser.Math.FloatBetween(-0.24, 0.24);
    const distance = burstRadius * Phaser.Math.FloatBetween(0.75, 1.28);
    createDestroyParticle(x, y, theme, angle, distance, i);
  }

  gameInstance.tweens.add({
    targets: sprite,
    scaleX: originalScaleX * 1.18,
    scaleY: originalScaleY * 1.18,
    duration: 75,
    ease: 'Back.easeOut',
    onComplete: () => {
      if (isGameOver || !isCurrentRun(runId)) {
        tempObjects.forEach((object) => {
          try { object.destroy(); } catch (e) {}
        });
        if (onComplete) onComplete();
        return;
      }

      sprite.setTint(theme.secondary);
      gameInstance.tweens.add({
        targets: sprite,
        scaleX: originalScaleX * 0.12,
        scaleY: originalScaleY * 0.12,
        alpha: 0,
        duration: EGG_DESTROY_DURATION - 75,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          if (!isCurrentRun(runId)) {
            tempObjects.forEach((object) => {
              try { object.destroy(); } catch (e) {}
            });
            return;
          }
          tempObjects.forEach((object) => {
            try { object.destroy(); } catch (e) {}
          });
          if (onComplete) onComplete();
        },
      });
    },
  });
}

// Briefly scale the combo DOM text for feedback
function pulseCombo() {
  try {
    if (!comboText) return;
    comboText.style.transition = 'transform 180ms ease';
    comboText.style.transform = 'scale(1.4)';
    setTimeout(() => {
      comboText.style.transform = 'scale(1)';
    }, 220);
  } catch (e) {}
}

function registerComboDestruction(source = 'match') {
  ensureComboChainActive();
  comboCount += 1;
  updateUi();
  pulseCombo();
  console.log('combo count', comboCount);
  console.log('Combo destruction source:', source);
}

function animateRemovals(removalSet, onComplete, options = {}) {
  const source = options.source || 'match';
  const runId = options.runId || gameRunId;
  console.log('Destroy source:', source);
  if (isGameOver || !isCurrentRun(runId)) {
    console.log('Resolve stopped because game over');
    return;
  }

  deselectEgg();
  if (audioManager && removalSet && removalSet.size > 0) {
    audioManager.playSfx(source === 'match' ? 'match' : 'areaExplosion', { throttle: source === 'match' ? 95 : 180 });
  }
  const toRemove = Array.from(removalSet).map((key) => {
    const [row, col] = key.split('-').map(Number);
    return {
      row,
      col,
      eggType: board[row] && board[row][col],
      sprite: tileSprites[row] && tileSprites[row][col] ? tileSprites[row][col] : null,
    };
  });

  if (toRemove.length === 0) {
    applyRemovals(removalSet);
    if (isGameOver) {
      console.log('Resolve stopped because game over');
      return;
    }
    applyGravity(() => {
      if (isGameOver || !isCurrentRun(runId)) {
        console.log('Resolve stopped because game over');
        return;
      }
      refillBoard(() => {
        if (isGameOver || !isCurrentRun(runId)) {
          console.log('Resolve stopped because game over');
          return;
        }
        console.log('gravity and refill complete');
        if (onComplete) onComplete();
      }, runId);
    }, runId);
    return;
  }

  registerComboDestruction(source);

  let done = 0;
  toRemove.forEach((entry) => {
    if (entry.sprite) {
      playEggDestroyEffect(entry, () => {
        if (isGameOver || !isCurrentRun(runId)) {
          console.log('Resolve stopped because game over');
          return;
        }

        try { entry.sprite.destroy(); } catch (e) {}
        tileSprites[entry.row][entry.col] = null;
        done += 1;
        if (done === toRemove.length) {
          applyRemovals(removalSet);
          if (isGameOver || !isCurrentRun(runId)) {
            console.log('Resolve stopped because game over');
            return;
          }
          applyGravity(() => {
            if (isGameOver || !isCurrentRun(runId)) {
              console.log('Resolve stopped because game over');
              return;
            }
            refillBoard(() => {
              if (isGameOver || !isCurrentRun(runId)) {
                console.log('Resolve stopped because game over');
                return;
              }
              console.log('gravity and refill complete');
              if (onComplete) onComplete();
            }, runId);
          }, runId);
        }
      }, runId);
    } else {
      if (isGameOver || !isCurrentRun(runId)) {
        console.log('Resolve stopped because game over');
        return;
      }

      done += 1;
      if (done === toRemove.length) {
        applyRemovals(removalSet);
        if (isGameOver || !isCurrentRun(runId)) {
          console.log('Resolve stopped because game over');
          return;
        }
        applyGravity(() => {
          if (isGameOver || !isCurrentRun(runId)) {
            console.log('Resolve stopped because game over');
            return;
          }
          refillBoard(() => {
            if (isGameOver || !isCurrentRun(runId)) {
              console.log('Resolve stopped because game over');
              return;
            }
            console.log('gravity and refill complete');
            if (onComplete) onComplete();
          }, runId);
        }, runId);
      }
    }
  });
}

function applyRemovals(removalSet) {
  removalSet.forEach((key) => {
    const [row, col] = key.split('-').map(Number);
    board[row][col] = null;
    console.log('board cell set to null', row, col);
  });
}

function applyGravity(onComplete, runId = gameRunId) {
  if (isGameOver || !isCurrentRun(runId)) {
    console.log('Resolve stopped because game over');
    return;
  }

  console.log('gravity start');
  const tweens = [];

  for (let col = 0; col < GRID_SIZE; col++) {
    const existingEggs = [];

    for (let row = GRID_SIZE - 1; row >= 0; row--) {
      if (board[row][col] !== null && board[row][col] !== undefined) {
        let sprite = tileSprites[row] && tileSprites[row][col];
        if (!sprite) {
          sprite = ensureSpriteAt(row, col);
        }
        if (sprite) {
          sprite.setScale(NORMAL_SCALE);
          setEggDisplaySize(sprite);
          sprite.setAlpha(1);
          sprite.clearTint();
        }
        existingEggs.push({ row, col, type: board[row][col], sprite });
      }
    }

    // Clear this column before placing compacted eggs.
    for (let row = 0; row < GRID_SIZE; row++) {
      board[row][col] = null;
      if (!tileSprites[row]) tileSprites[row] = [];
      tileSprites[row][col] = null;
    }

    let targetRow = GRID_SIZE - 1;
    existingEggs.forEach((egg) => {
      board[targetRow][col] = egg.type;
      const targetPosition = getEggPosition(targetRow, col);
      const targetX = targetPosition.x;
      const targetY = targetPosition.y;
      tileSprites[targetRow][col] = egg.sprite;
      egg.sprite.setData('row', targetRow);
      egg.sprite.setData('col', col);
      egg.sprite.setData('type', egg.type);
      attachEggInputHandlers(egg.sprite);

      if (egg.row !== targetRow || egg.col !== col) {
        console.log('moving existing egg down', egg.row, egg.col, '->', targetRow, col);
        tweens.push({
          targets: egg.sprite,
          x: targetX,
          y: targetY,
          duration: 220,
          ease: 'Power2',
        });
      } else {
        egg.sprite.setPosition(targetX, targetY);
      }

      targetRow -= 1;
    });

    console.log('column compacted', col);
  }

  if (tweens.length === 0) {
    if (!isGameOver && isCurrentRun(runId) && onComplete) onComplete();
    return;
  }

  let completed = 0;
  const total = tweens.length;
  tweens.forEach((t) => {
    const copy = Object.assign({}, t);
    const userOnComplete = copy.onComplete;
    copy.onComplete = () => {
      if (isGameOver || !isCurrentRun(runId)) {
        console.log('Resolve stopped because game over');
        return;
      }

      try { if (typeof userOnComplete === 'function') userOnComplete(); } catch (e) {}
      completed += 1;
      if (completed === total) {
        if (!isGameOver && isCurrentRun(runId) && onComplete) onComplete();
      }
    };
    gameInstance.tweens.add(copy);
  });
}

function collapseBoard() {
  for (let col = 0; col < GRID_SIZE; col++) {
    const empty = [];
    for (let row = GRID_SIZE - 1; row >= 0; row--) {
      if (board[row][col] === null) {
        empty.push(row);
      } else if (empty.length) {
        const targetRow = empty.shift();
        board[targetRow][col] = board[row][col];
        board[row][col] = null;
        empty.push(row);
      }
    }
  }
}

function refillBoard(onComplete, runId = gameRunId) {
  if (isGameOver || !isCurrentRun(runId)) {
    console.log('Resolve stopped because game over');
    return;
  }

  console.log('refill start');
  const tweens = [];

  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = 0; row < GRID_SIZE; row++) {
      if (board[row][col] === null || board[row][col] === undefined) {
        const type = Phaser.Math.Between(0, EGG_TYPES.length - 1);
        board[row][col] = type;
        const destinationPosition = getEggPosition(row, col);
        const destinationX = destinationPosition.x;
        const destinationY = destinationPosition.y;
        const startY = destinationY - getBoardMetrics().cellHeight * 1.5;
        let sprite = tileSprites[row] && tileSprites[row][col];
        if (sprite) {
          sprite.destroy();
        }
        sprite = createTileSprite(row, col, destinationX, startY, type);
        sprite.alpha = 0;
        tileSprites[row][col] = sprite;
        const targetScale = getEggScale(sprite);
        console.log('new egg spawned above board', row, col, type);
        tweens.push({
          targets: sprite,
          x: destinationX,
          y: destinationY,
          alpha: 1,
          scaleX: targetScale.x,
          scaleY: targetScale.y,
          duration: 220,
          ease: 'Power2',
        });
      }
    }
  }

  if (tweens.length === 0) {
    console.log('refill complete');
    resetBoardVisuals();
    if (!isGameOver && isCurrentRun(runId) && onComplete) onComplete();
    return;
  }

  let completed = 0;
  const total = tweens.length;
  tweens.forEach((t) => {
    const copy = Object.assign({}, t);
    const userOnComplete = copy.onComplete;
    copy.onComplete = () => {
      if (isGameOver || !isCurrentRun(runId)) {
        console.log('Resolve stopped because game over');
        return;
      }

      try { if (typeof userOnComplete === 'function') userOnComplete(); } catch (e) {}
      completed += 1;
      if (completed === total) {
        console.log('refill complete');
        resetBoardVisuals();
        if (!isGameOver && isCurrentRun(runId) && onComplete) onComplete();
      }
    };
    gameInstance.tweens.add(copy);
  });
}

function moveSprites(onComplete) {
  if (isGameOver) {
    console.log('Resolve stopped because game over');
    return;
  }

  const tweens = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      let sprite = tileSprites[row][col];
      const type = board[row][col];
      const destinationPosition = getEggPosition(row, col);
      const destinationX = destinationPosition.x;
      const destinationY = destinationPosition.y;

      if (!sprite || sprite.getData('type') === null) {
        if (sprite) {
          sprite.destroy();
        }
        sprite = createTileSprite(row, col, destinationX, destinationY - getBoardMetrics().cellHeight, type);
        sprite.alpha = 0;
        tileSprites[row][col] = sprite;
        console.log('new egg interactive added', row, col, type);
      } else {
        sprite.setData('row', row);
        sprite.setData('col', col);
        sprite.setData('type', type);
        sprite.setTexture(getEggTextureKey(type));
        setEggDisplaySize(sprite);
        // ensure sprite remains interactive and has correct handler
        attachEggInputHandlers(sprite);
        console.log('interactive attached', row, col);
      }

      const targetScale = getEggScale(sprite);
      tweens.push({
        targets: sprite,
        x: destinationX,
        y: destinationY,
        alpha: 1,
        scaleX: targetScale.x,
        scaleY: targetScale.y,
        duration: 220,
        ease: 'Power2',
      });
    }
  }

  // Add each tween and track completion because `tweens.timeline` may not exist
  let completed = 0;
  const total = tweens.length;
  if (total === 0) {
    if (isGameOver) {
      console.log('Resolve stopped because game over');
      return;
    }

    isAnimating = false;
    updateUi();
    console.log('input enabled');
    if (onComplete) onComplete();
    return;
  }

  tweens.forEach((t) => {
    const copy = Object.assign({}, t);
    const userOnComplete = copy.onComplete;
    copy.onComplete = () => {
      if (isGameOver) {
        console.log('Resolve stopped because game over');
        return;
      }

      try {
        if (typeof userOnComplete === 'function') userOnComplete();
      } catch (e) {
        // ignore
      }
      completed += 1;
      if (completed === total) {
        if (isGameOver) {
          console.log('Resolve stopped because game over');
          return;
        }

        isAnimating = false;
        updateUi();
        console.log('input enabled');
        if (onComplete) onComplete();
      }
    };
    gameInstance.tweens.add(copy);
  });
}

function updateUi() {
  scoreText.textContent = score;
  timerText.textContent = timer;
  comboText.textContent = comboCount >= 1 ? `Combo x${comboCount}` : 'None';
  updateDragonEnergyUi();
}

function updateDragonEnergyUi() {
  const meterElements = document.querySelectorAll('.energy-meter');
  dragonEnergy.forEach((value, index) => {
    const progressElement = dragonEnergyText[index];
    const fillElement = dragonEnergyFill[index];
    const readyBadge = dragonReadyBadge[index];
    const skillType = DRAGON_SKILL_TYPES[index];
    const clampedValue = Math.min(value, DRAGON_ENERGY_MAX);
    if (progressElement) {
      progressElement.textContent = `${clampedValue}/${DRAGON_ENERGY_MAX}`;
    }
    if (fillElement) {
      fillElement.style.width = `${(clampedValue / DRAGON_ENERGY_MAX) * 100}%`;
    }
    if (readyBadge) {
      readyBadge.hidden = !dragonSkillReady[skillType];
    }
    if (meterElements[index]) {
      meterElements[index].classList.toggle('dragon-skill-ready', dragonSkillReady[skillType]);
    }
  });
}

function pulseDragonEnergyReady(index) {
  const meter = document.querySelectorAll('.energy-meter')[index];
  if (!meter) {
    return;
  }

  meter.classList.remove('dragon-energy-ready');
  void meter.offsetWidth;
  meter.classList.add('dragon-energy-ready');
  setTimeout(() => {
    meter.classList.remove('dragon-energy-ready');
  }, 650);
}

function cancelActiveDragonCutIn() {
  dragonCutInToken += 1;
  if (audioManager) {
    audioManager.stopCutInSound();
  }
  if (activeDragonCutIn && activeDragonCutIn.cleanup) {
    activeDragonCutIn.cleanup();
  }
  activeDragonCutIn = null;
}

async function playDragonCutIn(dragonType, title) {
  if (!gameInstance || isGameOver) {
    return;
  }

  const cutInConfig = DRAGON_CUT_IN_CONFIGS[dragonType] || {
    dragonType,
    title,
    portraitKey: '',
    visualStyle: 'default',
    accentColor: 0xffffff,
    overlayColor: 0x050309,
    flashColor: 0xffffff,
    flashAlpha: 0.72,
    titleColor: '#ffffff',
  };
  const cutInTitle = title || cutInConfig.title;
  const token = ++dragonCutInToken;
  const wasAnimating = isAnimating;
  isAnimating = true;
  disableBoardInput();
  if (audioManager) {
    audioManager.playDragonRoar(dragonType, cutInConfig.roarKey);
  }

  return new Promise((resolve) => {
    const centerX = BOARD_RENDER_WIDTH / 2;
    const centerY = BOARD_RENDER_HEIGHT / 2;
    const objects = [];
    const timers = [];
    let finished = false;

    const overlay = gameInstance.add.rectangle(centerX, centerY, BOARD_RENDER_WIDTH, BOARD_RENDER_HEIGHT, cutInConfig.overlayColor, 0.82);
    overlay.setDepth(3000);
    objects.push(overlay);

    const slash = gameInstance.add.rectangle(centerX, centerY + 8, BOARD_RENDER_WIDTH * 1.25, 128, cutInConfig.accentColor, 0.32);
    slash.setAngle(-8);
    slash.setDepth(3001);
    objects.push(slash);

    if (cutInConfig.visualStyle === 'ice') {
      for (let i = 0; i < 7; i++) {
        const frostLine = gameInstance.add.rectangle(
          centerX - BOARD_RENDER_WIDTH * 0.42 + i * 84,
          centerY - 168 + (i % 3) * 74,
          14,
          4,
          0xcff7ff,
          0.68
        );
        frostLine.setAngle(-28 + i * 9);
        frostLine.setDepth(3002);
        frostLine.setScale(0.2, 1);
        objects.push(frostLine);
        gameInstance.tweens.add({
          targets: frostLine,
          scaleX: 11,
          alpha: 0,
          duration: 780,
          delay: i * 38,
          ease: 'Cubic.easeOut',
        });
      }

      for (let i = 0; i < 4; i++) {
        const frostRing = gameInstance.add.circle(
          centerX + (i - 1.5) * 120,
          centerY + (i % 2 === 0 ? 118 : -118),
          18,
          0xdff6ff,
          0.18
        );
        frostRing.setStrokeStyle(2, 0xdff6ff, 0.58);
        frostRing.setDepth(3002);
        objects.push(frostRing);
        gameInstance.tweens.add({
          targets: frostRing,
          scale: 4.2,
          alpha: 0,
          duration: 880,
          delay: 80 + i * 70,
          ease: 'Sine.easeOut',
        });
      }
    }

    if (cutInConfig.visualStyle === 'leaf') {
      for (let i = 0; i < 9; i++) {
        const startX = -80 - i * 28;
        const startY = 46 + (i % 4) * 72;
        const leaf = gameInstance.add.ellipse(startX, startY, 34, 16, 0x9cff7a, 0.72);
        leaf.setAngle(-34 + i * 11);
        leaf.setDepth(3002);
        objects.push(leaf);
        gameInstance.tweens.add({
          targets: leaf,
          x: BOARD_RENDER_WIDTH + 92,
          y: startY + 210 + (i % 3) * 18,
          angle: leaf.angle + 130,
          alpha: 0,
          duration: 860,
          delay: i * 42,
          ease: 'Sine.easeInOut',
        });
      }

      const glowPulse = gameInstance.add.circle(centerX, centerY, 90, 0x72ff66, 0.12);
      glowPulse.setDepth(3002);
      objects.push(glowPulse);
      gameInstance.tweens.add({
        targets: glowPulse,
        scale: 4.8,
        alpha: 0,
        duration: 900,
        ease: 'Sine.easeOut',
      });
    }

    if (cutInConfig.visualStyle === 'earth') {
      const impactPulse = gameInstance.add.circle(centerX, centerY + 28, 70, 0xd8aa55, 0.14);
      impactPulse.setDepth(3002);
      objects.push(impactPulse);
      gameInstance.tweens.add({
        targets: impactPulse,
        scale: 4.4,
        alpha: 0,
        duration: 760,
        ease: 'Cubic.easeOut',
      });

      for (let i = 0; i < 8; i++) {
        const rock = gameInstance.add.polygon(
          centerX - 230 + i * 66,
          -28 - (i % 2) * 36,
          [
            -14, -10,
            6, -16,
            18, 2,
            4, 17,
            -16, 9,
          ],
          0x8d6742,
          0.82
        );
        rock.setStrokeStyle(2, 0xd8aa55, 0.32);
        rock.setAngle(i * 19);
        rock.setDepth(3002);
        objects.push(rock);
        gameInstance.tweens.add({
          targets: rock,
          y: centerY + 184 + (i % 3) * 22,
          angle: rock.angle + 160,
          alpha: 0,
          duration: 760,
          delay: i * 38,
          ease: 'Quad.easeIn',
        });
      }

      for (let i = 0; i < 6; i++) {
        const crack = gameInstance.add.rectangle(
          centerX - 190 + i * 76,
          centerY + 122 + (i % 2) * 22,
          78,
          5,
          0xe0c068,
          0.58
        );
        crack.setAngle(i % 2 === 0 ? -16 : 14);
        crack.setDepth(3002);
        crack.setScale(0.1, 1);
        objects.push(crack);
        gameInstance.tweens.add({
          targets: crack,
          scaleX: 1,
          alpha: 0,
          duration: 520,
          delay: 120 + i * 45,
          ease: 'Cubic.easeOut',
        });
      }

      if (gameInstance.cameras && gameInstance.cameras.main) {
        gameInstance.cameras.main.shake(170, 0.006);
      }
    }

    if (cutInConfig.visualStyle === 'fire') {
      const heatGlow = gameInstance.add.rectangle(centerX, centerY, BOARD_RENDER_WIDTH, BOARD_RENDER_HEIGHT, 0xff3b00, 0.16);
      heatGlow.setDepth(3002);
      objects.push(heatGlow);
      gameInstance.tweens.add({
        targets: heatGlow,
        alpha: 0.34,
        duration: 240,
        yoyo: true,
        repeat: 1,
        ease: 'Sine.easeInOut',
      });

      for (let i = 0; i < 8; i++) {
        const flame = gameInstance.add.triangle(
          18 + i * 82,
          BOARD_RENDER_HEIGHT + 42,
          0,
          74,
          28,
          0,
          56,
          74,
          i % 2 === 0 ? 0xff4d00 : 0xffb31a,
          0.82
        );
        flame.setDepth(3003);
        flame.setScale(1, 0.8 + (i % 3) * 0.18);
        objects.push(flame);
        gameInstance.tweens.add({
          targets: flame,
          y: BOARD_RENDER_HEIGHT * 0.46 + (i % 2) * 22,
          scaleY: flame.scaleY * 2.25,
          alpha: 0,
          duration: 560,
          delay: 60 + i * 22,
          ease: 'Cubic.easeOut',
        });
      }

      for (let i = 0; i < 6; i++) {
        const heatLine = gameInstance.add.rectangle(
          centerX - 240 + i * 96,
          centerY - 180 + (i % 3) * 130,
          8,
          110,
          0xffa02a,
          0.2
        );
        heatLine.setDepth(3002);
        heatLine.setAngle(-8);
        objects.push(heatLine);
        gameInstance.tweens.add({
          targets: heatLine,
          x: heatLine.x + (i % 2 === 0 ? 18 : -18),
          alpha: 0,
          duration: 680,
          yoyo: true,
          ease: 'Sine.easeInOut',
        });
      }

      const shockwave = gameInstance.add.circle(centerX + 112, centerY - 8, 34, 0xff7a1a, 0.12);
      shockwave.setStrokeStyle(4, 0xffbf42, 0.62);
      shockwave.setDepth(3003);
      objects.push(shockwave);
      gameInstance.tweens.add({
        targets: shockwave,
        scale: 5.6,
        alpha: 0,
        duration: 520,
        delay: 260,
        ease: 'Cubic.easeOut',
      });
    }

    let portrait;
    if (cutInConfig.portraitKey && gameInstance.textures.exists(cutInConfig.portraitKey)) {
      portrait = gameInstance.add.image(centerX - 112, centerY + 8, cutInConfig.portraitKey);
      const maxPortraitHeight = BOARD_RENDER_HEIGHT * 0.74;
      const maxPortraitWidth = BOARD_RENDER_WIDTH * 0.48;
      const scale = Math.min(maxPortraitWidth / portrait.width, maxPortraitHeight / portrait.height);
      portrait.setScale(scale * 0.72);
    } else {
      portrait = gameInstance.add.circle(centerX - 112, centerY + 8, 92, cutInConfig.accentColor, 0.88);
      const fallbackText = gameInstance.add.text(centerX - 112, centerY + 8, dragonType.slice(0, 1).toUpperCase(), {
        font: '82px Arial',
        fill: '#ffffff',
        stroke: '#160806',
        strokeThickness: 8,
      }).setOrigin(0.5);
      fallbackText.setDepth(3003);
      objects.push(fallbackText);
    }
    portrait.setAlpha(0);
    portrait.setDepth(3002);
    objects.push(portrait);

    const titleFontSize = cutInTitle.length > 22 ? 28 : cutInTitle.length > 18 ? 32 : 46;
    const titleText = gameInstance.add.text(centerX + 88, centerY - 8, cutInTitle, {
      font: `${titleFontSize}px Arial, sans-serif`,
      fill: cutInConfig.titleColor,
      stroke: '#160806',
      strokeThickness: 8,
      align: 'center',
      wordWrap: { width: BOARD_RENDER_WIDTH * 0.5, useAdvancedWrap: true },
    }).setOrigin(0.5);
    titleText.setAlpha(0);
    titleText.setDepth(3004);
    objects.push(titleText);

    const flash = gameInstance.add.rectangle(centerX, centerY, BOARD_RENDER_WIDTH, BOARD_RENDER_HEIGHT, cutInConfig.flashColor, 0);
    flash.setDepth(3010);
    objects.push(flash);

    gameInstance.tweens.add({
      targets: overlay,
      alpha: 0.82,
      duration: DRAGON_CUT_IN_TIMING.overlayIn,
      ease: 'Cubic.easeOut',
    });
    gameInstance.tweens.add({
      targets: slash,
      x: centerX + 28,
      alpha: 0.48,
      duration: DRAGON_CUT_IN_TIMING.accentSweep,
      yoyo: true,
      ease: 'Cubic.easeOut',
    });
    const isFireCutIn = cutInConfig.visualStyle === 'fire';
    gameInstance.tweens.add({
      targets: portrait,
      alpha: 1,
      scaleX: portrait.scaleX * (isFireCutIn ? 1.48 : 1.28),
      scaleY: portrait.scaleY * (isFireCutIn ? 1.48 : 1.28),
      x: isFireCutIn ? centerX - 62 : centerX - 78,
      y: isFireCutIn ? centerY - 2 : portrait.y,
      duration: isFireCutIn ? DRAGON_CUT_IN_TIMING.firePortraitIn : DRAGON_CUT_IN_TIMING.portraitIn,
      ease: 'Back.easeOut',
    });
    gameInstance.tweens.add({
      targets: titleText,
      alpha: 1,
      x: isFireCutIn ? centerX + 126 : centerX + 118,
      scaleX: isFireCutIn ? 1.22 : 1,
      scaleY: isFireCutIn ? 1.22 : 1,
      duration: isFireCutIn ? DRAGON_CUT_IN_TIMING.fireTitleIn : DRAGON_CUT_IN_TIMING.titleIn,
      delay: isFireCutIn ? DRAGON_CUT_IN_TIMING.fireTitleDelay : DRAGON_CUT_IN_TIMING.titleDelay,
      yoyo: isFireCutIn,
      ease: isFireCutIn ? 'Back.easeOut' : 'Cubic.easeOut',
    });

    timers.push(gameInstance.time.delayedCall(DRAGON_CUT_IN_TIMING.flashAt, () => {
      if (isGameOver || token !== dragonCutInToken) {
        return;
      }
      gameInstance.tweens.add({
        targets: flash,
        alpha: cutInConfig.flashAlpha,
        duration: DRAGON_CUT_IN_TIMING.flashDuration,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    }));

    timers.push(gameInstance.time.delayedCall(DRAGON_CUT_IN_TIMING.exitAt, () => {
      if (isGameOver || token !== dragonCutInToken) {
        return;
      }
      objects.forEach((object) => {
        gameInstance.tweens.add({
          targets: object,
          alpha: 0,
          duration: DRAGON_CUT_IN_TIMING.exitDuration,
          ease: 'Cubic.easeIn',
        });
      });
    }));

    const cleanup = () => {
      if (finished) {
        return;
      }
      finished = true;
      timers.forEach((timerEvent) => {
        try { timerEvent.remove(false); } catch (e) {}
      });
      objects.forEach((object) => {
        try { gameInstance.tweens.killTweensOf(object); } catch (e) {}
        try { object.destroy(); } catch (e) {}
      });
      if (activeDragonCutIn && activeDragonCutIn.token === token) {
        activeDragonCutIn = null;
      }
      isAnimating = wasAnimating;
      if (!wasAnimating && !isGameOver) {
        enableBoardInput();
      }
      resolve();
    };

    activeDragonCutIn = { token, cleanup };
    timers.push(gameInstance.time.delayedCall(DRAGON_CUT_IN_TIMING.total, cleanup));
  });
}

function getRandomBoardCell() {
  const validCells = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] !== null && board[row][col] !== undefined) {
        validCells.push({ row, col });
      }
    }
  }
  if (!validCells.length) {
    return null;
  }
  return validCells[Math.floor(Math.random() * validCells.length)];
}

function getFireStormExplosionCells(topLeft) {
  const cells = [];
  for (let row = topLeft.row; row <= topLeft.row + 1; row++) {
    for (let col = topLeft.col; col <= topLeft.col + 1; col++) {
      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        cells.push({ row, col });
      }
    }
  }
  return cells;
}

function getRandomFireStormExplosions(count = 3) {
  const explosions = [];
  for (let i = 0; i < count; i++) {
    explosions.push({
      row: Phaser.Math.Between(0, ROWS - 2),
      col: Phaser.Math.Between(0, COLS - 2),
    });
  }
  return explosions;
}

function applyPendingFireStorm(destroyedCells) {
  if (!pendingFireStorm) {
    return 0;
  }

  console.log('Fire Dragon: 3 random 2x2 explosions');
  let newStormDestroyed = 0;
  pendingFireStorm.explosions.forEach((topLeft) => {
    const stormCells = getFireStormExplosionCells(topLeft);
    console.log('Fire explosion cells:', stormCells.map((tile) => `${tile.row}-${tile.col}`).join(', '));
    stormCells.forEach((tile) => {
      const key = `${tile.row}-${tile.col}`;
      if (!destroyedCells.has(key) && board[tile.row][tile.col] !== null && board[tile.row][tile.col] !== undefined) {
        destroyedCells.add(key);
        newStormDestroyed += 1;
      }
    });
  });

  console.log('Fire Storm destroyed eggs', newStormDestroyed);
  pendingFireStorm = null;
  return newStormDestroyed * MATCH_SCORE;
}

function triggerFireStorm() {
  // Deprecated: use activateFireDragonSkill() instead
}

function showFireStormEffect(topLeft) {
  if (!gameInstance) return;
  if (audioManager) {
    audioManager.playSkillSfx(DRAGON_SKILL_SFX_ASSETS.fireMeteorImpact.key, 'meteor', { throttle: 110 });
  }
  const first = getEggPosition(topLeft.row, topLeft.col);
  const second = getEggPosition(topLeft.row + 1, topLeft.col + 1);
  const x = (first.x + second.x) / 2;
  const y = (first.y + second.y) / 2;

  const metrics = getBoardMetrics();
  const radius = Math.min(metrics.cellWidth, metrics.cellHeight) * 0.72;
  const explosion = gameInstance.add.circle(x, y, radius * 0.42, 0xff6600, 0.78);
  explosion.setDepth(1120);
  explosion.setStrokeStyle(5, 0xfff0a0, 0.74);
  gameInstance.tweens.add({
    targets: explosion,
    scale: 2.2,
    alpha: 0,
    duration: 330,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      try { explosion.destroy(); } catch (e) {}
    },
  });

  const flash = gameInstance.add.rectangle(x, y, metrics.cellWidth * 2.1, metrics.cellHeight * 2.1, 0xfff0a0, 0.36);
  flash.setDepth(1118);
  gameInstance.tweens.add({
    targets: flash,
    alpha: 0,
    scale: 1.28,
    duration: 170,
    ease: 'Quad.easeOut',
    onComplete: () => {
      try { flash.destroy(); } catch (e) {}
    },
  });

  for (let i = 0; i < 14; i++) {
    const angle = (Math.PI * 2 * i) / 14 + Phaser.Math.FloatBetween(-0.18, 0.18);
    const distance = radius * Phaser.Math.FloatBetween(0.78, 1.32);
    createDestroyParticle(x, y, getEggDestroyTheme(0), angle, distance, i);
  }

  if (gameInstance.cameras && gameInstance.cameras.main) {
    gameInstance.cameras.main.shake(90, 0.0045);
  }
}

function getFireStormImpactCenter(topLeft) {
  const first = getEggPosition(topLeft.row, topLeft.col);
  const second = getEggPosition(topLeft.row + 1, topLeft.col + 1);
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

function createFireMeteorShape(x, y) {
  const meteor = gameInstance.add.container(x, y);
  meteor.setDepth(1115);

  const trail = gameInstance.add.triangle(-26, -38, 0, 0, 34, -112, 58, -18, 0xff4a00, 0.52);
  trail.setAngle(-22);
  const outer = gameInstance.add.circle(0, 0, 20, 0xff3b00, 0.95);
  outer.setStrokeStyle(4, 0xffb31a, 0.88);
  const core = gameInstance.add.circle(-3, -4, 10, 0xfff0a0, 0.88);
  meteor.add([trail, outer, core]);
  meteor.setRotation(0.72);
  return meteor;
}

function playFireMeteorImpactEffect(topLeft, delay = 0, expectedToken = dragonCutInToken, runId = gameRunId) {
  if (!gameInstance) return;

  const metrics = getBoardMetrics();
  const impact = getFireStormImpactCenter(topLeft);
  const markerSize = Math.min(metrics.cellWidth, metrics.cellHeight) * 1.72;
  const marker = gameInstance.add.circle(impact.x, impact.y, markerSize * 0.46, 0xff3b00, 0.14);
  marker.setStrokeStyle(4, 0xffbf42, 0.88);
  marker.setDepth(1100);
  marker.setScale(0.72);
  gameInstance.tweens.add({
    targets: marker,
    scale: 1.12,
    alpha: 0.78,
    duration: 150,
    yoyo: true,
    repeat: 1,
    delay,
    ease: 'Sine.easeInOut',
  });

  const reticle = gameInstance.add.rectangle(impact.x, impact.y, markerSize, markerSize, 0xff2a00, 0.1);
  reticle.setStrokeStyle(3, 0xfff0a0, 0.76);
  reticle.setDepth(1101);
  reticle.setScale(0.88);
  gameInstance.tweens.add({
    targets: reticle,
    angle: 28,
    scale: 1.06,
    alpha: 0.42,
    duration: 300,
    delay,
    ease: 'Sine.easeInOut',
  });

  const startX = impact.x - metrics.cellWidth * 1.75;
  const startY = -metrics.cellHeight * 1.25;
  const meteor = createFireMeteorShape(startX, startY);
  meteor.setAlpha(0);

  gameInstance.time.delayedCall(delay + 285, () => {
    if (isGameOver || !isCurrentRun(runId) || expectedToken !== dragonCutInToken) {
      try { gameInstance.tweens.killTweensOf(marker); } catch (e) {}
      try { gameInstance.tweens.killTweensOf(reticle); } catch (e) {}
      try { marker.destroy(); } catch (e) {}
      try { reticle.destroy(); } catch (e) {}
      try { meteor.destroy(); } catch (e) {}
      return;
    }

    if (audioManager) {
      audioManager.playSkillSfx(DRAGON_SKILL_SFX_ASSETS.fireMeteorFall.key, 'fireSkill', { throttle: 110 });
    }
    meteor.setAlpha(1);
    gameInstance.tweens.add({
      targets: meteor,
      x: impact.x,
      y: impact.y,
      scale: 1.22,
      duration: 390,
      ease: 'Quad.easeIn',
      onComplete: () => {
        try { marker.destroy(); } catch (e) {}
        try { reticle.destroy(); } catch (e) {}
        try { meteor.destroy(); } catch (e) {}
        if (isGameOver || !isCurrentRun(runId) || expectedToken !== dragonCutInToken) {
          return;
        }
        showFireStormEffect(topLeft);
      },
    });

    gameInstance.tweens.add({
      targets: meteor,
      angle: 28,
      duration: 390,
      ease: 'Sine.easeInOut',
    });
  });
}

function playFireMeteorSequence(onComplete, expectedToken = dragonCutInToken, runId = gameRunId) {
  if (!gameInstance || !pendingFireStorm || !pendingFireStorm.explosions) {
    if (onComplete) onComplete();
    return;
  }

  const explosions = pendingFireStorm.explosions.slice();
  explosions.forEach((topLeft, index) => {
    playFireMeteorImpactEffect(topLeft, index * 150, expectedToken, runId);
  });

  gameInstance.time.delayedCall(980, () => {
    if (!isCurrentRun(runId) || expectedToken !== dragonCutInToken) {
      return;
    }
    if (onComplete) onComplete();
  });
}

function grantDragonEnergyForDestroyedCells(destroyedCells, source = 'match') {
  const shouldGrantEnergy = source === 'match';
  console.log('Destroy source:', source);
  console.log('Energy granted:', shouldGrantEnergy);
  if (!shouldGrantEnergy) {
    return;
  }

  destroyedCells.forEach((key) => {
    const [row, col] = key.split('-').map(Number);
    const type = board[row] && board[row][col];
    if (type !== null && type !== undefined) {
      gainDragonEnergy(type);
    }
  });
}

function gainDragonEnergy(type) {
  if (isGameOver) {
    return;
  }

  if (type < 0 || type >= dragonEnergy.length) {
    return;
  }

  const skillType = DRAGON_SKILL_TYPES[type];
  if (dragonEnergyLocked[skillType] || dragonSkillReady[skillType]) {
    console.log('Energy ignored because locked');
    console.log('Energy gain locked for:', skillType);
    return;
  }

  dragonEnergy[type] = Math.min(dragonEnergy[type] + 1, DRAGON_ENERGY_MAX);
  console.log(`${DRAGON_TYPES[type]} energy +1`);
  console.log('Fire energy:', dragonEnergy[0]);

  if (dragonEnergy[type] >= DRAGON_ENERGY_MAX) {
    console.log(`${DRAGON_TYPES[type]} Dragon skill ready`);
    console.log('Dragon reached 30: READY');
    pulseDragonEnergyReady(type);
    queueDragonSkill(skillType);
    lockDragonEnergy(skillType);
    dragonSkillReady[skillType] = true;
    updateDragonEnergyUi();
  }
}

function isDragonSkillQueued(type) {
  return pendingDragonSkills.includes(type);
}

function lockDragonEnergy(type) {
  if (!type || dragonEnergyLocked[type]) {
    return;
  }

  dragonEnergyLocked[type] = true;
  console.log('Dragon energy locked:', type);
}

function unlockAllDragonEnergy() {
  const hadLockedEnergy = Object.keys(dragonEnergyLocked).some((type) => dragonEnergyLocked[type]);
  dragonEnergyLocked = {
    fire: false,
    ice: false,
    leaf: false,
    earth: false,
  };
  if (hadLockedEnergy) {
    console.log('Dragon energy unlocked after combo chain');
  }
}

function resetDragonEnergyAfterActivation(type) {
  const index = DRAGON_SKILL_TYPES.indexOf(type);
  if (index === -1) {
    return;
  }

  dragonEnergy[index] = 0;
  dragonSkillReady[type] = false;
  console.log('Energy reset after activation');
  updateDragonEnergyUi();
}

function queueDragonSkill(type) {
  if (!type) {
    return false;
  }

  if (isDragonSkillQueued(type)) {
    console.log('Duplicate dragon skill skipped:', type);
    console.log('Skill already queued, skipping duplicate:', type);
    return false;
  }

  pendingDragonSkills.push(type);
  console.log('Dragon skill queued:', type);
  console.log('Skill queued', type);
  updateDragonEnergyUi();
  return true;
}

function sortPendingDragonSkillsByPriority() {
  console.log('Pending dragon skills before sort', pendingDragonSkills.slice());
  pendingDragonSkills.sort((a, b) => {
    const priorityA = DRAGON_SKILL_PRIORITY[a] || Number.MAX_SAFE_INTEGER;
    const priorityB = DRAGON_SKILL_PRIORITY[b] || Number.MAX_SAFE_INTEGER;
    return priorityA - priorityB;
  });
  console.log('Pending dragon skills after priority sort', pendingDragonSkills.slice());
}

function isTimerExpired() {
  return timer <= 0 || isGameOverPending;
}

function shouldSkipSkillAfterTimeUp(skillType) {
  return isTimerExpired() && (skillType === 'leaf' || skillType === 'ice');
}

function skipDragonSkillAfterTimeUp(skillType) {
  const index = DRAGON_SKILL_TYPES.indexOf(skillType);
  if (index !== -1) {
    dragonEnergy[index] = 0;
  }
  dragonSkillReady[skillType] = false;
  console.log('Dragon skill skipped after time up:', skillType);
  updateDragonEnergyUi();
}

function finishDragonSkillQueueIfIdle() {
  if (pendingDragonSkills.length || pendingFireStorm || pendingEarthPetrify || earthPetrifyTimeout || isGameOver) {
    return;
  }

  finishLeafScoreForSuccessfulMove();
  unlockAllDragonEnergy();
  endComboChain();
  comboCount = 0;
  updateUi();
  isAnimating = false;
  if (completePendingGameOverIfReady()) {
    return;
  }
  enableBoardInput();
}

function activatePendingDragonSkills(isFinalResolution = false) {
  const runId = gameRunId;
  if (isGameOver || !isCurrentRun(runId)) {
    return false;
  }

  if (isResolving && !isFinalResolution) {
    return false;
  }

  if (!pendingDragonSkills.length) {
    console.log('No pending dragon skills');
    return false;
  }

  console.log('Activating pending dragon skills');
  sortPendingDragonSkillsByPriority();
  while (pendingDragonSkills.length && !isGameOver && isCurrentRun(runId)) {
    const skillType = pendingDragonSkills.shift();

    if (shouldSkipSkillAfterTimeUp(skillType)) {
      skipDragonSkillAfterTimeUp(skillType);
      continue;
    }

    console.log('Pending skill activated:', skillType);
    console.log('Activating dragon skill by priority:', skillType);

    if (skillType === 'fire') {
      const cutInToken = dragonCutInToken + 1;
      playDragonCutIn('fire', DRAGON_CUT_IN_CONFIGS.fire.title).then(() => {
        if (isGameOver || !isCurrentRun(runId) || cutInToken !== dragonCutInToken) {
          return;
        }

        console.log('Skill activated', skillType);
        resetDragonEnergyAfterActivation(skillType);
        activateFireDragonSkill();
        if (pendingFireStorm) {
          playFireMeteorSequence(() => {
            if (!isGameOver && isCurrentRun(runId)) {
              resolveBoard(true);
            }
          }, cutInToken, runId);
        }
      });
      return true;
    }

    if (skillType === 'ice') {
      const cutInToken = dragonCutInToken + 1;
      playDragonCutIn('ice', DRAGON_CUT_IN_CONFIGS.ice.title).then(() => {
        if (isGameOver || !isCurrentRun(runId) || cutInToken !== dragonCutInToken) {
          return;
        }

        console.log('Skill activated', skillType);
        resetDragonEnergyAfterActivation(skillType);
        activateIceDragonSkill();
        if (pendingDragonSkills.length && activatePendingDragonSkills(true)) {
          return;
        }
        finishDragonSkillQueueIfIdle();
      });
      return true;
    }

    if (skillType === 'leaf') {
      const cutInToken = dragonCutInToken + 1;
      playDragonCutIn('leaf', DRAGON_CUT_IN_CONFIGS.leaf.title).then(() => {
        if (isGameOver || !isCurrentRun(runId) || cutInToken !== dragonCutInToken) {
          return;
        }

        console.log('Skill activated', skillType);
        resetDragonEnergyAfterActivation(skillType);
        playLeafBuffSweep(() => {
          if (isGameOver || !isCurrentRun(runId) || cutInToken !== dragonCutInToken) {
            return;
          }

          activateLeafDragonSkill();
          if (pendingDragonSkills.length && activatePendingDragonSkills(true)) {
            return;
          }
          finishDragonSkillQueueIfIdle();
        });
      });
      return true;
    }

    if (skillType === 'earth') {
      const cutInToken = dragonCutInToken + 1;
      playDragonCutIn('earth', DRAGON_CUT_IN_CONFIGS.earth.title).then(() => {
        if (isGameOver || !isCurrentRun(runId) || cutInToken !== dragonCutInToken) {
          return;
        }

        console.log('Skill activated', skillType);
        resetDragonEnergyAfterActivation(skillType);
        activateEarthDragonSkill();
      });
      return true;
    }
  }

  return false;
}

function activateFireDragonSkill() {
  if (isGameOver) {
    return;
  }

  console.log('Fire Dragon skill activated');
  const explosions = getRandomFireStormExplosions(3);
  console.log('Fire Dragon: 3 random 2x2 explosions');
  explosions.forEach((topLeft) => {
    console.log('Fire explosion cells:', getFireStormExplosionCells(topLeft).map((tile) => `${tile.row}-${tile.col}`).join(', '));
  });
  pendingFireStorm = { explosions };
}

function activateEarthDragonSkill() {
  if (isGameOver) {
    return;
  }

  console.log('Earth Dragon activated');
  pendingEarthPetrify = true;
  if (!isResolving) {
    runPendingEarthPetrify();
  }
}

function runPendingEarthPetrify() {
  const runId = gameRunId;
  if (isGameOver || !isCurrentRun(runId)) {
    console.log('Resolve stopped because game over');
    return;
  }

  const petrifyToken = ++earthPetrifyToken;
  pendingEarthPetrify = false;
  isAnimating = true;
  deselectEgg();

  const convertedEggs = selectRandomEggsForEarthConversion(10);
  console.log('Earth Dragon: converted eggs');
  convertedEggs.forEach((egg) => {
    console.log('row, col', egg.row, egg.col);
  });

  if (audioManager) {
    audioManager.playSkillSfx(DRAGON_SKILL_SFX_ASSETS.earthPetrify.key, 'earthSkill');
  }

  showPetrifyEffect(convertedEggs, petrifyToken, () => {
    if (isGameOver || !isCurrentRun(runId) || petrifyToken !== earthPetrifyToken) {
      console.log('Resolve stopped because game over');
      return;
    }

    earthPetrifyTimeout = setTimeout(() => {
      earthPetrifyTimeout = null;
      if (isGameOver || !isCurrentRun(runId) || petrifyToken !== earthPetrifyToken) {
        console.log('Resolve stopped because game over');
        return;
      }

      if (gameInstance && gameInstance.cameras && gameInstance.cameras.main) {
        gameInstance.cameras.main.shake(120, 0.004);
      }
      clearAllEarthEggsFromPetrify(runId);
    }, EARTH_CONVERSION_HOLD);
  });
}

function clearAllEarthEggsFromPetrify(runId = gameRunId) {
  if (isGameOver || !isCurrentRun(runId)) {
    console.log('Resolve stopped because game over');
    return;
  }

  console.log('Earth Dragon: clearing all Earth eggs');
  if (audioManager) {
    audioManager.playSkillSfx(DRAGON_SKILL_SFX_ASSETS.earthShatter.key, 'areaExplosion', { throttle: 220 });
  }
  const destroyedCells = new Set();
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === EARTH_TYPE) {
        destroyedCells.add(`${row}-${col}`);
      }
    }
  }

  grantDragonEnergyForDestroyedCells(destroyedCells, 'dragonSkill');
  addScore(destroyedCells.size * MATCH_SCORE, runId);

  const boardCenter = getPlayableBoardCenter();
  if (destroyedCells.size > 0) {
    createScorePopup(boardCenter.x, boardCenter.y, `+${destroyedCells.size * MATCH_SCORE}`, 32);
  }

  animateRemovals(destroyedCells, () => {
    if (isGameOver || !isCurrentRun(runId)) {
      console.log('Resolve stopped because game over');
      return;
    }
    resolveBoard(true);
  }, { source: 'dragonSkill', runId });
}

function selectRandomEggsForEarthConversion(limit) {
  const candidates = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] !== null && board[row][col] !== undefined && board[row][col] !== EARTH_TYPE) {
        candidates.push({ row, col });
      }
    }
  }

  Phaser.Utils.Array.Shuffle(candidates);
  return candidates.slice(0, limit);
}

function showPetrifyEffect(convertedEggs, expectedToken, onComplete) {
  if (!gameInstance) {
    if (onComplete) onComplete();
    return;
  }

  const metrics = getBoardMetrics();
  const boardCenter = getPlayableBoardCenter();
  const centerX = boardCenter.x;
  const centerY = boardCenter.y;
  const flash = gameInstance.add.rectangle(
    centerX,
    centerY,
    metrics.playableWidth,
    metrics.playableHeight,
    0x8a5a2b,
    0.26
  );
  flash.setDepth(850);
  gameInstance.tweens.add({
    targets: flash,
    alpha: 0,
    duration: 420,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      try { flash.destroy(); } catch (e) {}
    },
  });

  if (!convertedEggs.length) {
    if (onComplete) onComplete();
    return;
  }

  let completed = 0;
  let conversionComplete = false;
  const totalDuration = (convertedEggs.length - 1) * EARTH_CONVERSION_STAGGER + 280;
  const finishConversion = () => {
    if (conversionComplete) {
      return;
    }

    conversionComplete = true;
    if (onComplete) {
      onComplete();
    }
  };
  const finishOne = () => {
    completed += 1;
    if (completed === convertedEggs.length) {
      finishConversion();
    }
  };

  convertedEggs.forEach((egg, index) => {
    const delay = index * EARTH_CONVERSION_STAGGER;
    gameInstance.time.delayedCall(delay, () => {
      if (isGameOver || expectedToken !== earthPetrifyToken) {
        return;
      }

      const sprite = tileSprites[egg.row] && tileSprites[egg.row][egg.col];
      if (!sprite || board[egg.row][egg.col] === null || board[egg.row][egg.col] === undefined) {
        finishOne();
        return;
      }

      const position = getEggPosition(egg.row, egg.col);
      const theme = getEggDestroyTheme(EARTH_TYPE);
      const dustRadius = Math.min(metrics.cellWidth, metrics.cellHeight) * 0.28;
      const glow = gameInstance.add.circle(position.x, position.y, dustRadius, theme.glow, 0.26);
      glow.setDepth(918);
      gameInstance.tweens.add({
        targets: glow,
        scale: 2.1,
        alpha: 0,
        duration: 260,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          try { glow.destroy(); } catch (e) {}
        },
      });

      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 + Phaser.Math.FloatBetween(-0.25, 0.25);
        const distance = dustRadius * Phaser.Math.FloatBetween(0.85, 1.4);
        createDestroyParticle(position.x, position.y, theme, angle, distance, i);
      }

      try { gameInstance.tweens.killTweensOf(sprite); } catch (e) {}
      sprite.setDepth(925);
      sprite.setTint(0xc49a5c);
      const petrifyScale = getEggScale(sprite, 1.28);
      gameInstance.tweens.add({
        targets: sprite,
        scaleX: petrifyScale.x,
        scaleY: petrifyScale.y,
        duration: 135,
        ease: 'Back.easeOut',
        onComplete: () => {
          if (isGameOver || expectedToken !== earthPetrifyToken) {
            finishOne();
            return;
          }

          board[egg.row][egg.col] = EARTH_TYPE;
          sprite.setData('type', EARTH_TYPE);
          sprite.setTexture(getEggTextureKey(EARTH_TYPE));
          setEggDisplaySize(sprite);
          sprite.setTint(0xe0c068);
          gameInstance.tweens.add({
            targets: sprite,
            scaleX: getEggScale(sprite, 1.12).x,
            scaleY: getEggScale(sprite, 1.12).y,
            duration: 95,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onComplete: () => {
              setEggDisplaySize(sprite);
              sprite.clearTint();
              finishOne();
            },
          });
        },
      });
    });
  });

  gameInstance.time.delayedCall(totalDuration + 80, () => {
    if (completed < convertedEggs.length && !isGameOver && expectedToken === earthPetrifyToken) {
      finishConversion();
    }
  });
}

function getScoreStatElement() {
  return scoreText ? scoreText.closest('.stat') : null;
}

function getOrCreateLeafBuffIndicator() {
  const scoreStat = getScoreStatElement();
  if (!scoreStat) {
    return null;
  }

  if (leafBuffIndicatorElement && leafBuffIndicatorElement.parentElement === scoreStat) {
    return leafBuffIndicatorElement;
  }

  if (leafBuffIndicatorElement) {
    try { leafBuffIndicatorElement.remove(); } catch (e) {}
  }

  leafBuffIndicatorElement = document.createElement('div');
  leafBuffIndicatorElement.className = 'leaf-buff-indicator';
  scoreStat.appendChild(leafBuffIndicatorElement);
  return leafBuffIndicatorElement;
}

function playLeafScorePulse() {
  const scoreStat = getScoreStatElement();
  if (!scoreStat) return;

  scoreStat.classList.remove('leaf-score-pulse');
  void scoreStat.offsetWidth;
  scoreStat.classList.add('leaf-score-pulse');
  setTimeout(() => {
    scoreStat.classList.remove('leaf-score-pulse');
  }, 460);
}

function clearLeafBuffIndicator(withFade = false) {
  const indicator = leafBuffIndicatorElement;
  leafBuffIndicatorElement = null;
  if (!indicator) {
    return;
  }

  if (withFade) {
    indicator.classList.add('leaf-buff-ending');
    setTimeout(() => {
      try { indicator.remove(); } catch (e) {}
    }, 440);
    return;
  }

  try { indicator.remove(); } catch (e) {}
}

function updateLeafScoreBuffUi(preserveEndingIndicator = false) {
  const scoreStat = getScoreStatElement();
  if (!scoreStat) {
    clearLeafBuffIndicator();
    return;
  }

  scoreStat.classList.toggle('score-leaf-boost-active', leafDoubleScoreMovesRemaining > 0);
  if (leafDoubleScoreMovesRemaining > 0) {
    const indicator = getOrCreateLeafBuffIndicator();
    if (indicator) {
      indicator.textContent = `🌿 x${leafDoubleScoreMovesRemaining}`;
    }
    return;
  }

  if (!preserveEndingIndicator) {
    clearLeafBuffIndicator();
  }
}

function playLeafFallAnimation(count = 6) {
  const scoreStat = getScoreStatElement();
  if (!scoreStat) return;

  const rect = scoreStat.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const leaf = document.createElement('span');
    leaf.className = 'leaf-fall';
    leaf.textContent = '🌿';
    leaf.style.left = `${rect.left + rect.width * Phaser.Math.FloatBetween(0.12, 0.88)}px`;
    leaf.style.top = `${rect.top + Phaser.Math.FloatBetween(4, 22)}px`;
    leaf.style.animationDelay = `${i * 45}ms`;
    document.body.appendChild(leaf);
    setTimeout(() => {
      try { leaf.remove(); } catch (e) {}
    }, 1200);
  }
}

function playLeafBuffExpiredEffect() {
  playLeafFallAnimation(4);
  clearLeafBuffIndicator(true);
}

function playLeafBuffSweep(onComplete) {
  if (!gameInstance) {
    if (onComplete) onComplete();
    return;
  }

  const leaves = [];
  const glow = gameInstance.add.rectangle(
    BOARD_RENDER_WIDTH / 2,
    BOARD_RENDER_HEIGHT / 2,
    BOARD_RENDER_WIDTH,
    BOARD_RENDER_HEIGHT,
    0x56d86a,
    0.12
  );
  glow.setDepth(1150);
  leaves.push(glow);
  gameInstance.tweens.add({
    targets: glow,
    alpha: 0,
    duration: 520,
    ease: 'Sine.easeOut',
  });

  for (let i = 0; i < 14; i++) {
    const startX = -80 - i * 20;
    const startY = Phaser.Math.Between(30, BOARD_RENDER_HEIGHT - 90);
    const leaf = gameInstance.add.ellipse(startX, startY, 38, 18, i % 2 ? 0x8cff66 : 0x2ecc71, 0.82);
    leaf.setAngle(Phaser.Math.Between(-38, 24));
    leaf.setDepth(1152);
    leaves.push(leaf);
    gameInstance.tweens.add({
      targets: leaf,
      x: BOARD_RENDER_WIDTH + 86,
      y: startY + Phaser.Math.Between(60, 170),
      angle: leaf.angle + Phaser.Math.Between(120, 210),
      alpha: 0,
      duration: 720,
      delay: i * 28,
      ease: 'Sine.easeInOut',
    });
  }

  gameInstance.time.delayedCall(780, () => {
    leaves.forEach((leaf) => {
      try { gameInstance.tweens.killTweensOf(leaf); } catch (e) {}
      try { leaf.destroy(); } catch (e) {}
    });
    if (onComplete) onComplete();
  });
}

function activateLeafDragonSkill() {
  if (isGameOver) {
    return;
  }

  leafDoubleScoreMovesRemaining = 3;
  if (audioManager) {
    audioManager.playSkillSfx(DRAGON_SKILL_SFX_ASSETS.leafBlessingStart.key, 'leafSkill');
  }
  if (leafDoubleScoreActiveForCurrentMove) {
    leafSkillRefreshedDuringCurrentMove = true;
  }
  console.log('Leaf Dragon skill activated: next 3 moves x2');
  console.log('Leaf moves remaining:', leafDoubleScoreMovesRemaining);
  updateLeafBlessingUi();
  playLeafScorePulse();
}

function updateLeafBlessingUi(options = {}) {
  const leafMeterElement = document.querySelector('.energy-meter:nth-child(3)');
  if (leafMeterElement) {
    leafMeterElement.classList.toggle('nature-blessing-active', leafDoubleScoreMovesRemaining > 0);
    const moveCounterElement = leafMeterElement.querySelector('.blessing-move-counter');
    if (moveCounterElement) {
      if (leafDoubleScoreMovesRemaining > 0) {
        const moveLabel = leafDoubleScoreMovesRemaining === 1 ? 'move' : 'moves';
        moveCounterElement.textContent = `x2 Score: ${leafDoubleScoreMovesRemaining} ${moveLabel}`;
        moveCounterElement.style.display = 'block';
      } else {
        moveCounterElement.style.display = 'none';
        moveCounterElement.textContent = '';
      }
    }
  }
  updateLeafScoreBuffUi(Boolean(options.preserveScoreIndicator));
}

function startLeafScoreForSuccessfulMove() {
  leafSkillRefreshedDuringCurrentMove = false;
  if (leafDoubleScoreMovesRemaining > 0) {
    leafDoubleScoreActiveForCurrentMove = true;
    scoreMultiplier = 2;
    console.log('Leaf x2 active for this move');
    updateLeafBlessingUi();
    playLeafScorePulse();
    return;
  }

  leafDoubleScoreActiveForCurrentMove = false;
  scoreMultiplier = 1;
}

function finishLeafScoreForSuccessfulMove() {
  if (!leafDoubleScoreActiveForCurrentMove) {
    scoreMultiplier = 1;
    leafSkillRefreshedDuringCurrentMove = false;
    return;
  }

  const previousMovesRemaining = leafDoubleScoreMovesRemaining;
  if (!leafSkillRefreshedDuringCurrentMove) {
    leafDoubleScoreMovesRemaining = Math.max(0, leafDoubleScoreMovesRemaining - 1);
  }

  console.log('Leaf moves remaining:', leafDoubleScoreMovesRemaining);
  if (previousMovesRemaining !== leafDoubleScoreMovesRemaining) {
    if (audioManager) {
      audioManager.playSkillSfx(DRAGON_SKILL_SFX_ASSETS.leafChargeUsed.key, 'leafSkill', { throttle: 140 });
    }
  }
  if (previousMovesRemaining !== leafDoubleScoreMovesRemaining && leafDoubleScoreMovesRemaining > 0) {
    playLeafFallAnimation(5);
  }
  if (leafDoubleScoreMovesRemaining === 0) {
    console.log('Leaf buff expired');
  }

  scoreMultiplier = 1;
  leafDoubleScoreActiveForCurrentMove = false;
  leafSkillRefreshedDuringCurrentMove = false;
  if (previousMovesRemaining !== leafDoubleScoreMovesRemaining && leafDoubleScoreMovesRemaining === 0) {
    updateLeafBlessingUi({ preserveScoreIndicator: true });
    playLeafBuffExpiredEffect();
  } else {
    updateLeafBlessingUi();
  }
}

function createIceCrackLine(x, y, length, angle, alpha = 0.55) {
  if (!gameInstance) return null;

  const crack = gameInstance.add.rectangle(x, y, length, 3, 0xdff6ff, alpha);
  crack.setAngle(angle);
  crack.setDepth(1184);
  return crack;
}

function playIceFreezeBurst(isRefresh = false) {
  if (!gameInstance) return;

  const centerX = BOARD_RENDER_WIDTH / 2;
  const centerY = BOARD_RENDER_HEIGHT / 2;
  const flash = gameInstance.add.rectangle(centerX, centerY, BOARD_RENDER_WIDTH, BOARD_RENDER_HEIGHT, 0xdff6ff, isRefresh ? 0.24 : 0.46);
  flash.setDepth(1190);
  gameInstance.tweens.add({
    targets: flash,
    alpha: 0,
    duration: isRefresh ? 260 : 420,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      try { flash.destroy(); } catch (e) {}
    },
  });

  const ring = gameInstance.add.circle(centerX, centerY, 30, 0x9feaff, 0.12);
  ring.setStrokeStyle(5, 0xdff6ff, 0.72);
  ring.setDepth(1188);
  gameInstance.tweens.add({
    targets: ring,
    scale: isRefresh ? 8 : 12,
    alpha: 0,
    duration: isRefresh ? 360 : 520,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      try { ring.destroy(); } catch (e) {}
    },
  });

  const crackCount = isRefresh ? 8 : 14;
  for (let i = 0; i < crackCount; i++) {
    const angle = (360 / crackCount) * i + Phaser.Math.Between(-12, 12);
    const distance = Phaser.Math.Between(34, 190);
    const radians = Phaser.Math.DegToRad(angle);
    const crack = createIceCrackLine(
      centerX + Math.cos(radians) * distance,
      centerY + Math.sin(radians) * distance,
      Phaser.Math.Between(42, 96),
      angle + Phaser.Math.Between(-35, 35),
      0.5
    );
    if (!crack) continue;
    crack.setScale(0.08, 1);
    gameInstance.tweens.add({
      targets: crack,
      scaleX: 1,
      alpha: 0,
      duration: Phaser.Math.Between(320, 520),
      ease: 'Cubic.easeOut',
      onComplete: () => {
        try { crack.destroy(); } catch (e) {}
      },
    });
  }
}

function startIceFreezeOverlay() {
  if (!gameInstance) return;

  if (iceFreezeOverlay) {
    playIceFreezeBurst(true);
    return;
  }

  const centerX = BOARD_RENDER_WIDTH / 2;
  const centerY = BOARD_RENDER_HEIGHT / 2;
  const objects = [];

  const coolWash = gameInstance.add.rectangle(centerX, centerY, BOARD_RENDER_WIDTH, BOARD_RENDER_HEIGHT, 0x7ed8ff, 0.08);
  coolWash.setDepth(1160);
  objects.push(coolWash);

  const topFrost = gameInstance.add.rectangle(centerX, 16, BOARD_RENDER_WIDTH, 32, 0xdff6ff, 0.18);
  const bottomFrost = gameInstance.add.rectangle(centerX, BOARD_RENDER_HEIGHT - 16, BOARD_RENDER_WIDTH, 32, 0xdff6ff, 0.16);
  const leftFrost = gameInstance.add.rectangle(16, centerY, 32, BOARD_RENDER_HEIGHT, 0xdff6ff, 0.16);
  const rightFrost = gameInstance.add.rectangle(BOARD_RENDER_WIDTH - 16, centerY, 32, BOARD_RENDER_HEIGHT, 0xdff6ff, 0.16);
  [topFrost, bottomFrost, leftFrost, rightFrost].forEach((edge) => {
    edge.setDepth(1162);
    objects.push(edge);
  });

  for (let i = 0; i < 10; i++) {
    const sparkle = gameInstance.add.star(
      Phaser.Math.Between(28, BOARD_RENDER_WIDTH - 28),
      Phaser.Math.Between(24, BOARD_RENDER_HEIGHT - 24),
      4,
      2,
      5,
      0xe8fbff,
      0.42
    );
    sparkle.setDepth(1164);
    objects.push(sparkle);
    gameInstance.tweens.add({
      targets: sparkle,
      alpha: 0.08,
      scale: 1.35,
      duration: Phaser.Math.Between(700, 1100),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: i * 80,
    });
  }

  for (let i = 0; i < 8; i++) {
    const crack = createIceCrackLine(
      Phaser.Math.Between(42, BOARD_RENDER_WIDTH - 42),
      Phaser.Math.Between(42, BOARD_RENDER_HEIGHT - 42),
      Phaser.Math.Between(34, 78),
      Phaser.Math.Between(-70, 70),
      0.18
    );
    if (crack) {
      crack.setDepth(1163);
      objects.push(crack);
    }
  }

  iceFreezeOverlay = { objects };
  playIceFreezeBurst(false);
}

function stopIceFreezeOverlay(immediate = false) {
  if (!iceFreezeOverlay || !gameInstance) {
    iceFreezeOverlay = null;
    return;
  }

  const overlay = iceFreezeOverlay;
  iceFreezeOverlay = null;

  const destroyObjects = () => {
    overlay.objects.forEach((object) => {
      try { gameInstance.tweens.killTweensOf(object); } catch (e) {}
      try { object.destroy(); } catch (e) {}
    });
  };

  if (immediate) {
    destroyObjects();
    return;
  }

  overlay.objects.forEach((object) => {
    gameInstance.tweens.add({
      targets: object,
      alpha: 0,
      duration: 420,
      ease: 'Sine.easeOut',
    });
  });

  for (let i = 0; i < 9; i++) {
    const shard = gameInstance.add.triangle(
      Phaser.Math.Between(40, BOARD_RENDER_WIDTH - 40),
      Phaser.Math.Between(35, BOARD_RENDER_HEIGHT - 35),
      0,
      -8,
      7,
      8,
      -7,
      8,
      0xdff6ff,
      0.48
    );
    shard.setDepth(1187);
    gameInstance.tweens.add({
      targets: shard,
      y: shard.y + Phaser.Math.Between(24, 58),
      alpha: 0,
      angle: Phaser.Math.Between(-80, 80),
      duration: 360,
      ease: 'Quad.easeOut',
      onComplete: () => {
        try { shard.destroy(); } catch (e) {}
      },
    });
  }

  gameInstance.time.delayedCall(450, destroyObjects);
}

function getTimerStatElement() {
  return timerText ? timerText.closest('.stat') : null;
}

function clearTimerFrozenDecorations() {
  timerFrozenVisualElements.forEach((element) => {
    try { element.remove(); } catch (e) {}
  });
  timerFrozenVisualElements = [];
}

function createTimerFrozenDecorations(timerStat) {
  if (!timerStat || timerFrozenVisualElements.length) {
    return;
  }

  const shardData = [
    { left: '8%', top: '18%', rotate: '-22deg' },
    { left: '70%', top: '16%', rotate: '18deg' },
    { left: '12%', top: '78%', rotate: '15deg' },
    { left: '74%', top: '76%', rotate: '-18deg' },
  ];
  shardData.forEach((data) => {
    const shard = document.createElement('span');
    shard.className = 'timer-frost-shard';
    shard.style.left = data.left;
    shard.style.top = data.top;
    shard.style.transform = `rotate(${data.rotate})`;
    timerStat.appendChild(shard);
    timerFrozenVisualElements.push(shard);
  });

  const sparkleData = [
    { left: '22%', top: '28%', delay: '0ms' },
    { left: '82%', top: '36%', delay: '220ms' },
    { left: '50%', top: '82%', delay: '420ms' },
  ];
  sparkleData.forEach((data) => {
    const sparkle = document.createElement('span');
    sparkle.className = 'timer-frost-sparkle';
    sparkle.style.left = data.left;
    sparkle.style.top = data.top;
    sparkle.style.animationDelay = data.delay;
    timerStat.appendChild(sparkle);
    timerFrozenVisualElements.push(sparkle);
  });
}

function playTimerFreezePulse() {
  const timerStat = getTimerStatElement();
  if (!timerStat) return;

  timerStat.classList.remove('timer-freeze-pulse');
  void timerStat.offsetWidth;
  timerStat.classList.add('timer-freeze-pulse');
  setTimeout(() => {
    timerStat.classList.remove('timer-freeze-pulse');
  }, 460);
}

function setTimerFrozenVisualActive(isActive) {
  const timerStat = getTimerStatElement();
  if (!timerStat) {
    clearTimerFrozenDecorations();
    return;
  }

  if (isActive) {
    timerStat.classList.add('frozen-timer-glow');
    createTimerFrozenDecorations(timerStat);
    playTimerFreezePulse();
    return;
  }

  timerStat.classList.remove('frozen-timer-glow');
  timerStat.classList.remove('timer-freeze-pulse');
  clearTimerFrozenDecorations();
}

function activateIceDragonSkill() {
  if (isGameOver) {
    return;
  }

  console.log('Ice Dragon skill activated - Frozen Time!');
  if (audioManager) {
    audioManager.playSkillSfx(DRAGON_SKILL_SFX_ASSETS.iceFreezeStart.key, 'iceSkill');
  }
  
  if (frozenTimeEvent) {
    clearTimeout(frozenTimeEvent);
    console.log('Frozen Time refreshed');
  }
  
  frozenTimeActive = true;
  frozenTimeRemaining = 5;
  
  const iceMeterElement = document.querySelector('.energy-meter:nth-child(2)');
  if (iceMeterElement) {
    iceMeterElement.classList.add('frozen-time-active');
    const countdownElement = iceMeterElement.querySelector('.frozen-time-countdown');
    if (countdownElement) {
      countdownElement.style.display = 'block';
      let timeLeft = frozenTimeRemaining;
      const updateCountdown = () => {
        countdownElement.textContent = `${timeLeft}s`;
        if (timeLeft > 0) {
          timeLeft--;
          setTimeout(updateCountdown, 1000);
        }
      };
      updateCountdown();
    }
  }
  
  startIceFreezeOverlay();
  setTimerFrozenVisualActive(true);
  
  frozenTimeEvent = setTimeout(() => {
    deactivateFrozenTime();
  }, 5000);
}

function deactivateFrozenTime() {
  frozenTimeActive = false;
  frozenTimeRemaining = 0;
  console.log('Frozen Time ended');
  if (audioManager) {
    audioManager.playSkillSfx(DRAGON_SKILL_SFX_ASSETS.iceFreezeEnd.key, 'iceSkill');
  }
  
  const iceMeterElement = document.querySelector('.energy-meter:nth-child(2)');
  if (iceMeterElement) {
    iceMeterElement.classList.remove('frozen-time-active');
    const countdownElement = iceMeterElement.querySelector('.frozen-time-countdown');
    if (countdownElement) {
      countdownElement.style.display = 'none';
    }
  }
  
  setTimerFrozenVisualActive(false);
  stopIceFreezeOverlay(false);
  frozenTimeEvent = null;
}

function flashFrozenTimer() {
  setTimerFrozenVisualActive(true);
}

function clearDragonSkillUi() {
  document.querySelectorAll('.energy-meter').forEach((meter) => {
    meter.classList.remove('dragon-skill-ready');
  });
  dragonReadyBadge.forEach((badge) => {
    if (badge) {
      badge.hidden = true;
    }
  });

  const leafMeterElement = document.querySelector('.energy-meter:nth-child(3)');
  if (leafMeterElement) {
    leafMeterElement.classList.remove('nature-blessing-active');
    const moveCounterElement = leafMeterElement.querySelector('.blessing-move-counter');
    if (moveCounterElement) {
      moveCounterElement.style.display = 'none';
      moveCounterElement.textContent = '';
    }
  }
  const scoreStat = getScoreStatElement();
  if (scoreStat) {
    scoreStat.classList.remove('score-leaf-boost-active');
    scoreStat.classList.remove('leaf-score-pulse');
  }
  clearLeafBuffIndicator();

  const iceMeterElement = document.querySelector('.energy-meter:nth-child(2)');
  if (iceMeterElement) {
    iceMeterElement.classList.remove('frozen-time-active');
    const countdownElement = iceMeterElement.querySelector('.frozen-time-countdown');
    if (countdownElement) {
      countdownElement.style.display = 'none';
    }
  }

  setTimerFrozenVisualActive(false);
  stopIceFreezeOverlay(true);
}

function addScore(baseScore, runId = gameRunId) {
  if (isGameOver || !isCurrentRun(runId)) {
    console.log('Score ignored from stale run');
    return;
  }

  const finalScore = baseScore * scoreMultiplier;
  console.log('Base score:', baseScore);
  console.log('Final score:', finalScore);
  score += finalScore;
  console.log('total score', score);
  updateUi();
}

function createTimerPopup(text) {
  const popup = document.createElement('div');
  popup.className = 'timer-popup';
  popup.textContent = text;
  document.body.appendChild(popup);
  return popup;
}

function showTimerPopup(text) {
  if (!timerText) return;
  const popup = createTimerPopup(text);
  const rect = timerText.getBoundingClientRect();
  popup.style.left = `${rect.left + rect.width / 2}px`;
  popup.style.top = `${rect.top - 12}px`;
  popup.style.transform = 'translate(-50%, -100%)';

  requestAnimationFrame(() => {
    popup.classList.add('visible');
  });

  setTimeout(() => {
    popup.classList.remove('visible');
    setTimeout(() => {
      try { document.body.removeChild(popup); } catch (e) {}
    }, 220);
  }, 900);
}

function flashTimer() {
  const timerStat = timerText ? timerText.closest('.stat') : null;
  if (!timerStat) return;
  timerStat.classList.add('timer-flash');
  setTimeout(() => {
    timerStat.classList.remove('timer-flash');
  }, 300);
}

function startTimer() {
  if (countdownEvent) {
    countdownEvent.remove(false);
  }
  countdownEvent = gameInstance.time.addEvent({
    delay: 1000,
    callback: () => {
      if (isGameOver) {
        return;
      }

      if (timer <= 0) {
        return;
      }
      // Frozen Time: timer does not decrease while active
      if (!frozenTimeActive) {
        timer -= 1;
      }
      updateUi();
      if (timer === 0) {
        endGame();
      }
    },
    loop: true,
  });
  console.log('Timer started');
}

function hasActiveFinalChain() {
  return Boolean(
    isResolving ||
    isAnimating ||
    isComboChainActive ||
    delayedSpecialQueue.length ||
    pendingDragonSkills.length ||
    pendingFireStorm ||
    pendingEarthPetrify ||
    earthPetrifyTimeout ||
    activeDragonCutIn
  );
}

function completePendingGameOverIfReady() {
  if (!isGameOverPending || hasActiveFinalChain()) {
    return false;
  }

  showGameOverOverlay();
  return true;
}

function showGameOverOverlay() {
  if (isGameOver) {
    return;
  }

  console.log('Game over: final chain complete');
  isGameOver = true;
  isGameOverPending = false;
  isResolving = false;
  isAnimating = true;
  activeDragInput = null;
  lastSwappedCells = [];
  pendingDragonSkills = [];
  currentComboCascadeStep = 0;
  isComboChainActive = false;
  dragonEnergyLocked = {
    fire: false,
    ice: false,
    leaf: false,
    earth: false,
  };
  dragonSkillReady = {
    fire: false,
    ice: false,
    leaf: false,
    earth: false,
  };
  pendingFireStorm = null;
  pendingEarthPetrify = false;
  earthPetrifyToken += 1;
  cancelActiveDragonCutIn();
  clearDelayedSpecialQueue();
  if (earthPetrifyTimeout) {
    clearTimeout(earthPetrifyTimeout);
    earthPetrifyTimeout = null;
  }
  if (frozenTimeEvent) {
    clearTimeout(frozenTimeEvent);
    frozenTimeEvent = null;
  }
  frozenTimeActive = false;
  frozenTimeRemaining = 0;
  scoreMultiplier = 1;
  leafDoubleScoreMovesRemaining = 0;
  leafDoubleScoreActiveForCurrentMove = false;
  leafSkillRefreshedDuringCurrentMove = false;
  clearDragonSkillUi();
  deselectEgg();
  selectedEgg = null;
  disableBoardInput();
  stopBoardTweens();
  if (countdownEvent) {
    countdownEvent.remove(false);
    countdownEvent = null;
  }
  finalScoreText.textContent = score;
  gameOverOverlay.classList.remove('hidden');
}

function endGame() {
  if (isGameOver || isGameOverPending) {
    return;
  }

  timer = 0;
  updateUi();
  isGameOverPending = true;
  activeDragInput = null;
  deselectEgg();
  selectedEgg = null;
  disableBoardInput();
  if (countdownEvent) {
    countdownEvent.remove(false);
    countdownEvent = null;
  }

  console.log('Game over pending: waiting for active chain to finish');
  if (!hasActiveFinalChain()) {
    showGameOverOverlay();
  }
}

function resetGame() {
  gameRunId += 1;
  setOptionsPanelOpen(false);
  if (tutorialOverlay) {
    isTutorialOpen = false;
    tutorialOverlay.classList.add('hidden');
    destroyTutorialDemoObjects();
  }
  activeDragInput = null;
  stopGameplayTweensAndTimers();
  gameOverOverlay.classList.add('hidden');
  isGameOver = false;
  isGameOverPending = false;
  isResolving = false;
  gameStarted = false;
  score = 0;
  comboCount = 0;
  currentComboCascadeStep = 0;
  isComboChainActive = false;
  timer = TIMER_SECONDS;
  dragonEnergy = [0, 0, 0, 0];
  isAnimating = false;
  selectedEgg = null;
  activeDragInput = null;
  lastSwappedCells = [];
  pendingDragonSkills = [];
  dragonEnergyLocked = {
    fire: false,
    ice: false,
    leaf: false,
    earth: false,
  };
  dragonSkillReady = {
    fire: false,
    ice: false,
    leaf: false,
    earth: false,
  };
  pendingFireStorm = null;
  pendingEarthPetrify = false;
  earthPetrifyToken += 1;
  cancelActiveDragonCutIn();
  isAnimating = false;
  clearDelayedSpecialQueue();
  if (earthPetrifyTimeout) {
    clearTimeout(earthPetrifyTimeout);
    earthPetrifyTimeout = null;
  }
  if (countdownEvent) {
    countdownEvent.remove(false);
    countdownEvent = null;
  }
  scoreMultiplier = 1;
  leafDoubleScoreMovesRemaining = 0;
  leafDoubleScoreActiveForCurrentMove = false;
  leafSkillRefreshedDuringCurrentMove = false;
  frozenTimeActive = false;
  frozenTimeRemaining = 0;
  if (frozenTimeEvent) {
    clearTimeout(frozenTimeEvent);
    frozenTimeEvent = null;
  }
  if (audioManager) {
    audioManager.stopBgm();
  }
  clearDragonSkillUi();
  rebuildGameplayBoard();
  enableBoardInput();
  updateUi();
  console.log('Game waiting for first move');
  console.log('Restart: game state reset');
}

function clearBoardSprites() {
  tileSprites.forEach((rowSprites) => {
    rowSprites.forEach((sprite) => {
      if (sprite && sprite.destroy) {
        sprite.destroy();
      }
    });
  });
  tileSprites = [];
}

window.addEventListener('DOMContentLoaded', () => {
  new Phaser.Game(config);
});
