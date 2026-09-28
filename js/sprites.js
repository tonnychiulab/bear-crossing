/**
 * 🐻 台灣黑熊過街 — Sprite 像素生成與快取池
 * 完全基於程式碼與 Palette-based String Matrix 生成 32x32 像素圖案
 */
window.BearSprites = (function() {
  'use strict';

  const cache = {};

  // 輔助函式：將字串矩陣轉成 Offscreen Canvas
  function createPixelCanvas(width, height, palette, rows) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    for (let y = 0; y < rows.length && y < height; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length && x < width; x++) {
        const char = row[x];
        const color = palette[char];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    return canvas;
  }

  // ===== 1. 台灣黑熊角色 (32x32) =====
  function buildBearSprites() {
    const bearPalette = {
      '.': null,              // 透明
      'K': '#111827',         // 外輪廓深黑
      'B': '#1f2937',         // 主體黑色毛皮
      'L': '#374151',         // 亮面黑毛光澤
      'W': '#ffffff',         // 純白（眼白、V 字胸斑）
      'C': '#f3f4f6',         // 淺灰白（V 字胸斑陰影）
      'N': '#78350f',         // 棕色鼻子
      'E': '#000000',         // 眼珠深黑
      'P': '#f472b6',         // 耳廓內粉紅
    };

    // 正面待機黑熊（清晰可見胸前招牌白色「V」字胸斑）
    const bearIdleDownRows = [
      "................................",
      ".....KKKK..............KKKK.....",
      "....KBBBBK............KBBBBK....",
      "...KBBPPBBK..........KBBPPBBK...",
      "...KBBPPBBK..........KBBPPBBK...",
      "....KBBBBK............KBBBBK....",
      ".....KKKK...KKKKKKKK...KKKK.....",
      "..........KKBBLLLLBBKK..........",
      "........KKBBLLLLLLLLBBKK........",
      ".......KBBLLLLLLLLLLLLBBK.......",
      "......KBBLWWWLLLLLLWWWLBBK......",
      "......KBLWEEWLLLLLLWEEWLBK......",
      "......KBLLWWWLLNNLLWWWLLBK......",
      "......KBLLLLLLNNNNLLLLLLBK......",
      ".......KBBLLLLLLLLLLLLBBK.......",
      "........KKBBLLLLLLLLBBKK........",
      ".......KKBBBBKKKKKKBBBBKK.......",
      "......KBBLLWBBBBBBBBWLLBBK......",
      ".....KBBLLWWKBBBBBBKWWLLBBK.....",
      ".....KBL..WWKBBBBBBKWW..LBK.....",
      ".....KBL...WWKBBBBKWW...LBK.....",
      ".....KBL....WWKBBKWW....LBK.....",
      "......KBL....WWKKWW....LBK......",
      "......KBB.....WWWW.....BBK......",
      ".......KBB.....WW.....BBK.......",
      "........KBBB........BBBK........",
      "........KBBBK......KBBBK........",
      ".......KBBBBK......KBBBBK.......",
      ".......KBBBBK......KBBBBK.......",
      "........KKKK........KKKK........",
      "................................",
      "................................"
    ];

    // 朝上移動黑熊（頂部俯視角，厚實圓耳與後背）
    const bearHopUpRows = [
      "................................",
      ".....KKKK..............KKKK.....",
      "....KBBBBK............KBBBBK....",
      "...KBBLLBBK..........KBBLLBBK...",
      "...KBBLLBBK..........KBBLLBBK...",
      "....KBBBBK............KBBBBK....",
      ".....KKKK...KKKKKKKK...KKKK.....",
      "..........KKBBLLLLBBKK..........",
      "........KKBBLLLLLLLLBBKK........",
      ".......KBBLLLLLLLLLLLLBBK.......",
      "......KBBLLLLLLLLLLLLLLBBK......",
      "......KBBLLLLLLLLLLLLLLBBK......",
      "......KBBLLLLLLLLLLLLLLBBK......",
      "......KBBLLLLLLLLLLLLLLBBK......",
      ".......KBBLLLLLLLLLLLLBBK.......",
      "........KKBBLLLLLLLLBBKK........",
      ".......KKBBBBKKKKKKBBBBKK.......",
      "......KBBLLBBBBBBBBBBLLBBK......",
      ".....KBBLLBBBBBBBBBBBBLLBBK.....",
      ".....KBL..KBBBBBBBBBBK..LBK.....",
      ".....KBL...KBBBBBBBBK...LBK.....",
      ".....KBL....KBBBBBBK....LBK.....",
      "......KBL....KKKKKK....LBK......",
      "......KBB..............BBK......",
      ".......KBB............BBK.......",
      "........KBBB........BBBK........",
      ".......KBBBBK......KBBBBK.......",
      "......KBBBBBK......KBBBBBK......",
      "......KBBBBBK......KBBBBBK......",
      ".......KKKKK........KKKKK.......",
      "................................",
      "................................"
    ];

    // 受擊或死亡旋轉黑熊（暈眩眼 X_X）
    const bearDeadRows = [
      "................................",
      ".....KKKK..............KKKK.....",
      "....KBBBBK............KBBBBK....",
      "...KBBPPBBK..........KBBPPBBK...",
      "....KBBBBK............KBBBBK....",
      ".....KKKK...KKKKKKKK...KKKK.....",
      "..........KKBBLLLLBBKK..........",
      "........KKBBLLLLLLLLBBKK........",
      ".......KBBLLLLLLLLLLLLBBK.......",
      "......KBBLW.WLLLLLLW.WLBBK......",
      "......KBL..W.LLLLLL.W..LBK......",
      "......KBBLW.WLLNNLLW.WLBBK......",
      "......KBLLLLLLNNNNLLLLLLBK......",
      ".......KBBLLLLWWWWLLLLBBK.......",
      "........KKBBLLLLLLLLBBKK........",
      ".......KKBBBBKKKKKKBBBBKK.......",
      "......KBBLLWBBBBBBBBWLLBBK......",
      ".....KBBLLWWKBBBBBBKWWLLBBK.....",
      ".....KBL...WWKBBBBKWW...LBK.....",
      "......KBL...WWKKKKWW...LBK......",
      ".......KBB....WWWW....BBK.......",
      "........KBBB...WW...BBBK........",
      ".......KBBBBK......KBBBBK.......",
      "........KKKK........KKKK........",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ];

    cache['bear_idle'] = createPixelCanvas(32, 32, bearPalette, bearIdleDownRows);
    cache['bear_hop'] = createPixelCanvas(32, 32, bearPalette, bearHopUpRows);
    cache['bear_dead'] = createPixelCanvas(32, 32, bearPalette, bearDeadRows);
  }

  // ===== 2. 台灣在地載具 (機車、計程車、公車、垃圾車) =====
  function buildVehicleSprites() {
    // 🛵 台灣經典速克達機車 (32x32)
    const motoPal = {
      '.': null,
      'K': '#0f172a',
      'B': '#3b82f6', // 藍色車殼
      'W': '#ffffff', // 白色面板
      'S': '#94a3b8', // 銀色把手與排氣管
      'T': '#1e293b', // 輪胎黑
      'R': '#ef4444', // 煞車尾燈
      'H': '#fef08a', // 大燈黃
      'P': '#fde047', // 騎士安全帽黃
    };
    const motoRows = [
      "................................",
      "................................",
      ".............KKKK...............",
      "............KPPPPK..............",
      "............KPPPPK..............",
      ".............KKKK...............",
      ".........S....KK....S...........",
      "..........S..KBBK..S............",
      "...........KKBBBBKK.............",
      "...........KBBWWBBK.............",
      "...........KBWWWWK..............",
      "...........KBBWWBBK.............",
      "...........KBBWWBBK.............",
      "..........KBBBBBBBBK............",
      "..........KBBBBBBBBK............",
      "..........KTTBBBBTTK............",
      ".........KTTTBBBBTTTK...........",
      ".........KTTTBBBBTTTK...........",
      "..........KTTBBBBTTK............",
      "..........KBBBBBBBBK............",
      "...........KBBRRBBK.............",
      "............KRRRRK..............",
      ".............KKKK...............",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ];
    cache['obs_scooter'] = createPixelCanvas(32, 32, motoPal, motoRows);

    // 🚕 台灣小黃計程車 (48x32)
    const taxiPal = {
      '.': null,
      'K': '#18181b',
      'Y': '#eab308', // 計程車黃
      'L': '#facc15', // 鮮明亮黃
      'G': '#38bdf8', // 車窗藍玻璃
      'R': '#ef4444', // 車頂紅藍燈 / 尾燈
      'B': '#2563eb', // 車頂燈藍
      'W': '#f8fafc', // 車頭大燈白
      'T': '#09090b', // 黑色輪胎
    };
    const taxiRows = [
      "................................................",
      "................................................",
      "....................KKRRBBKK....................",
      "...................KYYYYYYYYK...................",
      "..................KTTYYYYYYTTK..................",
      ".................KTTTYYYYYYTTTK.................",
      ".................KTTTYYYYYYTTTK.................",
      "..................KTTYYYYYYTTK..................",
      ".................KYYYYYYYYYYYYK.................",
      "................KYYYYYYYYYYYYYYK................",
      "...............KYYYYGGGGGGGGYYYYK...............",
      "..............KYYYGGGGGGGGGGGGYYYK..............",
      "..............KYYGGGGGGGGGGGGGGYYK..............",
      ".............KYYGGGGGGGGGGGGGGGGYYK.............",
      ".............KYYGGGGGGGGGGGGGGGGYYK.............",
      ".............KYYYYYYYYYYYYYYYYYYYYK.............",
      ".............KYYYYYYYYYYYYYYYYYYYYK.............",
      ".............KYYLLLLLLLLLLLLLLLLYYK.............",
      ".............KYYYYYYYYYYYYYYYYYYYYK.............",
      ".............KYYYYYYYYYYYYYYYYYYYYK.............",
      ".............KYYGGGGGGGGGGGGGGGGYYK.............",
      ".............KYYGGGGGGGGGGGGGGGGYYK.............",
      "..............KYYGGGGGGGGGGGGGGYYK..............",
      "..............KYYYGGGGGGGGGGGGYYYK..............",
      "...............KYYYYGGGGGGGGYYYYK...............",
      "................KYYYYYYYYYYYYYYK................",
      "..................KTTYYYYYYTTK..................",
      ".................KTTTYYYYYYTTTK.................",
      ".................KTTTYYYYYYTTTK.................",
      "..................KTTYYYYYYTTK..................",
      "...................KRRRRRRRRK...................",
      "....................KKKKKKKK...................."
    ];
    cache['obs_taxi'] = createPixelCanvas(48, 32, taxiPal, taxiRows);

    // 🚌 經典綠白市區公車 (64x32)
    const busPal = {
      '.': null,
      'K': '#0f172a',
      'W': '#f8fafc', // 白色車身
      'G': '#16a34a', // 綠色線條
      'S': '#0284c7', // 車窗藍玻璃
      'L': '#facc15', // 路線牌/大燈黃
      'T': '#020617', // 黑色大輪胎
      'R': '#dc2626', // 紅色尾燈
    };
    const busRows = [
      "................................................................",
      "....................KKKKKKKKKKKKKKKKKKKK........................",
      "...................KLLLLLLLLLLLLLLLLLLLLK.......................",
      "..................KWWWWWWWWWWWWWWWWWWWWWWK......................",
      ".................KTTWWWWWWWWWWWWWWWWWWWWTTK.....................",
      "................KTTTWWWWWWWWWWWWWWWWWWWWTTTK....................",
      "................KTTTWWWWWWWWWWWWWWWWWWWWTTTK....................",
      ".................KTTWWWWWWWWWWWWWWWWWWWWTTK.....................",
      "................KWWWWWWWWWWWWWWWWWWWWWWWWWWK....................",
      "...............KSSSSSSSSSSSSSSSSSSSSSSSSSSSSK...................",
      "..............KSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSK..................",
      "..............KSSWWWWWWWWWWWWWWWWWWWWWWWWWWSSK..................",
      ".............KSSWSSSSWSSSSWSSSSWSSSSWSSSSWSWWSSK................",
      ".............KSSWSSSSWSSSSWSSSSWSSSSWSSSSWSWWSSK................",
      ".............KSSWSSSSWSSSSWSSSSWSSSSWSSSSWSWWSSK................",
      ".............KWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWK.................",
      ".............KGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGK.................",
      ".............KGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGK.................",
      ".............KWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWK.................",
      ".............KSSWSSSSWSSSSWSSSSWSSSSWSSSSWSWWSSK................",
      ".............KSSWSSSSWSSSSWSSSSWSSSSWSSSSWSWWSSK................",
      ".............KSSWSSSSWSSSSWSSSSWSSSSWSSSSWSWWSSK................",
      "..............KSSWWWWWWWWWWWWWWWWWWWWWWWWWWSSK..................",
      "..............KSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSK..................",
      "...............KSSSSSSSSSSSSSSSSSSSSSSSSSSSSK...................",
      "................KWWWWWWWWWWWWWWWWWWWWWWWWWWK....................",
      ".................KTTWWWWWWWWWWWWWWWWWWWWTTK.....................",
      "................KTTTWWWWWWWWWWWWWWWWWWWWTTTK....................",
      "................KTTTWWWWWWWWWWWWWWWWWWWWTTTK....................",
      ".................KTTWWWWWWWWWWWWWWWWWWWWTTK.....................",
      "..................KRRRRRRRRRRRRRRRRRRRRRRK......................",
      "...................KKKKKKKKKKKKKKKKKKKKKK......................."
    ];
    cache['obs_bus'] = createPixelCanvas(64, 32, busPal, busRows);

    // 🚛 台灣經典黃藍垃圾車 (54x32)
    const truckPal = {
      '.': null,
      'K': '#18181b',
      'Y': '#facc15', // 車頭明黃
      'B': '#1d4ed8', // 後斗深藍
      'S': '#60a5fa', // 車窗藍玻璃
      'M': '#64748b', // 機械金屬灰
      'T': '#09090b', // 黑色輪胎
      'R': '#ef4444', // 紅色警示燈
    };
    const truckRows = [
      "......................................................",
      ".....................KKKKRRKKKK.......................",
      "....................KYYYYYYYYYYK......................",
      "...................KYYYYYYYYYYYYK.....................",
      "..................KTTYYYYYYYYYYTTK....................",
      ".................KTTTYYYYYYYYYYTTTK...................",
      ".................KTTTYYYYYYYYYYTTTK...................",
      "..................KTTYYYYYYYYYYTTK....................",
      ".................KYYYYYYYYYYYYYYYYK...................",
      "................KYYSSSSSSSSSSSSSSYYK..................",
      "...............KYYSSSSSSSSSSSSSSSSYYK.................",
      "...............KYYSSSSSSSSSSSSSSSSYYK.................",
      "..............KYYSSSSSSSSSSSSSSSSSSYYK................",
      "..............KYYYYYYYYYYYYYYYYYYYYYYK................",
      "..............KMMMMMMMMMMMMMMMMMMMMMMK................",
      "..............KBBBBBBBBBBBBBBBBBBBBBBK................",
      "..............KBBBBBBBBBBBBBBBBBBBBBBK................",
      "..............KBBBBBBBBBBBBBBBBBBBBBBK................",
      "..............KBBBBBBBBBBBBBBBBBBBBBBK................",
      "..............KBBBBBBBBBBBBBBBBBBBBBBK................",
      "..............KBBBBBBBBBBBBBBBBBBBBBBK................",
      "..............KBBBBBBBBBBBBBBBBBBBBBBK................",
      "..............KMMMMMMMMMMMMMMMMMMMMMMK................",
      "...............KMMMMMMMMMMMMMMMMMMMMK.................",
      "................KMMMMMMMMMMMMMMMMMMK..................",
      ".................KTTBBBBBBBBBBBBTTK...................",
      "................KTTTBBBBBBBBBBBBTTTK..................",
      "................KTTTBBBBBBBBBBBBTTTK..................",
      ".................KTTBBBBBBBBBBBBTTK...................",
      "..................KRRRRRRRRRRRRRRK....................",
      "...................KKKKKKKKKKKKKK.....................",
      "......................................................"
    ];
    cache['obs_truck'] = createPixelCanvas(54, 32, truckPal, truckRows);

    // 🚗 紅色一般私家車 (36x32)
    const carPal = {
      '.': null,
      'K': '#18181b',
      'R': '#dc2626', // 經典紅
      'L': '#f87171', // 亮紅
      'G': '#38bdf8', // 車窗藍玻璃
      'W': '#ffffff', // 大燈白
      'T': '#09090b', // 黑色輪胎
    };
    const carRows = [
      "....................................",
      "....................................",
      "...............KKKKKKKK.............",
      "..............KRRRRRRRRK............",
      ".............KTTRRRRRRTTK...........",
      "............KTTTRRRRRRTTTK..........",
      "............KTTTRRRRRRTTTK..........",
      ".............KTTRRRRRRTTK...........",
      "............KRRRRRRRRRRRRK..........",
      "...........KRRGGGGGGGGGGRRK.........",
      "..........KRRGGGGGGGGGGGGRRK........",
      "..........KRRGGGGGGGGGGGGRRK........",
      ".........KRGGGGGGGGGGGGGGGGRK.......",
      ".........KRRRRRRRRRRRRRRRRRRK.......",
      ".........KRLLLLLLLLLLLLLLLLRK.......",
      ".........KRRRRRRRRRRRRRRRRRRK.......",
      ".........KRGGGGGGGGGGGGGGGGRK.......",
      "..........KRRGGGGGGGGGGGGRRK........",
      "..........KRRGGGGGGGGGGGGRRK........",
      "...........KRRGGGGGGGGGGRRK.........",
      "............KRRRRRRRRRRRRK..........",
      ".............KTTRRRRRRTTK...........",
      "............KTTTRRRRRRTTTK..........",
      "............KTTTRRRRRRTTTK..........",
      ".............KTTRRRRRRTTK...........",
      "..............KRRRRRRRRK............",
      "...............KKKKKKKK.............",
      "....................................",
      "....................................",
      "....................................",
      "....................................",
      "...................................."
    ];
    cache['obs_car'] = createPixelCanvas(36, 32, carPal, carRows);
  }

  // ===== 3. 水上浮木與烏龜 (32x32 / 64x32) =====
  function buildWaterSprites() {
    // 🪵 浮木瓦片 (64x32)
    const logPal = {
      '.': null,
      'D': '#451a03', // 深木紋外框
      'M': '#78350f', // 主體深木褐
      'L': '#b45309', // 亮木紋
      'Y': '#d97706', // 年輪淺色
    };
    const logRows = [
      "................................................................",
      ".....DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD.....",
      "...DDMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMDD...",
      "..DMMLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLMMD..",
      ".DMLLYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYLLMD.",
      ".DMLYYMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMYYMLD.",
      "DMYYMDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDMDYYMD",
      "DMYMDMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMDMYMD",
      "DMYMDMLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLMDMYMD",
      "DMYMDMLYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYLMDMYMD",
      "DMYMDMLYMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMYLMDMYMD",
      "DMYMDMLYMDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDMYLMDMYMD",
      "DMYMDMLYMDMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMDMYLMDMYMD",
      "DMYMDMLYMDMLYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYMDMYLMDMYMD",
      "DMYMDMLYMDMLYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYMDMYLMDMYMD",
      "DMYMDMLYMDMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMDMYLMDMYMD",
      "DMYMDMLYMDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDMYLMDMYMD",
      "DMYMDMLYMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMYLMDMYMD",
      "DMYMDMLYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYLMDMYMD",
      "DMYMDMLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLMDMYMD",
      "DMYMDMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMDMYMD",
      "DMYYMDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDMDYYMD",
      ".DMLYYMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMYYMLD.",
      ".DMLLYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYLLMD.",
      "..DMMLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLMMD..",
      "...DDMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMDD...",
      ".....DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD.....",
      "................................................................",
      "................................................................",
      "................................................................",
      "................................................................",
      "................................................................"
    ];
    cache['obs_log'] = createPixelCanvas(64, 32, logPal, logRows);

    // 🐢 浮起烏龜 (32x32)
    const turtlePal = {
      '.': null,
      'K': '#064e3b',
      'G': '#059669', // 鮮綠龜背
      'L': '#34d399', // 龜殼花紋
      'Y': '#fef08a', // 斑紋
      'E': '#022c22', // 黑眼
    };
    const turtleRows = [
      "................................",
      "..........KKKK....KKKK..........",
      ".........KGGGGK..KGGGGK.........",
      ".........KGGGGK..KGGGGK.........",
      "..........KKKK....KKKK..........",
      ".............KKKK...............",
      "............KGGGGK..............",
      "...........KGGGGGGK.............",
      "...........KGEGGEGK.............",
      "............KGGGGK..............",
      "........KKKKKKKKKKKKKK..........",
      ".......KGGGGGGGGGGGGGGK.........",
      "......KGGLLLLGGGGLLLLGGK........",
      ".....KGGLLYYLLGGLLYYLLGGK.......",
      ".....KGGLYYYYLGGGLYYYYLGK.......",
      ".....KGGLLYYLLGGLLYYLLGGK.......",
      ".....KGGGGLLGGGGGGLLGGGGK.......",
      ".....KGGGGLLGGGGGGLLGGGGK.......",
      ".....KGGLLYYLLGGLLYYLLGGK.......",
      ".....KGGLYYYYLGGGLYYYYLGK.......",
      ".....KGGLLYYLLGGLLYYLLGGK.......",
      "......KGGLLLLGGGGLLLLGGK........",
      ".......KGGGGGGGGGGGGGGK.........",
      "........KKKKKKKKKKKKKK..........",
      "..........KKKK....KKKK..........",
      ".........KGGGGK..KGGGGK.........",
      ".........KGGGGK..KGGGGK.........",
      "..........KKKK....KKKK..........",
      "................................",
      "................................",
      "................................",
      "................................"
    ];
    cache['obs_turtle'] = createPixelCanvas(32, 32, turtlePal, turtleRows);

    // 🫧 潛水烏龜 (半透明冒泡水花)
    const divePal = {
      '.': null,
      'W': 'rgba(255,255,255,0.7)',
      'B': 'rgba(56,189,248,0.5)',
      'G': 'rgba(16,185,129,0.3)',
    };
    const diveRows = [
      "................................",
      ".........W....W.........W.......",
      "........WBW..WBW.......WBW......",
      ".........W....W.........W.......",
      "................................",
      "............GGGGGG..............",
      "..........GGGGGGGGGG............",
      "........GGGGGGGGGGGGGG..........",
      ".......GGGGGGGGGGGGGGGG.........",
      "......WGGGGGGGGGGGGGGGGW........",
      ".....WBWGGGGGGGGGGGGGGWBW.......",
      "......WGGGGGGGGGGGGGGGGW........",
      ".......GGGGGGGGGGGGGGGG.........",
      "........GGGGGGGGGGGGGG..........",
      "..........GGGGGGGGGG............",
      "............GGGGGG..............",
      "................................",
      ".........W....W.........W.......",
      "........WBW..WBW.......WBW......",
      ".........W....W.........W.......",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ];
    cache['obs_turtle_dive'] = createPixelCanvas(32, 32, divePal, diveRows);
  }

  // ===== 4. 道具 (竹筍、蜂蜜罐) =====
  function buildItemSprites() {
    // 🎋 綠色竹筍 (32x32)
    const bambooPal = {
      '.': null,
      'K': '#14532d',
      'G': '#22c55e',
      'L': '#86efac',
      'Y': '#fef08a',
      'D': '#15803d',
    };
    const bambooRows = [
      "................................",
      "...............KK...............",
      "..............KGK...............",
      ".............KLGGK..............",
      "............KLGGGGK.............",
      "............KLGGGGK.............",
      "...........KLGGGGGGK............",
      "..........KLGGGGGGGGK...........",
      "..........KLGGDDGGGGK...........",
      ".........KLGGDDDDGGGGK..........",
      "........KLGGDDDDDDGGGGK.........",
      "........KLGGDDDDDDGGGGK.........",
      ".......KLGGDDDDDDDDGGGGK........",
      "......KLGGDDDDDDDDDDGGGGK.......",
      "......KLGGDDDDDDDDDDGGGGK.......",
      ".....KLGGDDDDDDDDDDDDGGGGK......",
      "....KLGGDDDDDDDDDDDDDDGGGGK.....",
      "....KLGGDDDDDDDDDDDDDDGGGGK.....",
      "....KLGGDDDDDDDDDDDDDDGGGGK.....",
      ".....KKKKKKKKKKKKKKKKKKKKK......",
      "......KYYYYYYYYYYYYYYYYYK.......",
      ".......KKKKKKKKKKKKKKKKK........",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ];
    cache['item_bamboo'] = createPixelCanvas(32, 32, bambooPal, bambooRows);

    // 🍯 蜂蜜罐 (32x32)
    const honeyPal = {
      '.': null,
      'K': '#451a03',
      'Y': '#fbbf24', // 蜂蜜金黃
      'L': '#fef08a', // 反光亮黃
      'R': '#dc2626', // 罐口紅布標籤
      'G': '#78350f', // 陶罐褐
      'W': '#ffffff',
    };
    const honeyRows = [
      "................................",
      "............KKKKKKKK............",
      "...........KRRRRRRRRK...........",
      "..........KRRRRRRRRRRK..........",
      "...........KKKKKKKKKK...........",
      "..........KGGGGGGGGGGK..........",
      ".........KGGLLYYYYLLGGK.........",
      "........KGGLLYYYYYYLLGGK........",
      ".......KGGLLYYYYYYYYLLGGK.......",
      "......KGGLLYYYYYYYYYYLLGGK......",
      "......KGGLLYYWWWWYYLLGGGGK......",
      "......KGGLLYYWNNWYYLLGGGGK......",
      "......KGGLLYYWNNWYYLLGGGGK......",
      "......KGGLLYYWWWWYYLLGGGGK......",
      "......KGGLLYYYYYYYYYYLLGGK......",
      "......KGGLLYYYYYYYYYYLLGGK......",
      ".......KGGLLYYYYYYYYLLGGK.......",
      "........KGGLLYYYYYYLLGGK........",
      ".........KGGLLYYYYLLGGK.........",
      "..........KGGGGGGGGGGK..........",
      "...........KKKKKKKKKK...........",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................",
      "................................"
    ];
    cache['item_honey'] = createPixelCanvas(32, 32, honeyPal, honeyRows);
  }

  // ===== 5. 環境與地圖瓦片 (32x32) =====
  function buildTileSprites() {
    // 🌿 翠綠草地瓦片
    const grassPal = {
      '.': '#1e3a1e',
      'G': '#2e5a2e',
      'L': '#3d7a3d',
      'D': '#172e17',
    };
    const grassRows = [
      "GG.GG.DDGG.GG.DDGG.GG.DDGG.GG.DD",
      "GL.GL.DLGL.GL.DLGL.GL.DLGL.GL.DL",
      "GG.GG.DDGG.GG.DDGG.GG.DDGG.GG.DD",
      "..DD..GG..DD..GG..DD..GG..DD..GG",
      "GG.GG.DDGG.GG.DDGG.GG.DDGG.GG.DD",
      "GL.GL.DLGL.GL.DLGL.GL.DLGL.GL.DL",
      "GG.GG.DDGG.GG.DDGG.GG.DDGG.GG.DD",
      "..DD..GG..DD..GG..DD..GG..DD..GG",
      "GG.GG.DDGG.GG.DDGG.GG.DDGG.GG.DD",
      "GL.GL.DLGL.GL.DLGL.GL.DLGL.GL.DL",
      "GG.GG.DDGG.GG.DDGG.GG.DDGG.GG.DD",
      "..DD..GG..DD..GG..DD..GG..DD..GG",
      "GG.GG.DDGG.GG.DDGG.GG.DDGG.GG.DD",
      "GL.GL.DLGL.GL.DLGL.GL.DLGL.GL.DL",
      "GG.GG.DDGG.GG.DDGG.GG.DDGG.GG.DD",
      "..DD..GG..DD..GG..DD..GG..DD..GG",
      "GG.GG.DDGG.GG.DDGG.GG.DDGG.GG.DD",
      "GL.GL.DLGL.GL.DLGL.GL.DLGL.GL.DL",
      "GG.GG.DDGG.GG.DDGG.GG.DDGG.GG.DD",
      "..DD..GG..DD..GG..DD..GG..DD..GG",
      "GG.GG.DDGG.GG.DDGG.GG.DDGG.GG.DD",
      "GL.GL.DLGL.GL.DLGL.GL.DLGL.GL.DL",
      "GG.GG.DDGG.GG.DDGG.GG.DDGG.GG.DD",
      "..DD..GG..DD..GG..DD..GG..DD..GG",
      "GG.GG.DDGG.GG.DDGG.GG.DDGG.GG.DD",
      "GL.GL.DLGL.GL.DLGL.GL.DLGL.GL.DL",
      "GG.GG.DDGG.GG.DDGG.GG.DDGG.GG.DD",
      "..DD..GG..DD..GG..DD..GG..DD..GG",
      "GG.GG.DDGG.GG.DDGG.GG.DDGG.GG.DD",
      "GL.GL.DLGL.GL.DLGL.GL.DLGL.GL.DL",
      "GG.GG.DDGG.GG.DDGG.GG.DDGG.GG.DD",
      "..DD..GG..DD..GG..DD..GG..DD..GG"
    ];
    cache['tile_grass'] = createPixelCanvas(32, 32, grassPal, grassRows);

    // 🛣️ 柏油馬路瓦片
    const roadPal = {
      '.': '#27272a',
      'G': '#3f3f46',
      'D': '#18181b',
    };
    const roadRows = Array(32).fill("..GG..DD..GG..DD..GG..DD..GG..DD");
    cache['tile_road'] = createPixelCanvas(32, 32, roadPal, roadRows);

    // 🌊 河流瓦片 (流動深水紋)
    const waterPal = {
      '.': '#0369a1',
      'W': '#38bdf8',
      'D': '#075985',
      'L': '#bae6fd',
    };
    const waterRows = [
      "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
      "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
      "................................",
      "...WWWWWWWWWWWW......WWWWWWWW...",
      "..WLLLLLLLLLLLLW....WLLLLLLLLW..",
      "...WWWWWWWWWWWW......WWWWWWWW...",
      "................................",
      "................................",
      "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
      "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
      "................................",
      ".....WWWWWWWW......WWWWWWWWWWWW.",
      "....WLLLLLLLLW....WLLLLLLLLLLLLW",
      ".....WWWWWWWW......WWWWWWWWWWWW.",
      "................................",
      "................................",
      "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
      "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
      "................................",
      "...WWWWWWWWWWWW......WWWWWWWW...",
      "..WLLLLLLLLLLLLW....WLLLLLLLLW..",
      "...WWWWWWWWWWWW......WWWWWWWW...",
      "................................",
      "................................",
      "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
      "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
      "................................",
      ".....WWWWWWWW......WWWWWWWWWWWW.",
      "....WLLLLLLLLW....WLLLLLLLLLLLLW",
      ".....WWWWWWWW......WWWWWWWWWWWW.",
      "................................",
      "................................"
    ];
    cache['tile_water'] = createPixelCanvas(32, 32, waterPal, waterRows);

    // ⛰️ 山區碎石泥路
    const dirtPal = {
      '.': '#78350f',
      'D': '#451a03',
      'L': '#92400e',
      'S': '#71717a', // 碎石
    };
    const dirtRows = [
      "..DD..LL..SS..DD..LL..SS..DD..LL",
      "LL..DD..SS..LL..DD..SS..LL..DD..",
      "SS..LL..DD..SS..LL..DD..SS..LL..",
      "..SS..LL..DD..SS..LL..DD..SS..LL",
      "..DD..LL..SS..DD..LL..SS..DD..LL",
      "LL..DD..SS..LL..DD..SS..LL..DD..",
      "SS..LL..DD..SS..LL..DD..SS..LL..",
      "..SS..LL..DD..SS..LL..DD..SS..LL",
      "..DD..LL..SS..DD..LL..SS..DD..LL",
      "LL..DD..SS..LL..DD..SS..LL..DD..",
      "SS..LL..DD..SS..LL..DD..SS..LL..",
      "..SS..LL..DD..SS..LL..DD..SS..LL",
      "..DD..LL..SS..DD..LL..SS..DD..LL",
      "LL..DD..SS..LL..DD..SS..LL..DD..",
      "SS..LL..DD..SS..LL..DD..SS..LL..",
      "..SS..LL..DD..SS..LL..DD..SS..LL",
      "..DD..LL..SS..DD..LL..SS..DD..LL",
      "LL..DD..SS..LL..DD..SS..LL..DD..",
      "SS..LL..DD..SS..LL..DD..SS..LL..",
      "..SS..LL..DD..SS..LL..DD..SS..LL",
      "..DD..LL..SS..DD..LL..SS..DD..LL",
      "LL..DD..SS..LL..DD..SS..LL..DD..",
      "SS..LL..DD..SS..LL..DD..SS..LL..",
      "..SS..LL..DD..SS..LL..DD..SS..LL",
      "..DD..LL..SS..DD..LL..SS..DD..LL",
      "LL..DD..SS..LL..DD..SS..LL..DD..",
      "SS..LL..DD..SS..LL..DD..SS..LL..",
      "..SS..LL..DD..SS..LL..DD..SS..LL",
      "..DD..LL..SS..DD..LL..SS..DD..LL",
      "LL..DD..SS..LL..DD..SS..LL..DD..",
      "SS..LL..DD..SS..LL..DD..SS..LL..",
      "..SS..LL..DD..SS..LL..DD..SS..LL"
    ];
    cache['tile_dirt'] = createPixelCanvas(32, 32, dirtPal, dirtRows);
  }

  // 初始化所有 Sprite
  function init() {
    buildBearSprites();
    buildVehicleSprites();
    buildWaterSprites();
    buildItemSprites();
    buildTileSprites();
  }

  init();

  return {
    get: function(name) {
      return cache[name] || null;
    },
    has: function(name) {
      return !!cache[name];
    },
    getAllKeys: function() {
      return Object.keys(cache);
    }
  };
})();
