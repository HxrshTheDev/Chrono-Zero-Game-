/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CONFIG } from './game/GameConfig.ts';
import { EndGameStats, GameEngine, GameState, HUDData } from './game/GameEngine.ts';
import { GameOverScreen } from './ui/GameOverScreen.tsx';
import { GameHUD } from './ui/GameHUD.tsx';
import { MainMenu } from './ui/MainMenu.tsx';
import { PauseMenu } from './ui/PauseMenu.tsx';
import { VictoryScreen } from './ui/VictoryScreen.tsx';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [endStats, setEndStats] = useState<EndGameStats | undefined>(undefined);
  const [hudData, setHudData] = useState<HUDData>({
    timeElapsed: 0,
    rewindPercent: 0,
    rewindDuration: 0,
    echoStatus: 'CHARGING',
    coreCollected: false,
    muted: false,
    rewindsUsed: 0,
    failuresCount: 0,
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(
      canvasRef.current,
      (state, stats) => {
        setGameState(state);
        if (stats) setEndStats(stats);
      },
      (data) => {
        setHudData(data);
      }
    );

    engineRef.current = engine;
    engine.start();

    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, []);

  const handleStartGame = useCallback(() => {
    engineRef.current?.startGame();
  }, []);

  const handleResumeGame = useCallback(() => {
    engineRef.current?.resumeGame();
  }, []);

  const handleRestartLevel = useCallback(() => {
    engineRef.current?.restartLevel();
    engineRef.current?.setState('PLAYING');
  }, []);

  const handleQuitToMenu = useCallback(() => {
    engineRef.current?.restartLevel();
    engineRef.current?.setState('MENU');
  }, []);

  const handleToggleMute = useCallback(() => {
    engineRef.current?.toggleMute();
  }, []);

  const handleTriggerRewind = useCallback(() => {
    engineRef.current?.triggerRewind();
  }, []);

  const handleTriggerEcho = useCallback(() => {
    engineRef.current?.triggerEcho();
  }, []);

  return (
    <main className="w-screen h-screen overflow-hidden bg-[#04060d] flex items-center justify-center relative select-none">
      {/* Full-viewport game shell container */}
      <div className="relative w-full h-full max-w-[1280px] max-h-[720px] aspect-[16/9] shadow-2xl shadow-cyan-950/60 border border-slate-800/80 rounded overflow-hidden flex items-center justify-center bg-[#070b18]">
        {/* Isolated Canvas Viewport */}
        <canvas
          ref={canvasRef}
          width={CONFIG.VIEWPORT_WIDTH}
          height={CONFIG.VIEWPORT_HEIGHT}
          className="w-full h-full object-contain block"
        />

        {/* Ambient CRT Scanline Effect */}
        <div className="absolute inset-0 scanlines pointer-events-none opacity-40" />

        {/* HUD Cluster (Shown only when PLAYING) */}
        {gameState === 'PLAYING' && (
          <GameHUD
            hudData={hudData}
            onToggleMute={handleToggleMute}
            onTriggerRewind={handleTriggerRewind}
            onTriggerEcho={handleTriggerEcho}
          />
        )}

        {/* Game State Overlay Modals */}
        {gameState === 'MENU' && <MainMenu onStart={handleStartGame} />}

        {gameState === 'PAUSED' && (
          <PauseMenu
            onResume={handleResumeGame}
            onRestart={handleRestartLevel}
            onQuitToMenu={handleQuitToMenu}
          />
        )}

        {gameState === 'GAME_OVER' && (
          <GameOverScreen
            stats={endStats}
            onRetry={handleRestartLevel}
            onQuitToMenu={handleQuitToMenu}
          />
        )}

        {gameState === 'VICTORY' && (
          <VictoryScreen
            stats={endStats}
            onPlayAgain={handleStartGame}
            onQuitToMenu={handleQuitToMenu}
          />
        )}
      </div>
    </main>
  );
}
