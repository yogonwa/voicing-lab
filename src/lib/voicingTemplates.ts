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
    leftHandBase: 2,
    rightHandBase: 3,
  },
};

export const SHELL_POSITION_B: VoicingTemplate = {
  name: "Shell Position B",
  id: "shell-b",
  leftHand: ["root"],
  rightHand: ["seventh", "third"], // Inverted from Position A
  octaves: {
    leftHandBase: 2,
    rightHandBase: 3,
  },
};

export const OPEN_VOICING: VoicingTemplate = {
  name: "Open Voicing",
  id: "open",
  leftHand: ["root", "fifth"],
  rightHand: ["third", "seventh"],
  octaves: {
    leftHandBase: 2,
    rightHandBase: 3,
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
// ============================================

// Shell Position A (1-3-7): Root in LH, 3rd+7th in RH
export const SHELL_A_PROGRESSION: VoicedChord[] = [
  // Dm7: D2 | F3, C4
  { leftHand: ["D2"], rightHand: ["F3", "C4"] },
  // G7: G2 | B3, F4 (C moves down to B, smooth voice leading)
  { leftHand: ["G2"], rightHand: ["B3", "F4"] },
  // Cmaj7: C2 | E3, B3 (F moves down to E, B stays)
  { leftHand: ["C2"], rightHand: ["E3", "B3"] },
];

// Shell Position B (1-7-3): Root in LH, 7th+3rd in RH (wider voicing)
export const SHELL_B_PROGRESSION: VoicedChord[] = [
  // Dm7: D2 | C3, F4
  { leftHand: ["D2"], rightHand: ["C3", "F4"] },
  // G7: G2 | F3, B4 (C moves to B, F stays)
  { leftHand: ["G2"], rightHand: ["F3", "B4"] },
  // Cmaj7: C2 | B3, E4 (F moves to E)
  { leftHand: ["C2"], rightHand: ["B3", "E4"] },
];

// Open Voicing (1-5 / 3-7): Root+5th in LH, 3rd+7th in RH
export const OPEN_VOICING_PROGRESSION: VoicedChord[] = [
  // Dm7: D2, A2 | F3, C4
  { leftHand: ["D2", "A2"], rightHand: ["F3", "C4"] },
  // G7: G2, D3 | B3, F4
  { leftHand: ["G2", "D3"], rightHand: ["B3", "F4"] },
  // Cmaj7: C2, G2 | E3, B3
  { leftHand: ["C2", "G2"], rightHand: ["E3", "B3"] },
];

// Map template IDs to their progressions
export const PROGRESSIONS: Record<string, VoicedChord[]> = {
  "shell-a": SHELL_A_PROGRESSION,
  "shell-b": SHELL_B_PROGRESSION,
  "open": OPEN_VOICING_PROGRESSION,
};

