/**
 * PatternCard Component
 * 
 * Displays detected voicing pattern with expandable details.
 * Collapsed by default showing name + teaser, expands for full info.
 */

import React, { useState } from 'react';
import type { DetectedPattern } from '../../lib/voicingRecognition';

interface PatternCardProps {
  pattern: DetectedPattern;
}

export function PatternCard({ pattern }: PatternCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { name, matchType, confidence, patternData } = pattern;
  const categoryColors: Record<string, string> = {
    shell: '#fc8181',
    rootless: '#63b3ed',
    spread: '#68d391',
    inversion: '#b794f4',
    slash: '#f6ad55',
  };

  const color = categoryColors[patternData.category] || '#a0aec0';

  return (
    <div className="feedback-card pattern-card" style={{ borderLeftColor: color }}>
      <button
        className="pattern-card__header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="pattern-card__title-row">
          <span className="pattern-card__icon" aria-hidden="true">🎹</span>
          <h4 className="pattern-card__title">{name}</h4>
          {matchType === 'fuzzy' && (
            <span className="pattern-card__badge" title={`${confidence}% match`}>
              ~{confidence}%
            </span>
          )}
        </div>
        <p className="pattern-card__teaser">
          {patternData.soundCharacter || patternData.description}
        </p>
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

          <div className="pattern-card__section">
            <h5 className="pattern-card__section-title">Why it works</h5>
            <p>{patternData.whyItWorks}</p>
          </div>

          <div className="pattern-card__section">
            <h5 className="pattern-card__section-title">When to use</h5>
            <p>{patternData.commonUse}</p>
          </div>

          {patternData.recommendedFor && patternData.recommendedFor.length > 0 && (
            <div className="pattern-card__section">
              <h5 className="pattern-card__section-title">Best for</h5>
              <p>{patternData.recommendedFor.join(', ')} chords</p>
            </div>
          )}

          {patternData.caution && (
            <div className="pattern-card__caution">
              <strong>⚠️ Note:</strong> {patternData.caution}
            </div>
          )}

          {matchType === 'fuzzy' && pattern.extraNotes && pattern.extraNotes.length > 0 && (
            <div className="pattern-card__extra">
              <strong>Extra notes:</strong> {pattern.extraNotes.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PatternCard;

