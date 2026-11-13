import { CryptoService } from '@shared/services/cryptoService';

/**
 * audioPlayerService — Singleton service for isolated audio playback.
 * Supports on-the-fly decryption of AES-256-GCM encrypted audio recordings,
 * local Blob streaming, and Web Audio API fallback for mobile WebViews.
 */
class AudioPlayerService {
  constructor() {
    this.currentAudio = null;
    this.webAudioSource = null;
    this.webAudioCtx = null;
    this.webAudioTimer = null;
    this.playingId = null;
    this.listeners = new Map(); // blockId -> Set of callbacks
  }

  getPlayingId() {
    return this.playingId;
  }

  subscribe(blockId, callback) {
    if (!blockId || typeof callback !== 'function') return () => {};

    if (!this.listeners.has(blockId)) {
      this.listeners.set(blockId, new Set());
    }
    this.listeners.get(blockId).add(callback);

    // Initial state notification
    callback({
      isPlaying: this.playingId === blockId,
      progress: 0,
    });

    return () => {
      const set = this.listeners.get(blockId);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(blockId);
        }
      }
    };
  }

  notify(blockId, state) {
    const set = this.listeners.get(blockId);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(state);
        } catch (e) {
          console.error('[AudioPlayerService] Subscriber error:', e);
        }
      });
    }
  }

  stopCurrent() {
    // 1. Stop HTML5 Audio
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.src = '';
        this.currentAudio.load();
      } catch (e) {}
      this.currentAudio = null;
    }

    // 2. Stop Web Audio API
    if (this.webAudioTimer) {
      clearInterval(this.webAudioTimer);
      this.webAudioTimer = null;
    }

    if (this.webAudioSource) {
      try {
        this.webAudioSource.stop();
        this.webAudioSource.disconnect();
      } catch (e) {}
      this.webAudioSource = null;
    }

    if (this.webAudioCtx && this.webAudioCtx.state !== 'closed') {
      try {
        this.webAudioCtx.close();
      } catch (e) {}
      this.webAudioCtx = null;
    }

    if (this.playingId) {
      const prevId = this.playingId;
      this.playingId = null;
      this.notify(prevId, { isPlaying: false, progress: 0 });
    }
  }

  /**
   * Fallback: Plays audio using Web Audio API (decodeAudioData) directly in Chromium Blink engine.
   * Eliminates Android MediaPlayer container / codec parsing errors.
   */
  async playWithWebAudio(audioUrl, blockId) {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return false;

      const resp = await fetch(audioUrl);
      if (!resp.ok) return false;

      const arrayBuf = await resp.arrayBuffer();
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch (_) {}
      }
      this.webAudioCtx = ctx;

      const audioBuffer = await ctx.decodeAudioData(arrayBuf);
      if (this.playingId !== blockId) {
        try { ctx.close(); } catch (_) {}
        return false;
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      this.webAudioSource = source;

      this.playingId = blockId;
      this.notify(blockId, { isPlaying: true, progress: 0 });

      const duration = audioBuffer.duration || 1;
      const startTime = ctx.currentTime;

      this.webAudioTimer = setInterval(() => {
        if (this.playingId !== blockId || !this.webAudioCtx) {
          clearInterval(this.webAudioTimer);
          return;
        }
        const elapsed = this.webAudioCtx.currentTime - startTime;
        const pct = Math.min(100, Math.max(0, (elapsed / duration) * 100));
        this.notify(blockId, { isPlaying: true, progress: pct });

        if (elapsed >= duration) {
          this.stopCurrent();
        }
      }, 100);

      source.onended = () => {
        if (this.playingId === blockId) {
          this.stopCurrent();
        }
      };

      source.start(0);
      return true;
    } catch (e) {
      console.warn('[AudioPlayerService] Web Audio fallback failed:', e);
      return false;
    }
  }

  async toggle(block) {
    if (!block || !block.id) return;

    if (this.playingId === block.id) {
      this.stopCurrent();
      return;
    }

    this.stopCurrent();

    const targetId = block.id;
    this.playingId = targetId;
    this.notify(targetId, { isPlaying: true, progress: 0 });

    const rawUrl = block.url || block.localUrl;
    if (!rawUrl) {
      this.stopCurrent();
      return;
    }

    // Detect proper audio MIME type
    let mime = block.mimeType;
    if (!mime) {
      const lower = rawUrl.toLowerCase();
      if (lower.includes('.mp4') || lower.includes('.m4a')) mime = 'audio/mp4';
      else if (lower.includes('.mp3')) mime = 'audio/mpeg';
      else if (lower.includes('.wav')) mime = 'audio/wav';
      else if (lower.includes('.aac')) mime = 'audio/aac';
      else if (lower.includes('.ogg')) mime = 'audio/ogg';
      else mime = 'audio/webm';
    }

    let audioUrl = rawUrl;

    // 1. Decrypt if encrypted
    if (block.encKey || (typeof rawUrl === 'string' && rawUrl.includes('.enc'))) {
      try {
        audioUrl = await CryptoService.getOrDecryptMedia(rawUrl, block.encKey, mime);
      } catch (decErr) {
        console.error('[AudioPlayerService] Audio decryption failed:', decErr);
      }
    }

    // Abort if user clicked another block or cancelled while decrypting
    if (this.playingId !== targetId) return;

    // 2. If it's a remote URL (unencrypted legacy), convert to local blob to avoid WebView cross-origin streaming issues
    if (audioUrl && (audioUrl.startsWith('http://') || audioUrl.startsWith('https://'))) {
      try {
        const cached = CryptoService.getCachedMediaUrl(audioUrl);
        if (cached) {
          audioUrl = cached;
        } else {
          const resp = await fetch(audioUrl);
          if (resp.ok) {
            const rawBlob = await resp.blob();
            const blobUrl = URL.createObjectURL(new Blob([rawBlob], { type: mime }));
            CryptoService.cacheDecryptedMedia(rawUrl, blobUrl);
            audioUrl = blobUrl;
          }
        }
      } catch (fetchErr) {
        console.warn('[AudioPlayerService] Remote fetch to blob failed:', fetchErr);
      }
    }

    // Abort if user cancelled during fetch
    if (this.playingId !== targetId) return;

    if (!audioUrl) {
      this.stopCurrent();
      return;
    }

    // 3. Try standard HTML5 Audio first
    const audio = new Audio(audioUrl);
    this.currentAudio = audio;

    audio.ontimeupdate = () => {
      if (this.playingId !== targetId) return;
      const duration = audio.duration || 1;
      const pct = (audio.currentTime / duration) * 100 || 0;
      this.notify(targetId, { isPlaying: true, progress: Math.min(100, Math.max(0, pct)) });
    };

    audio.onended = () => {
      if (this.playingId === targetId) {
        this.stopCurrent();
      }
    };

    // If HTML5 Audio fails, automatically trigger Web Audio API fallback!
    audio.onerror = async () => {
      const err = audio.error;
      console.warn('[AudioPlayerService] HTML5 Audio error, switching to WebAudio fallback. Code:', err?.code, 'Message:', err?.message);
      if (this.playingId === targetId) {
        this.currentAudio = null;
        const played = await this.playWithWebAudio(audioUrl, targetId);
        if (!played) {
          this.stopCurrent();
        }
      }
    };

    try {
      await audio.play();
    } catch (err) {
      console.warn('[AudioPlayerService] audio.play() rejected, trying WebAudio fallback:', err);
      if (this.playingId === targetId) {
        this.currentAudio = null;
        const played = await this.playWithWebAudio(audioUrl, targetId);
        if (!played) {
          this.stopCurrent();
        }
      }
    }
  }
}

export const audioPlayerService = new AudioPlayerService();
export default audioPlayerService;
