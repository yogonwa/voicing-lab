# Voicing Lab - Design & Implementation Document

## Project Vision

**Problem Statement:**
Intermediate piano players know basic chords but can't make them sound "jazzy" in real-time. They play blocky, root-position voicings and don't know how to voice lead smoothly or add sophistication.

**Solution:**
An interactive web tool that teaches jazz piano voicing through visual exploration and decision-making, building muscle memory for hand positions and voice-leading patterns.

**Core User Goal:**
"I see a lead sheet → I instantly know where to put my hands to play full, jazzy voicings with smooth voice leading"

---

## Current Status: MVP Complete ✅

### What's Built

| Feature | Status | Details |
|---------|--------|---------|
| **Chord Calculator** | ✅ Done | 12 roots × 5 qualities = 60 chord combinations |
| **Voicing Templates** | ✅ Done | Shell A, Shell B, Open |
| **Audio Playback** | ✅ Done | Tone.js with Salamander piano samples |
| **Piano Keyboard** | ✅ Done | 4 octaves (C2-B5), SVG-based |
| **Color-Coded Notes** | ✅ Done | R (red), 3 (blue), 5 (green), 7 (purple) |
| **Hand Differentiation** | ✅ Done | LH thick border, RH normal |
| **Audio Sync** | ✅ Done | Keys highlight during playback |
| **Keyboard Shortcuts** | ✅ Done | Space, 1/2/3 |
| **Test Suite** | ✅ Done | 92 tests passing |

### File Structure (Current)

```
src/
├── lib/
│   ├── chordCalculator.ts     # Layer 1: Note calculation
│   ├── voicingTemplates.ts    # Layer 2: Voicing patterns
│   ├── voicingGenerator.ts    # Layer 3: Generate voicings
│   ├── audioEngine.ts         # Tone.js playback
│   └── index.ts               # Barrel exports
├── components/
│   ├── PianoKeyboard/         # Keyboard visualization
│   │   ├── PianoKeyboard.tsx
│   │   ├── PianoKey.tsx
│   │   ├── KeyboardLegend.tsx
│   │   ├── utils.ts
│   │   └── types.ts
│   ├── ChordToneDisplay.tsx   # Interactive calculator
│   └── VoicingDisplay.tsx     # Main progression display
└── App.tsx
```

---

## Product Philosophy

### What This Tool Is
- **Harmonic vocabulary builder** — learn different voicing types
- **Pattern recognition trainer** — build automatic hand position memory
- **Interactive exploration tool** — discover what sounds good
- **Progressive learning system** — simple → complex over time

### What This Tool Is NOT
- Not a melody-matching tool (future feature)
- Not a rhythm/syncopation trainer (future feature)
- Not a full DAW or composition tool
- Not focused on reading sheet music in real-time

### Learning Approach
**Breadth first, then depth** — expose users to many voicing types in context, organized as a progression ladder from simple to complex.

---

## Completed Phases

### Phase 1: Algorithm & Text UI ✅
- Chord tone calculator
- Voicing templates (Shell A, Shell B, Open)
- Text-based UI showing LH/RH notes

### Phase 2: Audio Playback ✅
- Tone.js integration
- Play single chords
- Play full progression
- Audio context initialization handling

### Phase 3: Piano Keyboard ✅
- 4-octave SVG keyboard (C2-B5)
- Color-coded by chord role
- Hand differentiation via border weight
- Synced highlighting during playback
- Sticky highlights for study mode

### Phase 4: Polish & Ship MVP ✅
- Improved header with intro text
- Keyboard shortcuts (Space, 1/2/3)
- Footer with shortcut hints
- Responsive design improvements
- 92 tests passing

---

## Next Phase: Decision Tree Navigator

**Goal:** Teach voice leading through interactive decision-making

### Core Concept
At each chord in a progression, user sees multiple voicing options. They pick one, then see how it connects to the next chord. The tool teaches smooth voice leading through interactive decision-making.

### User Flow
```
1. Start: Dm7
   ↓
2. User picks: Shell Position A
   ↓
3. Keyboard shows: Current voicing highlighted
   ↓
4. Next chord: G7
   Options appear: [Shell B] [Shell A] [Open]
   ↓
5. User hovers Shell B
   → Preview appears below current keyboard
   → Arrows show note movement
   → Annotation: "C→B is smooth half-step"
   ↓
6. User clicks Shell B
   → Current keyboard slides up/fades
   → Preview becomes new current
   ↓
7. Repeat for next chord (Cmaj7)
```

### Key Interaction: Hover-to-Preview
- Hover over an option → preview keyboard appears below in faded state
- Animated arrows show voice movement from current → preview
- Annotations explain why this option is smooth/dramatic
- Click to commit and continue

### Visual Design: Stacked Keyboards with Arrows

```
┌─────────────────────────────────┐
│ Dm7: Shell A                    │
│ [Play ▶]                        │
└─────────────────────────────────┘
              ↓
    ┌─────────────────────┐
    │   Current Position  │
    │   🎹 ███   █        │
    └─────────────────────┘
              ↓
    ┌─────────────────────┐
    │ G7: Pick voicing    │
    │ [Shell B] [Shell A] │
    └─────────────────────┘
              ↓ (on hover)
         ╱    │    ╲  Arrows animate
        ╱     │     ╲
       ╱      │      ╲
    ┌─────────────────────┐
    │ Preview Position    │
    │ 🎹 █ ███    (faded) │
    └─────────────────────┘
    
    "C→B is a half-step (smooth!)"
    "E stays as common tone"
```

### Implementation Tasks

**Phase 5a: Data Structures (2-3 days)**
- Define `DecisionNode` and `VoicingOption` types
- Build hardcoded decision tree for ii-V-I with shells only
- Implement voice leading analysis algorithm
- Calculate smoothness scores and generate explanations

