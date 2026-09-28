#!/usr/bin/env python3
"""
台灣黑熊過街 — 真實遊戲畫面精準截圖產生器
依照 js/sprites.js 與 js/tilemap.js 的規格渲染 700x550 遊戲截圖
"""

import os
from PIL import Image, ImageDraw, ImageFont

W, H = 700, 550
LANE_H = 50

# 建立 32x32 精靈圖輔助函式
def make_sprite(width, height, palette, rows):
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    pixels = img.load()
    for y, row in enumerate(rows):
        if y >= height: break
        for x, char in enumerate(row):
            if x >= width: break
            color = palette.get(char)
            if color:
                pixels[x, y] = color
    return img

# 1. 黑熊調色盤
BEAR_PAL = {
    'K': (17, 24, 39, 255),
    'B': (31, 41, 55, 255),
    'L': (55, 65, 81, 255),
    'W': (255, 255, 255, 255),
    'N': (120, 53, 15, 255),
    'E': (0, 0, 0, 255),
    'P': (244, 114, 182, 255),
}
BEAR_IDLE_ROWS = [
    ".....KKKK..............KKKK.....",
    "....KBBBBK............KBBBBK....",
    "...KBBPPBBK..........KBBPPBBK...",
    "...KBBPPBBK..........KBBPPBBK...",
    "....KBBBBK............KBBBBK....",
    ".....KKKK...KKKKKKKK...KKKK.....",
    "..........KKBBLLLLBBKK..........",
    "........KKBBLLLLLLLLBBKK........",
    ".......KBBLLLLLLLLLLLLBBK.......",
    "......KBBLWWWLLLLLLWWWLBBK......",
    "......KBLWEEWLLLLLLWEEWLBK......",
    "......KBLLWWWLLNNLLWWWLLBK......",
    "......KBLLLLLLNNNNLLLLLLBK......",
    ".......KBBLLLLLLLLLLLLBBK.......",
    "........KKBBLLLLLLLLBBKK........",
    ".......KKBBBBKKKKKKBBBBKK.......",
    "......KBBLLWBBBBBBBBWLLBBK......",
    ".....KBBLLWWKBBBBBBKWWLLBBK.....",
    ".....KBL..WWKBBBBBBKWW..LBK.....",
    ".....KBL...WWKBBBBKWW...LBK.....",
    ".....KBL....WWKBBKWW....LBK.....",
    "......KBL....WWKKWW....LBK......",
    "......KBB.....WWWW.....BBK......",
    ".......KBB.....WW.....BBK.......",
    "........KBBB........BBBK........",
    "........KBBBK......KBBBK........",
    ".......KBBBBK......KBBBBK.......",
    ".......KBBBBK......KBBBBK.......",
    "........KKKK........KKKK........",
    "................................",
    "................................",
    "................................"
]
bear_img = make_sprite(32, 32, BEAR_PAL, BEAR_IDLE_ROWS)

# 2. 瓦片生成
GRASS_PAL = {'.': (30, 58, 30, 255), 'G': (46, 90, 46, 255), 'L': (61, 122, 61, 255), 'D': (23, 46, 23, 255)}
grass_rows = [
    "GG.GG.DDGG.GG.DDGG.GG.DDGG.GG.DD",
    "GL.GL.DLGL.GL.DLGL.GL.DLGL.GL.DL",
    "GG.GG.DDGG.GG.DDGG.GG.DDGG.GG.DD",
    "..DD..GG..DD..GG..DD..GG..DD..GG"
] * 8
tile_grass = make_sprite(32, 32, GRASS_PAL, grass_rows)

ROAD_PAL = {'.': (39, 39, 42, 255), 'G': (63, 63, 70, 255), 'D': (24, 24, 27, 255)}
road_rows = ["..GG..DD..GG..DD..GG..DD..GG..DD"] * 32
tile_road = make_sprite(32, 32, ROAD_PAL, road_rows)

