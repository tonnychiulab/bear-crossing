# Spec Delta

## Purpose

定義遊戲核心玩法狀態機、四大主題場景循環關卡、道具機制、特殊環境障礙物、河流烏龜下潛判定與分數社群分享規格。

## ADDED Requirements

### Requirement: Four-Theme Scene Progression
遊戲 SHALL 提供四個循環前進之關卡主題：市區道路（Urban）、高速公路（Highway）、山區道路（Mountain Pass）以及秀姑巒溪（River Rapids）。

#### Scenario: Level progression across themes
- **WHEN** 玩家填滿當前關卡頂部所有安全家園插槽
- **THEN** 系統結算關卡加分，並依序切換至下一個主題場景，重新配置地圖瓦片、車道速度與障礙物類型

#### Scenario: Loop difficulty scaling
- **WHEN** 玩家完成全部 4 個主題場景並進入下一輪（Loop）
- **THEN** 系統將所有車道與浮木的移動速度提升 15%，維持遊戲挑戰度

### Requirement: Player Movement and Grid Snapping
玩家控制之台灣黑熊 SHALL 以固定網格尺寸（32px）單步跳躍移動，並具備跳躍冷卻與邊界限制。

#### Scenario: Valid directional hop
- **WHEN** 玩家在未處於死亡狀態下按下方向鍵或點擊觸控虛擬按鍵
- **THEN** 台灣黑熊朝指定方向移動一個網格單位，播放跳躍動畫，並在初次前進至更高列時增加分數

#### Scenario: Boundary blocking
- **WHEN** 玩家嘗試移動超出畫布邊界
- **THEN** 系統阻止位移並保持黑熊於當前安全座標內

### Requirement: Item Pickups
關卡中 SHALL 隨機或定點生成可拾取之道具，包含提供暫時加速之「竹筍」與提供單次抵擋傷害之「蜂蜜罐」。

#### Scenario: Collecting bamboo shoot
- **WHEN** 黑熊移動至含有竹筍道具之座標
- **THEN** 系統移除該道具、增加得分，並在 5 秒內使黑熊每次移動之動畫延遲減半並提升流暢度

#### Scenario: Collecting honey shield
- **WHEN** 黑熊移動至含有蜂蜜道具之座標
- **THEN** 系統啟動單次防護罩狀態，在黑熊周圍渲染蜂巢光圈特效

#### Scenario: Shield absorbing fatal hit
- **WHEN** 具有蜂蜜防護罩之黑熊遭受車輛撞擊
- **THEN** 防護罩破裂消失，黑熊維持存活而不扣除生命值

### Requirement: Dynamic Hazards and River Mechanics
關卡 SHALL 包含動態障礙物機制，包含車道紅綠燈暫停、河流漩渦以及定時沉沒之潛水烏龜。

#### Scenario: Traffic light vehicle stop
- **WHEN** 市區道路之紅綠燈號切換為紅燈
- **THEN** 該車道之車輛減速並完全靜止，直到綠燈重新亮起

#### Scenario: Turtle submersion timing
- **WHEN** 烏龜群進入潛水週期之沉沒階段
- **THEN** 烏龜外觀由浮起變為半透明水花冒泡並完全沉入水底；此時踩在該座標之黑熊判定為落水死亡

#### Scenario: River log riding
- **WHEN** 黑熊跳上水平漂流之浮木
- **THEN** 黑熊座標隨浮木速度同向平移；若漂流超出畫面邊界則判定死亡

### Requirement: Score Persistence and Shareable Summary
遊戲結束時系統 SHALL 更新本地最高分數，並提供格式化文字之「一鍵複製」按鈕供社群分享。

#### Scenario: Copying game result to clipboard
- **WHEN** 玩家在 Game Over 結算畫面點擊「複製戰績」按鈕
- **THEN** 系統將包含遊戲標題、通關關卡數、最終得分與 Emoji 圖案之文字寫入剪貼簿，並顯示複製成功提示
