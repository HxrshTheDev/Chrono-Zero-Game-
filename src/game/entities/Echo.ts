import { CONFIG, Rect } from '../GameConfig.ts';
import { ParticleSystem } from '../systems/ParticleSystem.ts';
import { PlayerHistorySample } from '../systems/TimeRecorder.ts';

export class Echo {
  public x: number = 0;
  public y: number = 0;
  public width: number = 26;
  public height: number = 44;
  public facing: 1 | -1 = 1;
  public isGrounded: boolean = false;
  public isActive: boolean = false;

  private timeline: PlayerHistorySample[] = [];
  private playbackIndex: number = 0;
  private scanlineY: number = 0;

  public spawn(timeline: PlayerHistorySample[], particles: ParticleSystem): void {
    if (timeline.length === 0) return;

    this.timeline = timeline;
    this.playbackIndex = 0;
    this.isActive = true;

    const first = timeline[0];
    this.x = first.x;
    this.y = first.y;
    this.facing = first.facing;
    this.isGrounded = first.isGrounded;

    // Burst of cyan holographic energy on manifestation
    particles.emit(
      this.x + this.width / 2,
      this.y + this.height / 2,
      18,
      CONFIG.COLORS.cyan,
      120,
      0.45,
      3,
      true
    );
  }

  public update(dt: number, particles: ParticleSystem): void {
    if (!this.isActive) return;

    this.playbackIndex += dt / CONFIG.SAMPLE_INTERVAL;
    const idx = Math.floor(this.playbackIndex);

    if (idx >= this.timeline.length) {
      this.despawn(particles);
      return;
    }

    const sample = this.timeline[idx];
    this.x = sample.x;
    this.y = sample.y;
    this.facing = sample.facing;
    this.isGrounded = sample.isGrounded;

    this.scanlineY = (this.scanlineY + dt * 60) % this.height;

    // Subtle ghost trail particle
    if (Math.random() < 0.3) {
      particles.emit(
        this.x + this.width / 2 + (Math.random() - 0.5) * 10,
        this.y + this.height / 2 + (Math.random() - 0.5) * 20,
        1,
        CONFIG.COLORS.cyanGhost,
        15,
        0.3,
        2,
        false
      );
    }
  }

  public despawn(particles: ParticleSystem): void {
    if (!this.isActive) return;
    this.isActive = false;

    // Echo dissolution puff
    particles.emit(
      this.x + this.width / 2,
      this.y + this.height / 2,
      14,
      CONFIG.COLORS.cyan,
      90,
      0.35,
      2,
      true
    );
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
    if (!this.isActive) return;

    const rx = this.x - camX;
    const ry = this.y - camY;

    ctx.save();
    ctx.translate(rx + this.width / 2, ry + this.height / 2);
    ctx.scale(this.facing, 1);

    const w = this.width;
    const h = this.height;

    // Transparent holographic glow
    ctx.globalAlpha = 0.65;
    ctx.shadowColor = CONFIG.COLORS.cyan;
    ctx.shadowBlur = 12;

    // Silhouette
    ctx.fillStyle = CONFIG.COLORS.cyan;
    ctx.fillRect(-w / 2 + 3, -h / 2 + 10, w - 6, h - 22);

    // Visor Head
    ctx.fillRect(-w / 2 + 2, -h / 2, w - 4, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -h / 2 + 3, w / 2 - 2, 4);

    // Legs
    ctx.fillStyle = 'rgba(0, 243, 255, 0.8)';
    ctx.fillRect(-w / 2 + 4, h / 2 - 12, 6, 12);
    ctx.fillRect(w / 2 - 10, h / 2 - 12, 6, 12);

    // Hologram horizontal glitch / scanline
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(-w / 2 - 2, -h / 2 + this.scanlineY, w + 4, 2);

    ctx.restore();
  }
}
