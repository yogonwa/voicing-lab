/**
 * Voicing Analysis Tests
 */

import { analyzeVoicing, checkMinimumBlocks } from './voicingAnalysis';
import type { PlaygroundBlock } from '../components/ChordExplorer/playgroundUtils';
import type { Note } from './voicingTemplates';

describe('voicingAnalysis', () => {
  describe('checkMinimumBlocks', () => {
    it('returns error when less than 2 blocks', () => {
      const warning = checkMinimumBlocks(1);
      expect(warning).not.toBeNull();
      expect(warning?.severity).toBe('error');
      expect(warning?.id).toBe('min-blocks');
    });

    it('returns null when 2 or more blocks', () => {
      expect(checkMinimumBlocks(2)).toBeNull();
      expect(checkMinimumBlocks(5)).toBeNull();
    });
  });

  describe('analyzeVoicing', () => {
    const createBlock = (role: string, enabled = true): PlaygroundBlock => ({
      id: role,
      label: role,
      note: 'C',
      voicingRole: role as any,
      enabled,
      isExtension: false,
      cssRole: role,
    });

    it('detects missing guide tones', () => {
      const blocks = [
        createBlock('root'),
        createBlock('fifth'),
      ];
      const notes: Note[] = ['C3', 'G3'];
      
      const warnings = analyzeVoicing(blocks, notes, 'maj7');
      
      const guideToneWarning = warnings.find(w => w.id === 'missing-guide-tones');
      expect(guideToneWarning).toBeDefined();
      expect(guideToneWarning?.severity).toBe('error');
    });

    it('detects muddy bass', () => {
      const blocks = [
        createBlock('root'),
        createBlock('third'),
      ];
      const notes: Note[] = ['C2', 'D2']; // Close interval in bass
      
      const warnings = analyzeVoicing(blocks, notes, 'maj7');
      
      const muddyWarning = warnings.find(w => w.id === 'muddy-bass');
      expect(muddyWarning).toBeDefined();
      expect(muddyWarning?.severity).toBe('warning');
    });

    it('detects alteration clashes on maj7', () => {
      const blocks = [
        createBlock('root'),
        createBlock('third'),
        createBlock('seventh'),
        createBlock('flatNinth'),
      ];
      const notes: Note[] = ['C3', 'E3', 'B3', 'C#4']; // Use C# instead of Db (sharps-only system)
      
      const warnings = analyzeVoicing(blocks, notes, 'maj7');
      
      const clashWarning = warnings.find(w => w.id === 'alteration-clash-b9-maj7');
      expect(clashWarning).toBeDefined();
      expect(clashWarning?.severity).toBe('error');
    });

    it('warns about natural 11th on major chords', () => {
      const blocks = [
        createBlock('root'),
        createBlock('third'),
        createBlock('seventh'),
        createBlock('eleventh'),
      ];
      const notes: Note[] = ['C3', 'E3', 'B3', 'F4'];
      
      const warnings = analyzeVoicing(blocks, notes, 'maj7');
      
      const eleventhWarning = warnings.find(w => w.id === 'avoid-11-maj7');
      expect(eleventhWarning).toBeDefined();
    });

    it('suggests root not lowest', () => {
      const blocks = [
        createBlock('third'),
        createBlock('root'),
        createBlock('seventh'),
      ];
      const notes: Note[] = ['E3', 'C4', 'B4'];
      
      const warnings = analyzeVoicing(blocks, notes, 'maj7');
      
      const rootWarning = warnings.find(w => w.id === 'root-not-lowest');
      expect(rootWarning).toBeDefined();
      expect(rootWarning?.severity).toBe('suggestion');
    });

    it('detects too many notes', () => {
      const blocks = Array.from({ length: 8 }, (_, i) => createBlock(`note${i}`));
      const notes: Note[] = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'];
      
      const warnings = analyzeVoicing(blocks, notes, 'maj7');
      
      const tooManyWarning = warnings.find(w => w.id === 'too-many-notes');
      expect(tooManyWarning).toBeDefined();
      expect(tooManyWarning?.severity).toBe('warning');
    });

    it('returns no warnings for good voicing', () => {
      const blocks = [
        createBlock('root'),
        createBlock('third'),
        createBlock('seventh'),
        createBlock('ninth'),
      ];
      const notes: Note[] = ['C3', 'E4', 'B4', 'D5'];
      
      const warnings = analyzeVoicing(blocks, notes, 'maj7');
      
      // Should have minimal or no critical warnings
      const errors = warnings.filter(w => w.severity === 'error');
      expect(errors.length).toBe(0);
    });
  });
});

