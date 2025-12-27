/**
 * WarningCard Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { WarningCard } from './WarningCard';
import type { VoicingWarning } from '../../lib/voicingAnalysis';

describe('WarningCard', () => {
  it('renders error severity', () => {
    const warning: VoicingWarning = {
      id: 'test-error',
      severity: 'error',
      category: 'harmony',
      message: 'Critical issue',
      explanation: 'This is very bad',
      suggestion: 'Fix it now',
    };

    render(<WarningCard warning={warning} />);
    
    expect(screen.getByText('Critical issue')).toBeInTheDocument();
    expect(screen.getByText(/This is very bad/i)).toBeInTheDocument();
    expect(screen.getByText(/Fix it now/i)).toBeInTheDocument();
  });

  it('renders warning severity', () => {
    const warning: VoicingWarning = {
      id: 'test-warning',
      severity: 'warning',
      category: 'harmony',
      message: 'Minor issue',
      explanation: 'This could be better',
    };

    render(<WarningCard warning={warning} />);
    
    expect(screen.getByText('Minor issue')).toBeInTheDocument();
    expect(screen.getByText(/This could be better/i)).toBeInTheDocument();
  });

  it('renders suggestion severity', () => {
    const warning: VoicingWarning = {
      id: 'test-suggestion',
      severity: 'suggestion',
      category: 'voicing',
      message: 'Consider this',
      explanation: 'This might help',
      suggestion: 'Try this approach',
    };

    render(<WarningCard warning={warning} />);
    
    expect(screen.getByText('Consider this')).toBeInTheDocument();
    expect(screen.getByText(/This might help/i)).toBeInTheDocument();
    expect(screen.getByText(/Try this approach/i)).toBeInTheDocument();
  });

  it('renders without suggestion when not provided', () => {
    const warning: VoicingWarning = {
      id: 'test',
      severity: 'warning',
      category: 'harmony',
      message: 'Issue',
      explanation: 'Explanation',
    };

    render(<WarningCard warning={warning} />);
    
    expect(screen.getByText('Issue')).toBeInTheDocument();
    expect(screen.queryByText(/Suggestion:/i)).not.toBeInTheDocument();
  });

  it('applies correct CSS class for severity', () => {
    const warning: VoicingWarning = {
      id: 'test',
      severity: 'error',
      category: 'harmony',
      message: 'Test',
      explanation: 'Test',
    };

    const { container } = render(<WarningCard warning={warning} />);
    
    const card = container.querySelector('.warning-card--error');
    expect(card).toBeInTheDocument();
  });
});

