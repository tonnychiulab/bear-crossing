# Proposal

## Why

目前的 MVP 版本採用 DOM 節點搭配 SVG 與 Emoji 進行渲染，雖然成功驗證了核心跳躍過街玩法，但在動畫表現、地圖拼接擴充性、碰撞精準度與效能上存在架構限制。

為了將《台灣黑熊過街》升級為一款具備高視覺質感、經典 8-bit 街機手感、豐富關卡機制與台灣文化識別度的精緻 2D 網頁遊戲，需要將核心渲染管線重構為 HTML5 Canvas 2D，並引入像素化素材、多主題場景、特殊障礙物與程序合成音效系統。

## What Changes

- **BREAKING**: 捨棄現有以 DOM 節點（`#player`, `.obstacle`, `.lane`）與 CSS Transform 為主的渲染架構，全面轉換為原生 HTML5 Canvas 2D 繪圖迴圈。
- **BREAKING**: 重構專案目錄架構，由單一 `index.html` 拆分為標準模組化結構（`index.html`、`css/style.css`、`js/`）。
- **視覺像素化**: 建立 32×32 像素動態生成器與 In-Memory Canvas 快取，動態繪製具備胸前白色「V」字斑紋的台灣黑熊、台灣在地特色車輛（機車、計程車、公車、垃圾車）與 Tilemap 地圖瓦片。
- **4 大主題關卡與難度推進**: 新增「市區道路」、「高速公路」、「山區道路」、「秀姑巒溪」四大主題關卡，各具備獨特地形配色與障礙配置。
- **新增遊戲機制與道具**:
  - 道具系統：竹筍（短期移動加速）、蜂蜜罐（單次碰撞防護罩）。
  - 特殊障礙物：紅綠燈（車道定時啟閉暫停）、河流漩渦（捲入致命）、烏龜定時潛水沉沒機制。
- **全 Web Audio API 音樂音效系統**: 擴充目前的簡易 beep，以程序合成跳躍、落水、碰撞、過關等複合音效，並加入 8-bit Chiptune 背景音樂循環。
- **社交與戰績分享**: 結算畫面加入一鍵複製 Emoji 格式戰績文字，便於社群轉傳分享。

## Capabilities

### New Capabilities
- `canvas-engine`: 負責 HTML5 Canvas 2D 畫布管理、像素風格設定（停用平滑）、32×32 精靈圖動態記憶體快取與多層瓦片（Tilemap）渲染。
- `gameplay-mechanics`: 負責 4 大主題關卡輪轉、黑熊移動狀態機、道具（竹筍/蜂蜜）拾取與效果、特殊障礙物（紅綠燈/漩渦/烏龜下潛）邏輯與碰撞判定。
- `audio-system`: 負責透過 Web Audio API 程序合成遊戲所有 8-bit 音效與主題場景 Chiptune 循環背景音樂，達成零外部音檔依賴。

### Modified Capabilities
<!-- 無既有 specs 需要修改 -->

## Impact

- **Affected Code**: 現有 `index.html` 中的 DOM 遊戲板（`#game-board` 內之 lanes/obstacles/player）與 inline JavaScript 將全面被 Canvas 畫布與 `js/` 模組取代。
- **Dependencies**: 零第三方打包工具依賴，保持純靜態通用架構，無需 Node.js 環境即可由瀏覽器直接開啟執行。
- **Browser APIs**: 使用標準 HTML5 Canvas 2D Context、Web Audio API（AudioContext / OscillatorNode / GainNode）與 Web Storage API（localStorage）。
