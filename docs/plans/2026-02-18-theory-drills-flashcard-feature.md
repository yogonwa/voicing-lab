# Theory Drills — Flashcard Feature for voicing-lab

> **STATUS: COMPLETE ✅** — Implemented Feb 2026. Branch: `phase7-voice-leading-trainer`. Uses Tonal.js for enharmonic spelling.

> **Execute from:** `/Users/joegonwa/Projects/voicing-lab`

## Context

Joe wants to drill chord tone recall — given a root + quality, instantly name the 3rd, 7th, or both. This builds the reflexive guide-tone knowledge required for shell voicings and stride left hand. The feature belongs in voicing-lab because `chordCalculator.ts` already computes all chord tones; no new music theory logic is needed.

Spaced repetition (SM-2 algorithm) and inversion-order drills are required from the start.

---

## What Gets Built

### New Route: `/drills`

**Three drill types:**
1. **3rd Drill** — "What is the 3rd of G dom7?" → tap one of 4 note buttons
2. **7th Drill** — "What is the 7th of Bb maj7?" → tap one of 4 note buttons
3. **Guide Tones** — "Name the guide tones of Dm7" → tap 3rd first, then 7th (or inverted order)

**Inversion variants (Guide Tones mode):**
- "3rd then 7th" — standard shell voicing order
- "7th then 3rd" — inverted shell (7th on bottom)
- Randomized: sometimes asks 3rd first, sometimes 7th first
- Eventually: show a piano keyboard with two highlighted keys, ask which is 3rd and which is 7th

---

## Spaced Repetition Design (SM-2)

Each flashcard has state stored in localStorage:

```ts
interface CardState {
  id: string;           // e.g., "Cmaj7-third"
  easeFactor: number;   // starts at 2.5
  interval: number;     // days until next review
  repetitions: number;  // consecutive correct answers
  nextDue: string;      // ISO date
  correctCount: number;
  wrongCount: number;
  lastAnswered: string; // ISO date
}
```

**SM-2 update rules (simplified):**
- Correct answer: interval grows (1 → 6 → 14 → 25+ days), ease factor adjusts up
- Wrong answer: interval resets to 1 day, ease factor decreases
- Cards due today shown first; overdue cards prioritized over new cards

**Key weighting:** B, F#/Gb, Db, Ab, Eb (sweaty keys from CLAUDE.md) start with shorter initial intervals so they recur more frequently until mastered.

---

## Answer Tracking

**Per-card stats (localStorage):**
- Correct count, wrong count
- Current streak per card
- Last answered date

**Session stats (in-memory):**
- Cards reviewed this session
- Accuracy %
- New cards introduced vs. review cards

**Aggregate views (displayed in `/progress` or drill settings):**
- Heat map: which keys/qualities are strongest
- Cards due today vs. coming up this week

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/App.tsx` | Add `/drills` route |
| `src/components/TheoryDrills/TheoryDrillsPage.tsx` | New page, manages drill queue + session state |
| `src/components/TheoryDrills/FlashCard.tsx` | Chord symbol → 4-button multiple choice → answer reveal with piano highlight |
| `src/components/TheoryDrills/DrillSettings.tsx` | Drill type toggle, quality filter, key filter |
| `src/components/TheoryDrills/SessionSummary.tsx` | End-of-session recap (cards done, accuracy, next due) |
| `src/lib/spacedRepetition.ts` | **New** — SM-2 algorithm, card state CRUD, localStorage persistence |
| `src/lib/drillGenerator.ts` | **New** — Generate question cards from chord data, build wrong-answer distractors |
| `src/lib/chordCalculator.ts` | **Reuse as-is** — already returns `{ root, third, fifth, seventh }` |
| `src/components/PianoKeyboard/` | **Reuse as-is** — show correct note highlighted on answer reveal |
| `src/lib/musicConstants.ts` | **Reuse as-is** — note names for distractor generation |

---

## Implementation Phases

### Phase A — Core Drill Loop (MVP)
1. Add `/drills` route in `App.tsx`
2. Build `drillGenerator.ts` — creates question objects from `chordCalculator.ts`, generates 3 wrong-answer distractors from same chromatic set
3. Build `FlashCard.tsx` — chord symbol display, 4 tappable note buttons, answer reveal + piano keyboard highlight
4. Build `TheoryDrillsPage.tsx` — random card queue, session state, correct/wrong tracking (in-memory only)

### Phase B — Spaced Repetition
5. Build `spacedRepetition.ts` — SM-2 logic, localStorage persistence, card state init/update
6. Wire SM-2 into `TheoryDrillsPage.tsx` — load due cards on session start, update card state after each answer
7. Build `SessionSummary.tsx` — show session stats and next-due preview

### Phase C — Settings + Inversion Mode
8. Build `DrillSettings.tsx` — quality filter (maj7/min7/dom7), key filter, drill type (3rd / 7th / guide tones), inversion toggle
9. Add inversion mode to `FlashCard.tsx` — randomize whether 3rd or 7th is asked first in guide-tone mode
10. Add sweaty-key weighting to SM-2 initializer

---

## Distractor Generation

For "What is the 3rd of Cmaj7?" (correct: E), wrong answers should be:
- Plausible (nearby notes or common confusion tones)
- Never equal to the correct answer
- Strategy: pick 3 random notes from chromatic scale that differ from correct answer and root

---

## Reusable Existing Code

- `src/lib/chordCalculator.ts` → `getChordTones(chord)` returns `{ root, third, fifth, seventh }`
- `src/components/PianoKeyboard/PianoKeyboard.tsx` → accepts `highlightedNotes` prop
- `src/lib/musicConstants.ts` → interval constants
- `src/lib/noteUtils.ts` → note name normalization (enharmonic handling: Bb vs A#)
- `src/lib/chordCalculator.ts` → `CHROMATIC_SCALE` for distractor pool

---

## Verification Plan

1. `npm test` — all existing tests pass with no regressions
2. Navigate to `/drills` in browser
3. Drill Cmaj7 → verify 3rd = E, 7th = B shown correctly; piano keyboard highlights correct key
4. Drill Bbm7 → verify 3rd = Db (not C#), enharmonic display correct
5. Answer wrong 3 times on same card → verify interval resets to 1 day in localStorage
6. Answer correct 3 times → verify interval grows, card moves to back of queue
7. Check mobile layout at 375px viewport — buttons must be tappable (min 44px hit targets)
8. Reload page mid-session → verify card states persist from localStorage
9. Drill a sweaty key (F#maj7) → verify it appears more frequently early on

---

## Status

- [x] Phase A — Core Drill Loop (implemented 2026-02-18)
- [x] Phase B — Spaced Repetition (implemented 2026-02-18, SM-2 with lapseCount/isLeech/easeFactor floor)
- [x] Phase C — Settings + Inversion Mode (DrillSettings with quality/key/type filters; guide-tones mode)
