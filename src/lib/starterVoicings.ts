/**
 * Starter Voicings for Voice Leading Trainer
 *
 * Provides pre-built Shell A voicings for the ii chord in each key.
 * These serve as the "locked" starting point for voice leading exercises.
 */

import type { NoteName, ChordQuality } from './chordCalculator';
import type { Note, VoicingRole } from './voicingTemplates';
import type { PlaygroundBlock } from '../components/ChordExplorer/playgroundUtils';
import type { BuiltVoicing } from './trainerState';
import { getExtendedChordTones } from './chordCalculator';
import { transposeNote } from './voicingGenerator';

/**
 * Shell A voicing pattern: 3rd and 7th with root in bass.
 * This is a classic jazz voicing that emphasizes guide tones.
 */
const SHELL_A_PATTERN: VoicingRole[] = ['third', 'seventh'];

/**
 * Reference Shell A voicing for Dm7 in the key of C.
 * Notes: F4 (3rd), C5 (7th)
 * This is the "template" we transpose to other keys.
 */
const DM7_SHELL_A: Note[] = ['F4', 'C5'];

/**
 * Semitone intervals from C to each key root.
 */
const KEY_INTERVALS: Record<NoteName, number> = {
  'C': 0,
  'C#': 1,
  'D': 2,
  'D#': 3,
  'E': 4,
  'F': 5,
  'F#': 6,
  'G': 7,
  'G#': 8,
  'A': 9,
  'A#': 10,
  'B': 11,
};

/**
 * Get the ii chord root for a given key.
 * ii chord is always a whole step above the key root.
 */
function getIIRoot(key: NoteName): NoteName {
  const keyIndex = KEY_INTERVALS[key];
  const iiIndex = (keyIndex + 2) % 12; // Whole step up
  const noteNames: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return noteNames[iiIndex];
}

/**
 * Create a PlaygroundBlock for a chord tone.
 */
function createBlock(
  role: VoicingRole,
  noteName: NoteName,
  label: string
): PlaygroundBlock {
  return {
    id: `starter-${role}`,
    label,
    note: noteName,
    voicingRole: role,
    cssRole: role,
    enabled: true,
    isExtension: false,
  };
}

/**
 * Get the starter voicing (Shell A) for the ii chord in a given key.
 *
 * The voicing is transposed from the reference Dm7 in C.
 * This ensures consistent voice leading starting points.
 *
 * @param key - The key center (I chord root)
 * @returns Built voicing with blocks and notes
 *
 * @example
 * ```typescript
 * const dm7 = getStarterVoicing('C');
 * // dm7.notes = ['F4', 'C5'] (Dm7 Shell A)
 *
 * const em7 = getStarterVoicing('D');
 * // em7.notes = ['G4', 'D5'] (Em7 Shell A, up a whole step)
 * ```
 */
export function getStarterVoicing(key: NoteName): BuiltVoicing {
  // Calculate transposition interval from C
  const interval = KEY_INTERVALS[key];

  // Transpose the reference Dm7 voicing
  const notes = DM7_SHELL_A.map(note => transposeNote(note, interval));

  // Get the actual note names for the ii chord in this key
  const iiRoot = getIIRoot(key);
  const chordTones = getExtendedChordTones({ root: iiRoot, quality: 'min7' });

  // Build the blocks
  const blocks: PlaygroundBlock[] = [
    createBlock('third', chordTones.third, '3'),
    createBlock('seventh', chordTones.seventh, '7'),
  ];

  return { blocks, notes };
}

/**
 * Get chord tone hints for a target chord.
 *
 * Returns the R-3-5-7 of the chord to help users
 * understand which notes they can use.
 *
 * @param root - Chord root
 * @param quality - Chord quality
 * @returns Array of chord tone hints with roles and note names
 *
 * @example
 * ```typescript
 * const hints = getChordToneHints('G', 'dom7');
 * // [
 * //   { role: 'root', note: 'G' },
 * //   { role: 'third', note: 'B' },
 * //   { role: 'fifth', note: 'D' },
 * //   { role: 'seventh', note: 'F' }
 * // ]
 * ```
 */
export function getChordToneHints(
  root: NoteName,
  quality: ChordQuality
): { role: VoicingRole; note: NoteName; label: string }[] {
  const tones = getExtendedChordTones({ root, quality });

  return [
    { role: 'root', note: tones.root, label: 'R' },
    { role: 'third', note: tones.third, label: '3' },
    { role: 'fifth', note: tones.fifth, label: '5' },
    { role: 'seventh', note: tones.seventh, label: '7' },
  ];
}

/**
 * Get extension hints for a target chord.
 *
 * Returns available extensions (9, 11, 13) based on chord quality.
 *
 * @param root - Chord root
 * @param quality - Chord quality
 * @returns Array of extension hints
 */
export function getExtensionHints(
  root: NoteName,
  quality: ChordQuality
): { role: VoicingRole; note: NoteName; label: string }[] {
  const tones = getExtendedChordTones({ root, quality });
  const hints: { role: VoicingRole; note: NoteName; label: string }[] = [];

  // 9th is available for all qualities
  if (tones.extensions?.ninth) {
    hints.push({ role: 'ninth', note: tones.extensions.ninth, label: '9' });
  }

  // 11th: avoid on maj7 and dom7 (clashes with 3rd)
  if (quality === 'min7' || quality === 'min7b5') {
    if (tones.extensions?.eleventh) {
      hints.push({ role: 'eleventh', note: tones.extensions.eleventh, label: '11' });
    }
  }

  // 13th is available for maj7 and dom7
  if (quality === 'maj7' || quality === 'dom7') {
    if (tones.extensions?.thirteenth) {
      hints.push({ role: 'thirteenth', note: tones.extensions.thirteenth, label: '13' });
    }
  }

  return hints;
}
