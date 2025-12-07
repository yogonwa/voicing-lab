/**
 * PianoKeyboard Types
 *
 * Shared type definitions for the piano keyboard components.
 */

import { Note, VoicingRole } from '../../lib';

// ============================================
// TYPES
// ============================================

/** Which hand plays the note */
export type Hand = 'left' | 'right';

/** Active note with its role and hand assignment */
export interface ActiveNote {
  note: Note;
  role: VoicingRole;
  hand: Hand;
}

/** Props for the main PianoKeyboard component */
export interface PianoKeyboardProps {
  activeNotes: ActiveNote[];
  startOctave?: number;
  endOctave?: number;
}

/** Props for individual piano key */
export interface PianoKeyProps {
  note: Note;
  isBlack: boolean;
  isActive: boolean;
  role?: VoicingRole;
  hand?: Hand;
}

/** Key layout information for rendering */
export interface KeyLayout {
  note: Note;
  isBlack: boolean;
  position: number; // x position as percentage
}

