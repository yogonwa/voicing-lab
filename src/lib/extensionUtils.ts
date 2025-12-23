/**
 * Extension helpers (pure).
 *
 * Central place for mapping extension keys to:
 * - the resolved note name from an `ExtendedChordTones`
 * - the corresponding `VoicingRole`
 *
 * This avoids duplicated switch statements across UI + keyboard logic.
 */

import type { ExtendedChordTones, NoteName } from './chordCalculator';
import type { ExtensionKey } from './extensionConfig';
import type { VoicingRole } from './voicingTemplates';

export const DEFAULT_EXTENSION_RENDER_ORDER: ExtensionKey[] = [
  'ninth',
  'flatNinth',
  'sharpNinth',
  'eleventh',
  'sharpEleventh',
  'thirteenth',
  'flatThirteenth',
];

export function getVoicingRoleForExtensionKey(key: ExtensionKey): VoicingRole {
  switch (key) {
    case 'ninth':
      return 'ninth';
    case 'flatNinth':
      return 'flatNinth';
    case 'sharpNinth':
      return 'sharpNinth';
    case 'eleventh':
      return 'eleventh';
    case 'sharpEleventh':
      return 'sharpEleventh';
    case 'thirteenth':
      return 'thirteenth';
    case 'flatThirteenth':
      return 'flatThirteenth';
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}

export function getNoteNameForExtensionKey(
  tones: ExtendedChordTones,
  key: ExtensionKey
): NoteName | undefined {
  switch (key) {
    case 'ninth':
      return tones.extensions?.ninth;
    case 'eleventh':
      return tones.extensions?.eleventh;
    case 'sharpEleventh':
      return tones.extensions?.sharpEleventh;
    case 'thirteenth':
      return tones.extensions?.thirteenth;
    case 'flatNinth':
      return tones.alterations?.flatNinth;
    case 'sharpNinth':
      return tones.alterations?.sharpNinth;
    case 'flatThirteenth':
      return tones.alterations?.flatThirteenth;
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}

/**
 * Resolve the voicing role for a given note name by comparing against chord tones.
 * Useful for keyboard highlighting when we only have note names (no ExtensionKey).
 */
export function getVoicingRoleForNoteName(
  tones: ExtendedChordTones,
  noteName: NoteName
): VoicingRole | undefined {
  if (noteName === tones.root) return 'root';
  if (noteName === tones.third) return 'third';
  if (noteName === tones.fifth) return 'fifth';
  if (noteName === tones.seventh) return 'seventh';

  for (const key of DEFAULT_EXTENSION_RENDER_ORDER) {
    const candidate = getNoteNameForExtensionKey(tones, key);
    if (candidate && candidate === noteName) {
      return getVoicingRoleForExtensionKey(key);
    }
  }

  return undefined;
}


