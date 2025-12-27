/**
 * Jazz Voicing Pattern Library
 * 
 * Comprehensive collection of recognizable jazz piano voicing patterns
 * with educational content explaining why they work and when to use them.
 */

import type { VoicingRole } from './voicingTemplates';
import type { ChordFunction } from './chordCalculator';

export interface VoicingPattern {
  id: string;
  name: string;
  pattern: VoicingRole[]; // Core pattern sequence (ordered)
  flexiblePattern?: boolean; // Can match with extra notes
  category: 'shell' | 'rootless' | 'spread' | 'inversion' | 'slash';
  description: string;
  whyItWorks: string;
  commonUse: string;
  caution?: string;
  recommendedFor?: ChordFunction[];
  soundCharacter?: string;
}

/**
 * Complete library of recognizable voicing patterns
 */
export const VOICING_PATTERNS: VoicingPattern[] = [
  // ============================================
  // SHELL VOICINGS
  // ============================================
  {
    id: 'shell-a',
    name: 'Shell Position A',
    pattern: ['root', 'third', 'seventh'],
    flexiblePattern: true,
    category: 'shell',
    description: 'Root in bass, guide tones (3rd and 7th) on top',
    whyItWorks: 'The 3rd defines major/minor quality, the 7th defines the chord type. These two essential notes create the chord\'s harmonic identity.',
    commonUse: 'Left-hand comping when bassist covers root. Essential for practicing smooth voice leading.',
    soundCharacter: 'Clean and focused',
    recommendedFor: ['ii', 'V', 'I'],
    caution: 'Sounds sparse alone - usually paired with extensions or melody.',
  },
  {
    id: 'shell-b',
    name: 'Shell Position B',
    pattern: ['root', 'seventh', 'third'],
    flexiblePattern: true,
    category: 'shell',
    description: 'Root in bass with inverted guide tones (7th below 3rd)',
    whyItWorks: 'Inverted guide tones create smooth voice leading when alternating with Shell A.',
    commonUse: 'Alternates with Shell A for stepwise voice leading through progressions.',
    soundCharacter: 'Clean and focused',
    recommendedFor: ['ii', 'V', 'I'],
  },
  {
    id: 'shell-a-9',
    name: 'Shell A with 9th',
    pattern: ['root', 'third', 'seventh', 'ninth'],
    flexiblePattern: true,
    category: 'shell',
    description: 'Shell A voicing with added 9th extension',
    whyItWorks: 'The 9th adds color and fullness without cluttering the voicing.',
    commonUse: 'Comping with more harmonic richness than basic shells.',
    soundCharacter: 'Warm and full',
    recommendedFor: ['ii', 'V', 'I'],
  },
  {
    id: 'shell-altered',
    name: 'Shell Altered',
    pattern: ['root', 'third', 'seventh', 'flatNinth', 'sharpEleventh'],
    flexiblePattern: false,
    category: 'shell',
    description: 'Shell voicing with tension notes (♭9 and ♯11)',
    whyItWorks: 'Alterations create strong tension that resolves beautifully to the I chord.',
    commonUse: 'Dominant 7th chords (V7) in jazz, especially in ii-V-I progressions.',
    soundCharacter: 'Tense and colorful',
    recommendedFor: ['V'],
    caution: 'Only works on dominant 7th chords - sounds dissonant on other qualities.',
  },

  // ============================================
  // ROOTLESS VOICINGS
  // ============================================
  {
    id: 'rootless-a',
    name: 'Rootless A',
    pattern: ['third', 'fifth', 'seventh', 'ninth'],
    flexiblePattern: true,
    category: 'rootless',
    description: 'Classic rootless voicing without root note',
    whyItWorks: 'When the bassist plays the root, the pianist can focus on guide tones and extensions for richer harmony.',
    commonUse: 'Standard in jazz combo settings. Right hand voicing when left hand walks bass.',
    soundCharacter: 'Rich and modern',
    recommendedFor: ['ii', 'V', 'I'],
  },
  {
    id: 'rootless-b',
    name: 'Rootless B',
    pattern: ['seventh', 'ninth', 'third', 'fifth'],
    flexiblePattern: true,
    category: 'rootless',
    description: 'Inverted rootless voicing',
    whyItWorks: 'Provides smooth voice leading when alternating with Rootless A through chord changes.',
    commonUse: 'Alternates with Rootless A for stepwise motion in progressions.',
    soundCharacter: 'Rich and modern',
    recommendedFor: ['ii', 'V', 'I'],
  },
  {
    id: 'rootless-a-6',
    name: 'Rootless A with 6th',
    pattern: ['third', 'thirteenth', 'seventh', 'ninth'],
    flexiblePattern: false,
    category: 'rootless',
    description: 'Rootless A with 6th (13th) instead of 5th',
    whyItWorks: 'The 6th/13th adds brightness and avoids the perfect 5th which can sound plain.',
    commonUse: 'Major 7th and dominant 7th chords for a brighter, more colorful sound.',
    soundCharacter: 'Bright and colorful',
    recommendedFor: ['V', 'I'],
  },
  {
    id: 'rootless-b-6',
    name: 'Rootless B with 6th',
    pattern: ['seventh', 'ninth', 'third', 'thirteenth'],
    flexiblePattern: false,
    category: 'rootless',
    description: 'Rootless B with 6th (13th) instead of 5th',
    whyItWorks: 'Inverted version adds 6th/13th for color while maintaining smooth voice leading.',
    commonUse: 'Alternates with Rootless A with 6th for colorful progressions.',
    soundCharacter: 'Bright and colorful',
    recommendedFor: ['V', 'I'],
  },

  // ============================================
  // SPREAD VOICINGS
  // ============================================
  {
    id: 'open',
    name: 'Open Voicing',
    pattern: ['root', 'fifth', 'third', 'seventh'],
    flexiblePattern: true,
    category: 'spread',
    description: 'Spread voicing with wide intervals',
    whyItWorks: 'Opens up the voicing for better clarity and balanced sound across the keyboard.',
    commonUse: 'Solo piano, ballads, or when you want a fuller, more spacious sound.',
    soundCharacter: 'Open and spacious',
    recommendedFor: ['ii', 'V', 'I'],
  },
  {
    id: 'drop-2',
    name: 'Drop-2 Voicing',
    pattern: ['fifth', 'root', 'third', 'seventh'],
    flexiblePattern: true,
    category: 'spread',
    description: 'Close-position chord with 2nd voice from top dropped an octave',
    whyItWorks: 'Opens up the voicing for better clarity and balanced intervals. Creates comfortable hand span without muddy bass.',
    commonUse: 'Standard for comping, melody harmonization, and solo piano. Essential in bebop and modern jazz.',
    soundCharacter: 'Balanced and clear',
    recommendedFor: ['ii', 'V', 'I'],
  },
  {
    id: 'drop-2-rootless',
    name: 'Drop-2 Rootless',
    pattern: ['seventh', 'third', 'fifth', 'ninth'],
    flexiblePattern: true,
    category: 'spread',
    description: 'Drop-2 voicing without root',
    whyItWorks: 'Combines the clarity of drop-2 with the richness of rootless voicings.',
    commonUse: 'Combo playing when bassist covers the root.',
    soundCharacter: 'Clear and modern',
    recommendedFor: ['ii', 'V', 'I'],
  },

  // ============================================
  // INVERSIONS - Triads
  // ============================================
  {
    id: 'triad-first-inversion',
    name: 'Triad 1st Inversion',
    pattern: ['third', 'fifth', 'root'],
    flexiblePattern: false,
    category: 'inversion',
    description: 'Triad with 3rd in the bass',
    whyItWorks: 'Provides smooth bass motion and lighter sound than root position.',
    commonUse: 'Melodic bass lines, passing chords, or when you want a less grounded sound.',
    soundCharacter: 'Light and mobile',
    caution: 'Can sound unstable without bassist covering root.',
  },
  {
    id: 'triad-second-inversion',
    name: 'Triad 2nd Inversion',
    pattern: ['fifth', 'root', 'third'],
    flexiblePattern: false,
    category: 'inversion',
    description: 'Triad with 5th in the bass',
    whyItWorks: 'Creates tension that typically resolves to root position or first inversion.',
    commonUse: 'Passing chords, suspensions, or temporary instability.',
    soundCharacter: 'Unstable and transitional',
    caution: 'Very unstable - typically functions as a passing or suspension chord.',
  },

  // ============================================
  // INVERSIONS - 7th Chords
  // ============================================
  {
    id: '7th-first-inversion',
    name: '7th Chord 1st Inversion',
    pattern: ['third', 'fifth', 'seventh', 'root'],
    flexiblePattern: true,
    category: 'inversion',
    description: '7th chord with 3rd in the bass',
    whyItWorks: 'Creates smooth bass motion while maintaining full 7th chord harmony.',
    commonUse: 'Voice leading through progressions with stepwise bass.',
    soundCharacter: 'Smooth and mobile',
  },
  {
    id: '7th-second-inversion',
    name: '7th Chord 2nd Inversion',
    pattern: ['fifth', 'seventh', 'root', 'third'],
    flexiblePattern: true,
    category: 'inversion',
    description: '7th chord with 5th in the bass',
    whyItWorks: 'Less common inversion that creates a different color.',
    commonUse: 'Voice leading, chromatic bass lines.',
    soundCharacter: 'Unusual and colorful',
    caution: 'Less stable than root or 1st inversion.',
  },
  {
    id: '7th-third-inversion',
    name: '7th Chord 3rd Inversion',
    pattern: ['seventh', 'root', 'third', 'fifth'],
    flexiblePattern: true,
    category: 'inversion',
    description: '7th chord with 7th in the bass',
    whyItWorks: 'Strong pull to resolve down by half-step, especially in dominant chords.',
    commonUse: 'Voice leading when you want the 7th to resolve down to the 3rd of the next chord.',
    soundCharacter: 'Tense with strong resolution tendency',
  },

  // ============================================
  // SLASH CHORDS
  // ============================================
  {
    id: 'slash-third',
    name: 'Slash Chord - 3rd in Bass',
    pattern: ['third'], // Just check for 3rd lowest
    flexiblePattern: true,
    category: 'slash',
    description: 'Chord with 3rd in the bass (e.g., Cmaj7/E)',
    whyItWorks: 'Creates smooth bass motion and lighter harmony than root position.',
    commonUse: 'Melodic bass lines, creating passing motion between chords.',
    soundCharacter: 'Light and mobile',
    caution: 'Mark as slash chord in lead sheets (e.g., C/E) to communicate intention.',
  },
  {
    id: 'slash-fifth',
    name: 'Slash Chord - 5th in Bass',
    pattern: ['fifth'], // Just check for 5th lowest
    flexiblePattern: true,
    category: 'slash',
    description: 'Chord with 5th in the bass (e.g., Cmaj7/G)',
    whyItWorks: 'Provides strong harmonic foundation while adding bass variety.',
    commonUse: 'Power position for climactic moments, or to create pedal points.',
    soundCharacter: 'Strong and stable',
  },
  {
    id: 'slash-seventh',
    name: 'Slash Chord - 7th in Bass',
    pattern: ['seventh'], // Just check for 7th lowest
    flexiblePattern: true,
    category: 'slash',
    description: 'Chord with 7th in the bass (e.g., Cmaj7/B)',
    whyItWorks: 'Creates strong pull to resolve, especially on dominant chords.',
    commonUse: 'Leading into the next chord when the 7th resolves down.',
    soundCharacter: 'Tense with resolution tendency',
  },
];

