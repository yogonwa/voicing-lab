import React, { useState } from 'react';
import { PianoKeyboard } from '../PianoKeyboard';
import type { ActiveNote } from '../PianoKeyboard';
import { type DrillQuestion, isCorrectAnswer, QUALITY_LABELS } from '../../lib/drillGenerator';
import { CHROMATIC_SCALE } from '../../lib/chordCalculator';
import { getExtendedChordTones } from '../../lib/core';
import type { NoteName } from '../../lib/chordCalculator';
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

/** Map display root name → internal NoteName (sharps only) */
const DISPLAY_TO_NOTENAME: Record<string, NoteName> = {
  'Bb': 'A#', 'Eb': 'D#', 'Ab': 'G#', 'Db': 'C#', 'Gb': 'F#',
};

function displayToNoteName(display: string): NoteName {
  return (DISPLAY_TO_NOTENAME[display] ?? display) as NoteName;
}

/** Convert a display note name to a piano Note at octave 4 */
function toNote(displayNote: string): Note | null {
  const FLAT_TO_SHARP: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  };
  const noteName = FLAT_TO_SHARP[displayNote] ?? displayNote;
  if (!CHROMATIC_SCALE.includes(noteName as never)) return null;
  return `${noteName}4` as Note;
}

/**
 * Build active notes for keyboard display after answer reveal.
 *
 * Shows all 4 chord tones (R/3/5/7) as 'context' (green).
 * The specifically-asked tone(s) are shown as 'answer' (purple).
 */
function buildActiveNotes(question: DrillQuestion): ActiveNote[] {
  const rootName = displayToNoteName(question.rootDisplay);
  const tones = getExtendedChordTones({ root: rootName, quality: question.quality });

  // Determine which note names are the "answer" (the specifically asked tone)
  const answerNotes = new Set<string>();
  if (question.drillType === 'third') {
    answerNotes.add(tones.third);
  } else if (question.drillType === 'seventh') {
    answerNotes.add(tones.seventh);
  } else {
    // guide-tones: both 3rd and 7th are the answer
    answerNotes.add(tones.third);
    answerNotes.add(tones.seventh);
  }

  const chordNotes = [
    { noteName: tones.root, role: 'root' as const },
    { noteName: tones.third, role: 'third' as const },
    { noteName: tones.fifth, role: 'fifth' as const },
    { noteName: tones.seventh, role: 'seventh' as const },
  ];

  const result: ActiveNote[] = [];
  for (const { noteName, role } of chordNotes) {
    const note = toNote(noteName);
    if (!note) continue;
    result.push({
      note,
      role,
      hand: 'right',
      variant: answerNotes.has(noteName) ? 'answer' : 'context',
    });
  }
  return result;
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
              <p className="flashcard__piano-label">
                Full chord · <span style={{ color: '#68d391' }}>■</span> chord tone ·{' '}
                <span style={{ color: '#b794f4' }}>■</span> answer
              </p>
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
