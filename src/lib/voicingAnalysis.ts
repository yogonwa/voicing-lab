/**
 * Voicing Analysis Module
 * 
 * Analyzes voicings for potential problems and provides actionable warnings.
 * Categories: playability, harmony, voicing quality
 */

import type { Note, VoicingRole } from './voicingTemplates';
import type { ChordQuality } from './chordCalculator';
import type { PlaygroundBlock } from '../components/ChordExplorer/playgroundUtils';
import { parseNote, toMidi } from './noteUtils';
import { INTERVALS, VOICING_LIMITS, BASS_REGISTER } from './musicConstants';

export interface VoicingWarning {
  id: string;
  severity: 'error' | 'warning' | 'suggestion';
  category: 'playability' | 'harmony' | 'voicing';
  message: string;
  explanation: string;
  suggestion?: string;
}

/**
 * Analyze a voicing for quality issues and return actionable warnings.
 * 
 * Performs comprehensive analysis across three categories:
 * - **Playability**: Note count, hand span, dense clusters
 * - **Harmony**: Guide tones, bass register clarity, alteration clashes
 * - **Voice Leading**: Gaps, spread, balance
 * 
 * @param blocks - Playground blocks representing the voicing structure
 * @param voicedNotes - Actual notes with octaves (e.g., ['C3', 'E4', 'B♭4'])
 * @param quality - Chord quality for context-aware harmonic analysis
 * @returns Array of warnings sorted by severity (errors → warnings → suggestions)
 * 
 * @example
 * ```typescript
 * const warnings = analyzeVoicing(
 *   playgroundBlocks,
 *   ['C3', 'E4', 'B♭4', 'D5'],
 *   'dom7'
 * );
 * 
 * warnings.forEach(w => {
 *   console.log(`[${w.severity}] ${w.message}`);
 *   console.log(`  ${w.explanation}`);
 *   if (w.suggestion) console.log(`  💡 ${w.suggestion}`);
 * });
 * ```
 */
export function analyzeVoicing(
  blocks: PlaygroundBlock[],
  voicedNotes: Note[],
  quality: ChordQuality
): VoicingWarning[] {
  const warnings: VoicingWarning[] = [];
  const enabledBlocks = blocks.filter(b => b.enabled);

  // Convert notes to MIDI for interval calculations
  const midiNotes = voicedNotes.map(note => toMidi(note)).sort((a, b) => a - b);
  
  if (midiNotes.length === 0) return warnings;

  // Playability checks
  warnings.push(...checkPlayability(enabledBlocks, midiNotes));
  
  // Harmonic checks
  warnings.push(...checkHarmony(enabledBlocks, midiNotes, quality));
  
  // Voice leading suggestions
  warnings.push(...checkVoiceLeading(midiNotes));

  return warnings;
}

/**
 * Check playability issues (too many notes, wide intervals, clusters)
 */
function checkPlayability(blocks: PlaygroundBlock[], midiNotes: number[]): VoicingWarning[] {
  const warnings: VoicingWarning[] = [];

  // Too many notes
  if (blocks.length > VOICING_LIMITS.MAX_PLAYABLE_NOTES) {
    warnings.push({
      id: 'too-many-notes',
      severity: 'warning',
      category: 'playability',
      message: 'Too many notes to play comfortably',
      explanation: `More than ${VOICING_LIMITS.MAX_PLAYABLE_NOTES} notes is difficult to voice on piano.`,
      suggestion: 'Try removing less essential notes (like the 5th or root).',
    });
  } else if (blocks.length > VOICING_LIMITS.MAX_COMFORTABLE_NOTES) {
    warnings.push({
      id: 'many-notes',
      severity: 'suggestion',
      category: 'playability',
      message: 'Many notes for one hand',
      explanation: `${VOICING_LIMITS.MAX_COMFORTABLE_NOTES}+ notes typically requires two hands.`,
      suggestion: 'Consider if this is a two-hand voicing.',
    });
  }

  // Wide interval (>10th)
  if (midiNotes.length >= 2) {
    const span = midiNotes[midiNotes.length - 1] - midiNotes[0];
    
    if (span > VOICING_LIMITS.MAX_HAND_SPAN_SEMITONES + 2) {
      warnings.push({
        id: 'wide-span',
        severity: 'suggestion',
        category: 'playability',
        message: 'Wide interval span',
        explanation: `Span of ${span} semitones is difficult for one hand.`,
        suggestion: 'This voicing likely requires two hands.',
      });
    }
  }

  // Dense clusters (multiple notes within minor 3rd)
  for (let i = 0; i < midiNotes.length - 2; i++) {
    const interval1 = midiNotes[i + 1] - midiNotes[i];
    const interval2 = midiNotes[i + 2] - midiNotes[i + 1];
    
    if (interval1 <= VOICING_LIMITS.CLUSTER_THRESHOLD && interval2 <= VOICING_LIMITS.CLUSTER_THRESHOLD) {
      warnings.push({
        id: 'dense-cluster',
        severity: 'warning',
        category: 'playability',
        message: 'Dense note cluster',
        explanation: 'Three notes within a narrow range can be hard to voice clearly.',
        suggestion: 'Spread the notes wider for better clarity.',
      });
      break; // Only warn once
    }
  }

  return warnings;
}

