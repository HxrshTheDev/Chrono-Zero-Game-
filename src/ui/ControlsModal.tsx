import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const controlRows = [
    { keys: ['A', 'D', 'or', '←', '→'], desc: 'Horizontal Locomotion' },
    { keys: ['Space', 'or', 'W', '↑'], desc: 'Jump / Dynamic Wall Hop' },
    { keys: ['R'], desc: 'Rewind 5 Seconds (or Instant Retry on Death)' },
    { keys: ['E'], desc: 'Deploy Holographic Echo (Replays Past 5s)' },
    { keys: ['M'], desc: 'Toggle Audio Synthesizer Mute' },
    { keys: ['Esc'], desc: 'Pause / Resume Mission' },
    { keys: ['Enter'], desc: 'Infiltrate Vault / Confirm' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative bg-[#090f1e] border border-cyan-500/40 w-full max-w-md p-6 rounded shadow-2xl shadow-cyan-950/60">
        <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 mb-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wider">
            <Keyboard className="w-5 h-5" />
            <span className="font-mono text-base uppercase">Operative Controls Protocol</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {controlRows.map((row, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1.5 border-b border-slate-800/40"
            >
              <div className="flex items-center gap-1.5">
                {row.keys.map((k, kidx) => (
                  <span
                    key={kidx}
                    className={
                      k === 'or'
                        ? 'text-slate-500 text-[10px]'
                        : 'bg-[#152238] border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded text-[11px] font-bold shadow-sm'
                    }
                  >
                    {k}
                  </span>
                ))}
              </div>
              <span className="text-slate-300 font-sans font-medium text-xs">{row.desc}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-cyan-900/40 text-center">
          <button
            onClick={onClose}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-widest text-xs uppercase py-2.5 rounded transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
          >
            Acknowledge Protocol
          </button>
        </div>
      </div>
    </div>
  );
};
