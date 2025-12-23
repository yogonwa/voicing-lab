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

interface PlaygroundPanelProps {
  blocks: PlaygroundBlock[];
  onReorder: (next: PlaygroundBlock[]) => void;
  onToggle: (blockId: string) => void;
  warningMessage?: string | null;
  presets: {
    id: string;
    name: string;
    description: string;
  }[];
  activePresetId: string | null;
  onPresetSelect: (presetId: string) => void;
  onPresetReset: () => void;
}

interface SortableBlockProps {
  block: PlaygroundBlock;
  onToggle: (blockId: string) => void;
}

function SortableBlock({ block, onToggle }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });
  const { 'aria-pressed': _omitPressed, ...restAttributes } = attributes;

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onToggle(block.id);
  }, [block.id, onToggle]);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const classes = [
    'playground-block',
    `note-block--${block.cssRole}`,
    block.enabled ? 'is-enabled' : 'is-disabled',
    block.isExtension ? 'is-extension' : '',
    isDragging ? 'is-dragging' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      ref={setNodeRef}
      className={classes}
      style={style}
      aria-pressed={block.enabled}
      onClick={handleClick}
      {...restAttributes}
      {...listeners}
    >
      <span className="playground-block__label">{block.label}</span>
      <span className="playground-block__note">{block.note}</span>
      {!block.enabled && <span className="playground-block__state">off</span>}
    </button>
  );
}

export function PlaygroundPanel({
  blocks,
  onReorder,
  onToggle,
  warningMessage,
  presets,
  activePresetId,
  onPresetSelect,
  onPresetReset,
}: PlaygroundPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const blockIds = useMemo(() => blocks.map((block) => block.id), [blocks]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      onReorder(arrayMove(blocks, oldIndex, newIndex));
    },
    [blocks, onReorder]
  );

  return (
    <div className="playground-panel">
      <div className="playground-panel__header">
        <div>
          <p className="playground-panel__eyebrow">Playground Mode</p>
          <h4 className="playground-panel__title">Drag to reorder • Click to toggle</h4>
        </div>
        <span className="playground-panel__status-badge">Live</span>
      </div>

      <p className="playground-panel__description">
        Arrange blocks from left (lowest note) to right (highest note). Drag blocks with a mouse or touch,
        or select a block and use the arrow keys. Disabled blocks stay in the list so you can compare
        against the full template.
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blockIds} strategy={horizontalListSortingStrategy}>
          <div className="playground-blocks" aria-live="polite">
            {blocks.map((block) => (
              <SortableBlock key={block.id} block={block} onToggle={onToggle} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="playground-panel__axis">
        <span aria-hidden="true">◀ Lower</span>
        <span aria-hidden="true">Higher ▶</span>
      </div>

      <div className="playground-panel__helper">
        <p>
          Click to cycle each block through available variants (Off → natural → flats/sharps). Keep at least two
          notes active. Drag to experiment with new voicing orders, then play the chord or arpeggio to hear the
          result reflected on the keyboard.
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
