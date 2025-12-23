/**
 * Audio exports.
 *
 * This module is intentionally separate from `src/lib/core.ts` so that
 * importing the core theory library never pulls in Tone.js (ESM) or browser-only APIs.
 */

export {
  initAudio,
  isAudioReady,
  isAudioLoading,
  playVoicing,
  playArpeggio,
  playProgression,
  stopAll,
  disposeAudio,
} from './audioEngine';


