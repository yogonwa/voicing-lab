/**
 * ScoreDisplay Component
 *
 * Shows the score breakdown after a voicing is submitted.
 * Displays motion analysis, pattern bonus, and playability feedback.
 */

import React from 'react';
import type { VoicingScore } from '../../lib/voiceLeadingAnalysis';
import { describeMotion } from '../../lib/voiceLeadingAnalysis';

interface ScoreDisplayProps {
  score: VoicingScore;
  onContinue: () => void;
}

export function ScoreDisplay({ score, onContinue }: ScoreDisplayProps) {
  const { total, motionScore, patternBonus, playabilityScore, motionAnalysis, patternName, warnings } = score;

  // Determine grade based on total score
  const getGrade = (score: number): { letter: string; color: string } => {
    if (score >= 90) return { letter: 'A', color: 'var(--color-success)' };
    if (score >= 80) return { letter: 'B', color: 'var(--color-info)' };
    if (score >= 70) return { letter: 'C', color: 'var(--color-warning)' };
    if (score >= 60) return { letter: 'D', color: 'var(--color-warning)' };
    return { letter: 'F', color: 'var(--color-error)' };
  };

  const grade = getGrade(total);

  return (
    <div className="score-display">
      <div className="score-display__header">
        <div
          className="score-display__grade"
          style={{ backgroundColor: grade.color }}
        >
          {grade.letter}
        </div>
        <div className="score-display__total">
          <span className="score-display__total-value">{total}</span>
          <span className="score-display__total-max">/100</span>
        </div>
      </div>

      <div className="score-display__breakdown">
        {/* Voice Motion */}
        <div className="score-category">
          <div className="score-category__header">
            <span className="score-category__name">Voice Motion</span>
            <span className="score-category__value">{motionScore}/50</span>
          </div>
          <ul className="score-category__details">
            {motionAnalysis.commonTones > 0 && (
              <li className="score-detail score-detail--good">
                {motionAnalysis.commonTones} common tone{motionAnalysis.commonTones > 1 ? 's' : ''} ✓
              </li>
            )}
            {motionAnalysis.halfSteps > 0 && (
              <li className="score-detail score-detail--good">
                {motionAnalysis.halfSteps} half-step motion{motionAnalysis.halfSteps > 1 ? 's' : ''} ✓
              </li>
            )}
            {motionAnalysis.largeLeaps > 0 && (
              <li className="score-detail score-detail--bad">
                {motionAnalysis.largeLeaps} large leap{motionAnalysis.largeLeaps > 1 ? 's' : ''}
              </li>
            )}
            {motionAnalysis.motions.map((motion, i) => (
              <li key={i} className="score-detail score-detail--info">
                {describeMotion(motion)}
              </li>
            ))}
          </ul>
        </div>

        {/* Pattern Bonus */}
        <div className="score-category">
          <div className="score-category__header">
            <span className="score-category__name">Pattern</span>
            <span className="score-category__value">{patternBonus}/30</span>
          </div>
          {patternName ? (
            <p className="score-category__feedback score-category__feedback--good">
              {patternName} detected!
            </p>
          ) : (
            <p className="score-category__feedback">
              No standard pattern detected
            </p>
          )}
        </div>

        {/* Playability */}
        <div className="score-category">
          <div className="score-category__header">
            <span className="score-category__name">Playability</span>
            <span className="score-category__value">{playabilityScore}/20</span>
          </div>
          {warnings.filter(w => w.category === 'playability').length > 0 ? (
            <ul className="score-category__details">
              {warnings
                .filter(w => w.category === 'playability')
                .map((w, i) => (
                  <li key={i} className={`score-detail score-detail--${w.severity}`}>
                    {w.message}
                  </li>
                ))}
            </ul>
          ) : (
            <p className="score-category__feedback score-category__feedback--good">
              Good hand span ✓
            </p>
          )}
        </div>
      </div>

      <button className="score-display__continue" onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}
