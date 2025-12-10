/**
 * Tests for extension configuration and helpers
 */

import {
  AVAILABLE_EXTENSIONS,
  EXTENSION_TIPS,
  EXTENSION_LABELS,
  getExtensionsByGroup,
  createEmptyExtensions,
  getActiveExtensionKeys,
  buildChordSymbol,
  type ExtensionKey,
  type SelectedExtensions,
} from './extensionConfig';

describe('extensionConfig', () => {
  describe('AVAILABLE_EXTENSIONS', () => {
    it('provides extensions for maj7', () => {
      const exts = AVAILABLE_EXTENSIONS.maj7;
      expect(exts).toHaveLength(3);
      expect(exts.map(e => e.key)).toEqual(['ninth', 'sharpEleventh', 'thirteenth']);
    });

    it('provides extensions for min7', () => {
      const exts = AVAILABLE_EXTENSIONS.min7;
      expect(exts).toHaveLength(3);
      expect(exts.map(e => e.key)).toEqual(['ninth', 'eleventh', 'thirteenth']);
    });

    it('provides full set of extensions for dom7', () => {
      const exts = AVAILABLE_EXTENSIONS.dom7;
      expect(exts).toHaveLength(7);
      expect(exts.map(e => e.key)).toEqual([
        'ninth',
        'flatNinth',
        'sharpNinth',
        'eleventh',
        'sharpEleventh',
        'thirteenth',
        'flatThirteenth',
      ]);
    });

    it('provides limited extensions for min7b5', () => {
      const exts = AVAILABLE_EXTENSIONS.min7b5;
      expect(exts).toHaveLength(2);
      expect(exts.map(e => e.key)).toEqual(['ninth', 'eleventh']);
    });

    it('provides limited extensions for dim7', () => {
      const exts = AVAILABLE_EXTENSIONS.dim7;
      expect(exts).toHaveLength(2);
      expect(exts.map(e => e.key)).toEqual(['ninth', 'eleventh']);
    });
  });

  describe('EXTENSION_LABELS', () => {
    it('has labels for all extension keys', () => {
      expect(EXTENSION_LABELS.ninth).toBe('9');
      expect(EXTENSION_LABELS.flatNinth).toBe('♭9');
      expect(EXTENSION_LABELS.sharpNinth).toBe('♯9');
      expect(EXTENSION_LABELS.eleventh).toBe('11');
      expect(EXTENSION_LABELS.sharpEleventh).toBe('♯11');
      expect(EXTENSION_LABELS.thirteenth).toBe('13');
      expect(EXTENSION_LABELS.flatThirteenth).toBe('♭13');
    });
  });

  describe('EXTENSION_TIPS', () => {
    it('has tips for all extension keys', () => {
      const keys: ExtensionKey[] = [
        'ninth',
        'flatNinth',
        'sharpNinth',
        'eleventh',
        'sharpEleventh',
        'thirteenth',
        'flatThirteenth',
      ];
      keys.forEach(key => {
        expect(EXTENSION_TIPS[key]).toBeDefined();
        expect(EXTENSION_TIPS[key].length).toBeGreaterThan(0);
      });
    });
  });

  describe('getExtensionsByGroup', () => {
    it('groups maj7 extensions correctly', () => {
      const grouped = getExtensionsByGroup('maj7');
      expect(grouped['9ths']).toHaveLength(1);
      expect(grouped['11ths']).toHaveLength(1);
      expect(grouped['13ths']).toHaveLength(1);
    });

    it('groups dom7 extensions correctly', () => {
      const grouped = getExtensionsByGroup('dom7');
      expect(grouped['9ths']).toHaveLength(3); // 9, ♭9, ♯9
      expect(grouped['11ths']).toHaveLength(2); // 11, ♯11
      expect(grouped['13ths']).toHaveLength(2); // 13, ♭13
    });

    it('returns empty arrays for missing groups', () => {
      const grouped = getExtensionsByGroup('min7b5');
      expect(grouped['9ths']).toHaveLength(1);
      expect(grouped['11ths']).toHaveLength(1);
      expect(grouped['13ths']).toHaveLength(0); // No 13ths for min7b5
    });
  });

  describe('createEmptyExtensions', () => {
    it('returns empty object', () => {
      const empty = createEmptyExtensions();
      expect(empty).toEqual({});
    });
  });

  describe('getActiveExtensionKeys', () => {
    it('returns empty array when no extensions selected', () => {
      const active = getActiveExtensionKeys({});
      expect(active).toEqual([]);
    });

    it('returns only selected extensions', () => {
      const selected: SelectedExtensions = {
        ninth: true,
        sharpEleventh: true,
        eleventh: false,
      };
      const active = getActiveExtensionKeys(selected);
      expect(active).toHaveLength(2);
      expect(active).toContain('ninth');
      expect(active).toContain('sharpEleventh');
      expect(active).not.toContain('eleventh');
    });
  });

  describe('buildChordSymbol', () => {
    it('builds basic chord symbol with no extensions', () => {
      const symbol = buildChordSymbol('C', 'maj7', {});
      expect(symbol).toBe('Cmaj7');
    });

    it('builds maj9 symbol', () => {
      const symbol = buildChordSymbol('C', 'maj7', { ninth: true });
      expect(symbol).toBe('Cmaj9');
    });

    it('builds maj13(♯11) symbol', () => {
      const symbol = buildChordSymbol('C', 'maj7', {
        ninth: true,
        sharpEleventh: true,
        thirteenth: true,
      });
      expect(symbol).toBe('Cmaj13(♯11)');
    });

    it('builds dom7 with alterations', () => {
      const symbol = buildChordSymbol('G', 'dom7', {
        flatNinth: true,
        sharpEleventh: true,
      });
      expect(symbol).toBe('G11(♯11,♭9)');
    });

    it('builds min9 symbol', () => {
      const symbol = buildChordSymbol('D', 'min7', { ninth: true });
      expect(symbol).toBe('Dm9');
    });

    it('builds min11 symbol', () => {
      const symbol = buildChordSymbol('D', 'min7', {
        ninth: true,
        eleventh: true,
      });
      expect(symbol).toBe('Dm11');
    });

    it('builds min13 symbol', () => {
      const symbol = buildChordSymbol('D', 'min7', {
        ninth: true,
        eleventh: true,
        thirteenth: true,
      });
      expect(symbol).toBe('Dm13');
    });

    it('builds dom13(♭9,♯11) symbol', () => {
      const symbol = buildChordSymbol('G', 'dom7', {
        flatNinth: true,
        sharpEleventh: true,
        thirteenth: true,
      });
      expect(symbol).toBe('G13(♯11,♭9)');
    });

    it('handles half-diminished with extensions', () => {
      const symbol = buildChordSymbol('B', 'min7b5', {
        ninth: true,
        eleventh: true,
      });
      expect(symbol).toBe('Bm7♭5(11)');
    });

    it('handles dim7 with extensions', () => {
      const symbol = buildChordSymbol('B', 'dim7', { ninth: true });
      expect(symbol).toBe('B°7(9)');
    });
  });
});

