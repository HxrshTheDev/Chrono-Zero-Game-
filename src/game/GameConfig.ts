export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const CONFIG = {
  WORLD_WIDTH: 1600,
  WORLD_HEIGHT: 720,
  VIEWPORT_WIDTH: 960,
  VIEWPORT_HEIGHT: 540,

  // Physics
  GRAVITY: 1150,
  PLAYER_SPEED: 260,
  PLAYER_ACCEL: 1800,
  PLAYER_DECEL: 1600,
  PLAYER_JUMP_FORCE: 480,
  COYOTE_TIME: 0.1,
  JUMP_BUFFER_TIME: 0.12,

  // Time & Recording
  MAX_REWIND_SECONDS: 5.0,
  SAMPLE_INTERVAL: 1 / 30, // 30Hz recording
  REWIND_DURATION: 0.35,

  // Guard AI
  GUARD_PATROL_SPEED: 80,
  GUARD_CHASE_SPEED: 165,
  GUARD_FOV_DIST: 240,
  GUARD_FOV_ANGLE: (50 * Math.PI) / 180, // radians
  GUARD_PROXIMITY_DIST: 52,
  GUARD_ALERT_DELAY: 0.35,

  // Palette
  COLORS: {
    cyan: '#00f3ff',
    cyanGhost: 'rgba(0, 243, 255, 0.55)',
    cyanDark: '#0088cc',
    redHazard: '#ff2a4b',
    amberCore: '#ffb700',
    green: '#00ff66',
    guardColor: '#ff5533',
    wallFill: '#141d30',
    wallEdge: '#223456',
    accentBlue: '#1e3a6a',
  },
} as const;
