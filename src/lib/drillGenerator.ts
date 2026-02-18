/**
 * Drill Generator
 *
 * Generates flashcard questions from chord data.
 * Uses plausible-misconception distractor strategy (not random chromatic).
 *
 * Distractor rules:
 *  1. Same root, different quality (quality confusion)
 *  2. Adjacent semitone from correct answer
 *  3. Never the root note
 *  4. Never enharmonic duplicate of correct answer
 */

import {
  CHROMATIC_SCALE,
  CHORD_FORMULAS,
  calculateNote,
  getChordTones,
  type NoteName,
  type ChordQuality,
} from './chordCalculator';
import { KEY_UNLOCK_ORDER } from './keyProgress';
import { enharmonicEquivalent } from './noteUtils';
import type { DrillType } from './spacedRepetition';
import { getChordSpelling } from './chordSpelling';

// ============================================
// TYPES
// ============================================

/** A display-friendly root name including flat spellings */
export type DisplayRootName = string;

export interface DrillQuestion {
  id: string;                      // e.g., "Cmaj7-third"
  rootDisplay: string;             // e.g., "Bb" (flat-friendly)
  quality: ChordQuality;
  drillType: DrillType;
  correctAnswer: string;           // display spelling
  correctAnswerAlt: string | null; // enharmonic alternate, or null
  options: string[];               // 4 options, shuffled, in display spelling
}

/** Convert a NoteName to display for root labels (not chord tones — use getChordSpelling for those) */
function rootToDisplay(noteName: NoteName): string {
  const DISPLAY: Partial<Record<NoteName, string>> = {
    'A#': 'Bb', 'D#': 'Eb', 'G#': 'Ab', 'C#': 'Db',
    // F# stays as F#
  };
  return DISPLAY[noteName] ?? noteName;
}

// ============================================
// ROOT DISPLAY NAMES
// ============================================

/**
 * Circle-of-fifths root order for new card introduction.
 * Derived from KEY_UNLOCK_ORDER (single source of truth),
 * then converted to conventional display names.
 */
export const CIRCLE_OF_FIFTHS_ROOTS: DisplayRootName[] = KEY_UNLOCK_ORDER.map(rootToDisplay);

/** Map display root name → NoteName (for chordCalculator) */
export const DISPLAY_TO_NOTE: Record<DisplayRootName, NoteName> = Object.fromEntries(
  KEY_UNLOCK_ORDER.map((note) => [rootToDisplay(note), note]),
) as Record<DisplayRootName, NoteName>;

// ============================================
// DISTRACTOR GENERATION
// ============================================

/** Get the parallel quality interval — flips major/minor for quality confusion distractors */
function getParallelQualityInterval(
  quality: ChordQuality,
  drillType: 'third' | 'seventh',
): number | null {
  if (drillType === 'third') {
    const current = CHORD_FORMULAS[quality].third;
    return current === 4 ? 3 : 4; // major 3rd ↔ minor 3rd
  } else {
    const current = CHORD_FORMULAS[quality].seventh;
    if (current === 11) return 10; // maj7 → dom/min 7th
    if (current === 10) return 11; // dom/min 7th → maj7
    if (current === 9) return 10;  // dim7 → half-dim 7th
    return null;
  }
}

/**
 * Generate plausible distractors for a 3rd or 7th drill.
 * Strategy: quality confusion + adjacent semitones.
 */
function generateDistractors(
  root: NoteName,
  correct: NoteName,
  quality: ChordQuality,
  drillType: 'third' | 'seventh',
  count: number = 3,
): string[] {
  const correctChroma = CHROMATIC_SCALE.indexOf(correct);
  const rootChroma = CHROMATIC_SCALE.indexOf(root);

  const candidates: Set<string> = new Set();

  // 1. Quality confusion: parallel quality distractor
  const parallelInterval = getParallelQualityInterval(quality, drillType);
  if (parallelInterval !== null) {
    const parallelNote = calculateNote(root, parallelInterval);
    if (CHROMATIC_SCALE.indexOf(parallelNote) !== correctChroma) {
      candidates.add(parallelNote);
    }
  }

  // 2. Adjacent semitones (up and down from correct)
  const neighbors = [
    CHROMATIC_SCALE[(correctChroma - 1 + 12) % 12],
    CHROMATIC_SCALE[(correctChroma + 1) % 12],
    CHROMATIC_SCALE[(correctChroma - 2 + 12) % 12],
    CHROMATIC_SCALE[(correctChroma + 2) % 12],
  ];
  for (const candidate of neighbors) {
    const chroma = CHROMATIC_SCALE.indexOf(candidate as NoteName);
    if (chroma !== correctChroma && chroma !== rootChroma) {
      candidates.add(candidate);
    }
  }

  // Deduplicate by chroma, convert to display spelling
  const displayed: string[] = [];
  const seenChromas = new Set<number>([correctChroma]);

  for (const note of Array.from(candidates)) {
    const chroma = CHROMATIC_SCALE.indexOf(note as NoteName);
    if (seenChromas.has(chroma)) continue;
    seenChromas.add(chroma);
    displayed.push(rootToDisplay(note as NoteName));
    if (displayed.length >= count) break;
  }

  // Fill remaining slots from chromatic scale if needed
  if (displayed.length < count) {
    for (const note of CHROMATIC_SCALE) {
      const chroma = CHROMATIC_SCALE.indexOf(note);
      if (seenChromas.has(chroma)) continue;
      seenChromas.add(chroma);
      displayed.push(rootToDisplay(note));
      if (displayed.length >= count) break;
    }
  }

  return displayed;
}

