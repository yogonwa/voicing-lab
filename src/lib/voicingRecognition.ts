/**
 * Voicing Recognition Module
 * 
 * Detects standard jazz voicing patterns from user-built voicings.
 * Supports both exact and fuzzy matching with confidence scoring.
 */

import type { VoicingRole } from './voicingTemplates';
import type { PlaygroundBlock } from '../components/ChordExplorer/playgroundUtils';
import { VOICING_PATTERNS, type VoicingPattern } from './patterns';
import { formatVoicingRole } from './noteUtils';

export interface DetectedPattern {
  id: string;
  name: string;
  matchType: 'exact' | 'fuzzy';
  confidence: number; // 0-100
  extraNotes?: VoicingRole[]; // Notes beyond core pattern (for fuzzy matches)
  patternData: VoicingPattern;
}

/**
 * Detect which standard jazz voicing pattern matches the current blocks.
 * 
 * Performs both exact and fuzzy matching:
 * - **Exact match**: All roles match the pattern exactly (confidence: 100%)
 * - **Fuzzy match**: Core pattern present with additional notes (confidence: 60-90%)
 * 
 * Patterns are checked in order of specificity, with exact matches taking priority.
 * 
 * @param blocks - Playground blocks representing the user's voicing
 * @returns Detected pattern with metadata, or null if no match found
 * 
 * @example
 * ```typescript
 * const pattern = detectVoicingPattern(playgroundBlocks);
 * 
 * if (pattern) {
 *   console.log(`Detected: ${pattern.name} (${pattern.matchType})`);
 *   console.log(`Confidence: ${pattern.confidence}%`);
 *   console.log(`Why it works: ${pattern.patternData.whyItWorks}`);
 *   
 *   if (pattern.extraNotes) {
 *     console.log(`Extra notes: ${pattern.extraNotes.join(', ')}`);
 *   }
 * }
 * ```
 */
export function detectVoicingPattern(blocks: PlaygroundBlock[]): DetectedPattern | null {
  const enabledBlocks = blocks.filter(b => b.enabled);
  
  if (enabledBlocks.length < 2) {
    return null; // Need at least 2 notes
  }

  // Extract ordered voicing roles
  const roles: VoicingRole[] = enabledBlocks.map(b => b.voicingRole);

  // Try exact matches first
  for (const pattern of VOICING_PATTERNS) {
    if (matchesPatternExact(roles, pattern.pattern)) {
      return {
        id: pattern.id,
        name: pattern.name,
        matchType: 'exact',
        confidence: 100,
        patternData: pattern,
      };
    }
  }

  // Try fuzzy matches (pattern with extra notes)
  const flexiblePatterns = VOICING_PATTERNS.filter(p => p.flexiblePattern);
  
  for (const pattern of flexiblePatterns) {
    const fuzzyResult = matchesPatternFuzzy(roles, pattern.pattern);
    if (fuzzyResult.matches) {
      return {
        id: pattern.id,
        name: pattern.name,
        matchType: 'fuzzy',
        confidence: calculateConfidence(roles.length, pattern.pattern.length, fuzzyResult.extraNotes),
        extraNotes: fuzzyResult.extraNotes,
        patternData: pattern,
      };
    }
  }

  return null;
}

/**
 * Check if roles exactly match a pattern
 */
function matchesPatternExact(roles: VoicingRole[], pattern: VoicingRole[]): boolean {
  if (roles.length !== pattern.length) return false;
  
  return roles.every((role, index) => role === pattern[index]);
}

/**
 * Check if roles contain a pattern with extra notes
 * Returns matched status and extra notes
 */
function matchesPatternFuzzy(
  roles: VoicingRole[],
  pattern: VoicingRole[]
): { matches: boolean; extraNotes: VoicingRole[] } {
  if (roles.length < pattern.length) {
    return { matches: false, extraNotes: [] };
  }

  // Check if pattern appears as a subsequence in roles (maintaining order)
  let patternIndex = 0;
  const extraNotes: VoicingRole[] = [];

  for (let i = 0; i < roles.length; i++) {
    if (patternIndex < pattern.length && roles[i] === pattern[patternIndex]) {
      patternIndex++;
    } else {
      extraNotes.push(roles[i]);
    }
  }

  const matches = patternIndex === pattern.length;
  return { matches, extraNotes };
}

/**
 * Calculate confidence score for fuzzy matches
 * Higher confidence = closer to core pattern
 */
function calculateConfidence(
  totalNotes: number,
  corePatternLength: number,
  extraNotes: VoicingRole[]
): number {
  // Base confidence on ratio of core pattern to total notes
  const ratio = corePatternLength / totalNotes;
  const baseConfidence = ratio * 100;

  // Penalize based on number of extra notes
  const extraPenalty = extraNotes.length * 5; // 5% penalty per extra note

  const confidence = Math.max(50, Math.min(95, baseConfidence - extraPenalty));
  return Math.round(confidence);
}

/**
 * Get a human-readable description of the detected pattern.
 * 
 * For exact matches, returns the pattern's base description.
 * For fuzzy matches, appends information about extra notes.
 * 
 * @param detected - The detected pattern from `detectVoicingPattern`
 * @returns Formatted description string
 * 
 * @example
 * ```typescript
 * const pattern = detectVoicingPattern(blocks);
 * if (pattern) {
 *   const desc = getPatternDescription(pattern);
 *   // Exact: "Root-3rd-7th shell voicing"
 *   // Fuzzy: "Root-3rd-7th shell voicing with added 9th, 13th"
 * }
 * ```
 */
export function getPatternDescription(detected: DetectedPattern): string {
  if (detected.matchType === 'exact') {
    return detected.patternData.description;
  }

  // Fuzzy match - mention extra notes
  const extraNotesDesc = detected.extraNotes
    ? ` with added ${detected.extraNotes.map(formatRole).join(', ')}`
    : '';
  
  return `${detected.patternData.description}${extraNotesDesc}`;
}

/**
 * Format a voicing role for display
 * @deprecated Use formatVoicingRole from noteUtils instead
 */
function formatRole(role: VoicingRole): string {
  return formatVoicingRole(role);
}

/**
 * Get pattern categories for filtering/grouping
 */
export function getPatternsByCategory(category: VoicingPattern['category']): VoicingPattern[] {
  return VOICING_PATTERNS.filter(p => p.category === category);
}

