/**
 * PlaygroundPanel Component
 *
 * Interactive drag-and-drop surface for Playground Mode.
 * Blocks can be reordered horizontally to change voicing order.
 */

import React, { useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlaygroundBlock } from './playgroundUtils';
import { NoteSelector } from './NoteSelector';
import { ChordQuality } from '../../lib/core';

interface PlaygroundPanelProps {
  allBlocks: PlaygroundBlock[];
  enabledBlocks: PlaygroundBlock[];
  onBlockCycle: (blockId: string) => void;
  onBlockRemove: (blockId: string) => void;
  onReorder: (next: PlaygroundBlock[]) => void;
  warningMessage?: string | null;
  presets: {
    id: string;
    name: string;
    description: string;
  }[];
  activePresetId: string | null;
  onPresetSelect: (presetId: string) => void;
  onPresetReset: () => void;
  quality: ChordQuality;
}

interface SortableBlockProps {
  block: PlaygroundBlock;
  onRemove: (blockId: string) => void;
}

function SortableBlock({ block, onRemove }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });
  const { 'aria-pressed': _omitPressed, ...restAttributes } = attributes;

  const handleRemove = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onRemove(block.id);
  }, [block.id, onRemove]);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const classes = [
    'playground-block',
    `note-block--${block.cssRole}`,
    block.isExtension ? 'is-extension' : '',
    isDragging ? 'is-dragging' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={setNodeRef} style={style} className="playground-block-wrapper">
      <div
        className={classes}
        {...restAttributes}
        {...listeners}
        role="button"
        tabIndex={0}
        aria-label={`${block.label} ${block.note} - drag to reorder`}
      >
        <span className="playground-block__label">{block.label}</span>
        <span className="playground-block__note">{block.note}</span>
      </div>
      
      {/* Remove button (not part of drag handle) */}
      <button
        type="button"
        className="playground-block__remove"
        onClick={handleRemove}
        aria-label={`Remove ${block.note}`}
      >
        ×
      </button>
    </div>
  );
}

export function PlaygroundPanel({
  allBlocks,
  enabledBlocks,
  onBlockCycle,
  onBlockRemove,
  onReorder,
  warningMessage,
  presets,
  activePresetId,
  onPresetSelect,
  onPresetReset,
  quality,
}: PlaygroundPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const blockIds = useMemo(() => enabledBlocks.map((block) => block.id), [enabledBlocks]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = enabledBlocks.findIndex((block) => block.id === active.id);
      const newIndex = enabledBlocks.findIndex((block) => block.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      // Reorder enabled blocks and merge with disabled blocks
      const reordered = arrayMove(enabledBlocks, oldIndex, newIndex);
      const disabledBlocks = allBlocks.filter(b => !b.enabled);
      onReorder([...reordered, ...disabledBlocks]);
    },
    [enabledBlocks, allBlocks, onReorder]
  );

  return (
    <div className="playground-panel">
      <div className="playground-panel__header">
        <div>
          <p className="playground-panel__eyebrow">Playground Mode</p>
          <h4 className="playground-panel__title">Select notes • Drag to reorder</h4>
        </div>
        <span className="playground-panel__status-badge">Live</span>
      </div>

      <p className="playground-panel__description">
        Choose which notes to use, then drag to arrange from left (lowest) to right (highest). Click × to remove notes from the voicing.
      </p>

      <div className="playground-presets">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={`playground-presets__button ${activePresetId === preset.id ? 'is-active' : ''}`}
            onClick={() => onPresetSelect(preset.id)}
            title={preset.description}
          >
            {preset.name}
          </button>
        ))}
        <button
          type="button"
          className="playground-presets__button playground-presets__button--ghost"
          onClick={onPresetReset}
        >
          Reset
        </button>
      </div>

      {/* SELECTOR AREA - All notes */}
      <NoteSelector blocks={allBlocks} onBlockCycle={onBlockCycle} />

      {/* DRAG AREA - Enabled notes only */}
      <div className="playground-voicing">
        <h4 className="playground-voicing__title">Voicing Order</h4>
        <p className="playground-voicing__description">
          Drag to reorder. Click × to remove.
        </p>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={blockIds} strategy={horizontalListSortingStrategy}>
            <div className="playground-blocks" aria-live="polite">
              {enabledBlocks.map((block) => (
                <SortableBlock key={block.id} block={block} onRemove={onBlockRemove} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="playground-panel__axis">
          <span aria-hidden="true">◀ Lower</span>
          <span aria-hidden="true">Higher ▶</span>
        </div>
      </div>

      <div className="playground-panel__helper">
        <p>
          Select notes above to add them to your voicing. Drag blocks to experiment with different orders. 
          Play the chord or arpeggio to hear each variation instantly on the keyboard.
        </p>
      </div>

      {warningMessage && (
        <div className="playground-panel__warning" role="status" aria-live="assertive">
          {warningMessage}
        </div>
      )}
    </div>
  );
}

export default PlaygroundPanel;
