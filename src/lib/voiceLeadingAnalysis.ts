/**
 * Voice Leading Analysis Module
 *
 * Analyzes voice motion between consecutive chords and scores voicing submissions.
 * Used by the Voice Leading Trainer to provide educational feedback.
 */

import type { Note } from './voicingTemplates';
import type { PlaygroundBlock } from '../components/ChordExplorer/playgroundUtils';
import { toMidi } from './noteUtils';
import { detectVoicingPattern } from './voicingRecognition';
import { analyzeVoicing, type VoicingWarning } from './voicingAnalysis';
import type { ChordQuality } from './chordCalculator';

/**
 * Describes the motion of a single voice from one chord to the next.
 */
export interface VoiceMotion {
  fromNote: Note;
  toNote: Note;
  interval: number;           // semitones (negative = down, positive = up)
  motionType: 'common-tone' | 'half-step' | 'whole-step' | 'small-leap' | 'large-leap';
}

/**
 * Analysis of voice motion between two voicings.
 */
export interface VoiceMotionAnalysis {
  motions: VoiceMotion[];
  commonTones: number;
  halfSteps: number;
  wholeSteps: number;
  smallLeaps: number;         // 3-4 semitones
  largeLeaps: number;         // 5+ semitones
  smoothnessScore: number;    // 0-50 (motion component only)
}

/**
 * Complete score breakdown for a voicing submission.
 */
export interface VoicingScore {
  total: number;              // 0-100
  motionScore: number;        // 0-50
  patternBonus: number;       // 0-30
  playabilityScore: number;   // 0-20
  motionAnalysis: VoiceMotionAnalysis;
  patternName: string | null;
  warnings: VoicingWarning[];
}

/**
 * Classify an interval by its voice leading quality.
 */
function classifyMotion(interval: number): VoiceMotion['motionType'] {
  const absInterval = Math.abs(interval);

  if (absInterval === 0) return 'common-tone';
  if (absInterval === 1) return 'half-step';
  if (absInterval === 2) return 'whole-step';
  if (absInterval <= 4) return 'small-leap';
  return 'large-leap';
}

/**
 * Analyze voice motion between two voicings.
 *
 * Uses a simple voice matching strategy: pairs notes by proximity
 * (closest available note in the target voicing).
 *
 * @param fromNotes - Notes of the previous chord
 * @param toNotes - Notes of the current chord being analyzed
 * @returns Voice motion analysis with counts and smoothness score
 *
 * @example
 * ```typescript
 * const analysis = analyzeVoiceMotion(
 *   ['C4', 'E4', 'B4'],  // Previous chord (Dm7 shell)
 *   ['B3', 'F4', 'A4']   // Current chord (G7 shell)
 * );
 *
 * console.log(`Common tones: ${analysis.commonTones}`);
 * console.log(`Half-steps: ${analysis.halfSteps}`);
 * console.log(`Smoothness: ${analysis.smoothnessScore}/50`);
 * ```
 */
export function analyzeVoiceMotion(fromNotes: Note[], toNotes: Note[]): VoiceMotionAnalysis {
  const motions: VoiceMotion[] = [];
  let commonTones = 0;
  let halfSteps = 0;
  let wholeSteps = 0;
  let smallLeaps = 0;
  let largeLeaps = 0;

  // Convert to MIDI for distance calculations
  const fromMidi = fromNotes.map(n => ({ note: n, midi: toMidi(n) }));
  const toMidi_ = toNotes.map(n => ({ note: n, midi: toMidi(n) }));

  // Track which target notes have been matched
  const matchedTargets = new Set<number>();

  // For each source note, find the closest unmatched target
  for (const from of fromMidi) {
    let bestMatch: { note: Note; midi: number; index: number } | null = null;
    let bestDistance = Infinity;

    for (let i = 0; i < toMidi_.length; i++) {
      if (matchedTargets.has(i)) continue;

      const distance = Math.abs(toMidi_[i].midi - from.midi);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = { ...toMidi_[i], index: i };
      }
    }

    if (bestMatch) {
      matchedTargets.add(bestMatch.index);
      const interval = bestMatch.midi - from.midi;
      const motionType = classifyMotion(interval);

      motions.push({
        fromNote: from.note,
        toNote: bestMatch.note,
        interval,
        motionType,
      });

      // Count motion types
      switch (motionType) {
        case 'common-tone': commonTones++; break;
        case 'half-step': halfSteps++; break;
        case 'whole-step': wholeSteps++; break;
        case 'small-leap': smallLeaps++; break;
        case 'large-leap': largeLeaps++; break;
      }
    }
  }

  // Calculate smoothness score (0-50)
  // Start with 50 points, then apply penalties/bonuses
  let smoothnessScore = 50;

  // Bonus for common tones (max +6)
  smoothnessScore += Math.min(commonTones * 2, 6);

  // Penalties
  smoothnessScore -= wholeSteps * 2;
  smoothnessScore -= smallLeaps * 5;
  smoothnessScore -= largeLeaps * 10;

  // Clamp to 0-50
  smoothnessScore = Math.max(0, Math.min(50, smoothnessScore));

  return {
    motions,
    commonTones,
    halfSteps,
    wholeSteps,
    smallLeaps,
    largeLeaps,
    smoothnessScore,
  };
}