WATER_PAL = {'.': (3, 105, 161, 255), 'W': (56, 189, 248, 255), 'D': (7, 89, 133, 255), 'L': (186, 230, 253, 255)}
water_rows = [
    "DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
    "................................",
    "...WWWWWWWWWWWW......WWWWWWWW...",
    "..WLLLLLLLLLLLLW....WLLLLLLLLW..",
    "...WWWWWWWWWWWW......WWWWWWWW...",
    "................................"
] * 5 + ["DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD"] * 2
tile_water = make_sprite(32, 32, WATER_PAL, water_rows)

DIRT_PAL = {'.': (120, 53, 15, 255), 'D': (69, 26, 3, 255), 'L': (146, 64, 14, 255), 'S': (113, 113, 122, 255)}
dirt_rows = ["..DD..LL..SS..DD..LL..SS..DD..LL"] * 32
tile_dirt = make_sprite(32, 32, DIRT_PAL, dirt_rows)

# 3. 載具生成
MOTO_PAL = {'.': None, 'K': (15, 23, 42, 255), 'B': (59, 130, 246, 255), 'W': (255, 255, 255, 255), 'S': (148, 163, 184, 255), 'T': (30, 41, 59, 255), 'P': (253, 224, 71, 255)}
moto_rows = [
    ".............KKKK...............",
    "............KPPPPK..............",
    "............KPPPPK..............",
    ".............KKKK...............",
    ".........S....KK....S...........",
    "..........S..KBBK..S............",
    "...........KKBBBBKK.............",
    "...........KBBWWBBK.............",
    "...........KBWWWWK..............",
    "...........KBBWWBBK.............",
    "..........KBBBBBBBBK............",
    "..........KTTBBBBTTK............",
    ".........KTTTBBBBTTTK...........",
    "..........KTTBBBBTTK............",
    "...........KBBRRBBK............."
] + ["................................"] * 17
obs_scooter = make_sprite(32, 32, MOTO_PAL, moto_rows)

TAXI_PAL = {'.': None, 'K': (24, 24, 27, 255), 'Y': (234, 179, 8, 255), 'G': (56, 189, 248, 255), 'R': (239, 68, 68, 255), 'B': (37, 99, 235, 255), 'T': (9, 9, 11, 255)}
taxi_rows = [
    "....................KKRRBBKK....................",
    "...................KYYYYYYYYK...................",
    "..................KTTYYYYYYTTK..................",
    ".................KTTTYYYYYYTTTK.................",
    ".................KYYYYYYYYYYYYK.................",
    "...............KYYYYGGGGGGGGYYYYK...............",
    "..............KYYGGGGGGGGGGGGGGYYK..............",
    ".............KYYGGGGGGGGGGGGGGGGYYK.............",
    ".............KYYYYYYYYYYYYYYYYYYYYK.............",
    ".............KYYYYYYYYYYYYYYYYYYYYK.............",
    "..............KYYGGGGGGGGGGGGGGYYK..............",
    "...............KYYYYGGGGGGGGYYYYK...............",
    "..................KTTYYYYYYTTK..................",
    ".................KTTTYYYYYYTTTK.................",
    "...................KRRRRRRRRK..................."
] + ["................................................"] * 17
obs_taxi = make_sprite(48, 32, TAXI_PAL, taxi_rows)

BUS_PAL = {'.': None, 'K': (15, 23, 42, 255), 'W': (248, 250, 252, 255), 'G': (22, 163, 74, 255), 'S': (2, 132, 199, 255), 'T': (2, 6, 23, 255), 'L': (250, 204, 21, 255)}
bus_rows = [
    "...................KLLLLLLLLLLLLLLLLLLLLK.......................",
    "..................KWWWWWWWWWWWWWWWWWWWWWWK......................",
    ".................KTTWWWWWWWWWWWWWWWWWWWWTTK.....................",
    "................KWWWWWWWWWWWWWWWWWWWWWWWWWWK....................",
    "...............KSSSSSSSSSSSSSSSSSSSSSSSSSSSSK...................",
    ".............KSSWSSSSWSSSSWSSSSWSSSSWSSSSWSWWSSK................",
    ".............KGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGK.................",
    ".............KGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGK.................",
    ".............KSSWSSSSWSSSSWSSSSWSSSSWSSSSWSWWSSK................",
    "...............KSSSSSSSSSSSSSSSSSSSSSSSSSSSSK...................",
    "................KWWWWWWWWWWWWWWWWWWWWWWWWWWK....................",
    ".................KTTWWWWWWWWWWWWWWWWWWWWTTK....................."
] + ["................................................................"] * 20
obs_bus = make_sprite(64, 32, BUS_PAL, bus_rows)

