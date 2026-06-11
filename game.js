const config = {
  type: Phaser.AUTO,
  parent: 'gameContainer',
  width: 760,
  height: 760,
  backgroundColor: '#0d0a1f',
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const GRID_SIZE = 6;
const TILE_SIZE = 100;
const GRID_OFFSET_X = 80;
const GRID_OFFSET_Y = 80;
const EGG_TYPES = ['fire', 'water', 'leaf', 'earth'];
const DRAGON_TYPES = ['Fire', 'Ice', 'Leaf', 'Earth'];
const DRAGON_SKILL_TYPES = ['fire', 'ice', 'leaf', 'earth'];
const EARTH_TYPE = EGG_TYPES.indexOf('earth');
const DRAGON_ENERGY_MAX = 30;
const NORMAL_SCALE = 1;
const SELECTED_SCALE = 1.15;
const MATCH_SCORE = 10;
const TIMER_SECONDS = 90;
const FIRE_STORM_CENTERS = [
  { row: 2, col: 2 },
  { row: 2, col: 3 },
  { row: 3, col: 2 },
  { row: 3, col: 3 }
];

let board = [];
let tileSprites = [];
let selectedEgg = null;
let lastSwappedCells = [];
let isAnimating = false;
let isGameOver = false;
let isResolving = false;
let score = 0;
let timer = TIMER_SECONDS;
let countdownEvent;
let comboCount = 0;
let dragonEnergy = [0, 0, 0, 0];
let dragonEnergyText = [];
let dragonEnergyFill = [];
let pendingDragonSkills = [];
let pendingFireStorm = null;
let pendingEarthPetrify = false;
let earthPetrifyTimeout = null;
let scoreMultiplier = 1;
let natureBlessingEvent = null;
let frozenTimeActive = false;
let frozenTimeEvent = null;
let frozenTimeRemaining = 0;
let scoreText;
let timerText;
let comboText;
let gameOverOverlay;
let finalScoreText;
let restartButton;
let overlayRestartButton;
let gameInstance;

function preload() {
  // No external files required; textures are generated in create().
}

function create() {
  gameInstance = this;
  generateEggTextures();

  scoreText = document.getElementById('scoreValue');
  timerText = document.getElementById('timerValue');
  comboText = document.getElementById('comboText');
  gameOverOverlay = document.getElementById('gameOverOverlay');
  finalScoreText = document.getElementById('finalScore');
  restartButton = document.getElementById('restartButton');
  overlayRestartButton = document.getElementById('overlayRestart');

  dragonEnergyText = DRAGON_TYPES.map((type) => document.getElementById(`${type.toLowerCase()}EnergyProgress`));
  dragonEnergyFill = DRAGON_TYPES.map((type) => document.getElementById(`${type.toLowerCase()}EnergyFill`));

  restartButton.addEventListener('click', resetGame);
  overlayRestartButton.addEventListener('click', resetGame);

  initializeBoard();
  createBoardSprites();
  startTimer();
  updateUi();
}

function generateEggTextures() {
  const colors = [0xff4d4d, 0x4d8bff, 0x5ec25e, 0xd8aa55];
  const width = 120;
  const height = 140;
  const radius = 36;
  const offsetY = 10;

  const graphics = gameInstance.make.graphics({ x: 0, y: 0, add: false });
  EGG_TYPES.forEach((type, index) => {
    graphics.clear();
    graphics.fillStyle(colors[index], 1);
    graphics.fillEllipse(width / 2, height / 2 + offsetY, radius, radius * 1.25);
    graphics.lineStyle(4, 0xffffff, 0.24);
    graphics.strokeEllipse(width / 2, height / 2 + offsetY, radius, radius * 1.25);
    graphics.fillStyle(0xffffff, 0.22);
    graphics.fillEllipse(width / 2 + 10, height / 2 - 10 + offsetY, radius * 0.24, radius * 0.14);
    graphics.generateTexture(`egg-${type}`, width, height);
  });
}

function update() {
  // No per-frame updates needed for this game.
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
      const x = GRID_OFFSET_X + col * TILE_SIZE;
      const y = GRID_OFFSET_Y + row * TILE_SIZE;
      tileSprites[row][col] = createTileSprite(row, col, x, y, board[row][col]);
    }
  }
}

