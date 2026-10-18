import { CONFIG, Rect } from './GameConfig.ts';
import { Echo } from './entities/Echo.ts';
import { VaultLevel } from './levels/VaultLevel.ts';
import { AudioManager } from './systems/AudioManager.ts';
import { InputManager } from './systems/InputManager.ts';
import { ParticleSystem } from './systems/ParticleSystem.ts';
import { PlayerHistorySample, TimeRecorder } from './systems/TimeRecorder.ts';

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';

export interface HUDData {
  timeElapsed: number;
  rewindPercent: number;
  rewindDuration: number;
  echoStatus: 'READY' | 'DEPLOYED' | 'CHARGING';
  coreCollected: boolean;
  muted: boolean;
  rewindsUsed: number;
  failuresCount: number;
}

export interface EndGameStats {
  timeElapsed: number;
  rewindsUsed: number;
  failuresCount: number;
  deathReason?: string;
  rank?: string;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  public state: GameState = 'MENU';
  public level: VaultLevel;
  public echo: Echo;
  public audio: AudioManager;
  public input: InputManager;
  public particles: ParticleSystem;
  public recorder: TimeRecorder;

  // Camera & Screen Shake
  public camX: number = 0;
  public camY: number = 0;
  private shakeTimer: number = 0;
  private shakeIntensity: number = 0;
  private rewindFlash: number = 0;
  private menuPanX: number = 0;

  // Stored timeline for Echo playback
  private preparedEchoTimeline: PlayerHistorySample[] = [];

  // Metrics
  public gameTimer: number = 0;
  public rewindsUsed: number = 0;
  public failuresCount: number = 0;
  public deathReason: string = '';

  // UI callbacks
  private onStateChange?: (state: GameState, stats?: EndGameStats) => void;
  private onHUDUpdate?: (data: HUDData) => void;

  constructor(
    canvas: HTMLCanvasElement,
    onStateChange?: (state: GameState, stats?: EndGameStats) => void,
    onHUDUpdate?: (data: HUDData) => void
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;

    this.onStateChange = onStateChange;
    this.onHUDUpdate = onHUDUpdate;

    this.audio = new AudioManager();
    this.input = new InputManager();
    this.particles = new ParticleSystem();
    this.recorder = new TimeRecorder();
    this.echo = new Echo();
    this.level = new VaultLevel();

    this.input.attach();
  }

  public start(): void {
    if (this.animFrameId !== null) return;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.input.detach();
  }

  public setState(nextState: GameState): void {
    this.state = nextState;
    if (this.onStateChange) {
      const stats: EndGameStats = {
        timeElapsed: this.gameTimer,
        rewindsUsed: this.rewindsUsed,
        failuresCount: this.failuresCount,
        deathReason: this.deathReason,
        rank: this.calculateRank(),
      };
      this.onStateChange(nextState, stats);
    }
  }

  public startGame(): void {
    this.audio.init();
    this.gameTimer = 0;
    this.rewindsUsed = 0;
    this.failuresCount = 0;
    this.deathReason = '';
    this.restartLevel();
    this.setState('PLAYING');
  }

  public resumeGame(): void {
    if (this.state === 'PAUSED') {
      this.setState('PLAYING');
    }
  }

  public pauseGame(): void {
    if (this.state === 'PLAYING') {
      this.setState('PAUSED');
    }
  }

  public restartLevel(): void {
    this.level.reset();
    this.echo.despawn(this.particles);
    this.recorder.clear();
    this.preparedEchoTimeline = [];
    this.particles.clear();
    this.rewindFlash = 0;
    this.camX = 0;
    this.camY = 180;
  }

  public triggerRewind(): boolean {
    if (this.state !== 'PLAYING') return false;

    const oldest = this.recorder.getOldestState();
    const duration = this.recorder.getDuration();
    if (!oldest || duration < 0.4) {
      return false;
    }

    // Capture the timeline for Echo creation
    this.preparedEchoTimeline = this.recorder.cloneTimeline();

    this.audio.rewind();
    this.rewindsUsed++;
    this.rewindFlash = 0.35;
    this.shakeCamera(0.25, 6);

    // Visual burst at old location
    this.particles.emit(
      this.level.player.x + this.level.player.width / 2,
      this.level.player.y + this.level.player.height / 2,
      20,
      CONFIG.COLORS.cyan,
      130,
      0.45,
      3,
      true
    );

    // Restore player position to oldest recorded point
    this.level.player.setPosition(oldest.x, oldest.y, oldest.facing);
    this.level.player.vx = 0;
    this.level.player.vy = 0;

    // Visual burst at rewound arrival location
    this.particles.emit(
      oldest.x + this.level.player.width / 2,
      oldest.y + this.level.player.height / 2,
      25,
      CONFIG.COLORS.cyan,
      160,
      0.5,
      3,
      true
    );

    return true;
  }

