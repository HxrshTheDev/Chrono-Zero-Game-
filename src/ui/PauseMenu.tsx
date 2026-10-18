import React, { useState } from 'react';
import { Play, RotateCcw, Keyboard, LogOut } from 'lucide-react';
import { ControlsModal } from './ControlsModal.tsx';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onQuitToMenu: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onQuitToMenu,
}) => {
  const [showControls, setShowControls] = useState(false);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 select-none">
      <div className="bg-[#090f20] border border-cyan-500/40 p-6 md:p-8 rounded max-w-sm w-full text-center shadow-2xl shadow-cyan-950/80">
        <div className="font-mono text-[10px] uppercase tracking-widest text-cyan-400 mb-1">
          OPERATIVE SUSPENSION
        </div>
        <h2 className="text-3xl font-extrabold tracking-wider text-white mb-6">
          MISSION PAUSED
        </h2>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-bold text-xs uppercase py-3 px-4 rounded transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME MISSION [ESC]</span>
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 bg-[#0e172a] hover:bg-[#162544] border border-cyan-800/60 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 font-mono text-xs uppercase py-2.5 px-4 rounded transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>RESTART VAULT</span>
          </button>

          <button
            onClick={() => setShowControls(true)}
            className="flex items-center justify-center gap-2 bg-[#0e172a] hover:bg-[#162544] border border-cyan-800/60 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 font-mono text-xs uppercase py-2.5 px-4 rounded transition-all cursor-pointer"
          >
            <Keyboard className="w-4 h-4 text-cyan-400" />
            <span>CONTROLS PROTOCOL</span>
          </button>

          <button
            onClick={onQuitToMenu}
            className="flex items-center justify-center gap-2 bg-[#0e172a] hover:bg-[#201520] border border-slate-700 hover:border-red-500/60 text-slate-400 hover:text-red-400 font-mono text-xs uppercase py-2.5 px-4 rounded transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>ABORT TO MAIN MENU</span>
          </button>
        </div>
      </div>

      <ControlsModal isOpen={showControls} onClose={() => setShowControls(false)} />
    </div>
  );
};
