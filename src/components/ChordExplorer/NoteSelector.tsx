/**
 * NoteSelector Component
 *
 * Unified selector for choosing which notes to include in the voicing.
 * Shows all possible notes (R, 3, 5, 7, 9, 11, 13) with state cycling.
 */

import React from 'react';
import { PlaygroundBlock } from './playgroundUtils';
import { NoteSelectorBlock } from './NoteSelectorBlock';
import './NoteSelector.css';

interface NoteSelectorProps {
  blocks: PlaygroundBlock[];
  onBlockCycle: (blockId: string) => void;
}

export function NoteSelector({ blocks, onBlockCycle }: NoteSelectorProps) {
  // Always display in fixed order: R-3-5-7-9-11-13
  const FIXED_ORDER = ['root', 'third', 'fifth', 'seventh', 'ninth', 'eleventh', 'thirteenth'];
  
  const sortedBlocks = [...blocks].sort((a, b) => {
    const aIndex = FIXED_ORDER.indexOf(a.id);
    const bIndex = FIXED_ORDER.indexOf(b.id);
    return aIndex - bIndex;
  });

  return (
    <div className="note-selector">
      <h4 className="note-selector__title">Select Notes</h4>
      <p className="note-selector__description">
        Click chord tones to toggle. Click extensions to cycle: Off → Natural → Alterations.
      </p>
      <div className="note-selector__blocks">
        {sortedBlocks.map((block) => (
          <NoteSelectorBlock
            key={block.id}
            block={block}
            onCycle={() => onBlockCycle(block.id)}
          />
        ))}
      </div>
    </div>
  );
}

