import { getActiveNotes } from './utils';
import type { VoicedChord } from '../../lib/core';
import type { Chord } from '../../lib/core';

describe('PianoKeyboard/utils.getActiveNotes', () => {
  it('assigns correct roles for dominant alterations', () => {
    const chord: Chord = { root: 'G', quality: 'dom7' };

    const voicing: VoicedChord = {
      leftHand: ['G3'],
      rightHand: [
        'B3',  // third
        'F4',  // seventh
        'G#4', // flat 9 (spelled as sharp in this codebase)
        'A#4', // sharp 9
        'C#5', // sharp 11
        'D#5', // flat 13
      ],
    };

    const active = getActiveNotes(voicing, chord);
    const byNote = new Map(active.map((an) => [an.note, an.role]));

    expect(byNote.get('G3')).toBe('root');
    expect(byNote.get('B3')).toBe('third');
    expect(byNote.get('F4')).toBe('seventh');
    expect(byNote.get('G#4')).toBe('flatNinth');
    expect(byNote.get('A#4')).toBe('sharpNinth');
    expect(byNote.get('C#5')).toBe('sharpEleventh');
    expect(byNote.get('D#5')).toBe('flatThirteenth');
  });

  it('assigns correct roles for extensions (e.g., maj7 #11)', () => {
    const chord: Chord = { root: 'C', quality: 'maj7' };

    const voicing: VoicedChord = {
      leftHand: ['C3'],
      rightHand: [
        'E4',  // third
        'B4',  // seventh
        'D5',  // ninth
        'F#5', // sharp 11
        'A5',  // thirteenth
      ],
    };

    const active = getActiveNotes(voicing, chord);
    const byNote = new Map(active.map((an) => [an.note, an.role]));

    expect(byNote.get('C3')).toBe('root');
    expect(byNote.get('E4')).toBe('third');
    expect(byNote.get('B4')).toBe('seventh');
    expect(byNote.get('D5')).toBe('ninth');
    expect(byNote.get('F#5')).toBe('sharpEleventh');
    expect(byNote.get('A5')).toBe('thirteenth');
  });
});


