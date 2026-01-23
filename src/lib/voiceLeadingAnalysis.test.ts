/**
 * Voice Leading Analysis Tests
 */

import {
  analyzeVoiceMotion,
  scoreVoicingSubmission,
  describeMotion,
  type VoiceMotion,
} from './voiceLeadingAnalysis';
import type { Note } from './voicingTemplates';
import type { PlaygroundBlock } from '../components/ChordExplorer/playgroundUtils';

describe('analyzeVoiceMotion', () => {
  it('detects common tones', () => {
    const from: Note[] = ['C4', 'E4', 'G4'];
    const to: Note[] = ['C4', 'E4', 'A4'];

    const analysis = analyzeVoiceMotion(from, to);

    expect(analysis.commonTones).toBe(2);
    expect(analysis.motions.filter(m => m.motionType === 'common-tone')).toHaveLength(2);
  });

  it('detects half-step motion', () => {
    const from: Note[] = ['C4', 'E4'];
    const to: Note[] = ['B3', 'F4'];

    const analysis = analyzeVoiceMotion(from, to);

    expect(analysis.halfSteps).toBe(2);
    expect(analysis.motions.every(m => m.motionType === 'half-step')).toBe(true);
  });

  it('detects whole-step motion', () => {
    const from: Note[] = ['C4'];
    const to: Note[] = ['D4'];

    const analysis = analyzeVoiceMotion(from, to);

    expect(analysis.wholeSteps).toBe(1);
    expect(analysis.motions[0].motionType).toBe('whole-step');
  });

  it('detects small leaps (3-4 semitones)', () => {
    const from: Note[] = ['C4'];
    const to: Note[] = ['E4']; // minor 3rd = 4 semitones

    const analysis = analyzeVoiceMotion(from, to);

    expect(analysis.smallLeaps).toBe(1);
    expect(analysis.motions[0].motionType).toBe('small-leap');
  });

  it('detects large leaps (5+ semitones)', () => {
    const from: Note[] = ['C4'];
    const to: Note[] = ['G4']; // perfect 5th = 7 semitones

    const analysis = analyzeVoiceMotion(from, to);

    expect(analysis.largeLeaps).toBe(1);
    expect(analysis.motions[0].motionType).toBe('large-leap');
  });

  it('calculates smoothness score with bonuses for common tones', () => {
    // Common tones add bonus, but score is clamped to 50 max
    // Compare: one common tone vs two to see the bonus effect
    const fromWith1: Note[] = ['C4', 'E4'];
    const toWith1: Note[] = ['C4', 'F4']; // C4 held, E4 -> F4 half-step

    const fromWith2: Note[] = ['C4', 'E4'];
    const toWith2: Note[] = ['C4', 'E4']; // Both held

    const analysis1 = analyzeVoiceMotion(fromWith1, toWith1);
    const analysis2 = analyzeVoiceMotion(fromWith2, toWith2);

    expect(analysis1.commonTones).toBe(1);
    expect(analysis2.commonTones).toBe(2);
    // Score capped at 50, but perfect voice leading gets max
    expect(analysis2.smoothnessScore).toBe(50);
    expect(analysis2.smoothnessScore).toBeGreaterThanOrEqual(analysis1.smoothnessScore);
  });

  it('applies penalties for large leaps', () => {
    const from: Note[] = ['C4'];
    const to: Note[] = ['C5']; // octave = 12 semitones

    const analysis = analyzeVoiceMotion(from, to);

    expect(analysis.largeLeaps).toBe(1);
    expect(analysis.smoothnessScore).toBe(50 - 10); // -10 per large leap
  });

  it('handles shell voicing ii-V motion (Dm7 to G7)', () => {
    // Dm7 Shell A: F4, C5 (3rd, 7th)
    // G7 Shell B: F4, B4 (7th, 3rd)
    const dm7: Note[] = ['F4', 'C5'];
    const g7: Note[] = ['F4', 'B4'];

    const analysis = analyzeVoiceMotion(dm7, g7);

    expect(analysis.commonTones).toBe(1); // F4 held
    expect(analysis.halfSteps).toBe(1);   // C5 -> B4 half-step
  });

  it('clamps score to 0-50 range', () => {
    // Many large leaps should bottom out at 0
    const from: Note[] = ['C2', 'C3', 'C4', 'C5'];
    const to: Note[] = ['A2', 'A3', 'A4', 'A5'];

    const analysis = analyzeVoiceMotion(from, to);

    expect(analysis.smoothnessScore).toBeGreaterThanOrEqual(0);
    expect(analysis.smoothnessScore).toBeLessThanOrEqual(50);
  });
});

