/**
 * Voicing Templates
 *
 * Defines HOW to voice chords - which chord tones go in which hand at what octave.
 * This is "Layer 2" of the voicing system.
 *
 * Templates are abstract patterns (e.g., "root in LH, 3rd+7th in RH").
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

export type VoicingRole = "root" | "third" | "fifth" | "seventh";

export interface VoicingTemplate {
  name: string;
  id: string;
  leftHand: VoicingRole[];
  rightHand: VoicingRole[];
  octaves: {
    leftHandBase: Octave;
    rightHandBase: Octave;
  };
}

// A single voicing for one chord (with specific notes and octaves)
export interface VoicedChord {
  leftHand: Note[];
  rightHand: Note[];
}

// ============================================
// VOICING TEMPLATES
// ============================================

export const SHELL_POSITION_A: VoicingTemplate = {
  name: "Shell Position A",
  id: "shell-a",
  leftHand: ["root"],
  rightHand: ["third", "seventh"],
  octaves: {
    leftHandBase: 3,   // Was 2, now 3
    rightHandBase: 4,  // Was 3, now 4
  },
};

export const SHELL_POSITION_B: VoicingTemplate = {
  name: "Shell Position B",
  id: "shell-b",
  leftHand: ["root"],
  rightHand: ["seventh", "third"], // Inverted from Position A
  octaves: {
    leftHandBase: 3,   // Was 2, now 3
    rightHandBase: 4,  // Was 3, now 4
  },
};

export const OPEN_VOICING: VoicingTemplate = {
  name: "Open Voicing",
  id: "open",
  leftHand: ["root", "fifth"],
  rightHand: ["third", "seventh"],
  octaves: {
    leftHandBase: 3,   // Was 2, now 3
    rightHandBase: 4,  // Was 3, now 4
  },
};

// All templates for easy iteration
export const ALL_TEMPLATES: VoicingTemplate[] = [
  SHELL_POSITION_A,
  SHELL_POSITION_B,
  OPEN_VOICING,
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

// Map template IDs to their progressions
export const PROGRESSIONS: Record<string, VoicedChord[]> = {
  "shell-a": SHELL_A_PROGRESSION,
  "shell-b": SHELL_B_PROGRESSION,
  "open": OPEN_VOICING_PROGRESSION,
};
