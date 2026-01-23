# Phase 7: Voice Leading Trainer

**Status:** In Progress (MVP complete, needs manual testing)
**Last updated:** January 2026

## Progress

| Step | Status |
|------|--------|
| Step 1: React Router | ✅ Complete |
| Step 2: Voice Leading Analysis | ✅ Complete |
| Step 3: Trainer State Management | ✅ Complete |
| Step 4: UI Components | ✅ Complete |
| Step 5: Integration | ✅ Complete |
| Manual Testing | ⏳ Pending |
| Audio Integration | ⏳ Pending |

## Feature Summary

A new top-level mode that teaches voice leading through ii-V-I progressions. Users build voicings chord-by-chord with scoring feedback.

| Decision | Choice |
|----------|--------|
| UX Model | Build-Forward (build each chord sequentially) |
| First Chord | Locked/given (Dm7 voicing provided) |
| Build Method | Click-to-add from note palette |
| Hints | Show R-3-5-7 of target chord |
| Scoring | Combined: motion (50) + pattern (30) + playability (20) |
| Scope v1 | ii-V-I only, all 12 keys |
| Key Unlock | Complete all 3 chords to unlock next key (circle of fifths) |

---

## User Flow

```
1. User enters "Voice Leading Trainer" from main nav
2. Sees ii-V-I progression: [Dm7 ✓] → [G7 BUILD] → [Cmaj7 ...]
3. Chord 1 (Dm7) is locked with pre-built Shell A voicing
4. User clicks notes from palette to build G7
5. R-3-5-7 hint overlay shows available chord tones
6. User submits → sees score breakdown:
   - Voice motion: "C→B half-step ✓, F held ✓"
   - Pattern bonus: "Shell A detected +30"
   - Playability: "Good hand span +20"
7. Builds Cmaj7 similarly
8. Completes progression → next key unlocks (C → G → D → ...)
```

---

## Implementation Plan

### Step 1: Add React Router

**Files:**
- `src/App.tsx` - Add BrowserRouter, Routes, navigation
- `src/App.css` - Navigation styles
- `package.json` - Add react-router-dom dependency

**Changes:**
```bash
npm install react-router-dom
```

Routes:
- `/` → ChordExplorer (existing)
- `/trainer` → VoiceLeadingTrainer (new)

---

### Step 2: Create Voice Leading Analysis Library

**New file:** `src/lib/voiceLeadingAnalysis.ts`

Core scoring algorithm:

```typescript
interface VoiceMotion {
  fromNote: Note;
  toNote: Note;
  interval: number;       // semitones (negative = down)
  motionType: 'common-tone' | 'half-step' | 'whole-step' | 'small-leap' | 'large-leap';
}

interface VoiceMotionAnalysis {
  motions: VoiceMotion[];
  commonTones: number;
  halfSteps: number;
  largeLeaps: number;
  smoothnessScore: number;  // 0-100
}

function analyzeVoiceMotion(fromVoicing: Note[], toVoicing: Note[]): VoiceMotionAnalysis;
function scoreVoicingSubmission(...): VoicingScore;
```

**Scoring formula:**
- Start with 50 points
- +2 per common tone (max +6)
- -2 per whole-step
- -5 per small leap (3-4 semitones)
- -10 per large leap (5+ semitones)
- +0-30 pattern bonus (from existing `detectVoicingPattern`)
- +0-20 playability (from existing `analyzeVoicing`)

**Test file:** `src/lib/voiceLeadingAnalysis.test.ts`

---

### Step 3: Create Trainer State Management

**New file:** `src/lib/trainerState.ts`

```typescript
interface TrainerState {
  currentKey: NoteName;
  progressionIndex: 0 | 1 | 2;  // ii, V, I
  builtVoicings: { ii: BuiltVoicing | null; V: BuiltVoicing | null; I: BuiltVoicing | null };
  scores: { ii: VoicingScore | null; V: VoicingScore | null; I: VoicingScore | null };
}

function createTrainerState(key: NoteName): TrainerState;
function getLockedVoicing(state: TrainerState): BuiltVoicing;
function getCurrentTargetChord(state: TrainerState): { chord: Chord; function: ChordFunction };
```

