/**
 * Chord Calculator
 *
 * Calculates the notes that make up any 7th chord with extensions.
 * This is "Layer 1" of the voicing system - it knows WHAT notes are in a chord,
 * but not WHERE to play them.
 *
 * Example: Dm9 = D (root), F (3rd), A (5th), C (7th), E (9th)
 *
 * Supports: maj7, min7, dom7, min7b5, dim7
 * Extensions: 9th, 11th, 13th
 * Alterations (dom7 only): ♭9, ♯9, ♯11, ♭13
 */

// ============================================
// TYPES
// ============================================

export type NoteName =
  | "C" | "C#" | "D" | "D#" | "E" | "F"
  | "F#" | "G" | "G#" | "A" | "A#" | "B";

export type ChordQuality = "maj7" | "min7" | "dom7" | "min7b5" | "dim7";

/** Chord function in a progression (affects which extensions are appropriate) */
export type ChordFunction = "ii" | "V" | "I" | "other";

export interface Chord {
  root: NoteName;
  quality: ChordQuality;
  /** Optional: chord function for extension recommendations */
  chordFunction?: ChordFunction;
}

/** Basic chord tones (root, 3rd, 5th, 7th) */
export interface ChordTones {
  root: NoteName;
  third: NoteName;
  fifth: NoteName;
  seventh: NoteName;
}

/** Extensions that can be added to any chord */
export interface Extensions {
  ninth: NoteName;
  eleventh: NoteName;
  thirteenth: NoteName;
}

/** Alterations specific to dominant 7th chords */
export interface Alterations {
  flatNinth: NoteName;
  sharpNinth: NoteName;
  sharpEleventh: NoteName;
  flatThirteenth: NoteName;
}

