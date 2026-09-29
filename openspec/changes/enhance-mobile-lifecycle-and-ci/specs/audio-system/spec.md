# Spec Delta

## MODIFIED Requirements

### Requirement: 8-Bit Chiptune Background Music
系統 SHALL 提供依場景主題切換之程序化 8-bit Chiptune 循環音樂引擎，營造復古街機氛圍。

#### Scenario: Theme-specific background music loop
- **WHEN** 遊戲切換至新的關卡場景（如高速公路或秀姑巒溪）
- **THEN** 音訊引擎停止前一首旋律，並啟動對應當前場景節奏與音階的主題旋律音符序列循環播放

#### Scenario: Audio mute toggle
- **WHEN** 玩家點擊遊戲介面之靜音按鈕
- **THEN** 系統將主增益節點（Master Gain）平滑調降至 0，暫停所有背景音樂與音效輸出

#### Scenario: Audio unmute toggle and BGM resume
- **WHEN** 玩家再次點擊靜音按鈕以取消靜音
- **THEN** 系統將主增益節點（Master Gain）平滑調回預設音量，並確保當前關卡背景音樂無縫恢復播放，不發生排程永久中斷

#### Scenario: Background audio suspension on page hidden
- **WHEN** 瀏覽器頁面觸發 `visibilitychange` 事件且 `document.hidden` 為 `true`
- **THEN** 音訊引擎自動暫停 Web Audio AudioContext 與背景音樂計時排程，切換回前景時方可依遊戲狀態恢復播放
