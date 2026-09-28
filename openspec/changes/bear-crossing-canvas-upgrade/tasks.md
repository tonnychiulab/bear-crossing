# Tasks

## 1. 專案結構與樣式建置 (Project Setup & Styling)

- [x] 1.1 建立目錄結構（`css/`、`js/`）並建立 `css/style.css`，配置 700×550 響應式 Canvas 容器、復古街機邊框與 HUD 樣式，並驗證樣式檔載入無誤
- [x] 1.2 重構 `index.html`，保留 HUD、主選單、過關與結算 Overlay，將舊有的 DOM 遊戲板替換為 `<canvas id="game-canvas" width="700" height="550">`，並依序引入模組腳本

## 2. 像素精靈圖動態生成引擎 (Sprite Generation & Caching)

- [x] 2.1 實作 `js/sprites.js` 中的點陣轉換與離屏畫布快取函式，生成 32×32 像素之台灣黑熊 Sprite（待機、跳躍、死亡動畫，胸前具白色 V 紋），並驗證精靈圖完整生成
- [x] 2.2 在 `js/sprites.js` 中實作四款台灣特色載具（機車、計程車、公車、垃圾車）與道具（竹筍、蜂蜜罐、防護光圈）之 32×32 精靈圖快取
- [x] 2.3 在 `js/sprites.js` 中實作 Tilemap 基礎瓦片（草地、柏油路、標線、水面波紋、泥石地、終點竹林插槽）生成器

## 3. Tilemap 與 4 大主題關卡管線 (Tilemap & Level Design)

- [x] 3.1 實作 `js/tilemap.js`，定義市區道路、高速公路、山區道路與秀姑巒溪等 4 大主題場景的車道設定、瓦片配色與障礙物產生規則
- [x] 3.2 實作關卡主題渲染函式，驗證不同關卡能無縫切換瓦片背景與安全區標示

## 4. 遊戲實體與機制判定 (Entities & Mechanics)

- [x] 4.1 實作 `js/entities.js` 中的玩家黑熊實體，包含網格跳躍、跳躍冷卻、邊界限制與移動動畫
- [x] 4.2 實作車輛實體與水平移動邏輯，整合紅綠燈週期暫停機制，並驗證 AABB 碰撞箱判定精確
- [x] 4.3 實作河流浮木與烏龜實體，包含浮木載乘平移、烏龜定時下潛冒泡週期與溺水死亡檢測
- [x] 4.4 實作道具生成與拾取效果（竹筍加速、蜂蜜單次防護罩吸收碰撞）

## 5. Web Audio 8-Bit 音效與音樂系統 (Audio System)

- [x] 5.1 實作 `js/audio.js`，建立 AudioContext 管理器，支援使用者初次互動喚醒與靜音開關
- [x] 5.2 實作程序合成音效庫（跳躍、吃道具、護盾破碎、車禍撞擊、落水溺亡、過關號角），以程式呼叫驗證發聲正常
- [x] 5.3 實作 8-bit Chiptune 背景音樂循環排程器，支援隨關卡場景切換不同旋律與節奏

## 6. 主迴圈整合與社群分享 (Game Loop & Social Sharing)

- [x] 6.1 實作 `js/game.js` 主遊戲迴圈（`requestAnimationFrame`），整合 60FPS 狀態更新、碰撞檢測與 Canvas 繪圖渲染
- [x] 6.2 實作遊戲狀態機（StartScreen、Playing、LevelComplete、GameOver），串接關卡輪轉加成與 localStorage 最高分更新
- [x] 6.3 在 Game Over 結算彈窗實作「一鍵複製戰績」按鈕，格式化輸出含 Emoji 的分數圖文至剪貼簿並顯示回饋提示
