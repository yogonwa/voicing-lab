# Voicing Lab - Design & Implementation Document

**Version:** 3.0  
**Last Updated:** December 2025  
**Status:** Phase 4 (Playground Mode v2) in progress

---

## Table of Contents

1. [Project Vision](#project-vision)
2. [Product Philosophy](#product-philosophy)
3. [Technical Architecture](#technical-architecture)
4. [Feature Specifications](#feature-specifications)
5. [Business Rules & Invariants](#business-rules--invariants)
6. [UI/UX Specifications](#uiux-specifications)
7. [Implementation Notes](#implementation-notes)
8. [Success Criteria](#success-criteria)
9. [Open Questions & Decisions](#open-questions--decisions)

---

## Project Vision

### Problem Statement
Intermediate piano players know basic chords but can't make them sound "jazzy" in real-time. They play blocky, root-position voicings and don't know how to voice lead smoothly or add sophistication.

### Solution
An interactive web tool that teaches jazz piano voicing through visual exploration and decision-making, building muscle memory for hand positions and voice-leading patterns.

### Core User Goal
"I see a lead sheet → I instantly know where to put my hands to play full, jazzy voicings with smooth voice leading"

---

## Product Philosophy

### What This Tool Is
- **Harmonic vocabulary builder** - learn different voicing types
- **Pattern recognition trainer** - build automatic hand position memory
- **Interactive exploration tool** - discover what sounds good
- **Progressive learning system** - simple → complex over time

### What This Tool Is NOT
- Not a melody-matching tool (that's v2+)
- Not a rhythm/syncopation trainer (that's v3+)
- Not a full DAW or composition tool
- Not focused on reading sheet music in real-time

### Learning Approach
**Breadth first, then depth** - expose users to many voicing types in context, organized as a progression ladder from simple to complex.

---

## Technical Architecture

### Stack
- **Frontend:** React + TypeScript
- **Audio:** Tone.js (sample-based piano playback)
- **Styling:** Component-scoped CSS (Tailwind removed)
- **Deployment:** Static site (Vercel/Netlify)

### Core Data Structures

```typescript
// Note representation
type NoteName = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B";
type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type Note = `${NoteName}${Octave}`;

// Chord representation
interface Chord {
  root: NoteName;
  quality: "maj7" | "min7" | "dom7" | "min7b5" | "dim7";
}

// Chord tones (algorithm output)
interface ChordTones {
  root: NoteName;
  third: NoteName;
  fifth: NoteName;
  seventh: NoteName;
}

// Extended chord tones
interface ExtendedChordTones extends ChordTones {
  extensions?: {
    ninth?: NoteName;
    eleventh?: NoteName;
    thirteenth?: NoteName;
    sharpEleventh?: NoteName;
  };
  alterations?: {
    flatNinth?: NoteName;
    sharpNinth?: NoteName;
    flatThirteenth?: NoteName;
  };
}

// Voicing template
type VoicingRole = "root" | "third" | "fifth" | "seventh" | "ninth" | "flatNinth" | "sharpNinth" | 
                   "eleventh" | "sharpEleventh" | "thirteenth" | "flatThirteenth";

interface VoicingTemplate {
  name: string;
  type: "shell" | "open" | "rootless" | "drop2" | "quartal";
  leftHand: VoicingRole[];
  rightHand: VoicingRole[];
  octaves: {
    leftHandBase: Octave;
    rightHandBase: Octave;
  };
}

// Final voicing
interface VoicedChord {
  leftHand: Note[];
  rightHand: Note[];
}

// Playground block
interface PlaygroundBlock {
  id: string;
  voicingRole: VoicingRole;
  note: NoteName;
  enabled: boolean;
}
```

### Two-Layer Algorithm System

**Layer 1: Chord Note Generator**
Calculates which notes are in a chord (pure music theory).

```typescript
function getChordTones(chord: Chord): ChordTones {
  const intervals = CHORD_FORMULAS[chord.quality];
  
  return {
    root: chord.root,
    third: calculateNote(chord.root, intervals.third),
    fifth: calculateNote(chord.root, intervals.fifth),
    seventh: calculateNote(chord.root, intervals.seventh),
  };
}

// Chord formulas in semitones
const CHORD_FORMULAS = {
  maj7: { third: 4, fifth: 7, seventh: 11 },
  min7: { third: 3, fifth: 7, seventh: 10 },
  dom7: { third: 4, fifth: 7, seventh: 10 },
  min7b5: { third: 3, fifth: 6, seventh: 10 },
  dim7: { third: 3, fifth: 6, seventh: 9 }
};
```

**Layer 2: Voicing Templates**
Defines where notes go on the piano (hand positions).

```typescript
const SHELL_POSITION_A: VoicingTemplate = {
  name: "Shell Position A",
  type: "shell",
  leftHand: ["root"],
  rightHand: ["third", "seventh"],
  octaves: { leftHandBase: 2, rightHandBase: 3 }
};
```

---

## Feature Specifications

All features are numbered sequentially for cross-reference with [ROADMAP.md](ROADMAP.md).

### Phase 1: Foundation (Completed ✅)

#### F1.1: Chord Calculator Algorithm ✅
**Purpose:** Calculate notes in any chord using semitone intervals.

**Implementation:**
- `src/lib/chordCalculator.ts`
- Chromatic scale array for pitch class math
- Chord formulas as semitone offsets
- `getChordTones()` and `getExtendedChordTones()` functions

**Status:** Complete

---

#### F1.2: Voicing Templates ✅
**Purpose:** Define standard jazz voicing patterns (shells, open, rootless, drop-2).

**Implementation:**
- `src/lib/voicingTemplates.ts`
- Template definitions for each voicing type
- Hand role assignments (LH/RH)
- Base octave specifications

**Status:** Complete

---

#### F1.3: Audio Playback (Tone.js) ✅
**Purpose:** Play voicings and progressions with realistic piano sound.

**Implementation:**
- `src/lib/audioEngine.ts` (audio-only module)
- Tone.js sampler with piano samples
- `playVoicing()`, `playArpeggio()`, `playProgression()` functions
- Browser audio context handling

**Status:** Complete

---

#### F1.4: Piano Keyboard Visualization ✅
**Purpose:** Visual representation of voicings on piano keyboard.

**Implementation:**
- `src/components/PianoKeyboard/PianoKeyboard.tsx`
- SVG-based keyboard (C2-C6 range)
- Color-coded note highlighting by role
- Active note display with labels

**Status:** Complete

---

### Phase 2: Template Mode (Completed ✅)

#### F2.1: Extension System (9/11/13) ✅
**Purpose:** Add jazz extensions (9ths, 11ths, 13ths) to voicings.

**Implementation:**
- Extended `ChordTones` interface with extensions and alterations
- Extension intervals (semitones from root)
- Quality-aware extension availability

**Key Code:**
```typescript
const EXTENSION_INTERVALS = {
  ninth: 14,          // Octave + major 2nd
  eleventh: 17,       // Octave + perfect 4th
  thirteenth: 21,     // Octave + major 6th
  sharpEleventh: 18,  // Octave + augmented 4th
};
```

**Status:** Complete

---

#### F2.2: Extension Checkboxes UI ✅
**Purpose:** Allow users to toggle extensions on/off in Template Mode.

**Implementation:**
- `src/components/ChordExplorer/ExtensionPanel.tsx`
- Grouped by degree (9ths, 11ths, 13ths)
- Quality-aware filtering (don't show invalid extensions)

**Status:** Complete

---

#### F2.3: Quality-Aware Extension Rules ✅
**Purpose:** Prevent dissonant extensions that clash with chord tones.

**Business Rule:**
```typescript
const AVOID_EXTENSIONS: Record<ChordQuality, ExtensionRole[]> = {
  maj7:   ["eleventh"],   // Natural 11 clashes with major 3rd
  min7:   ["thirteenth"], // Natural 13 clashes with minor context
  dom7:   ["eleventh"],   // Natural 11 clashes - use #11 instead
  min7b5: ["thirteenth"], // 13 clashes in half-dim context
  dim7:   ["thirteenth"], // 13 clashes in dim context
};
```

**Status:** Complete

---

#### F2.4: Extension Tips & Warnings ✅
**Purpose:** Educate users about appropriate extension use.

**Implementation:**
- `src/lib/extensionConfig.ts` contains tips
- Context-sensitive warnings (e.g., "11th clashes with major 3rd")
- Function-appropriate recommendations (ii gets 11th, V gets alterations)

**Status:** Complete

---

### Phase 3: Playground Mode v1 (Completed ✅)

#### F3.1: Mode Toggle (Template ↔ Playground) ✅
**Purpose:** Switch between structured templates and free exploration.

**Implementation:**
- Mode state in `ChordExplorer.tsx`
- Conditional rendering of ExtensionPanel vs. PlaygroundPanel
- Mode persists during session

**Status:** Complete

---

#### F3.2: Drag-and-Drop Blocks (@dnd-kit) ✅
**Purpose:** Allow users to reorder chord tone blocks by dragging.

**Implementation:**
- `@dnd-kit/core` and `@dnd-kit/sortable`
- Horizontal list sorting strategy
- Keyboard and pointer sensor support
- Smooth animations

**Status:** Complete

---

#### F3.3: Toggle Blocks On/Off ✅
**Purpose:** Enable/disable individual chord tones.

**Implementation:**
- Click handler on blocks
- Visual feedback (dimmed when disabled)
- Keyboard and audio skip disabled blocks

**Status:** Complete

---

#### F3.4: Preset Buttons (Shell A/B, Open, Rootless A/B, Drop-2) ✅
**Purpose:** Quick-load standard voicing patterns.

**Presets:**
- Shell A (1-3-7)
- Shell B (1-7-3)
- Open (1-5-3-7)
- Rootless A (3-5-7-9)
- Rootless B (7-9-3-5)
- Drop 2 (5-1-3-7)

**Implementation:**
- `playgroundUtils.ts` - preset configurations
- Animated block reordering on preset load
- Reset button to return to default

**Status:** Complete

---

#### F3.5: Octave Placement Algorithm ✅
**Purpose:** Intelligently distribute notes across octaves based on drag order.

**Core Principle:** User drag order (left→right) = pitch order (low→high), with octave wrapping when chromatic pitch decreases.

**Implementation:**
- `src/components/ChordExplorer/playgroundUtils.ts`
- See [OctavePlacement.md](OctavePlacement.md) for detailed algorithm spec
- Enforces global rules (min spread, max spread, muddy bass avoidance)
- Root-lowest enforcement when root is leftmost enabled block

**Status:** Complete

---

#### F3.6: Min-2-Blocks Constraint ✅
**Purpose:** Prevent empty or single-note voicings.

**Implementation:**
- Validation in toggle handler
- Warning message when user tries to disable below 2 notes
- "At least 2 notes required" feedback

**Status:** Complete

---

### Phase 4: Playground Mode v2 (In Progress 🚧)

#### F4.1: Hand Mode Toggle (Single | Two) 🚧
**Purpose:** Switch between single-hand (learning shapes) and two-hand (comping) contexts.

**User-Facing:**
- Toggle button: `Single Hand` | `Two Hands`
- Default: Two Hands
- Filters available presets per mode

**Implementation:**
```typescript
type HandMode = 'single' | 'two';

interface PlaygroundPreset {
  id: string;
  name: string;
  handMode: HandMode | 'both';
  blockOrder: VoicingRole[];
  dividerIndex?: number; // For two-hand mode
}
```

**Files to Modify:**
- `PlaygroundPanel.tsx` - add toggle UI
- `playgroundUtils.ts` - `voiceForHandMode()` function
- Preset definitions with hand mode filter

**Status:** In Progress

---

#### F4.2: Single-Hand Presets (Triads + 7th Inversions) 🚧
**Purpose:** Teach close-position shapes for single-hand playing.

**Presets to Add:**
- Triad (1-3-5)
- Triad 1st Inversion (3-5-1)
- Triad 2nd Inversion (5-1-3)
- 7th Close Position (1-3-5-7)
- 7th 1st Inversion (3-5-7-1)
- 7th 2nd Inversion (5-7-1-3)
- 7th 3rd Inversion (7-1-3-5)

**Octave Logic:**
- All notes in close position within single octave (e.g., C4-B4)
- No octave wrapping (inversions are intentional)
- Follow existing octave placement rules (see [OctavePlacement.md](OctavePlacement.md))

**Status:** In Progress

---

#### F4.3: Two-Hand Divider (Fixed, Snap-to-Block) 🚧
**Purpose:** Visually separate LH and RH notes in two-hand mode.

**User-Facing:**
- Fixed vertical line between blocks
- Snaps to block boundaries (not freely draggable)
- Notes left of divider = LH
- Notes right of divider = RH

**Octave Logic:**
- LH: lower register (C2-C4 suggested, see OctavePlacement.md)
- RH: higher register (C4-C6 suggested, see OctavePlacement.md)
- Muddy bass rules apply more strictly to LH

**Files to Modify:**
- `PlaygroundPanel.tsx` - divider UI
- `playgroundUtils.ts` - hand-aware voicing logic

**Status:** In Progress

---

#### F4.4: Enharmonic Chord Symbol Display 📋
**Purpose:** Display conventional flat spellings (Bb, Eb) in chord symbols instead of sharps-only.

**Scope:** Chord symbol display only (e.g., "C7" → "C7" with Bb implied, "A#7" → "Bb7")

**Rationale:** Note blocks keep internal sharp-only representation to avoid confusion when debugging.

**Implementation:**
```typescript
const ENHARMONIC_MAP: Record<NoteName, string> = {
  'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb',
  'G#': 'Ab', 'A#': 'Bb',
};

function getDisplayChordSymbol(chord: Chord): string {
  const baseSymbol = buildChordSymbol(chord);
  const flatPreferred = ['A#', 'D#', 'G#'];
  if (flatPreferred.includes(chord.root)) {
    return baseSymbol.replace(chord.root, ENHARMONIC_MAP[chord.root]);
  }
  return baseSymbol;
}
```

**Files to Modify:**
- `chordCalculator.ts` - add `getDisplayChordSymbol()`
- `ChordExplorer.tsx` - use for chord name header

**Status:** Planned

---

### Phase 5: Extensions in Playground (Planned 📋)

#### F5.1: Multi-State Extension Blocks (Off → 9 → ♭9 → ♯9) 📋
**Purpose:** Allow users to toggle between natural, flat, and sharp extensions.

**Rationale:** User cannot enable 9, ♭9, and ♯9 at same time (they're mutually exclusive). Multi-state block enforces this constraint.

**UI Concept:** Vertical toggle (like Price is Right wheel) that cycles through states.

**States per Extension:**
- **9th block:** Off → 9 → ♭9 → ♯9 → Off
- **11th block:** Off → 11 → ♯11 → Off
- **13th block:** Off → 13 → ♭13 → Off

**Implementation:**
```typescript
interface PlaygroundBlock {
  id: string;
  voicingRole: VoicingRole;
  note: NoteName;
  enabled: boolean;
  alteration?: 'natural' | 'flat' | 'sharp'; // For extensions
}
```

**Files to Modify:**
- `PlaygroundPanel.tsx` - multi-state block UI
- `playgroundUtils.ts` - extension state handling
- Block component - vertical toggle interaction

**Status:** Planned

---

#### F5.2: Extension Blocks UI (Vertical Toggle) 📋
**Purpose:** Visual design for multi-state extension blocks.

**Design:**
- Block shows current state (9, ♭9, or ♯9)
- Click cycles through states
- Vertical indicator shows available states
- Color coding for alterations (natural = blue, flat = yellow, sharp = red)

**Status:** Planned

---

#### F5.3: Extension Integration with Presets 📋
**Purpose:** Presets can include extensions (e.g., "Shell A + 9th").

**New Presets:**
- Shell A + 9th (1-3-7-9)
- Rootless A (3-5-7-9) - already exists
- Rootless B (7-9-3-5) - already exists
- Shell Altered (1-3-7-♭9-♯11) for V7 chords

**Status:** Planned

---

### Phase 6: Context-Aware Recognition (Planned 📋)

#### F6.1: Voicing Pattern Detection Algorithm 📋
**Purpose:** Recognize when user has built a standard voicing pattern.

**Algorithm:**
```typescript
function detectVoicingPattern(blocks: PlaygroundBlock[]): VoicingPattern | null {
  const enabledRoles = blocks.filter(b => b.enabled).map(b => b.voicingRole);
  
  for (const pattern of VOICING_PATTERNS) {
    if (matchesPattern(enabledRoles, pattern.pattern)) {
      return pattern;
    }
  }
  return null;
}
```

**Files to Create:**
- `src/lib/voicingRecognition.ts` - pattern detection
- `src/lib/patterns.ts` - pattern definitions

**Status:** Planned

---

#### F6.2: Pattern Library (Shell A/B, Drop-2, Rootless, Inversions) 📋
**Purpose:** Define recognizable voicing patterns with explanations.

**Patterns:**
```typescript
const VOICING_PATTERNS: VoicingPattern[] = [
  {
    id: 'drop-2',
    name: 'Drop-2 Voicing',
    pattern: ['fifth', 'root', 'third', 'seventh'],
    description: 'Close-position chord with 2nd voice dropped an octave.',
    whyItWorks: 'Opens up the voicing for better clarity and hand span.',
    commonUse: 'Comping, solo piano, guitar adaptations.',
  },
  {
    id: 'shell-a',
    name: 'Shell A (Guide Tones)',
    pattern: ['root', 'third', 'seventh'],
    whyItWorks: '3rd defines quality, 7th defines chord type.',
    commonUse: 'Left-hand comping, voice leading practice.',
  },
  {
    id: 'slash-3',
    name: '1st Inversion / Slash-3',
    pattern: ['third', '*', '*', 'root'],
    description: 'Third in the bass creates slash chord.',
    caution: 'Can sound unstable without bassist covering root.',
  },
  // ... more patterns
];
```

**Status:** Planned

---

#### F6.3: Insight Card UI ("You found a Drop-2!") 📋
**Purpose:** Non-intrusive notification when pattern is detected.

**UI Design:**
- Small card/tooltip appears when pattern recognized
- Shows pattern name, description, why it works
- "Learn more" link to deeper explanation
- Dismissible

**Example:**
> 🎹 **You found a Drop-2 voicing!**  
> This is created by taking a close-position chord and dropping the 2nd voice from the top down an octave.  
> **Why it works**: Opens up the voicing for better clarity and hand span.  
> **Common use**: Comping, solo piano, guitar adaptations.

**Files to Create:**
- `src/components/InsightCard/InsightCard.tsx`

**Status:** Planned

---

#### F6.4: Educational Explanations & Tips 📋
**Purpose:** Provide context-sensitive learning content.

**Content Types:**
- Why this voicing works
- When to use it
- Common use cases
- Cautions or caveats
- Related patterns

**Status:** Planned

---

### Phase 7: Decision Tree Navigator (Planned 📋)

#### F7.1: Decision Tree Data Structure 📋
**Purpose:** Build interactive navigation tree for voice leading choices.

**Data Structure:**
```typescript
interface DecisionNode {
  chord: Chord;
  chordFunction: "ii" | "V" | "I";
  selectedVoicing?: Voicing;
  availableOptions: VoicingOption[];
  previousNode?: DecisionNode;
  nextNode?: DecisionNode;
}

interface VoicingOption {
  voicing: Voicing;
  recommendation: "best" | "good" | "alternative";
  voiceLeadingInfo: VoiceLeadingInfo;
}
```

**Scope:** Works with template voicings only (not playground custom voicings).

**Status:** Planned

---

#### F7.2: Voice Leading Analysis Algorithm 📋
**Purpose:** Analyze smoothness of voice movement between voicings.

**Algorithm:**
```typescript
function analyzeVoiceLeading(from: Voicing, to: Voicing): VoiceLeadingInfo {
  // Compare each voice's movement
  // Categorize as: common tone, half-step, whole-step, large interval
  // Calculate smoothness score (0-100)
  // Generate explanation text
  
  return {
    commonTones: number,
    halfSteps: number,
    wholeSteps: number,
    largeIntervals: number,
    smoothnessScore: number,
    explanation: string
  };
}
```

**Status:** Planned

---

#### F7.3: Hover-to-Preview Interaction 📋
**Purpose:** Show preview of voicing option on hover.

**Interaction:**
- Hover over option button
- Preview keyboard appears below (faded)
- Arrows show note movement
- Explanation text appears
- Click to commit

**Status:** Planned

---

#### F7.4: Voice Movement Arrows 📋
**Purpose:** Visualize how notes move from current to next voicing.

**Arrow Types:**
- Green = common tone (stays)
- Blue = half-step (smooth)
- Yellow = whole-step (medium)
- Red = large interval (dramatic)

**Status:** Planned

---

#### F7.5: Smoothness Score & Explanations 📋
**Purpose:** Quantify and explain voice leading quality.

**Scoring:**
```typescript
function calculateSmoothness(movements: NoteMovement[]): number {
  let score = 100;
  movements.forEach(m => {
    if (m.type === "common") score += 0;
    else if (m.type === "halfStep") score -= 5;
    else if (m.type === "wholeStep") score -= 15;
    else score -= 30; // Large jump
  });
  return Math.max(0, Math.min(100, score));
}
```

**Status:** Planned

---

### Phase 8: Future Ideas (v3+ 💡)

#### F8.1: Melody Lock (Top Note Focus) 💡
**Purpose:** Lock a specific note as the top voice, explore voicings with that melody note on top.

**UI:**
- Toggle: "Melody Lock" on/off
- Click any block to lock it as top note
- Blocks auto-reorder to place target on top
- Tips explain musical effect of each top note

**Status:** Future idea

---

#### F8.2: Live Drop-2 Transformation Animation 💡
**Purpose:** Apply Drop-2 transformation to any block arrangement with visual animation.

**Interaction:**
- User arranges blocks (e.g., R-3-5-7)
- User clicks "Apply Drop-2" button
- Animation shows 2nd-from-top block dropping down an octave
- Result: 5-R-3-7

**Status:** Future idea

---

#### F8.3: Slash Chord / Bass Note Selector 💡
**Purpose:** Explicit bass note selection for slash chords (C7/E, C7/G).

**UI:**
- Bass note selector in two-hand mode
- LH plays bass note, RH plays voicing
- Chord symbol updates: "C7/E"

**Status:** Future idea

---

#### F8.4: Performance Context Toggle (Solo | With Bassist) 💡
**Purpose:** Adjust voicing recommendations based on performance context.

**Contexts:**
- Solo Piano: root important, full harmony
- With Bassist: rootless preferred, bassist covers root

**Status:** Future idea

---

#### F8.5: Build This Voicing Challenges (Gamification) 💡
**Purpose:** Guided challenges to practice building specific voicings.

**Flow:**
- System prompts: "Can you build a Drop-2 voicing?"
- User drags blocks to match
- Success = celebration + explanation
- Progressive difficulty

**Status:** Future idea

---

## Business Rules & Invariants

### Playground Mode Invariants

**User Drag Order is Truth**
- Visual block order (left→right) = audible pitch order (low→high)
- System will NOT silently reorder notes
- Octave placement follows drag order with intelligent wrapping (see [OctavePlacement.md](OctavePlacement.md))

**Root Warning, Not Correction**
- If root note is enabled but NOT leftmost block: show warning "Root should be lowest for clear harmony"
- Audio playback respects user's drag order even if root is not lowest pitch
- Root-lowest rule only enforced by default when root IS leftmost enabled block

**Minimum 2 Blocks Required**
- At least 2 enabled blocks required for valid voicing
- Attempting to disable below 2 shows warning: "At least 2 notes required"
- Prevents empty or single-note "voicings"

### Extension Rules

**Quality-Based Avoid Rules**
These extensions create dissonant clashes with chord tones:

```typescript
const AVOID_EXTENSIONS: Record<ChordQuality, ExtensionRole[]> = {
  maj7:   ["eleventh"],   // Natural 11 is half-step from major 3rd
  min7:   ["thirteenth"], // Natural 13 clashes with minor context
  dom7:   ["eleventh"],   // Natural 11 is half-step from major 3rd (use #11)
  min7b5: ["thirteenth"], // 13 clashes in half-dim context
  dim7:   ["thirteenth"], // 13 clashes in dim context
};
```

**Function-Appropriate Extensions**

| Function | Common Extensions | Avoid | Sound |
|----------|-------------------|-------|-------|
| **ii** | 9th, 11th | 13th | Lush, suspended |
| **V** | 9th, 13th, alterations | 11th | Bright, tension |
| **I** | 9th, #11, 6th | 11th | Modern, Lydian |

### Octave Placement Rules

See [OctavePlacement.md](OctavePlacement.md) for complete specification.

**Global Rules (Immutable):**
1. Root lowest when leftmost enabled block
2. Minimum spread = 1 octave (exceptions: 2-note chords, 3-note shells)
3. Maximum spread = 2.5 octaves (C3-B6)
4. No close intervals in bass (< perfect 4th below C4)
5. Maximum top note = B6

**Contextual Rules:**
- Target spread adjusts by note count (3 notes = ~7 semitones, 6+ notes = 30 semitones)
- Octave wrapping when chromatic pitch decreases
- Base octave depends on voicing density

---

## UI/UX Specifications

### Visual Design System

**Color Palette:**
```css
/* Hand colors on keyboard */
--lh-color: #EF4444;      /* red-500 - Left Hand */
--rh-color: #3B82F6;      /* blue-500 - Right Hand */

/* Role colors (chord tones) */
--root-color: #EF4444;    /* red */
--third-color: #3B82F6;   /* blue */
--fifth-color: #10B981;   /* green */
--seventh-color: #8B5CF6; /* purple */
--extension-color: #F59E0B; /* amber */

/* Arrow colors (voice movement) */
--common-tone: #10B981;   /* green - No movement */
--half-step: #3B82F6;     /* blue - Smooth */
--whole-step: #F59E0B;    /* amber - Medium */
--large-interval: #EF4444; /* red - Dramatic jump */
```

**Typography:**
- Headings: System font stack (SF Pro, Segoe UI)
- Monospace for note names: `font-mono`
- Body: `font-sans`

### Piano Keyboard Component

**Visual Specs:**
- Display range: C2-C6 (4 octaves)
- White keys: 20px wide × 100px tall
- Black keys: 12px wide × 60px tall
- Highlighted keys: Solid fill with role color
- Labels: Show note name + role on hover

### Playground Block Component

**Visual States:**
- **Enabled:** Bright color, raised shadow, draggable
- **Disabled:** Desaturated (40% opacity), inset shadow
- **Dragging:** Lifted, larger shadow, slight scale up
- **Drop Target:** Gap opens between blocks

### Interaction Behaviors

**Drag Behavior:**
1. Pointer down → slight lift animation (100ms)
2. Drag → block follows cursor, others shift
3. Drop → blocks reorder with spring animation (200ms)

**Toggle Behavior:**
1. Click → toggle enabled state
2. Visual → disabled blocks fade to 40% opacity
3. Constraint → min 2 blocks enforced
4. Feedback → warning tooltip if constraint violated

---

## Implementation Notes

### Files Likely to Change Per Feature

| Feature | Primary Files |
|---------|---------------|
| F4.1-F4.3 (Hand Mode) | `PlaygroundPanel.tsx`, `playgroundUtils.ts`, preset definitions |
| F4.4 (Enharmonic) | `chordCalculator.ts`, `ChordExplorer.tsx` |
| F5.1-F5.3 (Extensions) | `PlaygroundPanel.tsx`, block component, `playgroundUtils.ts` |
| F6.1-F6.4 (Recognition) | New: `voicingRecognition.ts`, `InsightCard.tsx`, `patterns.ts` |
| F7.1-F7.5 (Decision Tree) | New: `DecisionTree.tsx`, `voiceLeading.ts`, `VoicingOption.tsx` |

### Dependencies

**Required:**
- React 18+
- TypeScript 5+
- Tone.js (audio)
- @dnd-kit/core + @dnd-kit/sortable (drag-drop)

**Bundle Size:**
- @dnd-kit: ~17KB gzipped
- Tone.js: ~50KB gzipped
- Total acceptable for functionality gained

### Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Touch devices supported via PointerSensor
- IE11 not supported

---

## Success Criteria

### Functional Criteria

**Phase 1-3 (Completed):**
- ✅ Can switch between Template and Playground modes
- ✅ Blocks are draggable and reorder correctly
- ✅ Blocks can be toggled on/off with click
- ✅ Keyboard display updates in real-time
- ✅ Audio plays notes in current block order
- ✅ Arpeggio respects block order
- ✅ Presets load correct arrangements
- ✅ At least 2 blocks must remain enabled

**Phase 4 (In Progress):**
- [ ] Can toggle between single-hand and two-hand modes
- [ ] Single-hand presets show triads and 7th inversions
- [ ] Two-hand divider clearly separates LH/RH
- [ ] Chord symbols display with conventional enharmonic spelling

**Phase 5 (Planned):**
- [ ] Extension blocks cycle through natural/flat/sharp states
- [ ] Cannot enable conflicting extensions simultaneously
- [ ] Presets include extensions

**Phase 6 (Planned):**
- [ ] System recognizes when user builds standard voicing
- [ ] Insight card appears with helpful explanation
- [ ] Can dismiss insights without disrupting workflow

**Phase 7 (Planned):**
- [ ] Can navigate through decision tree making voicing choices
- [ ] Hover shows clear preview with movement visualization
- [ ] Voice leading analysis is accurate and informative

### Educational Criteria

**Phase 1-3 (Completed):**
- ✅ User can discover that order affects sound
- ✅ User can hear effect of omitting notes (e.g., no 5th)
- ✅ Presets teach standard voicing patterns

**Phase 4-6 (Planned):**
- [ ] User learns inversion shapes (single-hand mode)
- [ ] User understands LH/RH split in two-hand voicings
- [ ] User discovers standard voicings through exploration
- [ ] System provides just-in-time learning when patterns recognized

**Phase 7 (Planned):**
- [ ] User understands why certain voicings connect smoothly
- [ ] User explores multiple voice-leading paths
- [ ] User builds decision-making intuition

### UX Quality Criteria

**Current:**
- ✅ Drag animations feel smooth (60fps)
- ✅ Toggle feedback is immediate
- ✅ Accessible via keyboard navigation

**Pending:**
- [ ] Works on tablet/touch devices
- [ ] Clear visual hierarchy (enabled vs disabled)
- [ ] Animations feel intentional, not janky
- [ ] Insights are helpful, not annoying

---

## Open Questions & Decisions

### Decided

**Multi-state extension blocks:** ✅ DECIDED  
Use vertical toggle (like Price is Right wheel) that cycles Off → 9 → ♭9 → ♯9 → Off

**Hand divider:** ✅ DECIDED  
Fixed position, snaps to block boundaries (not freely draggable)

**Octave rules for single-hand:** ✅ DECIDED  
Follow existing rules in [OctavePlacement.md](OctavePlacement.md), no special cases

**Decision tree scope:** ✅ DECIDED  
Works with template voicings only (not playground custom voicings)

### Open

**12-key transposition timing:**  
When should we add support for all 12 keys? After Phase 7 or earlier?

**Voice leading algorithm:**  
Should we calculate optimal voice leading automatically, or always use manual/preset voicings?

**MIDI export:**  
Export format: Standard MIDI file or MusicXML?

**Performance context default:**  
Should default be "Solo Piano" or "With Bassist"?

---

## Changelog

**v3.0 (December 2025):**
- Consolidated Design_Doc.md, MVP_scope.md, PLAYGROUND_MODE.md, PLAYGROUND_ENHANCEMENTS.md
- Added sequential feature numbering (F1.1-F8.5)
- Clarified completed vs. in-progress vs. planned features
- Documented all business rules and invariants
- Added decisions for hand mode, extensions, divider
- Cross-referenced with ROADMAP.md

**v2.1 (December 2025):**
- Added quality-based avoid extension rules
- Added function-appropriate extension recommendations
- Documented playground mode invariants

**v2.0 (December 2025):**
- Added Phase 2.5: Extensions (moved from Phase 4)
- Expanded Phase 4.1: Inversions as standalone feature
- Added comprehensive "holes identified & addressed" section
- Clarified melody integration timing
- Added UI iteration philosophy

**v1.0 (December 2025):**
- Initial product vision and roadmap
- Core architecture and data structures
- Implementation phases 1-10

---

**Document Version:** 3.0  
**Status:** Authoritative design document  
**See Also:** [ROADMAP.md](ROADMAP.md), [OctavePlacement.md](OctavePlacement.md)

