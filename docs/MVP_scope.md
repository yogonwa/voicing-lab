# Voicing Lab MVP - Execution Document

## Project Context

**What is Voicing Lab?**
Voicing Lab is a browser-based tool to help piano players learn jazz voicings. The core problem it solves: you know what chords to play from a lead sheet (e.g., Dm7, G7, Cmaj7), but you're stuck playing boring root-position voicings that sound blocky and amateurish.

**Who is this for?**
Intermediate piano players who understand basic chord theory but want to learn professional voicing techniques (shell voicings, drop-2, rootless voicings, voice leading, etc.).

**Project Goal**
Build an interactive exploration tool where users can see and hear a ii-V-I progression voiced in different professional styles on a visual piano keyboard.

**Learning Resource Reference**
This project is inspired by "Ultimate Jazz Chords & Arpeggios" by Mark A. Galang, which teaches voicing progressions through structured technique variations (shell + rootless → drop-2 → two-handed rootless, etc.).

---

## MVP Scope

### What's IN Scope ✅

**Core User Flow:**
1. App displays **ii-V-I in C major** (Dm7 → G7 → Cmaj7)
2. System generates 3 pre-defined voicing variations based on technique:
   - **Variation 1:** Shell Position A (LH: root, RH: 3rd, 7th)
   - **Variation 2:** Shell Position B (LH: root, RH: 7th, 3rd)
   - **Variation 3:** Open Voicing (LH: root, 5th | RH: 3rd, 7th)
3. User can play back each variation with audio
4. Visual piano keyboard shows each voicing with color-coded notes:
   - Root (e.g., red)
   - Third (e.g., blue)
   - Fifth (e.g., green)
   - Seventh (e.g., purple)
5. User can switch between variations and compare them

**Chord Scope:**
- **7th chords only** (no extensions in MVP)
- Dm7 (D-F-A-C), G7 (G-B-D-F), Cmaj7 (C-E-G-B)
- Multiple inversions and voicing shapes
- Different "fullness" levels (sparse shells vs. fuller drop-2)

**Technical Constraints:**
- Only works in **C major** for MVP (algorithm built to support other keys, but UI locked to C)
- Fixed progression: ii-V-I only
- No saving/exporting voicings
- No user customization of voicing parameters

### What's OUT of Scope ❌

**Deferred to v1.1 (Fast Follow):**
- Extensions (9ths, 11ths, 13ths) - these should be easy to add with toggle controls
- Altered dominants (G7♭9, G7♯11, etc.)
- Key selection (other than C major)

**Deferred to v2+:**
- Other progressions (I-VI-ii-V, turnarounds, etc.)
- Drag-and-drop block interface
- Practice mode with metronome
- Rhythm/syncopation controls
- Hand independence exercises
- Style presets (Bill Evans, Herbie Hancock, etc.)
- Save/load progressions
- Export to MIDI/sheet music
- Voice leading visualization (animated lines between notes)
- Functional harmony blocks interface
- Substitution suggestions

**Success Criteria:**
MVP is successful if you can hear ii-V-I in C major voiced 3 different ways, see them on a keyboard, and understand why each style sounds different.

---

## Technical Architecture

### Stack Recommendations

**Frontend Framework:**
- **React** - Component-based, easy to manage UI state
- **TypeScript** - Critical for music theory types (Note, Chord, Voicing interfaces)
- **Tailwind CSS** - Fast styling for keyboard visualization and controls

**Audio Engine:**
- **Tone.js** - Handles scheduling, playback, includes piano samples
- No custom WASM needed for MVP (can revisit for v2 if sound quality matters)

**Deployment:**
- Static site (Vercel, Netlify, GitHub Pages)
- No backend needed

### Core Data Structures

