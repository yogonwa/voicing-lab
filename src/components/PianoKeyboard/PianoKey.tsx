/**
 * PianoKey Component
 *
 * Renders a single piano key (white or black).
 * Displays color based on chord role and border based on hand.
 */

import React from 'react';
import { PianoKeyProps } from './types';

// ============================================
// CONSTANTS
// ============================================

/** Colors for each chord role */
const ROLE_COLORS: Record<string, string> = {
  root: '#fc8181',    // Red
  third: '#63b3ed',   // Blue
  fifth: '#68d391',   // Green
  seventh: '#b794f4', // Purple
};

// ============================================
// COMPONENT
// ============================================

export function PianoKey({
  note,
  isBlack,
  isActive,
  role,
  hand,
}: PianoKeyProps) {
  // Build class names
  const classNames = [
    'piano-key',
    isBlack ? 'piano-key--black' : 'piano-key--white',
    isActive ? 'piano-key--active' : '',
    hand === 'left' ? 'piano-key--left-hand' : '',
    hand === 'right' ? 'piano-key--right-hand' : '',
    role ? `piano-key--${role}` : '',
  ].filter(Boolean).join(' ');

  // Inline style for active color
  const style: React.CSSProperties = isActive && role
    ? { '--key-color': ROLE_COLORS[role] } as React.CSSProperties
    : {};

  return (
    <div
      className={classNames}
      style={style}
      data-note={note}
      aria-label={`${note}${isActive ? ` (${role})` : ''}`}
    />
  );
}

export default PianoKey;