  public triggerEcho(): boolean {
    if (this.state !== 'PLAYING') return false;

    // Use prepared timeline from rewind if available, or current recording buffer if >= 1s
    let timeline = this.preparedEchoTimeline;
    if (timeline.length < 5) {
      timeline = this.recorder.cloneTimeline();
    }

    if (timeline.length < 5) {
      return false;
    }

    this.audio.echoSpawn();
    this.echo.spawn(timeline, this.particles);
    return true;
  }

  public toggleMute(): boolean {
    const muted = this.audio.toggleMute();
    this.emitHUD();
    return muted;
  }

  private shakeCamera(duration: number, intensity: number): void {
    this.shakeTimer = duration;
    this.shakeIntensity = intensity;
  }

  private calculateRank(): string {
    if (this.failuresCount === 0 && this.gameTimer <= 45 && this.rewindsUsed <= 3) {
      return 'S-RANK [GHOST OPERATIVE]';
    }
    if (this.failuresCount === 0 && this.gameTimer <= 75) {
      return 'A-RANK [MASTER INFILTRATOR]';
    }
    if (this.failuresCount <= 2) {
      return 'B-RANK [SPECIALIST]';
    }
    return 'C-RANK [SURVIVOR]';
  }

  private loop = (time: number): void => {
    const rawDt = (time - this.lastTime) / 1000;
    this.lastTime = time;
    const dt = Math.min(rawDt, 0.05);

    this.handleGlobalInputs();

    if (this.state === 'PLAYING') {
      this.updateSimulation(dt);
    } else if (this.state === 'MENU') {
      this.updateMenuCinematic(dt);
    }

    this.render();
    this.input.updateFrameEnd();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private handleGlobalInputs(): void {
    // Escape toggles Pause
    if (this.input.consumePress('Escape')) {
      if (this.state === 'PLAYING') {
        this.setState('PAUSED');
        this.audio.uiClick();
      } else if (this.state === 'PAUSED') {
        this.setState('PLAYING');
        this.audio.uiClick();
      }
    }

    // Mute hotkey [M]
    if (this.input.consumePress('KeyM')) {
      this.toggleMute();
    }

    // Start hotkey [Enter] in Menu
    if (this.state === 'MENU' && this.input.consumePress('Enter')) {
      this.startGame();
    }

    // Retry hotkey [R] in Game Over
    if (this.state === 'GAME_OVER' && this.input.consumePress('KeyR')) {
      this.restartLevel();
      this.setState('PLAYING');
    }
  }

  private updateMenuCinematic(dt: number): void {
    this.menuPanX = (this.menuPanX + dt * 40) % (CONFIG.WORLD_WIDTH - CONFIG.VIEWPORT_WIDTH);
    this.camX = this.menuPanX;
    this.camY = 160;
    this.level.core.update(dt);
    this.level.laser.update(dt, true);
  }

  private updateSimulation(dt: number): void {
    this.gameTimer += dt;
    if (this.rewindFlash > 0) {
      this.rewindFlash -= dt;
    }
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
    }

    // Player gameplay actions
    if (this.input.consumePress('KeyR')) {
      this.triggerRewind();
    }
    if (this.input.consumePress('KeyE')) {
      this.triggerEcho();
    }

    // Dynamic solids: platforms + blast door (if closed)
    const solids: Rect[] = [...this.level.platforms];
    const doorSolid = this.level.door.getSolidRect();
    if (doorSolid) {
      solids.push(doorSolid);
    }

    // Player update
    const isLeft = this.input.isLeft();
    const isRight = this.input.isRight();
    const jumpPressed = this.input.consumeJumpPress();
    const jumpHeld = this.input.isJumpHeld();

    this.level.player.update(
      dt,
      isLeft,
      isRight,
      jumpPressed,
      jumpHeld,
      solids,
      this.particles,
      () => this.audio.jump()
    );

    // Record player state
    this.recorder.record(this.gameTimer, {
      x: this.level.player.x,
      y: this.level.player.y,
      vx: this.level.player.vx,
      vy: this.level.player.vy,
      facing: this.level.player.facing,
      isGrounded: this.level.player.isGrounded,
      action: !this.level.player.isGrounded
        ? 'jump'
        : Math.abs(this.level.player.vx) > 10
        ? 'walk'
        : 'idle',
    });

    // Update Echo
    this.echo.update(dt, this.particles);

    // Pressure Switch interaction (Player OR Echo)
    const occupants: Rect[] = [this.level.player.getRect()];
    if (this.echo.isActive) {
      occupants.push(this.echo.getRect());
    }

    const clickedSwitch = this.level.switch.checkPress(occupants);
    if (clickedSwitch) {
      this.audio.switchClick();
      this.shakeCamera(0.12, 3);
    }

    // Door & Laser reaction to pressure switch
    const isSwitchHeld = this.level.switch.pressed;
    this.level.door.update(dt, isSwitchHeld);

    // Laser stays active unless switch is pressed OR core is collected
    const laserActive = !isSwitchHeld && !this.level.core.collected;
    this.level.laser.update(dt, laserActive);

    // Guard update & sensory check
    const echoRect = this.echo.isActive ? this.echo.getRect() : null;
    const { caughtPlayer, struckEcho } = this.level.guard.update(
      dt,
      this.level.player.getRect(),
      echoRect,
      this.particles,
      () => this.audio.alert()
    );

    if (struckEcho) {
      this.echo.despawn(this.particles);
      this.shakeCamera(0.15, 4);
    }

    if (caughtPlayer) {
      this.triggerFailure('APPREHENDED BY CYBERNETIC ENFORCER');
      return;
    }

    // Laser collision with real player
    if (this.level.laser.active) {
      const pRect = this.level.player.getRect();
      const lRect = this.level.laser.getRect();
      if (
        pRect.x < lRect.x + lRect.width &&
        pRect.x + pRect.width > lRect.x &&
        pRect.y < lRect.y + lRect.height &&
        pRect.y + pRect.height > lRect.y
      ) {
        this.audio.laserZap();
        this.triggerFailure('INCINERATED BY LETHAL SECURITY LASER GRID');
        return;
      }
    }

    // Fall out of bounds check
    if (this.level.player.y > CONFIG.WORLD_HEIGHT + 60) {
      this.triggerFailure('CRITICAL TRAJECTORY VOID');
      return;
    }

    // Chrono Core collection
    if (!this.level.core.collected) {
      this.level.core.update(dt);
      const pRect = this.level.player.getRect();
      const cRect = this.level.core.getRect();
      if (
        pRect.x < cRect.x + cRect.width &&
        pRect.x + pRect.width > cRect.x &&
        pRect.y < cRect.y + cRect.height &&
        pRect.y + pRect.height > cRect.y
      ) {
        this.level.core.collected = true;
        this.level.exit.unlocked = true;
        this.audio.coreCollect();
        this.shakeCamera(0.2, 5);
        this.particles.emit(
          cRect.x + cRect.width / 2,
          cRect.y + cRect.height / 2,
          35,
          CONFIG.COLORS.amberCore,
          160,
          0.7,
          4,
          true
        );
      }
    }

    // Exit Airlock completion
    this.level.exit.update(dt, this.level.core.collected);
    if (this.level.core.collected) {
      const pRect = this.level.player.getRect();
      const eRect = this.level.exit.getRect();
      if (
        pRect.x < eRect.x + eRect.width &&
        pRect.x + pRect.width > eRect.x &&
        pRect.y < eRect.y + eRect.height &&
        pRect.y + pRect.height > eRect.y
      ) {
        this.audio.victory();
        this.setState('VICTORY');
        return;
      }
    }

    this.particles.update(dt);

    // Smooth Camera tracking target
    const targetCamX = this.level.player.x - CONFIG.VIEWPORT_WIDTH / 2;
    const targetCamY = this.level.player.y - CONFIG.VIEWPORT_HEIGHT / 2;
    const lerpSpeed = 1 - Math.exp(-dt * 6.5);
    this.camX += (targetCamX - this.camX) * lerpSpeed;
    this.camY += (targetCamY - this.camY) * lerpSpeed;

    // Clamp camera within world bounds
    this.camX = Math.max(0, Math.min(CONFIG.WORLD_WIDTH - CONFIG.VIEWPORT_WIDTH, this.camX));
    this.camY = Math.max(0, Math.min(CONFIG.WORLD_HEIGHT - CONFIG.VIEWPORT_HEIGHT, this.camY));

    this.emitHUD();
  }