```typescript
// Note representation
type NoteName = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B";
type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type Note = `${NoteName}${Octave}`; // e.g., "C4", "F#3"

// Chord representation
interface Chord {
  root: NoteName;
  quality: ChordQuality;
}

type ChordQuality = "maj7" | "min7" | "dom7" | "min7b5" | "dim7";

// Chord tones (output of algorithm)
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

// Voicing template (hardcoded patterns)
type VoicingRole = "root" | "third" | "fifth" | "seventh" | "ninth" | "eleventh" | "thirteenth";

interface VoicingTemplate {
  name: string;
  leftHand: VoicingRole[];
  rightHand: VoicingRole[];
  octaves: {
    leftHandBase: Octave;   // e.g., 3 (starts at octave 3)
    rightHandBase: Octave;  // e.g., 4 (starts at octave 4)
  };
}

// Final voicing (template applied to chord tones)
interface Voicing {
  chord: Chord;
  template: string;
  leftHand: Note[];
  rightHand: Note[];
}

// Full progression
interface Progression {
  chords: Chord[];          // [Dm7, G7, Cmaj7]
  voicings: Voicing[][];    // 3 variations × 3 chords = 9 total voicings
}
```

### Architecture: Two-Layer Hybrid System

**Layer 1: Chord Note Generator (Algorithm)**
Calculates the notes that make up a chord, regardless of where they're played on the piano.

```typescript
function getChordTones(chord: Chord): ChordTones {
  const { root, quality } = chord;
  
  // Calculate intervals based on chord quality
  const intervals = CHORD_FORMULAS[quality];
  // e.g., "maj7" → [0, 4, 7, 11] (root, maj3rd, 5th, maj7th)
  
  return {
    root: root,
    third: calculateNote(root, intervals.third),
    fifth: calculateNote(root, intervals.fifth),
    seventh: calculateNote(root, intervals.seventh),
    // extensions: calculated if needed (v1.1)
  };
}

// Example output:
// getChordTones({root: "C", quality: "maj7"})
// → {root: "C", third: "E", fifth: "G", seventh: "B"}
```

**Layer 2: Voicing Templates (Hardcoded)**
Define which chord tones go in which hand and octave, following standard jazz piano pedagogy.

```typescript
const SHELL_POSITION_A: VoicingTemplate = {
  name: "Shell Position A",
  leftHand: ["root"],
  rightHand: ["third", "seventh"],
  octaves: {
    leftHandBase: 2,   // LH at octave 2
    rightHandBase: 3   // RH at octave 3
  }
};

const SHELL_POSITION_B: VoicingTemplate = {
  name: "Shell Position B",
  leftHand: ["root"],
  rightHand: ["seventh", "third"],  // Inverted from Position A
  octaves: {
    leftHandBase: 2,
    rightHandBase: 3
  }
};

const OPEN_VOICING: VoicingTemplate = {
  name: "Open Voicing",
  leftHand: ["root", "fifth"],
  rightHand: ["third", "seventh"],
  octaves: {
    leftHandBase: 2,
    rightHandBase: 3
  }
};
```

**Combining Layers:**
```typescript
function generateVoicing(chord: Chord, template: VoicingTemplate): Voicing {
  const tones = getChordTones(chord);
  
  const leftHand = template.leftHand.map((role, i) => {
    const noteName = tones[role];
    const octave = template.octaves.leftHandBase + Math.floor(i / 3);
    return `${noteName}${octave}`;
  });
  
  const rightHand = template.rightHand.map((role, i) => {
    const noteName = tones[role];
    const octave = template.octaves.rightHandBase + Math.floor(i / 3);
    return `${noteName}${octave}`;
  });
  
  return { chord, template: template.name, leftHand, rightHand };
}

// Example:
// generateVoicing({root: "C", quality: "maj7"}, SHELL_ROOTLESS)
// → { leftHand: ["E3", "B3"], rightHand: ["G4", "D5"] }
```

### Voicing Algorithm: Implementation Details

**Step 1: Note Calculation**
```typescript
// Chromatic scale for interval math
const CHROMATIC_SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function calculateNote(root: NoteName, semitones: number): NoteName {
  const rootIndex = CHROMATIC_SCALE.indexOf(root);
  const targetIndex = (rootIndex + semitones) % 12;
  return CHROMATIC_SCALE[targetIndex];
}

// Chord formulas (in semitones from root)
const CHORD_FORMULAS = {
  maj7: { third: 4, fifth: 7, seventh: 11 },
  min7: { third: 3, fifth: 7, seventh: 10 },
  dom7: { third: 4, fifth: 7, seventh: 10 },
  min7b5: { third: 3, fifth: 6, seventh: 10 },
  dim7: { third: 3, fifth: 6, seventh: 9 }
};
```

