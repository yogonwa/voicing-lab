/**
 * DrillSettings Component
 *
 * Controls for drill session configuration:
 *   - Drill type (3rd / 7th / guide tones)
 *   - Chord quality filter
 *   - Key (root) filter
 */

import React from 'react';
import { CIRCLE_OF_FIFTHS_ROOTS, QUALITY_LABELS, type DisplayRootName } from '../../lib/drillGenerator';
import type { DrillType } from '../../lib/spacedRepetition';
import type { ChordQuality } from '../../lib/chordCalculator';

// ============================================
// TYPES
// ============================================

export interface DrillConfig {
  drillTypes: DrillType[];
  qualities: ChordQuality[];
  roots: DisplayRootName[];
}

interface DrillSettingsProps {
  config: DrillConfig;
  onChange: (config: DrillConfig) => void;
  onStart: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const DRILL_TYPE_LABELS: Record<DrillType, string> = {
  'third': '3rd',
  'seventh': '7th',
  'guide-tones': 'Guide Tones',
};

const ALL_QUALITIES: ChordQuality[] = ['maj7', 'min7', 'dom7', 'min7b5'];

// ============================================
// HELPERS
// ============================================

function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

// ============================================
// COMPONENT
// ============================================

export function DrillSettings({ config, onChange, onStart }: DrillSettingsProps) {
  function toggleDrillType(t: DrillType) {
    const next = toggle(config.drillTypes, t);
    if (next.length === 0) return; // at least one must be selected
    onChange({ ...config, drillTypes: next });
  }

  function toggleQuality(q: ChordQuality) {
    const next = toggle(config.qualities, q);
    if (next.length === 0) return;
    onChange({ ...config, qualities: next });
  }

  function toggleRoot(r: DisplayRootName) {
    const next = toggle(config.roots, r);
    if (next.length === 0) return;
    onChange({ ...config, roots: next });
  }

  function selectAllRoots() {
    onChange({ ...config, roots: [...CIRCLE_OF_FIFTHS_ROOTS] });
  }

  return (
    <div className="drill-settings">
      <h3>Drill Settings</h3>

      <div className="drill-settings__group">
        <span className="drill-settings__label">Drill Type</span>
        <div className="drill-settings__buttons">
          {(['third', 'seventh', 'guide-tones'] as DrillType[]).map((t) => (
            <button
              key={t}
              className={`drill-settings__btn${config.drillTypes.includes(t) ? ' drill-settings__btn--active' : ''}`}
              onClick={() => toggleDrillType(t)}
            >
              {DRILL_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="drill-settings__group">
        <span className="drill-settings__label">Chord Quality</span>
        <div className="drill-settings__buttons">
          {ALL_QUALITIES.map((q) => (
            <button
              key={q}
              className={`drill-settings__btn${config.qualities.includes(q) ? ' drill-settings__btn--active' : ''}`}
              onClick={() => toggleQuality(q)}
            >
              {QUALITY_LABELS[q]}
            </button>
          ))}
        </div>
      </div>

      <div className="drill-settings__group">
        <span className="drill-settings__label">
          Keys ({config.roots.length}/{CIRCLE_OF_FIFTHS_ROOTS.length})
          {config.roots.length < CIRCLE_OF_FIFTHS_ROOTS.length && (
            <button
              style={{ marginLeft: 8, fontSize: '0.8rem', padding: '2px 8px', cursor: 'pointer' }}
              onClick={selectAllRoots}
            >
              All
            </button>
          )}
        </span>
        <div className="drill-settings__buttons">
          {CIRCLE_OF_FIFTHS_ROOTS.map((r) => (
            <button
              key={r}
              className={`drill-settings__btn${config.roots.includes(r) ? ' drill-settings__btn--active' : ''}`}
              onClick={() => toggleRoot(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="drill-settings__actions">
        <button className="drill-settings__start" onClick={onStart}>
          Start Session
        </button>
      </div>
    </div>
  );
}
