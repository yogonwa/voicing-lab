/**
 * Voicing Templates
 *
 * Defines HOW to voice chords - which chord tones go in which hand at what octave.
 * This is "Layer 2" of the voicing system.
 *
 * Templates are abstract patterns (e.g., "root in LH, 3rd+7th+9th in RH").
 * Progressions are concrete realizations with specific notes for ii-V-I in C.
 *
 * Voice leading is manually designed to ensure smooth transitions between chords.
 * Future: voicingGenerator will compute these programmatically for any key.
 */

import { NoteName } from './chordCalculator';

// ============================================
// TYPES
// ============================================

export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type Note = `${NoteName}${Octave}`; // e.g., "C4", "F#3"

/** Basic chord tones */
export type BasicRole = "root" | "third" | "fifth" | "seventh";

/** Extension roles */
export type ExtensionRole = "ninth" | "eleventh" | "thirteenth";

/** Alteration roles (dominant 7th chords only) */
export type AlterationRole = "flatNinth" | "sharpNinth" | "sharpEleventh" | "flatThirteenth";

/** All possible note roles in a voicing */
export type VoicingRole = BasicRole | ExtensionRole | AlterationRole;

/** Category of voicing template */
export type VoicingCategory = "shell" | "shell-extended" | "open" | "rootless" | "altered";

export interface VoicingTemplate {
  name: string;
  id: string;
  category: VoicingCategory;
  leftHand: VoicingRole[];
  rightHand: VoicingRole[];
  octaves: {
    leftHandBase: Octave;
    rightHandBase: Octave;
  };
  /** Which chord functions this template works best with */
  recommendedFor?: ("ii" | "V" | "I" | "any")[];
  /** Brief description for UI */
  description?: string;
}

// A single voicing for one chord (with specific notes and octaves)
export interface VoicedChord {
  leftHand: Note[];
  rightHand: Note[];
}

// ============================================
// BASIC VOICING TEMPLATES (No Extensions)
// ============================================

export const SHELL_POSITION_A: VoicingTemplate = {
  name: "Shell Position A",
  id: "shell-a",
  category: "shell",
  leftHand: ["root"],
  rightHand: ["third", "seventh"],
  octaves: {
    leftHandBase: 3,
    rightHandBase: 4,
  },
  recommendedFor: ["any"],
  description: "Root in LH, 3rd and 7th in RH (1-3-7)",
};

export const SHELL_POSITION_B: VoicingTemplate = {
  name: "Shell Position B",
  id: "shell-b",
  category: "shell",
  leftHand: ["root"],
  rightHand: ["seventh", "third"], // Inverted from Position A
  octaves: {
    leftHandBase: 3,
    rightHandBase: 4,
  },
  recommendedFor: ["any"],
  description: "Root in LH, 7th and 3rd in RH (1-7-3)",
};

export const OPEN_VOICING: VoicingTemplate = {
  name: "Open Voicing",
  id: "open",
  category: "open",
  leftHand: ["root", "fifth"],
  rightHand: ["third", "seventh"],
  octaves: {
    leftHandBase: 3,
    rightHandBase: 4,
  },
  recommendedFor: ["any"],
  description: "Root and 5th in LH, 3rd and 7th in RH (1-5 / 3-7)",
};

// ============================================
// EXTENDED VOICING TEMPLATES (With Extensions)
// ============================================

export const SHELL_WITH_NINTH: VoicingTemplate = {
  name: "Shell + 9th",
  id: "shell-9",
  category: "shell-extended",
  leftHand: ["root"],
  rightHand: ["third", "seventh", "ninth"],
  octaves: {
    leftHandBase: 3,
    rightHandBase: 4,
  },
  recommendedFor: ["ii", "I", "any"],
  description: "Adds 9th on top for a fuller, jazzy sound",
};

export const SHELL_WITH_THIRTEENTH: VoicingTemplate = {
  name: "Shell + 13th",
  id: "shell-13",
  category: "shell-extended",
  leftHand: ["root"],
  rightHand: ["third", "seventh", "thirteenth"],
  octaves: {
    leftHandBase: 3,
    rightHandBase: 4,
  },
  recommendedFor: ["V"],
  description: "Bright, open dominant sound with 13th",
};

export const OPEN_WITH_NINTH: VoicingTemplate = {
  name: "Open + 9th",
  id: "open-9",
  category: "open",
  leftHand: ["root", "fifth"],
  rightHand: ["third", "seventh", "ninth"],
  octaves: {
    leftHandBase: 3,
    rightHandBase: 4,
  },
  recommendedFor: ["ii", "I", "any"],
  description: "Full open voicing with added 9th",
};

// ============================================
// TEMPLATE COLLECTIONS
// ============================================

/** Basic templates (no extensions) - Phase 1 */
export const BASIC_TEMPLATES: VoicingTemplate[] = [
  SHELL_POSITION_A,
  SHELL_POSITION_B,
  OPEN_VOICING,
];

