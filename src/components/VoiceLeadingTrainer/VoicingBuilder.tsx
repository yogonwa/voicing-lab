import React, { useMemo } from 'react';
import { PianoKeyboard, type ActiveNote } from '../PianoKeyboard';
import type { Note, VoicingRole } from '../../lib/voicingTemplates';
import { getExtendedChordTones, parseNote, getVoicingRoleForNoteName } from '../../lib/core';
import type { NoteName, ChordQuality } from '../../lib/chordCalculator';

const ROLE_LABELS: Partial<Record<VoicingRole, string>> = {
  root: 'R', third: '3', fifth: '5', seventh: '7',
  ninth: '9', flatNinth: '♭9', sharpNinth: '♯9',
  eleventh: '11', sharpEleventh: '♯11',
  thirteenth: '13', flatThirteenth: '♭13',
};

const CHROMATIC_ORDER = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

function pitchValue(note: Note): number {
  const { name, octave } = parseNote(note);
  return octave * 12 + CHROMATIC_ORDER.indexOf(name);
}

interface VoicingBuilderProps {
  selectedNotes: Note[];
  ghostNotes?: Note[];
  availableNotes?: Note[];
  chordRoot: NoteName;
  chordQuality: ChordQuality;
  chordSymbol: string;
  onKeyClick: (note: Note) => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

export function VoicingBuilder({
  selectedNotes,
  ghostNotes = [],
  availableNotes = [],
  chordRoot,
  chordQuality,
  chordSymbol,
  onKeyClick,
  onSubmit,
  canSubmit,
}: VoicingBuilderProps) {
  const chordTones = useMemo(
    () => getExtendedChordTones({ root: chordRoot, quality: chordQuality }),
    [chordRoot, chordQuality]
  );

  // Build active notes for keyboard (selected notes with roles)
  const activeNotes = useMemo((): ActiveNote[] => {
    return selectedNotes.map(note => {
      const { name } = parseNote(note);
      const role = getVoicingRoleForNoteName(chordTones, name as NoteName) ?? 'root';
      return { note, role, hand: 'right' as const };
    });
  }, [selectedNotes, chordTones]);

  // Sort selected notes by pitch for block display
  const sortedSelected = useMemo(
    () => [...selectedNotes].sort((a, b) => pitchValue(a) - pitchValue(b)),
    [selectedNotes]
  );

  return (
    <div className="voicing-builder">
      <div className="voicing-builder__header">
        <h3 className="voicing-builder__title">Build: {chordSymbol}</h3>
        {ghostNotes.length > 0 && (
          <span className="voicing-builder__hint">Gray = previous chord</span>
        )}
      </div>

      <div className="voicing-builder__blocks">
        {sortedSelected.length === 0 ? (
          <p className="voicing-builder__empty">Click keys on the keyboard below</p>
        ) : (
          sortedSelected.map(note => {
            const { name } = parseNote(note);
            const role = getVoicingRoleForNoteName(chordTones, name as NoteName);
            const isOut = !role;
            return (
              <div
                key={note}
                className={`voicing-block${isOut ? ' voicing-block--out-of-chord' : ''}`}
              >
                <span className="voicing-block__role">
                  {isOut ? '?' : ROLE_LABELS[role!] ?? role}
                </span>
                <span className="voicing-block__note">{name}</span>
              </div>
            );
          })
        )}
      </div>

      <div className="voicing-builder__keyboard">
        <PianoKeyboard
          activeNotes={activeNotes}
          ghostNotes={ghostNotes}
          availableNotes={availableNotes}
          onClick={onKeyClick}
          startOctave={3}
          endOctave={5}
        />
      </div>

      <div className="voicing-builder__actions">
        <button
          className="voicing-builder__submit"
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          Submit Voicing
        </button>
        {!canSubmit && selectedNotes.length === 1 && (
          <p className="voicing-builder__warning">Need at least 2 notes</p>
        )}
      </div>
    </div>
  );
}
