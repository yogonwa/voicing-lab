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
  ExtensionKey,
  EXTENSION_LABELS,
} from '../../lib';

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
  const extensionOrder: ExtensionKey[] = [
    "ninth", "flatNinth", "sharpNinth",
    "eleventh", "sharpEleventh",
    "thirteenth", "flatThirteenth"
  ];

  extensionOrder.forEach(key => {
    if (selectedExtensions[key]) {
      let note: NoteName | undefined;
      let role: string;

      // Get the note from the appropriate place
      switch (key) {
        case "ninth":
          note = chordTones.extensions?.ninth;
          role = "ninth";
          break;
        case "flatNinth":
          note = chordTones.alterations?.flatNinth;
          role = "flat-ninth";
          break;
        case "sharpNinth":
          note = chordTones.alterations?.sharpNinth;
          role = "sharp-ninth";
          break;
        case "eleventh":
          note = chordTones.extensions?.eleventh;
          role = "eleventh";
          break;
        case "sharpEleventh":
          note = chordTones.extensions?.sharpEleventh;  // #11 is in extensions for all chords
          role = "sharp-eleventh";
          break;
        case "thirteenth":
          note = chordTones.extensions?.thirteenth;
          role = "thirteenth";
          break;
        case "flatThirteenth":
          note = chordTones.alterations?.flatThirteenth;
          role = "flat-thirteenth";
          break;
      }

      if (note) {
        notes.push({
          note,
          label: EXTENSION_LABELS[key],
          role,
          isExtension: true,
        });
      }
    }
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

