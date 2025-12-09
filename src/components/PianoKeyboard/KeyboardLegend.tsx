/**
 * KeyboardLegend Component
 *
 * Displays color legend for chord roles (basic + extensions) and hand differentiation.
 */

import React from 'react';
import './KeyboardLegend.css';

// ============================================
// TYPES
// ============================================

interface KeyboardLegendProps {
  /** Show extension colors in legend */
  showExtensions?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function KeyboardLegend({ showExtensions = false }: KeyboardLegendProps) {
  return (
    <div className="keyboard-legend">
      {/* Basic chord tones */}
      <div className="keyboard-legend__roles">
        <span className="keyboard-legend__item keyboard-legend__item--root">
          <span className="keyboard-legend__color"></span>
          Root
        </span>
        <span className="keyboard-legend__item keyboard-legend__item--third">
          <span className="keyboard-legend__color"></span>
          3rd
        </span>
        <span className="keyboard-legend__item keyboard-legend__item--fifth">
          <span className="keyboard-legend__color"></span>
          5th
        </span>
        <span className="keyboard-legend__item keyboard-legend__item--seventh">
          <span className="keyboard-legend__color"></span>
          7th
        </span>
      </div>

      {/* Extension tones (shown when using extended voicings) */}
      {showExtensions && (
        <div className="keyboard-legend__roles keyboard-legend__extensions">
          <span className="keyboard-legend__item keyboard-legend__item--ninth">
            <span className="keyboard-legend__color"></span>
            9th
          </span>
          <span className="keyboard-legend__item keyboard-legend__item--thirteenth">
            <span className="keyboard-legend__color"></span>
            13th
          </span>
        </div>
      )}

      {/* Hand differentiation */}
      <div className="keyboard-legend__hands">
        <span className="keyboard-legend__hand keyboard-legend__hand--left">
          ━━ Left Hand
        </span>
        <span className="keyboard-legend__hand keyboard-legend__hand--right">
          ── Right Hand
        </span>
      </div>
    </div>
  );
}

export default KeyboardLegend;

