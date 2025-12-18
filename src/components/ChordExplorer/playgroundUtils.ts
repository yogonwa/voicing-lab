import {
  CHROMATIC_SCALE,
  ExtensionKey,
  ExtendedChordTones,
  Note,
  NoteName,
  SelectedExtensions,
  VoicingRole,
} from '../../lib';

/**
 * Playground block metadata used across the Chord Explorer.
 * Blocks represent each chord tone/extension that can be reordered
 * inside Playground Mode.
 */
export type ExtensionVariantKey = 'natural' | 'flat' | 'sharp';

export interface PlaygroundVariant {
  key: ExtensionVariantKey;
  note: NoteName;
  role: VoicingRole;
  label: string;
  extensionKey?: ExtensionKey;
}

export interface PlaygroundBlock {
  id: string;
  label: string;
  note: NoteName;
  voicingRole: VoicingRole;
  cssRole: string;
  enabled: boolean;
  isExtension: boolean;
  variants?: PlaygroundVariant[];
  variantKey?: ExtensionVariantKey;
}

type ExtensionDegree = 'ninth' | 'eleventh' | 'thirteenth';

const ROLE_CLASS_MAP: Record<VoicingRole, string> = {
  root: 'root',
  third: 'third',
  fifth: 'fifth',
  seventh: 'seventh',
  ninth: 'ninth',
  flatNinth: 'flat-ninth',
  sharpNinth: 'sharp-ninth',
  eleventh: 'eleventh',
  sharpEleventh: 'sharp-eleventh',
  thirteenth: 'thirteenth',
  flatThirteenth: 'flat-thirteenth',
};

const VARIANT_SEQUENCE: ExtensionVariantKey[] = ['natural', 'flat', 'sharp'];

const MIN_OCTAVE = 3;
const MAX_OCTAVE = 6;
const MIN_PITCH = 48; // C3
const MAX_PITCH = 95; // B6

function createBlock(params: {
  id: string;
  label: string;
  note: NoteName;
  voicingRole: VoicingRole;
  isExtension: boolean;
  enabled?: boolean;
  variants?: PlaygroundVariant[];
  variantKey?: ExtensionVariantKey;
}): PlaygroundBlock {
  const { id, label, note, voicingRole, isExtension, enabled = true, variants, variantKey } = params;
  return {
    id,
    label,
    note,
    voicingRole,
    cssRole: ROLE_CLASS_MAP[voicingRole] ?? 'root',
    enabled,
    isExtension,
    variants,
    variantKey,
  };
}

const EXTENSION_VARIANTS: Record<ExtensionDegree, { key: ExtensionVariantKey; role: VoicingRole; label: string; extensionKey?: ExtensionKey; getNote: (tones: ExtendedChordTones) => NoteName | undefined; }[]> = {
  ninth: [
    {
      key: 'natural',
      role: 'ninth',
      label: '9',
      extensionKey: 'ninth',
      getNote: (tones) => tones.extensions?.ninth,
    },
    {
      key: 'flat',
      role: 'flatNinth',
      label: '♭9',
      extensionKey: 'flatNinth',
      getNote: (tones) => tones.alterations?.flatNinth,
    },
    {
      key: 'sharp',
      role: 'sharpNinth',
      label: '♯9',
      extensionKey: 'sharpNinth',
      getNote: (tones) => tones.alterations?.sharpNinth,
    },
  ],
  eleventh: [
    {
      key: 'natural',
      role: 'eleventh',
      label: '11',
      extensionKey: 'eleventh',
      getNote: (tones) => tones.extensions?.eleventh,
    },
    {
      key: 'sharp',
      role: 'sharpEleventh',
      label: '♯11',
      extensionKey: 'sharpEleventh',
      getNote: (tones) => tones.extensions?.sharpEleventh,
    },
  ],
  thirteenth: [
    {
      key: 'natural',
      role: 'thirteenth',
      label: '13',
      extensionKey: 'thirteenth',
      getNote: (tones) => tones.extensions?.thirteenth,
    },
    {
      key: 'flat',
      role: 'flatThirteenth',
      label: '♭13',
      extensionKey: 'flatThirteenth',
      getNote: (tones) => tones.alterations?.flatThirteenth,
    },
  ],
};

const EXTENSION_BLOCKS: { degree: ExtensionDegree; label: string }[] = [
  { degree: 'ninth', label: '9' },
  { degree: 'eleventh', label: '11' },
  { degree: 'thirteenth', label: '13' },
];

