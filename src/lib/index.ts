/**
 * Voicing Lab - Core Music Theory Library
 *
 * This module provides the foundational music theory calculations
 * for generating jazz piano voicings.
 *
 * Architecture:
 * - chordCalculator: Calculates chord tones (what notes make up a chord)
 * - voicingTemplates: Defines how to voice chords (which hand plays what)
 * - voicingGenerator: Combines the above to produce playable voicings (coming)
 */

// Chord tone calculation
export {
  calculateNote,
  getChordTones,
  CHROMATIC_SCALE,
  CHORD_FORMULAS,
  type NoteName,
  type ChordQuality,
  type Chord,
  type ChordTones,
} from './chordCalculator';

// Voicing templates and progressions
export {
  SHELL_POSITION_A,
  SHELL_POSITION_B,
  OPEN_VOICING,
  ALL_TEMPLATES,
  SHELL_A_PROGRESSION,
  SHELL_B_PROGRESSION,
  OPEN_VOICING_PROGRESSION,
  PROGRESSIONS,
  type Octave,
  type Note,
  type VoicingRole,
  type VoicingTemplate,
  type VoicedChord,
} from './voicingTemplates';

