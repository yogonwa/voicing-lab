/**
 * Note utilities (pure).
 *
 * Canonical helpers for parsing notes and working with chromatic pitch.
 * Keep this file free of browser/audio dependencies.
 */

import { CHROMATIC_SCALE, type NoteName } from './chordCalculator';
import type { Note, VoicingRole } from './voicingTemplates';

const NOTE_TO_CHROMA: Record<NoteName, number> = CHROMATIC_SCALE.reduce((acc, note, index) => {
  acc[note] = index;
  return acc;
}, {} as Record<NoteName, number>);

/**
 * Parse a note string into name and octave.
 * @example parseNote("C#4") → { name: "C#", octave: 4 }
 */
export function parseNote(note: Note): { name: NoteName; octave: number } {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) {
    throw new Error(`Invalid note: ${note}`);
  }
  return { name: match[1] as NoteName, octave: parseInt(match[2], 10) };
}

/**
 * Pitch class for a note name (0-11).
 * C=0, C#=1, ... B=11
 */
export function getNoteChroma(note: NoteName): number {
  return NOTE_TO_CHROMA[note] ?? 0;
}

/**
 * Convert a note to its MIDI-like absolute pitch number.
 * C4 = 60.
 */
export function toMidi(note: Note): number {
  const { name, octave } = parseNote(note);
  return (octave + 1) * 12 + getNoteChroma(name);
}

/**
 * Format a voicing role for human-readable display.
 * Used in pattern recognition, warnings, and educational feedback.
 * 
 * @param role - The voicing role to format
 * @returns Formatted string with musical symbols (e.g., '♭9', '♯11')
 * 
 * @example
 * formatVoicingRole('flatNinth') // => '♭9'
 * formatVoicingRole('sharpEleventh') // => '♯11'
 * formatVoicingRole('third') // => '3rd'
 */
export function formatVoicingRole(role: VoicingRole): string {
  const ROLE_DISPLAY_MAP: Record<VoicingRole, string> = {
    root: 'root',
    third: '3rd',
    fifth: '5th',
    seventh: '7th',
    ninth: '9th',
    flatNinth: '♭9',
    sharpNinth: '♯9',
    eleventh: '11th',
    sharpEleventh: '♯11',
    thirteenth: '13th',
    flatThirteenth: '♭13',
  } as const;

  return ROLE_DISPLAY_MAP[role] ?? role;
}

