import {
  generateVoicing,
  generateProgression,
  transposeNote,
  transposeVoicing,
  findNextNoteUp,
  buildClosePosition,
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

  // ============================================
  // CLOSE POSITION LOGIC
  // ============================================

  describe('findNextNoteUp', () => {
    describe('same octave (target higher in chromatic scale)', () => {
      it('F4 → B = B4 (Shell B: F to B is up)', () => {
        expect(findNextNoteUp('F4', 'B')).toBe('B4');
      });

      it('C4 → F = F4 (Dm7 Shell B: C to F is up)', () => {
        expect(findNextNoteUp('C4', 'F')).toBe('F4');
      });

      it('G4 → B = B4 (target is above reference)', () => {
        expect(findNextNoteUp('G4', 'B')).toBe('B4');
      });

      it('D4 → A = A4', () => {
        expect(findNextNoteUp('D4', 'A')).toBe('A4');
      });
    });

    describe('next octave (target lower/equal in chromatic scale)', () => {
      it('B4 → E = E5 (Cmaj7 Shell B: E is below B, so next octave)', () => {
        expect(findNextNoteUp('B4', 'E')).toBe('E5');
      });

      it('F4 → C = C5 (Shell A: C is below F)', () => {
        expect(findNextNoteUp('F4', 'C')).toBe('C5');
      });

      it('B4 → F = F5 (Shell A G7: F is below B)', () => {
        expect(findNextNoteUp('B4', 'F')).toBe('F5');
      });

      it('A4 → C = C5 (C is below A)', () => {
        expect(findNextNoteUp('A4', 'C')).toBe('C5');
      });
    });

    describe('edge cases', () => {
      it('handles sharps in reference note', () => {
        expect(findNextNoteUp('F#4', 'B')).toBe('B4');
        expect(findNextNoteUp('C#4', 'A')).toBe('A4');
      });

      it('handles sharps in target note', () => {
        expect(findNextNoteUp('D4', 'F#')).toBe('F#4');
        expect(findNextNoteUp('G4', 'C#')).toBe('C#5');
      });

      it('same note goes to next octave', () => {
        expect(findNextNoteUp('C4', 'C')).toBe('C5');
        expect(findNextNoteUp('F#4', 'F#')).toBe('F#5');
      });
    });
  });

  describe('buildClosePosition', () => {
    it('builds Shell A RH for Dm7: F4 base, stack C', () => {
      // 3rd=F, 7th=C. Start at F4, C is below F → C5
      const result = buildClosePosition('F4', ['C']);
      expect(result).toEqual(['C5']);
    });

    it('builds Shell B RH for Dm7: C4 base, stack F', () => {
      // 7th=C, 3rd=F. Start at C4, F is above C → F4
      const result = buildClosePosition('C4', ['F']);
      expect(result).toEqual(['F4']);
    });

    it('builds Shell B RH for G7: F4 base, stack B', () => {
      // 7th=F, 3rd=B. Start at F4, B is above F → B4
      const result = buildClosePosition('F4', ['B']);
      expect(result).toEqual(['B4']);
    });

    it('builds Shell B RH for Cmaj7: B4 base, stack E', () => {
      // 7th=B, 3rd=E. Start at B4, E is below B → E5
      const result = buildClosePosition('B4', ['E']);
      expect(result).toEqual(['E5']);
    });

    it('builds multi-note sequences', () => {
      // Starting at C4, stack E, G, B (Cmaj7 arpeggio)
      const result = buildClosePosition('C4', ['E', 'G', 'B']);
      expect(result).toEqual(['E4', 'G4', 'B4']);
    });

    it('handles octave crossings in sequence', () => {
      // Starting at A4, stack C, E (Am arpeggio up)
      const result = buildClosePosition('A4', ['C', 'E']);
      expect(result).toEqual(['C5', 'E5']);
    });
  });

  // ============================================
  // VOICING GENERATION
  // ============================================

  describe('generateVoicing', () => {
    describe('Shell Position A (1-3-7)', () => {
      it('generates Dm7 correctly', () => {
        const voicing = generateVoicing(Dm7, SHELL_POSITION_A);
        expect(voicing.leftHand).toEqual(['D3']); // root at octave 3
        expect(voicing.rightHand).toEqual(['F4', 'C4']); // 3rd, 7th at octave 4
      });

      it('generates G7 correctly', () => {
        const voicing = generateVoicing(G7, SHELL_POSITION_A);
        expect(voicing.leftHand).toEqual(['G3']); // root
        expect(voicing.rightHand).toEqual(['B4', 'F4']); // 3rd, 7th
      });

      it('generates Cmaj7 correctly', () => {
        const voicing = generateVoicing(Cmaj7, SHELL_POSITION_A);
        expect(voicing.leftHand).toEqual(['C3']); // root
        expect(voicing.rightHand).toEqual(['E4', 'B4']); // 3rd, 7th
      });
    });

    describe('Shell Position B (1-7-3)', () => {
      it('generates Dm7 with inverted RH', () => {
        const voicing = generateVoicing(Dm7, SHELL_POSITION_B);
        expect(voicing.leftHand).toEqual(['D3']); // root
        expect(voicing.rightHand).toEqual(['C4', 'F4']); // 7th, 3rd (inverted)
      });
    });

    describe('Open Voicing (1-5 / 3-7)', () => {
      it('generates Dm7 with 5th in LH', () => {
        const voicing = generateVoicing(Dm7, OPEN_VOICING);
        expect(voicing.leftHand).toEqual(['D3', 'A3']); // root, 5th
        expect(voicing.rightHand).toEqual(['F4', 'C4']); // 3rd, 7th
      });

      it('generates G7 with 5th in LH', () => {
        const voicing = generateVoicing(G7, OPEN_VOICING);
        expect(voicing.leftHand).toEqual(['G3', 'D3']); // root, 5th
        expect(voicing.rightHand).toEqual(['B4', 'F4']); // 3rd, 7th
      });
    });
  });

  describe('generateProgression', () => {
    it('generates 3 voicings for ii-V-I', () => {
      const chords = [Dm7, G7, Cmaj7];
      const progression = generateProgression(chords, SHELL_POSITION_A);

      expect(progression).toHaveLength(3);
      expect(progression[0].leftHand).toEqual(['D3']);
      expect(progression[1].leftHand).toEqual(['G3']);
      expect(progression[2].leftHand).toEqual(['C3']);
    });
  });

  // ============================================
  // TRANSPOSITION
  // ============================================

  describe('transposeNote', () => {
    it('transposes within same octave', () => {
      expect(transposeNote('C3', 2)).toBe('D3'); // whole step up
      expect(transposeNote('D3', 5)).toBe('G3'); // perfect 4th up
    });

    it('handles octave crossing upward', () => {
      expect(transposeNote('A3', 4)).toBe('C#4'); // major 3rd up crosses octave
      expect(transposeNote('B3', 1)).toBe('C4'); // half step up crosses octave
    });

    it('handles sharps correctly', () => {
      expect(transposeNote('F#3', 2)).toBe('G#3');
      expect(transposeNote('C#3', 11)).toBe('C4');
    });

    it('handles negative transposition', () => {
      expect(transposeNote('D3', -2)).toBe('C3'); // whole step down
      expect(transposeNote('C4', -1)).toBe('B3'); // half step down crosses octave
    });

    it('handles full octave transposition', () => {
      expect(transposeNote('C3', 12)).toBe('C4'); // octave up
      expect(transposeNote('C4', -12)).toBe('C3'); // octave down
    });
  });

  describe('transposeVoicing', () => {
    it('transposes all notes in voicing', () => {
      const dm7Voicing = { leftHand: ['D3' as const], rightHand: ['F4' as const, 'C5' as const] };
      const em7Voicing = transposeVoicing(dm7Voicing, 2); // up whole step

      expect(em7Voicing.leftHand).toEqual(['E3']);
      expect(em7Voicing.rightHand).toEqual(['G4', 'D5']);
    });

    it('can transpose ii-V-I from C to G', () => {
      // C major ii-V-I transposed up 7 semitones = G major ii-V-I
      const cMajorDm7 = SHELL_A_PROGRESSION[0];
      const gMajorAm7 = transposeVoicing(cMajorDm7, 7);

      // Dm7 (D3, F4, C5) → Am7 (A3, C5, G5)
      expect(gMajorAm7.leftHand).toEqual(['A3']);
      expect(gMajorAm7.rightHand).toEqual(['C5', 'G5']);
    });
  });

  // ============================================
  // COMPARISON WITH HARDCODED
  // ============================================

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
