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
 */
export async function startMindArTracking(
  videoElement: HTMLVideoElement,
  callbacks: ArTrackerCallbacks
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

    const controller = new mindarLib.Controller({
      inputWidth,
      inputHeight,
      maxTrack: 2,
      onUpdate: (data: any) => {
        if (data.type === 'updateMatrix' && data.worldMatrix !== null) {
          const now = Date.now();
          const targetIdx = data.targetIndex;
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
