# Spec Delta

## ADDED Requirements

### Requirement: Page Lifecycle and Pause Protection
遊戲 SHALL 支援瀏覽器頁面生命週期（Page Visibility）監聽，在頁面隱藏切到背景時自動暫停遊戲迴圈，並在恢復前景時重置時間基準幀與顯示暫停遮罩，防止實體瞬移與時間累積異常。

#### Scenario: Automatic pause on page hidden
- **WHEN** 玩家切換瀏覽器分頁或鎖定螢幕導致頁面變為隱藏狀態（`document.hidden` 為 `true`）
- **THEN** 遊戲迴圈自動中斷 `requestAnimationFrame` 排程，凍結當前遊戲世界狀態

#### Scenario: Safe resume with pause overlay
- **WHEN** 玩家重新切換回遊戲頁面（`document.hidden` 為 `false`）且當前處於進行中狀態
- **THEN** 系統重置動畫幀時間基準（`lastTime`），防止物理 delta 暴增造成載具瞬移，並顯示「遊戲暫停，點擊繼續」覆蓋層供玩家手動點擊恢復遊玩

## MODIFIED Requirements

### Requirement: Player Movement and Grid Snapping
玩家控制之台灣黑熊 SHALL 以固定網格尺寸（32px）單步跳躍移動，並具備跳躍冷卻與邊界限制。

#### Scenario: Valid directional hop
- **WHEN** 玩家在未處於死亡狀態下按下方向鍵或點擊觸控虛擬按鍵
- **THEN** 台灣黑熊朝指定方向移動一個網格單位，播放跳躍動畫，並在初次前進至更高列時增加分數

#### Scenario: Boundary blocking
- **WHEN** 玩家嘗試移動超出畫布邊界
- **THEN** 系統阻止位移並保持黑熊於當前安全座標內

#### Scenario: Virtual D-Pad pointerdown zero latency
- **WHEN** 玩家在行動端觸控虛擬方向鍵（D-Pad）
- **THEN** 系統以 `pointerdown` 事件即時觸發黑熊移動並阻止預設手勢行為，達成零延遲位移且不觸發長按系統放大鏡或雙擊縮放
