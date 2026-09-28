/**
 * Living Glass WebAR Image Target Engine
 * Uses open-source MindAR with trained photo crop targets (photo-crop.mind)
 * Target 0 -> Card 01 Photograph (targets/card_01_photo.png) -> M - I - X
 * Target 1 -> Card 11 Photograph (targets/card_11_photo.png) -> G - O - F
 * Target region: Strictly photograph rectangle (x=64, y=64, w=1072, h=1260).
 */

export interface MindTargetInfo {
  targetIndex: number;
  cardId: string;
  name: string;
  photoUrl: string;
  letters: string;
}

export const MIND_TARGETS: MindTargetInfo[] = [
  {
    targetIndex: 0,
    cardId: '01',
    name: 'card_01_photo',
    photoUrl: '/ar/targets/card_01_photo.png',
    letters: 'M - I - X',
  },
  {
    targetIndex: 1,
    cardId: '11',
    name: 'card_11_photo',
    photoUrl: '/ar/targets/card_11_photo.png',
    letters: 'G - O - F',
  },
];

export interface ArEngineStatus {
  mode: 'mindar' | 'stub';
  hasTargets: boolean;
  statusText: string;
}

export function hasTrainedImageTargets(): boolean {
  return true; // targets/photo-crop.mind exists in public/ar/targets/
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
  return {
    mode: 'mindar',
    hasTargets: true,
    statusText: 'MindAR Image Tracker (Open-Source WebAR)',
  };
}

let mindArInstance: any = null;
let mindArLoadingPromise: Promise<any> | null = null;

/**
 * Accesses or dynamically loads the MindAR library.
 * Reads window.MINDAR.IMAGE without dynamic imports to prevent Vite non-asset errors.
 */
export async function getMindArLibrary(): Promise<any> {
  if (typeof window === 'undefined') return null;

  if ((window as any).MINDAR?.IMAGE?.Controller) {
    return (window as any).MINDAR.IMAGE;
  }

  if (!mindArLoadingPromise) {
    mindArLoadingPromise = new Promise((resolve) => {
      // Check if already on window
      if ((window as any).MINDAR?.IMAGE?.Controller) {
        resolve((window as any).MINDAR.IMAGE);
        return;
      }

      // Check if script tag is already in DOM
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
        // Poll for window.MINDAR.IMAGE
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

  // Set width/height on the video element for MindAR's loadInput context
  videoElement.width = inputWidth;
  videoElement.height = inputHeight;

  try {
    const mindarLib = await getMindArLibrary();
    if (!mindarLib || !mindarLib.Controller) {
      callbacks.onStatusChange?.('Optical Template Lens Ready');
      return { stop: () => {}, isTrackingTargets: false };
    }

    callbacks.onStatusChange?.('Initializing MindAR Photo Targets...');

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
            const mappedTarget = MIND_TARGETS.find((t) => t.targetIndex === targetIdx);
            if (mappedTarget) {
              callbacks.onTargetFound(mappedTarget);
            }
          }
        }
      },
    });

    mindArInstance = controller;
    await controller.addImageTargets('/ar/targets/photo-crop.mind');

    if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
      controller.processVideo(videoElement);
    }

    callbacks.onStatusChange?.('MindAR Tracking Active (Frame Card Photo)');

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
    console.warn('[MindAR] Controller initiation fallback:', err);
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
