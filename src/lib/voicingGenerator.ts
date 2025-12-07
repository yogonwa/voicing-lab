/**
 * Voicing Generator
 *
 * Combines chord tones (from chordCalculator) with voicing templates
 * to produce playable voicings with specific notes and octaves.
 *
 * This is "Layer 3" - the bridge between abstract chord theory and
 * concrete piano positions.
 *
 * For MVP, we use hardcoded progressions for voice leading quality.
 * This generator enables future key transposition by computing voicings
 * programmatically.
 */

import { Chord, ChordTones, getChordTones } from './chordCalculator';
import { VoicingTemplate, VoicedChord, VoicingRole, Note, Octave } from './voicingTemplates';

// ============================================
// CONSTANTS
// ============================================

/** Chromatic scale for interval calculations */
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Combine a note name with an octave to create a playable note.
 *
 * @example createNote("D", 3) → "D3"
 * @example createNote("F#", 4) → "F#4"
 */
function createNote(noteName: string, octave: Octave): Note {
  return `${noteName}${octave}` as Note;
}

/**
 * Get the note name for a given chord role.
 *
 * @example getRoleNote(chordTones, "third") → "F"
 */
function getRoleNote(tones: ChordTones, role: VoicingRole): string {
  return tones[role];
}

/**
 * Parse a note string into its components.
 *
 * @example parseNote("F#4") → { name: "F#", octave: 4 }
 */
function parseNote(note: Note): { name: string; octave: number } {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) throw new Error(`Invalid note format: ${note}`);
  return { name: match[1], octave: parseInt(match[2], 10) };
}

// ============================================
// CLOSE POSITION VOICING LOGIC
// ============================================

/**
 * Find the next occurrence of a target note going UP from a reference note.
 *
 * This implements "close position" voicing - when building chords, each
 * subsequent note is the NEXT occurrence going upward, not an arbitrary
 * octave jump.
 *
 * Algorithm:
 * 1. Get chromatic index of both notes (0-11)
 * 2. If target > reference: same octave (target is above reference in scale)
 * 3. If target <= reference: next octave (must go up to reach target)
 *
 * @param referenceNote - The starting note with octave (e.g., "F4")
 * @param targetNoteName - The note name to find (e.g., "B")
 * @returns The next occurrence of target going up (e.g., "B4")
 *
 * @example
 * // F is at index 5, B is at index 11 → B > F → same octave
 * findNextNoteUp("F4", "B") → "B4"
 *
 * @example
 * // B is at index 11, E is at index 4 → E < B → next octave
 * findNextNoteUp("B4", "E") → "E5"
 *
 * @example
 * // G is at index 7, B is at index 11 → B > G → same octave
 * findNextNoteUp("G4", "B") → "B4"
 *
 * @example
 * // C is at index 0, F is at index 5 → F > C → same octave
 * findNextNoteUp("C4", "F") → "F4"
 */
export function findNextNoteUp(referenceNote: Note, targetNoteName: string): Note {
  const { name: refName, octave: refOctave } = parseNote(referenceNote);

  const refIndex = CHROMATIC.indexOf(refName);
  const targetIndex = CHROMATIC.indexOf(targetNoteName);

  if (refIndex === -1 || targetIndex === -1) {
    throw new Error(`Invalid note name: ${refName} or ${targetNoteName}`);
  }

  // If target is higher in chromatic scale, it's in the same octave
  // If target is same or lower, it's in the next octave
  const targetOctave = targetIndex > refIndex ? refOctave : refOctave + 1;

  return createNote(targetNoteName, targetOctave as Octave);
}

/**
 * Build a sequence of notes in close position starting from a base note.
 *
 * Each note is placed at the next occurrence going UP from the previous note.
 * This produces compact, pianistic voicings without wide jumps.
 *
 * @param baseNote - Starting note with octave
 * @param noteNames - Array of note names to stack upward
 * @returns Array of notes in close position
 *
 * @example
 * // Shell A for G7: start at B4, stack F above
 * buildClosePosition("B4", ["F"]) → ["F5"]
 *
 * @example
 * // Shell B for Dm7: start at C4, stack F above
 * buildClosePosition("C4", ["F"]) → ["F4"]
 *
 * FUTURE USE: This function can be used to generate close-position voicings
 * programmatically for any key, replacing the need for hardcoded progressions.
 */