**Phase 5b: Navigation UI (3-4 days)**
- Build tree navigation component
- Implement "pick voicing" buttons/cards
- Track user's path through tree
- Display current chord and available options

**Phase 5c: Hover-to-Preview (4-5 days)**
- Detect hover on voicing option
- Render preview keyboard below current (faded)
- Animate arrows showing voice movement
- Display annotations (explanations)
- Handle hover exit (fade out preview)

**Phase 5d: Click-to-Commit (2-3 days)**
- Handle voicing selection
- Animate transition (current → preview)
- Update tree state
- Load next chord options
- Play audio of new voicing

**Phase 5e: Arrow Component (3-4 days)**
- Build arrow rendering (SVG paths)
- Calculate bezier curves based on interval
- Color-code by movement type
- Add midpoint labels
- Animate drawing effect

---

## Future Phases

### Phase 6: Expand Voicing Types
- Rootless voicings (Type A: 3-5-7-9, Type B: 7-9-3-5)
- Drop-2 voicings
- Extensions (9ths, 11ths, 13ths)
- Altered dominants (♭9, ♯9, ♯11, ♭13)

### Phase 7: Key Transposition
- Transpose progressions to all 12 keys
- Validate transposition algorithm
- Key selector UI

### Phase 8: Progression Builder
- Custom chord input
- Common progression templates
- Save/export functionality

### Phase 9+: Advanced Features
- Practice mode with quizzes
- Style presets (Bill Evans, Red Garland)
- MIDI input support
- User accounts and progress tracking

---

## Technical Architecture

### Stack
- **Frontend:** React 19 + TypeScript
- **Audio:** Tone.js (sample-based piano playback)
- **Testing:** Jest + React Testing Library
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

// Voicing template
type VoicingRole = "root" | "third" | "fifth" | "seventh";

interface VoicingTemplate {
  name: string;
  id: string;
  leftHand: VoicingRole[];
  rightHand: VoicingRole[];
  octaves: {
    leftHandBase: Octave;
    rightHandBase: Octave;
  };
}

// Final voicing (template applied to chord)
interface VoicedChord {
  leftHand: Note[];
  rightHand: Note[];
}

// Decision tree types (Phase 5)
interface DecisionNode {
  chord: Chord;
  selectedVoicing?: VoicedChord;
  availableOptions: VoicingOption[];
  nextNode?: DecisionNode;
}

interface VoicingOption {
  template: VoicingTemplate;
  voicing: VoicedChord;
  voiceLeadingInfo: VoiceLeadingInfo;
}

interface VoiceLeadingInfo {
  commonTones: number;
  halfSteps: number;
  wholeSteps: number;
  largeIntervals: number;
  smoothnessScore: number; // 0-100
  explanation: string;
}
```

### Three-Layer Voicing System

```
Layer 1: chordCalculator    → WHAT notes (D, F, A, C)
Layer 2: voicingTemplates   → WHICH hand plays what (LH: root, RH: 3rd+7th)
Layer 3: voicingGenerator   → WHERE on piano (D3, F4, C5)
```

---

## UI/UX Design Specifications

### Color Palette

```css
/* Chord role colors */
--color-root: #fc8181;      /* Red */
--color-third: #63b3ed;     /* Blue */
--color-fifth: #68d391;     /* Green */
--color-seventh: #b794f4;   /* Purple */

/* Arrow colors (voice movement) - Phase 5 */
--common-tone: #10B981;     /* Green - No movement */
--half-step: #3B82F6;       /* Blue - Smooth */
--whole-step: #F59E0B;      /* Amber - Medium */
--large-interval: #EF4444;  /* Red - Dramatic */

/* UI */
--bg-dark: #1a1a2e;
--bg-panel: #2d3748;
--text-primary: #e2e8f0;
--text-muted: #718096;
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play progression |
| `1` | Shell Position A |
| `2` | Shell Position B |
| `3` | Open Voicing |

---

## Design Decisions

### Why Decision Tree over Flashcards?
- Shows voicings **in context** (not isolation)
- Teaches decision-making (when to use each voicing)
- More engaging than rote memorization
- Builds pattern recognition through choices

### Why Hover-to-Preview?
- Low commitment exploration
- Instant feedback before choosing
- Allows comparison of multiple options

### Why Shells First?
- Simplest voicing with maximum voice leading benefit
- Foundation of all jazz voicing (guide tones)
- Easy to play (2 notes per hand)
- Natural progression to rootless (remove root, add 9th)

### Why ii-V-I in C Major?
- Most common progression in jazz
- All natural notes (no black keys) — easier to visualize
- Clear voice leading examples (C→B, F→E half-steps)
- Can expand to other keys later

---

## Success Metrics

### MVP (Done ✅)
- User can explore 3 voicing types
- User can hear/see difference between voicings
- User understands basic voice leading
- User can take voicing patterns to their piano

### Phase 5 Success Criteria
- User can navigate through decision tree
- User understands why certain voicings lead smoothly
- User explores multiple paths through progression
- Animations are smooth and intentional

### Long-term Success
- Users return weekly to explore new voicing types
- Users report improved voice leading in their playing
- Users can voice any standard smoothly

---

## Resources

### Music Theory
- Mark A. Galang - "Ultimate Jazz Chords & Arpeggios"
- Julian Bradley - "The Chord Voicing Guide"
- Mark Levine - "The Jazz Piano Book"

### Technical
- [Tone.js Documentation](https://tonejs.github.io/)
- [React Spring (for animations)](https://www.react-spring.dev/)

---

**Document Version:** 2.0  
**Last Updated:** December 2025  
**Status:** MVP Complete, Phase 5 (Decision Tree) planned
