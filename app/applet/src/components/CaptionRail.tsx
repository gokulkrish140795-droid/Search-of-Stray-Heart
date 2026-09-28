import React from 'react';

interface CaptionRailProps {
  speech: string;
  speakerName?: string;
  avatarSrc?: string;
  onAvatarTap?: () => void;
  accentColor?: string;
}

export const CaptionRail: React.FC<CaptionRailProps> = ({
  speech,
  speakerName = 'Gokul',
  avatarSrc = '/avatar.png',
  onAvatarTap,
  accentColor = '#E8C56A',
}) => {
  return (
    <div className="relative mt-auto pt-3 pb-1 w-full z-20">
      <div className="relative flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-[#0B1220]/90 backdrop-blur-xl border border-[#E8C56A]/30 shadow-xl">
        {/* Static 2D Doodle Mini-Me in Gold Ring Halo */}
        <div
          onClick={onAvatarTap}
          className="relative flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
          title="Mini-Me"
        >
          <div
            className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#E8C56A] via-[#FFE7A8] to-[#E8C56A] shadow-md shadow-[#E8C56A]/20"
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-[#060B14] flex items-center justify-center border border-black/40">
              <img
                src={avatarSrc}
                alt="Mini-Me Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback avatar doodle if image fails
                  const target = e.currentTarget;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>
          {/* Subtle Halo Dot */}
          <span
            className="absolute -top-1 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0B1220] flex items-center justify-center text-[8px]"
            style={{ backgroundColor: accentColor }}
          >
            ✨
          </span>
        </div>

        {/* Cinematic Speech Text Rail */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-[11px] font-serif font-bold tracking-wider uppercase"
              style={{ color: accentColor }}
            >
              {speakerName}
            </span>
            <span className="text-[9px] text-slate-400 uppercase tracking-widest">
              Companion
            </span>
          </div>
          <p className="text-xs sm:text-[13px] leading-relaxed text-[#F4F7FF] font-sans font-medium line-clamp-4">
            {speech}
          </p>
        </div>

        {/* Gold Corner Ticks for Living Glass look */}
        <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-[#E8C56A]/50 pointer-events-none" />
        <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-[#E8C56A]/50 pointer-events-none" />
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-[#E8C56A]/50 pointer-events-none" />
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-[#E8C56A]/50 pointer-events-none" />
      </div>
    </div>
  );
};
