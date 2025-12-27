/**
 * WarningCard Component
 * 
 * Displays voicing quality warnings with severity levels.
 * Always expanded (important to see).
 */

import React from 'react';
import type { VoicingWarning } from '../../lib/voicingAnalysis';

interface WarningCardProps {
  warning: VoicingWarning;
}

export function WarningCard({ warning }: WarningCardProps) {
  const { severity, message, explanation, suggestion } = warning;

  const severityConfig = {
    error: {
      icon: '🔴',
      color: '#fc8181',
      label: 'Error',
    },
    warning: {
      icon: '⚠️',
      color: '#f6ad55',
      label: 'Warning',
    },
    suggestion: {
      icon: '💬',
      color: '#63b3ed',
      label: 'Suggestion',
    },
  };

  const config = severityConfig[severity];

  return (
    <div
      className={`feedback-card warning-card warning-card--${severity}`}
      style={{ borderLeftColor: config.color }}
    >
      <div className="warning-card__header">
        <span className="warning-card__icon" aria-hidden="true">{config.icon}</span>
        <h4 className="warning-card__title">{message}</h4>
      </div>

      <p className="warning-card__explanation">{explanation}</p>

      {suggestion && (
        <p className="warning-card__suggestion">
          <strong>Suggestion:</strong> {suggestion}
        </p>
      )}
    </div>
  );
}

export default WarningCard;

