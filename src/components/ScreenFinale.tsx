import React, { useState } from 'react';
import { Sparkles, Heart, BookOpen, RotateCcw, Cloud, ExternalLink } from 'lucide-react';
import { FINALE_PROTOCOL } from '../data/huntData';
import { sound } from '../utils/sound';
import { CelebrationSparkles } from './CelebrationSparkles';

interface ScreenFinaleProps {
  onRestart: () => void;
  onOpenScrapbook: () => void;
}

export const ScreenFinale: React.FC<ScreenFinaleProps> = ({ onRestart, onOpenScrapbook }) => {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [fadeStage, setFadeStage] = useState(0); // 0: input, 1: dimming, 2: finale & cloud narrative

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
        setTimeout(() => setFadeStage(2), 3200);
      } else {
        sound.playVoice('voice_no_nice_try');
      }
    }
  };

  const handleEnterClouds = () => {
    sound.playSfx('sfx_wand_swish');
    const win = window.open(FINALE_PROTOCOL.cloudGameUrl, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = FINALE_PROTOCOL.cloudGameUrl;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2 relative">
      {isUnlocked && <CelebrationSparkles durationMs={12000} />}
      {/* Stage 0 / 1: Final Protocol Entry */}
      {fadeStage < 2 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#0B1220]/90 border border-[#FF6B8A]/40 backdrop-blur-xl shadow-2xl animate-fadeIn">
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
                  className="w-12 h-14 rounded-2xl bg-black/70 border-2 border-[#E8C56A] text-2xl font-mono font-bold text-center text-[#FFE7A8] focus:outline-none focus:border-[#FF6B8A] shadow-md transition-colors"
                />
              ))}
            </div>

            {isUnlocked ? (
              <p className="text-xs font-serif text-[#FF6B8A] animate-pulse">
                ✨ Protocol Accepted. Releasing Living Glass reliquary magic...
              </p>
            ) : (
              <button
                type="button"
                onClick={onOpenScrapbook}
                className="text-[11px] font-serif text-[#E8C56A] hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <BookOpen size={12} />
                <span>Review Memory Scrapbook</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Stage 2: Look Up Finale & Pure Souls Cloud Journey */
        <div className="fixed inset-0 z-50 bg-[#060B14] overflow-y-auto px-4 py-8 flex flex-col items-center text-center animate-fadeIn">
          {/* Subtle soft gold heart glow */}
          <div className="w-20 h-20 rounded-full bg-[#E8C56A]/10 border border-[#E8C56A]/30 flex items-center justify-center mb-4 animate-pulse shadow-[0_0_35px_rgba(255,107,138,0.3)]">
            <Heart size={38} className="text-[#FF6B8A] fill-[#FF6B8A]/80" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#FFE7A8] tracking-widest uppercase mb-2 animate-fadeIn">
            {FINALE_PROTOCOL.finalCaption}
          </h1>

          <p className="text-xs sm:text-sm font-serif italic text-slate-300 max-w-xs leading-relaxed mb-4">
            The quest is complete. The stray heart was never in the phone...
          </p>

          <div className="p-3 px-6 rounded-2xl bg-[#0B1220]/80 border border-[#E8C56A]/30 text-sm font-serif text-[#FFE7A8] max-w-xs shadow-lg mb-6">
            ✨ {FINALE_PROTOCOL.gokulGiftNote} ✨
          </div>

          {/* Celestial Divider */}
          <div className="flex items-center justify-center gap-2 text-[#E8C56A]/50 text-xs mb-6">
            <span>✧</span>
            <span className="w-8 h-[1px] bg-gradient-to-r from-transparent via-[#E8C56A]/40 to-transparent"></span>
            <span>✦</span>
            <span className="w-8 h-[1px] bg-gradient-to-r from-transparent via-[#E8C56A]/40 to-transparent"></span>
            <span>✧</span>
          </div>

          {/* The Pure Souls Narrative Card */}
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#0B1220]/90 border border-[#E8C56A]/30 backdrop-blur-xl shadow-2xl text-left space-y-4 mb-6 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8C56A]/15 border border-[#E8C56A]/40 text-[#FFE7A8] text-[11px] font-serif uppercase tracking-widest font-semibold">
              <Cloud size={13} className="text-[#E8C56A]" />
              <span>{FINALE_PROTOCOL.cloudBridgeTitle}</span>
            </div>

            <div className="space-y-3 font-serif text-slate-200 text-xs sm:text-sm leading-relaxed">
              <p className="font-bold text-[#FFE7A8] text-base">{FINALE_PROTOCOL.pureSoulsMessage[0]}</p>
              <p>{FINALE_PROTOCOL.pureSoulsMessage[1]}</p>
              <p>{FINALE_PROTOCOL.pureSoulsMessage[2]}</p>
              <p className="italic text-[#FFE7A8]">{FINALE_PROTOCOL.pureSoulsMessage[3]}</p>
              <p>{FINALE_PROTOCOL.pureSoulsMessage[4]}</p>
            </div>

            {/* Lyrical Riddle Card */}
            <div className="p-4 rounded-2xl bg-black/60 border border-[#E8C56A]/40 shadow-inner">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#E8C56A] mb-2 font-semibold">
                <Sparkles size={11} />
                <span>The Gatekeeper's Riddle</span>
              </div>
              <div className="space-y-1 font-serif italic text-[#FFE7A8] text-xs sm:text-sm leading-relaxed border-l-2 border-[#E8C56A]/60 pl-3">
                {FINALE_PROTOCOL.pureSoulsRiddle.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </div>

            <p className="text-[11px] font-serif italic text-slate-300 text-center">
              {FINALE_PROTOCOL.pureSoulsPrompt}
            </p>

            {/* Enter the Clouds Button */}
            <button
              type="button"
              onClick={handleEnterClouds}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#E8C56A] via-[#FFE7A8] to-[#E8C56A] text-[#060B14] font-serif text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-[#E8C56A]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Cloud size={17} className="text-[#060B14]" />
              <span>Enter the Clouds</span>
              <ExternalLink size={14} className="text-[#060B14]/70" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5 w-full max-w-sm mb-4">
            <button
              type="button"
              onClick={onOpenScrapbook}
              className="w-full py-2.5 rounded-xl border border-[#E8C56A]/20 text-[#FFE7A8] font-serif text-xs uppercase tracking-wider hover:bg-[#E8C56A]/10 transition flex items-center justify-center gap-2"
            >
              <BookOpen size={14} />
              <span>Review Memory Scrapbook</span>
            </button>

            <button
              type="button"
              onClick={onRestart}
              className="py-2 text-[11px] font-serif uppercase tracking-widest text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw size={12} />
              <span>Replay Quest From Beginning</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
