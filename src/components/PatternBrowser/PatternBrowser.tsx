/**
 * PatternBrowser Component
 *
 * Modal/panel UI for browsing the voicing pattern library.
 * Organized by category with "Try It" buttons to load patterns into Playground.
 */

import React, { useState, useCallback } from 'react';
import './PatternBrowser.css';
import {
  VOICING_PATTERNS,
  type VoicingPattern,
  getPatternsByCategory,
} from '../../lib/patterns';

interface PatternBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onTryPattern: (pattern: VoicingPattern) => void;
}

// Category display configuration
const CATEGORY_CONFIG: {
  id: VoicingPattern['category'];
  label: string;
  description: string;
  color: string;
}[] = [
  {
    id: 'shell',
    label: 'Shell Voicings',
    description: 'Root + guide tones (3rd & 7th). Essential building blocks.',
    color: '#fc8181',
  },
  {
    id: 'rootless',
    label: 'Rootless Voicings',
    description: 'No root - let the bassist cover it. Rich and modern.',
    color: '#63b3ed',
  },
  {
    id: 'spread',
    label: 'Spread Voicings',
    description: 'Open intervals. Drop-2 and two-hand voicings.',
    color: '#68d391',
  },
  {
    id: 'inversion',
    label: 'Inversions',
    description: 'Non-root bass notes. Smooth voice leading.',
    color: '#b794f4',
  },
  {
    id: 'slash',
    label: 'Slash Chords',
    description: 'Specific bass notes (e.g., C/E). Melodic bass lines.',
    color: '#f6ad55',
  },
];

// Chord function badge labels
const CHORD_FUNCTION_LABELS: Record<string, string> = {
  ii: 'ii',
  V: 'V',
  I: 'I',
};

export function PatternBrowser({ isOpen, onClose, onTryPattern }: PatternBrowserProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('shell');

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setExpandedCategory(prev => (prev === categoryId ? null : categoryId));
  }, []);

  const handleTryPattern = useCallback(
    (pattern: VoicingPattern) => {
      onTryPattern(pattern);
      onClose();
    },
    [onTryPattern, onClose]
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="pattern-browser__backdrop"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pattern-browser-title"
    >
      <div className="pattern-browser">
        <header className="pattern-browser__header">
          <h2 id="pattern-browser-title" className="pattern-browser__title">
            Pattern Library
          </h2>
          <p className="pattern-browser__subtitle">
            Explore jazz voicing patterns and try them in Playground
          </p>
          <button
            className="pattern-browser__close"
            onClick={onClose}
            aria-label="Close pattern browser"
          >
            &times;
          </button>
        </header>

        <div className="pattern-browser__content">
          {CATEGORY_CONFIG.map(category => {
            const patterns = getPatternsByCategory(category.id);
            const isExpanded = expandedCategory === category.id;

            return (
              <div key={category.id} className="pattern-browser__category">
                <button
                  className={`pattern-browser__category-header ${isExpanded ? 'is-expanded' : ''}`}
                  onClick={() => handleCategoryToggle(category.id)}
                  aria-expanded={isExpanded}
                  style={{ borderLeftColor: category.color }}
                >
                  <div className="pattern-browser__category-info">
                    <h3 className="pattern-browser__category-name">{category.label}</h3>
                    <p className="pattern-browser__category-desc">{category.description}</p>
                  </div>
                  <span className="pattern-browser__category-count">{patterns.length}</span>
                  <span className="pattern-browser__category-icon" aria-hidden="true">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </button>

                {isExpanded && (
                  <div className="pattern-browser__patterns">
                    {patterns.map(pattern => (
                      <PatternItem
                        key={pattern.id}
                        pattern={pattern}
                        categoryColor={category.color}
                        onTry={() => handleTryPattern(pattern)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <footer className="pattern-browser__footer">
          <span className="pattern-browser__count">
            {VOICING_PATTERNS.length} patterns available
          </span>
        </footer>
      </div>
    </div>
  );
}

interface PatternItemProps {
  pattern: VoicingPattern;
  categoryColor: string;
  onTry: () => void;
}

function PatternItem({ pattern, categoryColor, onTry }: PatternItemProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="pattern-item" style={{ borderLeftColor: categoryColor }}>
      <div className="pattern-item__main">
        <div className="pattern-item__info">
          <h4 className="pattern-item__name">{pattern.name}</h4>
          <p className="pattern-item__character">
            {pattern.soundCharacter || pattern.description}
          </p>

          {pattern.recommendedFor && pattern.recommendedFor.length > 0 && (
            <div className="pattern-item__functions">
              {pattern.recommendedFor.map(func => (
                <span key={func} className="pattern-item__function-badge">
                  {CHORD_FUNCTION_LABELS[func] || func}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pattern-item__actions">
          <button
            className="pattern-item__details-btn"
            onClick={() => setShowDetails(!showDetails)}
            aria-expanded={showDetails}
          >
            {showDetails ? 'Less' : 'More'}
          </button>
          <button className="pattern-item__try-btn" onClick={onTry}>
            Try It
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="pattern-item__details">
          <div className="pattern-item__section">
            <strong>What it is:</strong> {pattern.description}
          </div>
          <div className="pattern-item__section pattern-item__why">
            <strong>Why it works:</strong> {pattern.whyItWorks}
          </div>
          <div className="pattern-item__section">
            <strong>When to use:</strong> {pattern.commonUse}
          </div>
          {pattern.caution && (
            <div className="pattern-item__section pattern-item__caution">
              <strong>Note:</strong> {pattern.caution}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PatternBrowser;
