# Octave Placement Rules - Implementation Specification

## Overview

This document defines the algorithm for mapping playground blocks (user-defined note order) to piano octaves. The system must intelligently distribute notes across the keyboard following jazz piano voicing principles while respecting user's creative drag-and-drop arrangement.

**Context:** Playground Mode allows users to reorder chord tones and extensions. The system must determine which octave each note should play in based on musical rules and user intent.

---

## Global Rules (NEVER VIOLATED)

These rules are **immutable** and must be enforced in all cases:

### Rule 1: Root Lowest Only When User Keeps It in the Bass Position
```
IF root note exists AND is the leftmost enabled block (user kept root in bass position):
  Root SHOULD be the lowest pitched note (standard jazz convention)
  
IF user drags root out of leftmost enabled position:
  Display warning: "⚠️ Root should be lowest for clear harmony"
  Allow the arrangement AND respect the user's order in audio (root may not be the lowest pitch)
  
IF rootless voicing (no root present):
  Leftmost block becomes bass note
```

**Implementation:**
```typescript
function getRootWarning(blocks: PlaygroundBlock[]): string | null {
  const enabled = blocks.filter(b => b.enabled);
  const rootIndex = enabled.findIndex(b => b.role === 'root');
  if (rootIndex > 0) return "Root should be lowest for clear harmony";
  return null;
}
```

---

### Rule 2: Minimum Spread = 1 Octave
```
The span from lowest to highest note must be at least 12 semitones (1 octave)

IF all notes would cluster within less than 1 octave:
  Force distribution across full octave
  
Exceptions (musical + UX):
- 2-note voicings (power chords, intervals) can be < 1 octave
- 3-note voicings (shells/triads) may be < 1 octave if they are not overly clustered.
  Typical close-position shells/triads often span 7–11 semitones and should be allowed.
  We only force extra spread for 3-note clusters that sound/feel cramped.
```

---

### Rule 3: Maximum Spread = 2.5 Octaves (30 semitones)
```
Maximum range: C3 to B6 (30 semitones)

IF calculated octaves would exceed this:
  Compress voicing by lowering top notes
```

---

### Rule 4: No Close Intervals in Bass (Octaves 2-3)
```
IF two adjacent notes are both below C4:
  AND interval between them < 5 semitones (perfect 4th):
    Raise the higher note by one octave
    
Reason: Close intervals in bass register sound muddy on piano
```

**Implementation:**
```typescript
function avoidMuddyBass(notes: Note[]): Note[] {
  for (let i = 0; i < notes.length - 1; i++) {
    const note1 = notes[i];
    const note2 = notes[i + 1];
    
    if (getOctave(note1) < 4 && getOctave(note2) < 4) {
      const interval = getInterval(note1, note2);
      
      if (interval < 5) {
        // Raise note2 by one octave
        notes[i + 1] = raiseOctave(note2);
      }
    }
  }
  
  return notes;
}
```

---

### Rule 5: Maximum Top Note = B6
```
No note should exceed B6 (one note below C7)

Keyboard visualization range: C3 - C7 (visible)
Playable range: C3 - B6

IF any note would be placed at C7 or higher:
  Drop it down one octave
```

---

## Contextual Rules (Adjust Based on Voicing)

These rules adapt based on **note count** and **density**:

### Rule 6: Note Count Determines Target Spread

```
3 notes (shell voicings):
  Target spread: ~7 semitones (perfect 5th) minimum, allow close-position shells/triads
  Base octave: 4
  Example: C4, E4, B4

4 notes (open voicings):
  Target spread: 18 semitones (1.5 octaves)
  Base octave: 4
  Example: C4, G4, E5, B5

5 notes (extensions):
  Target spread: 24 semitones (2 octaves)
  Base octave: 4
  Example: C4, E4, G4, B4, D5, F#5

6+ notes (dense extensions):
  Target spread: 30 semitones (2.5 octaves)
  Base octave: 3 (drop bass for more room)
  Example: C3, E3, G3, B3, D4, F#4, A4
```

