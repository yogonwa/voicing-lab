import React, { useState, useCallback, useMemo } from 'react';
import './VoiceLeadingTrainer.css';

import { ProgressionDisplay } from './ProgressionDisplay';
import { VoicingBuilder } from './VoicingBuilder';
import { ScoreDisplay } from './ScoreDisplay';
import { KeySelector } from './KeySelector';

import { getExtendedChordTones, parseNote, getVoicingRoleForNoteName } from '../../lib/core';
import type { NoteName, ChordQuality } from '../../lib/chordCalculator';
import type { Note, VoicingRole } from '../../lib/voicingTemplates';
import type { PlaygroundBlock } from '../ChordExplorer/playgroundUtils';

import {
  createTrainerState,
  getProgressionChords,
  getCurrentTargetChord,
  advanceProgression,
  isProgressionComplete,
  getTotalScore,
  type TrainerState,
  type BuiltVoicing,
} from '../../lib/trainerState';

import {
  getStarterVoicing,
} from '../../lib/starterVoicings';

import {
  scoreVoicingSubmission,
  type VoicingScore,
} from '../../lib/voiceLeadingAnalysis';

import {
  loadKeyProgress,
  saveKeyProgress,
  completeKey,
  type KeyProgress,
} from '../../lib/keyProgress';

// ============================================
// TYPES
// ============================================

type TrainerPhase = 'building' | 'scoring' | 'complete';

// ============================================
// HELPERS
// ============================================

const ROLE_LABEL_MAP: Record<VoicingRole, string> = {
  root: 'R', third: '3', fifth: '5', seventh: '7',
  ninth: '9', flatNinth: '♭9', sharpNinth: '♯9',
  eleventh: '11', sharpEleventh: '♯11',
  thirteenth: '13', flatThirteenth: '♭13',
};

const ROLE_CSS_MAP: Record<VoicingRole, string> = {
  root: 'root', third: 'third', fifth: 'fifth', seventh: 'seventh',
  ninth: 'ninth', flatNinth: 'flat-ninth', sharpNinth: 'sharp-ninth',
  eleventh: 'eleventh', sharpEleventh: 'sharp-eleventh',
  thirteenth: 'thirteenth', flatThirteenth: 'flat-thirteenth',
};

function isExtensionRole(role: VoicingRole): boolean {
  return ['ninth','flatNinth','sharpNinth','eleventh','sharpEleventh','thirteenth','flatThirteenth'].includes(role);
}

/**
 * Build PlaygroundBlocks from actual clicked notes.
 * Role is inferred by matching note name against chord tones.
 * Out-of-chord notes fall back to 'root' role.
 */
function createBlocksFromNotes(
  notes: Note[],
  root: NoteName,
  quality: ChordQuality
): PlaygroundBlock[] {
  const chordTones = getExtendedChordTones({ root, quality });
  return notes.map(note => {
    const { name } = parseNote(note);
    const role = getVoicingRoleForNoteName(chordTones, name as NoteName) ?? 'root';
    return {
      id: `trainer-${note}`,
      label: ROLE_LABEL_MAP[role],
      note: name as NoteName,
      voicingRole: role,
      cssRole: ROLE_CSS_MAP[role] ?? 'root',
      enabled: true,
      isExtension: isExtensionRole(role),
    };
  });
}

/**
 * All chord tone notes across the keyboard range.
 * Used to highlight available keys.
 */
function computeAvailableNotes(
  root: NoteName,
  quality: ChordQuality,
  startOctave: number,
  endOctave: number
): Note[] {
  const tones = getExtendedChordTones({ root, quality });
  const noteNames = [tones.root, tones.third, tones.fifth, tones.seventh];
  const available: Note[] = [];
  for (let oct = startOctave; oct <= endOctave; oct++) {
    for (const name of noteNames) {
      available.push(`${name}${oct}` as Note);
    }
  }
  return available;
}

// ============================================
// COMPONENT
// ============================================

