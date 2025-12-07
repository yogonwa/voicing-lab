/**
 * Voicing Lab - Core Music Theory Library
 *
 * This module provides the foundational music theory calculations
 * for generating jazz piano voicings.
 *
 * Architecture (3-layer system):
 * - chordCalculator: Layer 1 - Calculates chord tones (WHAT notes)
 * - voicingTemplates: Layer 2 - Defines voicing patterns (WHICH hand plays what)
 * - voicingGenerator: Layer 3 - Produces playable voicings (WHERE on piano)
 * - audioEngine: Plays voicings using Tone.js piano samples
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

// Voicing generator (combines chords + templates)
export {
  generateVoicing,
  generateProgression,
  transposeNote,
  transposeVoicing,
} from './voicingGenerator';

// Audio engine (Tone.js)
export {
  initAudio,
  isAudioReady,
  isAudioLoading,
  playVoicing,
  playProgression,
  stopAll,
  disposeAudio,
} from './audioEngine';

