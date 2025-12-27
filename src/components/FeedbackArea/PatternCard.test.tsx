/**
 * PatternCard Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatternCard } from './PatternCard';
import type { DetectedPattern } from '../../lib/voicingRecognition';

describe('PatternCard', () => {
  const exactPattern: DetectedPattern = {
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
      whyItWorks: 'The 3rd and 7th are essential',
      commonUse: 'Left-hand comping',
      soundCharacter: 'Clean and focused',
    },
  };

  it('renders pattern name', () => {
    render(<PatternCard pattern={exactPattern} />);
    
    expect(screen.getByText('Shell Position A')).toBeInTheDocument();
  });

  it('renders teaser text', () => {
    render(<PatternCard pattern={exactPattern} />);
    
    expect(screen.getByText(/Clean and focused/i)).toBeInTheDocument();
  });

  it('starts collapsed', () => {
    render(<PatternCard pattern={exactPattern} />);
    
    expect(screen.queryByText(/The 3rd and 7th are essential/i)).not.toBeInTheDocument();
  });

  it('expands when clicked', () => {
    render(<PatternCard pattern={exactPattern} />);
    
    const header = screen.getByRole('button');
    fireEvent.click(header);
    
    expect(screen.getByText(/The 3rd and 7th are essential/i)).toBeInTheDocument();
    expect(screen.getByText(/Left-hand comping/i)).toBeInTheDocument();
  });

  it('collapses when clicked again', () => {
    render(<PatternCard pattern={exactPattern} />);
    
    const header = screen.getByRole('button');
    
    // Expand
    fireEvent.click(header);
    expect(screen.getByText(/The 3rd and 7th are essential/i)).toBeInTheDocument();
    
    // Collapse
    fireEvent.click(header);
    expect(screen.queryByText(/The 3rd and 7th are essential/i)).not.toBeInTheDocument();
  });

  it('shows confidence badge for fuzzy matches', () => {
    const fuzzyPattern: DetectedPattern = {
      ...exactPattern,
      matchType: 'fuzzy',
      confidence: 85,
      extraNotes: ['fifth', 'ninth'],
    };

    render(<PatternCard pattern={fuzzyPattern} />);
    
    expect(screen.getByText(/~85%/i)).toBeInTheDocument();
  });

  it('does not show badge for exact matches', () => {
    render(<PatternCard pattern={exactPattern} />);
    
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('shows extra notes for fuzzy matches when expanded', () => {
    const fuzzyPattern: DetectedPattern = {
      ...exactPattern,
      matchType: 'fuzzy',
      confidence: 85,
      extraNotes: ['fifth', 'ninth'],
    };

    render(<PatternCard pattern={fuzzyPattern} />);
    
    const header = screen.getByRole('button');
    fireEvent.click(header);
    
    expect(screen.getByText(/Extra notes/i)).toBeInTheDocument();
  });

  it('shows caution when present', () => {
    const patternWithCaution: DetectedPattern = {
      ...exactPattern,
      patternData: {
        ...exactPattern.patternData,
        caution: 'Sounds sparse alone',
      },
    };

    render(<PatternCard pattern={patternWithCaution} />);
    
    const header = screen.getByRole('button');
    fireEvent.click(header);
    
    expect(screen.getByText(/Sounds sparse alone/i)).toBeInTheDocument();
  });
});

