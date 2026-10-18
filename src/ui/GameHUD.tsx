import React from 'react';
import { Volume2, VolumeX, ShieldAlert, Sparkles, Clock, RotateCcw } from 'lucide-react';
import { HUDData } from '../game/GameEngine.ts';

interface GameHUDProps {
  hudData: HUDData;
  onToggleMute: () => void;
  onTriggerRewind: () => void;
  onTriggerEcho: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  hudData,
  onToggleMute,
  onTriggerRewind,
  onTriggerEcho,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isEchoReady = hudData.echoStatus === 'READY';
  const isEchoDeployed = hudData.echoStatus === 'DEPLOYED';

  return (
    <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between select-none">
      {/* Top Perimeter HUD Bar */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Objective Cluster */}
        <div className="pointer-events-auto bg-[#0a1020]/90 border border-[#00f3ff]/30 backdrop-blur-sm px-4 py-2.5 rounded shadow-lg shadow-cyan-950/40">
          <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-400/80 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            Current Directive
          </div>
          <div className="text-sm font-bold tracking-wide mt-0.5 flex items-center gap-2">
            {hudData.coreCollected ? (
              <span className="text-[#00ff66] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                EXTRACTION UNLOCKED • REACH AIRLOCK
              </span>
            ) : (
              <span className="text-[#ffb700] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                STEAL CHRONO CORE
              </span>
            )}
          </div>
        </div>

        {/* Center: Temporal Buffer & Echo Status */}
        <div className="flex flex-col items-center gap-1.5">
          {/* Rewind Buffer Gauge */}
          <div className="pointer-events-auto bg-[#0a1020]/90 border border-[#00f3ff]/30 backdrop-blur-sm px-4 py-2 rounded shadow-lg shadow-cyan-950/40 w-72">
            <div className="flex justify-between text-[11px] font-mono mb-1 text-cyan-300">
              <span className="flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5" />
                TEMPORAL BUFFER [R]
              </span>
              <span className="tabular-nums font-bold">
                {hudData.rewindDuration.toFixed(1)}s / 5.0s
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#0a1324] rounded-sm overflow-hidden border border-cyan-500/20">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-[#00f3ff] transition-all duration-75 shadow-[0_0_8px_#00f3ff]"
                style={{ width: `${hudData.rewindPercent}%` }}
              />
            </div>
          </div>

          {/* Echo Hologram Status Pill */}
          <div
            className={`pointer-events-auto flex items-center gap-2 px-3 py-1 rounded text-[11px] font-mono border transition-all ${
              isEchoDeployed
                ? 'bg-cyan-950/80 border-[#00f3ff] text-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.3)]'
                : isEchoReady
                ? 'bg-[#0a1222]/90 border-cyan-500/60 text-cyan-300'
                : 'bg-[#0a101d]/80 border-slate-700/60 text-slate-500'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isEchoDeployed
                  ? 'bg-[#00f3ff] animate-pulse'
                  : isEchoReady
                  ? 'bg-cyan-400'
                  : 'bg-slate-600'
              }`}
            />
            <span>
              ECHO PROTOCOL [E]:{' '}
              {isEchoDeployed ? 'DEPLOYED' : isEchoReady ? 'READY TO SPAWN' : 'CHARGING'}
            </span>
          </div>
        </div>

        {/* Right: Mission Time & Audio Toggle */}
        <div className="pointer-events-auto bg-[#0a1020]/90 border border-[#00f3ff]/30 backdrop-blur-sm px-4 py-2 rounded shadow-lg shadow-cyan-950/40 flex flex-col items-end">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            Mission Clock
          </div>
          <div className="text-lg font-mono font-bold text-white tabular-nums tracking-widest">
            {formatTime(hudData.timeElapsed)}
          </div>
          <button
            onClick={onToggleMute}
            className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-cyan-400/90 hover:text-cyan-200 border border-cyan-800/60 hover:border-cyan-400 px-2 py-0.5 rounded transition-all cursor-pointer"
            title="Toggle Audio (Hotkey: M)"
          >
            {hudData.muted ? (
              <>
                <VolumeX className="w-3 h-3 text-red-400" />
                <span>MUTED [M]</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3 h-3 text-cyan-400" />
                <span>SFX ON [M]</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Subtle Hints Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-cyan-500/60 px-2 py-1 bg-black/40 rounded border border-cyan-950/40 w-fit self-center">
        <span>A / D Move · Space Jump · R Rewind · E Echo Decoy · Esc Pause</span>
      </div>
    </div>
  );
};