**Formula:**
```typescript
function getTargetSpread(noteCount: number): number {
  if (noteCount <= 2) return 12;  // Minimum 1 octave
  // For 3-note voicings, allow close-position shells/triads (e.g. E–G–B spans 7 semitones)
  // while still spreading truly clustered stacks (e.g. C–D–E spans 4).
  if (noteCount === 3) return 7;
  if (noteCount === 4) return 18;  // 1.5 octaves
  if (noteCount === 5) return 24;  // 2 octaves
  return 30; // Max 2.5 octaves
}

function getBaseOctave(noteCount: number): number {
  if (noteCount <= 5) return 4;  // Standard range (C4-C6)
  return 3; // Dense voicings start lower (C3-B5)
}
```

---

## The Core Algorithm: Drag-Order Octave Placement

**Key Principle:** Respect user's drag order (left-to-right = low-to-high intent) while wrapping octaves intelligently when chromatic pitch decreases.

### Step 1: Extract Enabled Blocks in Drag Order

```typescript
function getEnabledBlocks(blocks: PlaygroundBlock[]): PlaygroundBlock[] {
  return blocks.filter(b => b.enabled);
}
```

---

### Step 2: Determine Base Octave

```typescript
function getBaseOctave(
  noteCount: number, 
  hasRoot: boolean,
  userIntent?: 'compact' | 'spread'
): number {
  // For presets
  if (userIntent === 'compact' && noteCount <= 4) return 4;
  if (userIntent === 'spread' || noteCount >= 6) return 3;
  
  // Default logic
  if (noteCount <= 5) return 4;
  return 3;
}
```

---

### Step 3: Apply Octave Wrapping with Drag Order

This is the **core algorithm**:

```typescript
/**
 * Maps blocks in drag order to octaves, wrapping up when 
 * chromatic pitch decreases.
 */
function applyOctaveWrapping(
  blocks: PlaygroundBlock[],
  baseOctave: number
): Note[] {
  const result: Note[] = [];
  let currentOctave = baseOctave;
  let previousChroma: number | null = null;
  
  blocks.forEach((block, index) => {
    const currentChroma = getNoteChroma(block.noteName);
    
    // If this note is chromatically lower than previous, bump octave
    if (previousChroma !== null && currentChroma < previousChroma) {
      currentOctave++;
    }
    
    // Enforce maximum octave (B6 limit)
    const clampedOctave = Math.min(6, currentOctave);
    
    result.push(`${block.noteName}${clampedOctave}` as Note);
    previousChroma = currentChroma;
  });
  
  return result;
}

/**
 * Get chromatic pitch class (0-11)
 * C=0, C#=1, D=2, ..., B=11
 */
function getNoteChroma(noteName: NoteName): number {
  const chromas: Record<NoteName, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3,
    'E': 4, 'F': 5, 'F#': 6, 'G': 7,
    'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };
  return chromas[noteName];
}
```

**Example 1: Shell A (R-3-7)**
```
Drag order: C, E, B
Base octave: 4

Step 1: C
  Chroma: 0
  Octave: 4
  Result: C4
  
Step 2: E
  Chroma: 4 (> previous 0)
  Octave: 4 (no wrap)
  Result: E4

Step 3: B
  Chroma: 11 (> previous 4)
  Octave: 4 (no wrap)
  Result: B4

Output: C4, E4, B4 ✓
```

**Example 2: Shell B (R-7-3)**
```
Drag order: C, B, E
Base octave: 4

Step 1: C
  Chroma: 0
  Octave: 4
  Result: C4

Step 2: B
  Chroma: 11 (> 0)
  Octave: 4 (no wrap)
  Result: B4

Step 3: E
  Chroma: 4 (< previous 11) ← WRAP!
  Octave: 5 (bumped up)
  Result: E5

Output: C4, B4, E5 ✓
```

