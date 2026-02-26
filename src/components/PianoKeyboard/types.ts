import { Note, VoicingRole } from '../../lib/core';

export type Hand = 'left' | 'right';

export interface ActiveNote {
  note: Note;
  role: VoicingRole;
  hand: Hand;
  /** Display override: 'context' = green background, 'answer' = purple highlight */
  variant?: 'context' | 'answer';
}

export interface PianoKeyboardProps {
  activeNotes: ActiveNote[];
  /** Prior chord notes — shown gray, not interactive */
  ghostNotes?: Note[];
  /** Chord tones for current chord — shown with a subtle available-tint */
  availableNotes?: Note[];
  /** If provided, every key becomes clickable and fires this callback */
  onClick?: (note: Note) => void;
  startOctave?: number;
  endOctave?: number;
}

export interface PianoKeyProps {
  note: Note;
  isBlack: boolean;
  isActive: boolean;
  role?: VoicingRole;
  hand?: Hand;
  isGhost?: boolean;
  isAvailable?: boolean;
  onClick?: () => void;
  variant?: 'context' | 'answer';
}

export interface KeyLayout {
  note: Note;
  isBlack: boolean;
  position: number;
}
