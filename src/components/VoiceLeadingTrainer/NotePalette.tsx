/**
 * NotePalette Component
 *
 * Click-to-add interface for building voicings.
 * Shows available chord tones (R-3-5-7) and extensions (9, 11, 13).
 * Users click notes to add them to their voicing.
 */

import React from 'react';
import type { NoteName } from '../../lib/chordCalculator';
import type { VoicingRole } from '../../lib/voicingTemplates';

export interface PaletteNote {
  role: VoicingRole;
  note: NoteName;
  label: string;
}

interface NotePaletteProps {
  chordTones: PaletteNote[];
  extensions: PaletteNote[];
  selectedNotes: VoicingRole[];
  onNoteToggle: (role: VoicingRole) => void;
  disabled?: boolean;
}

export function NotePalette({
  chordTones,
  extensions,
  selectedNotes,
  onNoteToggle,
  disabled = false,
}: NotePaletteProps) {
  const renderNote = (item: PaletteNote, isExtension: boolean) => {
    const isSelected = selectedNotes.includes(item.role);

    return (
      <button
        key={item.role}
        className={`palette-note ${isSelected ? 'palette-note--selected' : ''} ${isExtension ? 'palette-note--extension' : ''}`}
        onClick={() => onNoteToggle(item.role)}
        disabled={disabled}
        aria-pressed={isSelected}
        aria-label={`${item.label} (${item.note})${isSelected ? ' - selected' : ''}`}
      >
        <span className="palette-note__label">{item.label}</span>
        <span className="palette-note__name">{item.note}</span>
      </button>
    );
  };

  return (
    <div className="note-palette">
      <div className="note-palette__section">
        <h4 className="note-palette__heading">Chord Tones</h4>
        <div className="note-palette__notes">
          {chordTones.map(item => renderNote(item, false))}
        </div>
      </div>

      {extensions.length > 0 && (
        <div className="note-palette__section">
          <h4 className="note-palette__heading">Extensions</h4>
          <div className="note-palette__notes">
            {extensions.map(item => renderNote(item, true))}
          </div>
        </div>
      )}

      <div className="note-palette__help">
        <span className="note-palette__tip">
          Click notes to add them to your voicing
        </span>
      </div>
    </div>
  );
}
