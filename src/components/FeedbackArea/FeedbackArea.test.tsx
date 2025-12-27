/**
 * FeedbackArea Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeedbackArea } from './FeedbackArea';
import type { DetectedPattern } from '../../lib/voicingRecognition';
import type { VoicingWarning } from '../../lib/voicingAnalysis';

describe('FeedbackArea', () => {
  it('shows empty state when no feedback', () => {
    render(<FeedbackArea />);
    
    expect(screen.getByText(/Build a voicing to discover patterns/i)).toBeInTheDocument();
  });

  it('displays detected pattern', () => {
    const pattern: DetectedPattern = {
      id: 'shell-a',
      name: 'Shell Position A',
      matchType: 'exact',
      confidence: 100,
      patternData: {
        id: 'shell-a',
        name: 'Shell Position A',
        pattern: ['root', 'third', 'seventh'],
        category: 'shell',
        description: 'Root in bass, guide tones on top',
        whyItWorks: 'Test explanation',
        commonUse: 'Test usage',
        soundCharacter: 'Clean and focused',
      },
    };

    render(<FeedbackArea detectedPattern={pattern} />);
    
    expect(screen.getByText('Shell Position A')).toBeInTheDocument();
    expect(screen.getByText(/Clean and focused/i)).toBeInTheDocument();
  });

  it('displays warnings', () => {
    const warnings: VoicingWarning[] = [
      {
        id: 'muddy-bass',
        severity: 'warning',
        category: 'harmony',
        message: 'Close intervals in bass',
        explanation: 'Notes sound muddy',
        suggestion: 'Spread them wider',
      },
    ];

    render(<FeedbackArea warnings={warnings} />);
    
    expect(screen.getByText('Close intervals in bass')).toBeInTheDocument();
    expect(screen.getByText(/Notes sound muddy/i)).toBeInTheDocument();
  });

  it('displays extension tips', () => {
    const tips = [
      { key: '9th', tip: 'Adds color and warmth' },
      { key: '♯11', tip: 'Creates Lydian sound' },
    ];

    render(<FeedbackArea extensionTips={tips} />);
    
    expect(screen.getByText(/Extension Tips/i)).toBeInTheDocument();
    expect(screen.getByText(/9th/i)).toBeInTheDocument();
    expect(screen.getByText(/Adds color and warmth/i)).toBeInTheDocument();
  });

  it('prioritizes errors over other feedback', () => {
    const warnings: VoicingWarning[] = [
      {
        id: 'error-1',
        severity: 'error',
        category: 'harmony',
        message: 'Critical error',
        explanation: 'This is bad',
      },
      {
        id: 'warning-1',
        severity: 'warning',
        category: 'harmony',
        message: 'Minor warning',
        explanation: 'This is okay',
      },
    ];

    const { container } = render(<FeedbackArea warnings={warnings} />);
    
    const cards = container.querySelectorAll('.feedback-card');
    expect(cards.length).toBe(2);
    
    // Error should appear first
    expect(screen.getByText('Critical error')).toBeInTheDocument();
  });

  it('hides empty state when feedback is present', () => {
    const warnings: VoicingWarning[] = [
      {
        id: 'test',
        severity: 'suggestion',
        category: 'voicing',
        message: 'Test suggestion',
        explanation: 'Test',
      },
    ];

    render(<FeedbackArea warnings={warnings} />);
    
    expect(screen.queryByText(/Build a voicing to discover patterns/i)).not.toBeInTheDocument();
  });
});

