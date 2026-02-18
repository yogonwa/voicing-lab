# Voice Leading Trainer Redesign Implementation Plan

> **STATUS: COMPLETE ✅** — Implemented Feb 2026. Branch: `phase7-voice-leading-trainer`.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Voice Leading Trainer with direct piano-clicking interaction, visual voice leading arrows, and sophisticated scoring.

**Architecture:** Component-based React architecture reusing Phase 7 scoring algorithms (`voiceLeadingAnalysis.ts`, `keyProgress.ts`). Three-column layout with vertically stacked keyboards showing progression history. SVG-based voice leading visualization.

**Tech Stack:** React 18, TypeScript, Tone.js (audio), existing voicing library (`src/lib/`), CSS-in-JS or CSS modules

---

## Prerequisites

Before starting, verify:
- Current branch: `phase7-voice-leading-trainer`
- All Phase 7 tests passing: `npm test`
- Design doc reviewed: `docs/plans/2026-02-04-voice-leading-trainer-redesign.md`

---

## Task 1: State Management Foundation

**Goal:** Extend trainer state to support new interaction model

**Files:**
- Modify: `src/lib/trainerState.ts`
- Test: `src/lib/trainerState.test.ts`

### Step 1: Write failing test for new state structure

Add to `src/lib/trainerState.test.ts`:

```typescript
describe('TrainerState - Redesign', () => {
  test('should initialize with setup phase', () => {
    const state = createTrainerState();
    expect(state.phase).toBe('setup');
    expect(state.selectedNotes).toEqual([]);
    expect(state.lockedKeyboards).toEqual([]);
  });

  test('should track selected notes for current keyboard', () => {
    const state = createTrainerState();
    const newState = addSelectedNote(state, 60); // Middle C
    expect(newState.selectedNotes).toContain(60);
  });

  test('should lock keyboard and store voicing on submit', () => {
    const state = {
      ...createTrainerState(),
      selectedNotes: [60, 64, 67], // C major triad
      currentChordIndex: 0
    };
    const newState = submitVoicing(state);
    expect(newState.lockedKeyboards).toHaveLength(1);
    expect(newState.lockedKeyboards[0].notes).toEqual([60, 64, 67]);
    expect(newState.selectedNotes).toEqual([]);
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- trainerState.test.ts
```

Expected: FAIL - functions not defined

### Step 3: Extend TrainerState type and implement functions

In `src/lib/trainerState.ts`:

```typescript
export type TrainerPhase = 'setup' | 'building' | 'completed';

export interface LockedKeyboard {
  chordIndex: number;
  notes: number[]; // MIDI note numbers
  score?: VoiceLeadingScore;
}

export interface TrainerState {
  phase: TrainerPhase;
  progression: string; // e.g., "II-V-I"
  key: string; // e.g., "C"
  startingStyle: string; // e.g., "Shell A"
  startingVoicing: number[]; // MIDI notes for first chord
  currentChordIndex: number;
  selectedNotes: number[];
  lockedKeyboards: LockedKeyboard[];
  scores: VoiceLeadingScore[];
}

export function createTrainerState(): TrainerState {
  return {
    phase: 'setup',
    progression: 'II-V-I',
    key: 'C',
    startingStyle: 'Shell A',
    startingVoicing: [],
    currentChordIndex: 0,
    selectedNotes: [],
    lockedKeyboards: [],
    scores: []
  };
}

export function addSelectedNote(state: TrainerState, note: number): TrainerState {
  return {
    ...state,
    selectedNotes: [...state.selectedNotes, note]
  };
}

export function removeSelectedNote(state: TrainerState, note: number): TrainerState {
  return {
    ...state,
    selectedNotes: state.selectedNotes.filter(n => n !== note)
  };
}

export function submitVoicing(state: TrainerState): TrainerState {
  const locked: LockedKeyboard = {
    chordIndex: state.currentChordIndex,
    notes: [...state.selectedNotes]
  };

  return {
    ...state,
    lockedKeyboards: [...state.lockedKeyboards, locked],
    selectedNotes: [],
    currentChordIndex: state.currentChordIndex + 1
  };
}
```

### Step 4: Run test to verify it passes

```bash
npm test -- trainerState.test.ts
```

Expected: PASS

### Step 5: Commit

```bash
git add src/lib/trainerState.ts src/lib/trainerState.test.ts
git commit -m "$(cat <<'EOF'
feat: extend trainer state for redesigned interaction model

- Add TrainerPhase type (setup, building, completed)
- Add LockedKeyboard interface for previous voicings
- Add selectedNotes array for current keyboard
- Implement addSelectedNote, removeSelectedNote, submitVoicing

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Interactive Keyboard Component - Foundation

**Goal:** Create clickable piano keyboard with selection state

**Files:**
- Create: `src/components/InteractiveKeyboard/InteractiveKeyboard.tsx`
- Create: `src/components/InteractiveKeyboard/InteractiveKeyboard.test.tsx`
- Create: `src/components/InteractiveKeyboard/InteractiveKeyboard.module.css`

### Step 1: Write failing test for keyboard rendering and interaction

Create `src/components/InteractiveKeyboard/InteractiveKeyboard.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import InteractiveKeyboard from './InteractiveKeyboard';

