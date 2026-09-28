import React, { useState } from 'react';
import { Lock, Unlock, Sparkles, AlertCircle } from 'lucide-react';
import { VaultItem, CHAPTER_CONFIG } from '../data/huntData';
import { sound } from '../utils/sound';

interface ScreenVaultProps {
  vault: VaultItem;
  collectedLetters: string[];
  onVaultUnlocked: () => void;
}

export const ScreenVault: React.FC<ScreenVaultProps> = ({
  vault,
  collectedLetters,
  onVaultUnlocked,
}) => {
  const [inputWord, setInputWord] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const chapterConfig = CHAPTER_CONFIG[vault.chapter];

  const handleLetterClick = (letter: string) => {
    sound.playSfx('sfx_tile_clack', 0.5);
    setInputWord((prev) => prev + letter);
  };

  const handleBackspace = () => {
    sound.playSfx('sfx_tile_clack', 0.3);
    setInputWord((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    sound.playSfx('sfx_tile_clack', 0.3);
    setInputWord('');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputWord.replace(/[^A-Za-z]/g, '').toUpperCase();
    const target = vault.password.toUpperCase();

    // Check either exact target password or bypass keywords
    const isBypass = vault.bypass.some((bp) =>
      clean.toLowerCase().includes(bp.replace(/[^a-z]/g, '').toLowerCase())
    );

    if (clean === target || isBypass) {
      sound.playSfx('sfx_vault_alohomora');
      sound.playSfx('sfx_revelio_bell');
      sound.playVoice('voice_tap_yay');
      setIsUnlocked(true);

      setTimeout(() => {
        onVaultUnlocked();
      }, 3500);
    } else {
      sound.playVoice('voice_no_nice_try');
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 800);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-1 relative">
      {/* Chapter Milestone Vault Header */}
      <div className="text-center px-1 mb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8C56A]/15 border border-[#E8C56A]/40 text-[#FFE7A8] text-xs font-serif uppercase tracking-widest font-semibold mb-1">
          <Sparkles size={14} className="text-[#E8C56A]" />
          <span>Milestone Vault #{vault.chapter} ({vault.soundName})</span>
        </div>
        <h2 className="text-lg font-serif font-bold text-[#FFE7A8]">
          Act {chapterConfig.roman} Anagram Lock
        </h2>
      </div>

      {/* Riddle & Instructions Card */}
      <div className="p-4 rounded-2xl bg-[#0B1220]/85 border border-[#E8C56A]/40 backdrop-blur-md shadow-xl my-auto">
        <div className="space-y-1.5 py-1 pl-3 border-l-2 border-[#E8C56A]/50 text-xs sm:text-sm font-serif italic text-slate-100 leading-relaxed mb-4">
          {vault.riddle.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>

        {/* Target Input Display */}
        <div className="mb-4">
          <label className="text-[11px] font-serif text-slate-400 block mb-1">
            Solve the Anagram for Milestone Gift Location:
          </label>
          <div
            className={`w-full min-h-[46px] p-2.5 rounded-xl bg-black/60 border ${
              errorShake ? 'border-red-500 animate-shake' : 'border-[#E8C56A]/40'
            } text-base font-mono tracking-widest font-bold text-[#FFE7A8] flex items-center justify-between`}
          >
            <span className="truncate">{inputWord || '...'}</span>
            {inputWord && (
              <button
                type="button"
                onClick={handleBackspace}
                className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
              >
                ⌫
              </button>
            )}
          </div>
        </div>

        {/* Letter Tokens Keyboard Tile Rack */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5 text-[10px] font-serif text-slate-400">
            <span>Collected Tokens:</span>
            <button
              onClick={handleClear}
              className="text-[#E8C56A] hover:underline"
            >
              Reset Tiles
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center max-h-36 overflow-y-auto p-1.5 bg-black/30 rounded-xl border border-white/5">
            {collectedLetters.map((letter, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLetterClick(letter)}
                className="w-8 h-8 rounded-lg bg-[#E8C56A]/20 border border-[#E8C56A] hover:bg-[#E8C56A] hover:text-[#060B14] active:scale-90 text-[#FFE7A8] text-xs font-mono font-bold transition flex items-center justify-center shadow-sm"
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Unlock Action Button */}
        <button
          onClick={() => handleSubmit()}
          className="w-full py-3 rounded-xl font-serif text-xs uppercase tracking-wider font-bold text-[#060B14] bg-gradient-to-r from-[#E8C56A] via-[#FFE7A8] to-[#E8C56A] shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Lock size={15} />
          <span>Unlock Milestone Vault</span>
        </button>
      </div>

      {/* Success Modal */}
      {isUnlocked && (
        <div className="fixed inset-0 z-50 bg-[#060B14]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-[#E8C56A]/20 border-2 border-[#E8C56A] flex items-center justify-center text-[#FFE7A8] text-3xl font-bold mb-4 animate-bounce">
            <Unlock size={36} className="text-[#FFE7A8]" />
          </div>
          <span className="text-xs font-serif uppercase tracking-widest text-[#E8C56A]">
            Vault Opened: {vault.soundName}
          </span>
          <h3 className="text-xl font-serif font-bold text-[#FFE7A8] mt-1 mb-2">
            Password Verified!
          </h3>
          <p className="text-sm font-mono text-[#FFE7A8] font-bold bg-[#E8C56A]/10 px-4 py-2 rounded-xl border border-[#E8C56A]/30 mb-4">
            {vault.password}
          </p>
          <p className="text-xs text-slate-200 font-serif leading-relaxed max-w-xs">
            Go to <b>{vault.location}</b> now to collect your real physical milestone gift! 🎁
          </p>
        </div>
      )}
    </div>
  );
};
