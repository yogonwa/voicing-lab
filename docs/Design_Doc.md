# Voicing Lab - Design & Implementation Document

## Project Vision

**Problem Statement:**
Intermediate piano players know basic chords but can't make them sound "jazzy" in real-time. They play blocky, root-position voicings and don't know how to voice lead smoothly or add sophistication.

**Solution:**
An interactive web tool that teaches jazz piano voicing through visual exploration and decision-making, building muscle memory for hand positions and voice-leading patterns.

**Core User Goal:**
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

## Core Product Features

### 1. Voicing Explorer (MVP - Completed)
**Purpose:** Learn what different voicing types ARE

**User Flow:**
1. App displays ii-V-I in C major (Dm7 → G7 → Cmaj7)
2. User can view 3 voicing variations:
   - Shell Position A (LH: root, RH: 3rd, 7th)
   - Shell Position B (LH: root, RH: 7th, 3rd)
   - Open Voicing (LH: root, 5th | RH: 3rd, 7th)
3. Each voicing shows:
   - Text output (note names)
   - Audio playback
   - Piano keyboard visualization

**Status:** ✅ Phase 1 complete (algorithm + text UI)

---

### 2. Decision Tree Navigator (Next Major Feature)
**Purpose:** Learn how to connect chords smoothly through voice leading

**Core Concept:**
At each chord in a progression, user sees multiple voicing options. They pick one, then see how it connects to the next chord. The tool teaches smooth voice leading through interactive decision-making.

**User Flow:**
```
1. Start: Cmaj7
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
7. Repeat for next chord (Dm7)
```

**Key Interaction: Hover-to-Preview**
- Hover over an option → preview keyboard appears below in faded state
- Animated arrows show voice movement from current → preview
- Annotations explain why this option is smooth/dramatic
- Click to commit and continue

**Visual Design: Stacked Keyboards with Arrows**

```
┌─────────────────────────────────┐
│ Cmaj7: Shell A                  │
│ [Play ▶]                        │
└─────────────────────────────────┘
              ↓
    ┌─────────────────────┐
    │   Current Position  │
    │   🎹 ███   █        │
    │       █             │
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
    │     █               │
    └─────────────────────┘
    
    "C→B is a half-step (smooth!)"
    "E stays as common tone"
```

---

### 3. Progression Ladder (Unlock System)
**Purpose:** Organize voicing types from simple → complex

**Learning Progression:**

**Level 1: Shell Voicings (Beginner)**
- Shell Position A (1-3-7)
- Shell Position B (1-7-3)
- Focus: Basic voice leading with guide tones

**Level 2: Open Voicings (Beginner+)**
- Add 5th to left hand (1-5 / 3-7)
- Focus: Fuller sound, wider spread

**Level 3: Rootless Voicings (Intermediate)**
- Type A (3-5-7-9): Stack from 3rd
- Type B (7-9-3-5): Stack from 7th
- Focus: Jazz quartet sound, room for bass

**Level 4: Extensions (Intermediate+)**
- Add 9ths, 11ths, 13ths
- Focus: Color and sophistication

**Level 5: Altered Dominants (Advanced)**
- V7♭9, V7♯9, V7♯11, V7♭13
- Focus: Tension and resolution

**Level 6: Drop Voicings (Advanced)**
- Drop-2, Drop-3
- Focus: Open, spread voicings

**Level 7: Quartal Voicings (Advanced+)**
- Fourth voicings, Kenny Barron voicing
- Focus: Modern jazz sound

**Implementation:**
- Decision tree shows only unlocked voicing types
- As user progresses, new branches appear in tree
- Each level builds on previous (shells → open → rootless, etc.)

---

## Technical Architecture

### Stack
- **Frontend:** React + TypeScript
- **Audio:** Tone.js (sample-based piano playback)
- **Styling:** Tailwind CSS
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
  extensions?: {
    ninth?: NoteName;
    eleventh?: NoteName;
    thirteenth?: NoteName;
  };
}

// Voicing template
type VoicingRole = "root" | "third" | "fifth" | "seventh" | "ninth" | "eleventh" | "thirteenth";

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

// Final voicing (template applied to chord)
interface Voicing {
  chord: Chord;
  template: string;
  leftHand: Note[];
  rightHand: Note[];
}

// Decision tree node
interface DecisionNode {
  chord: Chord;
  selectedVoicing?: Voicing;
  availableOptions: VoicingOption[];
  nextNode?: DecisionNode;
}

