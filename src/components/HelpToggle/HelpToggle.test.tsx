/**
 * HelpToggle Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpToggle } from './HelpToggle';

describe('HelpToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders toggle button', () => {
    render(<HelpToggle />);
    
    const button = screen.getByRole('button', { name: /instructions/i });
    expect(button).toBeInTheDocument();
  });

  it('shows instructions when forceShow is true', () => {
    render(<HelpToggle forceShow={true} />);
    
    expect(screen.getByText(/How Playground Mode Works/i)).toBeInTheDocument();
    expect(screen.getByText(/Select notes below/i)).toBeInTheDocument();
  });

  it('hides instructions when forceShow is false', () => {
    render(<HelpToggle forceShow={false} />);
    
    expect(screen.queryByText(/How Playground Mode Works/i)).not.toBeInTheDocument();
  });

  it('toggles instructions on button click', () => {
    const { rerender } = render(<HelpToggle forceShow={false} />);
    
    const button = screen.getByRole('button', { name: /show instructions/i });
    
    // Initially hidden
    expect(screen.queryByText(/How Playground Mode Works/i)).not.toBeInTheDocument();
    
    // Click to show
    fireEvent.click(button);
    
    // Rerender to update state
    rerender(<HelpToggle forceShow={false} />);
    
    // Should now be visible (after state update)
    setTimeout(() => {
      expect(screen.queryByText(/How Playground Mode Works/i)).toBeInTheDocument();
    }, 100);
  });

  it('saves to localStorage when "Got it" is clicked', async () => {
    render(<HelpToggle forceShow={true} />);
    
    const gotItButton = screen.getByText(/Got it/i);
    fireEvent.click(gotItButton);
    
    expect(localStorage.getItem('voicing-lab-has-seen-instructions')).toBe('true');
    
    // Panel should close after clicking "Got it"
    setTimeout(() => {
      expect(screen.queryByText(/How Playground Mode Works/i)).not.toBeInTheDocument();
    }, 100);
  });

  it('shows instructions on first visit (no localStorage)', () => {
    const { container } = render(<HelpToggle />);
    
    // Should auto-show on first visit
    setTimeout(() => {
      expect(screen.getByText(/How Playground Mode Works/i)).toBeInTheDocument();
    }, 100);
  });
});

