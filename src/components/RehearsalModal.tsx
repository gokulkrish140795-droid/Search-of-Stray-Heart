import React, { useState } from 'react';
import { Sparkles, X, Check } from 'lucide-react';
import { HUNT_CARDS, HUNT_VAULTS } from '../data/huntData';

interface RehearsalModalProps {
  currentStep: number;
  onJumpToStep: (stepNumber: number) => void;
  onClose: () => void;
}

export const RehearsalModal: React.FC<RehearsalModalProps> = ({
  currentStep,
  onJumpToStep,
  onClose,
}) => {
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(false);

  // Gokul rehearsal PIN: 1407 or 0510
  const handleCheckPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1407' || pin === '0510' || pin === '9595') {
      setIsUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#0B1220] border border-[#E8C56A]/50 shadow-2xl p-4 flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center pb-2 border-b border-white/10 mb-3">
          <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#FFE7A8] uppercase tracking-wider">
            <Sparkles size={14} className="text-[#E8C56A]" />
            <span>Rehearsal Testing Hub</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {!isUnlocked ? (
          <form onSubmit={handleCheckPin} className="space-y-3 py-4 text-center">
            <p className="text-xs text-slate-300 font-sans">
              Enter Gokul's 4-digit Rehearsal PIN to test any chapter or vault:
            </p>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN"
              className="w-32 py-2 px-3 text-center text-lg font-mono rounded-lg bg-black/60 border border-[#E8C56A] text-[#FFE7A8] focus:outline-none"
            />
            {error && <p className="text-xs text-red-400">Incorrect PIN</p>}
            <div>
              <button
                type="submit"
                className="py-1.5 px-4 bg-[#E8C56A] text-[#060B14] rounded-lg font-serif text-xs font-bold uppercase tracking-wider"
              >
                Enter
              </button>
            </div>
          </form>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            <p className="text-[11px] text-slate-400">
              Quickly jump to any clue, card, vault, or the finale for rehearsal testing:
            </p>

            {/* Quick Flow Presets */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onJumpToStep(0);
                  onClose();
                }}
                className="p-2 rounded-lg bg-red-950/40 border border-red-500/40 text-left text-red-200 hover:border-red-400 font-semibold"
              >
                🔄 Reset to Start (Gateway)
              </button>
              <button
                onClick={() => {
                  onJumpToStep(1);
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-left text-slate-200 hover:border-[#E8C56A]"
              >
                🌸 Card 01 (Fresh Start)
              </button>
              <button
                onClick={() => {
                  onJumpToStep(10);
                  onClose();
                }}
                className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/40 text-left text-amber-200 hover:border-[#E8C56A]"
              >
                🔒 Vault 1 (Step 10)
              </button>
              <button
                onClick={() => {
                  onJumpToStep(11);
                  onClose();
                }}
                className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-left text-cyan-200 hover:border-[#7EF0FF]"
              >
                🔎 Card 11 (Ch 2)
              </button>
              <button
                onClick={() => {
                  onJumpToStep(20);
                  onClose();
                }}
                className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-left text-cyan-200 hover:border-[#7EF0FF]"
              >
                🔒 Vault 2 (Step 20)
              </button>
              <button
                onClick={() => {
                  onJumpToStep(21);
                  onClose();
                }}
                className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/40 text-left text-rose-200 hover:border-[#FF6B8A]"
              >
                🚗 Card 21 (Ch 3)
              </button>
              <button
                onClick={() => {
                  onJumpToStep(23);
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-left text-slate-200 hover:border-[#E8C56A]"
              >
                🕊️ Card 23 (Uncle Photo)
              </button>
              <button
                onClick={() => {
                  onJumpToStep(29);
                  onClose();
                }}
                className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-left text-slate-200 hover:border-[#E8C56A]"
              >
                🚘 Card 29 (Car Boot)
              </button>
              <button
                onClick={() => {
                  onJumpToStep(30);
                  onClose();
                }}
                className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/40 text-left text-rose-200 hover:border-[#FF6B8A]"
              >
                🔒 Vault 3 (Step 30)
              </button>
              <button
                onClick={() => {
                  onJumpToStep(31);
                  onClose();
                }}
                className="p-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-[#E8C56A] text-left text-[#FFE7A8]"
              >
                ✨ Protocol 0510 (Finale)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
