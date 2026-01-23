/**
 * Voice Leading Trainer State Management
 *
 * Manages the state of a training session including current key,
 * progression position, and built voicings.
 */

import type { NoteName, ChordQuality, ChordFunction } from './chordCalculator';
import type { Note } from './voicingTemplates';
import type { PlaygroundBlock } from '../components/ChordExplorer/playgroundUtils';
import type { VoicingScore } from './voiceLeadingAnalysis';

/**
 * A voicing that has been built by the user.
 */
export interface BuiltVoicing {
  blocks: PlaygroundBlock[];
  notes: Note[];
}

/**
 * The position within a ii-V-I progression.
 */
export type ProgressionPosition = 'ii' | 'V' | 'I';

/**
 * Information about a chord in the progression.
 */
export interface ProgressionChord {
  root: NoteName;
  quality: ChordQuality;
  symbol: string;
  function: ChordFunction;
}

/**
 * Complete state for a training session.
 */
export interface TrainerState {
  currentKey: NoteName;
  progressionIndex: 0 | 1 | 2;
  builtVoicings: {
    ii: BuiltVoicing | null;
    V: BuiltVoicing | null;
    I: BuiltVoicing | null;
  };
  scores: {
    ii: VoicingScore | null;
    V: VoicingScore | null;
    I: VoicingScore | null;
  };
}

/**
 * Chord roots for ii-V-I in each key.
 * Key = I chord root, values = [ii root, V root, I root]
 */
const PROGRESSION_ROOTS: Record<NoteName, [NoteName, NoteName, NoteName]> = {
  'C': ['D', 'G', 'C'],
  'C#': ['D#', 'G#', 'C#'],
  'D': ['E', 'A', 'D'],
  'D#': ['F', 'A#', 'D#'],
  'E': ['F#', 'B', 'E'],
  'F': ['G', 'C', 'F'],
  'F#': ['G#', 'C#', 'F#'],
  'G': ['A', 'D', 'G'],
  'G#': ['A#', 'D#', 'G#'],
  'A': ['B', 'E', 'A'],
  'A#': ['C', 'F', 'A#'],
  'B': ['C#', 'F#', 'B'],
};

/**
 * Create a fresh trainer state for a given key.
 *
 * @param key - The key for the ii-V-I progression
 * @returns Initial trainer state with ii chord locked
 */
export function createTrainerState(key: NoteName): TrainerState {
  return {
    currentKey: key,
    progressionIndex: 0,
    builtVoicings: {
      ii: null, // Will be set by getLockedVoicing
      V: null,
      I: null,
    },
    scores: {
      ii: null,
      V: null,
      I: null,
    },
  };
}

/**
 * Get the progression chords for a given key.
 *
 * @param key - The key center (I chord root)
 * @returns Array of chord info: [ii chord, V chord, I chord]
 *
 * @example
 * ```typescript
 * getProgressionChords('C')
 * // [
 * //   { root: 'D', quality: 'min7', symbol: 'Dm7', function: 'ii' },
 * //   { root: 'G', quality: 'dom7', symbol: 'G7', function: 'V' },
 * //   { root: 'C', quality: 'maj7', symbol: 'Cmaj7', function: 'I' }
 * // ]
 * ```
 */
export function getProgressionChords(key: NoteName): [ProgressionChord, ProgressionChord, ProgressionChord] {
  const [iiRoot, vRoot, iRoot] = PROGRESSION_ROOTS[key];

  return [
    {
      root: iiRoot,
      quality: 'min7',
      symbol: `${iiRoot}m7`,
      function: 'ii',
    },
    {
      root: vRoot,
      quality: 'dom7',
      symbol: `${vRoot}7`,
      function: 'V',
    },
    {
      root: iRoot,
      quality: 'maj7',
      symbol: `${iRoot}maj7`,
      function: 'I',
    },
  ];
}

/**
 * Get the current position name from progression index.
 */
export function getPositionFromIndex(index: 0 | 1 | 2): ProgressionPosition {
  const positions: ProgressionPosition[] = ['ii', 'V', 'I'];
  return positions[index];
}

/**
 * Get the target chord for the current position.
 *
 * @param state - Current trainer state
 * @returns The chord the user should be building
 */
export function getCurrentTargetChord(state: TrainerState): ProgressionChord {
  const chords = getProgressionChords(state.currentKey);
  return chords[state.progressionIndex];
}

/**
 * Get the previous chord (for voice leading reference).
 *
 * @param state - Current trainer state
 * @returns The previous chord, or null if at position 0
 */
export function getPreviousChord(state: TrainerState): ProgressionChord | null {
  if (state.progressionIndex === 0) return null;
  const chords = getProgressionChords(state.currentKey);
  return chords[state.progressionIndex - 1];
}

/**
 * Check if the progression is complete.
 */
export function isProgressionComplete(state: TrainerState): boolean {
  return state.builtVoicings.ii !== null &&
         state.builtVoicings.V !== null &&
         state.builtVoicings.I !== null;
}

/**
 * Get total score for the progression.
 */
export function getTotalScore(state: TrainerState): number {
  let total = 0;
  if (state.scores.ii) total += state.scores.ii.total;
  if (state.scores.V) total += state.scores.V.total;
  if (state.scores.I) total += state.scores.I.total;
  return total;
}

/**
 * Advance to the next chord in the progression.
 *
 * @param state - Current state
 * @param voicing - The voicing that was just built
 * @param score - Score for the built voicing
 * @returns Updated state, or null if progression is complete
 */
export function advanceProgression(
  state: TrainerState,
  voicing: BuiltVoicing,
  score: VoicingScore
): TrainerState {
  const position = getPositionFromIndex(state.progressionIndex);

  const newState = {
    ...state,
    builtVoicings: {
      ...state.builtVoicings,
      [position]: voicing,
    },
    scores: {
      ...state.scores,
      [position]: score,
    },
  };

  // Advance to next position if not at end
  if (state.progressionIndex < 2) {
    newState.progressionIndex = (state.progressionIndex + 1) as 0 | 1 | 2;
  }

  return newState;
}
