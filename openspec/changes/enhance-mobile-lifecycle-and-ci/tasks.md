# Tasks

## 1. 行動端虛擬方向鍵手感優化 (Mobile Controls Optimization)

- [x] 1.1 在 `css/style.css` 為 `#mobile-controls .d-btn` 加入 `-webkit-touch-callout: none; user-select: none; touch-action: manipulation;`，消除系統放大鏡、文字選取與雙擊縮放
- [x] 1.2 在 `js/game.js` 將四向虛擬按鈕事件由 `click` 重構為 `pointerdown` 並調用 `e.preventDefault()`，驗證行動端點擊時黑熊即刻位移零延遲

## 2. 頁面生命週期與暫停遮罩 (Page Visibility Lifecycle & Pause Protection)

- [x] 2.1 在 `index.html` 與 `css/style.css` 建立 `#pause-screen` 暫停遮罩（含「⏸️ 遊戲暫停」、「點擊繼續遊戲」按鈕），並驗證樣式居中且可響應式適配手機窄螢幕
- [x] 2.2 在 `js/audio.js` 實作 `pauseAudio()` 與 `resumeAudio()`，支援頁面退到背景時自動凍結音訊與計時排程
- [x] 2.3 在 `js/game.js` 監聽 `visibilitychange` 事件，於頁面隱藏時凍結遊戲迴圈並在切回前景時重置時間基準幀（`lastTime`）並彈出暫停遮罩，驗證切換分頁不會發生載具瞬移與音效暴衝

## 3. GitHub Actions CI 規格守護工作流 (CI Automation & Spec Guard)

- [x] 3.1 建立 `.github/workflows/ci.yml`，配置 Node.js 執行環境、前端腳本靜態語法檢查（`node -c js/*.js`）與 `@openspec/cli` 安裝
- [x] 3.2 在 CI 流程中配置 `openspec validate --specs` 步驟，透過命令列模擬驗證本機與 CI 工作流皆能自動通過主規格契約檢驗
