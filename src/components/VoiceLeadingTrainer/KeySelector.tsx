/**
 * KeySelector Component
 *
 * Circle of fifths key selection with lock indicators.
 * Keys are unlocked progressively as users complete progressions.
 */

import React from 'react';
import type { NoteName } from '../../lib/chordCalculator';
import {
  KEY_UNLOCK_ORDER,
  KEY_DISPLAY_NAMES,
  type KeyProgress,
  isKeyUnlocked,
  isKeyCompleted,
} from '../../lib/keyProgress';

interface KeySelectorProps {
  currentKey: NoteName;
  progress: KeyProgress;
  onKeySelect: (key: NoteName) => void;
}

export function KeySelector({
  currentKey,
  progress,
  onKeySelect,
}: KeySelectorProps) {
  return (
    <div className="key-selector">
      <h3 className="key-selector__title">Select Key</h3>

      <div className="key-selector__grid">
        {KEY_UNLOCK_ORDER.map((key) => {
          const unlocked = isKeyUnlocked(key, progress);
          const completed = isKeyCompleted(key, progress);
          const isCurrent = key === currentKey;
          const displayName = KEY_DISPLAY_NAMES[key];
          const completion = progress.completedKeys[key];

          return (
            <button
              key={key}
              className={`key-button ${isCurrent ? 'key-button--current' : ''} ${completed ? 'key-button--completed' : ''} ${!unlocked ? 'key-button--locked' : ''}`}
              onClick={() => unlocked && onKeySelect(key)}
              disabled={!unlocked}
              aria-label={`${displayName}${!unlocked ? ' (locked)' : ''}${completed ? ` (completed: ${completion?.bestScore})` : ''}`}
            >
              <span className="key-button__name">{displayName}</span>
              {!unlocked && (
                <span className="key-button__lock" aria-hidden="true">
                  🔒
                </span>
              )}
              {completed && (
                <span className="key-button__score">
                  {completion?.bestScore}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="key-selector__stats">
        <span>
          {Object.keys(progress.completedKeys).length}/{KEY_UNLOCK_ORDER.length} keys completed
        </span>
      </div>
    </div>
  );
}