export function buildClosePosition(baseNote: Note, noteNames: string[]): Note[] {
  const result: Note[] = [];
  let currentNote = baseNote;

  for (const noteName of noteNames) {
    const nextNote = findNextNoteUp(currentNote, noteName);
    result.push(nextNote);
    currentNote = nextNote;
  }

  return result;
}

// ============================================
// VOICING GENERATION
// ============================================

/**
 * Generate a voicing by applying a template to a chord.
 *
 * Takes the abstract chord (e.g., Dm7) and a voicing template,
 * returns concrete notes with octaves for each hand.
 *
 * Note: This produces a "default" voicing without voice leading optimization.
 * For smooth progressions, use the hardcoded PROGRESSIONS instead.
 *
 * @example
 * generateVoicing({ root: "D", quality: "min7" }, SHELL_POSITION_A)
 * // → { leftHand: ["D3"], rightHand: ["F4", "C5"] }
 */
export function generateVoicing(chord: Chord, template: VoicingTemplate): VoicedChord {
  const tones = getChordTones(chord);

  // Build left hand notes
  const leftHand: Note[] = template.leftHand.map((role, index) => {
    const noteName = getRoleNote(tones, role);
    // Each subsequent note goes up an octave if we have 3+ notes in one hand
    const octaveOffset = Math.floor(index / 3);
    const octave = (template.octaves.leftHandBase + octaveOffset) as Octave;
    return createNote(noteName, octave);
  });

  // Build right hand notes
  const rightHand: Note[] = template.rightHand.map((role, index) => {
    const noteName = getRoleNote(tones, role);
    const octaveOffset = Math.floor(index / 3);
    const octave = (template.octaves.rightHandBase + octaveOffset) as Octave;
    return createNote(noteName, octave);
  });

  return { leftHand, rightHand };
}

/**
 * Generate voicings for an entire progression.
 *
 * @example
 * const chords = [
 *   { root: "D", quality: "min7" },
 *   { root: "G", quality: "dom7" },
 *   { root: "C", quality: "maj7" }
 * ];
 * generateProgression(chords, SHELL_POSITION_A)
 * // → [VoicedChord, VoicedChord, VoicedChord]
 */
export function generateProgression(
  chords: Chord[],
  template: VoicingTemplate
): VoicedChord[] {
  return chords.map((chord) => generateVoicing(chord, template));
}

// ============================================
// TRANSPOSITION
// ============================================

/**
 * Transpose a note by a number of semitones.
 * Handles octave changes when crossing note boundaries.
 *
 * @example transposeNote("D3", 5) → "G3"
 * @example transposeNote("A3", 4) → "C#4"
 */
export function transposeNote(note: Note, semitones: number): Note {
  const { name: noteName, octave } = parseNote(note);

  // Calculate new position
  const noteIndex = CHROMATIC.indexOf(noteName);
  const newIndex = noteIndex + semitones;

  // Handle octave changes
  const octaveChange = Math.floor(newIndex / 12);
  const newNoteIndex = ((newIndex % 12) + 12) % 12; // Handle negative semitones
  const newOctave = octave + octaveChange;

  return `${CHROMATIC[newNoteIndex]}${newOctave}` as Note;
}

/**
 * Transpose an entire voicing by a number of semitones.
 * Useful for playing the same voicing pattern in different keys.
 *
 * @example
 * // Transpose Dm7 voicing up a whole step to Em7
 * transposeVoicing(dm7Voicing, 2)
 */
export function transposeVoicing(voicing: VoicedChord, semitones: number): VoicedChord {
  return {
    leftHand: voicing.leftHand.map((note) => transposeNote(note, semitones)),
    rightHand: voicing.rightHand.map((note) => transposeNote(note, semitones)),
  };
}
