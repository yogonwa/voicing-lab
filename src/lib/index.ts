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
  getExtendedChordTones,
  getRecommendedExtensions,
  getSafeExtensions,
  shouldAvoidExtension,
  CHROMATIC_SCALE,
  CHORD_FORMULAS,
  EXTENSION_INTERVALS,
  ALTERATION_INTERVALS,
  AVOID_EXTENSIONS,
  SAFE_EXTENSIONS,
  EXTENSION_RECOMMENDATIONS,
  type NoteName,
  type ChordQuality,
  type ChordFunction,
  type Chord,
  type ChordTones,
  type Extensions,
  type Alterations,
  type ExtendedChordTones,
} from './chordCalculator';

// Voicing templates and progressions
export {
  // Basic templates
  SHELL_POSITION_A,
  SHELL_POSITION_B,
  OPEN_VOICING,
  // Extended templates
  SHELL_WITH_NINTH,
  SHELL_WITH_THIRTEENTH,
  OPEN_WITH_NINTH,
  // Template collections
  BASIC_TEMPLATES,
  EXTENDED_TEMPLATES,
  ALL_TEMPLATES,
  // Basic progressions
  SHELL_A_PROGRESSION,
  SHELL_B_PROGRESSION,
  OPEN_VOICING_PROGRESSION,
  // Extended progressions
  SHELL_9_PROGRESSION,
  SHELL_13_PROGRESSION,
  OPEN_9_PROGRESSION,
  // Progression map
  PROGRESSIONS,
  // Types
  type Octave,
  type Note,
  type BasicRole,
  type ExtensionRole,
  type AlterationRole,
  type VoicingRole,
  type VoicingCategory,
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

