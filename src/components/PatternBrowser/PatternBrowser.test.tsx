/**
 * PatternBrowser Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatternBrowser } from './PatternBrowser';
import type { VoicingPattern } from '../../lib/patterns';

describe('PatternBrowser', () => {
  const mockOnClose = jest.fn();
  const mockOnTryPattern = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    render(
      <PatternBrowser
        isOpen={false}
        onClose={mockOnClose}
        onTryPattern={mockOnTryPattern}
      />
    );

    expect(screen.queryByText('Pattern Library')).not.toBeInTheDocument();
  });

  it('renders modal when open', () => {
    render(
      <PatternBrowser
        isOpen={true}
        onClose={mockOnClose}
        onTryPattern={mockOnTryPattern}
      />
    );

    expect(screen.getByText('Pattern Library')).toBeInTheDocument();
    expect(screen.getByText(/Explore jazz voicing patterns/i)).toBeInTheDocument();
  });

  it('displays all categories', () => {
    render(
      <PatternBrowser
        isOpen={true}
        onClose={mockOnClose}
        onTryPattern={mockOnTryPattern}
      />
    );

    expect(screen.getByText('Shell Voicings')).toBeInTheDocument();
    expect(screen.getByText('Rootless Voicings')).toBeInTheDocument();
    expect(screen.getByText('Spread Voicings')).toBeInTheDocument();
    expect(screen.getByText('Inversions')).toBeInTheDocument();
    expect(screen.getByText('Slash Chords')).toBeInTheDocument();
  });

  it('expands shell category by default', () => {
    render(
      <PatternBrowser
        isOpen={true}
        onClose={mockOnClose}
        onTryPattern={mockOnTryPattern}
      />
    );

    // Shell patterns should be visible
    expect(screen.getByText('Shell Position A')).toBeInTheDocument();
    expect(screen.getByText('Shell Position B')).toBeInTheDocument();
  });

  it('closes when close button is clicked', () => {
    render(
      <PatternBrowser
        isOpen={true}
        onClose={mockOnClose}
        onTryPattern={mockOnTryPattern}
      />
    );

    const closeButton = screen.getByLabelText('Close pattern browser');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('closes when backdrop is clicked', () => {
    render(
      <PatternBrowser
        isOpen={true}
        onClose={mockOnClose}
        onTryPattern={mockOnTryPattern}
      />
    );

    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape key', () => {
    render(
      <PatternBrowser
        isOpen={true}
        onClose={mockOnClose}
        onTryPattern={mockOnTryPattern}
      />
    );

    const backdrop = screen.getByRole('dialog');
    fireEvent.keyDown(backdrop, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('toggles category expansion', () => {
    render(
      <PatternBrowser
        isOpen={true}
        onClose={mockOnClose}
        onTryPattern={mockOnTryPattern}
      />
    );

    // Shell is expanded by default
    expect(screen.getByText('Shell Position A')).toBeInTheDocument();

    // Collapse shell
    const shellHeader = screen.getByText('Shell Voicings');
    fireEvent.click(shellHeader);

    // Shell patterns should no longer be visible
    expect(screen.queryByText('Shell Position A')).not.toBeInTheDocument();
  });

  it('calls onTryPattern when Try It is clicked', () => {
    render(
      <PatternBrowser
        isOpen={true}
        onClose={mockOnClose}
        onTryPattern={mockOnTryPattern}
      />
    );

    // Find and click the first "Try It" button
    const tryItButtons = screen.getAllByText('Try It');
    fireEvent.click(tryItButtons[0]);

    expect(mockOnTryPattern).toHaveBeenCalledTimes(1);
    expect(mockOnTryPattern).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        pattern: expect.any(Array),
      })
    );
  });

  it('closes modal after Try It is clicked', () => {
    render(
      <PatternBrowser
        isOpen={true}
        onClose={mockOnClose}
        onTryPattern={mockOnTryPattern}
      />
    );

    const tryItButtons = screen.getAllByText('Try It');
    fireEvent.click(tryItButtons[0]);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows pattern count in footer', () => {
    render(
      <PatternBrowser
        isOpen={true}
        onClose={mockOnClose}
        onTryPattern={mockOnTryPattern}
      />
    );

    expect(screen.getByText(/patterns available/i)).toBeInTheDocument();
  });

  it('shows More button to expand pattern details', () => {
    render(
      <PatternBrowser
        isOpen={true}
        onClose={mockOnClose}
        onTryPattern={mockOnTryPattern}
      />
    );

    // Find and click the first "More" button
    const moreButtons = screen.getAllByText('More');
    fireEvent.click(moreButtons[0]);

    // Should now show "Less" and detailed content
    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText(/What it is:/i)).toBeInTheDocument();
    expect(screen.getByText(/Why it works:/i)).toBeInTheDocument();
    expect(screen.getByText(/When to use:/i)).toBeInTheDocument();
  });
});
