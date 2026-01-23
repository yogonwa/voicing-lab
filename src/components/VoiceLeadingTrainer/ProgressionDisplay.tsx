/**
 * ProgressionDisplay Component
 *
 * Shows the ii-V-I progression with status badges for each chord.
 * Locked chords show a checkmark, the current chord is highlighted,
 * and future chords are dimmed.
 */

import React from 'react';
import type { ProgressionChord, BuiltVoicing } from '../../lib/trainerState';

interface ProgressionDisplayProps {
  chords: [ProgressionChord, ProgressionChord, ProgressionChord];
  currentIndex: number;
  builtVoicings: {
    ii: BuiltVoicing | null;
    V: BuiltVoicing | null;
    I: BuiltVoicing | null;
  };
  onChordClick?: (index: number) => void;
}

export function ProgressionDisplay({
  chords,
  currentIndex,
  builtVoicings,
  onChordClick,
}: ProgressionDisplayProps) {
  const positions: ('ii' | 'V' | 'I')[] = ['ii', 'V', 'I'];

  return (
    <div className="progression-display">
      {chords.map((chord, index) => {
        const position = positions[index];
        const isLocked = builtVoicings[position] !== null;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;

        let status: 'locked' | 'current' | 'future' = 'future';
        if (isLocked) status = 'locked';
        else if (isCurrent) status = 'current';

        return (
          <React.Fragment key={position}>
            <button
              className={`progression-chord progression-chord--${status}`}
              onClick={() => onChordClick?.(index)}
              disabled={isFuture}
              aria-label={`${chord.symbol} - ${status}`}
            >
              <span className="progression-chord__function">{position}</span>
              <span className="progression-chord__symbol">{chord.symbol}</span>
              {isLocked && (
                <span className="progression-chord__badge" aria-label="completed">
                  ✓
                </span>
              )}
              {isCurrent && !isLocked && (
                <span className="progression-chord__badge progression-chord__badge--build">
                  BUILD
                </span>
              )}
            </button>
            {index < 2 && <span className="progression-arrow">→</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}