/**
 * Check harmonic issues (missing guide tones, muddy bass, dissonant alterations)
 */
function checkHarmony(
  blocks: PlaygroundBlock[],
  midiNotes: number[],
  quality: ChordQuality
): VoicingWarning[] {
  const warnings: VoicingWarning[] = [];
  const roles = blocks.map(b => b.voicingRole);

  // Missing guide tones (3rd and 7th)
  const hasThird = roles.includes('third');
  const hasSeventh = roles.includes('seventh');
  
  if (!hasThird && !hasSeventh) {
    warnings.push({
      id: 'missing-guide-tones',
      severity: 'error',
      category: 'harmony',
      message: 'Missing 3rd AND 7th',
      explanation: 'The 3rd defines quality (major/minor), the 7th defines chord type. Both are essential.',
      suggestion: 'Include at least one guide tone (3rd or 7th).',
    });
  } else if (!hasThird) {
    warnings.push({
      id: 'missing-third',
      severity: 'warning',
      category: 'harmony',
      message: 'Missing 3rd',
      explanation: 'The 3rd defines major/minor quality.',
      suggestion: 'Add the 3rd to clarify harmonic identity.',
    });
  } else if (!hasSeventh) {
    warnings.push({
      id: 'missing-seventh',
      severity: 'suggestion',
      category: 'harmony',
      message: 'Missing 7th',
      explanation: 'The 7th defines the chord type and adds color.',
      suggestion: 'Consider adding the 7th for fuller harmony.',
    });
  }

  // Muddy bass (close intervals below C3)
  const bassNotes = midiNotes.filter(midi => midi <= BASS_REGISTER.UPPER_LIMIT_MIDI);
  
  if (bassNotes.length >= 2) {
    for (let i = 0; i < bassNotes.length - 1; i++) {
      const interval = bassNotes[i + 1] - bassNotes[i];
      if (interval < BASS_REGISTER.MIN_BASS_INTERVAL) {
        warnings.push({
          id: 'muddy-bass',
          severity: 'warning',
          category: 'harmony',
          message: 'Close intervals in bass register',
          explanation: 'Notes below C3 sound muddy when stacked closely.',
          suggestion: 'Spread the lower notes wider, or use only root in bass.',
        });
        break;
      }
    }
  }

  // Root not lowest (when root is enabled but not leftmost)
  const hasRoot = roles.includes('root');
  const rootIsFirst = roles[0] === 'root';
  
  if (hasRoot && !rootIsFirst && blocks.length > 2) {
    warnings.push({
      id: 'root-not-lowest',
      severity: 'suggestion',
      category: 'harmony',
      message: 'Root note is not the lowest',
      explanation: 'Having the root in the bass provides the strongest harmonic foundation.',
      suggestion: 'Drag the root to the leftmost position for clearer harmony.',
    });
  }

  // Dissonant alterations for chord quality
  if (quality === 'maj7') {
    if (roles.includes('flatNinth')) {
      warnings.push({
        id: 'alteration-clash-b9-maj7',
        severity: 'error',
        category: 'harmony',
        message: '♭9 clashes with major 7th',
        explanation: 'Flat 9th creates a dissonant minor 9th interval against the major 7th.',
        suggestion: 'Use natural 9th or ♯9 instead, or switch to dominant 7th.',
      });
    }
    if (roles.includes('eleventh')) {
      warnings.push({
        id: 'avoid-11-maj7',
        severity: 'warning',
        category: 'harmony',
        message: 'Natural 11th clashes with major 3rd',
        explanation: 'The natural 11th is a half-step above the major 3rd, creating dissonance.',
        suggestion: 'Use ♯11 (Lydian sound) or omit the 11th.',
      });
    }
  }

  if (quality === 'dom7') {
    if (roles.includes('eleventh')) {
      warnings.push({
        id: 'avoid-11-dom7',
        severity: 'warning',
        category: 'harmony',
        message: 'Natural 11th clashes with major 3rd',
        explanation: 'The natural 11th is a half-step above the major 3rd.',
        suggestion: 'Use ♯11 for altered dominant sound, or omit the 11th.',
      });
    }
  }

  if (quality === 'min7' || quality === 'min7b5') {
    if (roles.includes('thirteenth')) {
      warnings.push({
        id: 'avoid-13-minor',
        severity: 'suggestion',
        category: 'harmony',
        message: 'Natural 13th can sound bright in minor context',
        explanation: 'The natural 13th conflicts with the minor tonality.',
        suggestion: 'Use ♭13 for darker sound, or omit the 13th.',
      });
    }
  }

  return warnings;
}

