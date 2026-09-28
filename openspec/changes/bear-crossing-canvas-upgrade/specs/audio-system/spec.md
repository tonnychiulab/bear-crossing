# Spec Delta

## Purpose

基於瀏覽器標準 Web Audio API 提供完全無外部依賴的程序合成音訊系統，涵蓋 8-bit 街機音效與場景專屬 Chiptune 背景音樂生成。

## ADDED Requirements

### Requirement: Synthesized Sound Effects
系統 SHALL 透過 OscillatorNode 與 GainNode 即時合成遊戲音效，包含黑熊跳躍、拾取道具、護盾破碎、車輛撞擊、落水溺亡以及關卡過關號角。

#### Scenario: Audio initialization on user interaction
- **WHEN** 玩家初次點擊畫面或按下鍵盤按鍵
- **THEN** 系統喚醒或初始化 AudioContext，解除瀏覽器自動播放限制

#### Scenario: Playing action sound effects
- **WHEN** 遊戲事件觸發（例如黑熊移動跳躍或拾取竹筍）
- **THEN** 系統以指定波形（方波、三角波、白噪音）、頻率包絡線與時長即時播放相應之 8-bit 音效

### Requirement: 8-Bit Chiptune Background Music
系統 SHALL 提供依場景主題切換之程序化 8-bit Chiptune 循環音樂引擎，營造復古街機氛圍。

#### Scenario: Theme-specific background music loop
- **WHEN** 遊戲切換至新的關卡場景（如高速公路或秀姑巒溪）
- **THEN** 音訊引擎停止前一首旋律，並啟動對應當前場景節奏與音階的主題旋律音符序列循環播放

#### Scenario: Audio mute toggle
- **WHEN** 玩家點擊遊戲介面之靜音按鈕
- **THEN** 系統將主增益節點（Master Gain）平滑調降至 0，暫停所有背景音樂與音效輸出
