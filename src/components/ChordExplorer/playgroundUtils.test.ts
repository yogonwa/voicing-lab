import { 
  PlaygroundBlock, 
  voicePlaygroundBlocks, 
  getRootWarning,
  getNextVariantKey,
  EXTENSION_STATE_CYCLES,
} from './playgroundUtils';
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

  it('widens overly clustered 3-note stacks while allowing normal close-position shells', () => {
    const compactShell = [
      buildBlock({ id: 'third', note: 'E', role: 'third' }),
      buildBlock({ id: 'fifth', note: 'G', role: 'fifth' }),
      buildBlock({ id: 'seventh', note: 'B', role: 'seventh' }),
    ];
    expect(voicePlaygroundBlocks(compactShell)).toEqual(['E4', 'G4', 'B4']);

    const clustered = [
      buildBlock({ id: 'root', note: 'C', role: 'root' }),
      buildBlock({ id: 'third', note: 'D', role: 'third' }),
      buildBlock({ id: 'fifth', note: 'E', role: 'fifth' }),
    ];
    // C–D–E in the same octave is a tight cluster; we widen by lifting the top voice.
    expect(voicePlaygroundBlocks(clustered)).toEqual(['C4', 'D4', 'E5']);
  });

  it('wraps upward when pitch class decreases', () => {
    const blocks = [
      buildBlock({ id: 'root', note: 'C', role: 'root' }),
      buildBlock({ id: 'seventh', note: 'B', role: 'seventh' }),
      buildBlock({ id: 'third', note: 'E', role: 'third' }),
    ];

    expect(voicePlaygroundBlocks(blocks)).toEqual(['C4', 'B4', 'E5']);
  });

  it('respects drag order audibly when the root is not leftmost (root may not be the lowest pitch)', () => {
    const blocks = [
      buildBlock({ id: 'third', note: 'E', role: 'third' }),
      buildBlock({ id: 'root', note: 'C', role: 'root' }),
      buildBlock({ id: 'fifth', note: 'G', role: 'fifth' }),
    ];

    const voiced = voicePlaygroundBlocks(blocks);
    expect(voiced).toEqual(['E4', 'C5', 'G5']);
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

describe('getNextVariantKey - extension cycling with off state', () => {
  function createExtensionBlock(
    family: 'ninth' | 'eleventh' | 'thirteenth',
    currentState: 'off' | 'natural' | 'flat' | 'sharp'
  ): PlaygroundBlock {
    return {
      id: family,
      label: family,
      note: 'D',
      voicingRole: family,
      cssRole: family,
      enabled: currentState !== 'off',
      isExtension: true,
      extensionFamily: family,
      currentState,
      variants: [],
      variantKey: currentState !== 'off' ? (currentState as any) : 'natural',
    };
  }

  it('should cycle 9th through: off → natural → flat → sharp → off', () => {
    const block1 = createExtensionBlock('ninth', 'off');
    const step1 = getNextVariantKey(block1);
    expect(step1.nextEnabled).toBe(true);
    expect(step1.nextKey).toBe('natural');
    
    const block2 = createExtensionBlock('ninth', 'natural');
    const step2 = getNextVariantKey(block2);
    expect(step2.nextEnabled).toBe(true);
    expect(step2.nextKey).toBe('flat');
    
    const block3 = createExtensionBlock('ninth', 'flat');
    const step3 = getNextVariantKey(block3);
    expect(step3.nextEnabled).toBe(true);
    expect(step3.nextKey).toBe('sharp');
    
    const block4 = createExtensionBlock('ninth', 'sharp');
    const step4 = getNextVariantKey(block4);
    expect(step4.nextEnabled).toBe(false);
    // When cycling to 'off', nextKey preserves the last variant
    expect(step4.nextKey).toBeTruthy();
  });

  it('should cycle 11th through: off → natural → sharp → off', () => {
    const block1 = createExtensionBlock('eleventh', 'off');
    const step1 = getNextVariantKey(block1);
    expect(step1.nextEnabled).toBe(true);
    expect(step1.nextKey).toBe('natural');
    
    const block2 = createExtensionBlock('eleventh', 'natural');
    const step2 = getNextVariantKey(block2);
    expect(step2.nextEnabled).toBe(true);
    expect(step2.nextKey).toBe('sharp');
    
    const block3 = createExtensionBlock('eleventh', 'sharp');
    const step3 = getNextVariantKey(block3);
    expect(step3.nextEnabled).toBe(false);
  });

  it('should cycle 13th through: off → natural → flat → off', () => {
    const block1 = createExtensionBlock('thirteenth', 'off');
    const step1 = getNextVariantKey(block1);
    expect(step1.nextEnabled).toBe(true);
    expect(step1.nextKey).toBe('natural');
    
    const block2 = createExtensionBlock('thirteenth', 'natural');
    const step2 = getNextVariantKey(block2);
    expect(step2.nextEnabled).toBe(true);
    expect(step2.nextKey).toBe('flat');
    
    const block3 = createExtensionBlock('thirteenth', 'flat');
    const step3 = getNextVariantKey(block3);
    expect(step3.nextEnabled).toBe(false);
  });

  it('should handle chord tones with simple on/off toggle', () => {
    const chordTone: PlaygroundBlock = {
      id: 'root',
      label: 'R',
      note: 'C',
      voicingRole: 'root',
      cssRole: 'root',
      enabled: true,
      isExtension: false,
    };
    
    const result = getNextVariantKey(chordTone);
    expect(result.nextEnabled).toBe(false);
    
    const disabledChordTone = { ...chordTone, enabled: false };
    const result2 = getNextVariantKey(disabledChordTone);
    expect(result2.nextEnabled).toBe(true);
  });
});
