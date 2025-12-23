/**
 * NoteBlocks Component
 * 
 * Displays chord tones and extensions as colored blocks.
 * Chord tones (R-3-5-7) use role colors.
 * Extensions (9-11-13) use extension colors.
 */

import React from 'react';
import {
  NoteName,
  ExtendedChordTones,
  SelectedExtensions,
  EXTENSION_LABELS,
  DEFAULT_EXTENSION_RENDER_ORDER,
  getNoteNameForExtensionKey,
  getVoicingRoleForExtensionKey,
} from '../../lib/core';

// ============================================
// TYPES
// ============================================

interface NoteBlocksProps {
  chordTones: ExtendedChordTones;
  selectedExtensions: SelectedExtensions;
}

interface NoteBlockData {
  note: NoteName;
  label: string;
  role: string; // CSS class name
  isExtension: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function NoteBlocks({ chordTones, selectedExtensions }: NoteBlocksProps) {
  // Build array of notes to display
  const notes: NoteBlockData[] = [
    // Chord tones (always shown)
    { note: chordTones.root, label: "R", role: "root", isExtension: false },
    { note: chordTones.third, label: "3", role: "third", isExtension: false },
    { note: chordTones.fifth, label: "5", role: "fifth", isExtension: false },
    { note: chordTones.seventh, label: "7", role: "seventh", isExtension: false },
  ];

  // Add selected extensions
  DEFAULT_EXTENSION_RENDER_ORDER.forEach((key) => {
    if (!selectedExtensions[key]) return;
    const note = getNoteNameForExtensionKey(chordTones, key);
    if (!note) return;

    // CSS uses kebab-case for altered roles.
    const voicingRole = getVoicingRoleForExtensionKey(key);
    const cssRole = voicingRole
      .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
      .toLowerCase();

    notes.push({
      note,
      label: EXTENSION_LABELS[key],
      role: cssRole,
      isExtension: true,
    });
  });

  // Separate chord tones and extensions for display
  const chordToneBlocks = notes.filter(n => !n.isExtension);
  const extensionBlocks = notes.filter(n => n.isExtension);

  return (
    <div className="note-blocks-container">
      {/* Chord tones */}
      <div className="note-blocks chord-tones">
        {chordToneBlocks.map((n, i) => (
          <div key={`tone-${i}`} className={`note-block note-block--${n.role}`}>
            <span className="note-label">{n.label}</span>
            <span className="note-name">{n.note}</span>
          </div>
        ))}
      </div>

      {/* Extensions (if any) */}
      {extensionBlocks.length > 0 && (
        <div className="note-blocks extensions">
          {extensionBlocks.map((n, i) => (
            <div key={`ext-${i}`} className={`note-block note-block--${n.role}`}>
              <span className="note-label">{n.label}</span>
              <span className="note-name">{n.note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NoteBlocks;