**Example 3: User Custom (1-7-9-5-3)**
```
Drag order: C, B, D, G, E
Base octave: 4

C: chroma 0 → C4
B: chroma 11 (> 0) → B4
D: chroma 2 (< 11) → wrap → D5
G: chroma 7 (> 2) → G5
E: chroma 4 (< 7) → wrap → E6

Output: C4, B4, D5, G5, E6
```

---

### Step 4: Enforce Root Lowest (Override if Needed)

Even if user drags root to the right, octave placement must ensure root is the lowest pitch:

```typescript
function enforceRootLowestPitch(
  blocks: PlaygroundBlock[],
  voicedNotes: Note[]
): Note[] {
  const rootIndex = blocks.findIndex(b => b.role === 'root' && b.enabled);
  
  if (rootIndex === -1) return voicedNotes; // No root
  
  const rootNote = voicedNotes[rootIndex];
  const rootPitch = getAbsolutePitch(rootNote);
  
  // Check if any note is lower than root
  voicedNotes.forEach((note, idx) => {
    if (idx !== rootIndex && getAbsolutePitch(note) < rootPitch) {
      // Root is not lowest - this violates Rule 1
      // Force root down OR raise all other notes
      
      // Strategy: Lower root's octave by 1
      const rootOctave = getOctave(rootNote);
      const rootNoteName = getNoteName(rootNote);
      voicedNotes[rootIndex] = `${rootNoteName}${rootOctave - 1}` as Note;
    }
  });
  
  return voicedNotes;
}

/**
 * Get absolute MIDI pitch number
 * C4 = 60, C#4 = 61, etc.
 */
function getAbsolutePitch(note: Note): number {
  const noteName = getNoteName(note);
  const octave = getOctave(note);
  const chroma = getNoteChroma(noteName);
  
  return (octave + 1) * 12 + chroma; // C4 = 60
}
```

---

### Step 5: Apply Global Constraints

After octave wrapping, enforce all global rules:

```typescript
function applyGlobalConstraints(notes: Note[]): Note[] {
  let adjusted = [...notes];
  
  // Rule 4: Avoid muddy bass
  adjusted = avoidMuddyBass(adjusted);
  
  // Rule 5: Clamp to B6 maximum
  adjusted = adjusted.map(note => {
    if (getAbsolutePitch(note) > 95) { // B6 = MIDI 95
      return lowerOctave(note);
    }
    return note;
  });
  
  // Rule 2: Ensure minimum 1 octave spread
  const lowest = getAbsolutePitch(adjusted[0]);
  const highest = getAbsolutePitch(adjusted[adjusted.length - 1]);
  
  if (highest - lowest < 12 && adjusted.length > 2) {
    // Spread too narrow - raise top note
    adjusted[adjusted.length - 1] = raiseOctave(adjusted[adjusted.length - 1]);
  }
  
  return adjusted;
}
```

---

## Complete Implementation Function

Here's the full pipeline:

```typescript
/**
 * Master function: Convert playground blocks to voiced notes with octaves
 */
export function voicePlaygroundBlocks(
  blocks: PlaygroundBlock[],
  presetHint?: 'compact' | 'spread'
): Note[] {
  // Step 1: Filter enabled blocks, maintain drag order
  const enabledBlocks = blocks.filter(b => b.enabled);
  
  if (enabledBlocks.length === 0) {
    return []; // No notes to voice
  }
  
  // Step 2: Check if root is present
  const hasRoot = enabledBlocks.some(b => b.role === 'root');
  
  // Step 3: Determine base octave
  const baseOctave = getBaseOctave(
    enabledBlocks.length, 
    hasRoot,
    presetHint
  );
  
  // Step 4: Apply octave wrapping based on drag order
  let voicedNotes = applyOctaveWrapping(enabledBlocks, baseOctave);
  
  // Step 5: Enforce root lowest (if root exists)
  if (hasRoot) {
    voicedNotes = enforceRootLowestPitch(enabledBlocks, voicedNotes);
  }
  
  // Step 6: Apply all global constraints
  voicedNotes = applyGlobalConstraints(voicedNotes);
  
  // Step 7: Final validation
  voicedNotes = validateOctaveRange(voicedNotes);
  
  return voicedNotes;
}

/**
 * Validate all notes are within C3-B6 range
 */
function validateOctaveRange(notes: Note[]): Note[] {
  return notes.map(note => {
    const pitch = getAbsolutePitch(note);
    
    // C3 = 48, B6 = 95
    if (pitch < 48) return `${getNoteName(note)}3` as Note; // Clamp to C3
    if (pitch > 95) return `${getNoteName(note)}6` as Note; // Clamp to B6
    
    return note;
  });
}
```

