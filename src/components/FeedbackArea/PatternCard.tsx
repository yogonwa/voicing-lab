/**
 * PatternCard Component
 *
 * Displays detected voicing pattern with expandable details.
 * Provides celebratory feedback when user builds a recognized pattern.
 * Collapsed by default showing name + teaser, expands for full info.
 */

import React, { useState, useEffect, useRef } from 'react';
import type { DetectedPattern } from '../../lib/voicingRecognition';
import { getFuzzyMatchSuggestion } from '../../lib/voicingRecognition';
import { formatVoicingRole } from '../../lib/noteUtils';
import { getPatternById } from '../../lib/patterns';

interface PatternCardProps {
  pattern: DetectedPattern;
}

// Category display names and colors
const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  shell: { label: 'Shell', color: '#fc8181' },
  rootless: { label: 'Rootless', color: '#63b3ed' },
  spread: { label: 'Spread', color: '#68d391' },
  inversion: { label: 'Inversion', color: '#b794f4' },
  slash: { label: 'Slash', color: '#f6ad55' },
};

// Chord function badge labels
const CHORD_FUNCTION_LABELS: Record<string, string> = {
  ii: 'ii',
  V: 'V',
  I: 'I',
};

export function PatternCard({ pattern }: PatternCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isNewDiscovery, setIsNewDiscovery] = useState(true);
  const previousPatternId = useRef<string | null>(null);

  const { name, matchType, confidence, patternData, extraNotes } = pattern;
  const categoryConfig = CATEGORY_CONFIG[patternData.category] || { label: 'Pattern', color: '#a0aec0' };

  // Detect new pattern discoveries for celebration animation
  useEffect(() => {
    if (previousPatternId.current !== pattern.id) {
      setIsNewDiscovery(true);
      previousPatternId.current = pattern.id;

      // Reset the animation flag after it plays
      const timer = setTimeout(() => setIsNewDiscovery(false), 600);
      return () => clearTimeout(timer);
    }
  }, [pattern.id]);

  // Build celebration title
  const celebrationTitle = matchType === 'exact'
    ? `You built a ${name}!`
    : `You built a ${name}`;

  // Format fuzzy match description
  const fuzzyDescription = matchType === 'fuzzy' && extraNotes && extraNotes.length > 0
    ? `with added ${extraNotes.map(role => formatVoicingRole(role)).join(', ')}`
    : null;

  return (
    <div
      className={`feedback-card pattern-card ${isNewDiscovery ? 'pattern-card--discovered' : ''}`}
      style={{ borderLeftColor: categoryConfig.color }}
    >
      <button
        className="pattern-card__header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="pattern-card__title-row">
          <span className="pattern-card__icon" aria-hidden="true">
            {matchType === 'exact' ? '✨' : '🎹'}
          </span>
          <h4 className="pattern-card__title">{celebrationTitle}</h4>

          {/* Category badge */}
          <span
            className="pattern-card__category-badge"
            style={{ backgroundColor: categoryConfig.color }}
          >
            {categoryConfig.label}
          </span>

          {/* Confidence badge for fuzzy matches */}
          {matchType === 'fuzzy' && (
            <span className="pattern-card__badge" title={`${confidence}% match`}>
              ~{confidence}%
            </span>
          )}
        </div>

        {/* Fuzzy match description */}
        {fuzzyDescription && (
          <p className="pattern-card__fuzzy-desc">{fuzzyDescription}</p>
        )}

        {/* Teaser */}
        <p className="pattern-card__teaser">
          {patternData.soundCharacter || patternData.description}
        </p>

        {/* Chord function badges (collapsed view) */}
        {patternData.recommendedFor && patternData.recommendedFor.length > 0 && (
          <div className="pattern-card__functions">
            {patternData.recommendedFor.map(func => (
              <span key={func} className="pattern-card__function-badge">
                {CHORD_FUNCTION_LABELS[func] || func}
              </span>
            ))}
          </div>
        )}

        <span className="pattern-card__expand-icon" aria-hidden="true">
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>

      {isExpanded && (
        <div className="pattern-card__content">
          <div className="pattern-card__section">
            <h5 className="pattern-card__section-title">What it is</h5>
            <p>{patternData.description}</p>
          </div>

          {/* Why It Works - prominent callout */}
          <div className="pattern-card__why-callout">
            <span className="pattern-card__why-icon" aria-hidden="true">💡</span>
            <div>
              <h5 className="pattern-card__section-title">Why it works</h5>
              <p>{patternData.whyItWorks}</p>
            </div>
          </div>

          <div className="pattern-card__section">
            <h5 className="pattern-card__section-title">When to use</h5>
            <p>{patternData.commonUse}</p>
          </div>

          {patternData.caution && (
            <div className="pattern-card__caution">
              <strong>⚠️ Note:</strong> {patternData.caution}
            </div>
          )}

          {matchType === 'fuzzy' && extraNotes && extraNotes.length > 0 && (
            <div className="pattern-card__extra">
              <strong>Extra notes:</strong> {extraNotes.map(role => formatVoicingRole(role)).join(', ')}
              {getFuzzyMatchSuggestion(pattern) && (
                <p className="pattern-card__suggestion">
                  {getFuzzyMatchSuggestion(pattern)}
                </p>
              )}
            </div>
          )}

          {/* Related patterns section */}
          {patternData.relatedPatterns && patternData.relatedPatterns.length > 0 && (
            <div className="pattern-card__related">
              <h5 className="pattern-card__section-title">Related patterns</h5>
              <div className="pattern-card__related-list">
                {patternData.relatedPatterns.map(relatedId => {
                  const related = getPatternById(relatedId);
                  if (!related) return null;
                  return (
                    <span key={relatedId} className="pattern-card__related-tag">
                      {related.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PatternCard;

