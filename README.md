# CHRONO//ZERO: THE FIVE-SECOND HEIST

> *"Your past self becomes your teammate."*

**CHRONO//ZERO** is a 2D cyberpunk stealth puzzle platformer built with **React**, **TypeScript**, **HTML5 Canvas 2D**, and procedural **Web Audio API**.

---

## 🎮 How to Play & Controls

| Key | Action |
| --- | --- |
| **A / D** or **← / →** | Move Left / Right (with acceleration & deceleration) |
| **Space** / **W** / **↑** | Jump (with Coyote Time & Jump Buffering) |
| **R** | **Rewind 5 Seconds** (Active gameplay) / **Instant Retry** (Game Over) |
| **E** | **Deploy Holographic Echo** (Replays your past recorded 5 seconds) |
| **Esc** | Pause / Resume Mission |
| **M** | Toggle Synthesizer Audio Mute |
| **Enter** | Start Infiltration from Menu |

---

## 🧩 Heist Puzzle Walkthrough

1. **The Infiltration Pit**:
   - From the starting infiltration ledge, leap down into the lower pit where the **Pressure Switch** is located (`x: 380`).
   - Stand firmly on the switch for 2–3 seconds (the switch depresses green, the hydraulic blast door slides open, and the security laser shuts down).
2. **The Temporal Rewind**:
   - Press **`R`**. You are instantly rewound 5 seconds back to the elevated starting ledge.
3. **The Echo Manifestation**:
   - Press **`E`**. A cyan holographic Echo materializes and deterministically repeats your previous journey down into the pit to hold the switch for you!
4. **Bypassing the Guard & Laser**:
   - While your past Echo is occupying the switch, sprint across the upper catwalks or sprint through the open blast door.
   - If the cybernetic guard spots your Echo, it will be distracted and chase the decoy, leaving the higher sanctum undefended.
5. **Stealing the Chrono Core**:
   - Ascend the sanctum platforms to touch the floating amber **Chrono Core** (`x: 1186`).
   - Taking the core deactivates all remaining security grids and unlocks the extraction airlock.
6. **Extraction**:
   - Sprint to the illuminated green airlock on the far right (`x: 1480`) to complete the heist and receive your Operative Rank!

---

## 🏗️ Architecture

```
src/
├── game/
│   ├── GameConfig.ts           # Physics constants, viewport, dimensions, palette
│   ├── GameEngine.ts           # 60fps game loop, camera, screen shake, state machine
│   ├── entities/
│   │   ├── Player.ts           # Platformer physics, AABB collisions, procedural rendering
│   │   ├── Echo.ts             # Deterministic playback of recorded player samples
│   │   ├── Guard.ts            # FSM AI (Patrol, Alert, Chase, Return) & FOV vision cone
│   │   └── Obstacles.ts        # PressureSwitch, BlastDoor, SecurityLaser, ChronoCore, ExitAirlock
│   ├── systems/
│   │   ├── TimeRecorder.ts     # 5.0-second rolling ring buffer (30Hz sampling)
│   │   ├── InputManager.ts     # Edge-triggered vs continuous inputs, blur handler
│   │   ├── ParticleSystem.ts   # 2D particle emitter for jumps, rewinds, and lasers
│   │   └── AudioManager.ts     # Procedural Web Audio API sound synthesizer
│   └── levels/
│       └── VaultLevel.ts       # Geometry, platforms, and obstacle layout
└── ui/
    ├── MainMenu.tsx            # Title screen with SVG logo lockup & start CTA
    ├── GameHUD.tsx             # Low-occlusion perimeter HUD with temporal buffer gauge
    ├── PauseMenu.tsx           # Mission pause overlay
    ├── GameOverScreen.tsx      # Failure screen with cause of death and [R] retry
    ├── VictoryScreen.tsx       # Extraction stats (time, rewinds, breaches, rank)
    ├── ControlsModal.tsx       # Keybinds protocol modal
    └── AboutModal.tsx          # Backstory and mission briefing
```

---

## ⚡ Technical Highlights

- **Isolated Canvas 60 FPS Loop**: The HTML5 Canvas simulation runs via `requestAnimationFrame` in an engine instance decoupled from React renders, guaranteeing a stutter-free 60 FPS.
- **Deterministic Time Scrubbing**: Player movement states are captured in a rolling chronological buffer at fixed 30Hz intervals and played back seamlessly by the Echo entity.
- **Zero External Assets**: All graphics are procedurally rendered with 2D Canvas methods and glowing neon aesthetics. All sound effects are synthesized dynamically via the Web Audio API without network dependencies.