function findVariant(block: PlaygroundBlock, key?: ExtensionVariantKey): PlaygroundVariant | undefined {
  if (!block.variants || block.variants.length === 0) return undefined;
  if (key) {
    return block.variants.find((variant) => variant.key === key) ?? block.variants[0];
  }
  return block.variants[0];
}

function applyVariant(block: PlaygroundBlock, key?: ExtensionVariantKey): PlaygroundBlock {
  if (!block.variants || block.variants.length === 0) {
    return block;
  }
  const variant = findVariant(block, key);
  if (!variant) {
    return block;
  }

  return {
    ...block,
    label: variant.label,
    note: variant.note,
    voicingRole: variant.role,
    cssRole: ROLE_CLASS_MAP[variant.role] ?? block.cssRole,
    variantKey: variant.key,
  };
}

/**
 * Build the default set of playground blocks for the current chord + extensions.
 */
export function buildPlaygroundBlocks(
  chordTones: ExtendedChordTones,
  selectedExtensions: SelectedExtensions
): PlaygroundBlock[] {
  const chordBlocks: PlaygroundBlock[] = [
    createBlock({ id: 'root', label: 'R', note: chordTones.root, voicingRole: 'root', isExtension: false }),
    createBlock({ id: 'third', label: '3', note: chordTones.third, voicingRole: 'third', isExtension: false }),
    createBlock({ id: 'fifth', label: '5', note: chordTones.fifth, voicingRole: 'fifth', isExtension: false }),
    createBlock({ id: 'seventh', label: '7', note: chordTones.seventh, voicingRole: 'seventh', isExtension: false }),
  ];

  const extensionBlocks: PlaygroundBlock[] = [];

  EXTENSION_BLOCKS.forEach(({ degree, label }) => {
    const variantDefs = EXTENSION_VARIANTS[degree]
      .map((variant) => {
        const note = variant.getNote(chordTones);
        if (!note) return undefined;
        return {
          key: variant.key,
          note,
          role: variant.role,
          label: variant.label,
          extensionKey: variant.extensionKey,
        } as PlaygroundVariant;
      })
      .filter(Boolean) as PlaygroundVariant[];

    if (variantDefs.length === 0) return;

    const selectedVariant = variantDefs.find(
      (variant) => variant.extensionKey && selectedExtensions[variant.extensionKey]
    );

    const defaultVariant = variantDefs.find((variant) => variant.key === 'natural') ?? variantDefs[0];

    let block = createBlock({
      id: degree,
      label,
      note: defaultVariant.note,
      voicingRole: defaultVariant.role,
      isExtension: true,
      enabled: Boolean(selectedVariant),
      variants: variantDefs,
      variantKey: (selectedVariant ?? defaultVariant).key,
    });

    block = applyVariant(block, block.variantKey);
    extensionBlocks.push(block);
  });

  return [...chordBlocks, ...extensionBlocks];
}

/**
 * Merge updated chord data into the existing playground block order.
 * Preserves the user's order while refreshing note names/enabled flags.
 */
export function mergePlaygroundBlocks(
  previous: PlaygroundBlock[],
  next: PlaygroundBlock[]
): PlaygroundBlock[] {
  if (previous.length === 0) {
    return next;
  }

  const nextById = new Map(next.map((block) => [block.id, block]));
  const merged: PlaygroundBlock[] = [];

  previous.forEach((block) => {
    const updated = nextById.get(block.id);
    if (updated) {
      let mergedBlock = applyVariant(updated, block.variantKey);
      mergedBlock = {
        ...mergedBlock,
        enabled: block.enabled,
      };
      merged.push(mergedBlock);
      nextById.delete(block.id);
    }
  });

  // Append any new blocks that were not in the previous order (e.g., new extensions)
  nextById.forEach((block) => {
    merged.push(block);
  });

  return merged;
}

/**
 * Return only the enabled blocks (used for ordering + playback).
 */
export function getEnabledBlocks(blocks: PlaygroundBlock[]): PlaygroundBlock[] {
  return blocks.filter((block) => block.enabled);
}