/** Complete chord with all possible tones */
export interface ExtendedChordTones extends ChordTones {
  extensions: Extensions;
  alterations?: Alterations; // Only present for dom7 chords
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

// Extension intervals (in semitones from root, compound intervals)
export const EXTENSION_INTERVALS = {
  ninth: 14,        // Octave + major 2nd (same as 2nd up an octave)
  eleventh: 17,     // Octave + perfect 4th
  thirteenth: 21,   // Octave + major 6th
} as const;

// Alteration intervals (in semitones from root, for dominant 7th chords)
export const ALTERATION_INTERVALS = {
  flatNinth: 13,      // Octave + minor 2nd
  sharpNinth: 15,     // Octave + augmented 2nd (enharmonic to minor 3rd)
  sharpEleventh: 18,  // Octave + augmented 4th (tritone up an octave)
  flatThirteenth: 20, // Octave + minor 6th (enharmonic to augmented 5th)
} as const;

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
 * Get basic chord tones for a given chord.
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

/**
 * Get all chord tones including extensions and alterations.
 * Extensions are always calculated. Alterations only for dom7 chords.
 *
 * @example getExtendedChordTones({root: "D", quality: "min7"})
 *          → {root: "D", third: "F", fifth: "A", seventh: "C",
 *             extensions: {ninth: "E", eleventh: "G", thirteenth: "B"}}
 *
 * @example getExtendedChordTones({root: "G", quality: "dom7"})
 *          → {..., alterations: {flatNinth: "Ab", sharpNinth: "A#", ...}}
 */
export function getExtendedChordTones(chord: Chord): ExtendedChordTones {
  const { root, quality } = chord;
  const baseTones = getChordTones(chord);

  // Calculate extensions (same for all chord types)
  const extensions: Extensions = {
    ninth: calculateNote(root, EXTENSION_INTERVALS.ninth),
    eleventh: calculateNote(root, EXTENSION_INTERVALS.eleventh),
    thirteenth: calculateNote(root, EXTENSION_INTERVALS.thirteenth),
  };

  // Only dom7 chords get alterations
  if (quality === "dom7") {
    const alterations: Alterations = {
      flatNinth: calculateNote(root, ALTERATION_INTERVALS.flatNinth),
      sharpNinth: calculateNote(root, ALTERATION_INTERVALS.sharpNinth),
      sharpEleventh: calculateNote(root, ALTERATION_INTERVALS.sharpEleventh),
      flatThirteenth: calculateNote(root, ALTERATION_INTERVALS.flatThirteenth),
    };
    return { ...baseTones, extensions, alterations };
  }

  return { ...baseTones, extensions };
}

// ============================================
// EXTENSION AVOID RULES (BY CHORD QUALITY)
// ============================================

/**
 * Extensions to AVOID by chord quality.
 * These create dissonant clashes regardless of chord function.
 * 
 * The rule: natural 11 clashes with major 3rd, natural 13 clashes with minor 3rd.
 * 
 * | Quality        | Avoid | Reason                           |
 * |----------------|-------|----------------------------------|
 * | Major 7th      | 11    | Natural 11 is half-step from 3rd |
 * | Minor 7th      | 13    | Natural 13 is half-step from ♭7  |
 * | Dominant 7th   | 11    | Natural 11 is half-step from 3rd |
 * | Diminished 7th | 13    | Clashes with diminished context  |
 * | Half-Diminished| 13    | Clashes with minor 3rd context   |
 */
export const AVOID_EXTENSIONS: Record<ChordQuality, (keyof Extensions)[]> = {
  maj7:   ["eleventh"],   // Natural 11 (F) clashes with major 3rd (E)
  min7:   ["thirteenth"], // Natural 13 can clash with minor context
  dom7:   ["eleventh"],   // Natural 11 (F) clashes with major 3rd (E) - use #11 instead
  min7b5: ["thirteenth"], // 13 clashes in half-diminished context
  dim7:   ["thirteenth"], // 13 clashes in fully diminished context
};

/**
 * "Safe" extensions that generally work for each chord quality.
 */
export const SAFE_EXTENSIONS: Record<ChordQuality, (keyof Extensions)[]> = {
  maj7:   ["ninth", "thirteenth"],           // 9 and 13 are safe; use #11 for Lydian
  min7:   ["ninth", "eleventh"],             // 9 and 11 are lush on minor chords
  dom7:   ["ninth", "thirteenth"],           // 9 and 13 are standard; #11 for Lydian dominant
  min7b5: ["ninth", "eleventh"],             // 9 and 11 work on half-dim
  dim7:   ["ninth", "eleventh"],             // 9 and 11 work on fully-dim
};

// ============================================
// FUNCTION-APPROPRIATE EXTENSIONS
// ============================================

/**
 * Extension recommendations based on chord function in a progression.
 * These layer ON TOP of the quality-based avoid rules.
 * 
 * Example: ii chord (usually min7) → quality says avoid 13, function says 9+11 are lush
 */
export const EXTENSION_RECOMMENDATIONS: Record<ChordFunction, {
  recommended: (keyof Extensions)[];
  alterations?: (keyof Alterations)[];
  avoid: (keyof Extensions)[];
  description: string;
}> = {
  ii: {
    recommended: ["ninth", "eleventh"],
    avoid: ["thirteenth"], // Also avoided by min7 quality
    description: "Lush, suspended sound. 9th and 11th add color without tension.",
  },
  V: {
    recommended: ["ninth", "thirteenth"],
    alterations: ["flatNinth", "sharpNinth", "sharpEleventh", "flatThirteenth"],
    avoid: ["eleventh"], // Natural 11 clashes - use #11 (sharpEleventh) instead
    description: "13th = bright/open. Alterations create tension for resolution.",
  },
  I: {
    recommended: ["ninth"],
    avoid: ["eleventh"], // Natural 11 clashes - use #11 for Lydian color
    description: "9th = smooth resolution. #11 adds modern Lydian color.",
  },
  other: {
    recommended: ["ninth"],
    avoid: [],
    description: "9th is generally safe. Check quality for 11th/13th.",
  },
};

/**
 * Check if an extension should be avoided for a given chord.
 * Combines both quality-based and function-based avoid rules.
 * 
 * @example shouldAvoidExtension({root: "C", quality: "maj7"}, "eleventh") → true
 * @example shouldAvoidExtension({root: "D", quality: "min7"}, "ninth") → false
 */
export function shouldAvoidExtension(
  chord: Chord, 
  extension: keyof Extensions
): boolean {
  const { quality, chordFunction } = chord;
  
  // Check quality-based avoid rules (most fundamental)
  if (AVOID_EXTENSIONS[quality].includes(extension)) {
    return true;
  }
  
  // Check function-based avoid rules (if function is specified)
  if (chordFunction) {
    const funcRules = EXTENSION_RECOMMENDATIONS[chordFunction];
    if (funcRules.avoid.includes(extension)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get safe extensions for a chord based on its quality.
 * These are extensions that won't clash with chord tones.
 * 
 * @example getSafeExtensions({root: "C", quality: "maj7"})
 *          → {ninth: "D", thirteenth: "A"} // 11th excluded (clashes with 3rd)
 */
export function getSafeExtensions(chord: Chord): Partial<Extensions> {
  const { quality } = chord;
  const extended = getExtendedChordTones(chord);
  const safeExts = SAFE_EXTENSIONS[quality];
  
  const result: Partial<Extensions> = {};
  for (const ext of safeExts) {
    result[ext] = extended.extensions[ext];
  }
  return result;
}

/**
 * Get recommended extensions for a chord based on its function.
 * Filters out any extensions that should be avoided by quality.
 * Returns the actual note names (not just the extension names).
 *
 * @example getRecommendedExtensions({root: "D", quality: "min7", chordFunction: "ii"})
 *          → {ninth: "E", eleventh: "G"} // 9th and 11th recommended, 13th avoided
 */
export function getRecommendedExtensions(chord: Chord): Partial<Extensions> {
  const chordFunction = chord.chordFunction || "other";
  const extended = getExtendedChordTones(chord);
  const recommendations = EXTENSION_RECOMMENDATIONS[chordFunction];

  const result: Partial<Extensions> = {};
  for (const ext of recommendations.recommended) {
    // Only include if not avoided by chord quality
    if (!shouldAvoidExtension(chord, ext)) {
      result[ext] = extended.extensions[ext];
    }
  }
  return result;
}

