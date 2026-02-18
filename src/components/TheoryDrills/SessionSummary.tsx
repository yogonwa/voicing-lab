/**
 * SessionSummary Component
 *
 * Displayed at the end of a drill session.
 * Shows:
 *   - Cards reviewed count
 *   - Accuracy %
 *   - New vs. review cards
 *   - Leech notification (cards with lapseCount >= 4)
 */

import React from 'react';
import type { CardState } from '../../lib/spacedRepetition';

// ============================================
// TYPES
// ============================================

interface SessionResult {
  totalCards: number;
  correctCount: number;
  wrongCount: number;
  newCards: number;
  reviewCards: number;
  leeches: CardState[];
}

interface SessionSummaryProps {
  result: SessionResult;
  onNewSession: () => void;
  onSettings: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function SessionSummary({ result, onNewSession, onSettings }: SessionSummaryProps) {
  const accuracy = result.totalCards > 0
    ? Math.round((result.correctCount / result.totalCards) * 100)
    : 0;

  return (
    <div className="session-summary">
      <h2 className="session-summary__title">Session Complete</h2>

      <div className="session-summary__stats">
        <div className="session-summary__stat">
          <div className="session-summary__stat-value">{result.totalCards}</div>
          <div className="session-summary__stat-label">Cards</div>
        </div>
        <div className="session-summary__stat">
          <div className="session-summary__stat-value">{accuracy}%</div>
          <div className="session-summary__stat-label">Accuracy</div>
        </div>
        <div className="session-summary__stat">
          <div className="session-summary__stat-value">{result.newCards}</div>
          <div className="session-summary__stat-label">New</div>
        </div>
      </div>

      {result.leeches.length > 0 && (
        <div className="session-summary__leeches">
          <p className="session-summary__leeches-title">
            Tricky Cards ({result.leeches.length})
          </p>
          <p className="session-summary__leeches-hint">
            These keep tripping you up. Try humming the interval or playing it on the piano before the next review.
          </p>
          <ul className="session-summary__leech-list">
            {result.leeches.map((card) => (
              <li key={card.id} className="session-summary__leech-item">
                {card.id.replace(/-third$/, ' 3rd').replace(/-seventh$/, ' 7th').replace(/-guide-tones$/, ' GT')}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="session-summary__actions">
        <button className="session-summary__btn session-summary__btn--secondary" onClick={onSettings}>
          Settings
        </button>
        <button className="session-summary__btn session-summary__btn--primary" onClick={onNewSession}>
          New Session
        </button>
      </div>
    </div>
  );
}
