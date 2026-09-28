# Spec Delta

## Purpose

提供高效能的原生 HTML5 Canvas 2D 渲染引擎與 32×32 像素精靈圖快取管線，確保遊戲在地圖瓦片、角色動畫與障礙物平移時維持純粹且無模糊失真的復古像素美學。

## ADDED Requirements

### Requirement: Pixel-Perfect Canvas Rendering
系統 SHALL 使用 HTML5 Canvas 2D Context 進行全畫面渲染，且 MUST 將 `imageSmoothingEnabled` 設為 `false` 以避免像素縮放模糊。

#### Scenario: Canvas context initialization
- **WHEN** 遊戲引擎啟動並取得 Canvas 2D context
- **THEN** 系統將 context 的 `imageSmoothingEnabled` 屬性設為 `false`，並設定標準解析度與高 DPI 縮放適配

### Requirement: In-Memory Sprite Generation and Caching
系統 SHALL 在遊戲初始化階段於記憶體離屏畫布（In-Memory Canvas）動態繪製所有 32×32 像素角色與載具 Sprite，並以 Key-Value 結構快取以供主迴圈直接 `drawImage`。

#### Scenario: Bear character sprite caching
- **WHEN** 遊戲資源載入模組初始化
- **THEN** 系統動態生成台灣黑熊包含待機、跳躍幀、受擊死亡動畫等 32×32 像素 Sprite，且黑熊胸前 MUST 包含清晰辨識之白色「V」字形胸斑

#### Scenario: Vehicle sprites caching
- **WHEN** 載具精靈圖快取建立
- **THEN** 系統生成機車、計程車、公車與垃圾車之 32×32 像素點陣圖並快取於精靈圖池中

### Requirement: Multi-Layer Tilemap Rendering
系統 SHALL 支援 32×32 規格之 Tilemap 瓦片地圖繪製，支援地面基礎層、車道標線層與上層安全區裝飾。

#### Scenario: Scene tilemap draw pass
- **WHEN** 遊戲主渲染迴圈執行地圖繪製階段
- **THEN** 系統依據當前關卡主題陣列依序繪製背景瓦片（草地、柏油、水面、碎石路），確保畫面每秒維持穩定幀率且無破面