/**
 * Calculate pattern bonus based on detected voicing pattern.
 *
 * @param blocks - Playground blocks representing the built voicing
 * @returns Pattern bonus (0-30) and pattern name
 */
function calculatePatternBonus(blocks: PlaygroundBlock[]): { bonus: number; name: string | null } {
  const detected = detectVoicingPattern(blocks);

  if (!detected) {
    return { bonus: 0, name: null };
  }

  // Exact matches get full 30 points
  // Fuzzy matches scale based on confidence (60-95% -> 18-28 points)
  if (detected.matchType === 'exact') {
    return { bonus: 30, name: detected.name };
  }

  // Fuzzy: scale 60-95% confidence to 18-28 points
  const fuzzyBonus = Math.round((detected.confidence / 100) * 30);
  return { bonus: Math.max(18, fuzzyBonus), name: `${detected.name} (variation)` };
}

/**
 * Calculate playability score based on voicing analysis warnings.
 *
 * @param warnings - Warnings from voicing analysis
 * @returns Playability score (0-20)
 */
function calculatePlayabilityScore(warnings: VoicingWarning[]): number {
  let score = 20;

  for (const warning of warnings) {
    if (warning.category === 'playability') {
      if (warning.severity === 'error') score -= 10;
      else if (warning.severity === 'warning') score -= 5;
      else score -= 2; // suggestion
    }
  }

  return Math.max(0, score);
}

/**
 * Score a voicing submission for the Voice Leading Trainer.
 *
 * Combines three scoring components:
 * - **Voice Motion (0-50)**: Rewards smooth voice leading (common tones, half-steps)
 * - **Pattern Bonus (0-30)**: Rewards recognized jazz voicing patterns
 * - **Playability (0-20)**: Rewards comfortable hand positions
 *
 * @param previousNotes - Notes from the locked/previous chord
 * @param currentBlocks - Playground blocks for the submitted voicing
 * @param currentNotes - Notes of the submitted voicing
 * @param chordQuality - Quality of the target chord (for harmonic analysis)
 * @returns Complete score breakdown
 *
 * @example
 * ```typescript
 * const score = scoreVoicingSubmission(
 *   ['C4', 'E4', 'B4'],           // Previous Dm7
 *   g7Blocks,                      // User's G7 blocks
 *   ['B3', 'F4', 'A4'],           // User's G7 notes
 *   'dom7'
 * );
 *
 * console.log(`Total: ${score.total}/100`);
 * console.log(`Motion: ${score.motionScore}/50`);
 * console.log(`Pattern: ${score.patternBonus}/30 (${score.patternName})`);
 * console.log(`Playability: ${score.playabilityScore}/20`);
 * ```
 */
export function scoreVoicingSubmission(
  previousNotes: Note[],
  currentBlocks: PlaygroundBlock[],
  currentNotes: Note[],
  chordQuality: ChordQuality
): VoicingScore {
  // Analyze voice motion
  const motionAnalysis = analyzeVoiceMotion(previousNotes, currentNotes);

  // Get pattern bonus
  const { bonus: patternBonus, name: patternName } = calculatePatternBonus(currentBlocks);

  // Get playability warnings and score
  const warnings = analyzeVoicing(currentBlocks, currentNotes, chordQuality);
  const playabilityScore = calculatePlayabilityScore(warnings);

  // Calculate total
  const total = motionAnalysis.smoothnessScore + patternBonus + playabilityScore;

  return {
    total,
    motionScore: motionAnalysis.smoothnessScore,
    patternBonus,
    playabilityScore,
    motionAnalysis,
    patternName,
    warnings,
  };
}

/**
 * Get a human-readable description of a voice motion.
 * Used for educational feedback display.
 *
 * @param motion - A single voice motion
 * @returns Formatted description string
 *
 * @example
 * ```typescript
 * describeMotion({ fromNote: 'C4', toNote: 'B3', interval: -1, motionType: 'half-step' })
 * // => "C4 → B3 (half-step down)"
 * ```
 */
export function describeMotion(motion: VoiceMotion): string {
  const direction = motion.interval > 0 ? 'up' : motion.interval < 0 ? 'down' : '';

  const motionDesc: Record<VoiceMotion['motionType'], string> = {
    'common-tone': 'held',
    'half-step': `half-step ${direction}`,
    'whole-step': `whole-step ${direction}`,
    'small-leap': `small leap ${direction}`,
    'large-leap': `large leap ${direction}`,
  };

  return `${motion.fromNote} → ${motion.toNote} (${motionDesc[motion.motionType]})`;
}
