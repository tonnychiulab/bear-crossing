# 🐻 台灣黑熊過街 | Formosan Bear Crossing (Pixel Arcade)

> 一款以台灣特有亞種「台灣黑熊」為主角的 2D 像素復古街機過街網頁遊戲。  
> 透過 **OpenSpec** 規格驅動開發，純原生 HTML5 Canvas 2D 渲染，零外部資源依賴。

---

## 🎮 遊戲特色

- 🐻 **經典台灣黑熊**：32×32 像素點陣圖案，清晰呈現胸前特徵白色「V」字斑紋與待機/跳躍/受擊動畫。
- 🛵 **台灣在地特色載具**：藍白速克達機車、小黃計程車、經典綠白公車與黃藍垃圾車。
- 🗺️ **四大主題場景輪轉**：
  1. **市區道路 (Urban Street)**：密集機車潮與車道紅綠燈管制。
  2. **高速公路 (Highway Express)**：超高速行駛的大客車與小客車。
  3. **山區道路 (Mountain Trail)**：穿梭中橫的垃圾車與碎石路段。
  4. **秀姑巒溪 (River Rapids)**：湍急溪流、漂移浮木與**定時潛水下沉烏龜**。
- 🎋 **道具與特殊機制**：
  - **竹筍**：短暫提升移動敏捷度與冷卻速度。
  - **蜂蜜罐**：獲得金色蜂巢防護罩，抵擋一次車禍撞擊或溺水救援。
  - **紅綠燈**：市區車道定時變換紅燈，車流暫停。
  - **烏龜潛水**：烏龜群定時冒泡並下潛，考驗跳躍時機計算。
- 🎵 **8-bit 程序合成音訊**：基於 Web Audio API 即時合成所有跳躍/撞擊/過關音效與 4 大主題場景的 Chiptune 循環背景音樂，支援一鍵靜音。
- 📋 **戰績一鍵複製**：結算畫面提供社群分享按鈕，快速複製 Emoji 成果文字。

---

## 🕹️ 操作方式

| 操作按鍵 | 動作 |
| :--- | :--- |
| <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> 或 <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> | 控制黑熊向四個方向跳躍 |
| <kbd>Space</kbd> 或 <kbd>Enter</kbd> | 快速開始 / 進入下一關 / 重新開始 |
| 📱 **手機觸控** | 支援螢幕滑動手勢與畫面下方虛擬方向鍵（D-pad） |
| 🔊 / 🔇 按鈕 | 點擊 HUD 右上角圖示隨時切換靜音 |

---

## 🏗️ 專案技術架構

本專案採純靜態通用架構，無需安裝 Node.js 或打包工具，支援本機雙擊直接開啟遊玩：

```text
bear-crossing/
├── index.html              # 主遊戲入口、HUD 與 Canvas 畫布
├── index.mvp.html          # 第一代 DOM + SVG MVP 完整備份
├── css/
│   └── style.css           # 街機像素風格樣式與自適應響應容器
└── js/
    ├── audio.js            # Web Audio API 8-bit 音效與 Chiptune 背景音樂引擎
    ├── sprites.js          # Palette-based 字元調色盤矩陣像素圖案動態生成器
    ├── tilemap.js          # 4 大場景瓦片拼接、車道規則與紅綠燈邏輯
    ├── entities.js         # 玩家黑熊、車輛、浮木/烏龜、道具實體與碰撞判定
    └── game.js             # 60FPS 狀態機主遊戲迴圈與社群分享
```

---

## 📄 開發規範與方法論

本專案透過 **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** 進行規格驅動開發（Spec-Driven Development）：
- 完整變更規格請參閱 [`openspec/changes/bear-crossing-canvas-upgrade/`](./openspec/changes/bear-crossing-canvas-upgrade/)
  - `proposal.md`：升級背景與能力範疇
  - `specs/`：Canvas 引擎、遊戲機制與音效系統行為規範契約
  - `design.md`：離屏快取、純靜態模組化與架構決策
  - `tasks.md`：17 項實作檢驗清單

---

## 🛠️ 開發中使用的 AI Skills 與工作流

本次升級過程中深度運用了以下專業 AI Agent Skills 進行規格對齊與實作交付：

1. **`/grill-me` (Antigravity Interactive Alignment)**  
   - 透過決策樹循序面試，精確釐清「中等升級 ⭐⭐⭐」範圍，逐一敲定 32×32 像素規格、程式動態生成素材策略、多場景循環機制、Web Audio 音效與純靜態無打包架構。
2. **`openspec-propose` (OpenSpec Proposal Generation)**  
   - 依據對齊決策自動建構 OpenSpec 變更提案，一鍵產出結構化規格檔案（Proposal、Delta Specs、Technical Design 與 17 項分組 Tasks 清單）。
3. **`openspec-apply-change` (OpenSpec Task Execution)**  
   - 嚴格依照 Tasks 清單進行規格落地，分層實作樣式、精靈圖引擎、關卡地圖、遊戲實體與音訊系統，完成 100% 驗證驗收。

---

## 🎨 素材來源與智慧財產權宣告 (Asset & Source Declarations)

本遊戲以「**100% 純原生程式生成、零第三方外部靜態檔案依賴**」為核心原則，所有音畫資源均為程式碼動態生成：

1. **視覺像素圖形 (Pixel Art Sprites)**：
   - **黑熊與載具**：採用原創 **Palette-based String Matrix（字元調色盤點陣矩陣）**，由 [`js/sprites.js`](./js/sprites.js) 在執行時期於記憶體 Canvas 動態繪製。
   - **黑熊形象**：以台灣特有亞種保育類「台灣黑熊 (*Ursus thibetanus formosanus*)」為原創靈感，繪製胸前招牌白色「V」字斑紋與黑毛耳朵特徵。
   - **台灣在地交通工具**：藍白速克達機車、小黃計程車、經典綠白公車與黃藍垃圾車，均為原創 32×32 像素藝術。
   - **地圖瓦片**：草地、柏油馬路標線、水面波紋與泥石地瓦片皆由像素陣列自製繪製。
2. **音效與音樂素材 (Audio & Music)**：
   - **程序化聲音合成 (Procedural Sound)**：由 [`js/audio.js`](./js/audio.js) 基於 W3C 標準 **Web Audio API**（`OscillatorNode` 方波/三角波/鋸齒波、`GainNode` 與 `BiquadFilterNode`）即時震盪運算生成，**無使用任何外部 MP3/WAV/OGG 音訊圖檔或商業音效庫**。
3. **機制啟發與原型傳承 (Inspiration & Heritage)**：
   - **經典街機致敬**：玩法機制致敬 1981 年經典街機遊戲《Frogger》（Konami），並融入台灣本土人文地景與自然元素。
   - **第一代原型存檔**：原版的 DOM + SVG + Emoji MVP 完整保存在 [`index.mvp.html`](./index.mvp.html)，見證架構重構歷程。

---

## 👥 共同作者 (Co-Authors)

- **Tonny Chiu** ([@tonnychiulab](https://github.com/tonnychiulab))  
  *專案發起人、產品方向、玩法機制設計與品質驗收*
- **Antigravity** (Google DeepMind Advanced Agentic Assistant)  
  *AI 結對程式設計助手、架構設計、規格制定與全端程式碼實作*

---

## 🚀 授權條款

本專案採 [MIT License](./LICENSE) 開源授權。歡迎自由轉載、二次創作與挑戰最高分！
