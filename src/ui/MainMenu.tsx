import React, { useState } from 'react';
import { Play, Keyboard, Info, ShieldAlert } from 'lucide-react';
import { AboutModal } from './AboutModal.tsx';
import { ControlsModal } from './ControlsModal.tsx';

interface MainMenuProps {
  onStart: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  const [showControls, setShowControls] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between p-8 bg-gradient-to-b from-[#030611]/80 via-[#05091a]/85 to-[#070d24]/95 backdrop-blur-[2px] z-40 select-none">
      {/* Top Protocol Status */}
      <div className="flex items-center gap-3 font-mono text-xs tracking-widest text-cyan-400/80 border-b border-cyan-500/20 pb-2 w-full max-w-xl justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>SECURITY SYSTEM // STANDBY</span>
        </div>
        <span className="text-slate-500">CHRONO-PROTOCOL v1.0</span>
      </div>

      {/* Hero Centerpiece & Title Lockup */}
      <div className="flex flex-col items-center max-w-md text-center my-auto">
        {/* Bespoke Inline SVG Logo Lockup */}
        <div className="relative mb-3 flex items-center justify-center">
          <svg
            className="w-24 h-24 text-cyan-400 filter drop-shadow-[0_0_15px_rgba(0,243,255,0.7)]"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Diamond */}
            <polygon
              points="50,6 94,50 50,94 6,50"
              stroke="#00f3ff"
              strokeWidth="2.5"
              fill="rgba(0, 243, 255, 0.05)"
            />
            {/* Inner Clock Ring */}
            <circle
              cx="50"
              cy="50"
              r="28"
              stroke="#00f3ff"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            {/* Hour hand rewinding counterclockwise */}
            <line
              x1="50"
              y1="50"
              x2="35"
              y2="32"
              stroke="#ffb700"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Minute hand */}
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="24"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Center Pivot Core */}
            <circle cx="50" cy="50" r="4.5" fill="#00f3ff" />
          </svg>
        </div>

        <div className="font-mono text-xs tracking-[0.3em] text-cyan-400 mb-1">
          TEMPORAL STEALTH INFILTRATION
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-widest text-white leading-none">
          CHRONO<span className="text-cyan-400">//</span>ZERO
        </h1>

        <h2 className="text-sm md:text-base font-mono tracking-[0.35em] text-slate-300 mt-2 mb-6 uppercase">
          THE FIVE-SECOND HEIST
        </h2>

        <p className="text-xs text-slate-400 mb-8 italic">
          "Your past self becomes your teammate."
        </p>

        {/* Action Button Group */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onStart}
            className="group relative flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-600 via-cyan-500 to-[#00f3ff] text-slate-950 hover:text-black font-bold text-sm tracking-widest uppercase py-3.5 px-6 rounded transition-all shadow-[0_0_20px_rgba(0,243,255,0.45)] hover:shadow-[0_0_30px_rgba(0,243,255,0.7)] hover:scale-[1.02] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current group-hover:translate-x-0.5 transition-transform" />
            <span>INFILTRATE VAULT [ENTER]</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setShowControls(true)}
              className="flex items-center justify-center gap-2 bg-[#0d1629] hover:bg-[#152340] border border-cyan-800/60 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 font-mono text-xs uppercase py-2.5 px-4 rounded transition-all cursor-pointer"
            >
              <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
              <span>CONTROLS</span>
            </button>

            <button
              onClick={() => setShowAbout(true)}
              className="flex items-center justify-center gap-2 bg-[#0d1629] hover:bg-[#152340] border border-cyan-800/60 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 font-mono text-xs uppercase py-2.5 px-4 rounded transition-all cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>BRIEFING</span>
            </button>
          </div>
        </div>
      </div>

      {/* Flat Single Control Hint Line */}
      <div className="font-mono text-[11px] text-slate-400 tracking-wider flex items-center gap-2 bg-black/60 px-4 py-1.5 rounded-full border border-cyan-950/60">
        <span className="text-cyan-400 font-bold">CONTROLS:</span>
        <span>A/D Move · Space Jump · R Rewind · E Deploy Echo · Esc Pause</span>
      </div>

      {/* Modals */}
      <ControlsModal isOpen={showControls} onClose={() => setShowControls(false)} />
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
};
