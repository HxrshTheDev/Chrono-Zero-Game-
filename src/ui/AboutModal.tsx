import React from 'react';
import { X, Info, Clock, Ghost, Shield, Zap } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="relative bg-[#090f1e] border border-cyan-500/40 w-full max-w-lg p-6 rounded shadow-2xl shadow-cyan-950/60 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 mb-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wider">
            <Info className="w-5 h-5" />
            <span className="font-mono text-base uppercase">Mission Intelligence Briefing</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p className="text-cyan-200 font-semibold italic text-sm border-l-2 border-cyan-400 pl-3">
            "Your past self becomes your teammate."
          </p>

          <p>
            You are a cybernetic operative infiltrating an underground high-security laboratory.
            Your target: the <strong>Chrono Core</strong>, an experimental device capable of manipulating
            localized space-time.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-[#0e172a] border border-cyan-900/60 p-3 rounded">
              <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                <Clock className="w-4 h-4" />
                <span>5-Second Rewind [R]</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Rewinds your position up to 5 seconds into the past while preserving your timeline memory.
              </p>
            </div>

            <div className="bg-[#0e172a] border border-cyan-900/60 p-3 rounded">
              <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                <Ghost className="w-4 h-4" />
                <span>Holographic Echo [E]</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Spawns an Echo repeating your recorded actions to hold pressure switches and distract enforcers.
              </p>
            </div>

            <div className="bg-[#0e172a] border border-cyan-900/60 p-3 rounded">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                <Shield className="w-4 h-4" />
                <span>Security Enforcer</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Patrols the corridor with sensory vision cones. Decoys fool the guard and buy critical escape time.
              </p>
            </div>

            <div className="bg-[#0e172a] border border-cyan-900/60 p-3 rounded">
              <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
                <Zap className="w-4 h-4" />
                <span>Laser Grid & Doors</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pressure plates open the blast door and disable lethal lasers while continuously occupied.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-3 text-[11px] text-slate-400 font-mono">
            PORTFOLIO BUILD v1.0 • HTML5 CANVAS 2D • ZERO EXTERNAL NETWORK ASSETS
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-cyan-900/40 text-center">
          <button
            onClick={onClose}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-widest text-xs uppercase py-2.5 rounded transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
          >
            Return to Mission Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
