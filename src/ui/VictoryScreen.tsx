import React from 'react';
import { Award, RotateCcw, LogOut, CheckCircle2 } from 'lucide-react';
import { EndGameStats } from '../game/GameEngine.ts';

interface VictoryScreenProps {
  stats?: EndGameStats;
  onPlayAgain: () => void;
  onQuitToMenu: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  stats,
  onPlayAgain,
  onQuitToMenu,
}) => {
  const formatTime = (secs: number = 0) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/85 backdrop-blur-sm z-50 select-none">
      <div className="bg-[#071310] border-2 border-[#00ff66]/70 p-6 md:p-8 rounded max-w-md w-full text-center shadow-2xl shadow-green-950/80">
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-[#00ff66] flex items-center justify-center text-[#00ff66] shadow-[0_0_15px_rgba(0,255,102,0.5)]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>

        <div className="font-mono text-[10px] uppercase tracking-widest text-[#00ff66] mb-1">
          OBJECTIVE EXECUTED
        </div>
        <h2 className="text-3xl font-extrabold tracking-wider text-white mb-1">
          HEIST COMPLETE
        </h2>
        <p className="text-xs italic text-emerald-400 font-semibold mb-5">
          "TIME IS YOUR GREATEST WEAPON."
        </p>

        {/* Tactical Performance Report */}
        <div className="bg-[#050b09] border border-emerald-900/60 rounded p-4 mb-6 text-left font-mono text-xs space-y-2">
          <div className="flex justify-between items-center pb-1.5 border-b border-emerald-950">
            <span className="text-slate-400">OPERATIVE CLASSIFICATION:</span>
            <span className="font-bold text-[#00ff66] tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              {stats?.rank || 'S-RANK [GHOST OPERATIVE]'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-emerald-950">
            <span className="text-slate-400">INFILTRATION TIME:</span>
            <span className="font-bold text-cyan-300 tabular-nums">
              {formatTime(stats?.timeElapsed)}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-emerald-950">
            <span className="text-slate-400">TEMPORAL REWINDS:</span>
            <span className="font-bold text-amber-400 tabular-nums">
              {stats?.rewindsUsed ?? 0}
            </span>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-slate-400">SECURITY BREACHES:</span>
            <span className="font-bold text-red-400 tabular-nums">
              {stats?.failuresCount ?? 0}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-[#00ff66] hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold text-xs uppercase py-3 px-4 rounded transition-all shadow-md shadow-green-600/40 hover:scale-[1.01] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RUN HEIST AGAIN</span>
          </button>

          <button
            onClick={onQuitToMenu}
            className="flex items-center justify-center gap-2 bg-[#0a1612] hover:bg-[#12251f] border border-emerald-900 text-slate-300 hover:text-white font-mono text-xs uppercase py-2.5 px-4 rounded transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>RETURN TO MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