**Step 2: Voice Leading (MVP - Manual Design)**
For MVP, each template will have **manually designed voice leading** for the ii-V-I progression. These voicings follow standard jazz piano pedagogy from Julian Bradley's method:

```typescript
// Hardcoded voice-led progressions for each template

// Shell Position A (1-3-7): Root in LH, 3rd+7th in RH
const SHELL_A_PROGRESSION = [
  // Dm7: D2 | F3, C4
  { leftHand: ["D2"], rightHand: ["F3", "C4"] },
  // G7: G2 | B3, F4 (C moves down to B, smooth voice leading)
  { leftHand: ["G2"], rightHand: ["B3", "F4"] },
  // Cmaj7: C2 | E3, B3 (F moves down to E, B stays)
  { leftHand: ["C2"], rightHand: ["E3", "B3"] }
];

// Shell Position B (1-7-3): Root in LH, 7th+3rd in RH
const SHELL_B_PROGRESSION = [
  // Dm7: D2 | C3, F4
  { leftHand: ["D2"], rightHand: ["C3", "F4"] },
  // G7: G2 | F3, B4 (C moves down to B, F stays but octave adjusts)
  { leftHand: ["G2"], rightHand: ["F3", "B4"] },
  // Cmaj7: C2 | B3, E4 (F moves down to E)
  { leftHand: ["C2"], rightHand: ["B3", "E4"] }
];

// Open Voicing (1-5 / 3-7): Root+5th in LH, 3rd+7th in RH
const OPEN_VOICING_PROGRESSION = [
  // Dm7: D2, A2 | F3, C4
  { leftHand: ["D2", "A2"], rightHand: ["F3", "C4"] },
  // G7: G2, D3 | B3, F4
  { leftHand: ["G2", "D3"], rightHand: ["B3", "F4"] },
  // Cmaj7: C2, G2 | E3, B3
  { leftHand: ["C2", "G2"], rightHand: ["E3", "B3"] }
];
```

This approach:
- ✅ Ensures smooth voice leading (manually designed)
- ✅ Works immediately without complex algorithms
- ✅ Algorithm still handles note generation (enables key transposition later)
- ❌ Requires manual design for each new progression (acceptable for MVP)

**Step 3: Transposition (Post-MVP)**
When adding key selection, the algorithm will transpose the manually designed voice leading:

```typescript
function transposeVoicing(voicing: Voicing, fromKey: NoteName, toKey: NoteName): Voicing {
  const semitones = calculateInterval(fromKey, toKey);
  
  return {
    ...voicing,
    leftHand: voicing.leftHand.map(note => transposeNote(note, semitones)),
    rightHand: voicing.rightHand.map(note => transposeNote(note, semitones))
  };
}
```

### Audio Implementation (Tone.js)

```typescript
import * as Tone from 'tone';

// Initialize sampler with piano samples
const piano = new Tone.Sampler({
  urls: {
    C3: "C3.mp3",
    "D#3": "Ds3.mp3",
    "F#3": "Fs3.mp3",
    A3: "A3.mp3",
    C4: "C4.mp3",
    "D#4": "Ds4.mp3",
    "F#4": "Fs4.mp3",
    A4: "A4.mp3",
  },
  baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();

// Play single voicing
function playVoicing(voicing: Voicing) {
  const now = Tone.now();
  const allNotes = [...voicing.leftHand, ...voicing.rightHand];
  
  piano.triggerAttackRelease(allNotes, "2n", now);
}

// Play full progression (one variation)
function playProgression(voicings: Voicing[]) {
  let time = Tone.now();
  voicings.forEach((voicing) => {
    const allNotes = [...voicing.leftHand, ...voicing.rightHand];
    piano.triggerAttackRelease(allNotes, "2n", time);
    time += 2; // 2 seconds per chord
  });
}
```

### Keyboard Visualization

**Component Structure:**
```typescript
interface PianoKeyboardProps {
  voicing: Voicing;
  highlightColors: {
    root: string;
    third: string;
    fifth: string;
    seventh: string;
  };
}

// Render 4-octave keyboard (C2-C6)
<PianoKeyboard 
  voicing={currentVoicing}
  highlightColors={{
    root: "bg-red-500",
    third: "bg-blue-500",
    fifth: "bg-green-500",
    seventh: "bg-purple-500"
  }}
/>
```