// ============================================
// QUESTION GENERATION
// ============================================

/** All chord qualities available for drills */
export const DRILL_QUALITIES: ChordQuality[] = ['maj7', 'min7', 'dom7', 'min7b5'];

/** Human-readable quality label */
export const QUALITY_LABELS: Record<ChordQuality, string> = {
  maj7: 'maj7',
  min7: 'min7',
  dom7: '7',
  min7b5: 'm7♭5',
  dim7: 'dim7',
};

/**
 * Generate a single flashcard question.
 */
export function generateQuestion(
  rootDisplay: DisplayRootName,
  quality: ChordQuality,
  drillType: DrillType,
): DrillQuestion {
  const root = DISPLAY_TO_NOTE[rootDisplay] ?? (rootDisplay as NoteName);
  const id = `${rootDisplay}${quality}-${drillType}`;
  const tones = getChordTones({ root, quality });

  if (drillType === 'guide-tones') {
    const spelling = getChordSpelling(rootDisplay, quality);
    const thirdDisplay = spelling.third;
    const seventhDisplay = spelling.seventh;
    const correctAnswer = `${thirdDisplay} + ${seventhDisplay}`;

    const thirdDistractors = generateDistractors(root, tones.third, quality, 'third', 3);
    const seventhDistractors = generateDistractors(root, tones.seventh, quality, 'seventh', 3);

    const distractorOptions = [
      `${thirdDistractors[0]} + ${seventhDisplay}`,
      `${thirdDisplay} + ${seventhDistractors[0]}`,
      `${thirdDistractors[1] ?? thirdDistractors[0]} + ${seventhDistractors[1] ?? seventhDistractors[0]}`,
    ];

    return {
      id,
      rootDisplay,
      quality,
      drillType,
      correctAnswer,
      correctAnswerAlt: null,
      options: shuffle([correctAnswer, ...distractorOptions.slice(0, 3)]),
    };
  }

  // 3rd or 7th drill
  const correctNote = drillType === 'third' ? tones.third : tones.seventh;
  const spelling = getChordSpelling(rootDisplay, quality);
  const correctDisplay = drillType === 'third' ? spelling.third : spelling.seventh;
  const correctAlt = enharmonicEquivalent(correctDisplay);

  return {
    id,
    rootDisplay,
    quality,
    drillType,
    correctAnswer: correctDisplay,
    correctAnswerAlt: correctAlt,
    options: shuffle([correctDisplay, ...generateDistractors(root, correctNote, quality, drillType)]),
  };
}

/**
 * Check if a user's answer is correct (accepts enharmonic equivalents).
 */
export function isCorrectAnswer(question: DrillQuestion, userAnswer: string): boolean {
  if (userAnswer === question.correctAnswer) return true;
  if (question.correctAnswerAlt && userAnswer === question.correctAnswerAlt) return true;
  return false;
}

/**
 * Build a full question bank for all root+quality combinations.
 */
export function buildQuestionBank(
  drillTypes: DrillType[] = ['third', 'seventh', 'guide-tones'],
  qualities: ChordQuality[] = DRILL_QUALITIES,
  roots: DisplayRootName[] = CIRCLE_OF_FIFTHS_ROOTS,
): DrillQuestion[] {
  const questions: DrillQuestion[] = [];
  for (const root of roots) {
    for (const quality of qualities) {
      for (const drillType of drillTypes) {
        questions.push(generateQuestion(root, quality, drillType));
      }
    }
  }
  return questions;
}

// ============================================
// UTILITIES
// ============================================

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
