/**
 * HelpToggle Component
 * 
 * Collapsible instructions for Playground Mode with localStorage persistence.
 * Shows on first visit, then hides. Can be toggled with [?] button.
 */

import React, { useState, useEffect } from 'react';
import './HelpToggle.css';

const STORAGE_KEY = 'voicing-lab-has-seen-instructions';

interface HelpToggleProps {
  /** Force show/hide (for testing) */
  forceShow?: boolean;
}

export function HelpToggle({ forceShow }: HelpToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasSeenBefore, setHasSeenBefore] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY) === 'true';
    setHasSeenBefore(seen);
    
    // Auto-show on first visit (unless forced)
    if (!seen && forceShow !== false) {
      setIsExpanded(true);
    }
  }, [forceShow]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleGotIt = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasSeenBefore(true);
    setIsExpanded(false);
  };

  // If forceShow is explicitly set, use that
  const shouldShow = forceShow !== undefined ? forceShow : isExpanded;

  return (
    <div className="help-toggle">
      <button
        className="help-toggle__button"
        onClick={handleToggle}
        aria-label={shouldShow ? 'Hide instructions' : 'Show instructions'}
        aria-expanded={shouldShow}
        title="Toggle instructions"
      >
        ?
      </button>

      {shouldShow && (
        <div className="help-toggle__panel" role="region" aria-label="Instructions">
          <div className="help-toggle__header">
            <h3 className="help-toggle__title">
              <span aria-hidden="true">ℹ️</span> How Playground Mode Works
            </h3>
          </div>
          
          <ol className="help-toggle__steps">
            <li>Select notes below to add to your voicing</li>
            <li>Drag blocks to reorder (left=low, right=high)</li>
            <li>Click × to remove notes</li>
            <li>Play to hear on keyboard</li>
          </ol>

          <div className="help-toggle__footer">
            <button
              className="help-toggle__got-it"
              onClick={handleGotIt}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HelpToggle;

