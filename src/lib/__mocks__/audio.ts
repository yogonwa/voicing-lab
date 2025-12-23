/**
 * Mock Audio module for Testing
 *
 * Mirrors `src/lib/audio.ts` exports without loading Tone.js.
 */

export const initAudio = jest.fn().mockResolvedValue(undefined);
export const isAudioReady = jest.fn().mockReturnValue(false);
export const isAudioLoading = jest.fn().mockReturnValue(false);
export const playVoicing = jest.fn();
export const playArpeggio = jest.fn().mockResolvedValue(undefined);
export const playProgression = jest.fn();
export const stopAll = jest.fn();
export const disposeAudio = jest.fn();


