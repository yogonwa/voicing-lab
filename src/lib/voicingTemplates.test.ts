import {
  SHELL_POSITION_A,
  SHELL_POSITION_B,
  OPEN_VOICING,
  ALL_TEMPLATES,
  SHELL_A_PROGRESSION,
  SHELL_B_PROGRESSION,
  OPEN_VOICING_PROGRESSION,
  PROGRESSIONS,
  VoicingTemplate,
  VoicedChord,
  Note,
} from './voicingTemplates';

// Regex to validate note format: NoteName + Octave (0-8)
const NOTE_REGEX = /^(C#?|D#?|E|F#?|G#?|A#?|B)[0-8]$/;

const isValidNote = (note: string): boolean => NOTE_REGEX.test(note);

describe('voicingTemplates', () => {
  describe('template definitions', () => {
    it('ALL_TEMPLATES contains exactly 3 templates', () => {
      expect(ALL_TEMPLATES).toHaveLength(3);
    });

    it('each template has unique id', () => {
      const ids = ALL_TEMPLATES.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('each template has non-empty name and id', () => {
      ALL_TEMPLATES.forEach((template) => {
        expect(template.name.length).toBeGreaterThan(0);
        expect(template.id.length).toBeGreaterThan(0);
      });
    });

    it('each template defines at least one note per hand', () => {
      ALL_TEMPLATES.forEach((template) => {
        expect(template.leftHand.length).toBeGreaterThanOrEqual(1);
        expect(template.rightHand.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Shell Position A', () => {
    it('has root in left hand, 3rd+7th in right hand', () => {
      expect(SHELL_POSITION_A.leftHand).toEqual(['root']);
      expect(SHELL_POSITION_A.rightHand).toEqual(['third', 'seventh']);
    });
  });

  describe('Shell Position B', () => {
    it('has root in left hand, 7th+3rd in right hand (inverted)', () => {
      expect(SHELL_POSITION_B.leftHand).toEqual(['root']);
      expect(SHELL_POSITION_B.rightHand).toEqual(['seventh', 'third']);
    });
  });

  describe('Open Voicing', () => {
    it('has root+5th in left hand, 3rd+7th in right hand', () => {
      expect(OPEN_VOICING.leftHand).toEqual(['root', 'fifth']);
      expect(OPEN_VOICING.rightHand).toEqual(['third', 'seventh']);
    });
  });

  describe('hardcoded progressions', () => {
    const validateProgression = (progression: VoicedChord[], name: string) => {
      it(`${name} has exactly 3 chords (ii-V-I)`, () => {
        expect(progression).toHaveLength(3);
      });

      it(`${name} has valid note format for all notes`, () => {
        progression.forEach((chord, i) => {
          chord.leftHand.forEach((note) => {
            expect(isValidNote(note)).toBe(true);
          });
          chord.rightHand.forEach((note) => {
            expect(isValidNote(note)).toBe(true);
          });
        });
      });
    };

    describe('SHELL_A_PROGRESSION', () => {
      validateProgression(SHELL_A_PROGRESSION, 'SHELL_A_PROGRESSION');

      it('first chord (Dm7) has D in bass', () => {
        expect(SHELL_A_PROGRESSION[0].leftHand[0]).toMatch(/^D\d$/);
      });

      it('second chord (G7) has G in bass', () => {
        expect(SHELL_A_PROGRESSION[1].leftHand[0]).toMatch(/^G\d$/);
      });

      it('third chord (Cmaj7) has C in bass', () => {
        expect(SHELL_A_PROGRESSION[2].leftHand[0]).toMatch(/^C\d$/);
      });
    });

    describe('SHELL_B_PROGRESSION', () => {
      validateProgression(SHELL_B_PROGRESSION, 'SHELL_B_PROGRESSION');
    });

    describe('OPEN_VOICING_PROGRESSION', () => {
      validateProgression(OPEN_VOICING_PROGRESSION, 'OPEN_VOICING_PROGRESSION');

      it('each chord has 2 notes in left hand (root + 5th)', () => {
        OPEN_VOICING_PROGRESSION.forEach((chord) => {
          expect(chord.leftHand).toHaveLength(2);
        });
      });
    });
  });

  describe('PROGRESSIONS map', () => {
    it('maps all template ids to progressions', () => {
      ALL_TEMPLATES.forEach((template) => {
        expect(PROGRESSIONS[template.id]).toBeDefined();
        expect(PROGRESSIONS[template.id]).toHaveLength(3);
      });
    });
  });
});

