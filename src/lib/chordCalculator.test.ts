import {
  calculateNote,
  getChordTones,
  getExtendedChordTones,
  getRecommendedExtensions,
  getSafeExtensions,
  shouldAvoidExtension,
  CHROMATIC_SCALE,
  CHORD_FORMULAS,
  EXTENSION_INTERVALS,
  ALTERATION_INTERVALS,
  AVOID_EXTENSIONS,
  SAFE_EXTENSIONS,
  EXTENSION_RECOMMENDATIONS,
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

    it('EXTENSION_INTERVALS has correct values', () => {
      expect(EXTENSION_INTERVALS.ninth).toBe(14);
      expect(EXTENSION_INTERVALS.eleventh).toBe(17);
      expect(EXTENSION_INTERVALS.thirteenth).toBe(21);
    });

    it('ALTERATION_INTERVALS has correct values', () => {
      expect(ALTERATION_INTERVALS.flatNinth).toBe(13);
      expect(ALTERATION_INTERVALS.sharpNinth).toBe(15);
      expect(ALTERATION_INTERVALS.sharpEleventh).toBe(18);
      expect(ALTERATION_INTERVALS.flatThirteenth).toBe(20);
    });
  });

  describe('getExtendedChordTones', () => {
    it('calculates Dm9 extensions correctly', () => {
      const tones = getExtendedChordTones({ root: 'D', quality: 'min7' });
      expect(tones.root).toBe('D');
      expect(tones.third).toBe('F');
      expect(tones.fifth).toBe('A');
      expect(tones.seventh).toBe('C');
      expect(tones.extensions.ninth).toBe('E');
      expect(tones.extensions.eleventh).toBe('G');
      expect(tones.extensions.thirteenth).toBe('B');
    });

    it('calculates G13 extensions correctly', () => {
      const tones = getExtendedChordTones({ root: 'G', quality: 'dom7' });
      expect(tones.extensions.ninth).toBe('A');
      expect(tones.extensions.thirteenth).toBe('E');
    });

    it('calculates Cmaj9 extensions correctly', () => {
      const tones = getExtendedChordTones({ root: 'C', quality: 'maj7' });
      expect(tones.extensions.ninth).toBe('D');
    });

    it('includes alterations only for dom7 chords', () => {
      const dom7 = getExtendedChordTones({ root: 'G', quality: 'dom7' });
      const min7 = getExtendedChordTones({ root: 'D', quality: 'min7' });
      const maj7 = getExtendedChordTones({ root: 'C', quality: 'maj7' });

      expect(dom7.alterations).toBeDefined();
      expect(min7.alterations).toBeUndefined();
      expect(maj7.alterations).toBeUndefined();
    });

    it('calculates G7 alterations correctly', () => {
      const tones = getExtendedChordTones({ root: 'G', quality: 'dom7' });
      expect(tones.alterations?.flatNinth).toBe('G#');  // Ab enharmonic
      expect(tones.alterations?.sharpNinth).toBe('A#'); // Bb enharmonic  
      expect(tones.alterations?.sharpEleventh).toBe('C#');
      expect(tones.alterations?.flatThirteenth).toBe('D#'); // Eb enharmonic
    });
  });

  describe('getRecommendedExtensions', () => {
    it('recommends 9th and 11th for ii chord', () => {
      const extensions = getRecommendedExtensions({ 
        root: 'D', 
        quality: 'min7', 
        chordFunction: 'ii' 
      });
      expect(extensions.ninth).toBe('E');
      expect(extensions.eleventh).toBe('G');
      expect(extensions.thirteenth).toBeUndefined();
    });

    it('recommends 9th and 13th for V chord', () => {
      const extensions = getRecommendedExtensions({ 
        root: 'G', 
        quality: 'dom7', 
        chordFunction: 'V' 
      });
      expect(extensions.ninth).toBe('A');
      expect(extensions.thirteenth).toBe('E');
    });

    it('recommends 9th for I chord', () => {
      const extensions = getRecommendedExtensions({ 
        root: 'C', 
        quality: 'maj7', 
        chordFunction: 'I' 
      });
      expect(extensions.ninth).toBe('D');
      expect(extensions.eleventh).toBeUndefined();
    });

    it('defaults to 9th for "other" function', () => {
      const extensions = getRecommendedExtensions({ 
        root: 'A', 
        quality: 'min7'
        // no chordFunction = defaults to "other"
      });
      expect(extensions.ninth).toBeDefined();
    });
  });

  describe('EXTENSION_RECOMMENDATIONS', () => {
    it('has recommendations for all chord functions', () => {
      expect(EXTENSION_RECOMMENDATIONS.ii).toBeDefined();
      expect(EXTENSION_RECOMMENDATIONS.V).toBeDefined();
      expect(EXTENSION_RECOMMENDATIONS.I).toBeDefined();
      expect(EXTENSION_RECOMMENDATIONS.other).toBeDefined();
    });

    it('V chord has alteration recommendations', () => {
      expect(EXTENSION_RECOMMENDATIONS.V.alterations).toBeDefined();
      expect(EXTENSION_RECOMMENDATIONS.V.alterations?.length).toBeGreaterThan(0);
    });
  });

  describe('AVOID_EXTENSIONS (quality-based)', () => {
    it('maj7 should avoid 11th (clashes with major 3rd)', () => {
      expect(AVOID_EXTENSIONS.maj7).toContain('eleventh');
      expect(AVOID_EXTENSIONS.maj7).not.toContain('ninth');
      expect(AVOID_EXTENSIONS.maj7).not.toContain('thirteenth');
    });

    it('min7 should avoid 13th (clashes with minor context)', () => {
      expect(AVOID_EXTENSIONS.min7).toContain('thirteenth');
      expect(AVOID_EXTENSIONS.min7).not.toContain('ninth');
      expect(AVOID_EXTENSIONS.min7).not.toContain('eleventh');
    });

    it('dom7 should avoid 11th (clashes with major 3rd)', () => {
      expect(AVOID_EXTENSIONS.dom7).toContain('eleventh');
      expect(AVOID_EXTENSIONS.dom7).not.toContain('ninth');
      expect(AVOID_EXTENSIONS.dom7).not.toContain('thirteenth');
    });

    it('min7b5 should avoid 13th', () => {
      expect(AVOID_EXTENSIONS.min7b5).toContain('thirteenth');
    });

    it('dim7 should avoid 13th', () => {
      expect(AVOID_EXTENSIONS.dim7).toContain('thirteenth');
    });
  });

  describe('SAFE_EXTENSIONS', () => {
    it('maj7 safe extensions are 9th and 13th', () => {
      expect(SAFE_EXTENSIONS.maj7).toContain('ninth');
      expect(SAFE_EXTENSIONS.maj7).toContain('thirteenth');
      expect(SAFE_EXTENSIONS.maj7).not.toContain('eleventh');
    });

    it('min7 safe extensions are 9th and 11th', () => {
      expect(SAFE_EXTENSIONS.min7).toContain('ninth');
      expect(SAFE_EXTENSIONS.min7).toContain('eleventh');
      expect(SAFE_EXTENSIONS.min7).not.toContain('thirteenth');
    });

    it('dom7 safe extensions are 9th and 13th', () => {
      expect(SAFE_EXTENSIONS.dom7).toContain('ninth');
      expect(SAFE_EXTENSIONS.dom7).toContain('thirteenth');
      expect(SAFE_EXTENSIONS.dom7).not.toContain('eleventh');
    });
  });

  describe('shouldAvoidExtension', () => {
    it('returns true for 11th on maj7 chord', () => {
      expect(shouldAvoidExtension({ root: 'C', quality: 'maj7' }, 'eleventh')).toBe(true);
    });

    it('returns false for 9th on maj7 chord', () => {
      expect(shouldAvoidExtension({ root: 'C', quality: 'maj7' }, 'ninth')).toBe(false);
    });

    it('returns true for 13th on min7 chord', () => {
      expect(shouldAvoidExtension({ root: 'D', quality: 'min7' }, 'thirteenth')).toBe(true);
    });

    it('returns false for 11th on min7 chord', () => {
      expect(shouldAvoidExtension({ root: 'D', quality: 'min7' }, 'eleventh')).toBe(false);
    });

    it('returns true for 11th on dom7 chord', () => {
      expect(shouldAvoidExtension({ root: 'G', quality: 'dom7' }, 'eleventh')).toBe(true);
    });

    it('returns false for 13th on dom7 chord', () => {
      expect(shouldAvoidExtension({ root: 'G', quality: 'dom7' }, 'thirteenth')).toBe(false);
    });
  });

  describe('getSafeExtensions', () => {
    it('returns 9th and 13th for Cmaj7', () => {
      const safe = getSafeExtensions({ root: 'C', quality: 'maj7' });
      expect(safe.ninth).toBe('D');
      expect(safe.thirteenth).toBe('A');
      expect(safe.eleventh).toBeUndefined(); // 11th avoided
    });

    it('returns 9th and 11th for Dm7', () => {
      const safe = getSafeExtensions({ root: 'D', quality: 'min7' });
      expect(safe.ninth).toBe('E');
      expect(safe.eleventh).toBe('G');
      expect(safe.thirteenth).toBeUndefined(); // 13th avoided
    });

    it('returns 9th and 13th for G7', () => {
      const safe = getSafeExtensions({ root: 'G', quality: 'dom7' });
      expect(safe.ninth).toBe('A');
      expect(safe.thirteenth).toBe('E');
      expect(safe.eleventh).toBeUndefined(); // natural 11th avoided
    });
  });
});

