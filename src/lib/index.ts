/**
 * Voicing Lab library exports.
 *
 * IMPORTANT:
 * - `src/lib/index.ts` is now **core-only** (pure, no audio) to avoid importing Tone.js
 *   through barrel imports in tests and non-audio modules.
 * - Audio is exported from `src/lib/audio.ts`.
 */

export * from './core';