interface VoicingOption {
  voicing: Voicing;
  unlocked: boolean;
  recommendation: "best" | "good" | "alternative";
  voiceLeadingInfo: {
    commonTones: number;
    halfSteps: number;
    wholeSteps: number;
    largeIntervals: number;
    smoothnessScore: number; // 0-100
    explanation: string; // "C→B is smooth half-step"
  };
}
```

### Two-Layer Algorithm System

**Layer 1: Chord Note Generator**
Calculates which notes are in a chord (pure music theory).

```typescript
function getChordTones(chord: Chord): ChordTones {
  // Use semitone intervals to calculate notes
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

function generateVoicing(chord: Chord, template: VoicingTemplate): Voicing {
  const tones = getChordTones(chord);
  
  const leftHand = template.leftHand.map((role, i) => {
    const noteName = tones[role];
    const octave = template.octaves.leftHandBase + Math.floor(i / 3);
    return `${noteName}${octave}`;
  });
  
  // Same for rightHand...
  
  return { chord, template: template.name, leftHand, rightHand };
}
```

**Voice Leading Analysis**

```typescript
function analyzeVoiceLeading(from: Voicing, to: Voicing): VoiceLeadingInfo {
  const allFromNotes = [...from.leftHand, ...from.rightHand];
  const allToNotes = [...to.leftHand, ...to.rightHand];
  
  let commonTones = 0;
  let halfSteps = 0;
  let wholeSteps = 0;
  let largeIntervals = 0;
  
  // Compare each voice's movement
  allFromNotes.forEach((fromNote, i) => {
    const toNote = allToNotes[i];
    const interval = calculateInterval(fromNote, toNote);
    
    if (interval === 0) commonTones++;
    else if (interval === 1) halfSteps++;
    else if (interval === 2) wholeSteps++;
    else largeIntervals++;
  });
  
  // Calculate smoothness score (0-100)
  const smoothnessScore = 
    (commonTones * 25) + 
    (halfSteps * 20) + 
    (wholeSteps * 10) - 
    (largeIntervals * 15);
  
  return {
    commonTones,
    halfSteps,
    wholeSteps,
    largeIntervals,
    smoothnessScore: Math.max(0, Math.min(100, smoothnessScore)),
    explanation: generateExplanation(commonTones, halfSteps, wholeSteps)
  };
}
```

---

## UI/UX Design Specifications

### Visual Design System

**Color Palette:**

```css
/* Hand colors on keyboard */
--lh-color: #EF4444;      /* red-500 - Left Hand */
--rh-color: #3B82F6;      /* blue-500 - Right Hand */

/* Arrow colors (voice movement) */
--common-tone: #10B981;   /* green-500 - No movement */
--half-step: #3B82F6;     /* blue-500 - Smooth */
--whole-step: #F59E0B;    /* amber-500 - Medium */
--large-interval: #EF4444; /* red-500 - Dramatic jump */

/* UI states */
--inactive-key: #E5E7EB;  /* gray-200 */
--preview-opacity: 0.4;   /* Ghost/preview state */
--bg-current: #FFFFFF;
--bg-preview: #F9FAFB;    /* gray-50 */
--bg-hover: #F3F4F6;      /* gray-100 */
```

**Typography:**
- Headings: System font stack (SF Pro, Segoe UI, etc.)
- Monospace for note names: `font-mono`
- Body: `font-sans`

### Piano Keyboard Component

**Visual Specs:**
- Display range: C2-C6 (4 octaves)
- White keys: 20px wide × 100px tall
- Black keys: 12px wide × 60px tall
- Key spacing: 1px gap
- Highlighted keys: Solid fill with hand color
- Inactive keys: Light gray fill
- Labels: Show note name + role (e.g., "C - Root")

**States:**
1. **Default** - All keys gray, no highlights
2. **Active** - Current voicing highlighted (100% opacity)
3. **Preview** - Future voicing shown faded (40% opacity)
4. **Hover** - Key highlights on mouse hover

### Arrow Component

**Visual Specs:**

**Arrow Types:**

1. **Straight Vertical Arrow** (Common Tone)
   - Color: Green (#10B981)
   - Style: Solid line, 2px width
   - No arrowhead (note stays)

2. **Curved Arrow** (Movement)
   - Color: Based on interval (blue/yellow/red)
   - Style: Curved bezier, 2px width
   - Arrowhead at destination
   - Curve amount scales with interval distance

**Arrow Annotations:**
- Small label at midpoint: "C→B" or "E (stays)"
- Font size: 12px
- Color: Same as arrow
- Background: Semi-transparent white

**Animation:**
- Entry: Draw from start → end (300ms, ease-out)
- Stagger: 50ms delay between arrows
- Exit: Fade out (200ms)

### Interaction States

**Hover State (Option Preview):**
```
Trigger: Mouse hover on voicing option button
Effect:
  1. Preview keyboard fades in below (200ms)
  2. Arrows draw from current → preview (300ms, staggered)
  3. Annotation text appears (400ms)
  4. Option button highlights
```

**Click State (Commit Choice):**
```
Trigger: Click on voicing option button
Effect:
  1. Current keyboard slides up + fades out (300ms)
  2. Preview keyboard slides up + becomes current (300ms)
  3. Preview opacity: 40% → 100%
  4. Arrows disappear
  5. New option buttons appear for next chord
  6. Audio plays new voicing
```

**Responsive Breakpoints:**
- Desktop (1024px+): Side-by-side layout, full keyboard
- Tablet (768px-1023px): Stacked layout, full keyboard
- Mobile (<768px): Vertical stack, compact keyboard (2 octaves visible)

---

## Implementation Phases

### Phase 1: Voicing Explorer ✅ COMPLETE
**Status:** Built and validated
- [x] Chord calculator algorithm
- [x] Voicing templates (Shell A, Shell B, Open)
- [x] Text UI output
- [x] ii-V-I progression hardcoded

**Deliverable:** "See 3 voicing types as text output"

---

### Phase 2: Audio + Visualization (CURRENT)
**Goal:** Make voicings playable and visible

**Tasks:**
1. Integrate Tone.js
   - Load piano samples
   - Implement `playVoicing()` function
   - Implement `playProgression()` function
   - Handle browser audio context initialization

2. Build Piano Keyboard Component
   - SVG-based keyboard (C2-C6)
   - Highlight keys based on voicing
   - Color-code by hand (LH red, RH blue)
   - Add note labels (optional toggle)

3. Wire up UI
   - "Play" button for each voicing
   - "Play Progression" button
   - Display current voicing on keyboard
   - Switch between voicing variations

**Success Criteria:**
- ✅ Can click and hear each voicing
- ✅ Keyboard visualizes which keys to press
- ✅ Three variations sound distinctly different
- ✅ Voice leading sounds smooth

**Estimated Time:** 1-2 weeks

**Deliverable:** "Playable voicing explorer with audio + visual feedback"

---

### Phase 2.5: Add Extensions (PRIORITY)
**Goal:** Make voicings sound jazzy and sophisticated

**Why This Comes Early:**
Extensions (9ths, 11ths, 13ths) are fundamental to jazz voicing, not an advanced feature. Shell voicings without 9ths sound sparse and un-jazzy. Rootless voicings (Phase 4) are literally built on 9ths (3-5-7-9 formula). We need extensions before the Decision Tree to show realistic jazz voice leading.

**What to Add:**

**Basic Extensions:**
- 9ths for all chord types (most common)
- 11ths for ii chords (Dm11 - suspended, lush sound)
- 13ths for V chords (G13 - bright, open sound)
- #11 for I chords (Cmaj7#11 - Lydian, modern sound)

**Alterations (V7 chords only):**
- ♭9 (tension, needs resolution)
- ♯9 (blues/funk color)
- ♯11 (Lydian dominant)
- ♭13 (same as #5, altered sound)

**Avoid Extensions by Chord Quality (Fundamental Rule):**

The most fundamental rule: certain extensions create dissonant clashes with chord tones regardless of function.

| Chord Quality    | Avoid | Reason                                    | Safe Extensions |
|------------------|-------|-------------------------------------------|-----------------|
| Major 7th        | 11    | Natural 11 is half-step from major 3rd    | 9, 13           |
| Minor 7th        | 13    | Natural 13 clashes with minor context     | 9, 11           |
| Dominant 7th     | 11    | Natural 11 is half-step from major 3rd    | 9, 13 (use ♯11) |
| Half-Diminished  | 13    | Clashes with minor 3rd context            | 9, 11           |
| Diminished 7th   | 13    | Clashes with diminished context           | 9, 11           |

```typescript
const AVOID_EXTENSIONS: Record<ChordQuality, ExtensionRole[]> = {
  maj7:   ["eleventh"],   // Natural 11 clashes with major 3rd
  min7:   ["thirteenth"], // Natural 13 clashes with minor context
  dom7:   ["eleventh"],   // Natural 11 clashes - use #11 instead
  min7b5: ["thirteenth"], // 13 clashes in half-dim context
  dim7:   ["thirteenth"], // 13 clashes in dim context
};
```

**Function-Appropriate Extension Rules (Layer on Top):**

```typescript
const EXTENSION_RULES = {
  ii: {
    common: ["9th", "11th"],
    sound: "Lush, suspended, adds color without tension",
    avoid: ["13th - can clash with minor 3rd"],
    examples: ["Dm9", "Dm11"]
  },
  V: {
    common: ["9th", "13th"],
    alterations: ["♭9", "♯9", "♯11", "♭13"],
    sound: "13th = bright/open, alterations = tension/resolution",
    avoid: ["11th - clashes with major 3rd"],
    examples: ["G13", "G7♭9", "G7♯11"]
  },
  I: {
    common: ["9th", "6th", "♯11"],
    sound: "9th = smooth, #11 = modern Lydian color",
    avoid: ["Regular 11th - clashes with major 3rd"],
    examples: ["Cmaj9", "C6/9", "Cmaj7♯11"]
  }
};
```

**Technical Implementation:**

```typescript
// Update ChordTones interface
interface ChordTones {
  root: NoteName;
  third: NoteName;
  fifth: NoteName;
  seventh: NoteName;
  extensions: {
    ninth: NoteName;
    eleventh?: NoteName;     // Optional - for ii chords
    thirteenth?: NoteName;   // Optional - for V chords
  };
  alterations?: {            // Only for V7 chords
    flatNinth?: NoteName;
    sharpNinth?: NoteName;
    sharpEleventh?: NoteName;
    flatThirteenth?: NoteName;
  };
}

// Extension intervals (in semitones from root)
const EXTENSION_INTERVALS = {
  ninth: 14,          // Octave + major 2nd
  eleventh: 17,       // Octave + perfect 4th
  thirteenth: 21      // Octave + major 6th
};

const ALTERATION_INTERVALS = {
  flatNinth: 13,      // Octave + minor 2nd
  sharpNinth: 15,     // Octave + augmented 2nd
  sharpEleventh: 18,  // Octave + augmented 4th
  flatThirteenth: 20  // Octave + minor 6th (enharmonic to #5)
};
```

**New Voicing Templates:**

```typescript
const SHELL_WITH_NINTH: VoicingTemplate = {
  name: "Shell + 9th",
  type: "shell",
  leftHand: ["root"],
  rightHand: ["third", "seventh", "ninth"],
  octaves: { leftHandBase: 2, rightHandBase: 3 }
};

const SHELL_WITH_ELEVENTH: VoicingTemplate = {
  name: "Shell + 11th (ii chords only)",
  type: "shell",
  leftHand: ["root"],
  rightHand: ["third", "seventh", "ninth", "eleventh"],
  octaves: { leftHandBase: 2, rightHandBase: 3 }
};

const SHELL_ALTERED: VoicingTemplate = {
  name: "Shell Altered (V7 chords)",
  type: "shell",
  leftHand: ["root"],
  rightHand: ["third", "seventh", "flatNinth", "sharpEleventh"],
  octaves: { leftHandBase: 2, rightHandBase: 3 }
};
```

**UI Considerations:**
- Extension toggles per chord (checkbox or toggle switches)
- "Auto" mode: Apply function-appropriate extensions automatically
- "Custom" mode: Let user pick specific extensions
- Visual feedback: Show which extensions are active on keyboard
- Color coding: Maybe different color for extension notes vs. chord tones
- Educational tooltips: Explain what each extension sounds like

**Example Output:**

```
Dm9 (Shell + 9th):
  LH: D2
  RH: F3, C4, E4
  Sound: Fuller, more sophisticated than Dm7

G13 (Shell + 13th):
  LH: G2
  RH: B3, F4, E5
  Sound: Bright, open, typical V7 extension

Cmaj9 (Shell + 9th):
  LH: C2
  RH: E3, B3, D4
  Sound: Smooth resolution, complete I chord
```

**Success Criteria:**
- ✅ Can add/remove extensions via UI
- ✅ Extensions sound appropriate for chord function
- ✅ Voicings sound "jazzy" with extensions
- ✅ User understands difference (with vs without 9th)

**Estimated Time:** 1 week

**Deliverable:** "Jazz voicings with realistic extensions"

---

### Phase 3: Decision Tree Navigator
**Goal:** Build the interactive voice-leading decision tree

**Core User Goals:**
1. **Learn voice leading through choice** - At each chord, see multiple voicing options and understand why certain paths are smoother
2. **Visualize note movement** - See exactly how notes move from one chord to the next (common tones, half-steps, jumps)
3. **Build decision-making intuition** - Through repeated exploration, internalize which voicings connect well
4. **Explore multiple paths** - Discover that there's no single "right" answer - different paths create different sounds

**What We're Trying to Communicate:**
- Voice leading is about minimizing hand movement while maintaining smooth harmonic flow
- Common tones (notes that stay) are valuable
- Half-step movements are smooth and characteristic of jazz
- Larger intervals are more dramatic (not wrong, just different)
- Same progression can sound completely different based on voicing choices

**UI Design Goals (to be workshopped later):**
- Clear current position (where are your hands now?)
- Clear preview of options (where could you go next?)
- Visual arrows showing note movement
- Explanations of why options are smooth/dramatic
- Not overwhelming (start with 2-3 options per node)

**Tasks:**

**3.1: Data Structure & Voice Leading Analysis (2-3 days)**
- Define `DecisionNode` and `VoicingOption` types
- Build hardcoded decision tree for ii-V-I with shells + extensions
- Implement voice leading analysis algorithm:
  - Count common tones
  - Count half-step movements
  - Count whole-step movements
  - Count large intervals (3+ semitones)
  - Calculate "smoothness score"
- Generate explanations ("C→B is smooth half-step resolution")

**3.2: Navigation State Management (2-3 days)**
- Track user's current position in tree
- Track path history (which voicings chosen)
- Handle "back" functionality (undo choice)
- Handle "start over" (reset to beginning)

**3.3: Current Voicing Display (2 days)**
- Show selected voicing on keyboard
- Display chord name and template name
- Play button for current voicing
- "This is where you are" clarity

**3.4: Options/Choice UI (3-4 days)**
- Display available voicing options for next chord
- Button/card for each option
- Show basic info (template name, recommendation level)
- Handle selection (commit to choice, advance tree)

**3.5: Hover-to-Preview Interaction (4-5 days)**
- Detect hover on voicing option
- Render preview keyboard (faded/ghosted state)
- Calculate and display voice movement arrows
- Show explanation text ("why this option is smooth")
- Handle hover exit (fade out preview)
- Audio preview on hover (optional - may be too much)

**3.6: Arrow/Movement Visualization (3-4 days)**
- Build arrow component (SVG paths)
- Calculate bezier curves based on interval distance
- Color-code arrows:
  - Green = common tone (stays)
  - Blue = half-step (smooth)
  - Yellow = whole-step (medium)
  - Red = large interval (dramatic)
- Add midpoint labels ("C→B", "E stays")
- Animate drawing effect (staggered, smooth)

**3.7: Click-to-Commit Transition (2-3 days)**
- Handle voicing selection click
- Animate transition:
  - Current keyboard slides up/fades out
  - Preview becomes new current (opacity 40% → 100%)
  - Arrows disappear
- Update tree state
- Load next chord options
- Play audio of newly selected voicing

**Architecture Notes:**

```typescript
interface DecisionNode {
  chord: Chord;
  chordFunction: "ii" | "V" | "I"; // For extension recommendations
  selectedVoicing?: Voicing;
  availableOptions: VoicingOption[];
  previousNode?: DecisionNode;
  nextNode?: DecisionNode;
}

interface VoicingOption {
  voicing: Voicing;
  recommendation: "best" | "good" | "alternative";
  voiceLeadingInfo: {
    commonTones: number;
    halfSteps: number;
    wholeSteps: number;
    largeIntervals: number;
    smoothnessScore: number; // 0-100
    movements: NoteMovement[];
    explanation: string;
  };
}

interface NoteMovement {
  fromNote: Note;
  toNote: Note;
  interval: number; // In semitones
  type: "common" | "halfStep" | "wholeStep" | "largeInterval";
  hand: "left" | "right";
}
```

**Voice Leading Analysis Algorithm:**

```typescript
function analyzeVoiceLeading(from: Voicing, to: Voicing): VoiceLeadingInfo {
  const movements: NoteMovement[] = [];
  
  // Analyze each voice separately
  const fromNotes = [...from.leftHand, ...from.rightHand];
  const toNotes = [...to.leftHand, ...to.rightHand];
  
  // Match voices (closest note matching)
  // Calculate intervals for each movement
  // Categorize movements (common, half-step, etc.)
  // Generate explanation text
  
  const smoothnessScore = calculateSmoothness(movements);
  
  return {
    commonTones: movements.filter(m => m.type === "common").length,
    halfSteps: movements.filter(m => m.type === "halfStep").length,
    wholeSteps: movements.filter(m => m.type === "wholeStep").length,
    largeIntervals: movements.filter(m => m.type === "largeInterval").length,
    smoothnessScore,
    movements,
    explanation: generateExplanation(movements)
  };
}

function calculateSmoothness(movements: NoteMovement[]): number {
  // Higher score = smoother
  let score = 100;
  
  movements.forEach(m => {
    if (m.type === "common") score += 0; // No movement is best
    else if (m.type === "halfStep") score -= 5; // Very smooth
    else if (m.type === "wholeStep") score -= 15; // Medium
    else score -= 30; // Large jump
  });
  
  return Math.max(0, Math.min(100, score));
}
```

**Success Criteria:**
- ✅ User can navigate through ii-V-I making voicing choices
- ✅ Hover shows clear preview with movement visualization
- ✅ Explanations are helpful and educational
- ✅ Animations feel smooth and intentional (not janky)
- ✅ Can explore multiple paths through same progression
- ✅ Voice leading analysis is accurate and informative

**Estimated Time:** 2-3 weeks

**Deliverable:** "Interactive decision tree for exploring voice leading paths"

**Note on UI Iteration:**
The exact visual design (stacked keyboards vs. side-by-side, arrow styling, layout) will be workshopped during implementation. The critical piece is the interaction model (hover to preview, click to commit) and the information architecture (current position, options, explanations). Visual polish can iterate.

---

### Phase 4: Expand Voicing Types
**Goal:** Add more voicing options to the decision tree

**Phase 4.1: Rootless Voicings (1 week)**
- Implement Type A (3-5-7-9) template
- Implement Type B (7-9-3-5) template
- Add to decision tree as new options
- Requires adding 9th to chord calculator

**Phase 4.2: Drop-2 Voicings (1 week)**
- Implement drop-2 algorithm
- Add to decision tree
- Update voice leading analysis

**Phase 4.3: Extensions (1-2 weeks)**
- Add 9ths, 11ths, 13ths to chord calculator
- Update all voicing templates to support extensions
- Add extension toggle UI
- Show how extensions change color

**Phase 4.4: Altered Dominants (1 week)**
- Add altered chord qualities (dom7♭9, dom7♯9, etc.)
- Create voicing templates for altered sounds
- Add to decision tree for V7 chords

**Deliverable:** "Comprehensive voicing vocabulary from shells → altered dominants"

---

### Phase 5: Progression Builder
**Goal:** Let users build custom progressions

**Tasks:**
1. Chord input UI
   - Dropdown selectors or drag-and-drop
   - Support common progressions (templates)
   - 4-8 chord limit for MVP

2. Apply decision tree to custom progression
   - Generate tree dynamically
   - Calculate voice leading for any path

3. Save/export functionality
   - Save progression + voicing choices
   - Export as MIDI
   - Print-friendly view

**Estimated Time:** 2-3 weeks

**Deliverable:** "Build and voice any progression"

---

### Future Phases (v2.0+)

**Phase 6: Melody-Matching Mode**
- Import lead sheets
- Suggest voicings based on melody note
- Practice comping through real tunes

**Phase 7: Practice Mode**
- Quiz mode (identify voicings)
- Spaced repetition
- Progress tracking
- All 12 keys

**Phase 8: Rhythm Layer**
- Syncopation patterns
- Comping rhythms
- Hand independence exercises

**Phase 9: Advanced Features**
- MIDI input (play along)
- Style presets (Bill Evans, Red Garland, etc.)
- User accounts
- Community sharing

---

## Design Decisions & Rationale

### Critical Product Decisions

**Decision: Extensions Come Early (Phase 2.5, not Phase 4)**
**Rationale:**
- Extensions (9ths, 11ths, 13ths) are fundamental to jazz voicing, not advanced features
- Shell voicings without 9ths sound sparse and un-jazzy
- Rootless voicings are literally built on 9ths (3-5-7-9 formula)
- Users need realistic jazz voicings before learning voice leading
- Better to teach proper jazz voicing from the start than retrofit later

**Decision: Melody Integration Comes After Rhythm (Phase 7, not earlier)**
**Rationale:**
- User needs to build progression + voicing + rhythm skills first
- Melody is a constraint that limits options - better to explore freely first
- Most intermediate players want to work on harmony/comp before full arrangements
- Melody requires file upload or manual input (adds friction)
- Can still build useful accompaniments without melody (for solo piano improv)

**Decision: No Ensemble Context Selector (Cut Feature)**
**Rationale:**
- Reduces complexity - one use case is better than many half-baked ones
- Assume solo piano as primary context
- Rootless voicings still available as option (works fine for solo too)
- Can always add context selector later if users request it
- Focus on depth over breadth for MVP

**Decision: Inversions as Standalone Feature (Phase 4.1)**
**Rationale:**
- Shell A → Shell B already teaches inversion concept (3-7 vs 7-3)
- But inversions are crucial for smooth bass lines
- Worth exploring deeper with other voicing types
- Natural extension after basic voicing types established
- Teaches practical voice leading (smooth bass movement)

**Decision: Decision Tree over Flashcards**
**Rationale:**
- Shows voicings IN CONTEXT (not isolation)
- Teaches decision-making (when to use each voicing)
- More engaging than rote memorization
- Builds pattern recognition through choices
- Scales naturally (add more voicing types → tree grows)

### Interaction Design Decisions

**Decision: Hover-to-Preview, Click-to-Commit**
**Rationale:**
- Low commitment exploration (hover is free)
- Instant feedback (see/hear before choosing)
- Natural interaction pattern (hover = "I'm considering this")
- Prevents accidental clicks
- Allows comparison (hover multiple options quickly)

**Decision: Stacked Keyboards with Arrows**
**Rationale:**
- Clear cause-and-effect (current → future)
- Arrows make voice leading explicit (not abstract)
- Color-coding teaches interval types (green = common, blue = smooth, etc.)
- Natural reading direction (top to bottom)
- Works on mobile (can adapt to horizontal if needed)
- Visual design will be workshopped during implementation

**Note on UI Iteration:**
We've agreed to focus on user goals and information architecture now, workshop visual design during implementation. The stacked keyboard + arrows concept is directionally correct, but exact styling, spacing, animation details will be refined when building.

**Decision: Shells First, Then Extensions, Then Rootless**
**Rationale:**
- Shell voicings are simplest (just 3 notes: root + 3rd + 7th)
- Foundation of all jazz voicing (guide tones)
- Easy to play (2 notes per hand max)
- Teaches voice leading principles immediately
- Extensions add color without changing structure
- Rootless builds naturally from shells + extensions (remove root, keep rest)

### Technical Decisions

**Decision: ii-V-I in C Major for MVP**
**Rationale:**
- Most common progression in jazz (appears in 90% of standards)
- All natural notes (no black keys) - easier to visualize
- Clear voice leading examples (C→B, F→E half-steps)
- Users can apply learnings to most jazz standards
- Can expand to other keys later (transposition is easy)

**Decision: Use Tone.js (not WASM/Custom Synthesis)**
**Rationale:**
- Sample playback is sufficient for MVP
- Tone.js is battle-tested and reliable
- Much faster to implement (hours vs weeks)
- Better to ship quickly and iterate
- WASM can be added later if needed (but probably won't be)

**Decision: Breadth over Depth (Show Many Voicing Types)**
**Rationale:**
- Users want to explore options (discovery mindset)
- Prevents boredom (variety keeps engagement)
- Builds comprehensive vocabulary
- Users can choose which voicing types to practice deeply
- Progression ladder provides depth over time (unlock more as you master basics)

**Decision: Function-Appropriate Extensions (ii vs V vs I)**
**Rationale:**
- Not all extensions work on all chords (11th clashes with major 3rd on V7)
- Jazz has standard practices (ii gets 9/11, V gets alterations, I gets #11)
- Tool should teach best practices, not just "here are all extensions"
- Builds musicality, not just theoretical knowledge

---

## What We Intentionally Cut (And Why)

### Features That Were Discussed But Deferred

**❌ Ensemble Context Selector (solo piano vs trio vs big band)**
**Why cut:** Reduces complexity, focus on single use case (solo piano). Rootless voicings available as option work fine for solo too. Can add later if users request.

**❌ WASM/Custom Audio Synthesis**
**Why cut:** Tone.js is sufficient, faster to implement. Not the differentiating feature. Can always upgrade later.

**❌ Advanced Bass Lines & Pedal Tones (Phase 1-7)**
**Why deferred:** Walking bass covers 80% of needs. Pedal tones are niche. Focus on core voicing/rhythm first.

**❌ User Accounts & Progress Tracking (MVP)**
**Why deferred:** Adds backend complexity. Local storage sufficient for MVP. Can add when usage validates need.

**❌ MIDI Input (play-along mode)**
**Why deferred:** Nice-to-have, not core learning tool. Requires hardware. Better as v3 feature after core voicing education proven.

**❌ Social/Community Features**
**Why deferred:** Need critical mass first. Focus on solo learning experience.

**❌ Mobile App (Native)**
**Why deferred:** Web-first is faster, works everywhere. Can consider native later if mobile usage high.

---

## Holes That Were Identified & Addressed

### 1. Extensions Are Not Optional - They're Core
**Problem Identified:** Originally positioned extensions as "Phase 4 - add later"
**Why That's Wrong:** Jazz voicing without 9ths sounds un-jazzy. Rootless voicings literally require 9ths.
**Solution:** Move extensions to Phase 2.5 (immediately after basic shells)

### 2. Function-Appropriate Extensions
**Problem Identified:** Treating all chords the same (every chord can have any extension)
**Why That's Wrong:** 11th clashes with major 3rd on V7, some extensions sound better on certain chord functions
**Solution:** Build function-aware extension recommendations (ii loves 11th, V loves alterations/13th, I loves #11)

### 3. Inversions Matter for Voice Leading
**Problem Identified:** All voicings assume root position, ignoring inversions
**Why That's Wrong:** Smooth bass lines require inversions, voice leading often needs specific bass notes
**Solution:** Add inversions as Phase 4.1 feature, explore deeply beyond just shell A/B

### 4. "Why" Explanations Are Critical
**Problem Identified:** Tool shows voicings but doesn't explain musical reasoning
**Why That's Wrong:** Pattern recognition requires understanding WHY, not just WHAT
**Solution:** Every voicing/voice-leading choice needs expandable explanation with music theory rationale

### 5. Melody Can't Be Ignored Forever
**Problem Identified:** Tool teaches voicing in isolation from melody
**Why That's Wrong:** Real-world voicing requires melody awareness (avoid clashing)
**Solution:** Add melody integration as Phase 7, after rhythm but before v2

### 6. Register/Octave Choices Matter
**Problem Identified:** Hardcoded octaves (LH always octave 2, RH always octave 3)
**Why That's Wrong:** Same voicing sounds different at different registers
**Solution:** Add register variations within Phase 4 voicing expansion

### 7. Substitutions Are Part of Jazz Voicing
**Problem Identified:** User inputs Dm7-G7-Cmaj7, tool only voices those exact chords
**Why That's Wrong:** Jazz pianists substitute chords (tritone subs, secondary dominants)
**Solution:** Add substitution explorer as Phase 5

### 8. Visual Complexity Can Overwhelm
**Problem Identified:** Stacked keyboards + arrows + annotations could get very busy
**Why That's Wrong:** Cognitive overload defeats learning purpose
**Solution:** Progressive disclosure, multiple view modes (simple/detail), start with 2-3 options max

---

## Open Questions for Future Decisions

### Still To Be Decided

**Q: Should we support all 12 keys in Phase 3 (Decision Tree)?**
**Status:** TBD
**Options:**
- A: Add transposition now (works in any key immediately)
- B: Ship C major first, add keys in Phase 4
**Leaning:** B (ship faster, validate Decision Tree first, then add keys)

**Q: How many voicing options per chord in Decision Tree?**
**Status:** TBD
**Options:**
- A: 2 options (simple, less overwhelming)
- B: 3 options (good, better, best)
- C: 4+ options (comprehensive but busy)
**Leaning:** Start with 2 (A), expand to 3 (B) as more voicing types added

**Q: Should preview audio auto-play on hover or require click?**
**Status:** TBD
**Options:**
- A: Auto-play on hover (instant feedback)
- B: Require play button click (user control, avoid audio spam)
**Leaning:** B (user control, avoid overwhelming)

**Q: How to handle inversions in UI? Separate selector or part of voicing options?**
**Status:** TBD
**Options:**
- A: Inversion selector (dropdown: root | 1st | 2nd | 3rd)
- B: Inversions appear as distinct voicing options in tree
- C: Hybrid (selector for exploration mode, options in tree)
**Leaning:** C (flexibility for different modes)

**Q: Should rhythm patterns be locked to tempo or user-adjustable?**
**Status:** TBD
**Options:**
- A: Each pattern has characteristic tempo (stride = 120, bossa = 140)
- B: User can adjust any pattern to any tempo
**Leaning:** B (flexibility), but suggest default tempos

---

## Success Metrics

### MVP Success Criteria
- ✅ User can explore 3 voicing types
- ✅ User can hear/see difference between voicings
- ✅ User understands basic voice leading (half-steps, common tones)
- ✅ User can take a specific voicing pattern to their piano and practice

### Phase 3 Success Criteria
- ✅ User can navigate through decision tree
- ✅ User understands why certain voicings lead smoothly
- ✅ User explores multiple paths through progression
- ✅ User discovers their preferred voicing style

### Long-term Success
- Users return weekly to explore new voicing types
- Users report improved voice leading in their playing
- Users can voice any standard smoothly
- Users contribute/share their own progressions

---

## Resources & References

### Music Theory Resources
- Mark A. Galang - "Ultimate Jazz Chords & Arpeggios"
- Julian Bradley - "The Chord Voicing Guide"
- Mark Levine - "The Jazz Piano Book"
- [Jazz Tutorial - Voicing Resources](https://jazztutorial.com)

### Technical Resources
- [Tone.js Documentation](https://tonejs.github.io/)
- [Tone.js Piano Sampler Example](https://tonejs.github.io/examples/sampler)
- [Tonal.js (music theory library)](https://github.com/tonaljs/tonal)
- [React Spring (animation library)](https://www.react-spring.dev/)

### Design Inspiration
- [Hooktheory](https://www.hooktheory.com/) - Music theory visualization
- [Learning Music by Ableton](https://learningmusic.ableton.com/) - Interactive music education
- [Melodics](https://melodics.com/) - Music skill building

---

## File Structure

```
voicing-lab/
├── docs/
│   ├── MVP_SPEC.md              ← Original execution doc
│   ├── DESIGN_DOC.md            ← This document
│   └── PHASE_N_TASKS.md         ← Task lists for each phase
│
├── src/
│   ├── lib/
│   │   ├── chordCalculator.ts   ← Note calculation
│   │   ├── voicingTemplates.ts  ← Voicing definitions
│   │   ├── voicingGenerator.ts  ← Apply templates to chords
│   │   ├── voiceLeading.ts      ← Analyze voice movement
│   │   └── decisionTree.ts      ← Build navigation tree
│   │
│   ├── components/
│   │   ├── PianoKeyboard.tsx    ← Visual keyboard
│   │   ├── VoicingDisplay.tsx   ← Text output
│   │   ├── AudioPlayer.tsx      ← Tone.js wrapper
│   │   ├── DecisionTree.tsx     ← Tree navigation
│   │   ├── VoicingOption.tsx    ← Option cards/buttons
│   │   ├── ArrowOverlay.tsx     ← Voice leading arrows
│   │   └── PreviewKeyboard.tsx  ← Hover preview
│   │
│   ├── types/
│   │   └── music.ts             ← TypeScript interfaces
│   │
│   ├── hooks/
│   │   ├── useAudio.ts          ← Audio playback logic
│   │   ├── useDecisionTree.ts   ← Tree navigation state
│   │   └── useKeyboard.ts       ← Keyboard interaction
│   │
│   └── App.tsx                  ← Main application
│
└── package.json
```

---

## Next Steps

**Immediate (This Week):**
1. Complete Phase 2: Audio + Keyboard Visualization
2. Test voicing playback thoroughly
3. Validate keyboard display is clear

**Short-term (Next 2-3 Weeks):**
1. Design decision tree UI components
2. Build hover-to-preview interaction
3. Implement arrow animations
4. Ship Phase 3: Decision Tree Navigator

**Medium-term (Next 2 Months):**
1. Add rootless voicings
2. Add drop-2 voicings
3. Expand to 12 keys
4. Build progression builder

**Long-term (3-6 Months):**
1. Melody-matching mode
2. Practice/quiz mode
3. User accounts & progress tracking
4. Community features

---

**Document Version:** 2.0
**Last Updated:** December 2025
**Status:** Phase 2 in progress, Phase 2.5 (extensions) prioritized
**Primary Author:** Product design session notes

---

## Changelog

**v2.1 (December 2025):**
- Added quality-based avoid extension rules (AVOID_EXTENSIONS constant)
- Added SAFE_EXTENSIONS constant for each chord quality
- Added shouldAvoidExtension() and getSafeExtensions() helper functions
- Documented fundamental avoid rules: 11th clashes with major 3rd, 13th clashes with minor context

**v2.0 (December 2025):**
- Added Phase 2.5: Extensions (moved from Phase 4 to immediately after MVP)
- Added detailed rationale for extension timing
- Expanded Phase 4.1: Inversions as standalone feature
- Added comprehensive "holes identified & addressed" section
- Clarified melody integration comes after rhythm (Phase 7)
- Cut ensemble context selector (assume solo piano)
- Added UI iteration philosophy (workshop during implementation)
- Expanded voice leading analysis algorithm details
- Added function-appropriate extension rules
- Clarified user goals for Decision Tree phase

**v1.0 (December 2025):**
- Initial product vision and roadmap
- Core architecture and data structures
- Implementation phases 1-10