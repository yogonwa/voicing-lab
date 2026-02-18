/**
 * Chord Spelling — canonical note display names via Tonal.js
 *
 * Single source of truth for enharmonic spelling of chord tones.
 * Tonal.js provides correct flat/sharp context per root
 * (e.g., Cmin7 → Bb not A#; F#maj7 → A# not Bb).
 *
 * Post-processes Tonal.js output to normalize:
 *   - Double-flats (Bbb → A, Ebb → D, …) to single-accidental equivalents
 *   - Double-sharps (E## → F#, …) to single-accidental equivalents
 *   - Unusual single accidentals (E# → F, Cb → B, …) to jazz-conventional display
 */

import { Chord } from 'tonal';
import type { ChordQuality } from './chordCalculator';

// ============================================
// MAP OUR CHORD QUALITY TO TONAL.JS TYPE NAME
// ============================================

const QUALITY_TO_TONAL: Record<ChordQuality, string> = {
  maj7:   'maj7',
  min7:   'm7',
  dom7:   '7',
  min7b5: 'm7b5',
  dim7:   'dim7',
};

// ============================================
// SPELLING NORMALIZATION
// ============================================

/**
 * Tonal.js uses strict diatonic spelling which produces double-accidentals
 * and unusual single-accidentals for certain chord/root combinations.
 * These are theoretically correct but impractical for jazz education display.
 *
 * Examples fixed:
 *   Bbb (dim7 7th) → A     Cb (Abm7 3rd) → B
 *   E#  (F#maj7 7th) → F   Fb (Dbm7 3rd) → E
 */
const SPELLING_NORMALIZE: Record<string, string> = {
  // Double-flats → simpler enharmonic equivalent
  'Bbb': 'A',  'Ebb': 'D',  'Abb': 'G',  'Dbb': 'C',
  'Gbb': 'F',  'Cbb': 'Bb', 'Fbb': 'Eb',
  // Double-sharps → simpler enharmonic equivalent
  'E##': 'F#', 'B##': 'C#', 'A##': 'B',  'D##': 'E',
  'G##': 'A',  'C##': 'D',  'F##': 'G',
  // Unusual single accidentals → jazz-conventional single-accidental
  'E#': 'F',   'B#': 'C',   'Fb': 'E',   'Cb': 'B',
};

function normalizeSpelling(note: string): string {
  return SPELLING_NORMALIZE[note] ?? note;
}

// ============================================
// PUBLIC API
// ============================================

export interface ChordSpelling {
  root: string;
  third: string;
  fifth: string;
  seventh: string;
}

/**
 * Get correctly spelled note names for a chord's tones.
 *
 * Uses Tonal.js for enharmonic context (Cmin7→Bb, F#maj7→A#),
 * then normalizes unusual spellings for jazz display.
 *
 * @example getChordSpelling('C', 'min7')
 *          → { root: 'C', third: 'Eb', fifth: 'G', seventh: 'Bb' }
 * @example getChordSpelling('F#', 'maj7')
 *          → { root: 'F#', third: 'A#', fifth: 'C#', seventh: 'F' }
 * @example getChordSpelling('Ab', 'min7')
 *          → { root: 'Ab', third: 'B', fifth: 'Eb', seventh: 'Gb' }
 */
export function getChordSpelling(root: string, quality: ChordQuality): ChordSpelling {
  const tonalType = QUALITY_TO_TONAL[quality];
  const notes = Chord.getChord(tonalType, root).notes.map(normalizeSpelling);
  return {
    root:    notes[0] ?? root,
    third:   notes[1] ?? '',
    fifth:   notes[2] ?? '',
    seventh: notes[3] ?? '',
  };
}
