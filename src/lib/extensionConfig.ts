/**
 * Extension Configuration
 * 
 * Defines which extensions are available for each chord quality,
 * grouped by degree (9ths, 11ths, 13ths).
 */

import { ChordQuality } from './chordCalculator';

// ============================================
// TYPES
// ============================================

/** Keys for tracking selected extensions */
export type ExtensionKey = 
  | "ninth" 
  | "flatNinth" 
  | "sharpNinth" 
  | "eleventh" 
  | "sharpEleventh" 
  | "thirteenth" 
  | "flatThirteenth";

/** Selected extensions state */
export interface SelectedExtensions {
  ninth?: boolean;
  flatNinth?: boolean;
  sharpNinth?: boolean;
  eleventh?: boolean;
  sharpEleventh?: boolean;
  thirteenth?: boolean;
  flatThirteenth?: boolean;
}

/** Extension option for UI */
export interface ExtensionOption {
  key: ExtensionKey;
  label: string;           // "9", "♭9", "♯9", etc.
  group: "9ths" | "11ths" | "13ths";
  isAlteration: boolean;   // true for ♭9, ♯9, ♯11, ♭13
}

// ============================================
// EXTENSION LABELS
// ============================================

export const EXTENSION_LABELS: Record<ExtensionKey, string> = {
  ninth: "9",
  flatNinth: "♭9",
  sharpNinth: "♯9",
  eleventh: "11",
  sharpEleventh: "♯11",
  thirteenth: "13",
  flatThirteenth: "♭13",
};

// ============================================
// AVAILABLE EXTENSIONS BY QUALITY
// ============================================

export const AVAILABLE_EXTENSIONS: Record<ChordQuality, ExtensionOption[]> = {
  maj7: [
    { key: "ninth", label: "9", group: "9ths", isAlteration: false },
    { key: "eleventh", label: "11", group: "11ths", isAlteration: false },
    { key: "sharpEleventh", label: "♯11", group: "11ths", isAlteration: false },
    { key: "thirteenth", label: "13", group: "13ths", isAlteration: false },
  ],
  min7: [
    { key: "ninth", label: "9", group: "9ths", isAlteration: false },
    { key: "eleventh", label: "11", group: "11ths", isAlteration: false },
    { key: "thirteenth", label: "13", group: "13ths", isAlteration: false },
    { key: "sharpEleventh", label: "♯11", group: "11ths", isAlteration: false },
  ],
  dom7: [
    { key: "ninth", label: "9", group: "9ths", isAlteration: false },
    { key: "flatNinth", label: "♭9", group: "9ths", isAlteration: true },
    { key: "sharpNinth", label: "♯9", group: "9ths", isAlteration: true },
    { key: "eleventh", label: "11", group: "11ths", isAlteration: false },
    { key: "sharpEleventh", label: "♯11", group: "11ths", isAlteration: false },
    { key: "thirteenth", label: "13", group: "13ths", isAlteration: false },
    { key: "flatThirteenth", label: "♭13", group: "13ths", isAlteration: true },
  ],
  min7b5: [
    { key: "ninth", label: "9", group: "9ths", isAlteration: false },
    { key: "eleventh", label: "11", group: "11ths", isAlteration: false },
    { key: "sharpEleventh", label: "♯11", group: "11ths", isAlteration: false },
    { key: "thirteenth", label: "13", group: "13ths", isAlteration: false },
  ],
  dim7: [
    { key: "ninth", label: "9", group: "9ths", isAlteration: false },
    { key: "eleventh", label: "11", group: "11ths", isAlteration: false },
    { key: "thirteenth", label: "13", group: "13ths", isAlteration: false },
  ],
};

// ============================================
// EXTENSION TIPS
// ============================================

export const EXTENSION_TIPS: Record<ExtensionKey, string> = {
  ninth: "Adds smooth color - the most common extension",
  flatNinth: "Creates tension, wants to resolve downward",
  sharpNinth: "Blues/funk color - the 'Hendrix chord' sound",
  eleventh: "Suspended, open sound - great on minor chords",
  sharpEleventh: "Lydian color - bright, modern, dreamy",
  thirteenth: "Brightens the chord - characteristic of dominant 13",
  flatThirteenth: "Darker altered color - creates tension",
};

// ============================================
// HELPERS
// ============================================

/**
 * Get available extensions grouped by degree for a chord quality
 */
export function getExtensionsByGroup(quality: ChordQuality): {
  "9ths": ExtensionOption[];
  "11ths": ExtensionOption[];
  "13ths": ExtensionOption[];
} {
  const available = AVAILABLE_EXTENSIONS[quality];
  return {
    "9ths": available.filter(e => e.group === "9ths"),
    "11ths": available.filter(e => e.group === "11ths"),
    "13ths": available.filter(e => e.group === "13ths"),
  };
}

/**
 * Create empty selected extensions state
 */
export function createEmptyExtensions(): SelectedExtensions {
  return {};
}

/**
 * Get active extension keys from selected state
 */
export function getActiveExtensionKeys(selected: SelectedExtensions): ExtensionKey[] {
  return (Object.entries(selected) as [ExtensionKey, boolean][])
    .filter(([_, isSelected]) => isSelected)
    .map(([key]) => key);
}

/**
 * Build chord symbol with extensions (e.g., "Cmaj13(♯11)")
 */
export function buildChordSymbol(
  root: string,
  quality: ChordQuality,
  selected: SelectedExtensions
): string {
  const qualitySymbols: Record<ChordQuality, string> = {
    maj7: "maj7",
    min7: "m7",
    dom7: "7",
    min7b5: "m7♭5",
    dim7: "°7",
  };

  const activeKeys = getActiveExtensionKeys(selected);
  
  if (activeKeys.length === 0) {
    return `${root}${qualitySymbols[quality]}`;
  }

  // Determine highest extension for chord name
  let highestExt = "";
  let alterations: string[] = [];

  if (selected.thirteenth || selected.flatThirteenth) {
    highestExt = "13";
    if (selected.flatThirteenth) alterations.push("♭13");
  } else if (selected.eleventh || selected.sharpEleventh) {
    highestExt = "11";
  } else if (selected.ninth || selected.flatNinth || selected.sharpNinth) {
    highestExt = "9";
  }

  // Collect alterations to show in parentheses
  if (selected.sharpEleventh) alterations.push("♯11");
  if (selected.flatNinth) alterations.push("♭9");
  if (selected.sharpNinth) alterations.push("♯9");

  // Build symbol
  let baseSymbol = qualitySymbols[quality];
  
  // Replace "7" with highest extension
  if (highestExt) {
    if (quality === "dom7") {
      baseSymbol = highestExt;
    } else if (quality === "maj7") {
      baseSymbol = `maj${highestExt}`;
    } else if (quality === "min7") {
      baseSymbol = `m${highestExt}`;
    } else {
      baseSymbol = `${qualitySymbols[quality]}(${highestExt})`;
    }
  }

  // Add alterations in parentheses
  const altString = alterations.length > 0 ? `(${alterations.join(",")})` : "";

  return `${root}${baseSymbol}${altString}`;
}
