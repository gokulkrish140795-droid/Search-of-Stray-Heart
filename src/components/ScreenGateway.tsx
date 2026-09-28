import React, { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { sound } from '../utils/sound';

interface ScreenGatewayProps {
  onAccept: () => void;
}

export const ScreenGateway: React.FC<ScreenGatewayProps> = ({ onAccept }) => {
  const [noPos, setNoPos] = useState<{ x: number; y: number } | null>(null);
  const [noCount, setNoCount] = useState(0);
  const [miniMeSpeech, setMiniMeSpeech] = useState(
    'Aishwarya! A stray piece of my heart is wandering somewhere in our house... Will you accept this romantic quest?'
  );

  const fleeButton = () => {
    sound.playVoice('voice_no_nice_try');
    const maxX = 120;
    const maxY = 100;
    const randomX = (Math.random() - 0.5) * 2 * maxX;
    const randomY = (Math.random() - 0.5) * 2 * maxY;
    setNoPos({ x: randomX, y: randomY });
    setNoCount((prev) => prev + 1);

    const remarks = [
      'Hey! No skipping your own birthday surprise! Try again! 😜',
      'Nice try my love! But that button has wings! 💘',
      'Only YES is allowed for the birthday girl! 🥰',
      'You are the only operative qualified to find my heart! ✨',
    ];
    setMiniMeSpeech(remarks[noCount % remarks.length]);
  };

  return (
    <div className="flex-1 flex flex-col justify-between items-center text-center px-2 py-4">
      {/* Top Banner / Fairy tale letter */}
      <div className="w-full bg-[#0B1220]/70 p-4 rounded-2xl border border-[#E8C56A]/25 backdrop-blur-md shadow-lg my-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8C56A]/10 border border-[#E8C56A]/30 text-[#FFE7A8] text-xs font-serif tracking-widest uppercase mb-3">
          <Sparkles size={12} className="text-[#E8C56A]" />
          <span>Protocol 0510: Mission Brief</span>
        </div>

        <h2 className="text-2xl font-serif font-bold text-[#FFE7A8] mb-2 tracking-wide">
          The Search for a Stray Heart ✨
        </h2>

        <p className="text-sm leading-relaxed text-slate-300 font-sans mb-4">
          Happy 30th Birthday, Aishwarya! A tiny, mischievous piece of Gokul's heart has slipped away
          and is hiding inside the cozy corners of our home.
        </p>

        <div className="p-3 rounded-xl bg-black/40 border border-[#E8C56A]/20 text-xs font-serif italic text-[#FFE7A8]/90">
          "Do you accept this high-stakes romantic mission to recover the stray heart?"
        </div>
      </div>

      {/* Action Decision Area */}
      <div className="w-full flex flex-col items-center gap-4 my-6">
        <button
          onClick={() => {
            sound.playSfx('sfx_spell_quest');
            onAccept();
          }}
          className="w-full max-w-xs py-3.5 px-6 rounded-xl font-serif text-base tracking-wider uppercase font-bold text-[#060B14] bg-gradient-to-r from-[#E8C56A] via-[#FFE7A8] to-[#E8C56A] shadow-lg shadow-[#E8C56A]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Heart size={18} className="fill-[#060B14]" />
          <span>I Accept! ❤️</span>
        </button>

        {/* Fleeing "No" Trap Button */}
        <div className="relative h-12 w-full flex items-center justify-center">
          <button
            onMouseEnter={fleeButton}
            onTouchStart={(e) => {
              e.preventDefault();
              fleeButton();
            }}
            onClick={fleeButton}
            style={
              noPos
                ? {
                    transform: `translate(${noPos.x}px, ${noPos.y}px)`,
                    transition: 'transform 0.15s ease-out',
                  }
                : undefined
            }
            className="py-2 px-5 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-400 text-xs font-serif uppercase tracking-widest hover:border-red-400/50 hover:text-red-300 transition-colors shadow-sm"
          >
            No, maybe later
          </button>
        </div>
      </div>

      {/* Mini-Me Reaction Speech Line */}
      <div className="w-full p-3 rounded-xl bg-[#0B1220]/60 border border-[#E8C56A]/15 text-xs text-slate-300 italic">
        {miniMeSpeech}
      </div>
    </div>
  );
};
