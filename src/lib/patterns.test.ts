/**
 * Pattern Library Tests
 */

import { VOICING_PATTERNS, getAllPatternIds, getPatternById, getPatternsByCategory } from './patterns';

describe('patterns', () => {
  describe('VOICING_PATTERNS', () => {
    it('has no duplicate IDs', () => {
      const ids = VOICING_PATTERNS.map(p => p.id);
      const uniqueIds = new Set(ids);
      
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('all patterns have required fields', () => {
      VOICING_PATTERNS.forEach(pattern => {
        expect(pattern.id).toBeDefined();
        expect(pattern.name).toBeDefined();
        expect(pattern.pattern).toBeDefined();
        expect(Array.isArray(pattern.pattern)).toBe(true);
        expect(pattern.category).toBeDefined();
        expect(pattern.description).toBeDefined();
        expect(pattern.whyItWorks).toBeDefined();
        expect(pattern.commonUse).toBeDefined();
      });
    });

    it('all patterns have non-empty descriptions', () => {
      VOICING_PATTERNS.forEach(pattern => {
        expect(pattern.description.length).toBeGreaterThan(0);
        expect(pattern.whyItWorks.length).toBeGreaterThan(0);
        expect(pattern.commonUse.length).toBeGreaterThan(0);
      });
    });

    it('has patterns in all categories', () => {
      const categories = new Set(VOICING_PATTERNS.map(p => p.category));
      
      expect(categories.has('shell')).toBe(true);
      expect(categories.has('rootless')).toBe(true);
      expect(categories.has('spread')).toBe(true);
      expect(categories.has('inversion')).toBe(true);
      expect(categories.has('slash')).toBe(true);
    });

    it('has at least 18 patterns', () => {
      expect(VOICING_PATTERNS.length).toBeGreaterThanOrEqual(18);
    });
  });

  describe('getAllPatternIds', () => {
    it('returns all pattern IDs', () => {
      const ids = getAllPatternIds();
      
      expect(ids.length).toBe(VOICING_PATTERNS.length);
      expect(ids).toContain('shell-a');
      expect(ids).toContain('rootless-a');
      expect(ids).toContain('drop-2');
    });
  });

  describe('getPatternById', () => {
    it('returns pattern for valid ID', () => {
      const pattern = getPatternById('shell-a');
      
      expect(pattern).toBeDefined();
      expect(pattern?.name).toBe('Shell Position A');
    });

    it('returns undefined for invalid ID', () => {
      const pattern = getPatternById('nonexistent');
      
      expect(pattern).toBeUndefined();
    });
  });

  describe('getPatternsByCategory', () => {
    it('returns shell patterns', () => {
      const patterns = getPatternsByCategory('shell');
      
      expect(patterns.length).toBeGreaterThan(0);
      patterns.forEach(p => {
        expect(p.category).toBe('shell');
      });
    });

    it('returns rootless patterns', () => {
      const patterns = getPatternsByCategory('rootless');
      
      expect(patterns.length).toBeGreaterThan(0);
      patterns.forEach(p => {
        expect(p.category).toBe('rootless');
      });
    });

    it('returns empty array for no matches', () => {
      const patterns = getPatternsByCategory('nonexistent' as any);
      
      expect(patterns).toEqual([]);
    });
  });
});

