import React, { useMemo, useState, useCallback } from 'react';
import { ExtendedChordTones, SelectedExtensions, getActiveExtensionKeys } from '../../lib';
import { PlaygroundBlock } from './playgroundState';

interface PlaygroundPanelProps {
  chordSymbol: string;
  chordTones: ExtendedChordTones;
  selectedExtensions: SelectedExtensions;
  blocks: PlaygroundBlock[];
  onReorder: (nextBlocks: PlaygroundBlock[]) => void;
  onToggle: (id: PlaygroundBlock['id']) => void;
  notice?: string | null;
}

function reorderBlocks(blocks: PlaygroundBlock[], activeId: string, overId: string) {
  const currentIndex = blocks.findIndex((block) => block.id === activeId);
  const nextIndex = blocks.findIndex((block) => block.id === overId);

  if (currentIndex === -1 || nextIndex === -1 || currentIndex === nextIndex) {
    return blocks;
  }

  const updated = [...blocks];
  const [moved] = updated.splice(currentIndex, 1);
  updated.splice(nextIndex, 0, moved);

  return updated.map((block, index) => ({ ...block, position: index }));
}

interface PlaygroundBlockCardProps {
  block: PlaygroundBlock;
  draggingId: string | null;
  overId: string | null;
  onToggle: (id: PlaygroundBlock['id']) => void;
  onDragStart: (id: PlaygroundBlock['id']) => void;
  onDragEnter: (id: PlaygroundBlock['id']) => void;
  onDragEnd: () => void;
  onDrop: (id: PlaygroundBlock['id']) => void;
}

function PlaygroundBlockCard({
  block,
  draggingId,
  overId,
  onToggle,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
}: PlaygroundBlockCardProps) {
  const isDragging = draggingId === block.id;
  const isOver = overId === block.id && !isDragging;

  return (
    <div
      className={`playground-block ${block.enabled ? 'is-enabled' : 'is-disabled'} ${isDragging ? 'is-dragging' : ''} ${isOver ? 'is-over' : ''}`}
      draggable
      onDragStart={() => onDragStart(block.id)}
      onDragEnter={(event) => {
        event.preventDefault();
        onDragEnter(block.id);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragEnd={onDragEnd}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(block.id);
      }}
    >
      <button
        type="button"
        className="playground-block__surface"
        onClick={() => onToggle(block.id)}
        aria-pressed={block.enabled}
        aria-label={`${block.enabled ? 'Disable' : 'Enable'} ${block.label} (${block.noteName})`}
      >
        <span className="playground-block__role">{block.label}</span>
        <span className="playground-block__note">{block.noteName}</span>
      </button>
      <span className="playground-block__handle" aria-hidden>
        ⋮⋮
      </span>
    </div>
  );
}

export function PlaygroundPanel({
  chordSymbol,
  chordTones,
  selectedExtensions,
  blocks,
  onReorder,
  onToggle,
  notice,
}: PlaygroundPanelProps) {
  const activeExtensionKeys = useMemo(
    () => getActiveExtensionKeys(selectedExtensions),
    [selectedExtensions]
  );

  const enabledCount = useMemo(
    () => blocks.filter(block => block.enabled).length,
    [blocks]
  );

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const handleDrop = useCallback((targetId: PlaygroundBlock['id']) => {
    if (!draggingId) return;
    const reordered = reorderBlocks(blocks, draggingId, targetId);
    onReorder(reordered);
    setDraggingId(null);
    setOverId(null);
  }, [blocks, draggingId, onReorder]);

  const handleRowDrop = useCallback(() => {
    if (!draggingId || blocks.length === 0) return;
    const reordered = reorderBlocks(blocks, draggingId, blocks[blocks.length - 1].id);
    onReorder(reordered);
    setDraggingId(null);
    setOverId(null);
  }, [blocks, draggingId, onReorder]);

  return (
    <div className="playground-panel">
      <div className="playground-panel__header">
        <p className="playground-panel__eyebrow">Playground Mode</p>
        <h4 className="playground-panel__title">Freeform voicing workspace</h4>
        <p className="playground-panel__lead">
          Drag to reorder from lower → higher and click to toggle notes on/off. Presets and audio wiring land in the next tracks.
        </p>
      </div>

      <div className="playground-panel__summary">
        <div className="playground-panel__summary-item">
          <p className="playground-panel__summary-label">Chord</p>
          <p className="playground-panel__summary-value">{chordSymbol}</p>
        </div>
        <div className="playground-panel__summary-item">
          <p className="playground-panel__summary-label">Core tones</p>
          <p className="playground-panel__summary-value">
            {chordTones.root} · {chordTones.third} · {chordTones.fifth} · {chordTones.seventh}
          </p>
        </div>
        <div className="playground-panel__summary-item">
          <p className="playground-panel__summary-label">Extensions</p>
          <p className="playground-panel__summary-value">
            {activeExtensionKeys.length > 0 ? activeExtensionKeys.join(', ') : 'None selected'}
          </p>
        </div>
        <div className="playground-panel__summary-item">
          <p className="playground-panel__summary-label">Blocks ready</p>
          <p className="playground-panel__summary-value">{enabledCount} enabled / {blocks.length} total</p>
        </div>
      </div>

      <div
        className="playground-block-row"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleRowDrop();
        }}
      >
        {blocks.map((block) => (
          <PlaygroundBlockCard
            key={block.id}
            block={block}
            draggingId={draggingId}
            overId={overId}
            onToggle={onToggle}
            onDragStart={(id) => setDraggingId(id)}
            onDragEnter={(id) => setOverId(id)}
            onDragEnd={() => {
              setDraggingId(null);
              setOverId(null);
            }}
            onDrop={handleDrop}
          />
        ))}
      </div>

      <div className="playground-axis">◀ Lower — drag to reorder — Higher ▶</div>

      {notice && (
        <div className="playground-notice" role="status">{notice}</div>
      )}

      <div className="playground-presets">
        <p className="playground-presets__label">Quick presets</p>
        <div className="playground-presets__buttons">
          <button type="button" className="playground-preset" disabled title="Coming soon">Shell A</button>
          <button type="button" className="playground-preset" disabled title="Coming soon">Shell B</button>
          <button type="button" className="playground-preset" disabled title="Coming soon">Open</button>
          <button type="button" className="playground-preset" disabled title="Coming soon">Reset</button>
        </div>
      </div>
    </div>
  );
}

export default PlaygroundPanel;