describe('InteractiveKeyboard', () => {
  test('renders piano keys', () => {
    render(<InteractiveKeyboard selectedNotes={[]} onNoteClick={() => {}} />);
    // Should render white keys (C through B in range)
    const whiteKeys = screen.getAllByRole('button').filter(btn =>
      btn.className.includes('whiteKey')
    );
    expect(whiteKeys.length).toBeGreaterThan(0);
  });

  test('highlights selected notes', () => {
    render(<InteractiveKeyboard selectedNotes={[60]} onNoteClick={() => {}} />);
    const selectedKey = screen.getByTestId('key-60');
    expect(selectedKey).toHaveClass('selected');
  });

  test('calls onNoteClick when key is clicked', () => {
    const handleClick = jest.fn();
    render(<InteractiveKeyboard selectedNotes={[]} onNoteClick={handleClick} />);
    const middleC = screen.getByTestId('key-60');
    fireEvent.click(middleC);
    expect(handleClick).toHaveBeenCalledWith(60);
  });

  test('disables interaction when locked', () => {
    const handleClick = jest.fn();
    render(<InteractiveKeyboard selectedNotes={[60]} onNoteClick={handleClick} locked />);
    const middleC = screen.getByTestId('key-60');
    fireEvent.click(middleC);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- InteractiveKeyboard.test.tsx
```

Expected: FAIL - component not found

### Step 3: Implement minimal InteractiveKeyboard component

Create `src/components/InteractiveKeyboard/InteractiveKeyboard.tsx`:

```typescript
import React from 'react';
import styles from './InteractiveKeyboard.module.css';

interface InteractiveKeyboardProps {
  selectedNotes: number[];
  onNoteClick: (note: number) => void;
  locked?: boolean;
}

// Define keyboard range: C3 (48) to B5 (83) = 3 octaves
const KEYBOARD_START = 48;
const KEYBOARD_END = 83;

const isBlackKey = (note: number): boolean => {
  const pitchClass = note % 12;
  return [1, 3, 6, 8, 10].includes(pitchClass); // C#, D#, F#, G#, A#
};

const InteractiveKeyboard: React.FC<InteractiveKeyboardProps> = ({
  selectedNotes,
  onNoteClick,
  locked = false
}) => {
  const keys = [];

  for (let note = KEYBOARD_START; note <= KEYBOARD_END; note++) {
    const isSelected = selectedNotes.includes(note);
    const isBlack = isBlackKey(note);

    keys.push(
      <button
        key={note}
        data-testid={`key-${note}`}
        className={`
          ${isBlack ? styles.blackKey : styles.whiteKey}
          ${isSelected ? styles.selected : ''}
          ${locked ? styles.locked : ''}
        `.trim()}
        onClick={() => !locked && onNoteClick(note)}
        disabled={locked}
        aria-label={`Note ${note}`}
      >
        {/* Visual key representation */}
      </button>
    );
  }

  return (
    <div className={styles.keyboard}>
      {keys}
    </div>
  );
};

export default InteractiveKeyboard;
```

### Step 4: Add minimal CSS

Create `src/components/InteractiveKeyboard/InteractiveKeyboard.module.css`:

```css
.keyboard {
  display: flex;
  position: relative;
  height: 120px;
  padding: 10px;
}

.whiteKey {
  width: 40px;
  height: 100px;
  background: #EAE7DC;
  border: 1px solid #333;
  cursor: pointer;
  position: relative;
  margin: 0;
  padding: 0;
}

.whiteKey:hover:not(:disabled) {
  background: #F5F2E7;
}

.blackKey {
  width: 28px;
  height: 65px;
  background: #0A0A0A;
  border: 1px solid #000;
  cursor: pointer;
  position: absolute;
  margin-left: -14px;
  z-index: 10;
  padding: 0;
}

.blackKey:hover:not(:disabled) {
  background: #1A1A1A;
}

.selected {
  background: #C9A24D !important;
  box-shadow: 0 0 10px rgba(201, 162, 77, 0.6);
}

.locked {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Step 5: Run test to verify it passes

```bash
npm test -- InteractiveKeyboard.test.tsx
```

Expected: PASS

### Step 6: Commit

```bash
git add src/components/InteractiveKeyboard/
git commit -m "$(cat <<'EOF'
feat: add InteractiveKeyboard component with selection state

- Render 3-octave piano keyboard (C3-B5)
- Support selected notes highlighting
- Handle click events for note selection
- Support locked state (non-interactive)
- Basic styling with brass highlight for selected keys

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Chord Tone Labels Component

**Goal:** Display chord tone labels below keyboard showing click order

**Files:**
- Create: `src/components/ChordToneLabels/ChordToneLabels.tsx`
- Create: `src/components/ChordToneLabels/ChordToneLabels.test.tsx`
- Create: `src/components/ChordToneLabels/ChordToneLabels.module.css`

### Step 1: Write failing test for chord tone label generation

Create `src/components/ChordToneLabels/ChordToneLabels.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import ChordToneLabels from './ChordToneLabels';

describe('ChordToneLabels', () => {
  test('renders chord tones for Dm7 voicing', () => {
    // Dm7: D(62), F(65), A(69), C(72) = R, ♭3, 5, ♭7
    const notes = [62, 65, 69, 72];
    const targetChord = { root: 'D', quality: 'm7' };

    render(<ChordToneLabels notes={notes} targetChord={targetChord} />);

    expect(screen.getByText('[R]')).toBeInTheDocument();
    expect(screen.getByText('[♭3]')).toBeInTheDocument();
    expect(screen.getByText('[5]')).toBeInTheDocument();
    expect(screen.getByText('[♭7]')).toBeInTheDocument();
  });

  test('renders in click order', () => {
    // Click order: C, E, G (root, 3rd, 5th)
    const notes = [60, 64, 67];
    const targetChord = { root: 'C', quality: 'maj7' };

    const { container } = render(<ChordToneLabels notes={notes} targetChord={targetChord} />);
    const labels = container.querySelectorAll('.label');

    expect(labels[0]).toHaveTextContent('[R]');
    expect(labels[1]).toHaveTextContent('[3]');
    expect(labels[2]).toHaveTextContent('[5]');
  });

  test('handles extensions (9, 11, 13)', () => {
    // Dm9: D, F, A, C, E = R, ♭3, 5, ♭7, 9
    const notes = [62, 65, 69, 72, 76];
    const targetChord = { root: 'D', quality: 'm9' };

    render(<ChordToneLabels notes={notes} targetChord={targetChord} />);
    expect(screen.getByText('[9]')).toBeInTheDocument();
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- ChordToneLabels.test.tsx
```

Expected: FAIL - component not found

### Step 3: Implement ChordToneLabels component

Create `src/components/ChordToneLabels/ChordToneLabels.tsx`:

```typescript
import React from 'react';
import { getChordToneLabel } from '../../lib/chordToneUtils';
import styles from './ChordToneLabels.module.css';

interface ChordToneLabelProps {
  notes: number[]; // MIDI note numbers in click order
  targetChord: {
    root: string;
    quality: string;
  };
}

const ChordToneLabels: React.FC<ChordToneLabelProps> = ({ notes, targetChord }) => {
  return (
    <div className={styles.labelsContainer}>
      {notes.map((note, index) => {
        const label = getChordToneLabel(note, targetChord);
        return (
          <span key={index} className={styles.label}>
            [{label}]
          </span>
        );
      })}
    </div>
  );
};

export default ChordToneLabels;
```

### Step 4: Create chord tone utility function

Create `src/lib/chordToneUtils.ts`:

```typescript
// Maps MIDI note to chord tone label relative to target chord
export function getChordToneLabel(
  note: number,
  targetChord: { root: string; quality: string }
): string {
  const rootMidi = noteNameToMidi(targetChord.root);
  const interval = (note - rootMidi + 12) % 12;

  const labelMap: Record<number, string> = {
    0: 'R',    // Root
    1: '♭9',   // Flat 9
    2: '9',    // 9
    3: '♭3',   // Minor 3rd
    4: '3',    // Major 3rd
    5: '11',   // 11
    6: '♯11',  // Sharp 11
    7: '5',    // Perfect 5th
    8: '♯5',   // Augmented 5th
    9: '13',   // 13
    10: '♭7',  // Dominant/minor 7th
    11: '7'    // Major 7th
  };

  return labelMap[interval] || '?';
}

function noteNameToMidi(noteName: string): number {
  const noteMap: Record<string, number> = {
    'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
  };
  return noteMap[noteName] || 0;
}
```

### Step 5: Add CSS

Create `src/components/ChordToneLabels/ChordToneLabels.module.css`:

```css
.labelsContainer {
  display: flex;
  gap: 8px;
  padding: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #EAE7DC;
  background: rgba(201, 162, 77, 0.2);
  border: 1px solid #C9A24D;
  border-radius: 4px;
  padding: 4px 8px;
  font-weight: 500;
}
```

### Step 6: Run test to verify it passes

```bash
npm test -- ChordToneLabels.test.tsx
```

Expected: PASS

### Step 7: Commit

```bash
git add src/components/ChordToneLabels/ src/lib/chordToneUtils.ts
git commit -m "$(cat <<'EOF'
feat: add ChordToneLabels component for theory visualization

- Display chord tones in click order (R, ♭3, 5, ♭7, 9, etc.)
- Create chordToneUtils for interval-to-label mapping
- Support extensions (9, 11, 13) and alterations (♭9, ♯11)
- Styled with brass accents matching design system

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Voice Leading Arrows Component - SVG Foundation

**Goal:** Render color-coded arrows showing voice motion between keyboards

**Files:**
- Create: `src/components/VoiceLeadingArrows/VoiceLeadingArrows.tsx`
- Create: `src/components/VoiceLeadingArrows/VoiceLeadingArrows.test.tsx`
- Create: `src/components/VoiceLeadingArrows/VoiceLeadingArrows.module.css`

### Step 1: Write failing test for arrow rendering

Create `src/components/VoiceLeadingArrows/VoiceLeadingArrows.test.tsx`:

```typescript
import { render } from '@testing-library/react';
import VoiceLeadingArrows from './VoiceLeadingArrows';

describe('VoiceLeadingArrows', () => {
  test('renders arrows for voice motion', () => {
    const previousNotes = [60, 64, 67]; // C major
    const currentNotes = [62, 65, 69]; // D minor

    const { container } = render(
      <VoiceLeadingArrows
        previousNotes={previousNotes}
        currentNotes={currentNotes}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Should have 3 arrows (one per voice)
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(3);
  });

  test('colors arrows by motion type', () => {
    const previousNotes = [60]; // C
    const currentNotes = [60]; // C (common tone)

    const { container } = render(
      <VoiceLeadingArrows
        previousNotes={previousNotes}
        currentNotes={currentNotes}
      />
    );

    const path = container.querySelector('path');
    // Common tone (0 semitones) should be green
    expect(path).toHaveAttribute('stroke', '#7A9D7E');
  });

  test('handles different motion distances', () => {
    const testCases = [
      { distance: 0, expectedColor: '#7A9D7E' }, // Green (common tone)
      { distance: 1, expectedColor: '#5B8FA3' }, // Blue (half-step)
      { distance: 2, expectedColor: '#D4A574' }, // Yellow (whole-step)
      { distance: 4, expectedColor: '#C4845F' }, // Orange (small leap)
      { distance: 7, expectedColor: '#8B4D4D' }, // Red (large leap)
    ];

    testCases.forEach(({ distance, expectedColor }) => {
      const { container } = render(
        <VoiceLeadingArrows
          previousNotes={[60]}
          currentNotes={[60 + distance]}
        />
      );
      const path = container.querySelector('path');
      expect(path).toHaveAttribute('stroke', expectedColor);
    });
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- VoiceLeadingArrows.test.tsx
```

Expected: FAIL - component not found

### Step 3: Implement VoiceLeadingArrows component

Create `src/components/VoiceLeadingArrows/VoiceLeadingArrows.tsx`:

```typescript
import React from 'react';
import { analyzeVoiceMotion } from '../../lib/voiceLeadingAnalysis';
import styles from './VoiceLeadingArrows.module.css';

interface VoiceLeadingArrowsProps {
  previousNotes: number[];
  currentNotes: number[];
}

const getColorForMotion = (semitones: number): string => {
  const distance = Math.abs(semitones);
  if (distance === 0) return '#7A9D7E'; // Green - common tone
  if (distance === 1) return '#5B8FA3'; // Blue - half-step
  if (distance === 2) return '#D4A574'; // Yellow - whole-step
  if (distance <= 4) return '#C4845F'; // Orange - small leap
  return '#8B4D4D'; // Red - large leap
};

const VoiceLeadingArrows: React.FC<VoiceLeadingArrowsProps> = ({
  previousNotes,
  currentNotes
}) => {
  const motions = analyzeVoiceMotion(previousNotes, currentNotes);

  return (
    <svg className={styles.arrowsContainer} height="60" width="100%">
      {motions.map((motion, index) => {
        const color = getColorForMotion(motion.semitones);

        // Simple vertical arrow (will enhance with curves)
        const startX = 50 + index * 40;
        const startY = 10;
        const endY = 50;

        return (
          <g key={index}>
            <path
              d={`M ${startX} ${startY} L ${startX} ${endY}`}
              stroke={color}
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
          </g>
        );
      })}

      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="5"
          refY="5"
          orient="auto"
        >
          <polygon points="0 0, 10 5, 0 10" fill="currentColor" />
        </marker>
      </defs>
    </svg>
  );
};

export default VoiceLeadingArrows;
```

### Step 4: Run test to verify it passes

```bash
npm test -- VoiceLeadingArrows.test.tsx
```

Expected: PASS

### Step 5: Add CSS

Create `src/components/VoiceLeadingArrows/VoiceLeadingArrows.module.css`:

```css
.arrowsContainer {
  display: block;
  margin: 10px 0;
}
```

### Step 6: Commit

```bash
git add src/components/VoiceLeadingArrows/
git commit -m "$(cat <<'EOF'
feat: add VoiceLeadingArrows component with color-coded motion

- Render SVG arrows between keyboards showing voice movement
- Color-code by motion distance (green=common, blue=half-step, red=leap)
- Reuse analyzeVoiceMotion from voiceLeadingAnalysis.ts
- Foundation for curved arrows in next iteration

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Keyboard Stack Container

**Goal:** Container managing multiple keyboards vertically with arrows

**Files:**
- Create: `src/components/KeyboardStack/KeyboardStack.tsx`
- Create: `src/components/KeyboardStack/KeyboardStack.test.tsx`
- Create: `src/components/KeyboardStack/KeyboardStack.module.css`

### Step 1: Write failing test for keyboard stacking

Create `src/components/KeyboardStack/KeyboardStack.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import KeyboardStack from './KeyboardStack';

describe('KeyboardStack', () => {
  test('renders locked keyboards and current keyboard', () => {
    const lockedKeyboards = [
      { chordIndex: 0, notes: [60, 64, 67] }, // C major
      { chordIndex: 1, notes: [62, 65, 69] }, // D minor
    ];

    render(
      <KeyboardStack
        lockedKeyboards={lockedKeyboards}
        currentNotes={[67, 71, 74]}
        onNoteClick={() => {}}
        targetChord={{ root: 'G', quality: '7' }}
      />
    );

    // Should render 2 locked + 1 active = 3 keyboards
    const keyboards = screen.getAllByRole('button'); // Piano keys
    expect(keyboards.length).toBeGreaterThan(0);
  });

  test('renders voice leading arrows between keyboards', () => {
    const lockedKeyboards = [
      { chordIndex: 0, notes: [60, 64, 67] },
    ];

    const { container } = render(
      <KeyboardStack
        lockedKeyboards={lockedKeyboards}
        currentNotes={[62, 65, 69]}
        onNoteClick={() => {}}
        targetChord={{ root: 'D', quality: 'm7' }}
      />
    );

    // Should have arrows between locked and current
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  test('shows chord tone labels for each keyboard', () => {
    const lockedKeyboards = [
      { chordIndex: 0, notes: [60, 64, 67] },
    ];

    render(
      <KeyboardStack
        lockedKeyboards={lockedKeyboards}
        currentNotes={[62]}
        onNoteClick={() => {}}
        targetChord={{ root: 'D', quality: 'm7' }}
      />
    );

    // Should show labels below keyboards
    expect(screen.getByText('[R]')).toBeInTheDocument();
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- KeyboardStack.test.tsx
```

Expected: FAIL - component not found

### Step 3: Implement KeyboardStack component

Create `src/components/KeyboardStack/KeyboardStack.tsx`:

```typescript
import React from 'react';
import InteractiveKeyboard from '../InteractiveKeyboard/InteractiveKeyboard';
import ChordToneLabels from '../ChordToneLabels/ChordToneLabels';
import VoiceLeadingArrows from '../VoiceLeadingArrows/VoiceLeadingArrows';
import styles from './KeyboardStack.module.css';

interface KeyboardStackProps {
  lockedKeyboards: Array<{
    chordIndex: number;
    notes: number[];
  }>;
  currentNotes: number[];
  onNoteClick: (note: number) => void;
  targetChord: {
    root: string;
    quality: string;
  };
}

const KeyboardStack: React.FC<KeyboardStackProps> = ({
  lockedKeyboards,
  currentNotes,
  onNoteClick,
  targetChord
}) => {
  return (
    <div className={styles.stack}>
      {/* Render locked keyboards */}
      {lockedKeyboards.map((keyboard, index) => (
        <div key={keyboard.chordIndex} className={styles.keyboardSection}>
          <InteractiveKeyboard
            selectedNotes={keyboard.notes}
            onNoteClick={() => {}}
            locked
          />
          <ChordToneLabels
            notes={keyboard.notes}
            targetChord={targetChord} // TODO: Get actual chord for this index
          />

          {/* Show arrows to next keyboard */}
          {index < lockedKeyboards.length && (
            <VoiceLeadingArrows
              previousNotes={keyboard.notes}
              currentNotes={
                index < lockedKeyboards.length - 1
                  ? lockedKeyboards[index + 1].notes
                  : currentNotes
              }
            />
          )}
        </div>
      ))}

      {/* Current active keyboard */}
      <div className={styles.keyboardSection}>
        <div className={styles.chordHeader}>
          Build: {targetChord.root}{targetChord.quality}
        </div>
        <InteractiveKeyboard
          selectedNotes={currentNotes}
          onNoteClick={onNoteClick}
        />
        <ChordToneLabels
          notes={currentNotes}
          targetChord={targetChord}
        />
      </div>
    </div>
  );
};

export default KeyboardStack;
```

### Step 4: Add CSS

Create `src/components/KeyboardStack/KeyboardStack.module.css`:

```css
.stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.keyboardSection {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chordHeader {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  color: #C9A24D;
  text-align: center;
  margin-bottom: 10px;
}
```

### Step 5: Run test to verify it passes

```bash
npm test -- KeyboardStack.test.tsx
```

Expected: PASS

### Step 6: Commit

```bash
git add src/components/KeyboardStack/
git commit -m "$(cat <<'EOF'
feat: add KeyboardStack container for vertical progression display

- Stack locked keyboards (previous voicings) above current
- Integrate InteractiveKeyboard, ChordToneLabels, VoiceLeadingArrows
- Show chord header for current target chord
- Styled with jazz club theme (Playfair Display, brass accents)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Setup Panel Component

**Goal:** Left panel with progression/key/style/voicing selectors

**Files:**
- Create: `src/components/SetupPanel/SetupPanel.tsx`
- Create: `src/components/SetupPanel/SetupPanel.test.tsx`
- Create: `src/components/SetupPanel/SetupPanel.module.css`

### Step 1: Write failing test for setup panel UI

Create `src/components/SetupPanel/SetupPanel.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import SetupPanel from './SetupPanel';

describe('SetupPanel', () => {
  test('renders all selectors in setup phase', () => {
    render(
      <SetupPanel
        phase="setup"
        progression="II-V-I"
        keyName="C"
        startingStyle="Shell A"
        onStart={() => {}}
        onReset={() => {}}
      />
    );

    expect(screen.getByLabelText(/Progression/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Key/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Starting Style/i)).toBeInTheDocument();
    expect(screen.getByText('Start Practice')).toBeInTheDocument();
  });

  test('calls onStart when Start Practice clicked', () => {
    const handleStart = jest.fn();
    render(
      <SetupPanel
        phase="setup"
        progression="II-V-I"
        keyName="C"
        startingStyle="Shell A"
        onStart={handleStart}
        onReset={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Start Practice'));
    expect(handleStart).toHaveBeenCalled();
  });

  test('shows Reset button during building phase', () => {
    render(
      <SetupPanel
        phase="building"
        progression="II-V-I"
        keyName="C"
        startingStyle="Shell A"
        onStart={() => {}}
        onReset={() => {}}
      />
    );

    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.queryByText('Start Practice')).not.toBeInTheDocument();
  });

  test('disables locked keys in dropdown', () => {
    const unlockedKeys = ['C', 'F', 'G'];
    render(
      <SetupPanel
        phase="setup"
        progression="II-V-I"
        keyName="C"
        startingStyle="Shell A"
        unlockedKeys={unlockedKeys}
        onStart={() => {}}
        onReset={() => {}}
      />
    );

    const keySelect = screen.getByLabelText(/Key/i) as HTMLSelectElement;
    const options = Array.from(keySelect.options);

    // C, F, G should be enabled
    expect(options.find(o => o.value === 'C')?.disabled).toBe(false);
    expect(options.find(o => o.value === 'F')?.disabled).toBe(false);

    // D should be locked
    expect(options.find(o => o.value === 'D')?.disabled).toBe(true);
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- SetupPanel.test.tsx
```

Expected: FAIL - component not found

### Step 3: Implement SetupPanel component

Create `src/components/SetupPanel/SetupPanel.tsx`:

```typescript
import React from 'react';
import styles from './SetupPanel.module.css';

interface SetupPanelProps {
  phase: 'setup' | 'building' | 'completed';
  progression: string;
  keyName: string;
  startingStyle: string;
  unlockedKeys?: string[];
  unlockedStyles?: string[];
  onStart: () => void;
  onReset: () => void;
  onProgressionChange?: (value: string) => void;
  onKeyChange?: (value: string) => void;
  onStyleChange?: (value: string) => void;
}

const ALL_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'F', 'Bb', 'Eb', 'Ab', 'Db'];
const ALL_STYLES = ['Shell A', 'Shell B', 'Rootless A', 'Rootless B', 'Drop-2'];

const SetupPanel: React.FC<SetupPanelProps> = ({
  phase,
  progression,
  keyName,
  startingStyle,
  unlockedKeys = ['C'],
  unlockedStyles = ['Shell A'],
  onStart,
  onReset,
  onProgressionChange = () => {},
  onKeyChange = () => {},
  onStyleChange = () => {}
}) => {
  const isSetup = phase === 'setup';

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>Setup</h2>

      <div className={styles.field}>
        <label htmlFor="progression">Progression</label>
        <select
          id="progression"
          value={progression}
          onChange={(e) => onProgressionChange(e.target.value)}
          disabled={!isSetup}
        >
          <option value="II-V-I">II-V-I</option>
          {/* More progressions unlock later */}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="key">Key</label>
        <select
          id="key"
          value={keyName}
          onChange={(e) => onKeyChange(e.target.value)}
          disabled={!isSetup}
        >
          {ALL_KEYS.map(key => (
            <option
              key={key}
              value={key}
              disabled={!unlockedKeys.includes(key)}
            >
              {key} {!unlockedKeys.includes(key) ? '🔒' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="style">Starting Style</label>
        <select
          id="style"
          value={startingStyle}
          onChange={(e) => onStyleChange(e.target.value)}
          disabled={!isSetup}
        >
          {ALL_STYLES.map(style => (
            <option
              key={style}
              value={style}
              disabled={!unlockedStyles.includes(style)}
            >
              {style} {!unlockedStyles.includes(style) ? '🔒' : ''}
            </option>
          ))}
        </select>
      </div>

      <button
        className={styles.actionButton}
        onClick={isSetup ? onStart : onReset}
      >
        {isSetup ? 'Start Practice' : 'Reset'}
      </button>
    </div>
  );
};

export default SetupPanel;
```

### Step 4: Add CSS

Create `src/components/SetupPanel/SetupPanel.module.css`:

```css
.panel {
  background: #1A1A1A;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.title {
  font-family: 'Playfair Display', serif;
  color: #EAE7DC;
  font-size: 28px;
  margin-bottom: 24px;
}

.field {
  margin-bottom: 20px;
}

.field label {
  display: block;
  font-family: 'Inter', sans-serif;
  color: #EAE7DC;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 500;
}

.field select {
  width: 100%;
  padding: 10px;
  background: #121212;
  color: #EAE7DC;
  border: 1px solid #C9A24D;
  border-radius: 4px;
  font-size: 16px;
}

.actionButton {
  width: 100%;
  padding: 14px;
  background: #C9A24D;
  color: #121212;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.actionButton:hover {
  background: #D4B05E;
}
```

### Step 5: Run test to verify it passes

```bash
npm test -- SetupPanel.test.tsx
```

Expected: PASS

### Step 6: Commit

```bash
git add src/components/SetupPanel/
git commit -m "$(cat <<'EOF'
feat: add SetupPanel with progression/key/style selectors

- Dropdown for progression (II-V-I locked initially)
- Key selector with unlock system (🔒 for locked keys)
- Starting style selector with progressive unlock
- Start Practice / Reset button based on phase
- Styled with jazz club theme (dark panels, brass accents)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Scoring Panel Component

**Goal:** Right panel showing scores and feedback after submit

**Files:**
- Create: `src/components/ScoringPanel/ScoringPanel.tsx`
- Create: `src/components/ScoringPanel/ScoringPanel.test.tsx`
- Create: `src/components/ScoringPanel/ScoringPanel.module.css`

### Step 1: Write failing test for scoring panel states

Create `src/components/ScoringPanel/ScoringPanel.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import ScoringPanel from './ScoringPanel';

describe('ScoringPanel', () => {
  test('shows note count before submit', () => {
    render(
      <ScoringPanel
        mode="building"
        noteCount={3}
        canSubmit={true}
        onSubmit={() => {}}
        onNext={() => {}}
        onTryAgain={() => {}}
      />
    );

    expect(screen.getByText('3 notes selected')).toBeInTheDocument();
    expect(screen.getByText('Submit Voicing')).toBeInTheDocument();
  });

  test('disables submit when note count too low', () => {
    render(
      <ScoringPanel
        mode="building"
        noteCount={1}
        canSubmit={false}
        onSubmit={() => {}}
        onNext={() => {}}
        onTryAgain={() => {}}
      />
    );

    const submitButton = screen.getByText('Submit Voicing');
    expect(submitButton).toBeDisabled();
  });

  test('shows score breakdown after submit', () => {
    const score = {
      total: 85,
      voiceMotion: 45,
      patternRecognition: 30,
      playability: 10,
      pattern: 'Shell A'
    };

    render(
      <ScoringPanel
        mode="scored"
        score={score}
        onSubmit={() => {}}
        onNext={() => {}}
        onTryAgain={() => {}}
      />
    );

    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText(/Voice Motion.*45/)).toBeInTheDocument();
    expect(screen.getByText(/Pattern.*Shell A.*30/)).toBeInTheDocument();
    expect(screen.getByText('Next Chord')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  test('color-codes score by quality', () => {
    const { container } = render(
      <ScoringPanel
        mode="scored"
        score={{ total: 85, voiceMotion: 45, patternRecognition: 30, playability: 10 }}
        onSubmit={() => {}}
        onNext={() => {}}
        onTryAgain={() => {}}
      />
    );

    const scoreDisplay = container.querySelector('.score');
    // 85 is high score, should have green/good styling
    expect(scoreDisplay).toHaveClass('scoreHigh');
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- ScoringPanel.test.tsx
```

Expected: FAIL - component not found

### Step 3: Implement ScoringPanel component

Create `src/components/ScoringPanel/ScoringPanel.tsx`:

```typescript
import React from 'react';
import styles from './ScoringPanel.module.css';

interface Score {
  total: number;
  voiceMotion: number;
  patternRecognition: number;
  playability: number;
  pattern?: string;
}

interface ScoringPanelProps {
  mode: 'building' | 'scored' | 'completed';
  noteCount?: number;
  canSubmit?: boolean;
  score?: Score;
  averageScore?: number;
  onSubmit: () => void;
  onNext: () => void;
  onTryAgain: () => void;
}

const getScoreClass = (score: number): string => {
  if (score >= 80) return styles.scoreHigh;
  if (score >= 60) return styles.scoreMedium;
  return styles.scoreLow;
};

const ScoringPanel: React.FC<ScoringPanelProps> = ({
  mode,
  noteCount = 0,
  canSubmit = false,
  score,
  averageScore,
  onSubmit,
  onNext,
  onTryAgain
}) => {
  if (mode === 'building') {
    return (
      <div className={styles.panel}>
        <div className={styles.noteCount}>
          {noteCount} notes selected
        </div>
        <button
          className={styles.submitButton}
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          Submit Voicing
        </button>
      </div>
    );
  }

  if (mode === 'scored' && score) {
    return (
      <div className={styles.panel}>
        <div className={`${styles.score} ${getScoreClass(score.total)}`}>
          {score.total}
        </div>

        <div className={styles.breakdown}>
          <div className={styles.component}>
            <span className={styles.label}>Voice Motion</span>
            <span className={styles.value}>{score.voiceMotion}</span>
          </div>
          <div className={styles.component}>
            <span className={styles.label}>
              Pattern{score.pattern ? `: ${score.pattern}` : ''}
            </span>
            <span className={styles.value}>{score.patternRecognition}</span>
          </div>
          <div className={styles.component}>
            <span className={styles.label}>Playability</span>
            <span className={styles.value}>{score.playability}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={onNext}>
            Next Chord
          </button>
          <button className={styles.secondaryButton} onClick={onTryAgain}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'completed' && averageScore !== undefined) {
    return (
      <div className={styles.panel}>
        <div className={styles.completionIcon}>🏆</div>
        <div className={`${styles.score} ${getScoreClass(averageScore)}`}>
          {averageScore}
        </div>
        <div className={styles.message}>
          {averageScore >= 80 ? 'Excellent!' : averageScore >= 60 ? 'Good work!' : 'Keep practicing!'}
        </div>
      </div>
    );
  }

  return null;
};

export default ScoringPanel;
```

### Step 4: Add CSS

Create `src/components/ScoringPanel/ScoringPanel.module.css`:

```css
.panel {
  background: #1A1A1A;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.noteCount {
  font-family: 'Inter', sans-serif;
  color: #EAE7DC;
  font-size: 16px;
  text-align: center;
}

.submitButton,
.primaryButton,
.secondaryButton {
  padding: 14px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submitButton,
.primaryButton {
  background: #C9A24D;
  color: #121212;
  border: none;
}

.submitButton:hover:not(:disabled),
.primaryButton:hover {
  background: #D4B05E;
}

.submitButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.secondaryButton {
  background: transparent;
  color: #EAE7DC;
  border: 1px solid #C9A24D;
}

.secondaryButton:hover {
  background: rgba(201, 162, 77, 0.1);
}

.score {
  font-family: 'Playfair Display', serif;
  font-size: 64px;
  text-align: center;
  font-weight: 700;
}

.scoreHigh {
  color: #7A9D7E;
}

.scoreMedium {
  color: #5B8FA3;
}

.scoreLow {
  color: #8B4D4D;
}

.breakdown {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.component {
  display: flex;
  justify-content: space-between;
  font-family: 'Inter', sans-serif;
  color: #EAE7DC;
}

.label {
  font-size: 14px;
}

.value {
  font-weight: 600;
  color: #C9A24D;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.completionIcon {
  font-size: 48px;
  text-align: center;
}

.message {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  color: #EAE7DC;
  text-align: center;
}
```

### Step 5: Run test to verify it passes

```bash
npm test -- ScoringPanel.test.tsx
```

Expected: PASS

### Step 6: Commit

```bash
git add src/components/ScoringPanel/
git commit -m "$(cat <<'EOF'
feat: add ScoringPanel with three display modes

- Building mode: Note counter + Submit button
- Scored mode: Score breakdown (motion, pattern, playability) + actions
- Completed mode: Trophy icon + average score + encouragement
- Color-coded scores (green 80+, blue 60-79, red <60)
- Jazz club styling with brass accents

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Main Trainer Component Integration

**Goal:** Integrate all components into main VoiceLeadingTrainer component

**Files:**
- Modify: `src/components/VoiceLeadingTrainer/VoiceLeadingTrainer.tsx`
- Modify: `src/components/VoiceLeadingTrainer/VoiceLeadingTrainer.test.tsx`

### Step 1: Write failing integration test

Add to `src/components/VoiceLeadingTrainer/VoiceLeadingTrainer.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import VoiceLeadingTrainer from './VoiceLeadingTrainer';

describe('VoiceLeadingTrainer - Redesign Integration', () => {
  test('renders three-column layout', () => {
    const { container } = render(<VoiceLeadingTrainer />);

    // Should have setup panel, keyboard area, scoring panel
    expect(screen.getByText('Setup')).toBeInTheDocument();
    expect(screen.getByText('Start Practice')).toBeInTheDocument();
  });

  test('full workflow: setup -> build -> submit -> next', () => {
    render(<VoiceLeadingTrainer />);

    // Step 1: Start practice
    fireEvent.click(screen.getByText('Start Practice'));

    // Should show first chord (preset, locked)
    expect(screen.getByText(/Build:/)).toBeInTheDocument();

    // Step 2: Select notes for second chord
    const key60 = screen.getByTestId('key-60');
    const key64 = screen.getByTestId('key-64');
    fireEvent.click(key60);
    fireEvent.click(key64);

    // Should enable Submit button
    const submitButton = screen.getByText('Submit Voicing');
    expect(submitButton).not.toBeDisabled();

    // Step 3: Submit
    fireEvent.click(submitButton);

    // Should show score
    expect(screen.getByText('Next Chord')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();

    // Step 4: Next chord
    fireEvent.click(screen.getByText('Next Chord'));

    // Should advance to third chord
    expect(screen.getByText(/Build:/)).toBeInTheDocument();
  });

  test('try again clears current voicing', () => {
    render(<VoiceLeadingTrainer />);

    fireEvent.click(screen.getByText('Start Practice'));

    // Select notes
    fireEvent.click(screen.getByTestId('key-60'));
    fireEvent.click(screen.getByTestId('key-64'));

    // Submit
    fireEvent.click(screen.getByText('Submit Voicing'));

    // Try again
    fireEvent.click(screen.getByText('Try Again'));

    // Should clear selection
    expect(screen.queryByText('2 notes selected')).not.toBeInTheDocument();
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- VoiceLeadingTrainer.test.tsx
```

Expected: FAIL - new workflow not implemented

### Step 3: Implement redesigned VoiceLeadingTrainer

In `src/components/VoiceLeadingTrainer/VoiceLeadingTrainer.tsx`:

```typescript
import React, { useState } from 'react';
import SetupPanel from '../SetupPanel/SetupPanel';
import KeyboardStack from '../KeyboardStack/KeyboardStack';
import ScoringPanel from '../ScoringPanel/ScoringPanel';
import { createTrainerState, addSelectedNote, removeSelectedNote, submitVoicing } from '../../lib/trainerState';
import { analyzeVoiceLeading } from '../../lib/voiceLeadingAnalysis';
import { getStarterVoicing } from '../../lib/starterVoicings';
import styles from './VoiceLeadingTrainer.module.css';

const VoiceLeadingTrainer: React.FC = () => {
  const [state, setState] = useState(createTrainerState());
  const [scoringMode, setScoringMode] = useState<'building' | 'scored' | 'completed'>('building');
  const [currentScore, setCurrentScore] = useState<any>(null);

  const handleStart = () => {
    // Get first chord preset voicing
    const starterVoicing = getStarterVoicing(state.key, state.startingStyle);

    setState({
      ...state,
      phase: 'building',
      startingVoicing: starterVoicing,
      lockedKeyboards: [{
        chordIndex: 0,
        notes: starterVoicing
      }],
      currentChordIndex: 1
    });
  };

  const handleNoteClick = (note: number) => {
    if (state.selectedNotes.includes(note)) {
      setState(removeSelectedNote(state, note));
    } else {
      setState(addSelectedNote(state, note));
    }
  };

  const handleSubmit = () => {
    // Calculate score
    const previousNotes = state.lockedKeyboards[state.lockedKeyboards.length - 1].notes;
    const score = analyzeVoiceLeading(previousNotes, state.selectedNotes);

    setCurrentScore(score);
    setScoringMode('scored');
  };

  const handleNext = () => {
    // Lock current voicing and advance
    const newState = submitVoicing(state);
    setState({
      ...newState,
      scores: [...state.scores, currentScore]
    });
    setScoringMode('building');
    setCurrentScore(null);

    // Check if progression complete
    if (newState.currentChordIndex >= 3) { // II-V-I = 3 chords
      setState({ ...newState, phase: 'completed' });
      setScoringMode('completed');
    }
  };

  const handleTryAgain = () => {
    setState({ ...state, selectedNotes: [] });
    setScoringMode('building');
    setCurrentScore(null);
  };

  const handleReset = () => {
    setState(createTrainerState());
    setScoringMode('building');
    setCurrentScore(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.column}>
        <SetupPanel
          phase={state.phase}
          progression={state.progression}
          keyName={state.key}
          startingStyle={state.startingStyle}
          onStart={handleStart}
          onReset={handleReset}
        />
      </div>

      <div className={styles.column}>
        {state.phase !== 'setup' && (
          <KeyboardStack
            lockedKeyboards={state.lockedKeyboards}
            currentNotes={state.selectedNotes}
            onNoteClick={handleNoteClick}
            targetChord={{ root: 'G', quality: '7' }} // TODO: Get from progression
          />
        )}
      </div>

      <div className={styles.column}>
        {state.phase !== 'setup' && (
          <ScoringPanel
            mode={scoringMode}
            noteCount={state.selectedNotes.length}
            canSubmit={state.selectedNotes.length >= 2}
            score={currentScore}
            averageScore={
              state.phase === 'completed'
                ? Math.round(state.scores.reduce((sum, s) => sum + s.total, 0) / state.scores.length)
                : undefined
            }
            onSubmit={handleSubmit}
            onNext={handleNext}
            onTryAgain={handleTryAgain}
          />
        )}
      </div>
    </div>
  );
};

export default VoiceLeadingTrainer;
```

### Step 4: Add three-column layout CSS

Create/modify `src/components/VoiceLeadingTrainer/VoiceLeadingTrainer.module.css`:

```css
.container {
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 30px;
  padding: 30px;
  background: #121212;
  min-height: 100vh;
}

.column {
  display: flex;
  flex-direction: column;
}

@media (max-width: 1024px) {
  .container {
    grid-template-columns: 1fr;
  }
}
```

### Step 5: Run test to verify it passes

```bash
npm test -- VoiceLeadingTrainer.test.tsx
```

Expected: PASS

### Step 6: Commit

```bash
git add src/components/VoiceLeadingTrainer/
git commit -m "$(cat <<'EOF'
feat: integrate redesigned VoiceLeadingTrainer with 3-column layout

- Three-column responsive grid (Setup | Keyboards | Scoring)
- Full workflow: setup -> build -> score -> next/try again -> complete
- Integrate SetupPanel, KeyboardStack, ScoringPanel
- State management with keyboard locking and score tracking
- Dark jazz club background

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Progression Playback Component

**Goal:** Sequential playback of completed progression on single keyboard

**Files:**
- Create: `src/components/ProgressionPlayback/ProgressionPlayback.tsx`
- Create: `src/components/ProgressionPlayback/ProgressionPlayback.test.tsx`

### Step 1: Write failing test for playback

Create `src/components/ProgressionPlayback/ProgressionPlayback.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import ProgressionPlayback from './ProgressionPlayback';

describe('ProgressionPlayback', () => {
  test('renders keyboard and play button', () => {
    const voicings = [
      [60, 64, 67],
      [62, 65, 69],
      [59, 62, 65]
    ];

    render(<ProgressionPlayback voicings={voicings} />);

    expect(screen.getByText('Play Progression')).toBeInTheDocument();
  });

  test('plays through voicings sequentially', async () => {
    const voicings = [
      [60, 64, 67],
      [62, 65, 69]
    ];

    const { container } = render(<ProgressionPlayback voicings={voicings} />);

    fireEvent.click(screen.getByText('Play Progression'));

    // Should highlight first voicing
    await screen.findByTestId('key-60');
    const key60 = screen.getByTestId('key-60');
    expect(key60).toHaveClass('active');
  });

  test('updates button text during playback', async () => {
    const voicings = [[60, 64, 67]];

    render(<ProgressionPlayback voicings={voicings} />);

    fireEvent.click(screen.getByText('Play Progression'));

    expect(screen.getByText('Playing...')).toBeInTheDocument();
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- ProgressionPlayback.test.tsx
```

Expected: FAIL - component not found

### Step 3: Implement ProgressionPlayback component

Create `src/components/ProgressionPlayback/ProgressionPlayback.tsx`:

```typescript
import React, { useState } from 'react';
import InteractiveKeyboard from '../InteractiveKeyboard/InteractiveKeyboard';
import { playVoicing } from '../../lib/audio';
import styles from './ProgressionPlayback.module.css';

interface ProgressionPlaybackProps {
  voicings: number[][];
  onComplete?: () => void;
}

const ProgressionPlayback: React.FC<ProgressionPlaybackProps> = ({
  voicings,
  onComplete
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const handlePlay = async () => {
    setIsPlaying(true);

    for (let i = 0; i < voicings.length; i++) {
      setCurrentIndex(i);
      await playVoicing(voicings[i]);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Pause between chords
    }

    setCurrentIndex(-1);
    setIsPlaying(false);
    onComplete?.();
  };

  return (
    <div className={styles.container}>
      <InteractiveKeyboard
        selectedNotes={currentIndex >= 0 ? voicings[currentIndex] : []}
        onNoteClick={() => {}}
        locked
      />

      <button
        className={styles.playButton}
        onClick={handlePlay}
        disabled={isPlaying}
      >
        {isPlaying ? 'Playing...' : 'Play Progression'}
      </button>
    </div>
  );
};

export default ProgressionPlayback;
```

### Step 4: Add minimal CSS

Create `src/components/ProgressionPlayback/ProgressionPlayback.module.css`:

```css
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.playButton {
  padding: 14px 28px;
  background: #C9A24D;
  color: #121212;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.playButton:hover:not(:disabled) {
  background: #D4B05E;
}

.playButton:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### Step 5: Run test to verify it passes

```bash
npm test -- ProgressionPlayback.test.tsx
```

Expected: PASS

### Step 6: Commit

```bash
git add src/components/ProgressionPlayback/
git commit -m "$(cat <<'EOF'
feat: add ProgressionPlayback component for completion review

- Sequential playback through all voicings
- Single keyboard with highlighted notes per chord
- Play button with disabled state during playback
- 1-second pause between chords for clarity

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Audio Integration

**Goal:** Wire up Tone.js for note clicks and voicing playback

**Files:**
- Modify: `src/lib/audio.ts`
- Modify: `src/components/InteractiveKeyboard/InteractiveKeyboard.tsx`
- Test: Manual (audio can't be unit tested easily)

### Step 1: Extend audio.ts with single note playback

In `src/lib/audio.ts`:

```typescript
// Add to existing audio.ts

let sampler: Tone.Sampler | null = null;

export async function initAudio() {
  if (!sampler) {
    sampler = new Tone.Sampler({
      urls: {
        C4: 'C4.mp3',
        'D#4': 'Ds4.mp3',
        'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',
      },
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
    }).toDestination();

    await Tone.loaded();
  }

  await Tone.start();
}

export function playNote(midiNote: number) {
  if (!sampler) return;

  const noteName = Tone.Frequency(midiNote, 'midi').toNote();
  sampler.triggerAttackRelease(noteName, '8n');
}

export async function playVoicing(notes: number[]) {
  if (!sampler) await initAudio();

  const noteNames = notes.map(n => Tone.Frequency(n, 'midi').toNote());
  sampler?.triggerAttackRelease(noteNames, '2n');
}
```

### Step 2: Wire up note clicks to audio

In `src/components/InteractiveKeyboard/InteractiveKeyboard.tsx`:

```typescript
import { playNote } from '../../lib/audio';

// In the button onClick handler:
onClick={() => {
  if (!locked) {
    playNote(note);
    onNoteClick(note);
  }
}}
```

### Step 3: Wire up submit to voicing playback

In `src/components/VoiceLeadingTrainer/VoiceLeadingTrainer.tsx`:

```typescript
import { playVoicing } from '../../lib/audio';

const handleSubmit = async () => {
  // Play the voicing
  await playVoicing(state.selectedNotes);

  // Calculate score
  const previousNotes = state.lockedKeyboards[state.lockedKeyboards.length - 1].notes;
  const score = analyzeVoiceLeading(previousNotes, state.selectedNotes);

  setCurrentScore(score);
  setScoringMode('scored');
};
```

### Step 4: Manual testing

```bash
npm start
```

Manual test checklist:
- [ ] Click piano keys plays individual notes
- [ ] Submit voicing plays full chord
- [ ] Progression playback plays sequentially
- [ ] Audio initializes on first interaction

### Step 5: Commit

```bash
git add src/lib/audio.ts src/components/InteractiveKeyboard/InteractiveKeyboard.tsx src/components/VoiceLeadingTrainer/VoiceLeadingTrainer.tsx
git commit -m "$(cat <<'EOF'
feat: integrate Tone.js audio for interactive feedback

- Add playNote for individual key clicks
- Extend playVoicing for chord playback on submit
- Wire InteractiveKeyboard to play notes on click
- Wire VoiceLeadingTrainer to play voicings on submit
- Use Salamander piano samples from Tone.js

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Unlock System - Style Unlocks

**Goal:** Extend keyProgress.ts to track voicing style unlocks

**Files:**
- Modify: `src/lib/keyProgress.ts`
- Test: `src/lib/keyProgress.test.ts`

### Step 1: Write failing test for style unlock tracking

Add to `src/lib/keyProgress.test.ts`:

```typescript
describe('Style Unlocks', () => {
  test('should start with Shell A unlocked', () => {
    const progress = createKeyProgress();
    expect(progress.unlockedStyles).toContain('Shell A');
  });

  test('should unlock Shell B after mastering Shell A in 3+ keys', () => {
    let progress = createKeyProgress();

    // Complete Shell A in C, F, G with high scores
    progress = completeKey(progress, 'C', 'Shell A', 75);
    progress = completeKey(progress, 'F', 'Shell A', 80);
    progress = completeKey(progress, 'G', 'Shell A', 78);

    progress = checkStyleUnlocks(progress);

    expect(progress.unlockedStyles).toContain('Shell B');
  });

  test('should unlock Rootless A & B after mastering shells in 5+ keys', () => {
    let progress = createKeyProgress();

    // Complete both shells in 5 keys
    ['C', 'F', 'G', 'D', 'Bb'].forEach(key => {
      progress = completeKey(progress, key, 'Shell A', 75);
      progress = completeKey(progress, key, 'Shell B', 75);
    });

    progress = checkStyleUnlocks(progress);

    expect(progress.unlockedStyles).toContain('Rootless A');
    expect(progress.unlockedStyles).toContain('Rootless B');
  });

  test('should not unlock if scores too low', () => {
    let progress = createKeyProgress();

    // Complete Shell A in 3 keys but with low scores
    progress = completeKey(progress, 'C', 'Shell A', 50);
    progress = completeKey(progress, 'F', 'Shell A', 55);
    progress = completeKey(progress, 'G', 'Shell A', 60);

    progress = checkStyleUnlocks(progress);

    expect(progress.unlockedStyles).not.toContain('Shell B');
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- keyProgress.test.ts
```

Expected: FAIL - functions not defined

### Step 3: Extend KeyProgress type and implement style unlocks

In `src/lib/keyProgress.ts`:

```typescript
export interface StyleCompletion {
  style: string;
  bestScore: number;
  completions: number;
}

export interface KeyProgress {
  unlockedKeys: string[];
  unlockedStyles: string[];
  completions: Map<string, StyleCompletion[]>; // key -> styles completed
}

export function createKeyProgress(): KeyProgress {
  return {
    unlockedKeys: ['C'],
    unlockedStyles: ['Shell A'],
    completions: new Map()
  };
}

export function completeKey(
  progress: KeyProgress,
  key: string,
  style: string,
  score: number
): KeyProgress {
  const completions = progress.completions.get(key) || [];
  const existingStyle = completions.find(c => c.style === style);

  if (existingStyle) {
    existingStyle.bestScore = Math.max(existingStyle.bestScore, score);
    existingStyle.completions += 1;
  } else {
    completions.push({
      style,
      bestScore: score,
      completions: 1
    });
  }

  progress.completions.set(key, completions);
  return progress;
}

export function checkStyleUnlocks(progress: KeyProgress): KeyProgress {
  const SCORE_THRESHOLD = 70;

  // Count keys with Shell A mastery
  let shellAKeys = 0;
  let shellBKeys = 0;

  progress.completions.forEach((styles) => {
    const shellA = styles.find(s => s.style === 'Shell A');
    const shellB = styles.find(s => s.style === 'Shell B');

    if (shellA && shellA.bestScore >= SCORE_THRESHOLD) shellAKeys++;
    if (shellB && shellB.bestScore >= SCORE_THRESHOLD) shellBKeys++;
  });

  const newUnlocks = [...progress.unlockedStyles];

  // Unlock Shell B after 3+ Shell A keys
  if (shellAKeys >= 3 && !newUnlocks.includes('Shell B')) {
    newUnlocks.push('Shell B');
  }

  // Unlock Rootless A & B after 5+ keys with both shells
  if (shellAKeys >= 5 && shellBKeys >= 5) {
    if (!newUnlocks.includes('Rootless A')) newUnlocks.push('Rootless A');
    if (!newUnlocks.includes('Rootless B')) newUnlocks.push('Rootless B');
  }

  return {
    ...progress,
    unlockedStyles: newUnlocks
  };
}
```

### Step 4: Run test to verify it passes

```bash
npm test -- keyProgress.test.ts
```

Expected: PASS

### Step 5: Commit

```bash
git add src/lib/keyProgress.ts src/lib/keyProgress.test.ts
git commit -m "$(cat <<'EOF'
feat: add voicing style unlock system to keyProgress

- Track style completions per key with best scores
- Unlock Shell B after mastering Shell A in 3+ keys (70+ score)
- Unlock Rootless A & B after mastering shells in 5+ keys
- Extend KeyProgress with unlockedStyles and StyleCompletion tracking

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Completion Screen Integration

**Goal:** Add completion screen with progression playback

**Files:**
- Modify: `src/components/VoiceLeadingTrainer/VoiceLeadingTrainer.tsx`
- Create: `src/components/CompletionScreen/CompletionScreen.tsx`

### Step 1: Write failing test for completion screen

Create `src/components/CompletionScreen/CompletionScreen.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import CompletionScreen from './CompletionScreen';

describe('CompletionScreen', () => {
  test('renders trophy and average score', () => {
    render(
      <CompletionScreen
        averageScore={85}
        voicings={[[60, 64, 67]]}
        onPracticeAgain={() => {}}
      />
    );

    expect(screen.getByText('🏆')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Excellent!')).toBeInTheDocument();
  });

  test('shows encouragement based on score', () => {
    const { rerender } = render(
      <CompletionScreen
        averageScore={85}
        voicings={[]}
        onPracticeAgain={() => {}}
      />
    );
    expect(screen.getByText('Excellent!')).toBeInTheDocument();

    rerender(
      <CompletionScreen
        averageScore={65}
        voicings={[]}
        onPracticeAgain={() => {}}
      />
    );
    expect(screen.getByText('Good work!')).toBeInTheDocument();

    rerender(
      <CompletionScreen
        averageScore={50}
        voicings={[]}
        onPracticeAgain={() => {}}
      />
    );
    expect(screen.getByText('Keep practicing!')).toBeInTheDocument();
  });

  test('renders progression playback and practice again button', () => {
    render(
      <CompletionScreen
        averageScore={75}
        voicings={[[60, 64, 67], [62, 65, 69]]}
        onPracticeAgain={() => {}}
      />
    );

    expect(screen.getByText('Play Progression')).toBeInTheDocument();
    expect(screen.getByText('Practice Again')).toBeInTheDocument();
  });
});
```

### Step 2: Run test to verify it fails

```bash
npm test -- CompletionScreen.test.tsx
```

Expected: FAIL - component not found

### Step 3: Implement CompletionScreen component

Create `src/components/CompletionScreen/CompletionScreen.tsx`:

```typescript
import React from 'react';
import ProgressionPlayback from '../ProgressionPlayback/ProgressionPlayback';
import styles from './CompletionScreen.module.css';

interface CompletionScreenProps {
  averageScore: number;
  voicings: number[][];
  onPracticeAgain: () => void;
}

const getEncouragement = (score: number): string => {
  if (score >= 80) return 'Excellent!';
  if (score >= 60) return 'Good work!';
  return 'Keep practicing!';
};

const getScoreClass = (score: number): string => {
  if (score >= 80) return styles.scoreHigh;
  if (score >= 60) return styles.scoreMedium;
  return styles.scoreLow;
};

const CompletionScreen: React.FC<CompletionScreenProps> = ({
  averageScore,
  voicings,
  onPracticeAgain
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.trophy}>🏆</div>

      <div className={`${styles.score} ${getScoreClass(averageScore)}`}>
        {averageScore}
      </div>

      <div className={styles.message}>
        {getEncouragement(averageScore)}
      </div>

      <ProgressionPlayback voicings={voicings} />

      <button className={styles.practiceButton} onClick={onPracticeAgain}>
        Practice Again
      </button>
    </div>
  );
};

export default CompletionScreen;
```

### Step 4: Add CSS

Create `src/components/CompletionScreen/CompletionScreen.module.css`:

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  padding: 40px;
}

.trophy {
  font-size: 72px;
}

.score {
  font-family: 'Playfair Display', serif;
  font-size: 80px;
  font-weight: 700;
}

.scoreHigh {
  color: #7A9D7E;
}

.scoreMedium {
  color: #5B8FA3;
}

.scoreLow {
  color: #8B4D4D;
}

.message {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  color: #EAE7DC;
}

.practiceButton {
  padding: 14px 28px;
  background: #C9A24D;
  color: #121212;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.practiceButton:hover {
  background: #D4B05E;
}
```

### Step 5: Integrate into VoiceLeadingTrainer

In `src/components/VoiceLeadingTrainer/VoiceLeadingTrainer.tsx`:

```typescript
import CompletionScreen from '../CompletionScreen/CompletionScreen';

// In the render, replace the completed mode scoring panel with:

{state.phase === 'completed' ? (
  <CompletionScreen
    averageScore={Math.round(state.scores.reduce((sum, s) => sum + s.total, 0) / state.scores.length)}
    voicings={state.lockedKeyboards.map(kb => kb.notes)}
    onPracticeAgain={handleReset}
  />
) : (
  // ... existing keyboard stack and scoring panel
)}
```

### Step 6: Run test to verify it passes

```bash
npm test -- CompletionScreen.test.tsx
```

Expected: PASS

### Step 7: Commit

```bash
git add src/components/CompletionScreen/ src/components/VoiceLeadingTrainer/VoiceLeadingTrainer.tsx
git commit -m "$(cat <<'EOF'
feat: add CompletionScreen with progression playback

- Trophy icon and color-coded average score display
- Encouragement message based on score (Excellent/Good/Keep practicing)
- Integrated ProgressionPlayback for reviewing full progression
- Practice Again button to restart session
- Jazz club styling with Playfair Display typography

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Enhanced Voice Leading Arrows - Curved Paths

**Goal:** Make arrows curved and visually polished

**Files:**
- Modify: `src/components/VoiceLeadingArrows/VoiceLeadingArrows.tsx`

### Step 1: Implement curved arrow paths

In `src/components/VoiceLeadingArrows/VoiceLeadingArrows.tsx`:

```typescript
// Replace the simple line path with curved bezier:

const VoiceLeadingArrows: React.FC<VoiceLeadingArrowsProps> = ({
  previousNotes,
  currentNotes
}) => {
  const motions = analyzeVoiceMotion(previousNotes, currentNotes);

  // Calculate positions based on note values
  const getXPosition = (note: number, index: number): number => {
    // Map MIDI note to x position across keyboard
    const keyboardWidth = 800; // Approximate width
    const noteRange = 35; // C3 to B5 = 36 notes
    const relativeNote = note - 48; // C3 = 48
    return (relativeNote / noteRange) * keyboardWidth;
  };

  return (
    <svg className={styles.arrowsContainer} height="80" width="100%" preserveAspectRatio="none">
      {motions.map((motion, index) => {
        const color = getColorForMotion(motion.semitones);

        const startX = getXPosition(motion.from, index);
        const endX = getXPosition(motion.to, index);
        const startY = 10;
        const endY = 70;

        // Curved bezier path
        const controlPointY = (startY + endY) / 2;
        const path = `M ${startX} ${startY} Q ${startX} ${controlPointY}, ${endX} ${endY}`;

        return (
          <g key={index}>
            <path
              d={path}
              stroke={color}
              strokeWidth="3"
              fill="none"
              opacity="0.8"
            />
            {/* Arrowhead */}
            <circle cx={endX} cy={endY} r="4" fill={color} />
          </g>
        );
      })}
    </svg>
  );
};
```

### Step 2: Test manually

```bash
npm start
```

Manual check:
- [ ] Arrows curve smoothly between keyboards
- [ ] Colors match motion types correctly
- [ ] Arrows don't overlap excessively

### Step 3: Commit

```bash
git add src/components/VoiceLeadingArrows/VoiceLeadingArrows.tsx
git commit -m "$(cat <<'EOF'
feat: enhance voice leading arrows with curved bezier paths

- Calculate x positions based on MIDI note values
- Use quadratic bezier curves for smooth visual flow
- Add circular arrowheads instead of triangle markers
- Semi-transparent strokes to reduce visual clutter

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Typography & Visual Polish

**Goal:** Apply Playfair Display and final styling touches

**Files:**
- Create: `public/index.html` (add Google Fonts)
- Modify: Various CSS modules

### Step 1: Add Google Fonts to HTML

In `public/index.html`:

```html
<head>
  <!-- ... existing tags ... -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
</head>
```

### Step 2: Apply typography globally

Create/modify `src/index.css`:

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #121212;
  color: #EAE7DC;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Playfair Display', serif;
}

button {
  font-family: 'Inter', sans-serif;
}
```

### Step 3: Verify typography across components

```bash
npm start
```

Manual visual check:
- [ ] Headings use Playfair Display
- [ ] Body text uses Inter
- [ ] Chord names in brass color
- [ ] Background is charcoal black

### Step 4: Commit

```bash
git add public/index.html src/index.css
git commit -m "$(cat <<'EOF'
feat: apply jazz club typography with Playfair Display and Inter

- Add Google Fonts (Playfair Display for headings, Inter for UI)
- Set global typography styles in index.css
- Background charcoal black (#121212) with off-white text (#EAE7DC)
- Complete visual design system implementation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: Integration Testing & Bug Fixes

**Goal:** End-to-end testing and polish

**Files:**
- Various (as needed for bug fixes)

### Step 1: Run full test suite

```bash
npm test
```

Expected: All tests passing

### Step 2: Manual integration testing

```bash
npm start
```

Test checklist:
- [ ] Setup panel: Select progression, key, style
- [ ] Start Practice: First chord appears locked
- [ ] Click keys: Audio plays, notes highlight
- [ ] Chord tone labels: Show correct intervals
- [ ] Submit: Score displays with breakdown
- [ ] Try Again: Clears current voicing
- [ ] Next Chord: Advances progression
- [ ] Voice leading arrows: Color-coded and curved
- [ ] Complete progression: Shows completion screen
- [ ] Play Progression: Sequential playback works
- [ ] Practice Again: Resets to setup
- [ ] Unlock system: Keys/styles locked correctly

### Step 3: Fix bugs as discovered

Document any bugs found and fix them with test-first approach.

### Step 4: Final commit

```bash
git add .
git commit -m "$(cat <<'EOF'
test: integration testing and bug fixes for redesigned trainer

- Verify full workflow from setup to completion
- Fix [list specific bugs found]
- Confirm audio, scoring, and unlocks work correctly
- Ready for manual QA

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 16: Documentation Update

**Goal:** Update docs to reflect redesign completion

**Files:**
- Modify: `docs/ROADMAP.md`
- Create: `docs/VOICE_LEADING_TRAINER.md` (user guide)

### Step 1: Create user guide

Create `docs/VOICE_LEADING_TRAINER.md`:

```markdown
# Voice Leading Trainer Guide

## Overview

The Voice Leading Trainer teaches smooth voice leading through interactive practice with II-V-I progressions. Build voicings chord-by-chord while receiving real-time feedback on voice motion, pattern recognition, and playability.

## How to Use

### 1. Setup Phase

- **Progression:** Start with II-V-I (more unlock later)
- **Key:** Select from unlocked keys (starts with C major)
- **Starting Style:** Choose voicing style (Shell A unlocked initially)
- **Starting Voicing:** Pick a specific preset to begin

Click **Start Practice** to begin.

### 2. Building Voicings

- First chord appears locked (your starting preset)
- Click piano keys to build the second chord
- Chord tone labels appear below keyboard: [♭3] [5] [♭7] [9]
- Each click plays the note
- Click **Submit Voicing** when ready (minimum 2 notes)

### 3. Scoring

After submit, you'll see:
- **Total Score** (0-100): Color-coded (green 80+, blue 60-79, red <60)
- **Voice Motion** (0-50): Rewards smooth movement (common tones, half-steps)
- **Pattern Recognition** (0-30): Detects jazz voicings (Shell A, Rootless B, etc.)
- **Playability** (0-20): Checks hand position and stretches

Choose:
- **Next Chord:** Lock voicing and continue
- **Try Again:** Clear and rebuild current chord

### 4. Voice Leading Arrows

Between keyboards, color-coded arrows show voice movement:
- 🟢 **Green:** Common tone (same note)
- 🔵 **Blue:** Half-step motion (smooth)
- 🟡 **Yellow:** Whole-step motion (medium)
- 🟠 **Orange:** Small leap (3-4 semitones)
- 🔴 **Red:** Large leap (5+ semitones)

### 5. Completion

After all chords:
- Trophy icon with average score
- Encouragement message
- **Play Progression:** Hear your full progression
- **Practice Again:** Restart with same settings

## Unlock System

### Keys (Circle of Fifths)
- Start: C major
- Complete C with 70+ score: Unlock F and G
- Continue: Bb/D, Eb/A, Ab/E, etc.

### Voicing Styles
- Start: Shell A
- Master Shell A in 3+ keys: Unlock Shell B
- Master both shells in 5+ keys: Unlock Rootless A & B

## Tips

- Aim for mostly green/blue arrows (smooth voice leading)
- Experiment with different patterns to discover voicings
- Higher scores unlock more content
- Listen to the audio—trust your ears!

---

**Built with:** React, TypeScript, Tone.js
**Design:** Jazz club theme (dark, warm, timeless)
```

### Step 2: Update ROADMAP.md

In `docs/ROADMAP.md`, mark Phase 7 as complete and add notes:

```markdown
## Phase 7: Voice Leading Trainer Redesign ✅

**Status:** Complete (Feb 2026)

**Delivered:**
- Direct piano-clicking interaction (not abstract roles)
- 3-column layout (Setup | Keyboards | Scoring)
- Vertical keyboard stacking with history
- Color-coded voice leading arrows (SVG)
- Phase 7 scoring algorithm integrated
- Dual unlock system (keys + styles)
- Completion screen with progression playback
- Jazz club visual design (Playfair Display, brass accents)

**Components Created:**
- InteractiveKeyboard, ChordToneLabels, VoiceLeadingArrows
- KeyboardStack, SetupPanel, ScoringPanel, CompletionScreen
- ProgressionPlayback

**Files Modified:**
- Extended trainerState.ts, keyProgress.ts
- Integrated audio.ts with Tone.js
```

### Step 3: Commit

```bash
git add docs/
git commit -m "$(cat <<'EOF'
docs: add Voice Leading Trainer user guide and update roadmap

- Create comprehensive user guide with usage instructions
- Explain scoring system, unlock progression, visual cues
- Mark Phase 7 redesign as complete in roadmap
- Document all new components and features

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Completion

**Plan complete and saved to `docs/plans/2026-02-04-voice-leading-trainer-implementation.md`**

Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
