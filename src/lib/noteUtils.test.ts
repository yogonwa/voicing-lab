/**
 * Tests for note utilities
 */

import { parseNote, getNoteChroma, toMidi, formatVoicingRole } from './noteUtils';
import type { Note, VoicingRole } from './voicingTemplates';

describe('noteUtils', () => {
  describe('parseNote', () => {
    it('should parse natural notes', () => {
      expect(parseNote('C4' as Note)).toEqual({ name: 'C', octave: 4 });
      expect(parseNote('G3' as Note)).toEqual({ name: 'G', octave: 3 });
      expect(parseNote('B5' as Note)).toEqual({ name: 'B', octave: 5 });
    });

    it('should parse sharp notes', () => {
      expect(parseNote('C#4' as Note)).toEqual({ name: 'C#', octave: 4 });
      expect(parseNote('F#3' as Note)).toEqual({ name: 'F#', octave: 3 });
    });

    it('should throw on invalid notes', () => {
      expect(() => parseNote('H4' as Note)).toThrow('Invalid note: H4');
      expect(() => parseNote('C' as Note)).toThrow('Invalid note: C');
      expect(() => parseNote('C44' as Note)).toThrow('Invalid note: C44');
    });
  });

  describe('getNoteChroma', () => {
    it('should return correct pitch class for natural notes', () => {
      expect(getNoteChroma('C')).toBe(0);
      expect(getNoteChroma('D')).toBe(2);
      expect(getNoteChroma('E')).toBe(4);
      expect(getNoteChroma('F')).toBe(5);
      expect(getNoteChroma('G')).toBe(7);
      expect(getNoteChroma('A')).toBe(9);
      expect(getNoteChroma('B')).toBe(11);
    });

    it('should return correct pitch class for sharp notes', () => {
      expect(getNoteChroma('C#')).toBe(1);
      expect(getNoteChroma('D#')).toBe(3);
      expect(getNoteChroma('F#')).toBe(6);
      expect(getNoteChroma('G#')).toBe(8);
      expect(getNoteChroma('A#')).toBe(10);
    });
  });

  describe('toMidi', () => {
    it('should convert middle C to 60', () => {
      expect(toMidi('C4' as Note)).toBe(60);
    });

    it('should convert notes across octaves', () => {
      expect(toMidi('C3' as Note)).toBe(48);
      expect(toMidi('C5' as Note)).toBe(72);
      expect(toMidi('A4' as Note)).toBe(69);
    });

    it('should handle sharps', () => {
      expect(toMidi('C#4' as Note)).toBe(61);
      expect(toMidi('D#4' as Note)).toBe(63);
      expect(toMidi('F#3' as Note)).toBe(54);
      expect(toMidi('G#3' as Note)).toBe(56);
      expect(toMidi('A#3' as Note)).toBe(58);
    });
  });

  describe('formatVoicingRole', () => {
    it('should format basic chord tones', () => {
      expect(formatVoicingRole('root' as VoicingRole)).toBe('root');
      expect(formatVoicingRole('third' as VoicingRole)).toBe('3rd');
      expect(formatVoicingRole('fifth' as VoicingRole)).toBe('5th');
      expect(formatVoicingRole('seventh' as VoicingRole)).toBe('7th');
    });

    it('should format extensions with proper ordinals', () => {
      expect(formatVoicingRole('ninth' as VoicingRole)).toBe('9th');
      expect(formatVoicingRole('eleventh' as VoicingRole)).toBe('11th');
      expect(formatVoicingRole('thirteenth' as VoicingRole)).toBe('13th');
    });

    it('should format alterations with musical symbols', () => {
      expect(formatVoicingRole('flatNinth' as VoicingRole)).toBe('♭9');
      expect(formatVoicingRole('sharpNinth' as VoicingRole)).toBe('♯9');
      expect(formatVoicingRole('sharpEleventh' as VoicingRole)).toBe('♯11');
      expect(formatVoicingRole('flatThirteenth' as VoicingRole)).toBe('♭13');
    });

    it('should handle all voicing roles', () => {
      const roles: VoicingRole[] = [
        'root',
        'third',
        'fifth',
        'seventh',
        'ninth',
        'flatNinth',
        'sharpNinth',
        'eleventh',
        'sharpEleventh',
        'thirteenth',
        'flatThirteenth',
      ];

      roles.forEach(role => {
        const formatted = formatVoicingRole(role);
        expect(formatted).toBeTruthy();
        expect(typeof formatted).toBe('string');
      });
    });

    it('should use musical flat and sharp symbols', () => {
      const flatNinth = formatVoicingRole('flatNinth' as VoicingRole);
      const sharpNinth = formatVoicingRole('sharpNinth' as VoicingRole);
      
      // Should use ♭ (U+266D) not 'b'
      expect(flatNinth).toContain('♭');
      expect(flatNinth).not.toContain('b');
      
      // Should use ♯ (U+266F) not '#'
      expect(sharpNinth).toContain('♯');
      expect(sharpNinth).not.toContain('#');
    });
  });
});