/**
 * Check voice leading quality (gaps, spread, sparseness)
 */
function checkVoiceLeading(midiNotes: number[]): VoicingWarning[] {
  const warnings: VoicingWarning[] = [];

  if (midiNotes.length < 2) return warnings;

  // Calculate intervals between adjacent voices
  const intervals: number[] = [];
  for (let i = 0; i < midiNotes.length - 1; i++) {
    intervals.push(midiNotes[i + 1] - midiNotes[i]);
  }

  // Wide gaps (>octave jump between adjacent voices)
  const largeGaps = intervals.filter(interval => interval > INTERVALS.OCTAVE);
  if (largeGaps.length > 0) {
    const maxGap = Math.max(...largeGaps);
    warnings.push({
      id: 'wide-gap',
      severity: 'suggestion',
      category: 'voicing',
      message: 'Large gap between voices',
      explanation: `Gap of ${maxGap} semitones creates empty space in the voicing.`,
      suggestion: 'Consider filling the gap with another note, or accepting the open sound.',
    });
  }

  // Unbalanced spread (tight cluster then big jump)
  if (intervals.length >= 2) {
    const minInterval = Math.min(...intervals);
    const maxInterval = Math.max(...intervals);
    
    if (maxInterval > minInterval * 4 && minInterval <= VOICING_LIMITS.CLUSTER_THRESHOLD) {
      warnings.push({
        id: 'unbalanced-spread',
        severity: 'suggestion',
        category: 'voicing',
        message: 'Unbalanced voice spacing',
        explanation: 'Some voices are very close together while others are far apart.',
        suggestion: 'Aim for more even spacing between voices.',
      });
    }
  }

  // Too sparse (only 2 notes with wide spread)
  if (midiNotes.length === 2) {
    const span = midiNotes[1] - midiNotes[0];
    if (span > INTERVALS.OCTAVE) {
      warnings.push({
        id: 'sparse-voicing',
        severity: 'suggestion',
        category: 'voicing',
        message: 'Sparse voicing with only 2 notes',
        explanation: 'Two notes spread wide can sound empty.',
        suggestion: 'Add a note in between for richer harmony, or accept the minimalist sound.',
      });
    }
  }

  return warnings;
}

/**
 * Check if the minimum block requirement is met for a valid voicing.
 * 
 * A voicing needs at least 2 notes to create harmony. This function returns
 * an error-level warning if the requirement is not met.
 * 
 * @param enabledCount - Number of enabled blocks in the playground
 * @returns Warning object if requirement not met, null otherwise
 * 
 * @example
 * ```typescript
 * const warning = checkMinimumBlocks(1);
 * if (warning) {
 *   console.error(warning.message); // "At least 2 notes required"
 * }
 * ```
 */
export function checkMinimumBlocks(enabledCount: number): VoicingWarning | null {
  if (enabledCount < 2) {
    return {
      id: 'min-blocks',
      severity: 'error',
      category: 'playability',
      message: 'At least 2 notes required',
      explanation: 'A voicing needs at least two notes to create harmony.',
      suggestion: 'Select more notes from the selector above.',
    };
  }
  return null;
}