TRUCK_PAL = {'.': None, 'K': (24, 24, 27, 255), 'Y': (250, 204, 21, 255), 'B': (29, 78, 216, 255), 'S': (96, 165, 250, 255), 'T': (9, 9, 11, 255), 'R': (239, 68, 68, 255)}
truck_rows = [
    ".....................KKKKRRKKKK.......................",
    "....................KYYYYYYYYYYK......................",
    "..................KTTYYYYYYYYYYTTK....................",
    ".................KYYYYYYYYYYYYYYYYK...................",
    "...............KYYSSSSSSSSSSSSSSSSYYK.................",
    "..............KYYYYYYYYYYYYYYYYYYYYYYK................",
    "..............KBBBBBBBBBBBBBBBBBBBBBBK................",
    "..............KBBBBBBBBBBBBBBBBBBBBBBK................",
    "..............KBBBBBBBBBBBBBBBBBBBBBBK................",
    "..............KBBBBBBBBBBBBBBBBBBBBBBK................",
    ".................KTTBBBBBBBBBBBBTTK...................",
    "..................KRRRRRRRRRRRRRRK...................."
] + ["......................................................"] * 20
obs_truck = make_sprite(54, 32, TRUCK_PAL, truck_rows)

LOG_PAL = {'.': None, 'D': (69, 26, 3, 255), 'M': (120, 53, 15, 255), 'L': (180, 83, 9, 255), 'Y': (217, 119, 6, 255)}
log_rows = [
    ".....DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD.....",
    "..DMMLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLMMD..",
    "DMYYMDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDMDYYMD",
    "DMYMDMLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLMDMYMD",
    "DMYMDMLYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYLMDMYMD",
    "DMYMDMLYMDMLYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYMDMYLMDMYMD",
    "DMYMDMLYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYLMDMYMD",
    "DMYYMDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDMDYYMD",
    "..DMMLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLMMD..",
    ".....DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD....."
] + ["................................................................"] * 22
obs_log = make_sprite(64, 32, LOG_PAL, log_rows)

TURTLE_PAL = {'.': None, 'K': (6, 78, 59, 255), 'G': (5, 150, 105, 255), 'L': (52, 211, 153, 255), 'Y': (254, 240, 138, 255)}
turtle_rows = [
    "..........KKKK....KKKK..........",
    ".........KGGGGK..KGGGGK.........",
    "............KGGGGK..............",
    "........KKKKKKKKKKKKKK..........",
    ".....KGGLLYYLLGGLLYYLLGGK.......",
    ".....KGGLYYYYLGGGLYYYYLGK.......",
    ".....KGGLLYYLLGGLLYYLLGGK.......",
    "........KKKKKKKKKKKKKK..........",
    ".........KGGGGK..KGGGGK........."
] + ["................................"] * 23
obs_turtle = make_sprite(32, 32, TURTLE_PAL, turtle_rows)

BAMBOO_PAL = {'.': None, 'K': (20, 83, 45, 255), 'G': (34, 197, 94, 255), 'L': (134, 239, 172, 255), 'Y': (254, 240, 138, 255)}
bamboo_rows = [
    "...............KK...............",
    "..............KGK...............",
    ".............KLGGK..............",
    "............KLGGGGK.............",
    "...........KLGGGGGGK............",
    "..........KLGGGGGGGGK...........",
    ".........KLGGDDDDGGGGK..........",
    ".......KLGGDDDDDDDDGGGGK........",
    ".....KLGGDDDDDDDDDDDDGGGGK......",
    "....KLGGDDDDDDDDDDDDDDGGGGK.....",
    ".....KKKKKKKKKKKKKKKKKKKKK......",
    "......KYYYYYYYYYYYYYYYYYK......."
] + ["................................"] * 20
item_bamboo = make_sprite(32, 32, BAMBOO_PAL, bamboo_rows)

