# Design

## Context

參見 [`proposal.md`](file:///root/sh/agy/bear-crossing/openspec/changes/enhance-mobile-lifecycle-and-ci/proposal.md)。目前遊戲的主迴圈採用 `requestAnimationFrame`，而 Web Audio API 音樂排程採用 `setTimeout`。當瀏覽器分頁切到背景時，動畫幀被瀏覽器大幅降頻或凍結，但時間戳並未重置，切回時會引發極大 `delta` 時間膨脹；虛擬鍵盤依賴 `click` 事件造成街機輸入延遲。

## Goals / Non-Goals

**Goals:**
- 完整監聽 `visibilitychange`，在頁面隱藏時凍結遊戲迴圈與音訊，切回時透過時間戳重置與暫停遮罩杜絕瞬移。
- 升級虛擬方向鍵為 `pointerdown` 零延遲事件並阻絕預設縮放與放大鏡手勢。
- 建立輕量 GitHub Actions CI 守護 Main Specs 契約與 JS 語法正確性。

**Non-Goals:**
- 不引入重型前端測試框架（如 Playwright/Puppeteer），保持無額外依賴的高速 CI 流程。
- 不改變黑熊移動網格步長或既有碰撞幾何邏輯。

## Decisions

### 1. 頁面生命週期防護狀態機 (`visibilitychange`)
- **決策**：在 [`js/game.js`](file:///root/sh/agy/bear-crossing/js/game.js) 監聽 `document.addEventListener('visibilitychange')`。
  - 當 `document.hidden === true` 且遊戲進行中時：標記 `state.isPaused = true`，中斷主遊戲迴圈更新，並呼叫 `BearAudio.pauseContext()`。
  - 當 `document.hidden === false` 且處於進行中時：不立即自動重啟世界，而是顯示 `#pause-screen` 遮罩（「遊戲已暫停，點擊繼續」）。
  - 當玩家點擊遮罩繼續時：重置時間戳 `lastTime = performance.now()`，恢復音訊，重啟 `requestAnimationFrame`。
- **考量替代方案**：切回前景直接自動繼續。缺點是玩家切回時常需重新定位視覺，自動恢復極易讓黑熊瞬間被迎面而來的計程車撞死。

### 2. 虛擬按鍵採用 `pointerdown` 取代 `click`
- **決策**：將虛擬按鍵的監聽事件全面替換為 `pointerdown`，並於 handler 中調用 `e.preventDefault()`。
  - 樣式增加 `-webkit-touch-callout: none; -webkit-user-select: none; user-select: none; touch-action: manipulation;`。
- **考量替代方案**：使用 `touchstart`。但 W3C Pointer Events 是涵蓋滑鼠、觸控筆與手指的標準超集，跨裝置表現更一致。

### 3. GitHub Actions 規格守護 CI 流程
- **決策**：在 `.github/workflows/ci.yml` 定義 `ci` 工作：
  - 運行環境：`ubuntu-latest`，Node.js 20。
  - 步驟 1：語法靜態檢測（`node -c js/*.js scripts/*.py`）。
  - 步驟 2：全域安裝 `@openspec/cli`。
  - 步驟 3：執行 `openspec validate --specs` 確保規格契約通過。
- **考量替代方案**：僅做 git pre-commit hook。缺點是無法約束網頁端或外部 PR 貢獻者，遠端 CI 才是最終防線。

## Risks / Trade-offs

- **[Risk]** 在過關 Overlay 或 GameOver Overlay 期間切換分頁，重回時觸發多重遮罩重疊衝突。  
  → **Mitigation**：只有在 `state.gameRunning && !state.player.isDying` 且非過關/結算狀態下，才觸發 `#pause-screen`。
- **[Risk]** 行動瀏覽器在 `pointerdown` 阻止預設行為時可能阻斷滾動。  
  → **Mitigation**：僅在 `#mobile-controls .d-btn` 上調用 `preventDefault()`，不影響外層容器與頁面正常手勢。
