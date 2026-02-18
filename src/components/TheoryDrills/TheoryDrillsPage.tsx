/**
 * TheoryDrillsPage
 *
 * Main page for the Theory Drills feature.
 * Manages:
 *   - Session state machine: settings → drilling → summary
 *   - Drill queue: due cards first, then new cards (up to 15/session)
 *   - SM-2 persistence via spacedRepetition.ts
 *   - Interleaving: mixes keys/qualities in queue
 */

import React, { useState, useCallback } from 'react';
import './TheoryDrills.css';

import {
  generateQuestion,
  type DrillQuestion,
  type DisplayRootName,
  CIRCLE_OF_FIFTHS_ROOTS,
} from '../../lib/drillGenerator';
import {
  getOrCreateCard,
  updateCardState,
  loadAllCards,
  saveCard,
  getDueCards,
  type CardState,
  type DrillType,
} from '../../lib/spacedRepetition';
import type { ChordQuality } from '../../lib/chordCalculator';

import { DrillSettings, type DrillConfig } from './DrillSettings';
import { FlashCard } from './FlashCard';
import { SessionSummary } from './SessionSummary';

// ============================================
// CONSTANTS
// ============================================

const MAX_NEW_CARDS_PER_SESSION = 15;

type PageState = 'settings' | 'drilling' | 'summary';

interface SessionStats {
  totalCards: number;
  correctCount: number;
  wrongCount: number;
  newCards: number;
  reviewCards: number;
  leeches: CardState[];
}

// ============================================
// QUEUE BUILDING
// ============================================

/**
 * Shuffle an array in place using Fisher-Yates.
 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build session queue.
 *
 * Priority:
 *  1. Due cards (overdue first) — all of them
 *  2. New cards — up to MAX_NEW_CARDS_PER_SESSION, interleaved (not grouped by key)
 *
 * Interleaving: new cards are drawn in circle-of-fifths order but
 * quality/drillType alternates to prevent clustering.
 */
function buildSessionQueue(
  config: DrillConfig,
): { queue: DrillQuestion[]; newCardIds: Set<string> } {
  const allStoredCards = loadAllCards();
  const dueCardStates = getDueCards(allStoredCards);

  // Identify IDs of due cards that match current config
  const configCardIds = new Set<string>();
  for (const root of config.roots) {
    for (const quality of config.qualities) {
      for (const drillType of config.drillTypes) {
        configCardIds.add(`${root}${quality}-${drillType}`);
      }
    }
  }

  // Due cards filtered to current config
  const dueIds = new Set(
    dueCardStates
      .filter((c) => configCardIds.has(c.id))
      .map((c) => c.id),
  );

  // New card IDs (never seen before in current config)
  const newIds: string[] = [];
  for (const root of CIRCLE_OF_FIFTHS_ROOTS) {
    if (!config.roots.includes(root)) continue;
    for (const quality of config.qualities) {
      for (const drillType of config.drillTypes) {
        const id = `${root}${quality}-${drillType}`;
        if (!allStoredCards[id] && !dueIds.has(id)) {
          newIds.push(id);
        }
      }
    }
  }

  // Shuffle due cards, take up to 15 new cards
  const dueQuestions = shuffle(
    Array.from(dueIds).map((id) => {
      const card = allStoredCards[id];
      return generateQuestion(
        extractRoot(id),
        extractQuality(id),
        card.drillType,
      );
    }),
  );

  const newCardIds = new Set<string>();
  const newQuestions: DrillQuestion[] = [];
  for (const id of newIds) {
    if (newQuestions.length >= MAX_NEW_CARDS_PER_SESSION) break;
    const root = extractRoot(id);
    const quality = extractQuality(id);
    const drillType = extractDrillType(id);
    if (!root || !quality || !drillType) continue;
    newCardIds.add(id);
    newQuestions.push(generateQuestion(root, quality, drillType));
  }

  // Interleave: due first, then new
  const queue = [...dueQuestions, ...newQuestions];

  return { queue, newCardIds };
}

