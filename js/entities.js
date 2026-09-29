/**
 * 🐻 台灣黑熊過街 — 實體類別與遊戲機制邏輯模組 (Entities)
 */
window.BearEntities = (function() {
  'use strict';

  const GAME_W = 700;
  const LANE_H = 50;
  const CELL_W = 50;
  const BEAR_SIZE = 32;

  // ===== 1. 玩家黑熊類別 =====
  class Player {
    constructor() {
      this.reset();
    }

    reset() {
      this.laneIdx = 10; // 起點安全區
      this.x = Math.floor(GAME_W / 2 / CELL_W) * CELL_W + (CELL_W - BEAR_SIZE) / 2;
      this.y = this.laneIdx * LANE_H + (LANE_H - BEAR_SIZE) / 2;
      this.w = BEAR_SIZE;
      this.h = BEAR_SIZE;

      this.isHopping = false;
      this.hopTimer = 0;
      this.isDying = false;
      this.dieTimer = 0;
      this.dieRotation = 0;

      // 道具狀態
      this.hasShield = false;
      this.speedBoostTimer = 0;
      this.invincibleTimer = 0;
      this.lastMoveTime = -1000;
    }

    move(dx, dy) {
      if (this.isDying) return false;

      const now = performance.now();
      const cooldown = this.speedBoostTimer > 0 ? 65 : 120;
      if (now - this.lastMoveTime < cooldown) return false;

      const targetX = this.x + dx * CELL_W;
      const targetLane = this.laneIdx + dy;

      // 邊界檢查
      if (targetX < 0 || targetX + this.w > GAME_W) return false;
      if (targetLane < 0 || targetLane >= 11) return false;

      this.x = targetX;
      this.laneIdx = targetLane;
      this.y = this.laneIdx * LANE_H + (LANE_H - BEAR_SIZE) / 2;

      this.isHopping = true;
      this.hopTimer = 0.15; // 0.15 秒跳躍動畫
      this.lastMoveTime = now;
      return true;
    }

    update(delta) {
      // 道具加速時間倒數
      if (this.speedBoostTimer > 0) {
        this.speedBoostTimer = Math.max(0, this.speedBoostTimer - delta);
      }

      // 無敵幀倒數
      if (this.invincibleTimer > 0) {
        this.invincibleTimer = Math.max(0, this.invincibleTimer - delta);
      }

      // 跳躍動作計時
      if (this.isHopping) {
        this.hopTimer -= delta;
        if (this.hopTimer <= 0) {
          this.isHopping = false;
        }
      }

      // 死亡旋轉縮小動畫
      if (this.isDying) {
        this.dieTimer += delta;
        this.dieRotation += delta * 12;
      }
    }

    draw(ctx) {
      ctx.save();
      const centerX = this.x + this.w / 2;
      const centerY = this.y + this.h / 2;

      if (this.isDying) {
        const scale = Math.max(0, 1 - this.dieTimer * 1.4);
        ctx.translate(centerX, centerY);
        ctx.rotate(this.dieRotation);
        ctx.scale(scale, scale);

        const deadSprite = window.BearSprites.get('bear_dead');
        if (deadSprite) {
          ctx.drawImage(deadSprite, -this.w / 2, -this.h / 2, this.w, this.h);
        }
        ctx.restore();
        return;
      }

      // 蜂蜜護盾光圈渲染
      if (this.hasShield) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 受擊無敵閃爍
      if (this.invincibleTimer > 0) {
        if (Math.floor(this.invincibleTimer * 12) % 2 === 0) {
          ctx.globalAlpha = 0.35;
        }
      }

      // 跳躍彈跳縮放效果
      ctx.translate(centerX, centerY);
      if (this.isHopping) {
        ctx.scale(1.15, 1.15);
        ctx.translate(0, -4);
      }

      const spriteKey = this.isHopping ? 'bear_hop' : 'bear_idle';
      const sprite = window.BearSprites.get(spriteKey);
      if (sprite) {
        ctx.drawImage(sprite, -this.w / 2, -this.h / 2, this.w, this.h);
      } else {
        // Fallback
        ctx.fillStyle = '#111827';
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
      }

      ctx.restore();
    }
  }

  // ===== 2. 車輛障礙物類別 =====
  class Vehicle {
    constructor(laneIdx, x, w, speed, dir, spriteKey, hasTrafficLight) {
      this.laneIdx = laneIdx;
      this.x = x;
      this.y = laneIdx * LANE_H + (LANE_H - 32) / 2;
      this.w = w;
      this.h = 32;
      this.speed = speed;
      this.dir = dir; // 1: 向右, -1: 向左
      this.spriteKey = spriteKey;
      this.hasTrafficLight = !!hasTrafficLight;
    }

    update(delta, speedMul, isRedLight) {
      // 若處於紅燈狀態且此車道具備紅綠燈，車輛暫停
      const effectiveSpeed = (this.hasTrafficLight && isRedLight) ? 0 : this.speed * speedMul;
      this.x += effectiveSpeed * this.dir * 60 * delta;

      // 邊界回繞 (Wrap around)
      if (this.dir === 1 && this.x > GAME_W + 60) {
        this.x = -this.w - 30;
      } else if (this.dir === -1 && this.x + this.w < -60) {
        this.x = GAME_W + 30;
      }
    }

    draw(ctx) {
      const sprite = window.BearSprites.get(this.spriteKey);
      ctx.save();
      if (this.dir === -1) {
        // 鏡像水平翻轉
        ctx.translate(this.x + this.w, this.y);
        ctx.scale(-1, 1);
        if (sprite) {
          ctx.drawImage(sprite, 0, 0, this.w, this.h);
        }
      } else {
        if (sprite) {
          ctx.drawImage(sprite, this.x, this.y, this.w, this.h);
        }
      }
      ctx.restore();
    }

    // 依載具種類配置水平/垂直內縮量（80%~85% 實體像素判定，提供街機 Near-Miss 擦身寬容度）
    getHitboxPadding() {
      switch (this.spriteKey) {
        case 'scooter':
          return { padX: 7, padY: 4 };
        case 'taxi':
          return { padX: 8, padY: 4 };
        case 'bus':
        case 'truck':
          return { padX: 9, padY: 4 };
        default:
          return { padX: 6, padY: 4 };
      }
    }

    // AABB 碰撞檢測（實體核心判定 + 黑熊軀幹容錯）
    checkCollision(player) {
      const { padX, padY } = this.getHitboxPadding();
      const playerPadX = 5;
      const playerPadY = 4;

      return (
        player.x + player.w - playerPadX > this.x + padX &&
        player.x + playerPadX < this.x + this.w - padX &&
        player.y + player.h - playerPadY > this.y + padY &&
        player.y + playerPadY < this.y + this.h - padY
      );
    }
  }

  // ===== 3. 河流載具（浮木與烏龜） =====
  class RiverEntity {
    constructor(laneIdx, x, w, speed, dir, spriteKey, canDive) {
      this.laneIdx = laneIdx;
      this.x = x;
      this.y = laneIdx * LANE_H + (LANE_H - 32) / 2;
      this.w = w;
      this.h = 32;
      this.speed = speed;
      this.dir = dir;
      this.spriteKey = spriteKey;
      this.canDive = !!canDive;

      // 潛水計時器（4 秒浮起 -> 1.2 秒冒泡警告 -> 2 秒沉沒下潛）
      this.diveCycle = 7.2;
      this.diveTimer = Math.random() * this.diveCycle;
      this.submergedState = 'float'; // 'float', 'warning', 'submerged'
    }

    update(delta, speedMul) {
      this.x += this.speed * speedMul * this.dir * 60 * delta;

      if (this.dir === 1 && this.x > GAME_W + 60) {
        this.x = -this.w - 30;
      } else if (this.dir === -1 && this.x + this.w < -60) {
        this.x = GAME_W + 30;
      }

      if (this.canDive) {
        this.diveTimer = (this.diveTimer + delta) % this.diveCycle;
        if (this.diveTimer < 4.0) {
          this.submergedState = 'float';
        } else if (this.diveTimer < 5.2) {
          this.submergedState = 'warning';
        } else {
          this.submergedState = 'submerged';
        }
      }
    }

    draw(ctx) {
      ctx.save();
      let key = this.spriteKey;

      if (this.canDive) {
        if (this.submergedState === 'warning') {
          // 冒泡警告
          key = 'obs_turtle_dive';
        } else if (this.submergedState === 'submerged') {
          // 完全下潛，微弱水花
          ctx.globalAlpha = 0.25;
          key = 'obs_turtle_dive';
        }
      }

      const sprite = window.BearSprites.get(key);
      if (sprite) {
        // 重複貼圖以填滿寬度
        for (let offset = 0; offset < this.w; offset += 32) {
          const drawW = Math.min(32, this.w - offset);
          ctx.drawImage(sprite, 0, 0, drawW, 32, this.x + offset, this.y, drawW, 32);
        }
      }
      ctx.restore();
    }

    // 檢查黑熊是否踩在上方且載具處於可乘載狀態
    isCarrying(player) {
      if (this.canDive && this.submergedState === 'submerged') {
        return false;
      }
      const pad = 2;
      return (
        player.x + player.w - pad > this.x &&
        player.x + pad < this.x + this.w &&
        player.laneIdx === this.laneIdx
      );
    }
  }

  // ===== 4. 道具實體（竹筍 / 蜂蜜罐） =====
  class ItemPickup {
    constructor(type, laneIdx, x) {
      this.type = type; // 'bamboo' 或 'honey'
      this.laneIdx = laneIdx;
      this.x = x;
      this.y = laneIdx * LANE_H + (LANE_H - 32) / 2;
      this.w = 32;
      this.h = 32;
      this.active = true;
      this.animTime = Math.random() * Math.PI * 2;
    }

    update(delta) {
      this.animTime += delta * 3;
    }

    draw(ctx) {
      if (!this.active) return;
      const floatY = Math.sin(this.animTime) * 3;
      const spriteKey = this.type === 'bamboo' ? 'item_bamboo' : 'item_honey';
      const sprite = window.BearSprites.get(spriteKey);

      if (sprite) {
        ctx.drawImage(sprite, this.x, this.y + floatY, this.w, this.h);
      }
    }

    checkOverlap(player) {
      if (!this.active) return false;
      return (
        player.laneIdx === this.laneIdx &&
        Math.abs(player.x - this.x) < 26
      );
    }
  }

  return {
    Player: Player,
    Vehicle: Vehicle,
    RiverEntity: RiverEntity,
    ItemPickup: ItemPickup
  };
})();
