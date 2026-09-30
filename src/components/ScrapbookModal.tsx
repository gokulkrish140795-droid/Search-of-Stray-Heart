import React, { useState } from 'react';
import { X, Sparkles, Lock, MapPin, Heart, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import { HUNT_CARDS, CHAPTER_CONFIG, CardItem } from '../data/huntData';
import { sound } from '../utils/sound';

interface ScrapbookModalProps {
  foundCardIds: string[];
  currentStep: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ScrapbookModal: React.FC<ScrapbookModalProps> = ({
  foundCardIds,
  currentStep,
  isOpen,
  onClose,
}) => {
  const [selectedAct, setSelectedAct] = useState<number | 'all'>('all');
  const [activeCardDetail, setActiveCardDetail] = useState<CardItem | null>(null);

  if (!isOpen) return null;

  const filteredCards = HUNT_CARDS.filter((card) => {
    if (selectedAct === 'all') return true;
    return card.chapter === selectedAct;
  });

  const unlockedCount = HUNT_CARDS.filter((c) => foundCardIds.includes(c.id)).length;
  const progressPercent = Math.round((unlockedCount / HUNT_CARDS.length) * 100);

  const handleCardClick = (card: CardItem, isUnlocked: boolean) => {
    if (!isUnlocked) {
      sound.playVoice('voice_idle_hmm');
      return;
    }
    sound.playSfx('sfx_crystal_touch');
    setActiveCardDetail(card);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex flex-col justify-between animate-fadeIn pointer-events-auto">
      {/* Top Header */}
      <header className="px-4 py-3 bg-[#0B1220]/90 border-b border-[#E8C56A]/30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#E8C56A]/20 border border-[#E8C56A] flex items-center justify-center text-[#FFE7A8]">
            <BookOpen size={16} />
          </div>
          <div>
            <h2 className="text-sm font-serif font-bold text-[#FFE7A8] tracking-wider">
              Aishwarya's Memory Scrapbook
            </h2>
            <p className="text-[10px] text-slate-400 font-sans">
              {unlockedCount} of {HUNT_CARDS.length} Memories Unlocked ({progressPercent}%)
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            sound.playSfx('sfx_tile_clack', 0.4);
            onClose();
          }}
          className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
        >
          <X size={18} />
        </button>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#E8C56A] via-[#FF6B8A] to-[#7EF0FF] transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Act Filter Tabs */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#060B14]/90 border-b border-white/10 overflow-x-auto text-xs font-serif scrollbar-none">
        <button
          onClick={() => setSelectedAct('all')}
          className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
            selectedAct === 'all'
              ? 'bg-[#E8C56A] text-[#060B14] font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200 bg-white/5'
          }`}
        >
          All ({HUNT_CARDS.length})
        </button>
        {[1, 2, 3].map((ch) => {
          const cfg = CHAPTER_CONFIG[ch as 1 | 2 | 3];
          const isActActive = selectedAct === ch;
          const actCards = HUNT_CARDS.filter((c) => c.chapter === ch);
          const actFound = actCards.filter((c) => foundCardIds.includes(c.id)).length;
          return (
            <button
              key={ch}
              onClick={() => setSelectedAct(ch)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all flex items-center gap-1 ${
                isActActive
                  ? 'text-[#060B14] font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-white/5'
              }`}
              style={{
                backgroundColor: isActActive ? cfg.accent : undefined,
              }}
            >
              <span>Act {cfg.roman}</span>
              <span className="text-[10px] opacity-80">({actFound}/{actCards.length})</span>
            </button>
          );
        })}
      </div>

      {/* Scrapbook Cards Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-lg mx-auto w-full">
        <div className="grid grid-cols-2 gap-3.5">
          {filteredCards.map((card) => {
            const isUnlocked = foundCardIds.includes(card.id);
            const chapterCfg = CHAPTER_CONFIG[card.chapter];

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card, isUnlocked)}
                className={`relative rounded-2xl p-3 border transition-all duration-300 flex flex-col justify-between select-none cursor-pointer ${
                  isUnlocked
                    ? 'bg-[#0B1220]/90 border-[#E8C56A]/40 shadow-lg hover:border-[#E8C56A] hover:scale-[1.02] active:scale-95'
                    : 'bg-black/40 border-white/10 opacity-60 hover:opacity-75'
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[10px] font-serif font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${chapterCfg.accent}20`,
                      color: chapterCfg.accent,
                      border: `1px solid ${chapterCfg.accent}50`,
                    }}
                  >
                    Card #{card.id}
                  </span>
                  {isUnlocked ? (
                    <CheckCircle2 size={14} className="text-[#E8C56A]" />
                  ) : (
                    <Lock size={13} className="text-slate-500" />
                  )}
                </div>

                {isUnlocked ? (
                  <>
                    {/* Unlocked Polaroid Style Preview */}
                    <div className="my-1.5 p-2 rounded-xl bg-black/40 border border-[#E8C56A]/20">
                      <p className="font-handwriting text-sm text-[#FFE7A8] leading-tight line-clamp-3">
                        "{card.quote}"
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                      <span className="font-mono font-bold text-[#E8C56A]">
                        {card.letters}
                      </span>
                      <span className="text-slate-400 font-serif flex items-center gap-0.5">
                        <MapPin size={10} /> View
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="py-6 flex flex-col items-center justify-center text-center">
                    <div className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-1 text-slate-500">
                      <Lock size={15} />
                    </div>
                    <span className="text-[10px] font-serif text-slate-400">Locked Memory</span>
                    <span className="text-[9px] text-slate-500 italic mt-0.5">
                      Card {card.id} (Act {card.chapter})
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Detail Popup Modal */}
      {activeCardDetail && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-[#0B1220] border-2 border-[#E8C56A]/60 shadow-[0_0_35px_rgba(232,197,106,0.3)] p-5 relative flex flex-col">
            <button
              onClick={() => setActiveCardDetail(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-[#E8C56A]" />
              <span className="text-xs font-serif font-bold text-[#FFE7A8] uppercase tracking-wider">
                Memory Reliquary • Card #{activeCardDetail.id}
              </span>
            </div>

            {/* Polaroid Frame */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-[#151f33] to-[#0d1524] border border-[#E8C56A]/30 shadow-inner mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-serif font-semibold text-[#E8C56A]">
                  Act {activeCardDetail.chapter} • {CHAPTER_CONFIG[activeCardDetail.chapter].title}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#E8C56A]/20 text-[#FFE7A8] border border-[#E8C56A]/40">
                  {activeCardDetail.letters}
                </span>
              </div>

              {/* Romantic Quote */}
              <div className="p-3 my-2 rounded-xl bg-black/40 border border-[#E8C56A]/20">
                <p className="font-handwriting text-lg text-[#FFE7A8] leading-snug">
                  "{activeCardDetail.quote}"
                </p>
                <p className="text-[10px] text-right font-serif text-[#FF6B8A] mt-1 font-semibold">
                  — With all my heart, Gokul
                </p>
              </div>

              {/* Riddle & Location Recap */}
              <div className="mt-3 space-y-1.5 text-xs text-slate-300 font-serif italic border-l-2 border-[#E8C56A]/40 pl-2.5">
                {activeCardDetail.riddle.map((r, i) => (
                  <p key={i}>{r}</p>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-[#7EF0FF]">
                <MapPin size={12} className="flex-shrink-0" />
                <span className="font-sans font-medium">{activeCardDetail.location}</span>
              </div>
            </div>

            {/* Mini-Me Whisper */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/50 border border-white/10 text-[11px] text-slate-300 font-serif">
              <img
                src="/avatar.png"
                alt="Mini-Me"
                className="w-6 h-6 rounded-full border border-[#E8C56A] object-cover"
              />
              <span className="italic line-clamp-2">"{activeCardDetail.miniMe}"</span>
            </div>

            <button
              onClick={() => setActiveCardDetail(null)}
              className="mt-4 w-full py-2.5 rounded-xl font-serif text-xs uppercase tracking-wider font-bold text-[#060B14] bg-[#FFE7A8] hover:bg-[#E8C56A] shadow-md"
            >
              Return to Scrapbook
            </button>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="p-3 bg-[#0B1220]/90 border-t border-[#E8C56A]/20 text-center">
        <p className="text-[11px] font-serif text-slate-400">
          ✨ Collect all {HUNT_CARDS.length} cards to illuminate every chapter of your stray heart quest.
        </p>
      </footer>
    </div>
  );
};
