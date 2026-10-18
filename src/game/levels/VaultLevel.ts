import { CONFIG, Rect } from '../GameConfig.ts';
import { Guard } from '../entities/Guard.ts';
import {
  BlastDoor,
  ChronoCore,
  ExitAirlock,
  PressureSwitch,
  SecurityLaser,
} from '../entities/Obstacles.ts';
import { Player } from '../entities/Player.ts';

export class VaultLevel {
  public platforms: Rect[] = [];
  public player: Player;
  public guard: Guard;
  public switch: PressureSwitch;
  public door: BlastDoor;
  public laser: SecurityLaser;
  public core: ChronoCore;
  public exit: ExitAirlock;

  constructor() {
    this.platforms = [
      // Outer Vault Boundaries
      { x: 0, y: 0, width: 24, height: CONFIG.WORLD_HEIGHT }, // Left wall
      { x: CONFIG.WORLD_WIDTH - 24, y: 0, width: 24, height: CONFIG.WORLD_HEIGHT }, // Right wall
      { x: 0, y: 0, width: CONFIG.WORLD_WIDTH, height: 24 }, // Ceiling
      { x: 0, y: 640, width: CONFIG.WORLD_WIDTH, height: 80 }, // Main bottom floor

      // Section 1: Starting infiltration ledge
      { x: 24, y: 440, width: 260, height: 24 },
      { x: 260, y: 440, width: 24, height: 200 }, // Drop wall down to switch pit

      // Section 2: Blast door wall & upper catwalks
      { x: 540, y: 220, width: 24, height: 300 }, // Wall above blast door
      { x: 540, y: 320, width: 340, height: 24 }, // Upper security catwalk
      { x: 740, y: 470, width: 140, height: 20 }, // Mid intermediate platform

      // Section 3: Core Sanctum & high platforms
      { x: 1040, y: 480, width: 220, height: 22 }, // Lower sanctum step
      { x: 1120, y: 380, width: 160, height: 22 }, // Altar table for Chrono Core
      { x: 1340, y: 470, width: 140, height: 22 }, // High step towards exit
    ];

    // Player spawn: Top infiltration platform
    this.player = new Player(70, 390);

    // Guard: Patrols lower corridor between the door and laser grid
    this.guard = new Guard(720, 594, [620, 920]);

    // Pressure Switch: In the lower pit
    this.switch = new PressureSwitch(380, 630);

    // Blast Door: Under the wall at x: 540
    this.door = new BlastDoor(540, 520, 24, 120);

    // Security Laser: Guarding the lower sanctum threshold
    this.laser = new SecurityLaser(960, 480, 8, 160);

    // Chrono Core: On the elevated altar
    this.core = new ChronoCore(1186, 332);

    // Extraction Airlock: Far right escape portal
    this.exit = new ExitAirlock(1480, 550);
  }

  public reset(): void {
    this.player.setPosition(70, 390, 1);
    this.guard.reset();
    this.door.openProgress = 0;
    this.laser.active = true;
    this.core.collected = false;
    this.exit.unlocked = false;
  }
}
