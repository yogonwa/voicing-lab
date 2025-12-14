import { EXTENSION_LABELS, ExtensionKey, SelectedExtensions } from '../../lib/extensionConfig';
import { ExtendedChordTones, NoteName } from '../../lib/chordCalculator';

export type PlaygroundBlockRole =
  | 'root'
  | 'third'
  | 'fifth'
  | 'seventh'
  | ExtensionKey;

export interface PlaygroundBlock {
  id: string;
  role: PlaygroundBlockRole;
  label: string;
  noteName: NoteName;
  pitch: string;
  enabled: boolean;
  position: number;
  isCore: boolean;
}

const CORE_BLOCKS: Array<{ role: PlaygroundBlockRole; label: string; octave: number; getNote: (tones: ExtendedChordTones) => NoteName }> = [
  { role: 'root', label: 'R', octave: 3, getNote: (tones) => tones.root },
  { role: 'third', label: '3', octave: 4, getNote: (tones) => tones.third },
  { role: 'fifth', label: '5', octave: 4, getNote: (tones) => tones.fifth },
  { role: 'seventh', label: '7', octave: 4, getNote: (tones) => tones.seventh },
];

const EXTENSION_ORDER: Array<{ key: ExtensionKey; getNote: (tones: ExtendedChordTones) => NoteName | undefined }> = [
  { key: 'ninth', getNote: (tones) => tones.extensions?.ninth },
  { key: 'flatNinth', getNote: (tones) => tones.alterations?.flatNinth },
  { key: 'sharpNinth', getNote: (tones) => tones.alterations?.sharpNinth },
  { key: 'eleventh', getNote: (tones) => tones.extensions?.eleventh },
  { key: 'sharpEleventh', getNote: (tones) => tones.extensions?.sharpEleventh },
  { key: 'thirteenth', getNote: (tones) => tones.extensions?.thirteenth },
  { key: 'flatThirteenth', getNote: (tones) => tones.alterations?.flatThirteenth },
];

function ensureMinimumEnabled(blocks: PlaygroundBlock[], minimumEnabled = 2): PlaygroundBlock[] {
  const enabledCount = blocks.filter((block) => block.enabled).length;

  if (enabledCount >= minimumEnabled) {
    return blocks;
  }

  const normalized: PlaygroundBlock[] = [];
  let needed = minimumEnabled - enabledCount;

  blocks.forEach((block) => {
    if (block.enabled || needed <= 0) {
      normalized.push(block);
      return;
    }

    normalized.push({ ...block, enabled: true });
    needed -= 1;
  });

  return normalized;
}

function getDefaultOctaveForExtension(key: ExtensionKey): number {
  if (key === 'flatThirteenth' || key === 'thirteenth') {
    return 5;
  }

  return 5;
}

export function buildPlaygroundState(
  chordTones: ExtendedChordTones,
  selectedExtensions: SelectedExtensions
): PlaygroundBlock[] {
  const blocks: PlaygroundBlock[] = [];

  CORE_BLOCKS.forEach(({ role, label, octave, getNote }, index) => {
    const noteName = getNote(chordTones);
    blocks.push({
      id: role,
      role,
      label,
      noteName,
      pitch: `${noteName}${octave}`,
      enabled: true,
      position: index,
      isCore: true,
    });
  });

  EXTENSION_ORDER.forEach(({ key, getNote }) => {
    if (!selectedExtensions[key]) {
      return;
    }

    const noteName = getNote(chordTones);
    if (!noteName) return;

    const position = blocks.length;
    blocks.push({
      id: key,
      role: key,
      label: EXTENSION_LABELS[key],
      noteName,
      pitch: `${noteName}${getDefaultOctaveForExtension(key)}`,
      enabled: true,
      position,
      isCore: false,
    });
  });

  return ensureMinimumEnabled(blocks).map((block, index) => ({
    ...block,
    position: index,
  }));
}

export function enabledBlocks(blocks: PlaygroundBlock[]): PlaygroundBlock[] {
  const enabledOnly = blocks.filter((block) => block.enabled);

  return enabledOnly.map((block, index) => ({
    ...block,
    position: index,
  }));
}