---

## Preset-Specific Overrides

For known presets, we can bypass the algorithm and use hardcoded voicings:

```typescript
const PRESET_VOICINGS: Record<string, (root: NoteName) => Note[]> = {
  'shell-a': (root) => {
    // Always: root, 3rd, 7th in octave 4
    const third = getThird(root);
    const seventh = getSeventh(root);
    return [`${root}4`, `${third}4`, `${seventh}4`];
  },
  
  'shell-b': (root) => {
    // root4, 7th4, 3rd5
    const third = getThird(root);
    const seventh = getSeventh(root);
    return [`${root}4`, `${seventh}4`, `${third}5`];
  },
  
  'open': (root) => {
    // root4, 5th4, 3rd5, 7th5
    const third = getThird(root);
    const fifth = getFifth(root);
    const seventh = getSeventh(root);
    return [`${root}4`, `${fifth}4`, `${third}5`, `${seventh}5`];
  },
  
  'drop-2': (root) => {
    // root3, 5th3, 3rd4, 7th4
    const third = getThird(root);
    const fifth = getFifth(root);
    const seventh = getSeventh(root);
    return [`${root}3`, `${fifth}3`, `${third}4`, `${seventh}4`];
  },
  
  'rootless-a': (root) => {
    // 3rd4, 5th4, 7th4, 9th5
    const third = getThird(root);
    const fifth = getFifth(root);
    const seventh = getSeventh(root);
    const ninth = getNinth(root);
    return [`${third}4`, `${fifth}4`, `${seventh}4`, `${ninth}5`];
  },
  
  'rootless-b': (root) => {
    // 7th3, 9th4, 3rd4, 5th4
    const third = getThird(root);
    const fifth = getFifth(root);
    const seventh = getSeventh(root);
    const ninth = getNinth(root);
    return [`${seventh}3`, `${ninth}4`, `${third}4`, `${fifth}4`];
  }
};

/**
 * Use preset voicing if available, otherwise use algorithm
 */
export function voiceWithPreset(
  blocks: PlaygroundBlock[],
  presetName?: string,
  rootNote?: NoteName
): Note[] {
  if (presetName && rootNote && PRESET_VOICINGS[presetName]) {
    return PRESET_VOICINGS[presetName](rootNote);
  }
  
  // Fallback to algorithm
  return voicePlaygroundBlocks(blocks);
}
```

---

## Edge Cases & Special Handling

### Case 1: User Drags Root to Middle/End
```
Drag order: E, B, C (3rd, 7th, root)

Algorithm output:
  E4, B4, C5 (respects drag order, wraps octaves)

Constraint violation: C5 is not lowest (violates Rule 1)

Fix: Lower C to C4, keep others:
  E4, B4, C4? No - now C4 < E4, violates Rule 1

Better fix: Show warning, force reorder in pitch:
  C4, E4, B4 (root forced lowest)

Or: Allow but drop C an octave:
  C3, E4, B4
```

**Implementation Decision:**
- Show warning: "⚠️ Root should be lowest"
- Allow drag order visually in UI
- Force root lowest in octave placement (drop root to lower octave if needed)

---

