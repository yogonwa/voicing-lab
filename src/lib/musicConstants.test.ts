/**
 * Tests for music theory constants
 */

import { INTERVALS, MIDI_NOTES, VOICING_LIMITS, BASS_REGISTER } from './musicConstants';

describe('musicConstants', () => {
  describe('INTERVALS', () => {
    it('should have correct semitone values for basic intervals', () => {
      expect(INTERVALS.UNISON).toBe(0);
      expect(INTERVALS.MINOR_SECOND).toBe(1);
      expect(INTERVALS.MAJOR_SECOND).toBe(2);
      expect(INTERVALS.MINOR_THIRD).toBe(3);
      expect(INTERVALS.MAJOR_THIRD).toBe(4);
      expect(INTERVALS.PERFECT_FOURTH).toBe(5);
      expect(INTERVALS.TRITONE).toBe(6);
      expect(INTERVALS.PERFECT_FIFTH).toBe(7);
      expect(INTERVALS.OCTAVE).toBe(12);
    });

    it('should have correct compound intervals', () => {
      expect(INTERVALS.MINOR_NINTH).toBe(13);
      expect(INTERVALS.MAJOR_NINTH).toBe(14);
      expect(INTERVALS.MINOR_TENTH).toBe(15);
      expect(INTERVALS.MAJOR_TENTH).toBe(16);
    });

    it('should maintain interval relationships', () => {
      // Octave = 12 semitones
      expect(INTERVALS.OCTAVE).toBe(12);
      
      // Minor 10th = Octave + minor 3rd
      expect(INTERVALS.MINOR_TENTH).toBe(INTERVALS.OCTAVE + INTERVALS.MINOR_THIRD);
      
      // Major 10th = Octave + major 3rd
      expect(INTERVALS.MAJOR_TENTH).toBe(INTERVALS.OCTAVE + INTERVALS.MAJOR_THIRD);
    });
  });

  describe('MIDI_NOTES', () => {
    it('should have correct MIDI values for reference pitches', () => {
      expect(MIDI_NOTES.MIDDLE_C).toBe(60);
      expect(MIDI_NOTES.C3).toBe(48);
      expect(MIDI_NOTES.B6).toBe(95);
    });

    it('should maintain octave relationships', () => {
      // Each octave is 12 semitones
      expect(MIDI_NOTES.MIDDLE_C - MIDI_NOTES.C3).toBe(12);
    });
  });

  describe('VOICING_LIMITS', () => {
    it('should have sensible playability constraints', () => {
      expect(VOICING_LIMITS.MIN_NOTES).toBe(2);
      expect(VOICING_LIMITS.MAX_COMFORTABLE_NOTES).toBe(5);
      expect(VOICING_LIMITS.MAX_PLAYABLE_NOTES).toBe(7);
      
      // Comfortable should be less than max
      expect(VOICING_LIMITS.MAX_COMFORTABLE_NOTES).toBeLessThan(
        VOICING_LIMITS.MAX_PLAYABLE_NOTES
      );
    });

    it('should have correct hand span limits', () => {
      // Minor 10th (15 semitones) is max comfortable span
      expect(VOICING_LIMITS.MAX_HAND_SPAN_SEMITONES).toBe(15);
      expect(VOICING_LIMITS.MAX_HAND_SPAN_SEMITONES).toBe(INTERVALS.MINOR_TENTH);
      
      // Octave (12 semitones) is comfortable span
      expect(VOICING_LIMITS.MAX_COMFORTABLE_SPAN_SEMITONES).toBe(12);
      expect(VOICING_LIMITS.MAX_COMFORTABLE_SPAN_SEMITONES).toBe(INTERVALS.OCTAVE);
    });

    it('should have correct interval thresholds', () => {
      // Perfect 4th threshold for wide gaps
      expect(VOICING_LIMITS.WIDE_GAP_THRESHOLD).toBe(5);
      expect(VOICING_LIMITS.WIDE_GAP_THRESHOLD).toBe(INTERVALS.PERFECT_FOURTH);
      
      // Minor 3rd threshold for clusters
      expect(VOICING_LIMITS.CLUSTER_THRESHOLD).toBe(3);
      expect(VOICING_LIMITS.CLUSTER_THRESHOLD).toBe(INTERVALS.MINOR_THIRD);
    });
  });

  describe('BASS_REGISTER', () => {
    it('should have correct bass register limits', () => {
      expect(BASS_REGISTER.UPPER_LIMIT_MIDI).toBe(48);
      expect(BASS_REGISTER.UPPER_LIMIT_MIDI).toBe(MIDI_NOTES.C3);
    });

    it('should have correct bass interval requirements', () => {
      // Perfect 4th minimum for clarity
      expect(BASS_REGISTER.MIN_BASS_INTERVAL).toBe(5);
      expect(BASS_REGISTER.MIN_BASS_INTERVAL).toBe(INTERVALS.PERFECT_FOURTH);
    });
  });

  describe('Constant immutability', () => {
    it('should be readonly (TypeScript compile-time check)', () => {
      // These should fail TypeScript compilation if uncommented:
      // INTERVALS.OCTAVE = 13;
      // MIDI_NOTES.MIDDLE_C = 61;
      // VOICING_LIMITS.MIN_NOTES = 3;
      
      // Runtime check that objects are frozen (if using Object.freeze)
      expect(Object.isFrozen(INTERVALS)).toBe(false); // Not frozen, but const
      expect(Object.isFrozen(MIDI_NOTES)).toBe(false);
      expect(Object.isFrozen(VOICING_LIMITS)).toBe(false);
    });
  });
});

