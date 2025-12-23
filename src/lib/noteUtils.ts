/**
 * Note utilities (pure).
 *
 * Canonical helpers for parsing notes and working with chromatic pitch.
 * Keep this file free of browser/audio dependencies.
 */

import { CHROMATIC_SCALE, type NoteName } from './chordCalculator';
import type { Note } from './voicingTemplates';

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


