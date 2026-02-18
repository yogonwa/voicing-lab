/**
 * Spaced Repetition — SM-2 Algorithm
 *
 * Implements SM-2 for scheduling theory drill flashcards.
 * Card state is persisted to localStorage.
 *
 * Quality score (q):
 *   0 = wrong answer
 *   3 = correct but hesitant
 *   4 = correct and fast (MVP default for "correct")
 */

// ============================================
// TYPES
// ============================================

export type DrillType = 'third' | 'seventh' | 'guide-tones';

export interface CardState {
  id: string;           // e.g., "Cmaj7-third"
  drillType: DrillType;
  easeFactor: number;   // starts at 2.5 (or 2.0 for sweaty keys); min floor 1.3
  interval: number;     // days until next review
  repetitions: number;  // consecutive correct reviews
  nextDue: string;      // ISO date string (YYYY-MM-DD)
  correctCount: number;
  wrongCount: number;
  lapseCount: number;   // leech detection trigger at 4
  isLeech: boolean;     // flagged after 4 lapses
  lastAnswered: string; // ISO date string
}

// ============================================
// CONSTANTS
// ============================================

/** Keys that are harder to recall (sharper or flatter) — start with lower ease factor */
const SWEATY_ROOTS = new Set(['B', 'F#', 'Gb', 'C#', 'Db', 'G#', 'Ab', 'D#', 'Eb']);

const DEFAULT_EASE_FACTOR = 2.5;
const SWEATY_EASE_FACTOR = 2.0;
const MIN_EASE_FACTOR = 1.3;
const LEECH_THRESHOLD = 4;

// ============================================
// CARD CREATION
// ============================================

export function getInitialEaseFactor(root: string): number {
  return SWEATY_ROOTS.has(root) ? SWEATY_EASE_FACTOR : DEFAULT_EASE_FACTOR;
}

export function createCardState(
  id: string,
  drillType: DrillType,
  root: string,
): CardState {
  const today = getTodayISO();
  return {
    id,
    drillType,
    easeFactor: getInitialEaseFactor(root),
    interval: 0,
    repetitions: 0,
    nextDue: today,
    correctCount: 0,
    wrongCount: 0,
    lapseCount: 0,
    isLeech: false,
    lastAnswered: today,
  };
}

// ============================================
// SM-2 UPDATE
// ============================================

/**
 * Update a card after an answer using SM-2.
 *
 * @param card - Current card state
 * @param q - Quality score: 0 (wrong), 3 (hesitant), 4 (fast+correct)
 */
export function updateCardState(card: CardState, q: 0 | 3 | 4): CardState {
  const today = getTodayISO();

  if (q >= 3) {
    // Correct answer
    let newInterval: number;
    if (card.repetitions === 0) {
      newInterval = 1;
    } else if (card.repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(card.interval * card.easeFactor);
    }

    const newEaseFactor = Math.max(
      MIN_EASE_FACTOR,
      card.easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02),
    );

    return {
      ...card,
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: card.repetitions + 1,
      nextDue: addDaysToToday(newInterval),
      correctCount: card.correctCount + 1,
      lastAnswered: today,
    };
  } else {
    // Wrong answer
    const newEaseFactor = Math.max(MIN_EASE_FACTOR, card.easeFactor - 0.20);
    const newLapseCount = card.lapseCount + 1;

    return {
      ...card,
      easeFactor: newEaseFactor,
      interval: 1,
      repetitions: 0,
      nextDue: addDaysToToday(1),
      wrongCount: card.wrongCount + 1,
      lapseCount: newLapseCount,
      isLeech: newLapseCount >= LEECH_THRESHOLD,
      lastAnswered: today,
    };
  }
}

// ============================================
// DATE HELPERS
// ============================================

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function addDaysToToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function isCardDue(card: CardState): boolean {
  return card.nextDue <= getTodayISO();
}

// ============================================
// LOCALSTORAGE PERSISTENCE
// ============================================

const STORAGE_KEY = 'voicing-lab-drill-cards';

export function loadAllCards(): Record<string, CardState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, CardState>;
  } catch {
    return {};
  }
}

export function saveAllCards(cards: Record<string, CardState>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  } catch {
    // localStorage unavailable (e.g., in tests)
  }
}

export function saveCard(card: CardState): void {
  const all = loadAllCards();
  all[card.id] = card;
  saveAllCards(all);
}

export function getOrCreateCard(
  id: string,
  drillType: DrillType,
  root: string,
): CardState {
  const all = loadAllCards();
  if (all[id]) return all[id];
  const fresh = createCardState(id, drillType, root);
  all[id] = fresh;
  saveAllCards(all);
  return fresh;
}

export function getDueCards(allCards: Record<string, CardState>): CardState[] {
  return Object.values(allCards).filter(isCardDue);
}