  private triggerFailure(reason: string): void {
    this.audio.defeat();
    this.failuresCount++;
    this.deathReason = reason;
    this.shakeCamera(0.4, 10);
    this.particles.emit(
      this.level.player.x + this.level.player.width / 2,
      this.level.player.y + this.level.player.height / 2,
      30,
      CONFIG.COLORS.redHazard,
      170,
      0.6,
      3,
      true
    );
    this.setState('GAME_OVER');
  }

  private emitHUD(): void {
    if (!this.onHUDUpdate) return;

    let echoStatus: 'READY' | 'DEPLOYED' | 'CHARGING' = 'CHARGING';
    if (this.echo.isActive) {
      echoStatus = 'DEPLOYED';
    } else if (this.preparedEchoTimeline.length >= 5 || this.recorder.getDuration() >= 1.0) {
      echoStatus = 'READY';
    }

    this.onHUDUpdate({
      timeElapsed: this.gameTimer,
      rewindPercent: this.recorder.getPercentage(),
      rewindDuration: this.recorder.getDuration(),
      echoStatus,
      coreCollected: this.level.core.collected,
      muted: this.audio.muted,
      rewindsUsed: this.rewindsUsed,
      failuresCount: this.failuresCount,
    });
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CONFIG.VIEWPORT_WIDTH, CONFIG.VIEWPORT_HEIGHT);

