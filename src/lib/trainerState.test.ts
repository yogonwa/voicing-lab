/**
 * Trainer State Tests
 */

import {
  createTrainerState,
  getProgressionChords,
  getCurrentTargetChord,
  getPreviousChord,
  isProgressionComplete,
  advanceProgression,
  getPositionFromIndex,
  getTotalScore,
} from './trainerState';
import type { VoicingScore } from './voiceLeadingAnalysis';

describe('createTrainerState', () => {
  it('creates initial state with given key', () => {
    const state = createTrainerState('C');

    expect(state.currentKey).toBe('C');
    expect(state.progressionIndex).toBe(0);
    expect(state.builtVoicings.ii).toBeNull();
    expect(state.builtVoicings.V).toBeNull();
    expect(state.builtVoicings.I).toBeNull();
  });

  it('works with different keys', () => {
    const stateG = createTrainerState('G');
    const stateF = createTrainerState('F');

    expect(stateG.currentKey).toBe('G');
    expect(stateF.currentKey).toBe('F');
  });
});

describe('getProgressionChords', () => {
  it('returns ii-V-I for key of C', () => {
    const chords = getProgressionChords('C');

    expect(chords).toHaveLength(3);
    expect(chords[0]).toEqual({
      root: 'D',
      quality: 'min7',
      symbol: 'Dm7',
      function: 'ii',
    });
    expect(chords[1]).toEqual({
      root: 'G',
      quality: 'dom7',
      symbol: 'G7',
      function: 'V',
    });
    expect(chords[2]).toEqual({
      root: 'C',
      quality: 'maj7',
      symbol: 'Cmaj7',
      function: 'I',
    });
  });

  it('returns correct ii-V-I for key of G', () => {
    const chords = getProgressionChords('G');

    expect(chords[0].root).toBe('A');
    expect(chords[0].symbol).toBe('Am7');
    expect(chords[1].root).toBe('D');
    expect(chords[1].symbol).toBe('D7');
    expect(chords[2].root).toBe('G');
    expect(chords[2].symbol).toBe('Gmaj7');
  });

  it('returns correct ii-V-I for key of F', () => {
    const chords = getProgressionChords('F');

    expect(chords[0].root).toBe('G');
    expect(chords[0].symbol).toBe('Gm7');
    expect(chords[1].root).toBe('C');
    expect(chords[1].symbol).toBe('C7');
    expect(chords[2].root).toBe('F');
    expect(chords[2].symbol).toBe('Fmaj7');
  });
});

describe('getCurrentTargetChord', () => {
  it('returns ii chord at index 0', () => {
    const state = createTrainerState('C');
    const chord = getCurrentTargetChord(state);

    expect(chord.function).toBe('ii');
    expect(chord.symbol).toBe('Dm7');
  });

  it('returns V chord at index 1', () => {
    const state = { ...createTrainerState('C'), progressionIndex: 1 as const };
    const chord = getCurrentTargetChord(state);

    expect(chord.function).toBe('V');
    expect(chord.symbol).toBe('G7');
  });

  it('returns I chord at index 2', () => {
    const state = { ...createTrainerState('C'), progressionIndex: 2 as const };
    const chord = getCurrentTargetChord(state);

    expect(chord.function).toBe('I');
    expect(chord.symbol).toBe('Cmaj7');
  });
});

describe('getPreviousChord', () => {
  it('returns null at index 0', () => {
    const state = createTrainerState('C');
    expect(getPreviousChord(state)).toBeNull();
  });

  it('returns ii chord when at index 1', () => {
    const state = { ...createTrainerState('C'), progressionIndex: 1 as const };
    const prev = getPreviousChord(state);

    expect(prev).not.toBeNull();
    expect(prev!.function).toBe('ii');
  });

  it('returns V chord when at index 2', () => {
    const state = { ...createTrainerState('C'), progressionIndex: 2 as const };
    const prev = getPreviousChord(state);

    expect(prev).not.toBeNull();
    expect(prev!.function).toBe('V');
  });
});

describe('getPositionFromIndex', () => {
  it('maps indices to positions', () => {
    expect(getPositionFromIndex(0)).toBe('ii');
    expect(getPositionFromIndex(1)).toBe('V');
    expect(getPositionFromIndex(2)).toBe('I');
  });
});

describe('isProgressionComplete', () => {
  it('returns false when no voicings built', () => {
    const state = createTrainerState('C');
    expect(isProgressionComplete(state)).toBe(false);
  });

  it('returns false when partially complete', () => {
    const state = createTrainerState('C');
    state.builtVoicings.ii = { blocks: [], notes: [] };
    state.builtVoicings.V = { blocks: [], notes: [] };

    expect(isProgressionComplete(state)).toBe(false);
  });

  it('returns true when all voicings built', () => {
    const state = createTrainerState('C');
    state.builtVoicings.ii = { blocks: [], notes: [] };
    state.builtVoicings.V = { blocks: [], notes: [] };
    state.builtVoicings.I = { blocks: [], notes: [] };

    expect(isProgressionComplete(state)).toBe(true);
  });
});

describe('advanceProgression', () => {
  const mockVoicing = { blocks: [], notes: ['C4'] as any };
  const mockScore: VoicingScore = {
    total: 75,
    motionScore: 45,
    patternBonus: 20,
    playabilityScore: 10,
    motionAnalysis: {
      motions: [],
      commonTones: 0,
      halfSteps: 0,
      wholeSteps: 0,
      smallLeaps: 0,
      largeLeaps: 0,
      smoothnessScore: 45,
    },
    patternName: 'Shell A',
    warnings: [],
  };

  it('stores voicing and score for current position', () => {
    const state = createTrainerState('C');
    const newState = advanceProgression(state, mockVoicing, mockScore);

    expect(newState.builtVoicings.ii).toBe(mockVoicing);
    expect(newState.scores.ii).toBe(mockScore);
  });

  it('advances progression index', () => {
    const state = createTrainerState('C');
    const newState = advanceProgression(state, mockVoicing, mockScore);

    expect(newState.progressionIndex).toBe(1);
  });

  it('does not advance past index 2', () => {
    const state = { ...createTrainerState('C'), progressionIndex: 2 as const };
    const newState = advanceProgression(state, mockVoicing, mockScore);

    expect(newState.progressionIndex).toBe(2);
    expect(newState.builtVoicings.I).toBe(mockVoicing);
  });
});

describe('getTotalScore', () => {
  it('returns 0 when no scores', () => {
    const state = createTrainerState('C');
    expect(getTotalScore(state)).toBe(0);
  });

  it('sums all scores', () => {
    const state = createTrainerState('C');
    state.scores.ii = { total: 70 } as VoicingScore;
    state.scores.V = { total: 80 } as VoicingScore;
    state.scores.I = { total: 75 } as VoicingScore;

    expect(getTotalScore(state)).toBe(225);
  });
});
