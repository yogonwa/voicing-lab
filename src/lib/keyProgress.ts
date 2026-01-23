/**
 * Key Progress Management
 *
 * Tracks which keys have been unlocked and completed in the Voice Leading Trainer.
 * Progress is persisted to localStorage.
 */

import type { NoteName } from './chordCalculator';

/**
 * Order of key unlocks following the circle of fifths.
 * Start with C, then clockwise through sharps, then flats.
 */
export const KEY_UNLOCK_ORDER: NoteName[] = [
  'C',   // Start
  'G',   // 1 sharp
  'D',   // 2 sharps
  'A',   // 3 sharps
  'E',   // 4 sharps
  'B',   // 5 sharps
  'F#',  // 6 sharps
  'F',   // 1 flat (using enharmonic for Gb)
  'A#',  // 2 flats (Bb)
  'D#',  // 3 flats (Eb)
  'G#',  // 4 flats (Ab)
  'C#',  // 5 flats (Db)
];

/**
 * Display names for keys (using flats where conventional).
 */
export const KEY_DISPLAY_NAMES: Record<NoteName, string> = {
  'C': 'C',
  'C#': 'D♭',
  'D': 'D',
  'D#': 'E♭',
  'E': 'E',
  'F': 'F',
  'F#': 'F♯/G♭',
  'G': 'G',
  'G#': 'A♭',
  'A': 'A',
  'A#': 'B♭',
  'B': 'B',
};

/**
 * Record of a completed key.
 */
export interface KeyCompletion {
  bestScore: number;
  completedAt: string; // ISO date string
}

/**
 * Progress data structure.
 */
export interface KeyProgress {
  unlockedKeys: NoteName[];
  completedKeys: Partial<Record<NoteName, KeyCompletion>>;
}

const STORAGE_KEY = 'voicing-lab-key-progress';

/**
 * Create initial progress with just C unlocked.
 */
export function createInitialProgress(): KeyProgress {
  return {
    unlockedKeys: ['C'],
    completedKeys: {},
  };
}

/**
 * Check if a key is unlocked.
 */
export function isKeyUnlocked(key: NoteName, progress: KeyProgress): boolean {
  return progress.unlockedKeys.includes(key);
}

/**
 * Check if a key has been completed.
 */
export function isKeyCompleted(key: NoteName, progress: KeyProgress): boolean {
  return key in progress.completedKeys;
}

/**
 * Get the next key to unlock after completing a key.
 *
 * @param completedKey - The key that was just completed
 * @returns The next key to unlock, or null if all keys are unlocked
 */
export function getNextKeyToUnlock(progress: KeyProgress): NoteName | null {
  // Find the first key in the unlock order that isn't unlocked yet
  for (const key of KEY_UNLOCK_ORDER) {
    if (!progress.unlockedKeys.includes(key)) {
      return key;
    }
  }
  return null; // All keys unlocked
}

/**
 * Mark a key as completed and unlock the next key.
 *
 * @param key - The key that was completed
 * @param score - The score achieved
 * @param progress - Current progress
 * @returns Updated progress with new completion and unlock
 */
export function completeKey(
  key: NoteName,
  score: number,
  progress: KeyProgress
): KeyProgress {
  const existingCompletion = progress.completedKeys[key];

  // Update completion (only if better score or first completion)
  const shouldUpdate = !existingCompletion || score > existingCompletion.bestScore;

  const newCompletedKeys = {
    ...progress.completedKeys,
  };

  if (shouldUpdate) {
    newCompletedKeys[key] = {
      bestScore: score,
      completedAt: new Date().toISOString(),
    };
  }

  // Find next key to unlock
  const nextKey = getNextKeyToUnlock(progress);
  const newUnlockedKeys = nextKey && !progress.unlockedKeys.includes(nextKey)
    ? [...progress.unlockedKeys, nextKey]
    : progress.unlockedKeys;

  return {
    unlockedKeys: newUnlockedKeys,
    completedKeys: newCompletedKeys,
  };
}

/**
 * Get completion stats.
 */
export function getProgressStats(progress: KeyProgress): {
  totalKeys: number;
  unlockedCount: number;
  completedCount: number;
  percentComplete: number;
} {
  const totalKeys = KEY_UNLOCK_ORDER.length;
  const unlockedCount = progress.unlockedKeys.length;
  const completedCount = Object.keys(progress.completedKeys).length;

  return {
    totalKeys,
    unlockedCount,
    completedCount,
    percentComplete: Math.round((completedCount / totalKeys) * 100),
  };
}

/**
 * Save progress to localStorage.
 */
export function saveKeyProgress(progress: KeyProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save key progress:', e);
  }
}

/**
 * Load progress from localStorage.
 * Returns initial progress if nothing saved or on error.
 */
export function loadKeyProgress(): KeyProgress {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createInitialProgress();

    const parsed = JSON.parse(saved) as KeyProgress;

    // Validate structure
    if (!Array.isArray(parsed.unlockedKeys) || typeof parsed.completedKeys !== 'object') {
      return createInitialProgress();
    }

    // Ensure C is always unlocked
    if (!parsed.unlockedKeys.includes('C')) {
      parsed.unlockedKeys.unshift('C');
    }

    return parsed;
  } catch (e) {
    console.warn('Failed to load key progress:', e);
    return createInitialProgress();
  }
}

/**
 * Reset all progress.
 */
export function resetKeyProgress(): KeyProgress {
  const initial = createInitialProgress();
  saveKeyProgress(initial);
  return initial;
}
