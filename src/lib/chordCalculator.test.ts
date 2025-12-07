import {
  calculateNote,
  getChordTones,
  CHROMATIC_SCALE,
  CHORD_FORMULAS,
  NoteName,
} from './chordCalculator';

describe('chordCalculator', () => {
  describe('calculateNote', () => {
    it('calculates note up by semitones within same octave range', () => {
      expect(calculateNote('C', 4)).toBe('E');   // major 3rd
      expect(calculateNote('C', 7)).toBe('G');   // perfect 5th
      expect(calculateNote('D', 3)).toBe('F');   // minor 3rd
    });

    it('wraps around chromatic scale correctly', () => {
      expect(calculateNote('B', 1)).toBe('C');   // B + 1 = C
      expect(calculateNote('B', 2)).toBe('C#');  // B + 2 = C#
      expect(calculateNote('A', 4)).toBe('C#');  // A + 4 = C#
      expect(calculateNote('G', 7)).toBe('D');   // G + 7 = D
    });

    it('handles zero semitones (returns same note)', () => {
      expect(calculateNote('C', 0)).toBe('C');
      expect(calculateNote('F#', 0)).toBe('F#');
    });

    it('handles full octave (12 semitones = same note)', () => {
      expect(calculateNote('C', 12)).toBe('C');
      expect(calculateNote('F#', 12)).toBe('F#');
    });
  });

  describe('getChordTones', () => {
    it('calculates Dm7 correctly (ii of C major)', () => {
      const tones = getChordTones({ root: 'D', quality: 'min7' });
      expect(tones).toEqual({
        root: 'D',
        third: 'F',
        fifth: 'A',
        seventh: 'C',
      });
    });

    it('calculates G7 correctly (V of C major)', () => {
      const tones = getChordTones({ root: 'G', quality: 'dom7' });
      expect(tones).toEqual({
        root: 'G',
        third: 'B',
        fifth: 'D',
        seventh: 'F',
      });
    });

    it('calculates Cmaj7 correctly (I of C major)', () => {
      const tones = getChordTones({ root: 'C', quality: 'maj7' });
      expect(tones).toEqual({
        root: 'C',
        third: 'E',
        fifth: 'G',
        seventh: 'B',
      });
    });

    it('calculates min7b5 correctly (half-diminished)', () => {
      const tones = getChordTones({ root: 'B', quality: 'min7b5' });
      expect(tones).toEqual({
        root: 'B',
        third: 'D',
        fifth: 'F',
        seventh: 'A',
      });
    });

    it('calculates dim7 correctly (fully diminished)', () => {
      const tones = getChordTones({ root: 'B', quality: 'dim7' });
      expect(tones).toEqual({
        root: 'B',
        third: 'D',
        fifth: 'F',
        seventh: 'G#',
      });
    });
  });

  describe('constants', () => {
    it('CHROMATIC_SCALE has 12 notes', () => {
      expect(CHROMATIC_SCALE).toHaveLength(12);
    });

    it('CHROMATIC_SCALE starts with C', () => {
      expect(CHROMATIC_SCALE[0]).toBe('C');
    });

    it('CHORD_FORMULAS covers all 5 qualities', () => {
      const qualities = Object.keys(CHORD_FORMULAS);
      expect(qualities).toContain('maj7');
      expect(qualities).toContain('min7');
      expect(qualities).toContain('dom7');
      expect(qualities).toContain('min7b5');
      expect(qualities).toContain('dim7');
    });
  });
});