/**
 * Get all pattern IDs from the library.
 * 
 * Useful for testing, validation, and building pattern selection UIs.
 * 
 * @returns Array of all pattern IDs
 * 
 * @example
 * ```typescript
 * const ids = getAllPatternIds();
 * // ['shell-a', 'shell-b', 'rootless-a', ...]
 * ```
 */
export function getAllPatternIds(): string[] {
  return VOICING_PATTERNS.map(p => p.id);
}

/**
 * Get a specific pattern by its unique ID.
 * 
 * @param id - The pattern ID to look up
 * @returns The pattern object, or undefined if not found
 * 
 * @example
 * ```typescript
 * const pattern = getPatternById('shell-a');
 * if (pattern) {
 *   console.log(pattern.name); // "Shell Position A"
 *   console.log(pattern.whyItWorks);
 * }
 * ```
 */
export function getPatternById(id: string): VoicingPattern | undefined {
  return VOICING_PATTERNS.find(p => p.id === id);
}

/**
 * Get all patterns in a specific category.
 * 
 * Categories organize patterns by structural type:
 * - `shell`: Basic root-3rd-7th voicings
 * - `rootless`: Voicings without the root
 * - `spread`: Drop-2, drop-3, and wide voicings
 * - `inversion`: Non-root bass notes
 * - `slash`: Specific bass notes (3rd, 5th, 7th)
 * 
 * @param category - The category to filter by
 * @returns Array of patterns in that category
 * 
 * @example
 * ```typescript
 * const shellVoicings = getPatternsByCategory('shell');
 * // [Shell A, Shell B, Shell with 9th, ...]
 * 
 * const rootlessVoicings = getPatternsByCategory('rootless');
 * // [Rootless A, Rootless B, ...]
 * ```
 */
export function getPatternsByCategory(category: VoicingPattern['category']): VoicingPattern[] {
  return VOICING_PATTERNS.filter(p => p.category === category);
}

