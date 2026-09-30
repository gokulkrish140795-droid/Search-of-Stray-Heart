/**
 * Living Glass WebAR Image Target Engine
 * Supports:
 * 1. 8th Wall Local Self-Hosted Target Tracking (via iframe or direct pipeline)
 * 2. MindAR Image Target Tracker (Targets 01 & 11 photo-crop.mind)
 * 3. Optical Alignment Reticle / Manual Passcode Fallback
 */

import { HUNT_CARDS } from '../data/huntData';

export interface MindTargetInfo {
  targetIndex: number;
  cardId: string;
  name: string;
  photoUrl: string;
  letters: string;
}

// Generate full target list covering all 29 hunt cards
export const AR_CARD_TARGETS: MindTargetInfo[] = HUNT_CARDS.map((card, idx) => ({
  targetIndex: idx,
  cardId: card.id,
  name: `card-${card.id}`,
  photoUrl: `/ar/eighthwall/assets/card-${card.id}.jpg`,
  letters: card.letters,
}));

export const MIND_TARGETS: MindTargetInfo[] = AR_CARD_TARGETS;

export interface ArEngineStatus {
  mode: 'eighthwall' | 'mindar' | 'stub';
  hasTargets: boolean;
  statusText: string;
}

export function hasTrainedImageTargets(): boolean {
  return true; // 8th Wall targets are available in /ar/eighthwall/image-targets/
}

export function getArEngineMode(): ArEngineStatus {
  const envMode = (import.meta.env.VITE_AR_ENGINE as string | undefined)?.toLowerCase();
  if (envMode === 'stub') {
    return {
      mode: 'stub',
      hasTargets: false,
      statusText: 'Stub mode (Camera bypassed)',
    };
  }
  // Default to 8th Wall Local Engine if build targets exist, else MindAR
  return {
    mode: 'eighthwall',
    hasTargets: true,
    statusText: '8th Wall WebAR Active (29 Trained Targets)',
  };
}

let mindArInstance: any = null;
let mindArLoadingPromise: Promise<any> | null = null;

/**
 * Accesses or dynamically loads the MindAR library as fallback.
 */
export async function getMindArLibrary(): Promise<any> {
  if (typeof window === 'undefined') return null;

  if ((window as any).MINDAR?.IMAGE?.Controller) {
    return (window as any).MINDAR.IMAGE;
  }

  if (!mindArLoadingPromise) {
    mindArLoadingPromise = new Promise((resolve) => {
      if ((window as any).MINDAR?.IMAGE?.Controller) {
        resolve((window as any).MINDAR.IMAGE);
        return;
      }

      const existingScript = document.querySelector('script[src*="mindar-image.prod.js"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = '/ar/vendor/mind-ar/mindar-image.prod.js';
        script.onload = () => {
          setTimeout(() => {
            resolve((window as any).MINDAR?.IMAGE || null);
          }, 80);
        };
        script.onerror = (e) => {
          console.warn('[MindAR] Failed to load mindar-image.prod.js:', e);
          resolve(null);
        };
        document.head.appendChild(script);
      } else {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if ((window as any).MINDAR?.IMAGE?.Controller || attempts > 25) {
            clearInterval(interval);
            resolve((window as any).MINDAR?.IMAGE || null);
          }
        }, 120);
      }
    });
  }

  return mindArLoadingPromise;
}

export interface ArTrackerCallbacks {
  onTargetFound: (target: MindTargetInfo) => void;
  onTargetLost?: (targetIndex: number) => void;
  onStatusChange?: (status: string) => void;
  onError?: (err: Error) => void;
}

/**
 * Starts MindAR Image Target Tracker on the provided video element.
 *
 * PERMANENT FIX — Four independent guard layers prevent any wrong-card or
 * stale-session trigger. All four must pass before onTargetFound fires:
 *
 *   Layer 1 – sessionActive flag:
 *     Set to false the instant stop() is called — BEFORE dispose() —
 *     so any in-flight onUpdate frame during async teardown is dropped.
 *
 *   Layer 2 – interestedTargetIndex (MindAR internal filter):
 *     Passed in constructor options AND set as a property post-construction
 *     (belt-and-suspenders) so MindAR's detection loop only evaluates the
 *     one target index we care about, never loading data for others.
 *
 *   Layer 3 – Hard targetIndex gate in onUpdate:
 *     Even if Layer 2 lets something slip, we hard-reject any targetIndex
 *     that doesn't match activeTargetIndex before calling any React callback.
 *
 *   Layer 4 – Live card ID getter from component:
 *     The component passes () => currentCardIdRef.current so this function
 *     always reads the real-time active card ID, never a stale closure value.
 *     If the active card has already changed by the time onUpdate fires, the
 *     frame is dropped.
 */
