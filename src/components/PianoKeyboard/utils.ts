/**
 * PianoKeyboard Utilities
 *
 * Functions for mapping notes to keyboard positions and
 * converting voicings to active note lists.
 * 
 * Updated for Phase 2.5: Supports extensions (9th, 11th, 13th)
 */

import { 
  Note, 
  VoicedChord, 
  VoicingRole, 
  ChordTones, 
  ExtendedChordTones,
  getChordTones, 
  getExtendedChordTones,
  Chord 
} from '../../lib';
import { ActiveNote, KeyLayout, Hand } from './types';

// ============================================
// CONSTANTS
// ============================================

/** Notes in one octave (white and black keys) */
const NOTES_IN_OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** White keys only (for position calculation) */
const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

/** Black key positions relative to white keys */
const BLACK_KEY_OFFSETS: Record<string, number> = {
  'C#': 0.6,  // Between C and D
  'D#': 1.6,  // Between D and E
  'F#': 3.6,  // Between F and G
  'G#': 4.6,  // Between G and A
  'A#': 5.6,  // Between A and B
};

// ============================================
// NOTE HELPERS
// ============================================

/**
 * Parse a note string into name and octave
 * @example parseNote("C#4") → { name: "C#", octave: 4 }
 */
export function parseNote(note: Note): { name: string; octave: number } {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) throw new Error(`Invalid note: ${note}`);
  return { name: match[1], octave: parseInt(match[2], 10) };
}

/**
 * Check if a note is a black key
 */
export function isBlackKey(noteName: string): boolean {
  return noteName.includes('#');
}

/**
 * Get the white key index (0-6) for a note name
 */
function getWhiteKeyIndex(noteName: string): number {
  const baseName = noteName.replace('#', '');
  return WHITE_NOTES.indexOf(baseName);
}

// ============================================
// KEYBOARD LAYOUT
// ============================================

/**
 * Generate the layout of all keys for a given octave range.
 * Returns array of KeyLayout objects with position info.
 *
 * @param startOctave - First octave to include (default: 2)
 * @param endOctave - Last octave to include (default: 5)
 */
export function generateKeyboardLayout(
  startOctave: number = 2,
  endOctave: number = 5
): KeyLayout[] {
  const keys: KeyLayout[] = [];
  const totalOctaves = endOctave - startOctave + 1;
  const whiteKeysPerOctave = 7;
  const totalWhiteKeys = totalOctaves * whiteKeysPerOctave;

  for (let octave = startOctave; octave <= endOctave; octave++) {
    const octaveOffset = (octave - startOctave) * whiteKeysPerOctave;

    for (const noteName of NOTES_IN_OCTAVE) {
      const note = `${noteName}${octave}` as Note;
      const isBlack = isBlackKey(noteName);

      let position: number;
      if (isBlack) {
        // Black key position based on offset
        const offset = BLACK_KEY_OFFSETS[noteName];
        position = ((octaveOffset + offset) / totalWhiteKeys) * 100;
      } else {
        // White key position
        const whiteIndex = getWhiteKeyIndex(noteName);
        position = ((octaveOffset + whiteIndex) / totalWhiteKeys) * 100;
      }

      keys.push({ note, isBlack, position });
    }
  }

  return keys;
}

// ============================================
// ACTIVE NOTES
// ============================================

/**
 * Determine the role of a note in a chord by matching against chord tones.
 * Supports both basic tones and extensions.
 */
function getNoteRole(
  noteName: string,
  chordTones: ExtendedChordTones
): VoicingRole | undefined {
  // Basic chord tones
  if (noteName === chordTones.root) return 'root';
  if (noteName === chordTones.third) return 'third';
  if (noteName === chordTones.fifth) return 'fifth';
  if (noteName === chordTones.seventh) return 'seventh';
  
  // Extensions
  if (chordTones.extensions) {
    if (noteName === chordTones.extensions.ninth) return 'ninth';
    if (noteName === chordTones.extensions.eleventh) return 'eleventh';
    if (noteName === chordTones.extensions.thirteenth) return 'thirteenth';
  }
  
  // Alterations (for dom7 chords)
  if (chordTones.alterations) {
    if (noteName === chordTones.alterations.flatNinth) return 'flatNinth';
    if (noteName === chordTones.alterations.sharpNinth) return 'sharpNinth';
    if (noteName === chordTones.alterations.sharpEleventh) return 'sharpEleventh';
    if (noteName === chordTones.alterations.flatThirteenth) return 'flatThirteenth';
  }
  
  return undefined;
}

/**
 * Convert a VoicedChord to an array of ActiveNotes with roles.
 * Requires the original chord to determine roles.
 * Supports both basic tones and extensions (9th, 11th, 13th).
 *
 * @param voicing - The voicing with specific notes
 * @param chord - The chord definition (for calculating roles)
 */
export function getActiveNotes(
  voicing: VoicedChord,
  chord: Chord
): ActiveNote[] {
  // Use extended chord tones to support 9th, 11th, 13th, and alterations
  const chordTones = getExtendedChordTones(chord);
  const activeNotes: ActiveNote[] = [];

  // Process left hand notes
  for (const note of voicing.leftHand) {
    const { name } = parseNote(note);
    const role = getNoteRole(name, chordTones);
    if (role) {
      activeNotes.push({ note, role, hand: 'left' });
    }
  }

  // Process right hand notes
  for (const note of voicing.rightHand) {
    const { name } = parseNote(note);
    const role = getNoteRole(name, chordTones);
    if (role) {
      activeNotes.push({ note, role, hand: 'right' });
    }
  }

  return activeNotes;
}

/**
 * Check if a note is in the active notes list and return its info.
 */
export function findActiveNote(
  note: Note,
  activeNotes: ActiveNote[]
): ActiveNote | undefined {
  return activeNotes.find((an) => an.note === note);
}

