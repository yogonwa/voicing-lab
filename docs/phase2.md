# Phase 2.5: Chord Explorer with Extensions - Implementation Spec

## Context

This document provides detailed implementation specifications for Phase 2.5 of the Voicing Lab project. This phase extends the existing Chord Calculator into a full Chord Explorer by adding extension support and keyboard visualization.

**Parent Document:** [Design_Doc.md](./Design_Doc.md#phase-25-add-extensions)

**Prerequisites:** 
- Phase 1 complete (chord calculator algorithm working)
- Phase 2 complete (audio + keyboard components exist)
- Extension algorithms implemented (getExtendedChordTones, shouldAvoidExtension, etc.)

---

## Goals

### Primary Goal
Transform the Chord Calculator into an interactive Chord Explorer where users can:
1. Select any chord (root + quality)
2. Add/remove extensions (9ths, 11ths, 13ths, alterations)
3. See all notes as blocks AND on a piano keyboard
4. Hear the chord played as a block chord
5. Receive warnings about avoid notes

### Learning Outcomes
By the end of this phase, users should understand:
- What extensions are available for each chord type
- How extensions change the sound/color of a chord
- Which extensions are characteristic vs. avoid notes
- Where extensions sit on the keyboard relative to chord tones

### What This Is NOT
- NOT a voicing tool (that's Decision Tree / Phase 3+)
- NOT showing inversions (that's Phase 4)
- NOT showing hand positions (that's Decision Tree)
- NOT building progressions (that's Decision Tree)

This is isolated, single-chord exploration.

---

## Design Decisions

### 1. Keyboard Colors
- **Keep** existing multi-color for chord tone roles (Root=red, 3rd=blue, 5th=green, 7th=purple)
- **Remove** LH/RH border differentiation (not relevant for single-chord exploration)
- **Add** new colors for extensions:
  - 9th = Orange (#f6ad55)
  - 11th = Teal (#4fd1c5)
  - 13th = Yellow (#faf089)
  - Alterations = Pink/Coral shades

### 2. Extension Layout
Group checkboxes by degree:
```
9ths:  ☐ 9   ☐ ♭9   ☐ ♯9
11ths: ☐ 11  ☐ ♯11
13ths: ☐ 13  ☐ ♭13
```

### 3. Component Strategy
Replace existing `ChordToneDisplay` component with new `ChordExplorer`

### 4. 6th Chords
Treated as separate chord quality (not an extension). May add later as quality option.

---

## User Stories

### Story 1: Basic Extension Exploration
```
As a user learning jazz harmony,
I want to add a 9th to a Cmaj7 chord,
So that I can hear and see how it enriches the sound.

Acceptance Criteria:
- Can check "9" extension checkbox
- Chord display updates to show "Cmaj9"
- Blocks show: R-3-5-7-9 (C-E-G-B-D)
- Keyboard highlights all 5 notes (9th in orange)
- Play button plays all 5 notes as block chord
- Can uncheck to remove 9th
```

### Story 2: Multiple Extensions
```
As a user,
I want to add multiple extensions (9, #11, 13) to Cmaj7,
So that I can explore rich, modern jazz voicings.

Acceptance Criteria:
- Can check multiple extension boxes simultaneously
- Blocks grow to show all selected notes (up to 7)
- Keyboard highlights all notes with appropriate colors
- Audio plays all selected notes together
```

### Story 3: Avoid Note Warning
```
As a user,
I want to know when an extension might sound bad,
So that I don't accidentally create dissonant chords.

Acceptance Criteria:
- When selecting G7 + 11th, see warning icon
- Tooltip explains: "11th clashes with major 3rd on dominant chords"
- Suggestion provided: "Try #11 instead"
- Can still check it and hear it (learning by doing)
- Warning is non-blocking (yellow, not red)
```

### Story 4: Quality-Appropriate Extensions
```
As a user,
I want to see only relevant extensions for the chord quality I've selected,
So that I'm not overwhelmed with irrelevant options.

Acceptance Criteria:
- Cmaj7 shows: 9, #11, 13
- Dm7 shows: 9, 11, 13 (with 13 warning)
- G7 shows: 9, ♭9, ♯9, ♯11, 13, ♭13
- Extension checkboxes update when quality changes
- All extension checkboxes reset when root or quality changes
```

---

## Technical Requirements

### Data Structures (Already Implemented)

We already have these from Phase 2.5 work:

```typescript
// Already in chordCalculator.ts
interface ExtendedChordTones extends ChordTones {
  extensions: Extensions;
  alterations?: Alterations;
}

// Extension types already defined
type ExtensionRole = "ninth" | "eleventh" | "thirteenth";
type AlterationRole = "flatNinth" | "sharpNinth" | "sharpEleventh" | "flatThirteenth";

// Already implemented
AVOID_EXTENSIONS: Record<ChordQuality, ExtensionRole[]>
SAFE_EXTENSIONS: Record<ChordQuality, ExtensionRole[]>
shouldAvoidExtension(chord, extension): boolean
getExtendedChordTones(chord): ExtendedChordTones
getSafeExtensions(chord): Partial<Extensions>
```

### New Types Needed

```typescript
// Selected extensions state
interface SelectedExtensions {
  ninth?: boolean;
  flatNinth?: boolean;
  sharpNinth?: boolean;
  eleventh?: boolean;
  sharpEleventh?: boolean;
  thirteenth?: boolean;
  flatThirteenth?: boolean;
}

// Extension configuration for UI
interface ExtensionOption {
  key: keyof SelectedExtensions;
  label: string;           // "9", "♭9", "♯9", etc.
  group: "9ths" | "11ths" | "13ths";
  isAlteration: boolean;   // true for ♭9, ♯9, ♯11, ♭13
}

// Available extensions by quality
const AVAILABLE_EXTENSIONS: Record<ChordQuality, ExtensionOption[]>
```

### Available Extensions by Quality

```typescript
const AVAILABLE_EXTENSIONS: Record<ChordQuality, ExtensionOption[]> = {
  maj7: [
    { key: "ninth", label: "9", group: "9ths", isAlteration: false },
    { key: "sharpEleventh", label: "♯11", group: "11ths", isAlteration: false },
    { key: "thirteenth", label: "13", group: "13ths", isAlteration: false },
  ],
  min7: [
    { key: "ninth", label: "9", group: "9ths", isAlteration: false },
    { key: "eleventh", label: "11", group: "11ths", isAlteration: false },
    { key: "thirteenth", label: "13", group: "13ths", isAlteration: false }, // with warning
  ],
  dom7: [
    { key: "ninth", label: "9", group: "9ths", isAlteration: false },
    { key: "flatNinth", label: "♭9", group: "9ths", isAlteration: true },
    { key: "sharpNinth", label: "♯9", group: "9ths", isAlteration: true },
    { key: "sharpEleventh", label: "♯11", group: "11ths", isAlteration: false },
    { key: "thirteenth", label: "13", group: "13ths", isAlteration: false },
    { key: "flatThirteenth", label: "♭13", group: "13ths", isAlteration: true },
  ],
  min7b5: [
    { key: "ninth", label: "9", group: "9ths", isAlteration: false },
    { key: "eleventh", label: "11", group: "11ths", isAlteration: false },
  ],
  dim7: [
    { key: "ninth", label: "9", group: "9ths", isAlteration: false },
    { key: "eleventh", label: "11", group: "11ths", isAlteration: false },
  ],
};
```

---

## UI Specifications

### Layout Structure

```
┌────────────────────────────────────────────────────────────┐
│ CHORD EXPLORER                                              │
│                                                             │
│ ┌──────────────┐  ┌──────────────────┐                     │
│ │ Root: C   ▼  │  │ Quality: Major 7 ▼│                    │
│ └──────────────┘  └──────────────────┘                     │
│                                                             │
│ Extensions:                                                 │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 9ths:  ☐ 9                                              ││
│ │ 11ths: ☐ ♯11                                            ││
│ │ 13ths: ☐ 13                                             ││
│ └─────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Cmaj7                                          [▶ Play]    │
│                                                             │
│ Notes:                                                      │
│ ┌───┬───┬───┬───┐                                          │
│ │ R │ 3 │ 5 │ 7 │  ← Chord tones (colored by role)         │
│ │ C │ E │ G │ B │                                          │
│ └───┴───┴───┴───┘                                          │
│                                                             │
│ 🎹 Piano Keyboard (C3 - C6)                                 │
│    [Visual keyboard with C, E, G, B highlighted]            │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### With Extensions Selected

```
┌────────────────────────────────────────────────────────────┐
│ CHORD EXPLORER                                              │
│                                                             │
│ Root: [C ▼]  Quality: [Major 7 ▼]                          │
│                                                             │
│ Extensions:                                                 │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 9ths:  ☑ 9                                              ││
│ │ 11ths: ☑ ♯11                                            ││
│ │ 13ths: ☑ 13                                             ││
│ └─────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ Cmaj13(♯11)                                    [▶ Play]    │
│                                                             │
│ Notes:                                                      │
│ ┌───┬───┬───┬───┐ ┌───┬────┬────┐                         │
│ │ R │ 3 │ 5 │ 7 │ │ 9 │♯11│ 13 │ ← Extensions (new colors)│
│ │ C │ E │ G │ B │ │ D │F♯ │ A  │                          │
│ └───┴───┴───┴───┘ └───┴────┴────┘                         │
│                                                             │
│ 🎹 Piano Keyboard                                           │
│    [C=red, E=blue, G=green, B=purple, D=orange, F#=teal,   │
│     A=yellow]                                               │
│                                                             │
│ 💡 ♯11 (F♯) adds Lydian color - bright, modern sound       │
└────────────────────────────────────────────────────────────┘
```

### With Avoid Note Warning (dom7 example)

```
┌────────────────────────────────────────────────────────────┐
│ Root: [G ▼]  Quality: [Dominant 7 ▼]                       │
│                                                             │
│ Extensions:                                                 │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 9ths:  ☐ 9   ☐ ♭9   ☐ ♯9                                ││
│ │ 11ths: ☐ 11 ⚠️  ☐ ♯11                                   ││
│ │ 13ths: ☐ 13   ☐ ♭13                                     ││
│ └─────────────────────────────────────────────────────────┘│
│                    └─ Warning tooltip on hover              │
└────────────────────────────────────────────────────────────┘

Tooltip content:
┌────────────────────────────────────────┐
│ ⚠️ Avoid Note                          │
│                                        │
│ Natural 11th (C) clashes with         │
│ major 3rd (B) on dominant chords       │
│                                        │
│ 💡 Try ♯11 (C♯) for altered sound      │
└────────────────────────────────────────┘
```

---

## Component Architecture

```
<ChordExplorer>
  <ChordControls>
    <RootSelector value={root} onChange={setRoot} />
    <QualitySelector value={quality} onChange={setQuality} />
  </ChordControls>
  
  <ExtensionPanel 
    quality={quality}
    selected={selectedExtensions}
    onToggle={handleExtensionToggle}
  />
  
  <ChordDisplay>
    <ChordHeader 
      root={root}
      quality={quality}
      extensions={selectedExtensions}
    />
    
    <NoteBlocks 
      chordTones={extendedChordTones}
      selectedExtensions={selectedExtensions}
    />
    
    <PianoKeyboard 
      activeNotes={activeNotes}
      startOctave={3}
      endOctave={5}
    />
    
    <PlayButton onClick={handlePlay} />
    
    <TipsSection extensions={selectedExtensions} />
  </ChordDisplay>
</ChordExplorer>
```

---

## Color Specifications

### Chord Tone Colors (Keep Existing)
```css
--color-root: #fc8181;      /* Red */
--color-third: #63b3ed;     /* Blue */
--color-fifth: #68d391;     /* Green */
--color-seventh: #b794f4;   /* Purple */
```

### Extension Colors (New)
```css
--color-ninth: #f6ad55;           /* Orange */
--color-eleventh: #4fd1c5;        /* Teal */
--color-thirteenth: #faf089;      /* Yellow */

/* Alterations - slightly different shades */
--color-flat-ninth: #fc8181;      /* Red (tension) */
--color-sharp-ninth: #ed64a6;     /* Pink */
--color-sharp-eleventh: #9f7aea;  /* Light purple (Lydian) */
--color-flat-thirteenth: #f687b3; /* Pink/coral */
```

### Warning Colors
```css
--warning-bg: #fef3c7;       /* Amber-100 */
--warning-border: #f59e0b;   /* Amber-500 */
--warning-icon: #d97706;     /* Amber-600 */
```

---

## Audio Implementation

### Block Chord Playback

```typescript
// Play chord as block (all notes together) starting from octave 4
function playBlockChord(notes: NoteName[]): void {
  // Voice notes starting from octave 4, stacking upward
  const voicedNotes = notes.map((note, index) => {
    const octave = 4 + Math.floor(index / 4); // Spread across octaves if many notes
    return `${note}${octave}`;
  });
  
  playVoicing({
    leftHand: [voicedNotes[0]], // Root in left hand
    rightHand: voicedNotes.slice(1), // Rest in right hand
  });
}
```

---

## Implementation Checklist

### Data Layer ✅
- [x] Create `SelectedExtensions` type
- [x] Create `ExtensionOption` interface  
- [x] Create `AVAILABLE_EXTENSIONS` config (in `extensionConfig.ts`)
- [x] Create helper to get notes for selected extensions
- [x] Fix #11 bug: Move `sharpEleventh` to `Extensions` (available for all qualities)

### Components ✅
- [x] Create `ChordExplorer` main component
- [x] Create `ExtensionPanel` component (grouped checkboxes)
- [x] Create warning icon with tooltip for avoid notes
- [x] Create `NoteBlocks` component to show chord tones + extensions
- [x] Update `PianoKeyboard` to remove LH/RH borders
- [x] Add extension colors to keyboard visualization
- [x] Wire up block chord audio playback

### Integration ✅
- [x] Replace `ChordToneDisplay` with `ChordExplorer` in App
- [x] Update tests (all 138 tests passing)
- [x] Fix root positioning: octave 3 for root, 4 for chord tones, 5 for extensions

### Future Enhancements 🔜
- [ ] Create dedicated `TipsSection` component with extension tips
- [ ] Add animated transitions for extension toggle
- [ ] Add ARIA labels for accessibility
- [ ] Cross-browser testing
- [ ] Responsive design for tablet

---

## Extension Tips Content

```typescript
const EXTENSION_TIPS: Record<string, string> = {
  ninth: "Adds smooth color - the most common extension",
  flatNinth: "Creates tension, wants to resolve downward",
  sharpNinth: "Blues/funk color - the 'Hendrix chord' sound",
  eleventh: "Suspended, open sound - great on minor chords",
  sharpEleventh: "Lydian color - bright, modern, dreamy",
  thirteenth: "Brightens the chord - characteristic of V13",
  flatThirteenth: "Darker altered color - creates tension",
};
```

---

## Success Criteria

- [x] Can select any root + quality combination
- [x] Extension checkboxes update based on quality
- [x] Can toggle multiple extensions on/off
- [x] Avoid notes show warning icon with tooltip
- [x] Note blocks display chord tones and extensions with correct colors
- [x] Keyboard highlights all notes with role-appropriate colors
- [x] Play button plays all selected notes as block chord
- [x] Tips section shows contextual information (inline with extensions)
- [x] All extensions reset when root/quality changes
- [x] Root shows in lower octave (C3) for proper keyboard positioning

**Status**: Phase 2.5 Complete ✅ (Last updated: Dec 10, 2025)
