/**
 * NoteSelectorBlock Component
 *
 * Individual selector block with state cycling and indicator dots.
 * Used in the unified note selector area.
 */

import React from 'react';
import { PlaygroundBlock, EXTENSION_STATE_CYCLES } from './playgroundUtils';
import './NoteSelector.css';

interface NoteSelectorBlockProps {
  block: PlaygroundBlock;
  onCycle: () => void;
}

export function NoteSelectorBlock({ block, onCycle }: NoteSelectorBlockProps) {
  const { isExtension, extensionFamily, currentState, enabled } = block;
  
  // Only extensions get state cycles with dots
  const stateCycle = isExtension && extensionFamily
    ? EXTENSION_STATE_CYCLES[extensionFamily]
    : null;
  
  const displayState = isExtension ? currentState : (enabled ? 'natural' : 'off');
  const isOff = displayState === 'off';
  
  return (
    <button
      type="button"
      className={`note-selector-block ${isOff ? 'note-selector-block--off' : ''}`}
      onClick={onCycle}
      aria-label={`${block.label} ${block.note} - ${displayState}`}
    >
      <div className="note-selector-block__label">{block.label}</div>
      <div className="note-selector-block__note">{block.note}</div>
      
      {/* State indicator dots - only for extensions */}
      {stateCycle && (
        <div className="note-selector-block__states">
          {stateCycle.map((state) => (
            <div
              key={state}
              className={`state-dot ${displayState === state ? 'state-dot--active' : ''}`}
              aria-hidden="true"
            />
          ))}
        </div>
      )}
    </button>
  );
}

