/**
 * VoiceLeadingTrainer Component
 *
 * Main container for the Voice Leading Trainer mode.
 * Manages trainer state, orchestrates progression flow, and coordinates
 * between the note palette, voicing builder, and score display.
 */

import React, { useState, useCallback, useMemo } from 'react';
import './VoiceLeadingTrainer.css';

import { ProgressionDisplay } from './ProgressionDisplay';
import { NotePalette } from './NotePalette';
import { VoicingBuilder } from './VoicingBuilder';
import { ScoreDisplay } from './ScoreDisplay';
import { KeySelector } from './KeySelector';

import type { NoteName } from '../../lib/chordCalculator';
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
  getChordToneHints,
  getExtensionHints,
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

import { getExtendedChordTones } from '../../lib/chordCalculator';

// ============================================
// TYPES
// ============================================

type TrainerPhase = 'building' | 'scoring' | 'complete';

// ============================================
// HELPERS
// ============================================

/**
 * Calculate notes for selected roles based on chord tones.
 */
function calculateNotes(
  selectedRoles: VoicingRole[],
  root: NoteName,
  quality: 'min7' | 'dom7' | 'maj7'
): Note[] {
  const tones = getExtendedChordTones({ root, quality });

  return selectedRoles.map(role => {
    let noteName: NoteName;

    switch (role) {
      case 'root': noteName = tones.root; break;
      case 'third': noteName = tones.third; break;
      case 'fifth': noteName = tones.fifth; break;
      case 'seventh': noteName = tones.seventh; break;
      case 'ninth': noteName = tones.extensions.ninth; break;
      case 'eleventh': noteName = tones.extensions.eleventh; break;
      case 'thirteenth': noteName = tones.extensions.thirteenth; break;
      default: noteName = tones.root;
    }

    // Assign octaves based on role (simple heuristic)
    // Lower notes get lower octaves
    const octave = role === 'root' ? 3 : role === 'thirteenth' ? 5 : 4;
    return `${noteName}${octave}` as Note;
  });
}

/**
 * CSS class mapping for voicing roles.
 */
const ROLE_CSS_MAP: Record<VoicingRole, string> = {
  root: 'root',
  third: 'third',
  fifth: 'fifth',
  seventh: 'seventh',
  ninth: 'ninth',
  flatNinth: 'flat-ninth',
  sharpNinth: 'sharp-ninth',
  eleventh: 'eleventh',
  sharpEleventh: 'sharp-eleventh',
  thirteenth: 'thirteenth',
  flatThirteenth: 'flat-thirteenth',
};

/**
 * Label mapping for voicing roles.
 */
const ROLE_LABEL_MAP: Record<VoicingRole, string> = {
  root: 'R',
  third: '3',
  fifth: '5',
  seventh: '7',
  ninth: '9',
  flatNinth: '♭9',
  sharpNinth: '♯9',
  eleventh: '11',
  sharpEleventh: '♯11',
  thirteenth: '13',
  flatThirteenth: '♭13',
};

/**
 * Check if a role is an extension.
 */
function isExtensionRole(role: VoicingRole): boolean {
  return ['ninth', 'flatNinth', 'sharpNinth', 'eleventh', 'sharpEleventh', 'thirteenth', 'flatThirteenth'].includes(role);
}

/**
 * Create playground blocks from selected roles.
 */
function createBlocks(
  selectedRoles: VoicingRole[],
  root: NoteName,
  quality: 'min7' | 'dom7' | 'maj7'
): PlaygroundBlock[] {
  const tones = getExtendedChordTones({ root, quality });

  return selectedRoles.map(role => {
    let noteName: NoteName;
    switch (role) {
      case 'root': noteName = tones.root; break;
      case 'third': noteName = tones.third; break;
      case 'fifth': noteName = tones.fifth; break;
      case 'seventh': noteName = tones.seventh; break;
      case 'ninth': noteName = tones.extensions.ninth; break;
      case 'eleventh': noteName = tones.extensions.eleventh; break;
      case 'thirteenth': noteName = tones.extensions.thirteenth; break;
      default: noteName = tones.root;
    }

    return {
      id: `trainer-${role}`,
      label: ROLE_LABEL_MAP[role],
      note: noteName,
      voicingRole: role,
      cssRole: ROLE_CSS_MAP[role],
      enabled: true,
      isExtension: isExtensionRole(role),
    };
  });
}

// ============================================
// COMPONENT
// ============================================

