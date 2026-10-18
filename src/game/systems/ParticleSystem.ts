export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  glow?: boolean;
}

export class ParticleSystem {
  private particles: Particle[] = [];

  public emit(
    x: number,
    y: number,
    count: number,
    color: string,
    speed: number = 100,
    maxLife: number = 0.5,
    size: number = 3,
    glow: boolean = false
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 0.7 + 0.3) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0,
        maxLife: maxLife * (0.6 + Math.random() * 0.4),
        size,
        color,
        glow,
      });
    }
  }

  public emitDirectional(
    x: number,
    y: number,
    count: number,
    color: string,
    angle: number,
    spread: number,
    speed: number = 80,
    maxLife: number = 0.4,
    size: number = 2
  ): void {
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const spd = (Math.random() * 0.6 + 0.4) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 0,
        maxLife: maxLife * (0.7 + Math.random() * 0.3),
        size,
        color,
      });
    }
  }

  public update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    if (this.particles.length === 0) return;

    for (const p of this.particles) {
      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      const rx = p.x - camX - p.size / 2;
      const ry = p.y - camY - p.size / 2;

      ctx.save();
      ctx.globalAlpha = alpha;
      if (p.glow) {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
      }
      ctx.fillStyle = p.color;
      ctx.fillRect(rx, ry, p.size, p.size);
      ctx.restore();
    }
  }

  public clear(): void {
    this.particles = [];
  }
}
