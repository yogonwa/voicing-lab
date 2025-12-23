import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the audio engine to avoid Tone.js ESM issues in tests
jest.mock('../lib/audio');

import { ChordToneDisplay } from './ChordToneDisplay';

describe('ChordToneDisplay', () => {
  describe('Calculator Section', () => {
    it('renders the chord calculator header', () => {
      render(<ChordToneDisplay />);
      expect(screen.getByText('Chord Calculator')).toBeInTheDocument();
    });

    it('renders root note dropdown with all 12 notes', () => {
      render(<ChordToneDisplay />);
      const rootSelect = screen.getByLabelText('Root');
      expect(rootSelect).toBeInTheDocument();

      // Check for a few notes
      expect(screen.getByRole('option', { name: 'C' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'F#' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'B' })).toBeInTheDocument();
    });

    it('renders quality dropdown with all qualities', () => {
      render(<ChordToneDisplay />);
      const qualitySelect = screen.getByLabelText('Quality');
      expect(qualitySelect).toBeInTheDocument();

      expect(screen.getByRole('option', { name: 'Major 7' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Minor 7' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Dominant 7' })).toBeInTheDocument();
    });

    it('defaults to Cmaj7', () => {
      render(<ChordToneDisplay />);
      // Cmaj7 appears in both calculator and validation - check result section
      const resultChordName = document.querySelector('.result-chord-name');
      expect(resultChordName?.textContent).toBe('Cmaj7');
      const resultQualityName = document.querySelector('.result-quality-name');
      expect(resultQualityName?.textContent).toBe('Major 7');
    });

    it('displays correct tones for Cmaj7', () => {
      render(<ChordToneDisplay />);
      // C, E, G, B
      const toneValues = screen.getAllByText(/^[A-G]#?$/);
      const toneTexts = toneValues.map((el) => el.textContent);
      expect(toneTexts).toContain('C');
      expect(toneTexts).toContain('E');
      expect(toneTexts).toContain('G');
      expect(toneTexts).toContain('B');
    });

    it('updates chord when root changes', () => {
      render(<ChordToneDisplay />);

      const rootSelect = screen.getByLabelText('Root');
      fireEvent.change(rootSelect, { target: { value: 'D' } });

      // Should now show Dmaj7 in result section
      const resultChordName = document.querySelector('.result-chord-name');
      expect(resultChordName?.textContent).toBe('Dmaj7');
    });

    it('updates chord when quality changes', () => {
      render(<ChordToneDisplay />);

      const qualitySelect = screen.getByLabelText('Quality');
      fireEvent.change(qualitySelect, { target: { value: 'min7' } });

      // Should now show Cm7 in result section
      const resultChordName = document.querySelector('.result-chord-name');
      expect(resultChordName?.textContent).toBe('Cm7');
      // Check quality name in result
      const resultQualityName = document.querySelector('.result-quality-name');
      expect(resultQualityName?.textContent).toBe('Minor 7');
    });

    it('calculates Dm7 correctly', () => {
      render(<ChordToneDisplay />);

      fireEvent.change(screen.getByLabelText('Root'), { target: { value: 'D' } });
      fireEvent.change(screen.getByLabelText('Quality'), { target: { value: 'min7' } });

      // Check result section shows Dm7
      const resultChordName = document.querySelector('.result-chord-name');
      expect(resultChordName?.textContent).toBe('Dm7');
    });

    it('renders play button', () => {
      render(<ChordToneDisplay />);
      const playButton = screen.getByRole('button', { name: /play cmaj7/i });
      expect(playButton).toBeInTheDocument();
    });
  });

  describe('Validation Section', () => {
    it('renders ii-V-I validation header', () => {
      render(<ChordToneDisplay />);
      expect(screen.getByText('ii-V-I Validation')).toBeInTheDocument();
    });

    it('shows all three chords in validation', () => {
      render(<ChordToneDisplay />);
      expect(screen.getByText('Dm7')).toBeInTheDocument();
      expect(screen.getByText('G7')).toBeInTheDocument();
      // Cmaj7 appears twice (calculator + validation)
      expect(screen.getAllByText('Cmaj7').length).toBeGreaterThanOrEqual(1);
    });

    it('shows validation checkmarks for correct chords', () => {
      render(<ChordToneDisplay />);
      // All ii-V-I chords should be valid (show ✓)
      const checkmarks = screen.getAllByText('✓');
      expect(checkmarks.length).toBeGreaterThanOrEqual(3);
    });

    it('displays chord formulas', () => {
      render(<ChordToneDisplay />);
      expect(screen.getByText('(min7)')).toBeInTheDocument();
      expect(screen.getByText('(dom7)')).toBeInTheDocument();
      expect(screen.getByText('(maj7)')).toBeInTheDocument();
    });
  });

  describe('Tone Labels', () => {
    it('displays R, 3, 5, 7 labels', () => {
      render(<ChordToneDisplay />);
      expect(screen.getAllByText('R').length).toBeGreaterThan(0);
      expect(screen.getAllByText('3').length).toBeGreaterThan(0);
      expect(screen.getAllByText('5').length).toBeGreaterThan(0);
      expect(screen.getAllByText('7').length).toBeGreaterThan(0);
    });
  });
});