### Case 2: User Toggles Off Root (Rootless)
```
Blocks: R(off), 3, 5, 7, 9

No root present - Rule 1 doesn't apply
Leftmost enabled block (3rd) becomes bass

Algorithm proceeds normally with 3rd as bass note
```

---

### Case 3: Only 2 Notes Enabled
```
Blocks: R, 5 (power chord)

Rule 2 (minimum 1 octave spread) has exception for 2-note voicings

Allow: C4, G4 (perfect 5th, 7 semitones) - valid
```

---

### Case 4: Dense Voicing (7+ notes)
```
Blocks: R, 3, 5, 7, 9, 11, 13 (7 notes)

Note count: 7
Base octave: 3 (need more room)
Target spread: 30 semitones (max)

Algorithm distributes across C3-B5 range
If exceeds B6, compress by lowering top notes
```

---

## Testing Scenarios

### Test 1: Shell A Preset
```
Input: [R: C] [3: E] [7: B]
Expected: C4, E4, B4
Validation: All in octave 4, span = 11 semitones (allowed for 3-note shells)
```

### Test 2: Shell B Preset
```
Input: [R: C] [7: B] [3: E]
Expected: C4, B4, E5
Validation: E wraps to octave 5 (chroma 4 < 11)
```

### Test 3: User Custom (Root Not First)
```
Input: [3: E] [7: B] [R: C]
Algorithm output: E4, B4, C5
Constraint fix: Force C lowest → C4, E4, B4
Warning shown: "⚠️ Root should be lowest"
```

### Test 4: Rootless Voicing
```
Input: [3: E] [5: G] [7: B] [9: D]
Expected: E4, G4, B4, D5
Validation: No root, E is bass note, D wraps to octave 5
```

### Test 5: Dense Voicing
```
Input: [R: C] [3: E] [5: G] [7: B] [9: D] [11: F] [13: A]
Note count: 7
Base octave: 3
Expected: C3, E3, G3, B3, D4, F4, A4
Validation: Spread across 2 octaves, stays within C3-B6
```

---

## Validation Checklist

Before shipping, verify:

- [x] Rule 1: Root is always lowest pitch when present
- [x] Rule 2: Minimum 1 octave spread (except 2-note chords)
- [x] Rule 3: Maximum spread is 2.5 octaves (C3-B6)
- [x] Rule 4: No close intervals in bass register
- [x] Rule 5: No notes exceed B6
- [x] Drag order is respected with intelligent wrapping
- [x] Warning shown when root is not leftmost
- [x] Preset voicings match expected targets
- [x] Rootless voicings work correctly
- [x] Edge cases handled (2 notes, 7+ notes, root disabled)

---

## Integration Points

### Where This Algorithm Plugs In

```typescript
// In PlaygroundPanel.tsx

function PlaygroundPanel({ blocks, onBlocksChange }) {
  // ... drag-drop logic
  
  // When user rearranges blocks OR toggles blocks
  useEffect(() => {
    const voicedNotes = voicePlaygroundBlocks(blocks);
    
    // Update keyboard visualization
    setHighlightedNotes(voicedNotes);
    
    // Update audio playback
    setNotesToPlay(voicedNotes);
  }, [blocks]);
  
  // When user clicks preset
  function loadPreset(presetName: string) {
    const voicedNotes = voiceWithPreset(blocks, presetName, currentRoot);
    // Update UI
  }
}
```

---

## Summary

**Key Takeaways:**

1. **Drag order = pitch order** - respect user's left-to-right arrangement
2. **Wrap octaves up** when chromatic pitch decreases
3. **Root always lowest** - enforce even if user drags it elsewhere (show warning)
4. **Target spread** adjusts based on note count (3 notes = 1 octave, 6+ notes = 2.5 octaves)
5. **Clamp to C3-B6** range, with B6 as absolute maximum

**This algorithm produces musically intelligent voicings that:**
- Sound clear (no muddy bass)
- Are playable (reasonable hand stretch)
- Respect user intent (drag order honored)
- Follow jazz conventions (root in bass, good voice leading)
