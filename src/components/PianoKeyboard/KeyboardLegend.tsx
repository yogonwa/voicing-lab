/**
 * KeyboardLegend Component
 *
 * Displays color legend for chord roles and hand differentiation.
 */

import React from 'react';
import './KeyboardLegend.css';

// ============================================
// COMPONENT
// ============================================

export function KeyboardLegend() {
  return (
    <div className="keyboard-legend">
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

