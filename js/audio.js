/**
 * 🐻 台灣黑熊過街 — Web Audio API 8-bit 程序合成音效與 Chiptune 音樂引擎 (Audio)
 */
window.BearAudio = (function() {
  'use strict';

  let ctx = null;
  let masterGain = null;
  let isMuted = false;
  let bgmTimer = null;
  let currentTheme = null;
  let noteIndex = 0;

  // 確保 AudioContext 初始化並解除瀏覽器自動播放限制
  function ensureContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();

      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : 0.25, ctx.currentTime);
      masterGain.connect(ctx.destination);
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  // 切換靜音
  function toggleMute() {
    isMuted = !isMuted;
    if (masterGain && ctx) {
      const target = isMuted ? 0 : 0.25;
      masterGain.gain.setTargetAtTime(target, ctx.currentTime, 0.05);
    }
    if (!isMuted && currentTheme && !bgmTimer) {
      playNextBgmNote();
    }
    return isMuted;
  }

  function getMuted() {
    return isMuted;
  }

  // ===== 1. 8-bit 音效庫 (Sound Effects) =====

  // 跳躍音效（快速上升方波）
  function playJump() {
    if (isMuted || !ensureContext()) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.08);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // 拾取道具音效（雙音階清脆叮噹聲）
  function playPickup() {
    if (isMuted || !ensureContext()) return;
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = t + idx * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.3, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.09);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.09);
    });
  }

  // 護盾破碎音效
  function playShieldBreak() {
    if (isMuted || !ensureContext()) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  // 車輛撞擊音效（噪聲與低頻衝擊）
  function playCrash() {
    if (isMuted || !ensureContext()) return;
    const t = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.linearRampToValueAtTime(80, t + 0.25);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    noise.start(t);
  }

  // 落水撲通聲
  function playSplash() {
    if (isMuted || !ensureContext()) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.22);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  // 過關號角（Fanfare）
  function playWin() {
    if (isMuted || !ensureContext()) return;
    const t = ctx.currentTime;
    const fanfareNotes = [261.63, 329.63, 392.00, 523.25];
    fanfareNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = t + idx * 0.12;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, noteTime);

      const dur = idx === fanfareNotes.length - 1 ? 0.35 : 0.1;
      gain.gain.setValueAtTime(0.25, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + dur);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + dur);
    });
  }

  // ===== 2. 8-bit Chiptune 背景音樂 =====
  // 簡短好記的 8 音符旋律庫
  const MELODIES = {
    urban: [
      { f: 261.63, d: 0.2 }, { f: 329.63, d: 0.2 }, { f: 392.00, d: 0.2 }, { f: 523.25, d: 0.4 },
      { f: 392.00, d: 0.2 }, { f: 329.63, d: 0.2 }, { f: 293.66, d: 0.2 }, { f: 261.63, d: 0.4 }
    ],
    highway: [
      { f: 329.63, d: 0.15 }, { f: 392.00, d: 0.15 }, { f: 493.88, d: 0.15 }, { f: 587.33, d: 0.15 },
      { f: 493.88, d: 0.15 }, { f: 392.00, d: 0.15 }, { f: 440.00, d: 0.15 }, { f: 329.63, d: 0.3 }
    ],
    mountain: [
      { f: 220.00, d: 0.22 }, { f: 261.63, d: 0.22 }, { f: 293.66, d: 0.22 }, { f: 349.23, d: 0.3 },
      { f: 329.63, d: 0.22 }, { f: 261.63, d: 0.22 }, { f: 196.00, d: 0.22 }, { f: 220.00, d: 0.4 }
    ],
    rapids: [
      { f: 293.66, d: 0.18 }, { f: 349.23, d: 0.18 }, { f: 440.00, d: 0.18 }, { f: 523.25, d: 0.25 },
      { f: 440.00, d: 0.18 }, { f: 349.23, d: 0.18 }, { f: 329.63, d: 0.18 }, { f: 293.66, d: 0.35 }
    ]
  };

  function playNextBgmNote() {
    if (!ctx || !currentTheme) return;
    const melody = MELODIES[currentTheme] || MELODIES.urban;
    const note = melody[noteIndex % melody.length];
    noteIndex++;

    if (!isMuted && masterGain) {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + note.d * 0.9);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(t);
      osc.stop(t + note.d);
    }

    bgmTimer = setTimeout(playNextBgmNote, note.d * 1000);
  }

  function startBgm(themeId) {
    stopBgm();
    currentTheme = themeId || 'urban';
    noteIndex = 0;
    ensureContext();
    playNextBgmNote();
  }

  function stopBgm() {
    if (bgmTimer) {
      clearTimeout(bgmTimer);
      bgmTimer = null;
    }
    currentTheme = null;
  }

  return {
    ensureContext: ensureContext,
    toggleMute: toggleMute,
    getMuted: getMuted,
    playJump: playJump,
    playPickup: playPickup,
    playShieldBreak: playShieldBreak,
    playCrash: playCrash,
    playSplash: playSplash,
    playWin: playWin,
    startBgm: startBgm,
    stopBgm: stopBgm
  };
})();
