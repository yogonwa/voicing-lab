import {
  CHROMATIC_SCALE,
  EXTENSION_LABELS,
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
export interface PlaygroundBlock {
  id: string;
  label: string;
  note: NoteName;
  voicingRole: VoicingRole;
  cssRole: string;
  enabled: boolean;
  isExtension: boolean;
}

/** Order for rendering extension blocks */
export const EXTENSION_ORDER: ExtensionKey[] = [
  'ninth',
  'flatNinth',
  'sharpNinth',
  'eleventh',
  'sharpEleventh',
  'thirteenth',
  'flatThirteenth',
];

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

export function getMidiValue(note: NoteName, octave: number): number {
  const semitone = NOTE_INDEX_MAP.get(note) ?? 0;
  return octave * 12 + semitone;
}

function createBlock(
  id: string,
  label: string,
  note: NoteName,
  voicingRole: VoicingRole,
  isExtension: boolean,
  enabled = true
): PlaygroundBlock {
  return {
    id,
    label,
    note,
    voicingRole,
    cssRole: ROLE_CLASS_MAP[voicingRole] ?? 'root',
    enabled,
    isExtension,
  };
}

function getExtensionNote(
  chordTones: ExtendedChordTones,
  key: ExtensionKey
): NoteName | undefined {
  switch (key) {
    case 'ninth':
      return chordTones.extensions?.ninth;
    case 'flatNinth':
      return chordTones.alterations?.flatNinth;
    case 'sharpNinth':
      return chordTones.alterations?.sharpNinth;
    case 'eleventh':
      return chordTones.extensions?.eleventh;
    case 'sharpEleventh':
      return chordTones.extensions?.sharpEleventh;
    case 'thirteenth':
      return chordTones.extensions?.thirteenth;
    case 'flatThirteenth':
      return chordTones.alterations?.flatThirteenth;
    default:
      return undefined;
  }
}

/**
 * Build the default set of playground blocks for the current chord + extensions.
 */
export function buildPlaygroundBlocks(
  chordTones: ExtendedChordTones,
  selectedExtensions: SelectedExtensions
): PlaygroundBlock[] {
  const chordBlocks: PlaygroundBlock[] = [
    createBlock('root', 'R', chordTones.root, 'root', false),
    createBlock('third', '3', chordTones.third, 'third', false),
    createBlock('fifth', '5', chordTones.fifth, 'fifth', false),
    createBlock('seventh', '7', chordTones.seventh, 'seventh', false),
  ];

  const extensionBlocks: PlaygroundBlock[] = [];

  EXTENSION_ORDER.forEach((key) => {
    const note = getExtensionNote(chordTones, key);
    if (!note) return;

    extensionBlocks.push(
      createBlock(
        key,
        EXTENSION_LABELS[key],
        note,
        key,
        true,
        Boolean(selectedExtensions[key])
      )
    );
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
      merged.push({
        ...updated,
        enabled: block.enabled,
      });
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
