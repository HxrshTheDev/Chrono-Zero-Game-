import { CONFIG, Rect } from '../GameConfig.ts';
import { ParticleSystem } from '../systems/ParticleSystem.ts';

export class Player {
  public x: number;
  public y: number;
  public width: number = 26;
  public height: number = 44;
  public vx: number = 0;
  public vy: number = 0;
  public facing: 1 | -1 = 1;
  public isGrounded: boolean = false;

  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private animTimer: number = 0;
  private squashStretchX: number = 1;
  private squashStretchY: number = 1;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public getRect(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  public setPosition(x: number, y: number, facing: 1 | -1 = 1) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = facing;
  }

  public update(
    dt: number,
    isLeft: boolean,
    isRight: boolean,
    jumpPressed: boolean,
    jumpHeld: boolean,
    solids: Rect[],
    particles: ParticleSystem,
    onJump?: () => void
  ): void {
    // Timers
    if (this.isGrounded) {
      this.coyoteTimer = CONFIG.COYOTE_TIME;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    if (jumpPressed) {
      this.jumpBufferTimer = CONFIG.JUMP_BUFFER_TIME;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    }

    // Horizontal acceleration / deceleration
    let targetVx = 0;
    if (isLeft && !isRight) {
      targetVx = -CONFIG.PLAYER_SPEED;
      this.facing = -1;
    } else if (isRight && !isLeft) {
      targetVx = CONFIG.PLAYER_SPEED;
      this.facing = 1;
    }

    if (targetVx !== 0) {
      if (this.vx < targetVx) {
        this.vx = Math.min(targetVx, this.vx + CONFIG.PLAYER_ACCEL * dt);
      } else if (this.vx > targetVx) {
        this.vx = Math.max(targetVx, this.vx - CONFIG.PLAYER_ACCEL * dt);
      }
    } else {
      // Decelerate to stop
      if (this.vx > 0) {
        this.vx = Math.max(0, this.vx - CONFIG.PLAYER_DECEL * dt);
      } else if (this.vx < 0) {
        this.vx = Math.min(0, this.vx + CONFIG.PLAYER_DECEL * dt);
      }
    }

    // Jump handling with Coyote Time & Buffer
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.vy = -CONFIG.PLAYER_JUMP_FORCE;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.squashStretchX = 0.75;
      this.squashStretchY = 1.35;
      particles.emit(
        this.x + this.width / 2,
        this.y + this.height,
        8,
        CONFIG.COLORS.cyan,
        60,
        0.25,
        2
      );
      if (onJump) onJump();
    }

    // Variable jump height (releasing jump cuts upward velocity)
    if (!jumpHeld && this.vy < -150) {
      this.vy += CONFIG.GRAVITY * 1.5 * dt;
    } else {
      this.vy += CONFIG.GRAVITY * dt;
    }

    // Recover squash & stretch
    this.squashStretchX += (1 - this.squashStretchX) * Math.min(1, dt * 14);
    this.squashStretchY += (1 - this.squashStretchY) * Math.min(1, dt * 14);

    // X Axis Movement & Collision
    this.x += this.vx * dt;
    let box = this.getRect();
    for (const s of solids) {
      if (this.overlaps(box, s)) {
        if (this.vx > 0) {
          this.x = s.x - this.width;
        } else if (this.vx < 0) {
          this.x = s.x + s.width;
        }
        this.vx = 0;
        box = this.getRect();
      }
    }

    // Y Axis Movement & Collision
    const wasGrounded = this.isGrounded;
    this.y += this.vy * dt;
    this.isGrounded = false;
    box = this.getRect();

    for (const s of solids) {
      if (this.overlaps(box, s)) {
        if (this.vy > 0) {
          this.y = s.y - this.height;
          this.vy = 0;
          this.isGrounded = true;
          if (!wasGrounded) {
            // Landing impact
            this.squashStretchX = 1.3;
            this.squashStretchY = 0.75;
            particles.emit(
              this.x + this.width / 2,
              this.y + this.height,
              6,
              CONFIG.COLORS.cyanDark,
              50,
              0.2,
              2
            );
          }
        } else if (this.vy < 0) {
          this.y = s.y + s.height;
          this.vy = 0;
        }
        box = this.getRect();
      }
    }

    // Bounds safety clamping
    if (this.x < 10) this.x = 10;
    if (this.x + this.width > CONFIG.WORLD_WIDTH - 10) {
      this.x = CONFIG.WORLD_WIDTH - 10 - this.width;
    }

    // Run animation
    if (Math.abs(this.vx) > 15 && this.isGrounded) {
      this.animTimer += dt * 12;
    } else {
      this.animTimer = 0;
    }
  }

  private overlaps(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const rx = this.x - camX;
    const ry = this.y - camY;

    ctx.save();
    ctx.translate(rx + this.width / 2, ry + this.height / 2);
    ctx.scale(this.facing * this.squashStretchX, this.squashStretchY);

    const w = this.width;
    const h = this.height;

    // Body shadow
    ctx.fillStyle = '#060a12';
    ctx.fillRect(-w / 2 + 2, -h / 2 + 10, w - 4, h - 22);

    // Cybernetic Longcoat / Vest
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-w / 2 + 3, -h / 2 + 10, w - 6, h - 22);

    // Neon Cyan Power Core Harness
    ctx.save();
    ctx.fillStyle = CONFIG.COLORS.cyan;
    ctx.shadowColor = CONFIG.COLORS.cyan;
    ctx.shadowBlur = 8;
    ctx.fillRect(-w / 2 + 5, -h / 2 + 15, w - 10, 3);
    ctx.fillRect(-2, -h / 2 + 15, 4, 10);
    ctx.restore();

    // Cybernetic Visor Helmet
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-w / 2 + 2, -h / 2, w - 4, 12);

    // Glowing Cyan Visor Line
    ctx.save();
    ctx.fillStyle = CONFIG.COLORS.cyan;
    ctx.shadowColor = CONFIG.COLORS.cyan;
    ctx.shadowBlur = 6;
    ctx.fillRect(0, -h / 2 + 3, w / 2 - 2, 4);
    ctx.restore();

    // Procedural leg stride
    const legOffset = Math.sin(this.animTimer) * 4;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-w / 2 + 4, h / 2 - 12, 6, 12 + legOffset);
    ctx.fillRect(w / 2 - 10, h / 2 - 12, 6, 12 - legOffset);

    // Neon Boots
    ctx.fillStyle = CONFIG.COLORS.cyanDark;
    ctx.fillRect(-w / 2 + 3, h / 2 - 3 + legOffset, 8, 3);
    ctx.fillRect(w / 2 - 11, h / 2 - 3 - legOffset, 8, 3);

    ctx.restore();
  }
}
