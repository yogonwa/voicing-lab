/**
 * PlaygroundPanel Component
 *
 * Initial scaffold for the drag-and-drop playground experience.
 * Currently renders static blocks that mirror the existing voicing order.
 */

import React, { useMemo } from 'react';
import {
  ExtendedChordTones,
  SelectedExtensions,
  EXTENSION_LABELS,
  ExtensionKey,
} from '../../lib';

// ============================================
// TYPES
// ============================================

export interface PlaygroundBlock {
  id: string;
  label: string;
  note: string;
  role: string;
  enabled: boolean;
  isExtension: boolean;
}

interface PlaygroundPanelProps {
  chordTones: ExtendedChordTones;
  selectedExtensions: SelectedExtensions;
}

const EXTENSION_ORDER: ExtensionKey[] = [
  'ninth',
  'flatNinth',
  'sharpNinth',
  'eleventh',
  'sharpEleventh',
  'thirteenth',
  'flatThirteenth',
];

// ============================================
// COMPONENT
// ============================================

export function PlaygroundPanel({ chordTones, selectedExtensions }: PlaygroundPanelProps) {
  const blocks = useMemo<PlaygroundBlock[]>(() => {
    const chordToneBlocks: PlaygroundBlock[] = [
      { id: 'root', label: 'R', note: chordTones.root, role: 'root', enabled: true, isExtension: false },
      { id: 'third', label: '3', note: chordTones.third, role: 'third', enabled: true, isExtension: false },
      { id: 'fifth', label: '5', note: chordTones.fifth, role: 'fifth', enabled: true, isExtension: false },
      { id: 'seventh', label: '7', note: chordTones.seventh, role: 'seventh', enabled: true, isExtension: false },
    ];

    const extensionBlocks: PlaygroundBlock[] = [];

    EXTENSION_ORDER.forEach((key) => {
      let note: string | undefined;
      let role: string = key;

      switch (key) {
        case 'ninth':
          note = chordTones.extensions?.ninth;
          role = 'ninth';
          break;
        case 'flatNinth':
          note = chordTones.alterations?.flatNinth;
          role = 'flat-ninth';
          break;
        case 'sharpNinth':
          note = chordTones.alterations?.sharpNinth;
          role = 'sharp-ninth';
          break;
        case 'eleventh':
          note = chordTones.extensions?.eleventh;
          role = 'eleventh';
          break;
        case 'sharpEleventh':
          note = chordTones.extensions?.sharpEleventh;
          role = 'sharp-eleventh';
          break;
        case 'thirteenth':
          note = chordTones.extensions?.thirteenth;
          role = 'thirteenth';
          break;
        case 'flatThirteenth':
          note = chordTones.alterations?.flatThirteenth;
          role = 'flat-thirteenth';
          break;
        default:
          break;
      }

      if (note) {
        extensionBlocks.push({
          id: key,
          label: EXTENSION_LABELS[key],
          note,
          role,
          enabled: Boolean(selectedExtensions[key]),
          isExtension: true,
        });
      }
    });

    return [...chordToneBlocks, ...extensionBlocks];
  }, [chordTones, selectedExtensions]);

  return (
    <div className="playground-panel">
      <div className="playground-panel__header">
        <div>
          <p className="playground-panel__eyebrow">Playground Mode</p>
          <h4 className="playground-panel__title">Drag to reorder • Click to toggle</h4>
        </div>
        <span className="playground-panel__status-badge">Scaffold</span>
      </div>

      <p className="playground-panel__description">
        This scaffold mirrors the current template voicing order so we can wire up audio and keyboard
        plumbing. Interactive drag-and-drop blocks land next.
      </p>

      <div className="playground-blocks">
        {blocks.map((block) => {
          const classes = [
            'playground-block',
            `note-block--${block.role}`,
            block.enabled ? 'is-enabled' : 'is-disabled',
            block.isExtension ? 'is-extension' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div key={block.id} className={classes}>
              <span className="playground-block__label">{block.label}</span>
              <span className="playground-block__note">{block.note}</span>
              {!block.enabled && <span className="playground-block__state">off</span>}
            </div>
          );
        })}
      </div>

      <div className="playground-panel__helper">
        <p>
          Need a starting point? Presets and drag gestures will appear here soon. For now, blocks follow
          the fixed R-3-5-7 order plus any enabled extensions.
        </p>
      </div>
    </div>
  );
}

export default PlaygroundPanel;
