import React, { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { FINALE_PROTOCOL } from '../data/huntData';
import { sound } from '../utils/sound';

interface ScreenFinaleProps {
  onRestart: () => void;
}

export const ScreenFinale: React.FC<ScreenFinaleProps> = ({ onRestart }) => {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [fadeStage, setFadeStage] = useState(0); // 0: input, 1: dimming, 2: look up

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...digits];
    newDigits[index] = val.slice(-1);
    setDigits(newDigits);
    sound.playSfx('sfx_tile_clack', 0.4);

    // Auto advance focus
    if (val && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }

    // Check code if complete
    const code = newDigits.join('');
    if (code.length === 4) {
      if (code === FINALE_PROTOCOL.code) {
        sound.playSfx('sfx_vault_alohomora');
        sound.playSfx('sfx_crystal_touch');
        sound.playVoice('voice_tap_yay');
        setIsUnlocked(true);

        // Sequence Phone Dim / Room Rise + Glass Soft-Off
        setTimeout(() => setFadeStage(1), 1500);
        setTimeout(() => setFadeStage(2), 3500);
      } else {
        sound.playVoice('voice_no_nice_try');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2 relative">
      {/* Stage 0 / 1: Final Protocol Entry */}
      {fadeStage < 2 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-[#0B1220]/85 border border-[#FF6B8A]/40 backdrop-blur-xl shadow-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B8A]/15 border border-[#FF6B8A]/40 text-[#FFE7A8] text-xs font-serif uppercase tracking-widest font-semibold mb-3">
              <Sparkles size={14} className="text-[#FF6B8A]" />
              <span>Final Grand Lock</span>
            </div>

            <h2 className="text-xl font-serif font-bold text-[#FFE7A8] mb-2">
              Protocol 0510
            </h2>

            <p className="text-xs text-slate-300 font-sans leading-relaxed mb-6">
              All 27 memory cards collected. All 3 household vaults conquered. Enter your sacred
              birthday protocol code (5th October) to conclude the quest:
            </p>

            {/* 4 Digit PIN Dial */}
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  id={`pin-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digits[idx]}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  className="w-12 h-14 rounded-xl bg-black/70 border-2 border-[#E8C56A] text-2xl font-mono font-bold text-center text-[#FFE7A8] focus:outline-none focus:border-[#FF6B8A] shadow-md"
                />
              ))}
            </div>

            {isUnlocked && (
              <p className="text-xs font-serif text-[#FF6B8A] animate-pulse">
                Protocol Accepted. Releasing digital reliquary magic...
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Stage 2: Phone Dim / Room Rise + Look Up Finale */
        <div className="fixed inset-0 z-50 bg-[#060B14] flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
          {/* Subtle soft gold heart glow */}
          <div className="w-24 h-24 rounded-full bg-[#E8C56A]/10 border border-[#E8C56A]/30 flex items-center justify-center mb-6 animate-pulse">
            <Heart size={40} className="text-[#FF6B8A] fill-[#FF6B8A]/80" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#FFE7A8] tracking-widest uppercase mb-4 animate-fadeIn">
            {FINALE_PROTOCOL.finalCaption}
          </h1>

          <p className="text-sm font-serif italic text-slate-300 max-w-xs leading-relaxed mb-8">
            The quest is complete. The stray heart was never in the phone...
          </p>

          <div className="p-4 rounded-2xl bg-[#0B1220]/70 border border-[#E8C56A]/20 text-xs font-serif text-[#E8C56A] max-w-xs">
            ✨ {FINALE_PROTOCOL.gokulGiftNote} ✨
          </div>

          <button
            onClick={onRestart}
            className="mt-12 text-xs font-serif uppercase tracking-widest text-slate-500 hover:text-slate-300 underline"
          >
            Replay Quest From Beginning
          </button>
        </div>
      )}
    </div>
  );
};