export default function VoiceLeadingTrainer() {
  // Key progress (persisted)
  const [keyProgress, setKeyProgress] = useState<KeyProgress>(() => loadKeyProgress());

  // Trainer state
  const [trainerState, setTrainerState] = useState<TrainerState>(() => {
    const state = createTrainerState('C');
    // Lock the ii chord with starter voicing
    const starterVoicing = getStarterVoicing('C');
    return {
      ...state,
      builtVoicings: {
        ...state.builtVoicings,
        ii: starterVoicing,
      },
      progressionIndex: 1, // Start at V chord (ii is locked)
    };
  });

  // Current phase
  const [phase, setPhase] = useState<TrainerPhase>('building');

  // Selected notes for current voicing
  const [selectedRoles, setSelectedRoles] = useState<VoicingRole[]>([]);

  // Last score (for display)
  const [lastScore, setLastScore] = useState<VoicingScore | null>(null);

  // Show key selector
  const [showKeySelector, setShowKeySelector] = useState(false);

  // Derived data
  const chords = useMemo(
    () => getProgressionChords(trainerState.currentKey),
    [trainerState.currentKey]
  );

  const currentChord = getCurrentTargetChord(trainerState);

  const chordTones = useMemo(
    () => getChordToneHints(currentChord.root, currentChord.quality),
    [currentChord.root, currentChord.quality]
  );

  const extensions = useMemo(
    () => getExtensionHints(currentChord.root, currentChord.quality),
    [currentChord.root, currentChord.quality]
  );

  // Calculate current notes from selected roles
  const currentNotes = useMemo(
    () => calculateNotes(selectedRoles, currentChord.root, currentChord.quality as 'min7' | 'dom7' | 'maj7'),
    [selectedRoles, currentChord.root, currentChord.quality]
  );

  // Get previous voicing notes for voice leading reference
  const previousNotes = useMemo(() => {
    if (trainerState.progressionIndex === 1) {
      return trainerState.builtVoicings.ii?.notes || [];
    } else if (trainerState.progressionIndex === 2) {
      return trainerState.builtVoicings.V?.notes || [];
    }
    return [];
  }, [trainerState.progressionIndex, trainerState.builtVoicings]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleNoteToggle = useCallback((role: VoicingRole) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      }
      return [...prev, role];
    });
  }, []);

  const handleRemoveNote = useCallback((role: VoicingRole) => {
    setSelectedRoles(prev => prev.filter(r => r !== role));
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedRoles.length < 2) return;

    // Create blocks for pattern detection
    const blocks = createBlocks(
      selectedRoles,
      currentChord.root,
      currentChord.quality as 'min7' | 'dom7' | 'maj7'
    );

    // Score the submission
    const score = scoreVoicingSubmission(
      previousNotes,
      blocks,
      currentNotes,
      currentChord.quality
    );

    setLastScore(score);
    setPhase('scoring');
  }, [selectedRoles, currentChord, previousNotes, currentNotes]);

  const handleContinue = useCallback(() => {
    if (!lastScore) return;

    // Create built voicing
    const voicing: BuiltVoicing = {
      blocks: createBlocks(
        selectedRoles,
        currentChord.root,
        currentChord.quality as 'min7' | 'dom7' | 'maj7'
      ),
      notes: currentNotes,
    };

    // Advance the progression
    const newState = advanceProgression(trainerState, voicing, lastScore);
    setTrainerState(newState);

    // Check if progression is complete
    if (isProgressionComplete(newState)) {
      setPhase('complete');

      // Update key progress
      const totalScore = getTotalScore(newState);
      const newProgress = completeKey(trainerState.currentKey, totalScore, keyProgress);
      setKeyProgress(newProgress);
      saveKeyProgress(newProgress);
    } else {
      // Move to next chord
      setPhase('building');
      setSelectedRoles([]);
      setLastScore(null);
    }
  }, [lastScore, selectedRoles, currentChord, currentNotes, trainerState, keyProgress]);

  const handleKeySelect = useCallback((key: NoteName) => {
    // Reset trainer state for new key
    const state = createTrainerState(key);
    const starterVoicing = getStarterVoicing(key);

    setTrainerState({
      ...state,
      builtVoicings: {
        ...state.builtVoicings,
        ii: starterVoicing,
      },
      progressionIndex: 1,
    });

    setPhase('building');
    setSelectedRoles([]);
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
        <>
          <VoicingBuilder
            selectedRoles={selectedRoles}
            notes={currentNotes}
            previousNotes={previousNotes}
            chordSymbol={currentChord.symbol}
            onRemoveNote={handleRemoveNote}
            onSubmit={handleSubmit}
            canSubmit={selectedRoles.length >= 2}
          />

          <NotePalette
            chordTones={chordTones}
            extensions={extensions}
            selectedNotes={selectedRoles}
            onNoteToggle={handleNoteToggle}
          />
        </>
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
            <button onClick={() => setShowKeySelector(true)}>
              Choose Another Key
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
