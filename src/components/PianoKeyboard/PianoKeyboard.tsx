import React, { useMemo } from 'react';
import './PianoKeyboard.css';
import { PianoKey } from './PianoKey';
import { PianoKeyboardProps } from './types';
import { findActiveNote } from './utils';
import { Note } from '../../lib/core';

const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const BLACK_KEY_POSITIONS: Record<string, number> = {
  'C#': 0.75,
  'D#': 1.75,
  'F#': 3.75,
  'G#': 4.75,
  'A#': 5.75,
};

export function PianoKeyboard({
  activeNotes,
  ghostNotes = [],
  availableNotes = [],
  onClick,
  startOctave = 2,
  endOctave = 5,
}: PianoKeyboardProps) {
  const { whiteKeys, blackKeys } = useMemo(() => {
    const whites: { note: Note; octave: number; indexInOctave: number }[] = [];
    const blacks: { note: Note; octave: number; position: number }[] = [];

    for (let octave = startOctave; octave <= endOctave; octave++) {
      WHITE_NOTES.forEach((noteName, idx) => {
        whites.push({ note: `${noteName}${octave}` as Note, octave, indexInOctave: idx });
      });
      Object.entries(BLACK_KEY_POSITIONS).forEach(([noteName, posInOctave]) => {
        const octaveOffset = (octave - startOctave) * 7;
        const position = ((octaveOffset + posInOctave) / ((endOctave - startOctave + 1) * 7)) * 100;
        blacks.push({ note: `${noteName}${octave}` as Note, octave, position });
      });
    }

    return { whiteKeys: whites, blackKeys: blacks };
  }, [startOctave, endOctave]);

  const ghostSet = useMemo(() => new Set(ghostNotes), [ghostNotes]);
  const availableSet = useMemo(() => new Set(availableNotes), [availableNotes]);

  function renderKey(note: Note, isBlack: boolean) {
    const activeNote = findActiveNote(note, activeNotes);
    const isGhost = ghostSet.has(note);
    const isAvailable = availableSet.has(note);

    return (
      <PianoKey
        note={note}
        isBlack={isBlack}
        isActive={!!activeNote}
        role={activeNote?.role}
        hand={activeNote?.hand}
        isGhost={isGhost}
        isAvailable={isAvailable}
        onClick={onClick ? () => onClick(note) : undefined}
        variant={activeNote?.variant}
      />
    );
  }

  return (
    <div className="piano-keyboard" role={onClick ? 'group' : 'img'} aria-label="Piano keyboard">
      <div className="piano-keyboard__keys">
        {whiteKeys.map((key) => (
          <div key={key.note} className="piano-keyboard__key-wrapper--white">
            {renderKey(key.note, false)}
          </div>
        ))}
        {blackKeys.map((key) => (
          <div
            key={key.note}
            className="piano-keyboard__key-wrapper--black"
            style={{ left: `${key.position}%` }}
          >
            {renderKey(key.note, true)}
          </div>
        ))}
      </div>
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