/** Extract display root from card id like "Cmaj7-third" or "Bbmin7-guide-tones" */
function extractRoot(id: string): DisplayRootName {
  // Roots can be: C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B, F#, C#, G#, D#, A#
  const match = id.match(/^([A-G][#b]?)/);
  return match ? match[1] : 'C';
}

/** Extract quality from card id */
function extractQuality(id: string): ChordQuality {
  const qualityMap: Record<string, ChordQuality> = {
    'maj7': 'maj7', 'min7': 'min7', 'dom7': 'dom7', 'min7b5': 'min7b5', 'dim7': 'dim7',
  };
  for (const q of Object.keys(qualityMap)) {
    if (id.includes(q)) return qualityMap[q];
  }
  return 'maj7';
}

/** Extract drill type from card id */
function extractDrillType(id: string): DrillType {
  if (id.endsWith('-guide-tones')) return 'guide-tones';
  if (id.endsWith('-seventh')) return 'seventh';
  return 'third';
}

// ============================================
// DEFAULT CONFIG
// ============================================

const DEFAULT_CONFIG: DrillConfig = {
  drillTypes: ['third', 'seventh'],
  qualities: ['maj7', 'min7', 'dom7'],
  roots: ['C', 'G', 'D', 'F', 'Bb'],
};

// ============================================
// COMPONENT
// ============================================

export function TheoryDrillsPage() {
  const [pageState, setPageState] = useState<PageState>('settings');
  const [config, setConfig] = useState<DrillConfig>(DEFAULT_CONFIG);

  // Session state
  const [queue, setQueue] = useState<DrillQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newCardIds, setNewCardIds] = useState<Set<string>>(new Set());
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [stats, setStats] = useState<SessionStats>({
    totalCards: 0,
    correctCount: 0,
    wrongCount: 0,
    newCards: 0,
    reviewCards: 0,
    leeches: [],
  });

  // ============================================
  // SESSION CONTROL
  // ============================================

  function startSession() {
    const { queue: q, newCardIds: newIds } = buildSessionQueue(config);
    if (q.length === 0) {
      // Nothing due and no new cards — show summary immediately
      setStats({
        totalCards: 0,
        correctCount: 0,
        wrongCount: 0,
        newCards: 0,
        reviewCards: 0,
        leeches: [],
      });
      setPageState('summary');
      return;
    }
    setQueue(q);
    setNewCardIds(newIds);
    setCurrentIndex(0);
    setWaitingForNext(false);
    setStats({
      totalCards: q.length,
      correctCount: 0,
      wrongCount: 0,
      newCards: newIds.size,
      reviewCards: q.length - newIds.size,
      leeches: [],
    });
    setPageState('drilling');
  }

  const handleAnswer = useCallback((correct: boolean) => {
    const question = queue[currentIndex];
    if (!question) return;

    // Get or create card state
    const root = question.rootDisplay;
    const card = getOrCreateCard(question.id, question.drillType, root);

    // Update with SM-2 (binary: correct=4, wrong=0 for MVP)
    const q = correct ? (4 as const) : (0 as const);
    const updated = updateCardState(card, q);
    saveCard(updated);

    // Update session stats
    setStats((prev) => {
      const newLeeches = updated.isLeech && !prev.leeches.find((l) => l.id === updated.id)
        ? [...prev.leeches, updated]
        : prev.leeches;
      return {
        ...prev,
        correctCount: prev.correctCount + (correct ? 1 : 0),
        wrongCount: prev.wrongCount + (correct ? 0 : 1),
        leeches: newLeeches,
      };
    });

    setWaitingForNext(true);
  }, [queue, currentIndex]);

  function handleNext() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      setPageState('summary');
    } else {
      setCurrentIndex(nextIndex);
      setWaitingForNext(false);
    }
  }

  // ============================================
  // RENDER
  // ============================================

  const currentQuestion = queue[currentIndex];
  const progress = queue.length > 0 ? (currentIndex / queue.length) * 100 : 0;

  return (
    <div className="theory-drills">
      {pageState === 'settings' && (
        <>
          <h2 style={{ textAlign: 'center', color: '#1a1a2e', marginBottom: 24 }}>
            Theory Drills
          </h2>
          <p style={{ textAlign: 'center', color: '#718096', marginBottom: 24 }}>
            Build reflexive guide-tone recall. Given a chord, name the 3rd and 7th instantly.
          </p>
          <DrillSettings config={config} onChange={setConfig} onStart={startSession} />
        </>
      )}

      {pageState === 'drilling' && currentQuestion && (
        <>
          <div className="drill-progress">
            <div className="drill-progress__bar-wrap">
              <div className="drill-progress__bar" style={{ width: `${progress}%` }} />
            </div>
            <span className="drill-progress__label">
              {currentIndex + 1} / {queue.length}
              {newCardIds.size > 0 && ` · ${newCardIds.size} new`}
            </span>
          </div>

          <FlashCard
            key={currentQuestion.id + currentIndex}
            question={currentQuestion}
            onAnswer={handleAnswer}
          />

          {waitingForNext && (
            <button className="flashcard__next" onClick={handleNext}>
              {currentIndex + 1 < queue.length ? 'Next Card' : 'See Results'}
            </button>
          )}
        </>
      )}

      {pageState === 'summary' && (
        <SessionSummary
          result={stats}
          onNewSession={startSession}
          onSettings={() => setPageState('settings')}
        />
      )}
    </div>
  );
}
