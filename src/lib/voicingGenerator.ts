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
// FUNCTIONS
// ============================================

/**
 * Combine a note name with an octave to create a playable note.
 *
 * @example createNote("D", 2) → "D2"
 * @example createNote("F#", 3) → "F#3"
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
 * // → { leftHand: ["D2"], rightHand: ["F3", "C4"] }
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

/**
 * Transpose a note by a number of semitones.
 * Handles octave changes when crossing note boundaries.
 *
 * @example transposeNote("D2", 5) → "G2"
 * @example transposeNote("A2", 4) → "C#3"
 */
export function transposeNote(note: Note, semitones: number): Note {
  const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  // Parse note name and octave
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) throw new Error(`Invalid note format: ${note}`);

  const [, noteName, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);

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

