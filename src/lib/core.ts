/**
 * Core (pure) library exports.
 *
 * This file intentionally excludes the audio engine so that importing core
 * music theory/utilities never drags in Tone.js (ESM) or browser-only APIs.
 */

// Chord tone calculation + extension logic
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
  findNextNoteUp,
  buildClosePosition,
} from './voicingGenerator';

// Extension configuration (for Chord Explorer)
export {
  AVAILABLE_EXTENSIONS,
  EXTENSION_LABELS,
  EXTENSION_TIPS,
  getExtensionsByGroup,
  createEmptyExtensions,
  getActiveExtensionKeys,
  buildChordSymbol,
  getDisplayChordSymbol,
  type ExtensionKey,
  type SelectedExtensions,
  type ExtensionOption,
} from './extensionConfig';

// Extension helpers (pure)
export {
  DEFAULT_EXTENSION_RENDER_ORDER,
  getNoteNameForExtensionKey,
  getVoicingRoleForExtensionKey,
  getVoicingRoleForNoteName,
} from './extensionUtils';

// Note helpers (pure)
export {
  parseNote,
  getNoteChroma,
  toMidi,
  formatVoicingRole,
} from './noteUtils';

// Music theory constants
export {
  INTERVALS,
  MIDI_NOTES,
  VOICING_LIMITS,
  BASS_REGISTER,
} from './musicConstants';

// Voicing analysis (warnings and quality checks)
export {
  analyzeVoicing,
  checkMinimumBlocks,
  type VoicingWarning,
} from './voicingAnalysis';

// Pattern recognition
export {
  detectVoicingPattern,
  getPatternDescription,
  getPatternsByCategory as getPatternsByCategoryRecognition,
  type DetectedPattern,
} from './voicingRecognition';

// Pattern library
export {
  VOICING_PATTERNS,
  getAllPatternIds,
  getPatternById,
  getPatternsByCategory as getPatternsByCategoryLibrary,
  type VoicingPattern,
} from './patterns';