/** Extended templates (with 9th, 13th) - Phase 2.5 */
export const EXTENDED_TEMPLATES: VoicingTemplate[] = [
  SHELL_WITH_NINTH,
  SHELL_WITH_THIRTEENTH,
  OPEN_WITH_NINTH,
];

/** All templates for easy iteration */
export const ALL_TEMPLATES: VoicingTemplate[] = [
  ...BASIC_TEMPLATES,
  ...EXTENDED_TEMPLATES,
];

// ============================================
// HARDCODED VOICE-LED PROGRESSIONS (ii-V-I in C)
// All voicings shifted up 1 octave for better piano range
// ============================================

// Shell Position A (1-3-7): Root in LH, 3rd+7th in RH
export const SHELL_A_PROGRESSION: VoicedChord[] = [
  // Dm7: D3 | F4, C5
  { leftHand: ["D3"], rightHand: ["F4", "C5"] },
  // G7: G3 | B4, F5 (C moves down to B, smooth voice leading)
  { leftHand: ["G3"], rightHand: ["B4", "F5"] },
  // Cmaj7: C3 | E4, B4 (F moves down to E, B stays)
  { leftHand: ["C3"], rightHand: ["E4", "B4"] },
];

// Shell Position B (1-7-3): Root in LH, 7th+3rd in RH
// Voice leading: 7th stays low, 3rd above (close position)
export const SHELL_B_PROGRESSION: VoicedChord[] = [
  // Dm7: D3 | C4, F4
  { leftHand: ["D3"], rightHand: ["C4", "F4"] },
  // G7: G3 | F4, B4 (C→B half-step down, F stays)
  { leftHand: ["G3"], rightHand: ["F4", "B4"] },
  // Cmaj7: C3 | B4, E5 (F→E half-step down, B stays; E5 because E is below B chromatically)
  { leftHand: ["C3"], rightHand: ["B4", "E5"] },
];

// Open Voicing (1-5 / 3-7): Root+5th in LH, 3rd+7th in RH
export const OPEN_VOICING_PROGRESSION: VoicedChord[] = [
  // Dm7: D3, A3 | F4, C5
  { leftHand: ["D3", "A3"], rightHand: ["F4", "C5"] },
  // G7: G3, D4 | B4, F5
  { leftHand: ["G3", "D4"], rightHand: ["B4", "F5"] },
  // Cmaj7: C3, G3 | E4, B4
  { leftHand: ["C3", "G3"], rightHand: ["E4", "B4"] },
];

// ============================================
// EXTENDED PROGRESSIONS (ii-V-I with extensions)
// Dm9 → G13 → Cmaj9
// ============================================

// Shell + 9th Progression
// Voice leading: 9th moves smoothly between chords
export const SHELL_9_PROGRESSION: VoicedChord[] = [
  // Dm9: D3 | F4, C5, E5 (root | 3rd, 7th, 9th)
  { leftHand: ["D3"], rightHand: ["F4", "C5", "E5"] },
  // G9: G3 | B4, F5, A5 (9th = A, smooth from E)
  { leftHand: ["G3"], rightHand: ["B4", "F5", "A5"] },
  // Cmaj9: C3 | E4, B4, D5 (9th = D)
  { leftHand: ["C3"], rightHand: ["E4", "B4", "D5"] },
];

// Shell + 13th Progression (best for V chord)
// Uses 9th for ii and I, 13th for V
export const SHELL_13_PROGRESSION: VoicedChord[] = [
  // Dm9: D3 | F4, C5, E5 (9th for ii)
  { leftHand: ["D3"], rightHand: ["F4", "C5", "E5"] },
  // G13: G3 | B4, F5, E6 (13th = E, bright dominant sound)
  { leftHand: ["G3"], rightHand: ["B4", "F5", "E6"] },
  // Cmaj9: C3 | E4, B4, D5 (9th for I)
  { leftHand: ["C3"], rightHand: ["E4", "B4", "D5"] },
];

// Open + 9th Progression
// Fuller sound with 5th in left hand
export const OPEN_9_PROGRESSION: VoicedChord[] = [
  // Dm9: D3, A3 | F4, C5, E5
  { leftHand: ["D3", "A3"], rightHand: ["F4", "C5", "E5"] },
  // G9: G3, D4 | B4, F5, A5
  { leftHand: ["G3", "D4"], rightHand: ["B4", "F5", "A5"] },
  // Cmaj9: C3, G3 | E4, B4, D5
  { leftHand: ["C3", "G3"], rightHand: ["E4", "B4", "D5"] },
];

// ============================================
// PROGRESSION MAP
// ============================================

// Map template IDs to their progressions
export const PROGRESSIONS: Record<string, VoicedChord[]> = {
  // Basic (no extensions)
  "shell-a": SHELL_A_PROGRESSION,
  "shell-b": SHELL_B_PROGRESSION,
  "open": OPEN_VOICING_PROGRESSION,
  // Extended (with 9th, 13th)
  "shell-9": SHELL_9_PROGRESSION,
  "shell-13": SHELL_13_PROGRESSION,
  "open-9": OPEN_9_PROGRESSION,
};
