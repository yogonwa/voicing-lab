import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the audio engine to avoid Tone.js ESM issues in tests
jest.mock('../lib/audioEngine');

import { VoicingDisplay } from './VoicingDisplay';

describe('VoicingDisplay', () => {
  it('renders the progression title', () => {
    render(<VoicingDisplay />);
    expect(screen.getByText(/ii-V-I in C Major/i)).toBeInTheDocument();
  });

  it('renders all three chord names', () => {
    render(<VoicingDisplay />);
    expect(screen.getByText('Dm7')).toBeInTheDocument();
    expect(screen.getByText('G7')).toBeInTheDocument();
    expect(screen.getByText('Cmaj7')).toBeInTheDocument();
  });

  it('renders all three style buttons', () => {
    render(<VoicingDisplay />);
    expect(screen.getByText('Shell Position A')).toBeInTheDocument();
    expect(screen.getByText('Shell Position B')).toBeInTheDocument();
    expect(screen.getByText('Open Voicing')).toBeInTheDocument();
  });

  it('defaults to Shell Position A', () => {
    render(<VoicingDisplay />);
    const shellAButton = screen.getByText('Shell Position A');
    expect(shellAButton).toHaveClass('active');
  });

  it('switches voicing style when button clicked', () => {
    render(<VoicingDisplay />);

    // Click Shell Position B
    const shellBButton = screen.getByText('Shell Position B');
    fireEvent.click(shellBButton);

    // Shell B should now be active
    expect(shellBButton).toHaveClass('active');

    // Shell A should not be active
    const shellAButton = screen.getByText('Shell Position A');
    expect(shellAButton).not.toHaveClass('active');
  });

  it('displays left hand and right hand labels', () => {
    render(<VoicingDisplay />);
    const lhLabels = screen.getAllByText('LH:');
    const rhLabels = screen.getAllByText('RH:');

    // 3 chords × 1 LH label each = 3
    expect(lhLabels).toHaveLength(3);
    expect(rhLabels).toHaveLength(3);
  });

  it('displays notes for Shell Position A', () => {
    render(<VoicingDisplay />);

    // Dm7 in Shell A: LH = D3, RH = F4, C5
    expect(screen.getByText('D3')).toBeInTheDocument();
    expect(screen.getByText('F4, C5')).toBeInTheDocument();
  });

  it('displays different notes for Shell Position B', () => {
    render(<VoicingDisplay />);

    // Switch to Shell B
    fireEvent.click(screen.getByText('Shell Position B'));

    // Dm7 in Shell B: LH = D3, RH = C4, F4
    expect(screen.getByText('D3')).toBeInTheDocument();
    expect(screen.getByText('C4, F4')).toBeInTheDocument();
  });

  it('displays template description', () => {
    render(<VoicingDisplay />);

    // Shell A description (updated format)
    expect(
      screen.getByText(/Root in LH, 3rd and 7th in RH/i)
    ).toBeInTheDocument();
  });

  it('renders extended voicing buttons', () => {
    render(<VoicingDisplay />);
    expect(screen.getByText('Shell + 9th')).toBeInTheDocument();
    expect(screen.getByText('Shell + 13th')).toBeInTheDocument();
    expect(screen.getByText('Open + 9th')).toBeInTheDocument();
  });

  it('switches to extended voicing and shows extended chord names', () => {
    render(<VoicingDisplay />);

    // Click Shell + 9th
    const shell9Button = screen.getByText('Shell + 9th');
    fireEvent.click(shell9Button);

    // Should now show extended chord names
    expect(screen.getByText('Dm9')).toBeInTheDocument();
    expect(screen.getByText('G9')).toBeInTheDocument();
    expect(screen.getByText('Cmaj9')).toBeInTheDocument();
  });

  it('renders play buttons for each chord', () => {
    render(<VoicingDisplay />);

    // 3 chord play buttons + 1 play all button = 4 buttons with play symbols
    const playButtons = screen.getAllByRole('button', { name: /play/i });
    expect(playButtons.length).toBeGreaterThanOrEqual(3);
  });

  it('renders play progression button', () => {
    render(<VoicingDisplay />);

    expect(screen.getByText(/Play Progression/i)).toBeInTheDocument();
  });
});