export function getNextVariantKey(
  block: PlaygroundBlock
): { nextKey?: ExtensionVariantKey; nextEnabled: boolean } {
  if (!block.variants || block.variants.length === 0) {
    return { nextEnabled: !block.enabled, nextKey: block.variantKey };
  }

  const available = VARIANT_SEQUENCE.filter((key) =>
    block.variants!.some((variant) => variant.key === key)
  );

  if (!block.enabled) {
    const targetKey = block.variantKey && available.includes(block.variantKey)
      ? block.variantKey
      : available[0];
    return { nextEnabled: true, nextKey: targetKey };
  }

  const currentKey = block.variantKey && available.includes(block.variantKey)
    ? block.variantKey
    : available[0];
  const currentIndex = available.indexOf(currentKey);
  if (currentIndex === available.length - 1) {
    return { nextEnabled: false, nextKey: currentKey };
  }

  return {
    nextEnabled: true,
    nextKey: available[currentIndex + 1],
  };
}

export function updateBlockVariant(block: PlaygroundBlock, key?: ExtensionVariantKey, enabled?: boolean): PlaygroundBlock {
  let nextBlock = block;
  if (key) {
    nextBlock = applyVariant(block, key);
  }
  if (typeof enabled === 'boolean') {
    nextBlock = {
      ...nextBlock,
      enabled,
    };
  }
  return nextBlock;
}

export type VoicePresetHint = 'compact' | 'spread';

const NOTE_CHROMAS: Record<NoteName, number> = CHROMATIC_SCALE.reduce((acc, note, index) => {
  acc[note] = index;
  return acc;
}, {} as Record<NoteName, number>);

function getNoteChroma(note: NoteName): number {
  return NOTE_CHROMAS[note] ?? 0;
}

function buildNote(note: NoteName, octave: number): Note {
  return `${note}${octave}` as Note;
}

function parseNote(note: Note): { name: NoteName; octave: number } {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) {
    throw new Error(`Invalid note: ${note}`);
  }
  return { name: match[1] as NoteName, octave: parseInt(match[2], 10) };
}

function changeOctave(note: Note, delta: number): Note {
  const { name, octave } = parseNote(note);
  const nextOctave = Math.max(MIN_OCTAVE, Math.min(MAX_OCTAVE, octave + delta));
  return buildNote(name, nextOctave);
}

function raiseOctave(note: Note, steps = 1): Note {
  return changeOctave(note, steps);
}

function lowerOctave(note: Note, steps = 1): Note {
  return changeOctave(note, -steps);
}

function getAbsolutePitch(note: Note): number {
  const { name, octave } = parseNote(note);
  return (octave + 1) * 12 + getNoteChroma(name);
}

function getBaseOctaveForCount(noteCount: number, hasRoot: boolean, hint?: VoicePresetHint): number {
  if (hint === 'compact' && noteCount <= 4) return 4;
  if (hint === 'spread') return 3;
  if (noteCount >= 6) return 3;
  return 4;
}

function getTargetSpread(noteCount: number): number {
  if (noteCount <= 2) return 12;
  if (noteCount === 3) return 12;
  if (noteCount === 4) return 18;
  if (noteCount === 5) return 24;
  return 30;
}

function applyOctaveWrapping(blocks: PlaygroundBlock[], baseOctave: number): Note[] {
  const result: Note[] = [];
  let currentOctave = baseOctave;
  let previousChroma: number | null = null;

  blocks.forEach((block) => {
    const chroma = getNoteChroma(block.note);
    if (previousChroma !== null && chroma < previousChroma) {
      currentOctave += 1;
    }
    const clampedOctave = Math.min(MAX_OCTAVE, currentOctave);
    result.push(buildNote(block.note, clampedOctave));
    previousChroma = chroma;
  });

  return result;
}

function enforceRootLowestPitch(blocks: PlaygroundBlock[], notes: Note[]): Note[] {
  const rootIndex = blocks.findIndex((block) => block.voicingRole === 'root' && block.enabled);
  if (rootIndex === -1) {
    return notes;
  }

  const adjusted = [...notes];
  let rootNote = adjusted[rootIndex];
  let rootPitch = getAbsolutePitch(rootNote);
  let lowestOther = Infinity;

  adjusted.forEach((note, idx) => {
    if (idx === rootIndex) return;
    lowestOther = Math.min(lowestOther, getAbsolutePitch(note));
  });

  while (lowestOther < rootPitch && parseNote(rootNote).octave > MIN_OCTAVE) {
    rootNote = lowerOctave(rootNote);
    rootPitch = getAbsolutePitch(rootNote);
  }

  if (lowestOther < rootPitch) {
    adjusted.forEach((note, idx) => {
      if (idx === rootIndex) return;
      let updated = note;
      while (getAbsolutePitch(updated) <= rootPitch && parseNote(updated).octave < MAX_OCTAVE) {
        updated = raiseOctave(updated);
      }
      adjusted[idx] = updated;
    });
  }

  adjusted[rootIndex] = rootNote;
  return adjusted;
}

