/**
 * FeedbackArea Component
 * 
 * Unified feedback display below keyboard that intelligently shows:
 * - Pattern recognition (positive feedback)
 * - Warnings (constructive feedback)
 * - Extension tips (educational context)
 * 
 * Replaces the old tips section with smarter, prioritized feedback.
 */

import React from 'react';
import './FeedbackArea.css';
import { PatternCard } from './PatternCard';
import { WarningCard } from './WarningCard';
import type { DetectedPattern } from '../../lib/voicingRecognition';
import type { VoicingWarning } from '../../lib/voicingAnalysis';

interface ExtensionTip {
  key: string;
  tip: string;
}

interface FeedbackAreaProps {
  detectedPattern?: DetectedPattern | null;
  warnings?: VoicingWarning[];
  extensionTips?: ExtensionTip[];
}

export function FeedbackArea({
  detectedPattern,
  warnings = [],
  extensionTips = [],
}: FeedbackAreaProps) {
  // Prioritize feedback: errors > patterns > warnings > suggestions > tips
  const errors = warnings.filter(w => w.severity === 'error');
  const regularWarnings = warnings.filter(w => w.severity === 'warning');
  const suggestions = warnings.filter(w => w.severity === 'suggestion');

  const hasAnyFeedback = detectedPattern || warnings.length > 0 || extensionTips.length > 0;

  if (!hasAnyFeedback) {
    return (
      <div className="feedback-area">
        <div className="feedback-area__empty">
          <span className="feedback-area__empty-icon" aria-hidden="true">🎵</span>
          <h4 className="feedback-area__empty-title">Build a voicing to discover patterns</h4>
          <p className="feedback-area__empty-text">
            Drag notes to explore different voicing types and get instant feedback.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-area">
      {/* Errors first (critical) */}
      {errors.map(error => (
        <WarningCard key={error.id} warning={error} />
      ))}

      {/* Pattern recognition (positive reinforcement) */}
      {detectedPattern && <PatternCard pattern={detectedPattern} />}

      {/* Warnings (constructive feedback) */}
      {regularWarnings.map(warning => (
        <WarningCard key={warning.id} warning={warning} />
      ))}

      {/* Suggestions (optional improvements) */}
      {suggestions.map(suggestion => (
        <WarningCard key={suggestion.id} warning={suggestion} />
      ))}

      {/* Extension tips (educational context) */}
      {extensionTips.length > 0 && (
        <div className="feedback-card tip-card">
          <h4 className="tip-card__title">
            <span aria-hidden="true">💡</span> Extension Tips
          </h4>
          <div className="tip-card__content">
            {extensionTips.map(({ key, tip }) => (
              <p key={key} className="tip-card__item">
                <strong>{key}:</strong> {tip}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedbackArea;

