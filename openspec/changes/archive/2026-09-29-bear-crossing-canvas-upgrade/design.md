# Design

## Context

參見 `proposal.md`。目前 MVP 採用單一 HTML 檔案搭配 DOM 節點及 CSS Transform 模擬物件平移，在擴充多場景瓦片與複雜動畫時難以兼顧像素對齊與流暢度。本次設計旨在建立一個結構清晰、模組分工明確且不需任何編譯步驟的 HTML5 Canvas 2D 純前端遊戲架構。

## Goals / Non-Goals

**Goals:**
- 提供 60FPS 穩定渲染的原生 HTML5 Canvas 2D 遊戲迴圈。
- 專案模組化拆分為 `index.html`、`css/style.css`、`js/sprites.js`、`js/tilemap.js`、`js/audio.js`、`js/entities.js` 與 `js/game.js`。
- 達成零外部圖檔與音效依賴：Sprite 與 8-bit 音效/音樂全數由 JavaScript 在記憶體中動態生成。
- 支援桌機鍵盤與行動裝置觸控/虛擬按鍵雙操作模式。

**Non-Goals:**
- 不引入大型第三方遊戲引擎（如 Phaser、PixiJS 或 Three.js），避免體積膨脹與建置複雜度。
- 不引入 Node.js/Vite/Webpack 打包流程，維持本機雙擊開啟即可遊玩的特性。
- 不建置雲端資料庫或排行榜後端伺服器，社群分享以純前端剪貼簿文字為主。

## Decisions

### 1. 渲染管線：原生 Canvas 2D 搭配 In-Memory Sprite 快取
- **選擇**: 在記憶體中建立離屏 Canvas（In-Memory Offscreen Canvas），開局時預先繪製好 32×32 台灣黑熊（含胸前白色 V 標誌）、四款台灣特色載具（機車、計程車、公車、垃圾車）與 Tilemap 地圖瓦片，快取為 Key-Value 物件。在主迴圈中一律使用 `ctx.drawImage` 貼圖。
- **替代方案評估**:
  - *DOM + CSS Transform*: 保留現狀但無法自然支援地圖瓦片拼接與像素精確裁切。
  - *外部 PNG 圖檔*: 容易遇到本機 `file://` 協議下的 CORS 跨域限制，且需等待資源非同步載入。

### 2. 專案模組架構：標準原生 JavaScript 模組劃分
- **選擇**: 將職責解耦為 5 個獨立 JS 檔案，透過 `<script src="...">` 依序載入至全域命名空間物件（如 `window.BearCrossing`），保持無打包工具環境下的最高相容性：
  1. `audio.js`: Web Audio API 音訊合成器與 Chiptune 旋律排程器。
  2. `sprites.js`: 像素點陣圖案生成與 Canvas 快取池。
  3. `tilemap.js`: 4 大主題場景的瓦片定義與車道地形設定。
  4. `entities.js`: 黑熊、車輛、浮木、烏龜、道具物件類別與碰撞箱。
  5. `game.js`: 狀態機（Start/Playing/LevelWin/GameOver）、HUD 同步與主事件監聽。

### 3. 音效與音樂：全 Web Audio API 即時程序合成
- **選擇**: 使用 OscillatorNode（方波、三角波）與 GainNode 建立合成器。8-bit 背景音樂以固定 BPM 陣列排程音符頻率，支援動態變更主題旋律。
- **替代方案評估**:
  - *外部 MP3/WAV*: 增長載入時間，且受瀏覽器快取與版權限制。

### 4. 畫面適配：固定虛擬解析度 + CSS Aspect Ratio 響應容器
- **選擇**: Canvas 邏輯尺寸固定為 700×550（對應 11 列車道與 50px 格點高，支援 32px 像素物件於單元格居中），外層以 CSS `max-width: 100%` 自動適配螢幕寬度，保持像素外觀一致且計算邏輯單純。

## Risks / Trade-offs

- **[Risk] 手工撰寫像素矩陣程式碼較冗長**
  - → *Mitigation*: 在 `sprites.js` 封裝 `createPixelSprite(width, height, colorPalette, pixelMatrix)` 輔助函式，使用簡短字串陣列（如 `"....XXXX...."`）快速繪製像素圖案。
- **[Risk] 瀏覽器自動播放政策限制 Web Audio 播放**
  - → *Mitigation*: 在玩家點擊「開始遊戲」按鈕或第一次按下鍵盤事件時，主動呼叫 `audioCtx.resume()` 解除靜音鎖定。
- **[Risk] 烏龜定時潛水時的邊界溺水判斷**
  - → *Mitigation*: 烏龜物件設置 `submergedRatio` 浮動計時器（浮出 ➔ 冒泡預警 ➔ 沉沒 ➔ 浮出），只有在沉沒狀態且黑熊下方無其他浮木重疊時才觸發溺水判定。
