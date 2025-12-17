import {
  CHROMATIC_SCALE,
  ExtensionKey,
  ExtendedChordTones,
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

const NOTE_INDEX_MAP = new Map<NoteName, number>(
  CHROMATIC_SCALE.map((note, index) => [note, index])
);

const VARIANT_SEQUENCE: ExtensionVariantKey[] = ['natural', 'flat', 'sharp'];

export function getMidiValue(note: NoteName, octave: number): number {
  const semitone = NOTE_INDEX_MAP.get(note) ?? 0;
  return octave * 12 + semitone;
}

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

const BASE_OCTAVE = 3;
const OCTAVE_SPREAD = 2; // Covers octaves 3-5 inclusive

/**
 * Map block position to an octave so that left-most blocks produce the lowest pitch.
 */
export function getOctaveForPosition(position: number, totalEnabled: number): number {
  if (totalEnabled <= 1) {
    return BASE_OCTAVE;
  }

  const ratio = position / (totalEnabled - 1);
  const octaveOffset = Math.floor(ratio * OCTAVE_SPREAD);

  return BASE_OCTAVE + octaveOffset;
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
