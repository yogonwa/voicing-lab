import {
  generateVoicing,
  generateProgression,
  transposeNote,
  transposeVoicing,
} from './voicingGenerator';
import {
  SHELL_POSITION_A,
  SHELL_POSITION_B,
  OPEN_VOICING,
  SHELL_A_PROGRESSION,
} from './voicingTemplates';
import { Chord } from './chordCalculator';

describe('voicingGenerator', () => {
  // ii-V-I chords for testing
  const Dm7: Chord = { root: 'D', quality: 'min7' };
  const G7: Chord = { root: 'G', quality: 'dom7' };
  const Cmaj7: Chord = { root: 'C', quality: 'maj7' };

  describe('generateVoicing', () => {
    describe('Shell Position A (1-3-7)', () => {
      it('generates Dm7 correctly', () => {
        const voicing = generateVoicing(Dm7, SHELL_POSITION_A);
        expect(voicing.leftHand).toEqual(['D2']); // root
        expect(voicing.rightHand).toEqual(['F3', 'C3']); // 3rd, 7th
      });

      it('generates G7 correctly', () => {
        const voicing = generateVoicing(G7, SHELL_POSITION_A);
        expect(voicing.leftHand).toEqual(['G2']); // root
        expect(voicing.rightHand).toEqual(['B3', 'F3']); // 3rd, 7th
      });

      it('generates Cmaj7 correctly', () => {
        const voicing = generateVoicing(Cmaj7, SHELL_POSITION_A);
        expect(voicing.leftHand).toEqual(['C2']); // root
        expect(voicing.rightHand).toEqual(['E3', 'B3']); // 3rd, 7th
      });
    });

    describe('Shell Position B (1-7-3)', () => {
      it('generates Dm7 with inverted RH', () => {
        const voicing = generateVoicing(Dm7, SHELL_POSITION_B);
        expect(voicing.leftHand).toEqual(['D2']); // root
        expect(voicing.rightHand).toEqual(['C3', 'F3']); // 7th, 3rd (inverted)
      });
    });

    describe('Open Voicing (1-5 / 3-7)', () => {
      it('generates Dm7 with 5th in LH', () => {
        const voicing = generateVoicing(Dm7, OPEN_VOICING);
        expect(voicing.leftHand).toEqual(['D2', 'A2']); // root, 5th
        expect(voicing.rightHand).toEqual(['F3', 'C3']); // 3rd, 7th
      });

      it('generates G7 with 5th in LH', () => {
        const voicing = generateVoicing(G7, OPEN_VOICING);
        expect(voicing.leftHand).toEqual(['G2', 'D2']); // root, 5th
        expect(voicing.rightHand).toEqual(['B3', 'F3']); // 3rd, 7th
      });
    });
  });

  describe('generateProgression', () => {
    it('generates 3 voicings for ii-V-I', () => {
      const chords = [Dm7, G7, Cmaj7];
      const progression = generateProgression(chords, SHELL_POSITION_A);

      expect(progression).toHaveLength(3);
      expect(progression[0].leftHand).toEqual(['D2']);
      expect(progression[1].leftHand).toEqual(['G2']);
      expect(progression[2].leftHand).toEqual(['C2']);
    });
  });

  describe('transposeNote', () => {
    it('transposes within same octave', () => {
      expect(transposeNote('C2', 2)).toBe('D2'); // whole step up
      expect(transposeNote('D2', 5)).toBe('G2'); // perfect 4th up
    });

    it('handles octave crossing upward', () => {
      expect(transposeNote('A2', 4)).toBe('C#3'); // major 3rd up crosses octave
      expect(transposeNote('B2', 1)).toBe('C3'); // half step up crosses octave
    });

    it('handles sharps correctly', () => {
      expect(transposeNote('F#3', 2)).toBe('G#3');
      expect(transposeNote('C#2', 11)).toBe('C3');
    });

    it('handles negative transposition', () => {
      expect(transposeNote('D2', -2)).toBe('C2'); // whole step down
      expect(transposeNote('C3', -1)).toBe('B2'); // half step down crosses octave
    });

    it('handles full octave transposition', () => {
      expect(transposeNote('C2', 12)).toBe('C3'); // octave up
      expect(transposeNote('C3', -12)).toBe('C2'); // octave down
    });
  });

  describe('transposeVoicing', () => {
    it('transposes all notes in voicing', () => {
      const dm7Voicing = { leftHand: ['D2' as const], rightHand: ['F3' as const, 'C4' as const] };
      const em7Voicing = transposeVoicing(dm7Voicing, 2); // up whole step

      expect(em7Voicing.leftHand).toEqual(['E2']);
      expect(em7Voicing.rightHand).toEqual(['G3', 'D4']);
    });

    it('can transpose ii-V-I from C to G', () => {
      // C major ii-V-I transposed up 7 semitones = G major ii-V-I
      const cMajorDm7 = SHELL_A_PROGRESSION[0];
      const gMajorAm7 = transposeVoicing(cMajorDm7, 7);

      // Dm7 (D2, F3, C4) → Am7 (A2, C4, G4)
      expect(gMajorAm7.leftHand).toEqual(['A2']);
      expect(gMajorAm7.rightHand).toEqual(['C4', 'G4']);
    });
  });

  describe('comparison with hardcoded progressions', () => {
    it('generated Shell A matches hardcoded bass notes', () => {
      // The generated voicings should have the same bass notes as hardcoded
      // (RH octaves may differ due to voice leading optimization)
      const generated = generateProgression([Dm7, G7, Cmaj7], SHELL_POSITION_A);

      expect(generated[0].leftHand).toEqual(SHELL_A_PROGRESSION[0].leftHand);
      expect(generated[1].leftHand).toEqual(SHELL_A_PROGRESSION[1].leftHand);
      expect(generated[2].leftHand).toEqual(SHELL_A_PROGRESSION[2].leftHand);
    });
  });
});

