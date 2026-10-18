import { CONFIG, Rect } from '../GameConfig.ts';
import { ParticleSystem } from '../systems/ParticleSystem.ts';

export type GuardState = 'PATROL' | 'ALERT' | 'CHASE' | 'RETURN';

export class Guard {
  public x: number;
  public y: number;
  public width: number = 28;
  public height: number = 46;
  public facing: 1 | -1 = 1;
  public state: GuardState = 'PATROL';

  private waypoints: number[];
  private currentWaypointIndex: number = 0;
  private alertTimer: number = 0;
  private targetPos: { x: number; y: number } | null = null;
  private animTimer: number = 0;
  private initialX: number;
  private initialY: number;

  constructor(x: number, y: number, waypoints: number[]) {
    this.x = x;
    this.y = y;
    this.initialX = x;
    this.initialY = y;
    this.waypoints = waypoints;
    if (waypoints.length > 0) {
      this.facing = waypoints[0] > x ? 1 : -1;
    }
  }

  public reset(): void {
    this.x = this.initialX;
    this.y = this.initialY;
    this.state = 'PATROL';
    this.currentWaypointIndex = 0;
    this.alertTimer = 0;
    this.targetPos = null;
    this.animTimer = 0;
    if (this.waypoints.length > 0) {
      this.facing = this.waypoints[0] > this.x ? 1 : -1;
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

  public update(
    dt: number,
    playerRect: Rect,
    echoRect: Rect | null,
    particles: ParticleSystem,
    onAlert?: () => void
  ): { caughtPlayer: boolean; struckEcho: boolean } {
    this.animTimer += dt * 7;
    let caughtPlayer = false;
    let struckEcho = false;

    const seesPlayer = this.checkVision(playerRect);
    const seesEcho = echoRect ? this.checkVision(echoRect) : false;

    switch (this.state) {
      case 'PATROL': {
        const destX = this.waypoints[this.currentWaypointIndex];
        const dist = destX - this.x;

        if (Math.abs(dist) < 6) {
          // Switch to next waypoint
          this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.waypoints.length;
          this.facing = this.waypoints[this.currentWaypointIndex] > this.x ? 1 : -1;
        } else {
          this.facing = dist > 0 ? 1 : -1;
          this.x += this.facing * CONFIG.GUARD_PATROL_SPEED * dt;
        }

        if (seesPlayer) {
          this.state = 'ALERT';
          this.alertTimer = CONFIG.GUARD_ALERT_DELAY;
          this.targetPos = { x: playerRect.x, y: playerRect.y };
          if (onAlert) onAlert();
        } else if (seesEcho && echoRect) {
          this.state = 'ALERT';
          this.alertTimer = CONFIG.GUARD_ALERT_DELAY;
          this.targetPos = { x: echoRect.x, y: echoRect.y };
          if (onAlert) onAlert();
        }
        break;
      }

      case 'ALERT': {
        this.alertTimer -= dt;
        if (this.alertTimer <= 0) {
          this.state = 'CHASE';
        }
        break;
      }

      case 'CHASE': {
        // Echo takes priority distraction if visible, else real player
        let targetX = this.targetPos ? this.targetPos.x : this.x;

        if (seesEcho && echoRect) {
          targetX = echoRect.x;
          this.targetPos = { x: echoRect.x, y: echoRect.y };
        } else if (seesPlayer) {
          targetX = playerRect.x;
          this.targetPos = { x: playerRect.x, y: playerRect.y };
        }

        const dx = targetX - this.x;
        if (Math.abs(dx) > 4) {
          this.facing = dx > 0 ? 1 : -1;
          this.x += this.facing * CONFIG.GUARD_CHASE_SPEED * dt;
        }

        // Check contact with real player
        if (this.overlaps(this.getRect(), playerRect)) {
          caughtPlayer = true;
        }

        // Check contact with echo
        if (echoRect && this.overlaps(this.getRect(), echoRect)) {
          struckEcho = true;
          // Guard swats the echo, which dissipates, guard enters RETURN state
          particles.emit(
            echoRect.x + echoRect.width / 2,
            echoRect.y + echoRect.height / 2,
            12,
            CONFIG.COLORS.cyan,
            70,
            0.3
          );
          this.state = 'RETURN';
        }

        // Lost sight and reached last known target position
        if (!seesPlayer && !seesEcho && Math.abs(targetX - this.x) < 8) {
          this.state = 'RETURN';
        }
        break;
      }

      case 'RETURN': {
        const destX = this.waypoints[this.currentWaypointIndex];
        const dist = destX - this.x;

        if (Math.abs(dist) < 8) {
          this.state = 'PATROL';
        } else {
          this.facing = dist > 0 ? 1 : -1;
          this.x += this.facing * CONFIG.GUARD_PATROL_SPEED * dt;
        }

        if (seesPlayer || (seesEcho && echoRect)) {
          this.state = 'ALERT';
          this.alertTimer = 0.25;
          if (onAlert) onAlert();
        }
        break;
      }
    }

    return { caughtPlayer, struckEcho };
  }

  public checkVision(target: Rect): boolean {
    const gx = this.x + this.width / 2;
    const gy = this.y + this.height / 2;
    const tx = target.x + target.width / 2;
    const ty = target.y + target.height / 2;

    const dx = tx - gx;
    const dy = ty - gy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Proximity awareness
    if (dist < CONFIG.GUARD_PROXIMITY_DIST) {
      return true;
    }

    // Beyond max sight distance
    if (dist > CONFIG.GUARD_FOV_DIST) {
      return false;
    }

    // Directional cone check
    const angle = Math.atan2(dy, dx);
    const facingAngle = this.facing === 1 ? 0 : Math.PI;

    let diff = Math.abs(angle - facingAngle);
    if (diff > Math.PI) {
      diff = 2 * Math.PI - diff;
    }

    return diff <= CONFIG.GUARD_FOV_ANGLE / 2;
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
    const gx = rx + this.width / 2;
    const gy = ry + this.height / 2;

    // Draw vision cone
    ctx.save();
    const coneAngle = CONFIG.GUARD_FOV_ANGLE;
    const baseAngle = this.facing === 1 ? 0 : Math.PI;
    const isHostile = this.state === 'CHASE' || this.state === 'ALERT';

    ctx.fillStyle = isHostile
      ? 'rgba(255, 42, 75, 0.28)'
      : 'rgba(255, 183, 0, 0.14)';

    ctx.beginPath();
    ctx.moveTo(gx, gy - 6);
    ctx.arc(
      gx,
      gy - 6,
      CONFIG.GUARD_FOV_DIST,
      baseAngle - coneAngle / 2,
      baseAngle + coneAngle / 2
    );
    ctx.closePath();
    ctx.fill();

    // Subtle edge border for the sensor beam
    ctx.strokeStyle = isHostile
      ? 'rgba(255, 42, 75, 0.5)'
      : 'rgba(255, 183, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Guard armored silhouette
    ctx.save();
    ctx.translate(gx, gy);
    ctx.scale(this.facing, 1);

    const w = this.width;
    const h = this.height;

    // Heavy cybernetic combat armor
    ctx.fillStyle = '#1c1313';
    ctx.fillRect(-w / 2 + 2, -h / 2 + 10, w - 4, h - 22);

    // Hazard orange shoulder plates
    ctx.fillStyle = CONFIG.COLORS.guardColor;
    ctx.fillRect(-w / 2 + 2, -h / 2 + 10, w - 4, 8);

    // Armored Head
    ctx.fillStyle = '#2d1818';
    ctx.fillRect(-w / 2 + 2, -h / 2, w - 4, 13);

    // Glowing Sensor Eye Visor
    ctx.save();
    const eyeColor = isHostile ? CONFIG.COLORS.redHazard : CONFIG.COLORS.amberCore;
    ctx.fillStyle = eyeColor;
    ctx.shadowColor = eyeColor;
    ctx.shadowBlur = 8;
    ctx.fillRect(0, -h / 2 + 4, w / 2 - 2, 4);
    ctx.restore();

    // Mechanical Legs with walk animation
    const legOffset = Math.sin(this.animTimer) * 4;
    ctx.fillStyle = '#140c0c';
    ctx.fillRect(-w / 2 + 4, h / 2 - 12, 6, 12 + legOffset);
    ctx.fillRect(w / 2 - 10, h / 2 - 12, 6, 12 - legOffset);

    ctx.restore();

    // Alert / Chase '!' Exclamation mark above guard
    if (this.state === 'ALERT' || this.state === 'CHASE') {
      ctx.save();
      ctx.fillStyle = CONFIG.COLORS.redHazard;
      ctx.shadowColor = CONFIG.COLORS.redHazard;
      ctx.shadowBlur = 8;
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('!', gx, ry - 10);
      ctx.restore();
    }
  }
}
