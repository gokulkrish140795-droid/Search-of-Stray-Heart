/**
 * Audio manager for Project AR: The Search for a Stray Heart
 * Handles Web Audio unlocking, sound effects, voice chirps, and background music.
 */

class SoundManager {
  private currentBgm: HTMLAudioElement | null = null;
  private bgmTrack: string | null = null;
  private isMuted: boolean = false;
  private isUnlocked: boolean = false;

  public unlockAudio() {
    this.isUnlocked = true;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    } catch {
      // AudioContext fallback
    }
  }

  public playSfx(name: string, volume: number = 0.8) {
    if (this.isMuted) return;
    try {
      const audio = new Audio(`/audio/${name}.mp3`);
      audio.volume = volume;
      audio.play().catch(() => {
        // Autoplay policy or missing file catch
      });
    } catch (e) {
      console.warn('Could not play sfx:', name, e);
    }
  }

  public playVoice(name: string, volume: number = 0.9) {
    this.playSfx(name, volume);
  }

  public playBgm(trackName: string, volume: number = 0.35) {
    if (this.bgmTrack === trackName && this.currentBgm && !this.currentBgm.paused) {
      return;
    }

    if (this.currentBgm) {
      this.currentBgm.pause();
      this.currentBgm = null;
    }

    this.bgmTrack = trackName;
    try {
      const audio = new Audio(`/audio/${trackName}.mp3`);
      audio.loop = true;
      audio.volume = this.isMuted ? 0 : volume;
      this.currentBgm = audio;
      audio.play().catch(() => {
        // Will play when user interacts
      });
    } catch (e) {
      console.warn('Could not play bgm:', trackName, e);
    }
  }

  public stopBgm() {
    if (this.currentBgm) {
      this.currentBgm.pause();
      this.currentBgm = null;
      this.bgmTrack = null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.currentBgm) {
      this.currentBgm.volume = this.isMuted ? 0 : 0.35;
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

export const sound = new SoundManager();