HONEY_PAL = {'.': None, 'K': (69, 26, 3, 255), 'Y': (251, 191, 36, 255), 'L': (254, 240, 138, 255), 'R': (220, 38, 38, 255), 'G': (120, 53, 15, 255)}
honey_rows = [
    "............KKKKKKKK............",
    "...........KRRRRRRRRK...........",
    "..........KGGGGGGGGGGK..........",
    "........KGGLLYYYYYYLLGGK........",
    "......KGGLLYYYYYYYYYYLLGGK......",
    "......KGGLLYYYYYYYYYYLLGGK......",
    "........KGGLLYYYYYYLLGGK........",
    "..........KGGGGGGGGGGK.........."
] + ["................................"] * 24
item_honey = make_sprite(32, 32, HONEY_PAL, honey_rows)

# 基礎畫面生成底圖
def render_base_scene(road_tile, safe_tile, water_tile):
    im = Image.new("RGB", (W, H), (10, 14, 26))
    for lane in range(11):
        y = lane * LANE_H
        if lane in [0, 4, 10]:
            tile = safe_tile
        elif lane in [1, 2, 3]:
            tile = water_tile
        else:
            tile = road_tile
        for x in range(0, W, 32):
            im.paste(tile, (x, y))
    
    # 畫出車道虛線
    draw = ImageDraw.Draw(im)
    for lane in range(5, 10):
        y = (lane + 1) * LANE_H - 2
        for x in range(0, W, 40):
            draw.line([(x, y), (x + 20, y)], fill=(250, 204, 21), width=2)
            
    # 畫出 5 個終點安全家園
    for cx in [70, 210, 350, 490, 630]:
        draw.rounded_rectangle([cx - 32, 6, cx + 32, 44], radius=8, fill=(15, 23, 42), outline=(51, 65, 85), width=2)
        # 繪製插槽標誌
        draw.text((cx - 8, 14), "🎋", fill=(34, 197, 94))
        
    return im

def draw_hud(im, score=0, level=1, lives=3, highscore=2450):
    draw = ImageDraw.Draw(im)
    # 頂部 HUD 條
    draw.rectangle([0, 0, W, 36], fill=(19, 27, 46))
    draw.line([(0, 36), (W, 36)], fill=(15, 52, 96), width=2)
    # HUD 文字
    heart_str = "❤️" * lives + "🖤" * (3 - lives)
    draw.text((16, 8), f"LIFE: {heart_str}", fill=(244, 114, 182))
    draw.text((180, 8), f"SCORE: {score:05d}", fill=(255, 215, 0))
    draw.text((360, 8), f"STAGE: {level}", fill=(255, 255, 255))
    draw.text((490, 8), f"HI-SCORE: {highscore:05d}", fill=(233, 69, 96))
    draw.text((660, 8), "🔊", fill=(255, 255, 255))

