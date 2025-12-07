/**
 * Chord Calculator
 *
 * Calculates the notes that make up any 7th chord. This is "Layer 1" of the
 * voicing system - it knows WHAT notes are in a chord, but not WHERE to play them.
 *
 * Example: Dm7 = D (root), F (3rd), A (5th), C (7th)
 *
 * Supports: maj7, min7, dom7, min7b5, dim7
 */

// ============================================
// TYPES
// ============================================

export type NoteName =
  | "C" | "C#" | "D" | "D#" | "E" | "F"
  | "F#" | "G" | "G#" | "A" | "A#" | "B";

export type ChordQuality = "maj7" | "min7" | "dom7" | "min7b5" | "dim7";

export interface Chord {
  root: NoteName;
  quality: ChordQuality;
}

export interface ChordTones {
  root: NoteName;
  third: NoteName;
  fifth: NoteName;
  seventh: NoteName;
}

// ============================================
// CONSTANTS
// ============================================

export const CHROMATIC_SCALE: NoteName[] = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B"
];

// Intervals in semitones from root
export const CHORD_FORMULAS: Record<ChordQuality, { third: number; fifth: number; seventh: number }> = {
  maj7:   { third: 4, fifth: 7, seventh: 11 }, // major 3rd, perfect 5th, major 7th
  min7:   { third: 3, fifth: 7, seventh: 10 }, // minor 3rd, perfect 5th, minor 7th
  dom7:   { third: 4, fifth: 7, seventh: 10 }, // major 3rd, perfect 5th, minor 7th
  min7b5: { third: 3, fifth: 6, seventh: 10 }, // minor 3rd, diminished 5th, minor 7th
  dim7:   { third: 3, fifth: 6, seventh: 9 },  // minor 3rd, diminished 5th, diminished 7th
};

// ============================================
// FUNCTIONS
// ============================================

/**
 * Calculate a note by moving up from root by a number of semitones.
 * Uses modular arithmetic to wrap around the chromatic scale.
 *
 * @example calculateNote("D", 3) → "F"
 * @example calculateNote("B", 2) → "C#"
 */
export function calculateNote(root: NoteName, semitones: number): NoteName {
  const rootIndex = CHROMATIC_SCALE.indexOf(root);
  const targetIndex = (rootIndex + semitones) % 12;
  return CHROMATIC_SCALE[targetIndex];
}

/**
 * Get all chord tones for a given chord.
 * Returns the root, third, fifth, and seventh as note names (no octave info).
 *
 * @example getChordTones({root: "D", quality: "min7"})
 *          → {root: "D", third: "F", fifth: "A", seventh: "C"}
 */
export function getChordTones(chord: Chord): ChordTones {
  const { root, quality } = chord;
  const formula = CHORD_FORMULAS[quality];

  return {
    root: root,
    third: calculateNote(root, formula.third),
    fifth: calculateNote(root, formula.fifth),
    seventh: calculateNote(root, formula.seventh),
  };
}