export default function VoiceLeadingTrainer() {
  const [keyProgress, setKeyProgress] = useState<KeyProgress>(() => loadKeyProgress());

  const [trainerState, setTrainerState] = useState<TrainerState>(() => {
    const state = createTrainerState('C');
    const starterVoicing = getStarterVoicing('C');
    return {
      ...state,
      builtVoicings: { ...state.builtVoicings, ii: starterVoicing },
      progressionIndex: 1,
    };
  });

  const [phase, setPhase] = useState<TrainerPhase>('building');
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [lastScore, setLastScore] = useState<VoicingScore | null>(null);
  const [showKeySelector, setShowKeySelector] = useState(false);

  const chords = useMemo(
    () => getProgressionChords(trainerState.currentKey),
    [trainerState.currentKey]
  );

  const currentChord = getCurrentTargetChord(trainerState);

  const availableNotes = useMemo(
    () => computeAvailableNotes(currentChord.root, currentChord.quality as ChordQuality, 3, 5),
    [currentChord.root, currentChord.quality]
  );

  const previousNotes = useMemo(() => {
    if (trainerState.progressionIndex === 1) return trainerState.builtVoicings.ii?.notes ?? [];
    if (trainerState.progressionIndex === 2) return trainerState.builtVoicings.V?.notes ?? [];
    return [];
  }, [trainerState.progressionIndex, trainerState.builtVoicings]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleKeyClick = useCallback((note: Note) => {
    setSelectedNotes(prev =>
      prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note]
    );
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedNotes.length < 2) return;

    const blocks = createBlocksFromNotes(
      selectedNotes,
      currentChord.root,
      currentChord.quality as ChordQuality
    );

    const score = scoreVoicingSubmission(
      previousNotes,
      blocks,
      selectedNotes,
      currentChord.quality
    );

    setLastScore(score);
    setPhase('scoring');
  }, [selectedNotes, currentChord, previousNotes]);

  const handleContinue = useCallback(() => {
    if (!lastScore) return;

    const voicing: BuiltVoicing = {
      blocks: createBlocksFromNotes(
        selectedNotes,
        currentChord.root,
        currentChord.quality as ChordQuality
      ),
      notes: selectedNotes,
    };

    const newState = advanceProgression(trainerState, voicing, lastScore);
    setTrainerState(newState);

    if (isProgressionComplete(newState)) {
      setPhase('complete');
      const totalScore = getTotalScore(newState);
      const newProgress = completeKey(trainerState.currentKey, totalScore, keyProgress);
      setKeyProgress(newProgress);
      saveKeyProgress(newProgress);
    } else {
      setPhase('building');
      setSelectedNotes([]);
      setLastScore(null);
    }
  }, [lastScore, selectedNotes, currentChord, trainerState, keyProgress]);

  const handleKeySelect = useCallback((key: NoteName) => {
    const state = createTrainerState(key);
    const starterVoicing = getStarterVoicing(key);
    setTrainerState({
      ...state,
      builtVoicings: { ...state.builtVoicings, ii: starterVoicing },
      progressionIndex: 1,
    });
    setPhase('building');
    setSelectedNotes([]);
    setLastScore(null);
    setShowKeySelector(false);
  }, []);

  const handleRestart = useCallback(() => {
    handleKeySelect(trainerState.currentKey);
  }, [trainerState.currentKey, handleKeySelect]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="voice-leading-trainer">
      <div className="trainer-header">
        <h2>Voice Leading Trainer</h2>
        <div className="trainer-header__controls">
          <button
            className="trainer-header__key-btn"
            onClick={() => setShowKeySelector(!showKeySelector)}
          >
            Key: {trainerState.currentKey}
          </button>
        </div>
      </div>

      {showKeySelector && (
        <KeySelector
          currentKey={trainerState.currentKey}
          progress={keyProgress}
          onKeySelect={handleKeySelect}
        />
      )}

      <ProgressionDisplay
        chords={chords}
        currentIndex={trainerState.progressionIndex}
        builtVoicings={trainerState.builtVoicings}
      />

      {phase === 'building' && (
        <VoicingBuilder
          selectedNotes={selectedNotes}
          ghostNotes={previousNotes}
          availableNotes={availableNotes}
          chordRoot={currentChord.root}
          chordQuality={currentChord.quality as ChordQuality}
          chordSymbol={currentChord.symbol}
          onKeyClick={handleKeyClick}
          onSubmit={handleSubmit}
          canSubmit={selectedNotes.length >= 2}
        />
      )}

      {phase === 'scoring' && lastScore && (
        <ScoreDisplay score={lastScore} onContinue={handleContinue} />
      )}

      {phase === 'complete' && (
        <div className="trainer-complete">
          <h3>Progression Complete!</h3>
          <p className="trainer-complete__score">
            Total Score: {getTotalScore(trainerState)}/300
          </p>
          <div className="trainer-complete__actions">
            <button onClick={handleRestart}>Try Again</button>
            <button onClick={() => setShowKeySelector(true)}>Choose Another Key</button>
          </div>
        </div>
      )}
    </div>
  );
}
