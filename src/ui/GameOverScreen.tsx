import React from 'react';
import { RotateCcw, AlertTriangle, LogOut } from 'lucide-react';
import { EndGameStats } from '../game/GameEngine.ts';

interface GameOverScreenProps {
  stats?: EndGameStats;
  onRetry: () => void;
  onQuitToMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  stats,
  onRetry,
  onQuitToMenu,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/85 backdrop-blur-sm z-50 select-none">
      <div className="bg-[#140b0f] border-2 border-red-500/70 p-6 md:p-8 rounded max-w-sm w-full text-center shadow-2xl shadow-red-950/80">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500 flex items-center justify-center text-red-500 animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="font-mono text-[10px] uppercase tracking-widest text-red-400 mb-1">
          TACTICAL TERMINATION
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider text-white mb-2">
          SECURITY BREACH
        </h2>

        <p className="text-xs font-mono text-red-300/90 mb-5 px-2 bg-red-950/40 py-1.5 rounded border border-red-900/40">
          {stats?.deathReason || 'INFILTRATION FAILED // CRITICAL PROTOCOL BREACH'}
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold text-xs uppercase py-3 px-4 rounded transition-all shadow-md shadow-red-600/40 hover:scale-[1.01] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RETRY INFILTRATION [R]</span>
          </button>

          <button
            onClick={onQuitToMenu}
            className="flex items-center justify-center gap-2 bg-[#0e172a] hover:bg-[#1a253a] border border-slate-700 text-slate-300 hover:text-white font-mono text-xs uppercase py-2.5 px-4 rounded transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>ABORT TO MAIN MENU</span>
          </button>
        </div>

        <div className="mt-4 text-[10px] font-mono text-slate-500">
          PRESS [R] FOR IMMEDIATE TEMPORAL RESTART
        </div>
      </div>
    </div>
  );
};
