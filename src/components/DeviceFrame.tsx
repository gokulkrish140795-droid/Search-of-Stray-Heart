import React from 'react';
import { Volume2, VolumeX, Sparkles, ArrowLeft, Heart, BookOpen } from 'lucide-react';
import { sound } from '../utils/sound';

interface DeviceFrameProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  accentColor?: string;
  onOpenRehearsal?: () => void;
  onOpenScrapbook?: () => void;
  foundCount?: number;
  noPadding?: boolean;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  title,
  subtitle,
  showBack = false,
  onBack,
  accentColor = '#E8C56A',
  onOpenRehearsal,
  onOpenScrapbook,
  foundCount = 0,
  noPadding = false,
}) => {
  const [isMuted, setIsMuted] = React.useState(sound.getMuted());

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full h-[100dvh] max-w-lg mx-auto bg-[#060B14] text-[#F4F7FF] flex flex-col overflow-hidden select-none font-sans shadow-2xl border-x border-[#E8C56A]/20">
      {/* Decorative ambient background glows */}
      <div
        className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-20"
        style={{ backgroundColor: accentColor }}
      />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#E8C56A]/15 blur-[100px] pointer-events-none" />

      {/* Living Glass Top HUD */}
      <header className="relative z-30 flex items-center justify-between px-4 py-3 bg-[#0B1220]/80 backdrop-blur-md border-b border-[#E8C56A]/25">
        <div className="flex items-center gap-2">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              className="p-2 -ml-1 text-[#E8C56A] hover:bg-[#E8C56A]/10 active:scale-95 transition-all rounded-lg flex items-center gap-1 text-xs font-serif uppercase tracking-wider"
              title="Go Back"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-[#E8C56A]">
              <Sparkles size={16} className="animate-pulse" />
              <span className="text-xs font-serif tracking-widest uppercase text-[#FFE7A8]">Protocol 0510</span>
            </div>
          )}
        </div>

        {/* Center Title or Rehearsal trigger */}
        <div
          className="text-center cursor-pointer px-2"
          onClick={onOpenRehearsal}
          title="Secret Rehearsal Mode"
        >
          {title && (
            <h1 className="text-xs font-serif uppercase tracking-wider font-semibold text-[#FFE7A8] truncate max-w-[180px]">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-[10px] text-slate-400 font-sans tracking-tight truncate max-w-[180px]">
              {subtitle}
            </p>
          )}
        </div>

        {/* Audio Mute & Scrapbook Indicator */}
        <div className="flex items-center gap-1.5">
          {onOpenScrapbook && (
            <button
              onClick={onOpenScrapbook}
              className="px-2 py-1 rounded-full bg-[#0B1220] border border-[#FF6B8A]/40 text-[#FFE7A8] text-[11px] font-serif hover:bg-[#FF6B8A]/20 transition flex items-center gap-1 shadow-sm"
              title="Aishwarya's Memory Scrapbook"
            >
              <Heart size={12} className="text-[#FF6B8A] fill-[#FF6B8A]/50" />
              <span className="text-[10px] font-mono font-bold">{foundCount}</span>
            </button>
          )}

          <button
            onClick={handleToggleMute}
            className="p-1.5 text-[#E8C56A] hover:bg-[#E8C56A]/15 active:scale-90 transition rounded-full"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* Luxury Gold Corner Accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#E8C56A]" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#E8C56A]" />
      </header>

      {/* Main Screen Content Viewport */}
      <main
        className={`relative flex-1 flex flex-col overflow-y-auto overflow-x-hidden ${
          noPadding ? 'p-0' : 'p-4'
        }`}
      >
        {children}
      </main>

      {/* Luxury Gold Bottom Corner Accents */}
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#E8C56A] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#E8C56A] pointer-events-none" />
    </div>
  );
};