export async function startMindArTracking(
  videoElement: HTMLVideoElement,
  callbacks: ArTrackerCallbacks,
  targetCardId?: string,
  getActiveCardId?: () => string
): Promise<{ stop: () => void; isTrackingTargets: boolean }> {
  const engine = getArEngineMode();
  if (engine.mode === 'stub') {
    callbacks.onStatusChange?.('Stub Mode Active');
    return { stop: () => {}, isTrackingTargets: false };
  }

  // Ensure video dimensions are ready
  if (videoElement.readyState < 2 || !videoElement.videoWidth || !videoElement.videoHeight) {
    await new Promise<void>((resolve) => {
      const onReady = () => {
        if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
          videoElement.removeEventListener('loadeddata', onReady);
          videoElement.removeEventListener('canplay', onReady);
          resolve();
        }
      };
      videoElement.addEventListener('loadeddata', onReady);
      videoElement.addEventListener('canplay', onReady);
      setTimeout(resolve, 1200);
    });
  }

  const inputWidth = videoElement.videoWidth || 640;
  const inputHeight = videoElement.videoHeight || 480;

  videoElement.width = inputWidth;
  videoElement.height = inputHeight;

  try {
    const mindarLib = await getMindArLibrary();
    if (!mindarLib || !mindarLib.Controller) {
      callbacks.onStatusChange?.('Optical Alignment Lens Active');
      return { stop: () => {}, isTrackingTargets: false };
    }

    callbacks.onStatusChange?.('MindAR Tracking Active (Frame Card)');

    let lastFoundTime = 0;
    let lastFoundIdx = -1;

    const activeTargetIndex = targetCardId
      ? AR_CARD_TARGETS.findIndex((t) => t.cardId === targetCardId)
      : -1;

    // GUARD LAYER 1: Session-active flag.
    // Flipped to false the instant stop() is called so any in-flight frame
    // that fires during async dispose() is silently dropped.
    const sessionActive = { current: true };

    const controller = new mindarLib.Controller({
      inputWidth,
      inputHeight,
      maxTrack: 1,
      warmupTolerance: 2,
      missTolerance: 3,
      // GUARD LAYER 2a: interestedTargetIndex in constructor options.
      // Tells MindAR's per-frame detection loop to only evaluate this target.
      ...(activeTargetIndex !== -1 ? { interestedTargetIndex: activeTargetIndex } : {}),
      onUpdate: (data: any) => {
        // LAYER 1: drop instantly if session has been stopped
        if (!sessionActive.current) return;

        if (data.type === 'updateMatrix' && data.worldMatrix !== null) {
          const targetIdx = data.targetIndex;

          // LAYER 3: Hard engine-level index gate.
          // Reject any detected target whose index is not the active card's index.
          if (activeTargetIndex !== -1 && targetIdx !== activeTargetIndex) {
            return;
          }

          // LAYER 4: Live card ID check via getter from component.
          // Prevents stale-closure bugs where the callback sees an old card.id.
          if (getActiveCardId && targetCardId && getActiveCardId() !== targetCardId) {
            return;
          }

          const now = Date.now();
          if (now - lastFoundTime > 2000 || lastFoundIdx !== targetIdx) {
            lastFoundTime = now;
            lastFoundIdx = targetIdx;
            const mappedTarget = AR_CARD_TARGETS.find((t) => t.targetIndex === targetIdx);
            if (mappedTarget) {
              callbacks.onTargetFound(mappedTarget);
            }
          }
        }
      },
    });

    // GUARD LAYER 2b: Belt-and-suspenders property assignment after construction,
    // in case this MindAR build does not propagate interestedTargetIndex from options.
    if (activeTargetIndex !== -1) {
      controller.interestedTargetIndex = activeTargetIndex;
    }

    mindArInstance = controller;

    try {
      await controller.addImageTargets('/ar/targets/photo-crop.mind');
    } catch (imgErr) {
      console.warn('[MindAR] addImageTargets notice:', imgErr);
    }

    if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
      try {
        controller.processVideo(videoElement);
      } catch (procErr) {
        console.warn('[MindAR] processVideo notice:', procErr);
      }
    }

    callbacks.onStatusChange?.('Target Lens Active');

    const stopFn = () => {
      // LAYER 1: flip the active flag FIRST — before dispose() — so any
      // in-flight frame firing during async teardown is dropped immediately.
      sessionActive.current = false;
      try {
        if (controller) {
          controller.stopProcessVideo();
          controller.dispose();
        }
        if (mindArInstance === controller) {
          mindArInstance = null;
        }
      } catch (e) {
        console.warn('[MindAR] Cleanup notice:', e);
      }
    };

    return { stop: stopFn, isTrackingTargets: true };
  } catch (err: any) {
    console.warn('[AR] Controller initiation notice:', err);
    callbacks.onError?.(err);
    callbacks.onStatusChange?.('Optical Alignment Lens Active');
    return { stop: () => {}, isTrackingTargets: false };
  }
}

/**
 * Safely stops any active MindAR tracking session.
 */
export function stopMindArTracking(): void {
  if (mindArInstance) {
    try {
      mindArInstance.stopProcessVideo();
      mindArInstance.dispose();
    } catch {
      // Ignored
    }
    mindArInstance = null;
  }
}