# 渲染截圖 1：開始畫面 (Start Screen Overlay)
def gen_screenshot_start():
    im = render_base_scene(tile_road, tile_grass, tile_water)
    draw_hud(im, 0, 1, 3, 3200)
    
    # 加上深色半透明遮罩
    overlay = Image.new("RGBA", (W, H), (6, 11, 25, 225))
    im.paste(overlay, (0, 0), overlay)
    
    draw = ImageDraw.Draw(im)
    # 彈窗對話框
    box_w, box_h = 560, 440
    bx, by = (W - box_w) // 2, (H - box_h) // 2 + 10
    draw.rounded_rectangle([bx, by, bx + box_w, by + box_h], radius=14, fill=(15, 23, 42), outline=(15, 52, 96), width=3)
    
    # 大標題
    draw.text((bx + 110, by + 25), "🐻 台灣黑熊過街", fill=(255, 255, 255), font_size=28)
    draw.text((bx + 105, by + 65), "Formosan Bear Crossing (Pixel Arcade)", fill=(250, 204, 21), font_size=15)
    
    # 黑熊大預覽
    big_bear = bear_img.resize((64, 64), Image.NEAREST)
    im.paste(big_bear, (bx + box_w // 2 - 32, by + 95), big_bear)
    
    # 操作指引框
    ibx, iby, ibw, ibh = bx + 35, by + 175, box_w - 70, 175
    draw.rounded_rectangle([ibx, iby, ibx + ibw, iby + ibh], radius=10, fill=(30, 41, 59), outline=(71, 85, 105), width=1)
    
    draw.text((ibx + 20, iby + 15), "🎮 移動：[↑][↓][←][→] 或 [W][A][S][D]（支援觸控滑動）", fill=(241, 245, 249))
    draw.text((ibx + 20, iby + 45), "🛵 馬路：閃避台灣特色機車、計程車、公車與紅綠燈", fill=(241, 245, 249))
    draw.text((ibx + 20, iby + 75), "🪵 河流：踩上浮木與烏龜過河，當心烏龜會定時下潛！", fill=(241, 245, 249))
    draw.text((ibx + 20, iby + 105), "🎋 道具：採集竹筍敏捷加速、拾取蜂蜜獲得碰撞防護盾", fill=(241, 245, 249))
    draw.text((ibx + 20, iby + 135), "🏠 目標：護送黑熊安全抵達上方 5 個竹林家園即可通關", fill=(241, 245, 249))
    
    # 開始按鈕
    btn_w, btn_h = 200, 44
    btn_x, btn_y = bx + (box_w - btn_w) // 2, by + 370
    draw.rounded_rectangle([btn_x, btn_y, btn_x + btn_w, btn_y + btn_h], radius=8, fill=(233, 69, 96), outline=(198, 40, 40), width=2)
    draw.text((btn_x + 45, btn_y + 12), "🎮 開始遊戲", fill=(255, 255, 255), font_size=18)
    
    im.save("docs/screenshots/screenshot_start.png")
    print("Saved screenshot_start.png")

# 渲染截圖 2：市區道路 (Urban Street Gameplay)
def gen_screenshot_urban():
    im = render_base_scene(tile_road, tile_grass, tile_water)
    draw_hud(im, 480, 1, 3, 2450)
    
    # 浮木與烏龜
    im.paste(obs_log, (80, 1 * LANE_H + 9), obs_log)
    im.paste(obs_log, (380, 1 * LANE_H + 9), obs_log)
    im.paste(obs_turtle, (160, 2 * LANE_H + 9), obs_turtle)
    im.paste(obs_turtle, (200, 2 * LANE_H + 9), obs_turtle)
    im.paste(obs_turtle, (460, 2 * LANE_H + 9), obs_turtle)
    im.paste(obs_log, (240, 3 * LANE_H + 9), obs_log)
    
    # 道具
    im.paste(item_bamboo, (480, 4 * LANE_H + 9), item_bamboo)
    
    # 車輛 (市區)
    im.paste(obs_scooter, (120, 5 * LANE_H + 9), obs_scooter)
    im.paste(obs_scooter, (340, 5 * LANE_H + 9), obs_scooter)
    im.paste(obs_taxi, (220, 6 * LANE_H + 9), obs_taxi)
    im.paste(obs_bus, (80, 8 * LANE_H + 9), obs_bus)
    im.paste(obs_taxi, (480, 9 * LANE_H + 9), obs_taxi)
    
    # 紅綠燈 (車道 7)
    draw = ImageDraw.Draw(im)
    draw.rectangle([6, 7 * LANE_H + 8, 20, 7 * LANE_H + 42], fill=(15, 23, 42))
    draw.ellipse([9, 7 * LANE_H + 12, 17, 7 * LANE_H + 20], fill=(239, 68, 68)) # 紅燈
    draw.ellipse([9, 7 * LANE_H + 26, 17, 7 * LANE_H + 34], fill=(51, 65, 85))
    # 停在紅綠燈前的車輛
    draw.text((28, 7 * LANE_H + 14), "RED LIGHT", fill=(239, 68, 68), font_size=10)
    
    # 玩家黑熊（在車道 6 避讓計程車過街中）
    im.paste(bear_img, (350, 6 * LANE_H + 9), bear_img)
    
    # 家園已有 1 隻黑熊抵達
    im.paste(bear_img, (210 - 16, 9), bear_img)
    
    im.save("docs/screenshots/screenshot_gameplay_urban.png")
    print("Saved screenshot_gameplay_urban.png")

# 渲染截圖 3：山區道路 (Mountain Trail Gameplay)
def gen_screenshot_mountain():
    im = render_base_scene(tile_dirt, tile_grass, tile_water)
    draw_hud(im, 1850, 3, 2, 2450)
    
    # 浮木與急流
    im.paste(obs_log, (140, 1 * LANE_H + 9), obs_log)
    im.paste(obs_turtle, (280, 2 * LANE_H + 9), obs_turtle)
    im.paste(obs_log, (40, 3 * LANE_H + 9), obs_log)
    im.paste(obs_log, (420, 3 * LANE_H + 9), obs_log)
    
    # 道具 (蜂蜜罐)
    im.paste(item_honey, (220, 4 * LANE_H + 9), item_honey)
    
    # 台灣特色黃藍垃圾車
    im.paste(obs_truck, (160, 5 * LANE_H + 9), obs_truck)
    im.paste(obs_scooter, (380, 6 * LANE_H + 9), obs_scooter)
    im.paste(obs_truck, (460, 7 * LANE_H + 9), obs_truck)
    im.paste(obs_truck, (80, 9 * LANE_H + 9), obs_truck)
    
    # 玩家黑熊（已獲得蜂蜜防護盾金圈）
    draw = ImageDraw.Draw(im)
    draw.ellipse([345 - 24, 4 * LANE_H + 25 - 24, 345 + 24, 4 * LANE_H + 25 + 24], outline=(250, 204, 21), width=3)
    im.paste(bear_img, (345 - 16, 4 * LANE_H + 9), bear_img)
    
    im.save("docs/screenshots/screenshot_gameplay_mountain.png")
    print("Saved screenshot_gameplay_mountain.png")

# 渲染截圖 4：秀姑巒溪 (River Rapids Gameplay)
def gen_screenshot_rapids():
    im = render_base_scene(tile_road, tile_grass, tile_water)
    draw_hud(im, 3120, 4, 3, 3120)
    
    # 大急流水域，多重浮木與下潛烏龜
    im.paste(obs_log, (40, 1 * LANE_H + 9), obs_log)
    im.paste(obs_log, (300, 1 * LANE_H + 9), obs_log)
    im.paste(obs_log, (560, 1 * LANE_H + 9), obs_log)
    
    # 下潛烏龜（冒泡半透明水花）
    draw = ImageDraw.Draw(im)
    draw.ellipse([210, 2 * LANE_H + 16, 234, 2 * LANE_H + 34], fill=(7, 89, 133), outline=(56, 189, 248), width=2)
    draw.text((214, 2 * LANE_H + 18), "🫧", fill=(255, 255, 255))
    
    im.paste(obs_turtle, (380, 2 * LANE_H + 9), obs_turtle)
    im.paste(obs_turtle, (420, 2 * LANE_H + 9), obs_turtle)
    
    im.paste(obs_log, (180, 3 * LANE_H + 9), obs_log)
    im.paste(obs_log, (460, 3 * LANE_H + 9), obs_log)
    
    # 黑熊站在浮木上渡河！
    im.paste(bear_img, (200, 3 * LANE_H + 9), bear_img)
    
    # 車道車流
    im.paste(obs_taxi, (80, 5 * LANE_H + 9), obs_taxi)
    im.paste(obs_scooter, (320, 6 * LANE_H + 9), obs_scooter)
    im.paste(obs_bus, (460, 8 * LANE_H + 9), obs_bus)
    
    # 頂部已有 4 隻黑熊回到家園，差最後 1 隻！
    for cx in [70, 210, 350, 490]:
        im.paste(bear_img, (cx - 16, 9), bear_img)
        
    im.save("docs/screenshots/screenshot_gameplay_rapids.png")
    print("Saved screenshot_gameplay_rapids.png")

if __name__ == "__main__":
    gen_screenshot_start()
    gen_screenshot_urban()
    gen_screenshot_mountain()
    gen_screenshot_rapids()
    print("All screenshots generated successfully!")
