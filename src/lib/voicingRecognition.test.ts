/**
 * Voicing Recognition Tests
 */

import { detectVoicingPattern, getPatternDescription } from './voicingRecognition';
import type { PlaygroundBlock } from '../components/ChordExplorer/playgroundUtils';

describe('voicingRecognition', () => {
  const createBlock = (role: string, enabled = true): PlaygroundBlock => ({
    id: role,
    label: role,
    note: 'C',
    voicingRole: role as any,
    enabled,
    isExtension: false,
    cssRole: role,
  });

  describe('detectVoicingPattern', () => {
    it('detects Shell A pattern exactly', () => {
      const blocks = [
        createBlock('root'),
        createBlock('third'),
        createBlock('seventh'),
      ];

      const result = detectVoicingPattern(blocks);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('shell-a');
      expect(result?.matchType).toBe('exact');
      expect(result?.confidence).toBe(100);
    });

    it('detects Shell B pattern exactly', () => {
      const blocks = [
        createBlock('root'),
        createBlock('seventh'),
        createBlock('third'),
      ];

      const result = detectVoicingPattern(blocks);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('shell-b');
      expect(result?.matchType).toBe('exact');
    });

    it('detects Rootless A pattern exactly', () => {
      const blocks = [
        createBlock('third'),
        createBlock('fifth'),
        createBlock('seventh'),
        createBlock('ninth'),
      ];

      const result = detectVoicingPattern(blocks);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('rootless-a');
      expect(result?.matchType).toBe('exact');
    });

    it('detects Drop-2 pattern exactly', () => {
      const blocks = [
        createBlock('fifth'),
        createBlock('root'),
        createBlock('third'),
        createBlock('seventh'),
      ];

      const result = detectVoicingPattern(blocks);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('drop-2');
      expect(result?.matchType).toBe('exact');
    });

    it('detects fuzzy match with extra notes', () => {
      const blocks = [
        createBlock('root'),
        createBlock('third'),
        createBlock('fifth'), // Extra note
        createBlock('seventh'),
        createBlock('ninth'), // Extra note
      ];

      const result = detectVoicingPattern(blocks);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('shell-a');
      expect(result?.matchType).toBe('fuzzy');
      expect(result?.confidence).toBeLessThan(100);
      expect(result?.extraNotes).toContain('fifth');
      expect(result?.extraNotes).toContain('ninth');
    });

    it('returns null for unrecognized pattern', () => {
      const blocks = [
        createBlock('ninth'),
        createBlock('eleventh'),
      ];

      const result = detectVoicingPattern(blocks);

      expect(result).toBeNull();
    });

    it('returns null for less than 2 blocks', () => {
      const blocks = [createBlock('root')];

      const result = detectVoicingPattern(blocks);

      expect(result).toBeNull();
    });

    it('ignores disabled blocks', () => {
      const blocks = [
        createBlock('root'),
        createBlock('third'),
        createBlock('fifth', false), // Disabled
        createBlock('seventh'),
      ];

      const result = detectVoicingPattern(blocks);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('shell-a');
      expect(result?.matchType).toBe('exact');
    });
  });

  describe('getPatternDescription', () => {
    it('returns description for exact match', () => {
      const detected = {
        id: 'shell-a',
        name: 'Shell A',
        matchType: 'exact' as const,
        confidence: 100,
        patternData: {
          id: 'shell-a',
          name: 'Shell A',
          pattern: [],
          category: 'shell' as const,
          description: 'Root in bass, guide tones on top',
          whyItWorks: 'Test',
          commonUse: 'Test',
        },
      };

      const desc = getPatternDescription(detected);

      expect(desc).toBe('Root in bass, guide tones on top');
    });

    it('includes extra notes for fuzzy match', () => {
      const detected = {
        id: 'shell-a',
        name: 'Shell A',
        matchType: 'fuzzy' as const,
        confidence: 85,
        extraNotes: ['fifth' as any, 'ninth' as any],
        patternData: {
          id: 'shell-a',
          name: 'Shell A',
          pattern: [],
          category: 'shell' as const,
          description: 'Root in bass, guide tones on top',
          whyItWorks: 'Test',
          commonUse: 'Test',
        },
      };

      const desc = getPatternDescription(detected);

      expect(desc).toContain('Root in bass, guide tones on top');
      expect(desc).toContain('5th');
      expect(desc).toContain('9th');
    });
  });
});

