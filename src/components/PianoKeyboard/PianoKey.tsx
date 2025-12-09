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

/** Colors for each chord role (basic tones) */
const BASIC_ROLE_COLORS: Record<string, string> = {
  root: '#fc8181',    // Red
  third: '#63b3ed',   // Blue
  fifth: '#68d391',   // Green
  seventh: '#b794f4', // Purple
};

/** Colors for extensions (slightly different hue to distinguish) */
const EXTENSION_ROLE_COLORS: Record<string, string> = {
  ninth: '#f6ad55',       // Orange - warm, adds color
  eleventh: '#4fd1c5',    // Teal - suspended, open
  thirteenth: '#faf089',  // Yellow - bright
};

/** Colors for alterations (tension colors) */
const ALTERATION_ROLE_COLORS: Record<string, string> = {
  flatNinth: '#e53e3e',       // Dark red - tension
  sharpNinth: '#ed64a6',      // Pink - blues color
  sharpEleventh: '#9f7aea',   // Light purple - Lydian
  flatThirteenth: '#fc8181',  // Red - altered
};

/** Combined color map for all roles */
const ROLE_COLORS: Record<string, string> = {
  ...BASIC_ROLE_COLORS,
  ...EXTENSION_ROLE_COLORS,
  ...ALTERATION_ROLE_COLORS,
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