describe('scoreVoicingSubmission', () => {
  const makeBlock = (role: string, note: string): PlaygroundBlock => ({
    id: `block-${role}`,
    label: role.charAt(0).toUpperCase(),
    note: note.replace(/\d/, '') as any,
    voicingRole: role as any,
    cssRole: role,
    enabled: true,
    isExtension: false,
  });

  it('scores a well-constructed voicing highly', () => {
    // Dm7 shell -> G7 shell with good voice leading
    const previousNotes: Note[] = ['F4', 'C5'];
    const currentBlocks: PlaygroundBlock[] = [
      makeBlock('seventh', 'F'),
      makeBlock('third', 'B'),
    ];
    const currentNotes: Note[] = ['F4', 'B4'];

    const score = scoreVoicingSubmission(previousNotes, currentBlocks, currentNotes, 'dom7');

    expect(score.total).toBeGreaterThan(50);
    expect(score.motionScore).toBeGreaterThan(40);
  });

  it('returns pattern bonus for recognized patterns', () => {
    // Shell A pattern: root, third, seventh
    const previousNotes: Note[] = ['C4', 'E4', 'B4'];
    const currentBlocks: PlaygroundBlock[] = [
      makeBlock('root', 'G'),
      makeBlock('third', 'B'),
      makeBlock('seventh', 'F'),
    ];
    const currentNotes: Note[] = ['G3', 'B3', 'F4'];

    const score = scoreVoicingSubmission(previousNotes, currentBlocks, currentNotes, 'dom7');

    expect(score.patternBonus).toBeGreaterThan(0);
  });

  it('includes playability warnings in result', () => {
    // Create a voicing with too many notes
    const previousNotes: Note[] = ['C4'];
    const currentBlocks: PlaygroundBlock[] = [
      makeBlock('root', 'G'),
      makeBlock('third', 'B'),
      makeBlock('fifth', 'D'),
      makeBlock('seventh', 'F'),
      makeBlock('ninth', 'A'),
      makeBlock('eleventh', 'C'),
      makeBlock('thirteenth', 'E'),
    ];
    const currentNotes: Note[] = ['G3', 'B3', 'D4', 'F4', 'A4', 'C5', 'E5'];

    const score = scoreVoicingSubmission(previousNotes, currentBlocks, currentNotes, 'dom7');

    expect(score.warnings.length).toBeGreaterThan(0);
    expect(score.playabilityScore).toBeLessThan(20);
  });

  it('provides complete score breakdown', () => {
    const previousNotes: Note[] = ['C4', 'E4'];
    const currentBlocks: PlaygroundBlock[] = [
      makeBlock('third', 'B'),
      makeBlock('seventh', 'F'),
    ];
    const currentNotes: Note[] = ['B3', 'F4'];

    const score = scoreVoicingSubmission(previousNotes, currentBlocks, currentNotes, 'dom7');

    expect(score).toHaveProperty('total');
    expect(score).toHaveProperty('motionScore');
    expect(score).toHaveProperty('patternBonus');
    expect(score).toHaveProperty('playabilityScore');
    expect(score).toHaveProperty('motionAnalysis');
    expect(score).toHaveProperty('warnings');
    expect(score.total).toBe(score.motionScore + score.patternBonus + score.playabilityScore);
  });
});

describe('describeMotion', () => {
  it('describes common tone', () => {
    const motion: VoiceMotion = {
      fromNote: 'C4',
      toNote: 'C4',
      interval: 0,
      motionType: 'common-tone',
    };

    expect(describeMotion(motion)).toBe('C4 → C4 (held)');
  });

  it('describes half-step down', () => {
    const motion: VoiceMotion = {
      fromNote: 'C4',
      toNote: 'B3',
      interval: -1,
      motionType: 'half-step',
    };

    expect(describeMotion(motion)).toBe('C4 → B3 (half-step down)');
  });

  it('describes half-step up', () => {
    const motion: VoiceMotion = {
      fromNote: 'E4',
      toNote: 'F4',
      interval: 1,
      motionType: 'half-step',
    };

    expect(describeMotion(motion)).toBe('E4 → F4 (half-step up)');
  });

  it('describes large leap', () => {
    const motion: VoiceMotion = {
      fromNote: 'C4',
      toNote: 'G4',
      interval: 7,
      motionType: 'large-leap',
    };

    expect(describeMotion(motion)).toBe('C4 → G4 (large leap up)');
  });
});