**Rendering approach:**
- SVG or Canvas for visualization
- 4-octave view (C2-C6 covers typical jazz piano range)
- Color-code by chord function (root, 3rd, 5th, 7th)
- Optional: show note names on hover or always visible

**Color Coding:**
- Root: Red
- Third: Blue  
- Fifth: Green
- Seventh: Purple
- Extensions (v1.1): Yellow

---

## Build Phases

### Phase 1: Text-Based Algorithm Proof of Concept
**Goal:** Validate the voicing algorithm works correctly

**UI:**
- Simple HTML page with dropdowns (locked to Dm7-G7-Cmaj7 for MVP)
- Three buttons: "Shell + Rootless", "Drop-2", "Two-Handed Rootless"
- Text output displaying voicings:
  ```
  Dm7 - Shell + Rootless:
  LH: F3, C4
  RH: A4, E5
  
  G7 - Shell + Rootless:
  LH: B3, F4
  RH: D4, G4
  
  Cmaj7 - Shell + Rootless:
  LH: E3, B3
  RH: G4, D5
  ```

**Tasks:**
1. Implement `getChordTones()` function
2. Define 3 `VoicingTemplate` objects
3. Implement `generateVoicing()` function
4. Hardcode voice-led progressions for each template
5. Display output as formatted text

**Validation Questions:**
- ✅ Are the notes correct for each chord?
- ✅ Do the voicings follow proper technique (shells, drop-2, rootless)?
- ✅ Does the voice leading look smooth on paper?

**Estimated Time:** 1-2 days

---

### Phase 2: Add Audio Playback (Still Text UI)
**Goal:** Hear if the voicings actually sound good

**New Features:**
- Integrate Tone.js
- Add "Play" button next to each variation
- Add "Play All" button to hear the full progression
- Handle audio initialization (user gesture requirement)

**Tasks:**
1. Install and configure Tone.js
2. Implement `playVoicing()` function
3. Implement `playProgression()` function
4. Add play buttons to UI
5. Handle audio context initialization

**Validation Questions:**
- ✅ Do the voicings sound good?
- ✅ Is the voice leading smooth (no jarring jumps)?
- ✅ Do different variations sound distinctly different?
- ✅ Are there any timing/latency issues?

**Estimated Time:** 1-2 days

---

### Phase 3: Build Piano Keyboard Visualization
**Goal:** Replace text output with visual keyboard

**New Features:**
- Visual piano keyboard component (C2-C6)
- Color-coded note highlighting
- Animated transitions between voicings (optional)
- Note labels (R, 3, 5, 7) on keys

**Tasks:**
1. Build `PianoKeyboard` component (SVG or Canvas)
2. Implement note highlighting logic
3. Add color coding by chord function
4. Replace text output with keyboard visualization
5. Add smooth transitions when switching variations

**Validation Questions:**
- ✅ Can you clearly see which notes are being played?
- ✅ Does color coding help identify chord tones?
- ✅ Is it easier to understand voicings visually vs. text?
- ✅ Does visualization help you learn hand positions?

**Estimated Time:** 2-3 days

---

### Phase 4: Polish & Complete MVP
**Goal:** Ship a production-ready tool

**Tasks:**
1. Improve UI styling (Tailwind CSS)
2. Add loading states for audio
3. Add keyboard shortcuts (spacebar to play, arrow keys to switch)
4. Responsive design (works on tablet/desktop)
5. Add brief instructional text
6. Error handling and edge cases
7. Performance optimization

**Validation Questions:**
- ✅ Would you actually use this tool to practice?
- ✅ Is it intuitive without instructions?
- ✅ Does it work smoothly on your devices?

**Estimated Time:** 1-2 days

---

## Open Questions / Decisions Needed

### Music Theory Decisions

**Q: Which specific voicings should we use for each template?**
**Decision needed:** You'll need to manually design the exact voicings for each variation, ensuring smooth voice leading. Reference the Mark Galang book for guidance.

**Q: Should extensions (9ths) be included even in "basic" voicings?**
**Current decision:** No, MVP uses only 7th chords. Extensions in v1.1.
**Rationale:** Keeps algorithm simpler, but the book shows even basic voicings use 9ths. Revisit after Phase 2 if voicings sound too sparse.

