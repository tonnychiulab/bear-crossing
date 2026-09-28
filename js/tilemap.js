/**
 * 🐻 台灣黑熊過街 — 地圖與 4 大主題場景模組 (Tilemap)
 */
window.BearTilemap = (function() {
  'use strict';

  const GAME_W = 700;
  const GAME_H = 550;
  const LANE_H = 50;
  const NUM_LANES = 11;
  const HOME_CX = [70, 210, 350, 490, 630]; // 5 個終點安全插槽

  // 車道類型常數
  const TYPE = {
    GOAL: 'goal',
    WATER: 'water',
    SAFE: 'safe',
    ROAD: 'road',
    START: 'start'
  };

  // 4 大主題場景定義
  const THEMES = [
    {
      id: 'urban',
      name: '市區道路 (Urban Street)',
      subtitle: '車水馬龍的台北街頭，小心紅綠燈與機車瀑布！',
      bgColor: '#18181b',
      roadTile: 'tile_road',
      safeTile: 'tile_grass',
      waterTile: 'tile_water',
      lanes: [
        /* 0  */ { type: TYPE.GOAL },
        /* 1  */ { type: TYPE.WATER, dir: 1,  speed: 1.1, w: 64, gap: 170, sprite: 'obs_log' },
        /* 2  */ { type: TYPE.WATER, dir:-1,  speed: 1.4, w: 32, gap: 150, sprite: 'obs_turtle', canDive: false },
        /* 3  */ { type: TYPE.WATER, dir: 1,  speed: 1.8, w: 96, gap: 200, sprite: 'obs_log' },
        /* 4  */ { type: TYPE.SAFE },
        /* 5  */ { type: TYPE.ROAD,  dir:-1,  speed: 2.2, w: 32, gap: 140, sprite: 'obs_scooter' },
        /* 6  */ { type: TYPE.ROAD,  dir: 1,  speed: 1.2, w: 48, gap: 180, sprite: 'obs_taxi' },
        /* 7  */ { type: TYPE.ROAD,  dir:-1,  speed: 1.6, w: 36, gap: 160, sprite: 'obs_car', hasTrafficLight: true },
        /* 8  */ { type: TYPE.ROAD,  dir: 1,  speed: 1.0, w: 64, gap: 230, sprite: 'obs_bus' },
        /* 9  */ { type: TYPE.ROAD,  dir:-1,  speed: 1.8, w: 48, gap: 190, sprite: 'obs_taxi' },
        /* 10 */ { type: TYPE.START }
      ]
    },
    {
      id: 'highway',
      name: '高速公路 (Highway Express)',
      subtitle: '車速極快的高速國道，抓準間距一鼓作氣！',
      bgColor: '#09090b',
      roadTile: 'tile_road',
      safeTile: 'tile_grass',
      waterTile: 'tile_water',
      lanes: [
        /* 0  */ { type: TYPE.GOAL },
        /* 1  */ { type: TYPE.WATER, dir:-1,  speed: 1.5, w: 64, gap: 160, sprite: 'obs_log' },
        /* 2  */ { type: TYPE.WATER, dir: 1,  speed: 1.8, w: 32, gap: 140, sprite: 'obs_turtle', canDive: true },
        /* 3  */ { type: TYPE.WATER, dir:-1,  speed: 2.0, w: 64, gap: 190, sprite: 'obs_log' },
        /* 4  */ { type: TYPE.SAFE },
        /* 5  */ { type: TYPE.ROAD,  dir: 1,  speed: 2.8, w: 36, gap: 220, sprite: 'obs_car' },
        /* 6  */ { type: TYPE.ROAD,  dir:-1,  speed: 2.6, w: 48, gap: 210, sprite: 'obs_taxi' },
        /* 7  */ { type: TYPE.ROAD,  dir: 1,  speed: 2.0, w: 64, gap: 260, sprite: 'obs_bus' },
        /* 8  */ { type: TYPE.ROAD,  dir:-1,  speed: 3.2, w: 36, gap: 240, sprite: 'obs_car' },
        /* 9  */ { type: TYPE.ROAD,  dir: 1,  speed: 2.2, w: 64, gap: 230, sprite: 'obs_bus' },
        /* 10 */ { type: TYPE.START }
      ]
    },
    {
      id: 'mountain',
      name: '山區道路 (Mountain Trail)',
      subtitle: '蜿蜒的中橫山路，穿梭著垃圾車與落石碎道！',
      bgColor: '#451a03',
      roadTile: 'tile_dirt',
      safeTile: 'tile_grass',
      waterTile: 'tile_water',
      lanes: [
        /* 0  */ { type: TYPE.GOAL },
        /* 1  */ { type: TYPE.WATER, dir: 1,  speed: 1.3, w: 64, gap: 180, sprite: 'obs_log' },
        /* 2  */ { type: TYPE.WATER, dir:-1,  speed: 1.6, w: 32, gap: 150, sprite: 'obs_turtle', canDive: true },
        /* 3  */ { type: TYPE.WATER, dir: 1,  speed: 2.1, w: 64, gap: 170, sprite: 'obs_log' },
        /* 4  */ { type: TYPE.SAFE },
        /* 5  */ { type: TYPE.ROAD,  dir:-1,  speed: 1.7, w: 54, gap: 200, sprite: 'obs_truck' },
        /* 6  */ { type: TYPE.ROAD,  dir: 1,  speed: 2.3, w: 32, gap: 150, sprite: 'obs_scooter' },
        /* 7  */ { type: TYPE.ROAD,  dir:-1,  speed: 1.5, w: 54, gap: 210, sprite: 'obs_truck' },
        /* 8  */ { type: TYPE.ROAD,  dir: 1,  speed: 2.4, w: 36, gap: 180, sprite: 'obs_car' },
        /* 9  */ { type: TYPE.ROAD,  dir:-1,  speed: 2.0, w: 54, gap: 190, sprite: 'obs_truck' },
        /* 10 */ { type: TYPE.START }
      ]
    },
    {
      id: 'rapids',
      name: '秀姑巒溪 (River Rapids)',
      subtitle: '激流湍急的東台灣大河，烏龜定時潛水考驗跳躍時機！',
      bgColor: '#075985',
      roadTile: 'tile_road',
      safeTile: 'tile_grass',
      waterTile: 'tile_water',
      lanes: [
        /* 0  */ { type: TYPE.GOAL },
        /* 1  */ { type: TYPE.WATER, dir:-1,  speed: 2.0, w: 64, gap: 170, sprite: 'obs_log' },
        /* 2  */ { type: TYPE.WATER, dir: 1,  speed: 1.7, w: 32, gap: 130, sprite: 'obs_turtle', canDive: true },
        /* 3  */ { type: TYPE.WATER, dir:-1,  speed: 2.5, w: 64, gap: 180, sprite: 'obs_log' },
        /* 4  */ { type: TYPE.SAFE },
        /* 5  */ { type: TYPE.ROAD,  dir: 1,  speed: 2.0, w: 36, gap: 160, sprite: 'obs_car' },
        /* 6  */ { type: TYPE.ROAD,  dir:-1,  speed: 2.6, w: 32, gap: 140, sprite: 'obs_scooter' },
        /* 7  */ { type: TYPE.ROAD,  dir: 1,  speed: 1.8, w: 48, gap: 170, sprite: 'obs_taxi' },
        /* 8  */ { type: TYPE.ROAD,  dir:-1,  speed: 2.4, w: 36, gap: 180, sprite: 'obs_car' },
        /* 9  */ { type: TYPE.ROAD,  dir: 1,  speed: 2.2, w: 64, gap: 200, sprite: 'obs_bus' },
        /* 10 */ { type: TYPE.START }
      ]
    }
  ];

  // 取得主題設定（第 level 關，1-based）
  function getTheme(level) {
    const idx = (level - 1) % THEMES.length;
    return THEMES[idx];
  }

  // 繪製地圖瓦片至 Canvas
  function drawMap(ctx, level, goalHomes, trafficLightState) {
    const theme = getTheme(level);

    // 逐車道（共 11 列，每列 50px）繪製瓦片底圖
    for (let laneIdx = 0; laneIdx < NUM_LANES; laneIdx++) {
      const y = laneIdx * LANE_H;
      const laneDef = theme.lanes[laneIdx];
      let tileKey = theme.roadTile;

      if (laneDef.type === TYPE.GOAL || laneDef.type === TYPE.SAFE || laneDef.type === TYPE.START) {
        tileKey = theme.safeTile;
      } else if (laneDef.type === TYPE.WATER) {
        tileKey = theme.waterTile;
      }

      const tileSprite = window.BearSprites.get(tileKey);

      // 以 32px 瓦片橫向拼滿 700px
      for (let x = 0; x < GAME_W; x += 32) {
        if (tileSprite) {
          ctx.drawImage(tileSprite, x, y, 32, LANE_H);
        } else {
          ctx.fillStyle = theme.bgColor;
          ctx.fillRect(x, y, 32, LANE_H);
        }
      }

      // 車道裝飾細節
      if (laneDef.type === TYPE.ROAD) {
        // 車道中央黃色虛線
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.setLineDash([20, 20]);
        ctx.beginPath();
        ctx.moveTo(0, y + LANE_H - 1);
        ctx.lineTo(GAME_W, y + LANE_H - 1);
        ctx.stroke();
        ctx.setLineDash([]);

        // 若車道有紅綠燈，在車道左側繪製信號燈
        if (laneDef.hasTrafficLight) {
          const isRed = trafficLightState && trafficLightState.isRed;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(6, y + 8, 14, 34);
          ctx.fillStyle = isRed ? '#ef4444' : '#334155';
          ctx.beginPath();
          ctx.arc(13, y + 18, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = !isRed ? '#22c55e' : '#334155';
          ctx.beginPath();
          ctx.arc(13, y + 32, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 安全區綠意文字點綴
      if (laneDef.type === TYPE.SAFE || laneDef.type === TYPE.START) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.font = '14px "Segoe UI", sans-serif';
        for (let tx = 20; tx < GAME_W; tx += 64) {
          ctx.fillText('🌿', tx, y + 32);
        }
      }
    }

    // 繪製頂部 5 個終點安全插槽 (Goal Homes)
    for (let i = 0; i < HOME_CX.length; i++) {
      const cx = HOME_CX[i];
      const isFilled = goalHomes && goalHomes[i] && goalHomes[i].filled;

      ctx.fillStyle = isFilled ? 'rgba(34, 197, 94, 0.4)' : 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = isFilled ? '#4ade80' : '#334155';
      ctx.lineWidth = 3;

      // 圓角矩形家園
      ctx.beginPath();
      ctx.roundRect(cx - 32, 6, 64, 38, 8);
      ctx.fill();
      ctx.stroke();

      if (isFilled) {
        // 已填滿：繪製可愛黑熊頭像
        const bearSprite = window.BearSprites.get('bear_idle');
        if (bearSprite) {
          ctx.drawImage(bearSprite, cx - 16, 9, 32, 32);
        }
      } else {
        // 未填滿：顯示竹林標誌
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎋', cx, 32);
      }
    }
  }

  return {
    GAME_W: GAME_W,
    GAME_H: GAME_H,
    LANE_H: LANE_H,
    NUM_LANES: NUM_LANES,
    HOME_CX: HOME_CX,
    TYPE: TYPE,
    THEMES: THEMES,
    getTheme: getTheme,
    drawMap: drawMap
  };
})();
