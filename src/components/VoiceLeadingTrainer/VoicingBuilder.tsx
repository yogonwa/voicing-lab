/**
 * VoicingBuilder Component
 *
 * Work area showing the current voicing being built.
 * Displays selected notes as blocks and shows the piano keyboard visualization.
 */

import React, { useMemo } from 'react';
import { PianoKeyboard, type ActiveNote } from '../PianoKeyboard';
import type { Note, VoicingRole } from '../../lib/voicingTemplates';
import { formatVoicingRole } from '../../lib/noteUtils';

interface VoicingBuilderProps {
  selectedRoles: VoicingRole[];
  notes: Note[];
  previousNotes?: Note[];
  chordSymbol: string;
  onRemoveNote: (role: VoicingRole) => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

export function VoicingBuilder({
  selectedRoles,
  notes,
  previousNotes = [],
  chordSymbol,
  onRemoveNote,
  onSubmit,
  canSubmit,
}: VoicingBuilderProps) {
  // Build active notes for keyboard display
  const activeNotes = useMemo((): ActiveNote[] => {
    return notes.map((note, i) => ({
      note,
      role: selectedRoles[i],
      hand: 'right' as const,
    }));
  }, [notes, selectedRoles]);

  return (
    <div className="voicing-builder">
      <div className="voicing-builder__header">
        <h3 className="voicing-builder__title">Build: {chordSymbol}</h3>
        {previousNotes.length > 0 && (
          <span className="voicing-builder__hint">
            Previous chord shown in gray
          </span>
        )}
      </div>

      <div className="voicing-builder__blocks">
        {selectedRoles.length === 0 ? (
          <p className="voicing-builder__empty">
            Select notes from the palette below
          </p>
        ) : (
          selectedRoles.map((role, index) => (
            <div key={role} className="voicing-block">
              <span className="voicing-block__role">{formatVoicingRole(role)}</span>
              <span className="voicing-block__note">{notes[index]?.replace(/\d/, '')}</span>
              <button
                className="voicing-block__remove"
                onClick={() => onRemoveNote(role)}
                aria-label={`Remove ${formatVoicingRole(role)}`}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <div className="voicing-builder__keyboard">
        <PianoKeyboard
          activeNotes={activeNotes}
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
        {!canSubmit && selectedRoles.length > 0 && selectedRoles.length < 2 && (
          <p className="voicing-builder__warning">
            Need at least 2 notes for a voicing
          </p>
        )}
      </div>
    </div>
  );
}