    // Camera shake offset
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeTimer > 0) {
      shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      shakeY = (Math.random() - 0.5) * this.shakeIntensity;
    }

    const renderCamX = this.camX + shakeX;
    const renderCamY = this.camY + shakeY;

    // Atmospheric cyber background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CONFIG.VIEWPORT_HEIGHT);
    bgGrad.addColorStop(0, '#050814');
    bgGrad.addColorStop(0.6, '#080d1e');
    bgGrad.addColorStop(1, '#0e172e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CONFIG.VIEWPORT_WIDTH, CONFIG.VIEWPORT_HEIGHT);

    // Parallax Vault Architecture Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(28, 44, 76, 0.45)';
    ctx.lineWidth = 1;
    const gridSpacing = 48;
    const startX = -renderCamX % gridSpacing;
    const startY = -renderCamY % gridSpacing;

    ctx.beginPath();
    for (let x = startX; x < CONFIG.VIEWPORT_WIDTH; x += gridSpacing) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CONFIG.VIEWPORT_HEIGHT);
    }
    for (let y = startY; y < CONFIG.VIEWPORT_HEIGHT; y += gridSpacing) {
      ctx.moveTo(0, y);
      ctx.lineTo(CONFIG.VIEWPORT_WIDTH, y);
    }
    ctx.stroke();
    ctx.restore();

    // Platforms & Vault Architecture
    for (const plat of this.level.platforms) {
      const rx = plat.x - renderCamX;
      const ry = plat.y - renderCamY;

      // Platform body
      ctx.fillStyle = CONFIG.COLORS.wallFill;
      ctx.fillRect(rx, ry, plat.width, plat.height);

      // Top illuminated tech edge
      ctx.fillStyle = CONFIG.COLORS.wallEdge;
      ctx.fillRect(rx, ry, plat.width, 3);

      // Subtle panel dividing lines
      if (plat.width > 60 && plat.height > 20) {
        ctx.fillStyle = '#0a101d';
        for (let px = rx + 60; px < rx + plat.width - 20; px += 80) {
          ctx.fillRect(px, ry + 4, 2, plat.height - 4);
        }
      }
    }

    // World Interactive Elements
    this.level.switch.render(ctx, renderCamX, renderCamY);
    this.level.door.render(ctx, renderCamX, renderCamY);
    this.level.laser.render(ctx, renderCamX, renderCamY);
    this.level.core.render(ctx, renderCamX, renderCamY);
    this.level.exit.render(ctx, renderCamX, renderCamY);

    // Characters
    this.echo.render(ctx, renderCamX, renderCamY);
    this.level.guard.render(ctx, renderCamX, renderCamY);
    this.level.player.render(ctx, renderCamX, renderCamY);

    // Particles
    this.particles.render(ctx, renderCamX, renderCamY);

    // Rewind Time Reversal Flash
    if (this.rewindFlash > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(0, 243, 255, ${this.rewindFlash * 0.55})`;
      ctx.fillRect(0, 0, CONFIG.VIEWPORT_WIDTH, CONFIG.VIEWPORT_HEIGHT);

      // Rewind scanlines
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let y = 0; y < CONFIG.VIEWPORT_HEIGHT; y += 4) {
        ctx.fillRect(0, y, CONFIG.VIEWPORT_WIDTH, 1);
      }
      ctx.restore();
    }
  }
}
