/**
 * FlashCard Component
 *
 * Displays a single drill question:
 *   - Chord symbol prompt
 *   - 4 multiple-choice answer buttons
 *   - Immediate feedback on selection
 *   - Piano keyboard highlight after answer
 *   - "Next" button to advance
 */

import React, { useState } from 'react';
import { PianoKeyboard } from '../PianoKeyboard';
import type { ActiveNote } from '../PianoKeyboard';
import { type DrillQuestion, isCorrectAnswer, QUALITY_LABELS } from '../../lib/drillGenerator';
import { CHROMATIC_SCALE } from '../../lib/chordCalculator';
import type { Note } from '../../lib/core';

// ============================================
// TYPES
// ============================================

interface FlashCardProps {
  question: DrillQuestion;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
  nextLabel: string;
}

// ============================================
// HELPERS
// ============================================

/** Map a display note name to a piano Note (with octave) for highlighting */
function toHighlightNote(displayNote: string): Note | null {
  // Convert flat names back to sharp for keyboard lookup
  const FLAT_TO_SHARP: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  };
  const noteName = FLAT_TO_SHARP[displayNote] ?? displayNote;
  if (!CHROMATIC_SCALE.includes(noteName as never)) return null;
  // Place notes in octave 4 for display
  return `${noteName}4` as Note;
}

/** Build ActiveNote list for answer reveal */
function buildActiveNotes(question: DrillQuestion): ActiveNote[] {
  const notes: ActiveNote[] = [];

  if (question.drillType === 'guide-tones') {
    // Parse "X + Y" format
    const parts = question.correctAnswer.split(' + ');
    if (parts[0]) {
      const note = toHighlightNote(parts[0]);
      if (note) notes.push({ note, role: 'third', hand: 'right' });
    }
    if (parts[1]) {
      const note = toHighlightNote(parts[1]);
      if (note) notes.push({ note, role: 'seventh', hand: 'right' });
    }
  } else {
    const note = toHighlightNote(question.correctAnswer);
    if (note) {
      notes.push({
        note,
        role: question.drillType === 'third' ? 'third' : 'seventh',
        hand: 'right',
      });
    }
  }

  return notes;
}

/** Format chord symbol for display */
function formatChordSymbol(rootDisplay: string, quality: string): React.ReactNode {
  const label = QUALITY_LABELS[quality as keyof typeof QUALITY_LABELS] ?? quality;
  return (
    <p className="flashcard__chord">
      {rootDisplay}<sup>{label}</sup>
    </p>
  );
}

/** Prompt text based on drill type */
function promptText(drillType: string): string {
  if (drillType === 'third') return 'What is the 3rd of';
  if (drillType === 'seventh') return 'What is the 7th of';
  return 'Name the guide tones (3rd + 7th) of';
}

// ============================================
// COMPONENT
// ============================================

export function FlashCard({ question, onAnswer, onNext, nextLabel }: FlashCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const correct = selected !== null ? isCorrectAnswer(question, selected) : false;

  function handleSelect(option: string) {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
    onAnswer(isCorrectAnswer(question, option));
  }

  function getOptionClass(option: string): string {
    if (!answered) return 'flashcard__option';
    if (isCorrectAnswer(question, option)) return 'flashcard__option flashcard__option--reveal-correct';
    if (option === selected) return 'flashcard__option flashcard__option--wrong';
    return 'flashcard__option';
  }

  const activeNotes = answered ? buildActiveNotes(question) : [];
  const isGuide = question.drillType === 'guide-tones';

  return (
    <div className="flashcard">
      <div className="flashcard__header">
        <p className="flashcard__prompt">{promptText(question.drillType)}</p>
        {formatChordSymbol(question.rootDisplay, question.quality)}
      </div>

      <div className={`flashcard__options${isGuide ? ' flashcard__options--guide' : ''}`}>
        {question.options.map((option) => (
          <button
            key={option}
            className={getOptionClass(option)}
            onClick={() => handleSelect(option)}
            disabled={answered}
            aria-pressed={option === selected}
          >
            {option}
          </button>
        ))}
      </div>

      {answered && (
        <>
          <div className="flashcard__action-row">
            <span className={`flashcard__feedback-text flashcard__feedback-text--${correct ? 'correct' : 'wrong'}`}>
              {correct ? 'Correct!' : `Answer: ${question.correctAnswer}`}
            </span>
            <button className="flashcard__next-inline" onClick={onNext}>
              {nextLabel}
            </button>
          </div>

          {activeNotes.length > 0 && (
            <div className="flashcard__piano">
              <p className="flashcard__piano-label">Correct answer on keyboard</p>
              <PianoKeyboard
                activeNotes={activeNotes}
                startOctave={3}
                endOctave={5}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