function createTileSprite(row, col, x, y, type) {
  const texture = `egg-${EGG_TYPES[type]}`;
  const sprite = gameInstance.add.sprite(x, y, texture).setInteractive();
  sprite.setScale(NORMAL_SCALE);
  sprite.displayWidth = TILE_SIZE * 0.8;
  sprite.displayHeight = TILE_SIZE * 0.95;
  sprite.setAlpha(1);
  sprite.clearTint();
  sprite.setData('row', row);
  sprite.setData('col', col);
  sprite.setData('type', type);
  sprite.on('pointerdown', function () {
    const r = this.getData('row');
    const c = this.getData('col');
    const t = this.getData('type');
    console.log('egg clicked', r, c, t);
    handleTileClick(r, c);
  });
  console.log('created egg', row, col, type);
  console.log('interactive attached', row, col);
  return sprite;
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
    sprite.setScale(SELECTED_SCALE);
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
    sprite.displayWidth = TILE_SIZE * 0.8;
    sprite.displayHeight = TILE_SIZE * 0.95;
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
        sprite.displayWidth = TILE_SIZE * 0.8;
        sprite.displayHeight = TILE_SIZE * 0.95;
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
  getBoardSprites().forEach((sprite) => {
    try { sprite.disableInteractive(); } catch (e) {}
  });
}

function enableBoardInput() {
  getBoardSprites().forEach((sprite) => {
    try { sprite.setInteractive(); } catch (e) {}
  });
}

function stopBoardTweens() {
  if (!gameInstance || !gameInstance.tweens) return;
  gameInstance.tweens.killTweensOf(getBoardSprites());
}

function isAdjacent(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

function swapEggs(first, second) {
  if (isGameOver) {
    console.log('Input ignored because game over');
    return;
  }

  if (!first || !second) {
    return;
  }
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
      if (isGameOver) {
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
            if (isGameOver) {
              console.log('Resolve stopped because game over');
              return;
            }

            tileSprites[first.row][first.col] = firstSprite;
            tileSprites[second.row][second.col] = secondSprite;
            updateSpriteData(firstSprite, first.row, first.col);
            updateSpriteData(secondSprite, second.row, second.col);
            selectedEgg = null;
            isAnimating = false;
          },
        });
        return;
      }

      console.log('swap completed');
      lastSwappedCells = [
        { row: second.row, col: second.col },
        { row: first.row, col: first.col }
      ];
      console.log('lastSwappedCells', lastSwappedCells);
      selectedEgg = null;
      // Manual match start: set combo to 1 and show feedback
      comboCount = 1;
      updateUi();
      pulseCombo();
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
  const x = GRID_OFFSET_X + col * TILE_SIZE;
  const y = GRID_OFFSET_Y + row * TILE_SIZE;
  if (!sprite) {
    sprite = createTileSprite(row, col, x, y, type);
    tileSprites[row][col] = sprite;
    console.log('recreated missing sprite at', row, col);
  }
  // ensure it's at the correct position and visual state
  sprite.x = x;
  sprite.y = y;
  sprite.setScale(NORMAL_SCALE);
  sprite.displayWidth = TILE_SIZE * 0.8;
  sprite.displayHeight = TILE_SIZE * 0.95;
  sprite.setAlpha(1);
  sprite.clearTint();
  sprite.setInteractive();
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

  const fallbackCell = sortedCells[2] || sortedCells[Math.floor(sortedCells.length / 2)];
  console.log('Match 4 fallback center used', fallbackCell.row, fallbackCell.col);
  return { row: fallbackCell.row, col: fallbackCell.col };
}

