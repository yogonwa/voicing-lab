import { PlaygroundBlock, voicePlaygroundBlocks, getRootWarning } from './playgroundUtils';
import { NoteName } from '../../lib/chordCalculator';

const NOTE_TO_CHROMA: Record<NoteName, number> = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
};

function buildBlock({
  id,
  note,
  role,
  enabled = true,
}: {
  id: string;
  note: NoteName;
  role: PlaygroundBlock['voicingRole'];
  enabled?: boolean;
}): PlaygroundBlock {
  return {
    id,
    label: role,
    note,
    voicingRole: role,
    cssRole: role,
    enabled,
    isExtension: false,
  };
}

function midi(note: string): number {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) {
    throw new Error(`Invalid note: ${note}`);
  }
  const [, name, octave] = match;
  return (parseInt(octave, 10) + 1) * 12 + NOTE_TO_CHROMA[name as NoteName];
}

describe('voicePlaygroundBlocks', () => {
  it('voices shell A blocks in octave 4', () => {
    const blocks = [
      buildBlock({ id: 'root', note: 'C', role: 'root' }),
      buildBlock({ id: 'third', note: 'E', role: 'third' }),
      buildBlock({ id: 'seventh', note: 'B', role: 'seventh' }),
    ];

    expect(voicePlaygroundBlocks(blocks)).toEqual(['C4', 'E4', 'B4']);
  });

  it('wraps upward when pitch class decreases', () => {
    const blocks = [
      buildBlock({ id: 'root', note: 'C', role: 'root' }),
      buildBlock({ id: 'seventh', note: 'B', role: 'seventh' }),
      buildBlock({ id: 'third', note: 'E', role: 'third' }),
    ];

    expect(voicePlaygroundBlocks(blocks)).toEqual(['C4', 'B4', 'E5']);
  });

  it('keeps the root as the lowest pitch even if dragged later', () => {
    const blocks = [
      buildBlock({ id: 'third', note: 'E', role: 'third' }),
      buildBlock({ id: 'root', note: 'C', role: 'root' }),
      buildBlock({ id: 'fifth', note: 'G', role: 'fifth' }),
    ];

    const voiced = voicePlaygroundBlocks(blocks);
    expect(voiced).toEqual(['E4', 'C4', 'G5']);

    const midiValues = voiced.map(midi);
    const rootPitch = midiValues[1];
    expect(rootPitch).toBeLessThan(midiValues[0]);
  });

  it('respects rootless voicings without forcing a drop', () => {
    const blocks = [
      buildBlock({ id: 'third', note: 'E', role: 'third' }),
      buildBlock({ id: 'fifth', note: 'G', role: 'fifth' }),
      buildBlock({ id: 'seventh', note: 'B', role: 'seventh' }),
    ];

    expect(voicePlaygroundBlocks(blocks)).toEqual(['E4', 'G4', 'B4']);
  });

  it('honors preset hints to start in a lower octave', () => {
    const blocks = [
      buildBlock({ id: 'root', note: 'C', role: 'root' }),
      buildBlock({ id: 'third', note: 'E', role: 'third' }),
      buildBlock({ id: 'fifth', note: 'G', role: 'fifth' }),
      buildBlock({ id: 'seventh', note: 'B', role: 'seventh' }),
    ];

    const compact = voicePlaygroundBlocks(blocks);
    const spread = voicePlaygroundBlocks(blocks, { presetHint: 'spread' });

    expect(compact[0]).toBe('C4');
    expect(spread[0]).toBe('C3');
  });

  it('raises close bass intervals to avoid mud', () => {
    const blocks = [
      buildBlock({ id: 'root', note: 'C', role: 'root' }),
      buildBlock({ id: 'third', note: 'E', role: 'third' }),
      buildBlock({ id: 'fifth', note: 'G', role: 'fifth' }),
      buildBlock({ id: 'seventh', note: 'B', role: 'seventh' }),
      buildBlock({ id: 'ninth', note: 'D', role: 'ninth' }),
      buildBlock({ id: 'eleventh', note: 'F', role: 'eleventh' }),
    ];

    const voiced = voicePlaygroundBlocks(blocks, { presetHint: 'spread' });
    expect(voiced[0]).toBe('C3');
    expect(voiced[1]).toBe('E4');
  });

  it('maintains at least one octave of spread for dense voicings', () => {
    const blocks = [
      buildBlock({ id: 'root', note: 'C', role: 'root' }),
      buildBlock({ id: 'third', note: 'D', role: 'third' }),
      buildBlock({ id: 'fifth', note: 'E', role: 'fifth' }),
    ];

    const voiced = voicePlaygroundBlocks(blocks);
    const span = midi(voiced[voiced.length - 1]) - midi(voiced[0]);
    expect(span).toBeGreaterThanOrEqual(12);
  });
});

describe('getRootWarning', () => {
  it('returns warning when root is not leftmost', () => {
    const blocks = [
      buildBlock({ id: 'third', note: 'E', role: 'third' }),
      buildBlock({ id: 'root', note: 'C', role: 'root' }),
      buildBlock({ id: 'fifth', note: 'G', role: 'fifth' }),
    ];

    expect(getRootWarning(blocks)).toBe('Root should be lowest for clear harmony');
  });

  it('returns null when root is first or disabled', () => {
    const ordered = [
      buildBlock({ id: 'root', note: 'C', role: 'root' }),
      buildBlock({ id: 'third', note: 'E', role: 'third' }),
    ];
    expect(getRootWarning(ordered)).toBeNull();

    const disabledRoot = [
      buildBlock({ id: 'root', note: 'C', role: 'root', enabled: false }),
      buildBlock({ id: 'third', note: 'E', role: 'third' }),
    ];
    expect(getRootWarning(disabledRoot)).toBeNull();
  });
});
