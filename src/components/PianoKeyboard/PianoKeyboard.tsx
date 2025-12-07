/**
 * PianoKeyboard Component
 *
 * Visual piano keyboard displaying active notes with color-coded roles.
 * Renders 4 octaves (C2-B5) by default.
 */

import React, { useMemo } from 'react';
import './PianoKeyboard.css';
import { PianoKey } from './PianoKey';
import { PianoKeyboardProps } from './types';
import { findActiveNote } from './utils';
import { Note } from '../../lib';

// ============================================
// CONSTANTS
// ============================================

/** Notes in one octave */
const NOTES_IN_OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** White notes only */
const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

/** Black key positions as percentage of white key width from the left edge of each octave */
const BLACK_KEY_POSITIONS: Record<string, number> = {
  'C#': 0.75,   // After C
  'D#': 1.75,   // After D
  'F#': 3.75,   // After F
  'G#': 4.75,   // After G
  'A#': 5.75,   // After A
};

// ============================================
// COMPONENT
// ============================================

export function PianoKeyboard({
  activeNotes,
  startOctave = 2,
  endOctave = 5,
}: PianoKeyboardProps) {
  // Generate white and black keys
  const { whiteKeys, blackKeys } = useMemo(() => {
    const whites: { note: Note; octave: number; indexInOctave: number }[] = [];
    const blacks: { note: Note; octave: number; position: number }[] = [];

    for (let octave = startOctave; octave <= endOctave; octave++) {
      // White keys
      WHITE_NOTES.forEach((noteName, idx) => {
        whites.push({
          note: `${noteName}${octave}` as Note,
          octave,
          indexInOctave: idx,
        });
      });

      // Black keys
      Object.entries(BLACK_KEY_POSITIONS).forEach(([noteName, posInOctave]) => {
        const octaveOffset = (octave - startOctave) * 7; // 7 white keys per octave
        const position = ((octaveOffset + posInOctave) / ((endOctave - startOctave + 1) * 7)) * 100;
        blacks.push({
          note: `${noteName}${octave}` as Note,
          octave,
          position,
        });
      });
    }

    return { whiteKeys: whites, blackKeys: blacks };
  }, [startOctave, endOctave]);

  return (
    <div className="piano-keyboard" role="img" aria-label="Piano keyboard">
      <div className="piano-keyboard__keys">
        {/* White keys - use flexbox */}
        {whiteKeys.map((key) => {
          const activeNote = findActiveNote(key.note, activeNotes);
          return (
            <div key={key.note} className="piano-keyboard__key-wrapper--white">
              <PianoKey
                note={key.note}
                isBlack={false}
                isActive={!!activeNote}
                role={activeNote?.role}
                hand={activeNote?.hand}
              />
            </div>
          );
        })}

        {/* Black keys - absolute positioning */}
        {blackKeys.map((key) => {
          const activeNote = findActiveNote(key.note, activeNotes);
          return (
            <div
              key={key.note}
              className="piano-keyboard__key-wrapper--black"
              style={{ left: `${key.position}%` }}
            >
              <PianoKey
                note={key.note}
                isBlack={true}
                isActive={!!activeNote}
                role={activeNote?.role}
                hand={activeNote?.hand}
              />
            </div>
          );
        })}
      </div>

      {/* Octave markers */}
      <div className="piano-keyboard__octave-markers">
        {Array.from({ length: endOctave - startOctave + 1 }, (_, i) => (
          <span key={startOctave + i} className="piano-keyboard__octave-label">
            C{startOctave + i}
          </span>
        ))}
      </div>
    </div>
  );
}

export default PianoKeyboard;