function resolveBoard(isAutomatic = false) {
  if (isGameOver) {
    console.log('Resolve stopped because game over');
    return;
  }

  isResolving = true;
  isAnimating = true;
  deselectEgg();
  console.log('selection cleared after destroy');

  let stepNumber = 0;
  let firstStep = !isAutomatic;

  const runStep = () => {
    if (isGameOver) {
      isResolving = false;
      console.log('Resolve stopped because game over');
      return;
    }

    stepNumber += 1;
    console.log('resolve step', stepNumber);

    const effects = detectPatterns();
    console.log('effects detected in chain', effects.length);
    if (!effects.length) {
      if (pendingFireStorm) {
        const destroyedCells = new Set();
        const totalScoreGain = applyPendingFireStorm(destroyedCells);
        destroyedCells.forEach((key) => {
          const [row, col] = key.split('-').map(Number);
          const type = board[row][col];
          if (type !== null && type !== undefined) {
            gainDragonEnergy(type);
          }
        });

        addScore(totalScoreGain);
        if (isGameOver) {
          isResolving = false;
          console.log('Resolve stopped because game over');
          return;
        }

        animateRemovals(destroyedCells, () => {
          if (isGameOver) {
            isResolving = false;
            console.log('Resolve stopped because game over');
            return;
          }
          runStep();
        });
        return;
      }

      console.log('chain finished');
      console.log('Combo chain finished');
      isResolving = false;
      if (!isAutomatic && stepNumber === 1) {
        // if this was a manual trigger with no matches, reset combo
        comboCount = 0;
      }
      updateUi();
      if (activatePendingDragonSkills(true)) {
        return;
      }
      isAnimating = false;
      return;
    }

    if (!firstStep) {
      comboCount += 1;
      pulseCombo();
    }
    firstStep = false;
    console.log('combo count', comboCount);

    effects.sort((a, b) => b.priority - a.priority);
    console.log('sorted effects by priority', effects.map((effect) => ({ type: effect.type, priority: effect.priority, eggType: effect.eggType })));

    const destroyedCells = new Set();
    let totalScoreGain = 0;

    effects.forEach((effect) => {
      console.log('applying special effect in chain', effect.type, effect.direction || '', effect.centerCell ? `${effect.centerCell.row}-${effect.centerCell.col}` : '');
      let effectTargets = [];

      switch (effect.type) {
        case 'match5':
          effectTargets = getAllSameType(effect.eggType);
          break;
        case 'match4':
          effectTargets = getMatch4Targets(effect);
          showMatch4Beam(effect);
          break;
        case 'lshape':
        case 'tshape':
          if (effect.centerCell) {
            effectTargets = getExplosionArea(effect.centerCell.row, effect.centerCell.col);
          } else {
            effectTargets = effect.matchedCells;
          }
          break;
        case 'match3':
        default:
          effectTargets = effect.matchedCells;
          break;
      }

      let newDestroyed = 0;
      const sampleTile = effect.centerCell || effect.matchedCells[0] || { row: 0, col: 0 };
      const px = GRID_OFFSET_X + sampleTile.col * TILE_SIZE + TILE_SIZE / 2;
      const py = GRID_OFFSET_Y + sampleTile.row * TILE_SIZE + TILE_SIZE / 2;
      const isBigPopup = effect.type === 'match5' || effect.type === 'match4' || effect.type === 'lshape' || effect.type === 'tshape';

      effectTargets.forEach((tile) => {
        const key = `${tile.row}-${tile.col}`;
        if (destroyedCells.has(key)) {
          console.log('skipped duplicate cell', key);
          return;
        }
        destroyedCells.add(key);
        newDestroyed += 1;
      });

      let effectScore = newDestroyed * MATCH_SCORE;
      if (effect.type === 'match5') {
        effectScore *= 2;
      }

      totalScoreGain += effectScore;
      console.log('score gained from effect', effect.type, effectScore);
      console.log('total destroyed cells', destroyedCells.size);
      if (effectScore > 0) {
        createScorePopup(px, py, `+${effectScore}`, isBigPopup ? 32 : 20);
      }
    });

    totalScoreGain += applyPendingFireStorm(destroyedCells);

    destroyedCells.forEach((key) => {
      const [row, col] = key.split('-').map(Number);
      const type = board[row][col];
      if (type !== null && type !== undefined) {
        gainDragonEnergy(type);
      }
    });

    addScore(totalScoreGain);
    if (isGameOver) {
      isResolving = false;
      console.log('Resolve stopped because game over');
      return;
    }

    animateRemovals(destroyedCells, () => {
      if (isGameOver) {
        isResolving = false;
        console.log('Resolve stopped because game over');
        return;
      }
      runStep();
    });
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

function showMatch4Beam(effect) {
  if (!gameInstance || !effect.centerCell) return;

  const center = effect.centerCell;
  const beamX = GRID_OFFSET_X + center.col * TILE_SIZE;
  const beamY = GRID_OFFSET_Y + center.row * TILE_SIZE;
  const boardCenterX = GRID_OFFSET_X + ((GRID_SIZE - 1) * TILE_SIZE) / 2;
  const boardCenterY = GRID_OFFSET_Y + ((GRID_SIZE - 1) * TILE_SIZE) / 2;
  const isVerticalBeam = effect.direction === 'horizontal';
  const beam = gameInstance.add.rectangle(
    isVerticalBeam ? beamX : boardCenterX,
    isVerticalBeam ? boardCenterY : beamY,
    isVerticalBeam ? TILE_SIZE * 0.22 : GRID_SIZE * TILE_SIZE,
    isVerticalBeam ? GRID_SIZE * TILE_SIZE : TILE_SIZE * 0.22,
    0xffffff,
    0.36
  );
  beam.setDepth(880);
  gameInstance.tweens.add({
    targets: beam,
    alpha: 0,
    scaleX: isVerticalBeam ? 1.8 : 1,
    scaleY: isVerticalBeam ? 1 : 1.8,
    duration: 260,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      try { beam.destroy(); } catch (e) {}
    },
  });
}

// Create a floating score popup at pixel position x,y
function createScorePopup(x, y, text, fontSize = 20) {
  if (!gameInstance) return;
  const style = { font: `${fontSize}px Arial`, fill: '#fff', stroke: '#000', strokeThickness: 3 };
  const txt = gameInstance.add.text(x, y, text, style).setOrigin(0.5);
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

function animateRemovals(removalSet, onComplete) {
  if (isGameOver) {
    console.log('Resolve stopped because game over');
    return;
  }

  deselectEgg();
  const toRemove = Array.from(removalSet).map((key) => {
    const [row, col] = key.split('-').map(Number);
    return { row, col, sprite: tileSprites[row] && tileSprites[row][col] ? tileSprites[row][col] : null };
  });

  if (toRemove.length === 0) {
    applyRemovals(removalSet);
    if (isGameOver) {
      console.log('Resolve stopped because game over');
      return;
    }
    applyGravity(() => {
      if (isGameOver) {
        console.log('Resolve stopped because game over');
        return;
      }
      refillBoard(() => {
        if (isGameOver) {
          console.log('Resolve stopped because game over');
          return;
        }
        console.log('gravity and refill complete');
        if (onComplete) onComplete();
      });
    });
    return;
  }

  let done = 0;
  toRemove.forEach((entry) => {
    if (entry.sprite) {
      gameInstance.tweens.add({
        targets: entry.sprite,
        scale: 0,
        alpha: 0,
        duration: 180,
        ease: 'Power1',
        onComplete: () => {
          if (isGameOver) {
            console.log('Resolve stopped because game over');
            return;
          }

          try { entry.sprite.destroy(); } catch (e) {}
          tileSprites[entry.row][entry.col] = null;
          done += 1;
          if (done === toRemove.length) {
            applyRemovals(removalSet);
            if (isGameOver) {
              console.log('Resolve stopped because game over');
              return;
            }
            applyGravity(() => {
              if (isGameOver) {
                console.log('Resolve stopped because game over');
                return;
              }
              refillBoard(() => {
                if (isGameOver) {
                  console.log('Resolve stopped because game over');
                  return;
                }
                console.log('gravity and refill complete');
                if (onComplete) onComplete();
              });
            });
          }
        }
      });
    } else {
      if (isGameOver) {
        console.log('Resolve stopped because game over');
        return;
      }

      done += 1;
      if (done === toRemove.length) {
        applyRemovals(removalSet);
        if (isGameOver) {
          console.log('Resolve stopped because game over');
          return;
        }
        applyGravity(() => {
          if (isGameOver) {
            console.log('Resolve stopped because game over');
            return;
          }
          refillBoard(() => {
            if (isGameOver) {
              console.log('Resolve stopped because game over');
              return;
            }
            console.log('gravity and refill complete');
            if (onComplete) onComplete();
          });
        });
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

function applyGravity(onComplete) {
  if (isGameOver) {
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
          sprite.displayWidth = TILE_SIZE * 0.8;
          sprite.displayHeight = TILE_SIZE * 0.95;
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
      const targetX = GRID_OFFSET_X + col * TILE_SIZE;
      const targetY = GRID_OFFSET_Y + targetRow * TILE_SIZE;
      tileSprites[targetRow][col] = egg.sprite;
      egg.sprite.setData('row', targetRow);
      egg.sprite.setData('col', col);
      egg.sprite.setData('type', egg.type);
      egg.sprite.setInteractive();
      try { egg.sprite.off && egg.sprite.off('pointerdown'); } catch (e) {}
      egg.sprite.on && egg.sprite.on('pointerdown', function () {
        const r = this.getData('row');
        const c = this.getData('col');
        const t = this.getData('type');
        console.log('egg clicked', r, c, t);
        handleTileClick(r, c);
      });

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
    if (!isGameOver && onComplete) onComplete();
    return;
  }

  let completed = 0;
  const total = tweens.length;
  tweens.forEach((t) => {
    const copy = Object.assign({}, t);
    const userOnComplete = copy.onComplete;
    copy.onComplete = () => {
      if (isGameOver) {
        console.log('Resolve stopped because game over');
        return;
      }

      try { if (typeof userOnComplete === 'function') userOnComplete(); } catch (e) {}
      completed += 1;
      if (completed === total) {
        if (!isGameOver && onComplete) onComplete();
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

function refillBoard(onComplete) {
  if (isGameOver) {
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
        const destinationX = GRID_OFFSET_X + col * TILE_SIZE;
        const destinationY = GRID_OFFSET_Y + row * TILE_SIZE;
        const startY = destinationY - TILE_SIZE * 1.5;
        let sprite = tileSprites[row] && tileSprites[row][col];
        if (sprite) {
          sprite.destroy();
        }
        sprite = createTileSprite(row, col, destinationX, startY, type);
        sprite.alpha = 0;
        sprite.setScale(NORMAL_SCALE);
        tileSprites[row][col] = sprite;
        console.log('new egg spawned above board', row, col, type);
        tweens.push({
          targets: sprite,
          x: destinationX,
          y: destinationY,
          alpha: 1,
          scale: 1,
          duration: 220,
          ease: 'Power2',
        });
      }
    }
  }

  if (tweens.length === 0) {
    console.log('refill complete');
    resetBoardVisuals();
    if (!isGameOver && onComplete) onComplete();
    return;
  }

  let completed = 0;
  const total = tweens.length;
  tweens.forEach((t) => {
    const copy = Object.assign({}, t);
    const userOnComplete = copy.onComplete;
    copy.onComplete = () => {
      if (isGameOver) {
        console.log('Resolve stopped because game over');
        return;
      }

      try { if (typeof userOnComplete === 'function') userOnComplete(); } catch (e) {}
      completed += 1;
      if (completed === total) {
        console.log('refill complete');
        resetBoardVisuals();
        if (!isGameOver && onComplete) onComplete();
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
      const destinationX = GRID_OFFSET_X + col * TILE_SIZE;
      const destinationY = GRID_OFFSET_Y + row * TILE_SIZE;

      if (!sprite || sprite.getData('type') === null) {
        if (sprite) {
          sprite.destroy();
        }
        sprite = createTileSprite(row, col, destinationX, destinationY - TILE_SIZE, type);
        sprite.alpha = 0;
        sprite.setScale(NORMAL_SCALE);
        tileSprites[row][col] = sprite;
        console.log('new egg interactive added', row, col, type);
      } else {
        sprite.setData('row', row);
        sprite.setData('col', col);
        sprite.setData('type', type);
        sprite.setTexture(`egg-${EGG_TYPES[type]}`);
        // ensure sprite remains interactive and has correct handler
        sprite.setInteractive();
        // remove any previous handler and attach a fresh one that reads current data
        try { sprite.off && sprite.off('pointerdown'); } catch (e) {}
        sprite.on && sprite.on('pointerdown', function () {
          const r = this.getData('row');
          const c = this.getData('col');
          const t = this.getData('type');
          console.log('egg clicked', r, c, t);
          handleTileClick(r, c);
        });
        console.log('interactive attached', row, col);
      }

      tweens.push({
        targets: sprite,
        x: destinationX,
        y: destinationY,
        alpha: 1,
        scale: 1,
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
  dragonEnergy.forEach((value, index) => {
    const progressElement = dragonEnergyText[index];
    const fillElement = dragonEnergyFill[index];
    if (progressElement) {
      progressElement.textContent = `${value}/${DRAGON_ENERGY_MAX}`;
    }
    if (fillElement) {
      fillElement.style.width = `${(value / DRAGON_ENERGY_MAX) * 100}%`;
    }
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

function getFireStormArea(center) {
  const cells = [];
  for (let row = center.row - 2; row <= center.row + 2; row++) {
    for (let col = center.col - 2; col <= center.col + 2; col++) {
      if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
        cells.push({ row, col });
      }
    }
  }
  return cells;
}

function applyPendingFireStorm(destroyedCells) {
  if (!pendingFireStorm) {
    return 0;
  }

  console.log('Processing pending Fire Storm');
  const stormCells = getFireStormArea(pendingFireStorm.center);
  console.log('Fire Storm cells to destroy:', stormCells.length);
  let newStormDestroyed = 0;
  stormCells.forEach((tile) => {
    const key = `${tile.row}-${tile.col}`;
    if (!destroyedCells.has(key)) {
      destroyedCells.add(key);
      newStormDestroyed += 1;
    }
  });

  console.log('Fire Storm destroyed eggs', stormCells.length);
  console.log('Fire Storm bonus +50');
  const centerX = GRID_OFFSET_X + pendingFireStorm.center.col * TILE_SIZE + TILE_SIZE / 2;
  const centerY = GRID_OFFSET_Y + pendingFireStorm.center.row * TILE_SIZE + TILE_SIZE / 2;
  showFireStormEffect(pendingFireStorm.center);
  createScorePopup(centerX, centerY + 28, '+50 Bonus', 28);
  pendingFireStorm = null;
  return newStormDestroyed * MATCH_SCORE + 50;
}

function triggerFireStorm() {
  // Deprecated: use activateFireDragonSkill() instead
}

function showFireStormEffect(center) {
  if (!gameInstance) return;
  const x = GRID_OFFSET_X + center.col * TILE_SIZE;
  const y = GRID_OFFSET_Y + center.row * TILE_SIZE;

  const explosion = gameInstance.add.circle(x, y, 24, 0xff6600, 0.75);
  explosion.setDepth(900);
  gameInstance.tweens.add({
    targets: explosion,
    scale: 2.4,
    alpha: 0,
    duration: 420,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      try { explosion.destroy(); } catch (e) {}
    },
  });

  const stormText = gameInstance.add.text(x, y - 16, 'Fire Storm!', {
    font: '28px Arial',
    fill: '#ffbf00',
    stroke: '#300000',
    strokeThickness: 6,
  }).setOrigin(0.5);
  stormText.setDepth(1000);
  gameInstance.tweens.add({
    targets: stormText,
    y: y - 48,
    alpha: 0,
    duration: 1000,
    ease: 'Power1',
    onComplete: () => {
      try { stormText.destroy(); } catch (e) {}
    },
  });
}

function gainDragonEnergy(type) {
  if (isGameOver) {
    return;
  }

  if (type < 0 || type >= dragonEnergy.length) {
    return;
  }

  dragonEnergy[type] += 1;
  console.log(`${DRAGON_TYPES[type]} energy +1`);
  console.log('Fire energy:', dragonEnergy[0]);

  if (dragonEnergy[type] >= DRAGON_ENERGY_MAX) {
    console.log(`${DRAGON_TYPES[type]} Dragon skill ready`);
    dragonEnergy[type] = 0;
    console.log('Energy reached 30, skill queued');
    queueDragonSkill(DRAGON_SKILL_TYPES[type]);
    if (type === 1) {
      console.log('Ice energy reset to 0');
      updateUi();
    }
    if (type === 0) {
      console.log('Fire energy reset to 0');
    }
    if (type === 2) {
      console.log('Leaf energy reset to 0');
      updateDragonEnergyUi();
    }
    if (type === 3) {
      console.log('Earth energy reset to 0');
      updateDragonEnergyUi();
    }
  }
}

function queueDragonSkill(type) {
  if (!type) {
    return;
  }

  pendingDragonSkills.push(type);
  console.log('Dragon skill queued:', type);
  updateDragonEnergyUi();
}

function activatePendingDragonSkills(isFinalResolution = false) {
  if (isGameOver) {
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
  while (pendingDragonSkills.length && !isGameOver) {
    const skillType = pendingDragonSkills.shift();
    console.log('Pending skill activated:', skillType);

    if (skillType === 'fire') {
      activateFireDragonSkill();
      if (pendingFireStorm) {
        resolveBoard(true);
        return true;
      }
      continue;
    }

    if (skillType === 'ice') {
      activateIceDragonSkill();
      continue;
    }

    if (skillType === 'leaf') {
      activateLeafDragonSkill();
      continue;
    }

    if (skillType === 'earth') {
      activateEarthDragonSkill();
      if (pendingEarthPetrify || earthPetrifyTimeout) {
        return true;
      }
    }
  }

  return false;
}

function activateFireDragonSkill() {
  if (isGameOver) {
    return;
  }

  const center = FIRE_STORM_CENTERS[Math.floor(Math.random() * FIRE_STORM_CENTERS.length)];
  console.log('Fire Dragon skill activated');
  console.log('Fire Storm picked center:', center.row, center.col);
  const radius = 2;
  console.log('Fire Storm 5x5 target cells:', getFireStormArea(center).length);
  pendingFireStorm = { center };
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
  if (isGameOver) {
    console.log('Resolve stopped because game over');
    return;
  }

  pendingEarthPetrify = false;
  isAnimating = true;
  deselectEgg();

  const convertedEggs = convertRandomEggsToEarth(10);
  console.log('Petrify converted eggs:');
  convertedEggs.forEach((egg) => {
    console.log('row, col', egg.row, egg.col);
  });

  showPetrifyEffect(convertedEggs);
  comboCount = 1;
  updateUi();
  pulseCombo();

  earthPetrifyTimeout = setTimeout(() => {
    earthPetrifyTimeout = null;
    if (isGameOver) {
      console.log('Resolve stopped because game over');
      return;
    }
    console.log('Checking matches after Petrify');
    resolveBoard(false);
  }, 500);
}

function convertRandomEggsToEarth(limit) {
  const candidates = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] !== null && board[row][col] !== undefined && board[row][col] !== EARTH_TYPE) {
        candidates.push({ row, col });
      }
    }
  }

  Phaser.Utils.Array.Shuffle(candidates);
  const convertedEggs = candidates.slice(0, limit);
  convertedEggs.forEach((egg) => {
    board[egg.row][egg.col] = EARTH_TYPE;
    const sprite = ensureSpriteAt(egg.row, egg.col);
    sprite.setData('type', EARTH_TYPE);
    sprite.setTexture(`egg-${EGG_TYPES[EARTH_TYPE]}`);
  });

  return convertedEggs;
}

function showPetrifyEffect(convertedEggs) {
  if (!gameInstance) return;

  const centerX = GRID_OFFSET_X + ((GRID_SIZE - 1) * TILE_SIZE) / 2;
  const centerY = GRID_OFFSET_Y + ((GRID_SIZE - 1) * TILE_SIZE) / 2;
  const flash = gameInstance.add.rectangle(
    centerX,
    centerY,
    GRID_SIZE * TILE_SIZE,
    GRID_SIZE * TILE_SIZE,
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

  const petrifyText = gameInstance.add.text(centerX, centerY - 18, 'Petrify!', {
    font: '34px Arial',
    fill: '#d8aa55',
    stroke: '#2f1d0f',
    strokeThickness: 7,
  }).setOrigin(0.5);
  petrifyText.setDepth(1000);
  gameInstance.tweens.add({
    targets: petrifyText,
    y: centerY - 62,
    alpha: 0,
    duration: 1000,
    ease: 'Power1',
    onComplete: () => {
      try { petrifyText.destroy(); } catch (e) {}
    },
  });

  convertedEggs.forEach((egg) => {
    const sprite = tileSprites[egg.row] && tileSprites[egg.row][egg.col];
    if (!sprite) return;
    sprite.setTint(0xc49a5c);
    gameInstance.tweens.add({
      targets: sprite,
      scale: 1.22,
      duration: 140,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        sprite.setScale(NORMAL_SCALE);
        sprite.displayWidth = TILE_SIZE * 0.8;
        sprite.displayHeight = TILE_SIZE * 0.95;
        sprite.clearTint();
      },
    });
  });
}

function activateLeafDragonSkill() {
  if (isGameOver) {
    return;
  }

  console.log('Leaf Dragon skill activated');
  
  if (natureBlessingEvent) {
    clearTimeout(natureBlessingEvent);
    console.log('Nature Blessing refreshed');
  }
  
  scoreMultiplier = 2;
  console.log('Score multiplier x2 active');
  
  const leafMeterElement = document.querySelector('.energy-meter:nth-child(3)');
  if (leafMeterElement) {
    leafMeterElement.classList.add('nature-blessing-active');
    const countdownElement = leafMeterElement.querySelector('.blessing-countdown');
    if (countdownElement) {
      countdownElement.style.display = 'block';
      let timeLeft = 5;
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
  
  showTimerPopup('Nature Blessing x2!');
  
  natureBlessingEvent = setTimeout(() => {
    deactivateNatureBlessing();
  }, 5000);
}

function deactivateNatureBlessing() {
  scoreMultiplier = 1;
  console.log('Nature Blessing ended');
  
  const leafMeterElement = document.querySelector('.energy-meter:nth-child(3)');
  if (leafMeterElement) {
    leafMeterElement.classList.remove('nature-blessing-active');
    const countdownElement = leafMeterElement.querySelector('.blessing-countdown');
    if (countdownElement) {
      countdownElement.style.display = 'none';
    }
  }
  
  natureBlessingEvent = null;
}

function activateIceDragonSkill() {
  if (isGameOver) {
    return;
  }

  console.log('Ice Dragon skill activated - Frozen Time!');
  
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
  
  showTimerPopup('Frozen Time!');
  flashFrozenTimer();
  
  frozenTimeEvent = setTimeout(() => {
    deactivateFrozenTime();
  }, 5000);
}

function deactivateFrozenTime() {
  frozenTimeActive = false;
  frozenTimeRemaining = 0;
  console.log('Frozen Time ended');
  
  const iceMeterElement = document.querySelector('.energy-meter:nth-child(2)');
  if (iceMeterElement) {
    iceMeterElement.classList.remove('frozen-time-active');
    const countdownElement = iceMeterElement.querySelector('.frozen-time-countdown');
    if (countdownElement) {
      countdownElement.style.display = 'none';
    }
  }
  
  const timerStat = timerText ? timerText.closest('.stat') : null;
  if (timerStat) {
    timerStat.classList.remove('frozen-timer-glow');
  }
  
  frozenTimeEvent = null;
}

function flashFrozenTimer() {
  const timerStat = timerText ? timerText.closest('.stat') : null;
  if (!timerStat) return;
  timerStat.classList.add('frozen-timer-glow');
}

function clearDragonSkillUi() {
  const leafMeterElement = document.querySelector('.energy-meter:nth-child(3)');
  if (leafMeterElement) {
    leafMeterElement.classList.remove('nature-blessing-active');
    const countdownElement = leafMeterElement.querySelector('.blessing-countdown');
    if (countdownElement) {
      countdownElement.style.display = 'none';
    }
  }

  const iceMeterElement = document.querySelector('.energy-meter:nth-child(2)');
  if (iceMeterElement) {
    iceMeterElement.classList.remove('frozen-time-active');
    const countdownElement = iceMeterElement.querySelector('.frozen-time-countdown');
    if (countdownElement) {
      countdownElement.style.display = 'none';
    }
  }

  const timerStat = timerText ? timerText.closest('.stat') : null;
  if (timerStat) {
    timerStat.classList.remove('frozen-timer-glow');
  }
}

function addScore(baseScore) {
  if (isGameOver) {
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
  timer = TIMER_SECONDS;
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
}

function endGame() {
  if (isGameOver) {
    return;
  }

  console.log('Game over: freezing board');
  isGameOver = true;
  isResolving = false;
  isAnimating = true;
  lastSwappedCells = [];
  pendingDragonSkills = [];
  pendingFireStorm = null;
  pendingEarthPetrify = false;
  if (earthPetrifyTimeout) {
    clearTimeout(earthPetrifyTimeout);
    earthPetrifyTimeout = null;
  }
  if (natureBlessingEvent) {
    clearTimeout(natureBlessingEvent);
    natureBlessingEvent = null;
  }
  if (frozenTimeEvent) {
    clearTimeout(frozenTimeEvent);
    frozenTimeEvent = null;
  }
  frozenTimeActive = false;
  frozenTimeRemaining = 0;
  scoreMultiplier = 1;
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

function resetGame() {
  gameOverOverlay.classList.add('hidden');
  isGameOver = false;
  isResolving = false;
  score = 0;
  comboCount = 0;
  timer = TIMER_SECONDS;
  dragonEnergy = [0, 0, 0, 0];
  isAnimating = false;
  selectedEgg = null;
  lastSwappedCells = [];
  pendingDragonSkills = [];
  pendingFireStorm = null;
  pendingEarthPetrify = false;
  if (earthPetrifyTimeout) {
    clearTimeout(earthPetrifyTimeout);
    earthPetrifyTimeout = null;
  }
  scoreMultiplier = 1;
  frozenTimeActive = false;
  frozenTimeRemaining = 0;
  if (natureBlessingEvent) {
    clearTimeout(natureBlessingEvent);
    natureBlessingEvent = null;
  }
  if (frozenTimeEvent) {
    clearTimeout(frozenTimeEvent);
    frozenTimeEvent = null;
  }
  clearDragonSkillUi();
  clearBoardSprites();
  initializeBoard();
  createBoardSprites();
  enableBoardInput();
  startTimer();
  updateUi();
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
