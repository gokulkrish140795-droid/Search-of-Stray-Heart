import React, { useState, useEffect } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

interface ScreenPrankProps {
  onUnlocked: () => void;
}

export const ScreenPrank: React.FC<ScreenPrankProps> = ({ onUnlocked }) => {
  const [progress, setProgress] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const [showHearts, setShowHearts] = useState(false);

  useEffect(() => {
    sound.playSfx('sfx_snitch_wings', 0.4);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          setIsFrozen(true);
          sound.playVoice('voice_idle_hmm');
          return 99; // Explicitly freeze at 99%!
        }
        return prev + 7;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  const handleFaceKiss = () => {
    sound.unlockAudio(); // Browser autoplay unlocked!
    sound.playVoice('voice_kiss_giggle');
    sound.playSfx('sfx_revelio_bell');
    setShowHearts(true);

    setTimeout(() => {
      onUnlocked();
    }, 1400);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-3 relative">
      {/* 99% Overload Card */}
      <div className="w-full max-w-sm p-5 rounded-2xl bg-[#0B1220]/90 border border-[#E8C56A]/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Loading Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs font-serif text-[#FFE7A8] mb-1.5">
            <span>Calibrating Reliquary Sensors...</span>
            <span className="font-bold text-[#E8C56A]">{progress}%</span>
          </div>
          <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden p-0.5 border border-[#E8C56A]/30">
            <div
              className="h-full bg-gradient-to-r from-[#E8C56A] via-[#FFE7A8] to-[#FF6B8A] rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Warning text upon freezing */}
        {isFrozen && (
          <div className="animate-fadeIn">
            <div className="inline-flex items-center gap-1 text-[#FF6B8A] text-xs font-serif uppercase tracking-widest font-bold mb-2">
              <Sparkles size={14} />
              <span>✨ Sweetness Overload! ✨</span>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-sans mb-4">
              The Wellington wind must have blown away our connection! 💨 But wait... my heart-meters
              show this phone is being held by a girl with <b>TWO university degrees! 🎓🎓</b>
              <br />
              <br />
              Your brilliant brain and breathtaking beauty have completely melted my little servers! 💘
            </p>

            {/* Tap Face to Kiss Avatar */}
            <div className="flex flex-col items-center gap-2">
              <div
                onClick={handleFaceKiss}
                className="relative cursor-pointer group active:scale-90 transition-transform"
                title="Tap to give Mini-Me a kiss!"
              >
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#FF6B8A] via-[#FFE7A8] to-[#E8C56A] animate-pulse shadow-xl shadow-[#FF6B8A]/30">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#060B14] flex items-center justify-center border-2 border-white/20">
                    <img
                      src="/avatar.png"
                      alt="Mini-Me Face"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 text-2xl animate-bounce">💋</span>
              </div>

              <p className="text-xs font-serif text-[#FFE7A8] tracking-wider uppercase font-semibold mt-2 animate-pulse">
                👉 Quick! Tap my face to give me a kiss and restart the system!
              </p>
            </div>
          </div>
        )}

        {/* Floating Heart Confetti upon kissing */}
        {showHearts && (
          <div className="absolute inset-0 bg-[#0B1220]/90 backdrop-blur-md flex flex-col items-center justify-center animate-fadeIn z-30">
            <Heart size={64} className="text-[#FF6B8A] fill-[#FF6B8A] animate-ping" />
            <h3 className="text-lg font-serif font-bold text-[#FFE7A8] mt-4">System Restored! ❤️</h3>
            <p className="text-xs text-[#E8C56A] font-serif">Opening Chapter 1: Everyday Comforts...</p>
          </div>
        )}
      </div>
    </div>
  );
};
