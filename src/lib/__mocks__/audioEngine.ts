/**
 * Mock Audio Engine for Testing
 *
 * Provides mock implementations of audio functions that don't
 * actually load or play audio, for use in Jest tests.
 */

export const initAudio = jest.fn().mockResolvedValue(undefined);
export const isAudioReady = jest.fn().mockReturnValue(false);
export const isAudioLoading = jest.fn().mockReturnValue(false);
export const playVoicing = jest.fn();
export const playProgression = jest.fn();
export const stopAll = jest.fn();
export const disposeAudio = jest.fn();

