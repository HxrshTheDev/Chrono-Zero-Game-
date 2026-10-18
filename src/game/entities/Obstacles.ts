import { CONFIG, Rect } from '../GameConfig.ts';

export class PressureSwitch {
  public x: number;
  public y: number;
  public width: number = 64;
  public height: number = 14;
  public pressed: boolean = false;

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

  public checkPress(occupants: Rect[]): boolean {
    const wasPressed = this.pressed;
    this.pressed = occupants.some((o) => {
      return (
        o.x < this.x + this.width &&
        o.x + o.width > this.x &&
        o.y + o.height >= this.y - 2 &&
        o.y + o.height <= this.y + this.height + 8
      );
    });
    return this.pressed && !wasPressed; // returns true on leading edge click
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const rx = this.x - camX;
    const ry = this.y - camY;

    // Base plate
    ctx.fillStyle = '#111827';
    ctx.fillRect(rx, ry + 6, this.width, this.height - 6);

    // Depressing plate
    const depress = this.pressed ? 5 : 0;
    const color = this.pressed ? CONFIG.COLORS.green : CONFIG.COLORS.cyan;

    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = this.pressed ? 8 : 4;
    ctx.fillRect(rx + 4, ry + depress, this.width - 8, 6);
    ctx.restore();
  }
}

export class BlastDoor {
  public x: number;
  public y: number;
  public width: number = 24;
  public height: number = 120;
  public openProgress: number = 0; // 0 = fully closed, 1 = fully open

  constructor(x: number, y: number, width: number = 24, height: number = 120) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public update(dt: number, open: boolean): void {
    if (open) {
      this.openProgress = Math.min(1, this.openProgress + dt * 3.5);
    } else {
      this.openProgress = Math.max(0, this.openProgress - dt * 4.0);
    }
  }

  public isSolid(): boolean {
    return this.openProgress < 0.85;
  }

  public getSolidRect(): Rect | null {
    if (!this.isSolid()) return null;
    const currentHeight = this.height * (1 - this.openProgress);
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: currentHeight,
    };
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const rx = this.x - camX;
    const ry = this.y - camY;

    // Door track frame
    ctx.strokeStyle = '#22385e';
    ctx.lineWidth = 2;
    ctx.strokeRect(rx - 2, ry, this.width + 4, this.height);

    // Sliding hydraulic gate
    const visibleH = this.height * (1 - this.openProgress);
    if (visibleH > 2) {
      // Door panel
      ctx.fillStyle = '#1c2f50';
      ctx.fillRect(rx, ry, this.width, visibleH);

      // Warning stripes & hydraulic pistons
      ctx.fillStyle = '#ffb700';
      for (let y = ry + 8; y < ry + visibleH - 8; y += 22) {
        ctx.fillRect(rx + 4, y, this.width - 8, 4);
      }

      ctx.fillStyle = '#00f3ff';
      ctx.fillRect(rx + 2, ry + visibleH - 4, this.width - 4, 4);
    }
  }
}

export class SecurityLaser {
  public x: number;
  public y: number;
  public width: number = 8;
  public height: number = 160;
  public active: boolean = true;
  private animTimer: number = 0;

  constructor(x: number, y: number, width: number = 8, height: number = 160) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public update(dt: number, active: boolean): void {
    this.active = active;
    this.animTimer += dt * 10;
  }

  public getRect(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const rx = this.x - camX;
    const ry = this.y - camY;

    // Emitter terminals top & bottom
    ctx.fillStyle = '#2d141b';
    ctx.fillRect(rx - 6, ry - 6, this.width + 12, 6);
    ctx.fillRect(rx - 6, ry + this.height, this.width + 12, 6);

    ctx.fillStyle = this.active ? CONFIG.COLORS.redHazard : '#55222b';
    ctx.fillRect(rx - 3, ry - 3, this.width + 6, 3);
    ctx.fillRect(rx - 3, ry + this.height, this.width + 6, 3);

    // Active lethal laser beam
    if (this.active) {
      ctx.save();
      const pulseWidth = this.width + Math.sin(this.animTimer) * 2;
      ctx.fillStyle = CONFIG.COLORS.redHazard;
      ctx.shadowColor = CONFIG.COLORS.redHazard;
      ctx.shadowBlur = 14;
      ctx.fillRect(rx - (pulseWidth - this.width) / 2, ry, pulseWidth, this.height);

      // Bright white core laser beam
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rx + 2, ry, 2, this.height);
      ctx.restore();
    }
  }
}

export class ChronoCore {
  public x: number;
  public y: number;
  public width: number = 28;
  public height: number = 28;
  public collected: boolean = false;
  private animTimer: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public update(dt: number): void {
    if (!this.collected) {
      this.animTimer += dt * 3.5;
    }
  }

  public getRect(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    if (this.collected) return;

    const bob = Math.sin(this.animTimer) * 6;
    const cx = this.x - camX + this.width / 2;
    const cy = this.y - camY + this.height / 2 + bob;

    ctx.save();
    ctx.translate(cx, cy);

    // Glowing energy orbit ring
    ctx.strokeStyle = 'rgba(255, 183, 0, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 20 + Math.sin(this.animTimer * 1.5) * 3, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating diamond core
    ctx.rotate(this.animTimer * 0.8);
    ctx.fillStyle = CONFIG.COLORS.amberCore;
    ctx.shadowColor = CONFIG.COLORS.amberCore;
    ctx.shadowBlur = 16;

    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(14, 0);
    ctx.lineTo(0, 14);
    ctx.lineTo(-14, 0);
    ctx.closePath();
    ctx.fill();

    // Inner bright spark
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(6, 0);
    ctx.lineTo(0, 6);
    ctx.lineTo(-6, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

export class ExitAirlock {
  public x: number;
  public y: number;
  public width: number = 54;
  public height: number = 90;
  public unlocked: boolean = false;
  private animTimer: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public update(dt: number, unlocked: boolean): void {
    this.unlocked = unlocked;
    this.animTimer += dt * 4;
  }

  public getRect(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const rx = this.x - camX;
    const ry = this.y - camY;

    const frameColor = this.unlocked ? CONFIG.COLORS.green : '#30425c';

    ctx.save();
    // Airlock Door Frame
    ctx.strokeStyle = frameColor;
    ctx.lineWidth = 3;
    if (this.unlocked) {
      ctx.shadowColor = CONFIG.COLORS.green;
      ctx.shadowBlur = 12;
    }
    ctx.strokeRect(rx, ry, this.width, this.height);

    // Interior portal energy when unlocked
    if (this.unlocked) {
      const grad = ctx.createLinearGradient(rx, ry, rx + this.width, ry);
      grad.addColorStop(0, 'rgba(0, 255, 102, 0.15)');
      grad.addColorStop(0.5, 'rgba(0, 255, 102, 0.4)');
      grad.addColorStop(1, 'rgba(0, 255, 102, 0.15)');
      ctx.fillStyle = grad;
      ctx.fillRect(rx + 2, ry + 2, this.width - 4, this.height - 4);

      // Sign text
      ctx.fillStyle = CONFIG.COLORS.green;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('EXTRACTION', rx + this.width / 2, ry - 6);
    } else {
      ctx.fillStyle = '#0f1726';
      ctx.fillRect(rx + 2, ry + 2, this.width - 4, this.height - 4);
      ctx.fillStyle = '#516584';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('LOCKED', rx + this.width / 2, ry - 6);
    }

    ctx.restore();
  }
}
