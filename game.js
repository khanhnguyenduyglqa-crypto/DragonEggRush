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
const NORMAL_SCALE = 1;
const SELECTED_SCALE = 1.15;
const MATCH_SCORE = 10;
const TIMER_SECONDS = 90;

let board = [];
let tileSprites = [];
let selectedEgg = null;
let isAnimating = false;
let score = 0;
let timer = TIMER_SECONDS;
let countdownEvent;
let comboCount = 0;
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

function isAdjacent(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

function swapEggs(first, second) {
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
      tileSprites[first.row][first.col] = secondSprite;
      tileSprites[second.row][second.col] = firstSprite;
      updateSpriteData(firstSprite, second.row, second.col);
      updateSpriteData(secondSprite, first.row, first.col);

      const patterns = detectPatterns();
      if (patterns.length === 0) {
        console.log('no match, swapping back');
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
        addEffect({
          type,
          priority: type === 'match5' ? 5 : type === 'match4' ? 4 : 3,
          eggType: current,
          matchedCells: tiles,
          direction: 'horizontal',
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
        addEffect({
          type,
          priority: type === 'match5' ? 5 : type === 'match4' ? 4 : 3,
          eggType: current,
          matchedCells: tiles,
          direction: 'vertical',
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

function resolveBoard(isAutomatic = false) {
  isAnimating = true;
  deselectEgg();
  console.log('selection cleared after destroy');

  let stepNumber = 0;
  let firstStep = !isAutomatic;

  const runStep = () => {
    stepNumber += 1;
    console.log('resolve step', stepNumber);

    const effects = detectPatterns();
    console.log('effects detected in chain', effects.length);
    if (!effects.length) {
      console.log('chain finished');
      isAnimating = false;
      if (!isAutomatic && stepNumber === 1) {
        // if this was a manual trigger with no matches, reset combo
        comboCount = 0;
      }
      updateUi();
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
          effectTargets = getFullLine(effect.direction, effect.matchedCells[0]);
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

    score += totalScoreGain;
    console.log('total score', score);
    updateUi();

    animateRemovals(destroyedCells, () => {
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
  deselectEgg();
  const toRemove = Array.from(removalSet).map((key) => {
    const [row, col] = key.split('-').map(Number);
    return { row, col, sprite: tileSprites[row] && tileSprites[row][col] ? tileSprites[row][col] : null };
  });

  if (toRemove.length === 0) {
    applyRemovals(removalSet);
    applyGravity(() => {
      refillBoard(() => {
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
          try { entry.sprite.destroy(); } catch (e) {}
          tileSprites[entry.row][entry.col] = null;
          done += 1;
          if (done === toRemove.length) {
            applyRemovals(removalSet);
            applyGravity(() => {
              refillBoard(() => {
                console.log('gravity and refill complete');
                if (onComplete) onComplete();
              });
            });
          }
        }
      });
    } else {
      done += 1;
      if (done === toRemove.length) {
        applyRemovals(removalSet);
        applyGravity(() => {
          refillBoard(() => {
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
    if (onComplete) onComplete();
    return;
  }

  let completed = 0;
  const total = tweens.length;
  tweens.forEach((t) => {
    const copy = Object.assign({}, t);
    const userOnComplete = copy.onComplete;
    copy.onComplete = () => {
      try { if (typeof userOnComplete === 'function') userOnComplete(); } catch (e) {}
      completed += 1;
      if (completed === total) {
        if (onComplete) onComplete();
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
    if (onComplete) onComplete();
    return;
  }

  let completed = 0;
  const total = tweens.length;
  tweens.forEach((t) => {
    const copy = Object.assign({}, t);
    const userOnComplete = copy.onComplete;
    copy.onComplete = () => {
      try { if (typeof userOnComplete === 'function') userOnComplete(); } catch (e) {}
      completed += 1;
      if (completed === total) {
        console.log('refill complete');
        resetBoardVisuals();
        if (onComplete) onComplete();
      }
    };
    gameInstance.tweens.add(copy);
  });
}

function moveSprites(onComplete) {
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
      try {
        if (typeof userOnComplete === 'function') userOnComplete();
      } catch (e) {
        // ignore
      }
      completed += 1;
      if (completed === total) {
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
}

function startTimer() {
  if (countdownEvent) {
    countdownEvent.remove(false);
  }
  timer = TIMER_SECONDS;
  countdownEvent = gameInstance.time.addEvent({
    delay: 1000,
    callback: () => {
      if (timer <= 0) {
        return;
      }
      timer -= 1;
      updateUi();
      if (timer === 0) {
        endGame();
      }
    },
    loop: true,
  });
}

function endGame() {
  finalScoreText.textContent = score;
  gameOverOverlay.classList.remove('hidden');
  isAnimating = true;
}

function resetGame() {
  gameOverOverlay.classList.add('hidden');
  score = 0;
  comboCount = 0;
  isAnimating = false;
  clearBoardSprites();
  initializeBoard();
  createBoardSprites();
  startTimer();
  updateUi();
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