**New file:** `src/lib/keyProgress.ts`

```typescript
const KEY_UNLOCK_ORDER = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'];

interface KeyProgress {
  unlockedKeys: NoteName[];
  completedKeys: Record<NoteName, { bestScore: number; completedAt: Date }>;
}

function isKeyUnlocked(key: NoteName, progress: KeyProgress): boolean;
function unlockNextKey(completedKey: NoteName, progress: KeyProgress): KeyProgress;
function saveKeyProgress(progress: KeyProgress): void;  // localStorage
function loadKeyProgress(): KeyProgress;
```

**New file:** `src/lib/starterVoicings.ts`

```typescript
// Pre-built Shell A voicings for ii chord in each key
// Uses existing transposeVoicing() from voicingGenerator.ts
function getStarterVoicing(key: NoteName): BuiltVoicing;
function getChordToneHints(chord: Chord): { role: VoicingRole; note: NoteName }[];
```

---

### Step 4: Create UI Components

**New directory:** `src/components/VoiceLeadingTrainer/`

| Component | Purpose |
|-----------|---------|
| `VoiceLeadingTrainer.tsx` | Main container, state management, flow orchestration |
| `ProgressionDisplay.tsx` | Shows 3-chord progression with status badges |
| `NotePalette.tsx` | Click-to-add interface for building voicings |
| `VoicingBuilder.tsx` | Work area with keyboard visualization |
| `ScoreDisplay.tsx` | Feedback breakdown after submission |
| `KeySelector.tsx` | Circle of fifths key selection with locks |

---

### Step 5: Wire Up Integration

**Modify:** `src/components/index.ts` - Export VoiceLeadingTrainer

**Integration points:**
- Pattern bonus → `detectVoicingPattern()` from `voicingRecognition.ts`
- Playability score → `analyzeVoicing()` from `voicingAnalysis.ts`
- Starter voicings → `transposeVoicing()` from `voicingGenerator.ts`
- Block structure → `PlaygroundBlock` from `playgroundUtils.ts`
- Keyboard display → existing `PianoKeyboard` component

---

## File Summary

### New Files (11)
```
src/lib/
  voiceLeadingAnalysis.ts
  voiceLeadingAnalysis.test.ts
  trainerState.ts
  trainerState.test.ts
  keyProgress.ts
  keyProgress.test.ts
  starterVoicings.ts

src/components/VoiceLeadingTrainer/
  index.ts
  VoiceLeadingTrainer.tsx
  VoiceLeadingTrainer.css
  ProgressionDisplay.tsx
  NotePalette.tsx
  VoicingBuilder.tsx
  ScoreDisplay.tsx
  KeySelector.tsx
```

### Modified Files (3)
```
src/App.tsx          - Add routing
src/App.css          - Navigation styles
src/components/index.ts - Export new component
package.json         - Add react-router-dom
```

---

## Verification

1. **Unit tests**: Run `npm test` - all existing tests pass + new tests for voice leading analysis
2. **Manual testing**:
   - Navigate to `/trainer`
   - Verify Dm7 is shown locked
   - Build G7 by clicking notes
   - Verify scoring shows motion analysis
   - Complete progression
   - Verify next key unlocks
   - Reload page, verify progress persists (localStorage)
3. **Audio**: Play built voicings, verify octave placement sounds correct

---

## Future Enhancements (Post v1)

- **More progressions**: ii-V-i minor, turnarounds, pop progressions
- **Famous tunes**: Excerpts from Giant Steps, Autumn Leaves, Girl from Ipanema
- **Voice motion arrows**: SVG visualization of note movement
- **Choose-Your-Path mode**: Pick from pre-built options instead of free building
- **Leaderboard/achievements**: Gamification for motivation
