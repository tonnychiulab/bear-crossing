# Proposal

## Why

目前《台灣黑熊過街》在行動端與分頁切換時存在兩大體驗盲區：當玩家切換瀏覽器分頁或鎖定螢幕時，缺乏 `visibilitychange` 生命週期監聽，導致背景音樂在背景持續播送、切回時更因計時幀（`delta`）瞬間暴增引發載具瞬移與音效暴衝；同時虛擬方向鍵採用傳統 `click` 事件，存在微幅操作延遲與長按易觸發系統選單的問題。此外，專案缺乏 CI 自動化檢驗，無法在每次 PR/Push 時自動守護 Main Specs 契約與代碼語法。

## What Changes

1. **行動端生命週期與休眠防護機制**：
   - 監聽標準 `visibilitychange` 事件。
   - 頁面切到背景時，自動暫停 Web Audio `AudioContext` 與主遊戲循環動畫幀。
   - 頁面切回前景時，重置時間基準幀（`lastTime`）以防止物理 delta 暴增，並彈出「遊戲暫停，點擊繼續」覆蓋層，防止車輛瞬移撞死玩家。
2. **虛擬方向鍵（D-Pad）PointerDown 零延遲手感優化**：
   - 將行動端方向鍵監聽事件由 `click` 升級為 `pointerdown` 並調用 `preventDefault()`。
   - 搭配 CSS 禁用長按系統選單與雙擊縮放（`-webkit-touch-callout: none; user-select: none; touch-action: manipulation;`），提供街機掌機般的即時點擊響應。
3. **GitHub Actions 規格與語法自動守護 CI**：
   - 建立 `.github/workflows/ci.yml`。
   - 每次 Push 或 Pull Request 至 `main` 分支時，自動執行 Node.js 語法檢測與 `openspec validate --specs`，確保主規格契約永不脫節。

## Capabilities

### New Capabilities
（無，沿用現有能力組織）

### Modified Capabilities
- `audio-system`: 新增頁面隱藏切換時的音訊休眠與恢復播放場景契約。
- `gameplay-mechanics`: 新增遊戲休眠暫停狀態機、重置 delta 防瞬移機制，以及虛擬控制器零延遲 PointerDown 觸發契約。

## Impact

- 核心程式碼：[`js/game.js`](file:///root/sh/agy/bear-crossing/js/game.js)、[`js/audio.js`](file:///root/sh/agy/bear-crossing/js/audio.js)、[`css/style.css`](file:///root/sh/agy/bear-crossing/css/style.css)、[`index.html`](file:///root/sh/agy/bear-crossing/index.html)。
- CI 自動化設定：新增 `.github/workflows/ci.yml`。
- 無外部網路與 CDN 依賴，維持 100% 純原生前端相容性。
