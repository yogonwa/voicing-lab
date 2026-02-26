import React from 'react';
import { PianoKeyProps } from './types';

const ROLE_COLORS: Record<string, string> = {
  root: '#fc8181',
  third: '#63b3ed',
  fifth: '#68d391',
  seventh: '#b794f4',
  ninth: '#f6ad55',
  flatNinth: '#e53e3e',
  sharpNinth: '#ed64a6',
  eleventh: '#4fd1c5',
  sharpEleventh: '#9f7aea',
  thirteenth: '#faf089',
  flatThirteenth: '#fc8181',
};

const VARIANT_COLORS: Record<string, string> = {
  context: '#68d391',  // green — background chord tones
  answer: '#b794f4',   // purple — the specific asked tone
};

export function PianoKey({
  note,
  isBlack,
  isActive,
  role,
  hand,
  isGhost,
  isAvailable,
  onClick,
  variant,
}: PianoKeyProps) {
  const classNames = [
    'piano-key',
    isBlack ? 'piano-key--black' : 'piano-key--white',
    isActive ? 'piano-key--active' : '',
    isGhost ? 'piano-key--ghost' : '',
    isAvailable && !isActive && !isGhost ? 'piano-key--available' : '',
    onClick ? 'piano-key--clickable' : '',
    hand === 'left' ? 'piano-key--left-hand' : '',
    hand === 'right' ? 'piano-key--right-hand' : '',
    role && !variant ? `piano-key--${role}` : '',
  ].filter(Boolean).join(' ');

  let color: string | undefined;
  if (isGhost) {
    color = '#a0aec0'; // gray
  } else if (isActive) {
    if (variant) {
      color = VARIANT_COLORS[variant];
    } else if (role) {
      color = ROLE_COLORS[role];
    }
  }

  const style: React.CSSProperties = color
    ? { '--key-color': color } as React.CSSProperties
    : {};

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      className={classNames}
      style={style}
      data-note={note}
      aria-label={`${note}${isActive ? ` (${role ?? 'selected'})` : ''}`}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    />
  );
}

export default PianoKey;
