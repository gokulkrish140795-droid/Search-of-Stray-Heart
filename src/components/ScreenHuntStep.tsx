import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  Sparkles,
  HelpCircle,
  BookOpen,
  ChevronRight,
  X,
  Lock,
  CheckCircle2,
  RefreshCw,
  Info,
  ArrowLeft,
  Volume2,
  VolumeX,
  Heart,
} from 'lucide-react';
import { CardItem, CHAPTER_CONFIG } from '../data/huntData';
import { sound } from '../utils/sound';
import {
  startMindArTracking,
  MindTargetInfo,
} from '../utils/arEngine';

interface ScreenHuntStepProps {
  card: CardItem;
  collectedLetters: string[];
  foundCardIds: string[];
  onCardFound: (card: CardItem) => void;
  onBack: () => void;
  onOpenRehearsal: () => void;
  onOpenScrapbook: () => void;
}

export const ScreenHuntStep: React.FC<ScreenHuntStepProps> = ({
  card,
  collectedLetters,
  foundCardIds,
  onCardFound,
  onBack,
  onOpenRehearsal,
  onOpenScrapbook,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [showRiddleDrawer, setShowRiddleDrawer] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [bypassInput, setBypassInput] = useState('');
  const [bypassError, setBypassError] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('Align card in reticle');
  const [showFoundCelebration, setShowFoundCelebration] = useState(false);
  const [registryToast, setRegistryToast] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [showMiniMeTip, setShowMiniMeTip] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mindArSessionRef = useRef<{ stop: () => void } | null>(null);
  const isTriggeredRef = useRef(false);
  // PERMANENT FIX (Layer 4): always holds the live card.id so the AR engine
  // getter never reads a stale closure value across card transitions.
  const currentCardIdRef = useRef(card.id);
  currentCardIdRef.current = card.id;

  const chapterConfig = CHAPTER_CONFIG[card.chapter];

  // Reset state on step / card transition
  useEffect(() => {
    isTriggeredRef.current = false;
    setRegistryToast(null);
    setStatusMessage(`Seek Card #${card.id} with camera`);
    sound.playVoice('voice_idle_hmm');

    // Automatically attempt camera activation on card transition
    startCamera();

    // Listen for 8th Wall Target Detection messages from WebAR runtime
    const handleScannerMessage = (event: MessageEvent) => {
      if (!event.data || event.data.source !== '8thwall-scanner') return;
      if (event.data.type === 'targetFound' && event.data.data?.name) {
        const targetName = String(event.data.data.name);
        const cardId = targetName.replace('card-', '').padStart(2, '0');
        if (cardId === card.id) {
          triggerSuccessfulScan(`8th Wall Target ${targetName} (${card.letters})`);
        } else {
          sound.playSfx('sfx_snitch_wings');
          setRegistryToast(`8th Wall Recognized Card #${cardId}! Active clue is Card #${card.id}.`);
          setTimeout(() => setRegistryToast(null), 4000);
        }
      }
    };

    window.addEventListener('message', handleScannerMessage);

    return () => {
      window.removeEventListener('message', handleScannerMessage);
      stopCameraAndTracking();
    };
  }, [card.id]);

  const stopCameraAndTracking = () => {
    if (mindArSessionRef.current) {
      mindArSessionRef.current.stop();
      mindArSessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const triggerSuccessfulScan = useCallback(
    (reasonLabel?: string) => {
      if (isTriggeredRef.current) return;
      isTriggeredRef.current = true;

      // Stop camera and tracking immediately so no further frames are evaluated
      stopCameraAndTracking();

      if (reasonLabel) {
        console.info(`[AR Viewfinder] Card ${card.id} unlocked via ${reasonLabel}`);
      }

      sound.playSfx('sfx_wand_swish');
      sound.playSfx('sfx_revelio_bell');
      setShowFoundCelebration(true);
    },
    [card]
  );

  // MindAR Target Detection Handler - ONLY triggers on real matching image targets
  const handleMindTargetFound = useCallback(
    (target: MindTargetInfo) => {
      if (isTriggeredRef.current) return;

      // When the detected image target matches active card
      if (target.cardId === card.id) {
        triggerSuccessfulScan(`MindAR Target #${target.cardId} (${target.letters})`);
        return;
      }

      // Out-of-order target recognized (e.g. Card 11 photo shown in Chapter 1)
      sound.playSfx('sfx_snitch_wings');
      setRegistryToast(
        `Recognized Card ${target.cardId} (${target.letters})! Current active clue is Card #${card.id}.`
      );
      setTimeout(() => setRegistryToast(null), 4500);
    },
    [card.id, triggerSuccessfulScan]
  );

  // Camera Initiation with Mobile Safari / Chrome compatibility
  const startCamera = async () => {
    setIsStartingCamera(true);
    setCameraError(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play().catch(() => {});

        // Await frame dimensions
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          await new Promise<void>((resolve) => {
            const onReady = () => {
              video.removeEventListener('loadeddata', onReady);
              video.removeEventListener('canplay', onReady);
              resolve();
            };
            video.addEventListener('loadeddata', onReady);
            video.addEventListener('canplay', onReady);
            setTimeout(resolve, 1000);
          });
        }

        if (video.videoWidth > 0) {
          video.width = video.videoWidth;
          video.height = video.videoHeight;
        }

        // Initialize genuine MindAR target image tracking for the active card
        try {
          const session = await startMindArTracking(
            video,
            {
              onTargetFound: handleMindTargetFound,
              onStatusChange: (status) => setStatusMessage(status),
              onError: (err) => console.warn('[AR] Tracking notice:', err),
            },
            card.id,
            // PERMANENT FIX (Layer 4): live getter so the engine never reads stale card.id
            () => currentCardIdRef.current
          );
          mindArSessionRef.current = session;
        } catch (arErr) {
          console.warn('[AR] MindAR session initialization notice:', arErr);
        }
      }

      setCameraActive(true);
      setIsStartingCamera(false);
      sound.unlockAudio();
    } catch (err: unknown) {
      console.warn('Camera access notice:', err);
      setCameraActive(false);
      setIsStartingCamera(false);
      setCameraError(
        err instanceof Error ? err.message : 'Camera access was denied or is unavailable'
      );
    }
  };

  // Manual bypass / keyword unlock
  const handleBypassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = bypassInput.trim().toLowerCase();
    const isMatched = card.bypass.some((bp) => cleanInput.includes(bp.toLowerCase()));

    const rawCardLetters = card.letters.replace(/[^A-Za-z]/g, '').toLowerCase();
    const matchesLetters = cleanInput.replace(/[^A-Za-z]/g, '') === rawCardLetters;

    if (isMatched || matchesLetters) {
      setShowHelpModal(false);
      triggerSuccessfulScan('Manual Clue Unlock');
    } else {
      sound.playVoice('voice_no_nice_try');
      setBypassError(true);
      setTimeout(() => setBypassError(false), 2000);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] max-w-lg mx-auto bg-[#060B14] overflow-hidden select-none font-sans flex flex-col">
      {/* 1. Full-Bleed Living Glass AR Viewfinder */}
      <div className="absolute inset-0 w-full h-full bg-[#060B14] overflow-hidden">
        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Live Camera Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          webkit-playsinline=""
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            cameraActive ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* 2. Standby / Permission Prompt (shown ONLY if camera permission is needed) */}
        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#0B1220]/95 via-[#060B14] to-[#0B1220]/95 z-20">
            {/* Elegant Mystical Lens Icon - NO SPOILER PHOTO */}
            <div className="w-20 h-20 rounded-full bg-[#E8C56A]/10 border-2 border-[#E8C56A]/40 flex items-center justify-center text-[#E8C56A] mb-5 shadow-[0_0_25px_rgba(232,197,106,0.2)] animate-pulse">
              <Camera size={36} />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8C56A]/15 border border-[#E8C56A]/40 text-[#FFE7A8] text-[11px] font-serif tracking-widest uppercase mb-3 font-semibold">
              <Sparkles size={13} className="text-[#E8C56A]" />
              <span>Living Glass AR Lens</span>
            </div>

            <h2 className="text-xl font-serif font-bold text-[#FFE7A8] mb-2 tracking-wide">
              Card #{card.id} Search Active
            </h2>

            <p className="text-xs text-slate-300 max-w-xs leading-relaxed mb-6 font-sans">
              Solve the riddle, find Card #{card.id} in your scrapbook, and point your camera at it.
            </p>

            {/* Launch Camera Button */}
            <button
              onClick={startCamera}
              disabled={isStartingCamera}
              className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#E8C56A] via-[#FFE7A8] to-[#E8C56A] text-[#060B14] font-serif text-xs font-bold uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mb-3"
            >
              {isStartingCamera ? (
                <>
                  <RefreshCw size={16} className="animate-spin text-[#060B14]" />
                  <span>Connecting Camera Lens...</span>
                </>
              ) : (
                <>
                  <Camera size={18} className="text-[#060B14]" />
                  <span>Activate Viewfinder</span>
                </>
              )}
            </button>

            {cameraError && (
              <p className="mt-4 text-[11px] text-amber-300/90 bg-amber-950/40 px-3 py-1.5 rounded-lg border border-amber-600/30 max-w-xs">
                {cameraError}
              </p>
            )}
          </div>
        )}

        {/* 4. Registry Recognition Toast */}
        {registryToast && (
          <div className="absolute top-16 left-4 right-4 z-40 p-3 rounded-xl bg-[#0B1220]/95 border border-[#7EF0FF]/60 shadow-2xl backdrop-blur-md animate-fadeIn flex items-start gap-2.5">
            <Info size={18} className="text-[#7EF0FF] flex-shrink-0 mt-0.5" />
            <p className="text-xs font-serif text-slate-100 leading-snug">{registryToast}</p>
          </div>
        )}
      </div>

      {/* 5. Sleek Unified Top Navigation HUD */}
      <header className="relative z-30 flex items-center justify-between px-3 py-2.5 bg-[#0B1220]/80 backdrop-blur-md border-b border-[#E8C56A]/25">
        {/* Left: Back Button */}
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 text-[#E8C56A] hover:bg-[#E8C56A]/10 active:scale-95 transition-all rounded-lg flex items-center gap-1 text-xs font-serif uppercase tracking-wider"
          title="Go Back"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        {/* Center: Card Step & Act Info */}
        <div
          onClick={onOpenRehearsal}
          className="text-center cursor-pointer px-2"
          title="Tap for Rehearsal Mode"
        >
          <div className="flex items-center justify-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: chapterConfig.accent }}
            />
            <h1 className="text-xs font-serif font-bold text-[#FFE7A8] tracking-wider uppercase">
              Card {card.id}/29
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 font-sans tracking-tight">
            Act {chapterConfig.roman}: {chapterConfig.title}
          </p>
        </div>

        {/* Right: Actions (Clue, Code, Audio) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHelpModal(true)}
            className="px-2.5 py-1 rounded-full bg-[#0B1220]/85 border border-[#E8C56A]/40 text-[#FFE7A8] text-[11px] font-serif font-semibold hover:bg-[#E8C56A]/20 transition flex items-center gap-1"
            title="Help / Manual Unlock"
          >
            <HelpCircle size={13} className="text-[#E8C56A]" />
            <span>Code</span>
          </button>

          <button
            onClick={() => setShowRiddleDrawer(true)}
            className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#E8C56A] to-[#FFE7A8] text-[#060B14] text-[11px] font-serif font-bold uppercase tracking-wider shadow-md hover:brightness-105 active:scale-95 transition flex items-center gap-1"
            title="Open Riddle Drawer"
          >
            <BookOpen size={13} />
            <span>Clue</span>
          </button>

          <button
            onClick={onOpenScrapbook}
            className="px-2 py-1 rounded-full bg-[#0B1220]/85 border border-[#FF6B8A]/40 text-[#FFE7A8] text-[11px] font-serif hover:bg-[#FF6B8A]/20 transition flex items-center gap-1"
            title="Aishwarya's Memory Scrapbook"
          >
            <Heart size={12} className="text-[#FF6B8A] fill-[#FF6B8A]/50" />
            <span className="text-[10px] font-mono font-bold">{foundCardIds.length}</span>
          </button>

          <button
            onClick={handleToggleMute}
            className="p-1.5 text-[#E8C56A] hover:bg-[#E8C56A]/15 active:scale-90 transition rounded-full ml-1"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} />}
          </button>
        </div>
      </header>

      {/* 6. Bottom HUD: Minimal Tokens & Collapsible Mini-Me Tip */}
      <div className="absolute bottom-0 inset-x-0 z-30 p-3 flex flex-col gap-2 pointer-events-none">
        {/* Floating Mini-Me Tip Bubble */}
        {showMiniMeTip && (
          <div className="pointer-events-auto flex items-center justify-between p-2.5 rounded-2xl bg-[#0B1220]/90 backdrop-blur-md border border-[#E8C56A]/30 shadow-xl max-w-sm mx-auto w-full animate-fadeIn">
            <div
              className="flex items-center gap-2 cursor-pointer flex-1"
              onClick={() => sound.playVoice('voice_tap_yay')}
            >
              <img
                src="/avatar.png"
                alt="Mini-Me"
                className="w-8 h-8 rounded-full border border-[#E8C56A] object-cover flex-shrink-0"
              />
              <p className="text-[11px] font-serif text-slate-200 leading-snug line-clamp-2">
                "{card.miniMe}"
              </p>
            </div>
            <button
              onClick={() => setShowMiniMeTip(false)}
              className="p-1 text-slate-400 hover:text-white ml-1 flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Collected Tokens Strip */}
        <div className="pointer-events-auto flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-[#E8C56A]/25 max-w-sm mx-auto w-full">
          <div className="flex items-center gap-1.5">
            <span
              className="text-[11px] font-serif font-bold uppercase tracking-wider"
              style={{ color: chapterConfig.accent }}
            >
              Act {chapterConfig.roman} Tokens
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({collectedLetters.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1 max-w-[220px] justify-end">
            {collectedLetters.length === 0 ? (
              <span className="text-[10px] text-slate-400 italic">None collected yet</span>
            ) : (
              collectedLetters.map((letter, i) => (
                <span
                  key={i}
                  className="w-5 h-5 rounded-full bg-[#E8C56A]/20 border border-[#E8C56A] text-[#FFE7A8] text-[10px] font-mono flex items-center justify-center font-bold shadow-sm"
                >
                  {letter}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 7. Slide-Out Side Drawer for Riddle (WITHOUT spoiler photo) */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-[#0B1220]/95 backdrop-blur-xl border-l border-[#E8C56A]/40 shadow-2xl p-5 flex flex-col justify-between transform transition-transform duration-300 ease-out pointer-events-auto ${
          showRiddleDrawer ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-[#E8C56A]/25 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#E8C56A]" />
              <span className="text-xs font-serif font-bold text-[#FFE7A8] uppercase tracking-wider">
                Riddle Clue #{card.id}
              </span>
            </div>
            <button
              onClick={() => setShowRiddleDrawer(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mb-4">
            <span
              className="text-[11px] font-serif uppercase tracking-widest font-semibold"
              style={{ color: chapterConfig.accent }}
            >
              Act {chapterConfig.roman}: {chapterConfig.title}
            </span>
          </div>

          <div className="space-y-2.5 py-3 pl-3.5 border-l-2 border-[#E8C56A] text-xs sm:text-sm font-serif italic text-slate-100 leading-relaxed mb-6">
            {card.riddle.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-[#E8C56A]/25 text-[11px] font-sans text-slate-300 leading-relaxed mb-4">
            "{card.quote}"
          </div>

          <div className="p-2.5 rounded-lg bg-black/60 border border-[#E8C56A]/30 text-[10px] text-slate-300">
            <p className="font-serif font-bold text-[#FFE7A8] mb-0.5">Scavenger Hint</p>
            <p className="text-[9px] text-slate-400">
              Find the card that answers this riddle in your scrapbook. Hold the card up to the camera lens.
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-white/10">
          <button
            onClick={() => setShowRiddleDrawer(false)}
            className="w-full py-3 rounded-xl font-serif text-xs uppercase tracking-wider font-bold text-[#060B14] bg-[#FFE7A8] hover:bg-[#E8C56A] shadow-lg flex items-center justify-center gap-2"
          >
            <span>Close & Return to Lens</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* 8. Manual Code / Clue Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto">
          <div className="w-full max-w-sm p-5 rounded-2xl bg-[#0B1220] border border-[#E8C56A]/45 shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#FFE7A8] uppercase tracking-wider">
                <Lock size={14} className="text-[#E8C56A]" />
                <span>Help: Unlock Card #{card.id}</span>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4 font-sans leading-relaxed">
              If camera scanning is tricky in this lighting, enter the card's letters (e.g.{' '}
              <b className="text-[#FFE7A8]">{card.letters}</b>) or location keyword:
            </p>

            <form onSubmit={handleBypassSubmit} className="space-y-3">
              <input
                type="text"
                autoFocus
                value={bypassInput}
                onChange={(e) => setBypassInput(e.target.value)}
                placeholder="Enter letters or keyword..."
                className="w-full py-2.5 px-3 rounded-lg bg-black/70 border border-[#E8C56A]/50 text-sm text-[#FFE7A8] font-mono focus:outline-none focus:border-[#E8C56A]"
              />

              {bypassError && (
                <p className="text-xs text-red-400 font-serif">
                  Incorrect! Try checking the letters printed on Card #{card.id}.
                </p>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowHelpModal(false);
                    triggerSuccessfulScan('Simulated Card Found');
                  }}
                  className="text-[10px] text-slate-500 hover:text-slate-300 underline"
                >
                  Simulate Found (Testing)
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#E8C56A] text-[#060B14] font-serif text-xs font-bold uppercase tracking-wider hover:bg-[#FFE7A8]"
                  >
                    Unlock
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Found Celebration Overlay (Appears ONLY after real target detection) */}
      {showFoundCelebration && (
        <div className="fixed inset-0 z-50 bg-[#060B14]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn pointer-events-auto">
          <div className="w-16 h-16 rounded-full bg-[#E8C56A]/20 border-2 border-[#E8C56A] flex items-center justify-center text-[#FFE7A8] text-2xl font-bold mb-3 animate-bounce shadow-[0_0_20px_#E8C56A]">
            <CheckCircle2 size={36} className="text-[#FFE7A8]" />
          </div>
          <h3 className="text-xl font-serif font-bold text-[#FFE7A8] mb-1">
            Card #{card.id} Identified! ✨
          </h3>
          <p className="text-base font-mono text-[#E8C56A] font-bold tracking-widest mb-3">
            Tokens Collected: {card.letters}
          </p>
          <div className="p-4 max-w-xs rounded-2xl bg-black/60 border border-[#E8C56A]/30 text-xs font-serif italic text-slate-200 mb-6 leading-relaxed">
            "{card.quote}"
          </div>

          <button
            onClick={() => {
              setShowFoundCelebration(false);
              onCardFound(card);
            }}
            className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#E8C56A] via-[#FFE7A8] to-[#E8C56A] text-[#060B14] font-serif text-sm font-bold uppercase tracking-wider shadow-lg shadow-[#E8C56A]/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span>Proceed to Next Clue</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};
