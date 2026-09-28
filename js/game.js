/**
 * 🐻 台灣黑熊過街 — 主遊戲迴圈、狀態機與控制整合模組 (Game Loop)
 */
(function() {
  'use strict';

  // DOM 元素引用
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const canvasContainer = document.getElementById('canvas-container');
  const livesEl = document.getElementById('lives-display');
  const scoreEl = document.getElementById('score-display');
  const levelEl = document.getElementById('level-display');
  const highscoreEl = document.getElementById('highscore-display');
  const muteBtn = document.getElementById('mute-btn');

  const startScreen = document.getElementById('start-screen');
  const winScreen = document.getElementById('win-screen');
  const gameoverScreen = document.getElementById('gameover-screen');
  const startBtn = document.getElementById('start-btn');
  const nextLevelBtn = document.getElementById('next-level-btn');
  const restartBtn = document.getElementById('restart-btn');
  const shareBtn = document.getElementById('share-btn');
  const copyToast = document.getElementById('copy-toast');
  const previewCanvas = document.getElementById('preview-bear-canvas');

  // 繪製開始畫面的預覽黑熊
  if (previewCanvas) {
    const pCtx = previewCanvas.getContext('2d');
    pCtx.imageSmoothingEnabled = false;
    setTimeout(() => {
      const bear = window.BearSprites.get('bear_idle');
      if (bear) {
        pCtx.drawImage(bear, 0, 0, 64, 64);
      }
    }, 100);
  }

  // 遊戲狀態物件
  const state = {
    running: false,
    player: new window.BearEntities.Player(),
    vehicles: [],
    riverEntities: [],
    items: [],
    goalHomes: [],
    level: 1,
    score: 0,
    lives: 3,
    highestRow: 10,
    speedMul: 1.0,
    trafficLight: { timer: 0, isRed: false },
    lastTimestamp: 0,
    animId: null
  };

  // 初始化與關卡生成
  function init() {
    loadHighScore();
    setupEventListeners();
  }

  function loadHighScore() {
    const hs = localStorage.getItem('bearCrossing_hs') || '0';
    highscoreEl.textContent = hs;
  }

  function saveHighScore() {
    const hs = parseInt(localStorage.getItem('bearCrossing_hs') || '0', 10);
    if (state.score > hs) {
      localStorage.setItem('bearCrossing_hs', state.score.toString());
      highscoreEl.textContent = state.score;
      return true;
    }
    return false;
  }

  function startLevel(levelNum) {
    state.level = levelNum;
    // 計算速度倍率（每輪 4 關，通關一輪加成 15%）
    const loop = Math.floor((levelNum - 1) / 4);
    const themeIdx = (levelNum - 1) % 4;
    state.speedMul = (1.0 + loop * 0.15) * (1.0 + themeIdx * 0.08);

    const theme = window.BearTilemap.getTheme(levelNum);

    // 初始化 5 個終點安全插槽
    state.goalHomes = window.BearTilemap.HOME_CX.map(cx => ({ cx: cx, filled: false }));

    // 初始化車輛與水上實體
    state.vehicles = [];
    state.riverEntities = [];
    state.items = [];

    theme.lanes.forEach((laneDef, laneIdx) => {
      if (laneDef.type === window.BearTilemap.TYPE.ROAD) {
        const unit = laneDef.w + laneDef.gap;
        const count = Math.ceil(window.BearTilemap.GAME_W / unit) + 2;
        for (let j = 0; j < count; j++) {
          const x = j * unit;
          state.vehicles.push(new window.BearEntities.Vehicle(
            laneIdx, x, laneDef.w, laneDef.speed, laneDef.dir, laneDef.sprite, laneDef.hasTrafficLight
          ));
        }
      } else if (laneDef.type === window.BearTilemap.TYPE.WATER) {
        const unit = laneDef.w + laneDef.gap;
        const count = Math.ceil(window.BearTilemap.GAME_W / unit) + 2;
        for (let j = 0; j < count; j++) {
          const x = j * unit;
          state.riverEntities.push(new window.BearEntities.RiverEntity(
            laneIdx, x, laneDef.w, laneDef.speed, laneDef.dir, laneDef.sprite, laneDef.canDive
          ));
        }
      }
    });

    // 隨機在安全行（Row 4）生成道具
    const itemType = Math.random() > 0.5 ? 'bamboo' : 'honey';
    const itemX = 80 + Math.floor(Math.random() * 8) * 64;
    state.items.push(new window.BearEntities.ItemPickup(itemType, 4, itemX));

    // 重置黑熊
    state.player.reset();
    state.highestRow = 10;
    updateHUD();

    // 啟動關卡 BGM
    window.BearAudio.startBgm(theme.id);
  }

  function startGame() {
    window.BearAudio.ensureContext();
    state.lives = 3;
    state.score = 0;
    startLevel(1);

    startScreen.classList.add('hidden');
    winScreen.classList.add('hidden');
    gameoverScreen.classList.add('hidden');

    state.running = true;
    state.lastTimestamp = performance.now();
    if (state.animId) cancelAnimationFrame(state.animId);
    state.animId = requestAnimationFrame(gameLoop);
  }

  function nextLevel() {
    winScreen.classList.add('hidden');
    startLevel(state.level + 1);
    state.running = true;
    state.lastTimestamp = performance.now();
    state.animId = requestAnimationFrame(gameLoop);
  }

  function levelComplete() {
    state.running = false;
    if (state.animId) cancelAnimationFrame(state.animId);
    window.BearAudio.stopBgm();
    window.BearAudio.playWin();

    state.score += 1000;
    updateHUD();

    document.getElementById('cleared-level').textContent = state.level;
    document.getElementById('win-score').textContent = state.score;
    winScreen.classList.remove('hidden');
  }

  function gameOver() {
    state.running = false;
    if (state.animId) cancelAnimationFrame(state.animId);
    window.BearAudio.stopBgm();

    const isNewHigh = saveHighScore();
    document.getElementById('final-score').textContent = state.score;
    const badge = document.getElementById('new-highscore-badge');
    badge.style.display = isNewHigh ? 'block' : 'none';
    gameoverScreen.classList.remove('hidden');
  }

  function handleBearDie() {
    if (state.player.isDying) return;
    state.player.isDying = true;
    canvasContainer.classList.add('shake');

    state.lives--;
    updateHUD();

    setTimeout(() => {
      canvasContainer.classList.remove('shake');
      if (state.lives <= 0) {
        gameOver();
      } else {
        state.player.reset();
        state.highestRow = 10;
      }
    }, 700);
  }

  // 玩家移動與得分
  function movePlayer(dx, dy) {
    if (!state.running || state.player.isDying) return;
    const moved = state.player.move(dx, dy);
    if (moved) {
      window.BearAudio.playJump();
      if (state.player.laneIdx < state.highestRow) {
        state.score += 10;
        state.highestRow = state.player.laneIdx;
        updateHUD();
      }
    }
  }

  // ===== 主遊戲迴圈 =====
  function gameLoop(timestamp) {
    if (!state.running) return;

    const delta = Math.min((timestamp - state.lastTimestamp) / 1000, 0.1);
    state.lastTimestamp = timestamp;

    update(delta);
    render();

    state.animId = requestAnimationFrame(gameLoop);
  }

  function update(delta) {
    // 紅綠燈定時器（5 秒綠燈，2.5 秒紅燈）
    state.trafficLight.timer = (state.trafficLight.timer + delta) % 7.5;
    state.trafficLight.isRed = state.trafficLight.timer > 5.0;

    // 更新黑熊
    state.player.update(delta);

    // 更新車輛
    for (const v of state.vehicles) {
      v.update(delta, state.speedMul, state.trafficLight.isRed);
    }

    // 更新水上載具
    for (const r of state.riverEntities) {
      r.update(delta, state.speedMul);
    }

    // 更新道具
    for (const item of state.items) {
      item.update(delta);
      if (item.checkOverlap(state.player)) {
        item.active = false;
        window.BearAudio.playPickup();
        if (item.type === 'bamboo') {
          state.player.speedBoostTimer = 6.0; // 加速 6 秒
          state.score += 50;
        } else if (item.type === 'honey') {
          state.player.hasShield = true; // 護盾抵擋 1 次傷害
          state.score += 100;
        }
        updateHUD();
      }
    }

    // 碰撞與渡河檢測（黑熊存活時）
    if (!state.player.isDying) {
      const theme = window.BearTilemap.getTheme(state.level);
      const currentLane = theme.lanes[state.player.laneIdx];

      // 1. 車道碰撞檢測
      if (currentLane.type === window.BearTilemap.TYPE.ROAD) {
        for (const v of state.vehicles) {
          if (v.laneIdx === state.player.laneIdx && v.checkCollision(state.player)) {
            if (state.player.hasShield) {
              // 護盾吸收碰撞
              state.player.hasShield = false;
              window.BearAudio.playShieldBreak();
            } else {
              window.BearAudio.playCrash();
              handleBearDie();
              return;
            }
          }
        }
      }

      // 2. 水域乘載與溺水檢測
      if (currentLane.type === window.BearTilemap.TYPE.WATER) {
        let isCarried = false;
        for (const r of state.riverEntities) {
          if (r.isCarrying(state.player)) {
            // 跟隨浮木/烏龜水平平移
            state.player.x += r.speed * state.speedMul * r.dir * 60 * delta;
            isCarried = true;
            break;
          }
        }

        // 漂出畫面邊界或落水
        if (state.player.x < -10 || state.player.x + state.player.w > window.BearTilemap.GAME_W + 10) {
          window.BearAudio.playSplash();
          handleBearDie();
          return;
        }

        if (!isCarried) {
          if (state.player.hasShield) {
            state.player.hasShield = false;
            window.BearAudio.playShieldBreak();
            // 被水推回起點安全行
            state.player.laneIdx = 4;
            state.player.y = 4 * window.BearTilemap.LANE_H + 9;
          } else {
            window.BearAudio.playSplash();
            handleBearDie();
            return;
          }
        }
      }

      // 3. 抵達終點家園檢測
      if (currentLane.type === window.BearTilemap.TYPE.GOAL) {
        const bearCX = state.player.x + state.player.w / 2;
        let reachedHome = false;

        for (const home of state.goalHomes) {
          if (!home.filled && Math.abs(bearCX - home.cx) < 28) {
            home.filled = true;
            reachedHome = true;
            state.score += 250;
            window.BearAudio.playPickup();
            updateHUD();
            state.player.reset();
            state.highestRow = 10;

            // 檢查是否全部 5 個家園皆填滿
            if (state.goalHomes.every(h => h.filled)) {
              levelComplete();
            }
            return;
          }
        }

        // 沒進入插槽，撞上竹林邊界
        if (!reachedHome) {
          window.BearAudio.playCrash();
          handleBearDie();
        }
      }
    }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. 繪製瓦片地圖、終點插槽與紅綠燈
    window.BearTilemap.drawMap(ctx, state.level, state.goalHomes, state.trafficLight);

    // 2. 繪製水上載具
    for (const r of state.riverEntities) {
      r.draw(ctx);
    }

    // 3. 繪製道具
    for (const item of state.items) {
      item.draw(ctx);
    }

    // 4. 繪製玩家黑熊
    state.player.draw(ctx);

    // 5. 繪製車輛
    for (const v of state.vehicles) {
      v.draw(ctx);
    }
  }

  function updateHUD() {
    livesEl.textContent = '❤️'.repeat(Math.max(0, state.lives)) +
                          '🖤'.repeat(Math.max(0, 3 - state.lives));
    scoreEl.textContent = state.score;
    levelEl.textContent = state.level;
    const hs = parseInt(localStorage.getItem('bearCrossing_hs') || '0', 10);
    highscoreEl.textContent = Math.max(hs, state.score);
  }

  // 社交戰績分享
  function copyShareScore() {
    const theme = window.BearTilemap.getTheme(state.level);
    const shareText = `🐻 我在《台灣黑熊過街》闖到第 ${state.level} 關【${theme.name}】！得分 ${state.score} 分 🎋 快來避開機車與湍急溪流挑戰我！ https://github.com`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        showToast();
      }).catch(() => {
        fallbackCopy(shareText);
      });
    } else {
      fallbackCopy(shareText);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast();
    } catch(e) {}
    document.body.removeChild(ta);
  }

  function showToast() {
    copyToast.style.display = 'block';
    setTimeout(() => {
      copyToast.style.display = 'none';
    }, 2500);
  }

  // 事件監聽設定
  function setupEventListeners() {
    // 鍵盤控制
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!startScreen.classList.contains('hidden')) {
          startGame();
        } else if (!gameoverScreen.classList.contains('hidden')) {
          startGame();
        } else if (!winScreen.classList.contains('hidden')) {
          nextLevel();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowUp':    case 'w': case 'W': movePlayer(0, -1); break;
        case 'ArrowDown':  case 's': case 'S': movePlayer(0, 1);  break;
        case 'ArrowLeft':  case 'a': case 'A': movePlayer(-1, 0); break;
        case 'ArrowRight': case 'd': case 'D': movePlayer(1, 0);  break;
      }
    });

    // 觸控滑動手勢
    let touchStartX = 0;
    let touchStartY = 0;
    canvas.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) < 20) return;

      if (absDx > absDy) {
        movePlayer(dx > 0 ? 1 : -1, 0);
      } else {
        movePlayer(0, dy > 0 ? 1 : -1);
      }
    }, { passive: true });

    // 手機端虛擬按鈕
    document.getElementById('btn-up').addEventListener('click', () => movePlayer(0, -1));
    document.getElementById('btn-down').addEventListener('click', () => movePlayer(0, 1));
    document.getElementById('btn-left').addEventListener('click', () => movePlayer(-1, 0));
    document.getElementById('btn-right').addEventListener('click', () => movePlayer(1, 0));

    // 按鈕點擊
    startBtn.addEventListener('click', startGame);
    nextLevelBtn.addEventListener('click', nextLevel);
    restartBtn.addEventListener('click', startGame);
    shareBtn.addEventListener('click', copyShareScore);

    // 靜音切換按鈕
    muteBtn.addEventListener('click', () => {
      const muted = window.BearAudio.toggleMute();
      muteBtn.textContent = muted ? '🔇' : '🔊';
    });
  }

  // 初始化遊戲
  init();
})();