function avoidMuddyBass(notes: Note[]): Note[] {
  const adjusted = [...notes];
  for (let i = 0; i < adjusted.length - 1; i++) {
    const noteA = adjusted[i];
    const noteB = adjusted[i + 1];
    if (parseNote(noteA).octave < 4 && parseNote(noteB).octave < 4) {
      const interval = getAbsolutePitch(noteB) - getAbsolutePitch(noteA);
      if (interval > 0 && interval < 5) {
        adjusted[i + 1] = raiseOctave(noteB);
      }
    }
  }
  return adjusted;
}

function clampTopRange(notes: Note[]): Note[] {
  return notes.map((note) => {
    let current = note;
    while (getAbsolutePitch(current) > MAX_PITCH) {
      current = lowerOctave(current);
    }
    return current;
  });
}

function clampToPlayableRange(notes: Note[]): Note[] {
  return notes.map((note) => {
    let current = note;
    while (getAbsolutePitch(current) < MIN_PITCH) {
      current = raiseOctave(current);
    }
    return current;
  });
}

function ensureMinimumSpread(notes: Note[], noteCount: number): Note[] {
  if (noteCount <= 2 || notes.length < 2) {
    return notes;
  }

  const adjusted = [...notes];
  const targetSpread = getTargetSpread(noteCount);
  let lowest = getAbsolutePitch(adjusted[0]);
  let highest = getAbsolutePitch(adjusted[adjusted.length - 1]);

  while (highest - lowest < targetSpread && parseNote(adjusted[adjusted.length - 1]).octave < MAX_OCTAVE) {
    adjusted[adjusted.length - 1] = raiseOctave(adjusted[adjusted.length - 1]);
    highest = getAbsolutePitch(adjusted[adjusted.length - 1]);
  }

  return adjusted;
}

function clampMaximumSpread(notes: Note[]): Note[] {
  if (notes.length < 2) return notes;
  const adjusted = [...notes];
  let lowest = getAbsolutePitch(adjusted[0]);
  let highest = getAbsolutePitch(adjusted[adjusted.length - 1]);

  while (highest - lowest > 30 && parseNote(adjusted[adjusted.length - 1]).octave > MIN_OCTAVE) {
    adjusted[adjusted.length - 1] = lowerOctave(adjusted[adjusted.length - 1]);
    highest = getAbsolutePitch(adjusted[adjusted.length - 1]);
  }

  return adjusted;
}

function applyGlobalConstraints(notes: Note[], noteCount: number): Note[] {
  let adjusted = [...notes];
  adjusted = avoidMuddyBass(adjusted);
  adjusted = clampTopRange(adjusted);
  adjusted = ensureMinimumSpread(adjusted, noteCount);
  adjusted = clampMaximumSpread(adjusted);
  adjusted = clampToPlayableRange(adjusted);
  return adjusted;
}

export function voicePlaygroundBlocks(
  blocks: PlaygroundBlock[],
  options?: { presetHint?: VoicePresetHint }
): Note[] {
  const enabledBlocks = blocks.filter((block) => block.enabled);
  if (enabledBlocks.length === 0) {
    return [];
  }

  const hasRoot = enabledBlocks.some((block) => block.voicingRole === 'root');
  const baseOctave = getBaseOctaveForCount(enabledBlocks.length, hasRoot, options?.presetHint);
  let voiced = applyOctaveWrapping(enabledBlocks, baseOctave);

  if (hasRoot) {
    voiced = enforceRootLowestPitch(enabledBlocks, voiced);
  }

  voiced = applyGlobalConstraints(voiced, enabledBlocks.length);
  return voiced;
}

export function getRootWarning(blocks: PlaygroundBlock[]): string | null {
  const enabled = blocks.filter((block) => block.enabled);
  if (enabled.length === 0) return null;
  const rootIndex = enabled.findIndex((block) => block.voicingRole === 'root');
  if (rootIndex <= 0) {
    return rootIndex === -1 ? null : null;
  }
  return 'Root should be lowest for clear harmony';
}
