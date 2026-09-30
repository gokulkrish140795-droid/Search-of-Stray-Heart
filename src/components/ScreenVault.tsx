import React, { useState, useEffect, useMemo } from 'react';
import { Lock, Unlock, Sparkles, HelpCircle, ArrowLeft, RefreshCw, KeyRound, AlertTriangle } from 'lucide-react';
import { VaultItem, CHAPTER_CONFIG } from '../data/huntData';
import { sound } from '../utils/sound';
import { CelebrationSparkles } from './CelebrationSparkles';

interface ScreenVaultProps {
  vault: VaultItem;
  collectedLetters: string[];
  onVaultUnlocked: () => void;
}

interface TileToken {
  id: number;
  letter: string;
}

export const ScreenVault: React.FC<ScreenVaultProps> = ({
  vault,
  collectedLetters,
  onVaultUnlocked,
}) => {
  const chapterConfig = CHAPTER_CONFIG[vault.chapter];

  // Initialize pool of tokens with unique IDs
  const allTokens = useMemo<TileToken[]>(() => {
    return collectedLetters.map((l, i) => ({
      id: i,
      letter: l.toUpperCase(),
    }));
  }, [collectedLetters]);

  // Placed tiles in the word slot
  const [placedTiles, setPlacedTiles] = useState<TileToken[]>([]);
  const [errorShake, setErrorShake] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Placed tile IDs set for quick lookup
  const placedIds = useMemo(() => new Set(placedTiles.map((t) => t.id)), [placedTiles]);

  // Available tiles in rack
  const rackTiles = useMemo(
    () => allTokens.filter((t) => !placedIds.has(t.id)),
    [allTokens, placedIds]
  );

  const inputWord = placedTiles.map((t) => t.letter).join('');
  const targetPassword = vault.password.toUpperCase();

  // Decoys detection (e.g. Chapter 2 & 3 where extra letters exist)
  const hasDecoys = allTokens.length > targetPassword.length;

  const handleTileClick = (tile: TileToken) => {
    sound.playSfx('sfx_tile_clack', 0.5);
    setPlacedTiles((prev) => [...prev, tile]);
  };

  const handleRemovePlacedTile = (index: number) => {
    sound.playSfx('sfx_tile_clack', 0.3);
    setPlacedTiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBackspace = () => {
    if (placedTiles.length === 0) return;
    sound.playSfx('sfx_tile_clack', 0.3);
    setPlacedTiles((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    sound.playSfx('sfx_tile_clack', 0.3);
    setPlacedTiles([]);
  };

  // Keyboard support: user can type directly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isUnlocked) return;
      if (e.key === 'Backspace') {
        handleBackspace();
        return;
      }
      if (e.key === 'Enter') {
        handleSubmit();
        return;
      }
      if (/^[a-zA-Z]$/.test(e.key)) {
        const typedLetter = e.key.toUpperCase();
        // Find first available tile in rack matching this letter
        const availableTile = rackTiles.find((t) => t.letter === typedLetter);
        if (availableTile) {
          handleTileClick(availableTile);
        } else {
          sound.playVoice('voice_idle_hmm');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rackTiles, isUnlocked]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = inputWord.replace(/[^A-Za-z]/g, '').toUpperCase();
    const target = vault.password.toUpperCase();

    // Check exact target password or bypass keyword
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
        <div className="space-y-1.5 py-1 pl-3 border-l-2 border-[#E8C56A]/50 text-xs sm:text-sm font-serif italic text-slate-100 leading-relaxed mb-3">
          {vault.riddle.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>

        {/* Decoy alert banner if applicable */}
        {hasDecoys && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[10px] text-amber-200 mb-3">
            <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
            <span>
              Decoys detected! Some tiles do not belong in the target password ({targetPassword.length} letters).
            </span>
          </div>
        )}

        {/* Target Answer Rack */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1 text-[11px] font-serif text-slate-400">
            <span>Your Solution ({placedTiles.length}/{targetPassword.length} letters):</span>
            {placedTiles.length > 0 && (
              <button
                type="button"
                onClick={handleBackspace}
                className="text-[10px] text-[#E8C56A] hover:underline flex items-center gap-0.5"
              >
                <span>Remove last</span>
              </button>
            )}
          </div>

          <div
            className={`w-full min-h-[50px] p-2 rounded-xl bg-black/70 border ${
              errorShake ? 'border-red-500 animate-shake' : 'border-[#E8C56A]/50'
            } flex flex-wrap gap-1.5 items-center justify-start`}
          >
            {placedTiles.length === 0 ? (
              <span className="text-xs font-mono text-slate-500 italic px-2">
                Tap letters below or type on keyboard...
              </span>
            ) : (
              placedTiles.map((tile, idx) => (
                <button
                  key={`${tile.id}-${idx}`}
                  type="button"
                  onClick={() => handleRemovePlacedTile(idx)}
                  className="w-8 h-8 rounded-lg bg-gradient-to-b from-[#FFE7A8] to-[#E8C56A] text-[#060B14] font-mono font-bold text-sm flex items-center justify-center shadow-md active:scale-90 hover:opacity-90 transition-transform"
                  title="Click to return to rack"
                >
                  {tile.letter}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Letter Tokens Keyboard Tile Rack */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5 text-[10px] font-serif text-slate-400">
            <span>Available Tile Rack ({rackTiles.length} remaining):</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHint((prev) => !prev)}
                className="text-[#7EF0FF] hover:underline flex items-center gap-1"
              >
                <HelpCircle size={11} />
                <span>{showHint ? 'Hide Hint' : 'Whisper Hint'}</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-[#E8C56A] hover:underline"
              >
                Reset Rack
              </button>
            </div>
          </div>

          {/* Hint Drawer */}
          {showHint && (
            <div className="p-2 mb-2 rounded-lg bg-slate-900/90 border border-[#7EF0FF]/30 text-[11px] font-serif italic text-slate-300">
              💡 <b>Mini-Me Whisper:</b> "{vault.miniMe}"
            </div>
          )}

          {/* Tiles Grid */}
          <div className="flex flex-wrap gap-1.5 justify-center max-h-36 overflow-y-auto p-2 bg-black/40 rounded-xl border border-white/10">
            {rackTiles.length === 0 ? (
              <span className="text-[11px] text-slate-500 italic py-1">
                All letter tiles are placed above.
              </span>
            ) : (
              rackTiles.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => handleTileClick(tile)}
                  className="w-8 h-8 rounded-lg bg-[#E8C56A]/20 border border-[#E8C56A] hover:bg-[#E8C56A] hover:text-[#060B14] active:scale-90 text-[#FFE7A8] text-xs font-mono font-bold transition flex items-center justify-center shadow-sm"
                >
                  {tile.letter}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Unlock Action Button */}
        <button
          onClick={() => handleSubmit()}
          disabled={placedTiles.length === 0}
          className="w-full py-3 rounded-xl font-serif text-xs uppercase tracking-wider font-bold text-[#060B14] bg-gradient-to-r from-[#E8C56A] via-[#FFE7A8] to-[#E8C56A] shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Lock size={15} />
          <span>Unlock Milestone Vault</span>
        </button>
      </div>

      {/* Success Modal */}
      {isUnlocked && (
        <div className="fixed inset-0 z-50 bg-[#060B14]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn pointer-events-auto">
          <CelebrationSparkles />
          <div className="w-20 h-20 rounded-full bg-[#E8C56A]/20 border-2 border-[#E8C56A] flex items-center justify-center text-[#FFE7A8] text-3xl font-bold mb-4 animate-bounce shadow-[0_0_30px_#E8C56A]">
            <Unlock size={38} className="text-[#FFE7A8]" />
          </div>
          <span className="text-xs font-serif uppercase tracking-widest text-[#E8C56A]">
            Vault Opened: {vault.soundName}
          </span>
          <h3 className="text-xl font-serif font-bold text-[#FFE7A8] mt-1 mb-2">
            Password Verified!
          </h3>
          <p className="text-base font-mono text-[#FFE7A8] font-bold bg-[#E8C56A]/10 px-4 py-2 rounded-xl border border-[#E8C56A]/30 mb-4 tracking-widest">
            {vault.password}
          </p>
          <p className="text-sm text-slate-200 font-serif leading-relaxed max-w-xs mb-3">
            Go to <b>{vault.location}</b> now to collect your real physical milestone gift! 🎁
          </p>
          <p className="text-[11px] text-slate-400 font-sans italic">
            Advancing to next chapter...
          </p>
        </div>
      )}
    </div>
  );
};