**Q: What octave ranges should LH and RH use?**
**Recommendation:** 
- LH: Octave 2-3 (bass/tenor range)
- RH: Octave 4-5 (alto/soprano range)
**Rationale:** Matches typical jazz piano voicing ranges

### Technical Decisions

**Q: SVG or Canvas for keyboard visualization?**
**Recommendation:** SVG
**Rationale:** Easier to style with CSS, better for accessibility, click/hover events simpler

**Q: Should we calculate optimal voice leading algorithmically or hardcode it?**
**Decision:** Hardcode for MVP, algorithm in v2
**Rationale:** Voice leading is complex and subjective. Manual design ensures quality. Algorithm can be added later for key transposition.

**Q: How long should each chord play in "Play All" mode?**
**Recommendation:** 2 seconds per chord
**Rationale:** Slow enough to hear voicing, fast enough to feel progression

### UX Decisions

**Q: Should variations be shown side-by-side or one at a time?**
**Recommendation:** One at a time with tabs/buttons to switch
**Rationale:** Keyboard visualization is large; showing 3 at once clutters the screen

**Q: Should we show note names on piano keys?**
**Recommendation:** Show on hover or as a toggle
**Rationale:** Cleaner default view, available for learners who need it

**Q: Should playback be blocking (one voicing at a time) or allow multiple?**
**Recommendation:** Blocking (stop current before playing new)
**Rationale:** Prevents audio chaos, clearer learning experience

---

## Next Steps

### Getting Started

1. **Set up project:**
   ```bash
   npx create-react-app voicing-lab --template typescript
   cd voicing-lab
   npm install tone tailwindcss
   npx tailwindcss init
   ```

2. **Start with Phase 1:**
   - Create basic React components
   - Implement chord tone calculation
   - Hardcode first voicing template
   - Display as text output

3. **Validate early:**
   - Play the voicings on your own piano
   - Do they match what you'd expect?
   - Do they sound good together?

4. **Iterate:**
   - Complete Phase 1 → get feedback from yourself
   - Add audio (Phase 2) → validate it sounds good
   - Add visualization (Phase 3) → validate it helps learning
   - Polish (Phase 4) → ship it

---

## Future Vision (Post-MVP)

### v1.1 - Extensions & Alterations
- Add 9ths, 11ths, 13ths as toggles
- Altered dominants (G7♭9, G7♯11, G7♯9♭13)
- Voice leading algorithm (smooth transitions automatically)

### v1.2 - Multiple Keys
- Key selector (all 12 keys)
- Transpose voicings using algorithm
- Practice in different keys

### v2.0 - Multiple Progressions
- I-VI-ii-V turnaround
- Rhythm changes (I-VI-ii-V)
- Blues progression
- Custom progression builder

### v3.0 - Advanced Features
- Style presets (Bill Evans, Red Garland, McCoy Tyner)
- Practice mode with metronome
- Rhythm/syncopation layer
- Voice leading visualization (animated lines)
- Hand independence exercises
- Save/export progressions
- MIDI export

---

## Resources for Implementation

**Music Theory:**
- Mark A. Galang - "Ultimate Jazz Chords & Arpeggios" (reference material)
- Mark Levine - "The Jazz Piano Book"
- [Jazz Piano Voicings 101](https://www.learnjazzstandards.com/blog/learning-jazz-piano/jazz-piano-voicings-101/)

**Tone.js:**
- [Official Docs](https://tonejs.github.io/)
- [Piano Sampler Example](https://tonejs.github.io/examples/sampler)
- [Scheduling Guide](https://tonejs.github.io/docs/latest/classes/Transport.html)

**Piano Keyboard UI:**
- [react-piano](https://github.com/kevinsqi/react-piano) (reference)
- [SVG Piano Key Tutorial](https://css-tricks.com/svg-piano-keyboard/)

**Music Theory Libraries:**
- [tonal](https://github.com/tonaljs/tonal) - Consider for note/chord calculations
- May build custom to keep bundle size small

---

**Document Version:** 2.0  
**Last Updated:** December 2024  
**Status:** Ready for Phase 1 implementation