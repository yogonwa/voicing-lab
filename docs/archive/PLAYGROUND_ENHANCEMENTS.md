# Playground Mode Feature Enhancements

This document outlines planned feature enhancements for Playground Mode, written for implementation by an agentic AI code assistant.

---

## Overview

These enhancements expand Playground Mode's pedagogical value by:
1. Supporting both **single-hand** (shape vocabulary) and **two-hand** (comping vocabulary) learning contexts
2. Adding **true jazz transformations** (drop-2, inversions)
3. Improving **display accuracy** for learners (enharmonic spelling)
4. Enabling **melody-driven voicing** exploration

---

## Enhancement 1: Hand Mode Toggle

### Goal
Allow users to switch between single-hand and two-hand learning contexts, with appropriate presets and UI for each.

### User-Facing Behavior

#### Mode Toggle
- Add a **Hand Mode** toggle in Playground Mode: `Single Hand` | `Two Hands`
- Default: `Two Hands` (current behavior)

#### Single-Hand Mode
- **Presets available**:
  - Triad (1–3–5)
  - Triad 1st Inversion (3–5–1)
  - Triad 2nd Inversion (5–1–3)
  - 7th Close Position (1–3–5–7)
  - 7th 1st Inversion (3–5–7–1)
  - 7th 2nd Inversion (5–7–1–3)
  - 7th 3rd Inversion (7–1–3–5)
- **No hand divider** in block area
- **Octave placement**: All notes in close position within single octave range (eg:C4–C5)
- **Piano visualization**: Highlight notes without LH/RH color distinction

#### Two-Hand Mode
- **Presets available**: Current presets (Shell A/B, Open, Rootless A/B, Drop 2) + new:
  - Slash/3, Slash/5, Slash/7 (bass inversions, note-agnostic labels)
- **Hand divider visible**: Fixed vertical line between blocks (not draggable in v1)
  - Notes left of divider = Left Hand (LH)
  - Notes right of divider = Right Hand (RH)
- **Octave placement**: 
  - LH notes placed in lower register (C2–C4), as a general suggestion
  - RH notes placed in higher register (C4–C6), as a general suggestion - see octave rules before implementing
  - Muddy bass rules apply more strictly to LH
- **Piano visualization**: tbd

### Implementation Details

#### New Types (add to `voicingTemplates.ts` or new file)
```typescript
type HandMode = 'single' | 'two';

interface PlaygroundPreset {
  id: string;
  name: string;
  description: string;
  handMode: HandMode | 'both';  // Which mode(s) this preset appears in
  blockOrder: VoicingRole[];    // Order of blocks left-to-right
  dividerIndex?: number;        // For two-hand: where divider sits (0 = all RH, 2 = first 2 LH)
}
```

#### New Presets to Add
```typescript
// Single-hand presets
{ id: 'triad', name: 'Triad', handMode: 'single', blockOrder: ['root', 'third', 'fifth'] }
{ id: 'triad-inv1', name: 'Triad 1st Inv', handMode: 'single', blockOrder: ['third', 'fifth', 'root'] }
{ id: 'triad-inv2', name: 'Triad 2nd Inv', handMode: 'single', blockOrder: ['fifth', 'root', 'third'] }
{ id: '7th-close', name: '7th Close', handMode: 'single', blockOrder: ['root', 'third', 'fifth', 'seventh'] }
{ id: '7th-inv1', name: '7th 1st Inv', handMode: 'single', blockOrder: ['third', 'fifth', 'seventh', 'root'] }
{ id: '7th-inv2', name: '7th 2nd Inv', handMode: 'single', blockOrder: ['fifth', 'seventh', 'root', 'third'] }
{ id: '7th-inv3', name: '7th 3rd Inv', handMode: 'single', blockOrder: ['seventh', 'root', 'third', 'fifth'] }
```

#### UI Components to Modify
- `PlaygroundPanel.tsx`: Add hand mode toggle, conditionally show divider
- `playgroundUtils.ts`: Add `voiceForHandMode()` that applies different octave logic per mode
- `PRESETS` constant: Expand with new presets, filter by current hand mode

#### Octave Logic Changes
In `playgroundUtils.ts`, modify `voicePlaygroundBlocks()`:
```typescript
function voicePlaygroundBlocks(
  blocks: PlaygroundBlock[], 
  handMode: HandMode,
  dividerIndex?: number  // Only used in two-hand mode
): Note[] | { lh: Note[], rh: Note[] }
```

For single-hand mode:
- All notes placed in close position
- No octave wrapping for "root lowest" — inversions are intentional
- Target range: single octave (e.g., C4–B4)

For two-hand mode:
- Notes before dividerIndex → LH register (C2–C4) CONFIRM THIS
- Notes at/after dividerIndex → RH register (C4–C6) CONFIRM THIS
- Root-lowest warning still applies to LH portion

---

## Enhancement 2: Melody Lock (Top Note Focus)

### Goal
Allow users to "lock" a target top note, then explore which voicings place that note on top.

### User-Facing Behavior
- New toggle: **Melody Lock** (off by default)
- When enabled:
  - User can click any enabled block to designate it as the "top note target"
  - Blocks reorder automatically to place target on top (rightmost position)
  - Tips appear explaining the musical effect:
    - "3rd on top: emphasizes chord quality (major/minor character)"
    - "7th on top: creates strong voice leading to next chord"
    - "9th on top: modern, open sound"
    - "13th on top: rich, colorful — common in ballads"
- When disabled:
  - User has full drag control (current behavior)

### Implementation Details

#### New State in PlaygroundPanel
```typescript
const [melodyLockEnabled, setMelodyLockEnabled] = useState(false);
const [lockedTopNote, setLockedTopNote] = useState<VoicingRole | null>(null);
```

#### Block Click Handler
When melody lock is on and user clicks a block:
1. Set `lockedTopNote` to that block's role
2. Reorder blocks array to place that role last (rightmost)
3. Show corresponding tip

#### Tips Mapping
```typescript
const MELODY_LOCK_TIPS: Record<VoicingRole, string> = {
  root: 'Root on top: strong, stable — but less common in jazz voicings',
  third: '3rd on top: emphasizes major/minor quality clearly',
  fifth: '5th on top: neutral, open sound',
  seventh: '7th on top: creates strong pull to next chord (voice leading)',
  ninth: '9th on top: modern, sophisticated — Kenny Barron style',
  eleventh: '11th on top: suspended, ambiguous quality',
  sharpEleventh: '#11 on top: bright Lydian color',
  thirteenth: '13th on top: warm, rich — classic ballad sound',
  // ... etc
};
```

---

## Enhancement 3: True Drop-2 Implementation

### Goal
Implement actual drop-2 transformation, not just a preset ordering.

### Music Theory Background
**Drop-2 voicing**: Start with a close-position 4-note chord, then "drop" the 2nd-highest voice down one octave.

Example (C7 close position: C–E–G–Bb):
- 2nd highest = G
- Drop G down one octave
- Result: G (low) – C – E – Bb = drop-2 voicing

This creates characteristic "open" sound with bass note separated.

### User-Facing Behavior
- In Two-Hand mode, "Drop 2" preset becomes a **transformation**, not just an ordering
- User sees the close-position source, then the drop-2 result
- Optional: "Drop 3" transformation (drop 3rd highest voice)

### Implementation Details

#### New Utility Function
Add to `playgroundUtils.ts`:

```typescript
/**
 * Apply drop-2 transformation to close-position voiced chord.
 * @param closePositionNotes - Notes in close position, highest to lowest pitch
 * @returns Notes with 2nd-highest dropped an octave
 */
function applyDrop2(closePositionNotes: Note[]): Note[] {
  if (closePositionNotes.length < 4) {
    return closePositionNotes; // Drop-2 requires 4+ notes
  }
  
  // Sort by pitch (highest first)
  const sorted = [...closePositionNotes].sort((a, b) => toMidi(b) - toMidi(a));
  
  // 2nd highest is index 1
  const noteToDrop = sorted[1];
  const droppedNote = lowerOctave(noteToDrop);
  
  // Replace and re-sort
  sorted[1] = droppedNote;
  return sorted.sort((a, b) => toMidi(a) - toMidi(b)); // Return low-to-high
}

function applyDrop3(closePositionNotes: Note[]): Note[] {
  // Same logic but drop index 2
}
```

#### Preset Behavior Change
When "Drop 2" preset is selected:
1. First compute close-position voicing (1–3–5–7 or with extensions)
2. Apply `applyDrop2()` transformation
3. Display result

#### Visual Enhancement (optional)
Show a small animation or before/after comparison:
- "Close: C–E–G–Bb"
- "Drop 2: G₃–C–E–Bb" (subscript indicates lower octave)

---

## Enhancement 4: Enharmonic Display Labels

### Goal
Display conventional flat spellings (Bb, Eb, Ab) instead of sharps-only (A#, D#, G#) where musically appropriate.

### Music Theory Background
Jazz convention:
- Dominant 7ths use flats: C7 = C–E–G–**Bb** (not A#)
- Minor keys use flats: Cm7 = C–**Eb**–G–**Bb**
- Some contexts use sharps: F#, C#, G# keys; augmented notes

### User-Facing Behavior
- **Chord symbol/quality display** uses conventional enharmonic spellings (e.g., "C7" implies Bb, "Dm7" shows Eb)
- **Note blocks** continue using internal sharp-only representation (A#, D#, etc.)
- Internal data model remains sharps-only (no core logic change)

**Rationale**: Learners benefit from seeing standard chord symbols, but keeping blocks consistent with internal representation avoids confusion when debugging or reading code.

### Implementation Details

#### Scope: Chord Symbol Display Only

Update `buildChordSymbol()` in `chordCalculator.ts` or create a `getDisplayChordSymbol()` wrapper:

```typescript
const ENHARMONIC_MAP: Record<NoteName, string> = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
};

/**
 * Return display-friendly chord symbol with conventional enharmonic root.
 * Example: A#7 → Bb7, D#m7 → Ebm7
 */
function getDisplayChordSymbol(chord: Chord): string {
  const baseSymbol = buildChordSymbol(chord);
  
  // Replace sharp roots with flat equivalents for common jazz contexts
  const displayRoot = ENHARMONIC_MAP[chord.root] ?? chord.root;
  
  // Only replace if it's a flat-preferred key
  const flatPreferred = ['A#', 'D#', 'G#']; // Bb, Eb, Ab are more common
  if (flatPreferred.includes(chord.root)) {
    return baseSymbol.replace(chord.root, displayRoot);
  }
  
  return baseSymbol;
}
```

#### UI Integration
- `ChordExplorer.tsx`: Use `getDisplayChordSymbol()` for the chord name header
- `PlaygroundPanel.tsx`: Use for preset labels if they include chord names
- Note blocks and piano keys: **No change** (keep sharp-only)

---

## Enhancement 5: Performance Context Toggle

### Goal
Let users specify whether they're learning **solo piano** (root usually present) or **comping with bassist** (root often omitted).

### User-Facing Behavior
- Toggle in Playground Mode: `Solo Piano` | `With Bassist`
- **Solo Piano** context:
  - Root is important, "root lowest" rule more strictly enforced
  - Default presets include root
  - Tips emphasize full harmony
- **With Bassist** context:
  - Rootless voicings are preferred
  - Root can be disabled without warning
  - Tips explain: "Bassist covers the root — you provide color"
  - Default presets: Rootless A, Rootless B, shells without root

### Implementation Details

#### New State
```typescript
type PerformanceContext = 'solo' | 'with-bassist';
const [performanceContext, setPerformanceContext] = useState<PerformanceContext>('solo');
```

#### Preset Filtering
```typescript
const presetsForContext = PRESETS.filter(p => 
  p.contexts.includes(performanceContext) || p.contexts.includes('both')
);
```

#### Warning Adjustment
In `getRootWarning()`:
```typescript
if (performanceContext === 'with-bassist') {
  return null; // No warning for rootless in this context
}
```

---

## Enhancement 6: Slash Chord / Bass Inversions (Two-Hand Mode)

### Goal
In two-hand mode, allow explicit bass note selection independent of voicing order.

### User-Facing Behavior
- When in Two-Hand mode, show **bass note selector** (below or beside blocks)
- Selecting a non-root bass note creates a slash chord: C7/E, C7/G, etc.
- LH plays the bass note; RH plays remaining voicing
- Label updates: "C7/E" instead of just "C7"

### Implementation Details

#### New State
```typescript
const [slashBass, setSlashBass] = useState<NoteName | null>(null);
```

#### Voicing Logic
```typescript
function voiceWithSlashBass(
  blocks: PlaygroundBlock[],
  slashBass: NoteName | null
): { lh: Note[], rh: Note[] } {
  if (!slashBass) {
    return normalTwoHandVoicing(blocks);
  }
  
  // LH: just the bass note in low register
  const bassNote = `${slashBass}2` as Note;
  
  // RH: remaining enabled notes (excluding the bass if it appears)
  const rhNotes = blocks
    .filter(b => b.enabled && b.note !== slashBass)
    .map(b => voiceInRegister(b.note, 'rh'));
  
  return { lh: [bassNote], rh: rhNotes };
}
```

#### Chord Symbol Display
```typescript
function buildSlashChordSymbol(chord: Chord, bass: NoteName): string {
  const base = buildChordSymbol(chord);
  return `${base}/${bass}`;
}
```

---

## Implementation Order (Recommended)

1. **Hand Mode Toggle** (foundational — unlocks other features)
2. **Single-Hand Presets** (quick win, high learning value)
3. **Enharmonic Display** (improves UX with minimal logic change)
4. **True Drop-2** (requires Hand Mode infrastructure)
5. **Performance Context Toggle** (preset filtering + warning adjustment)
6. **Melody Lock** (advanced feature, can be deferred)
7. **Slash Chords** (requires Two-Hand mode + bass selector UI)

---

## Files Likely to Change

| File | Changes |
|------|---------|
| `PlaygroundPanel.tsx` | Hand mode toggle, divider UI, context toggle, melody lock UI |
| `playgroundUtils.ts` | `voiceForHandMode()`, `applyDrop2()`, hand-aware octave placement |
| `voicingTemplates.ts` | New `PlaygroundPreset` type, expanded preset definitions |
| `chordCalculator.ts` | `getDisplayChordSymbol()` for enharmonic chord labels |
| `NoteBlocks.tsx` | Melody lock click handling (no enharmonic changes) |
| `PianoKeyboard.tsx` | LH/RH color distinction (TBD) |
| `extensionConfig.ts` | Possibly add `MELODY_LOCK_TIPS` |

---

## Decisions Made

1. ~~**Hand divider interaction**~~  
   **Decided**: Fixed divider position per preset (not draggable in v1).

2. ~~**Single-hand octave range**~~  
   **Decided**: No user-adjustable octave. Follow existing `OctavePlacement.md` rules.

3. ~~**Enharmonic display scope**~~  
   **Decided**: Enharmonic spelling applies to **chord quality/symbol only** (e.g., "C7" implies Bb). Individual note blocks continue using internal sharp-only representation.

---

## Open Discussion: Drop-2 as Preset vs Transformation

### Current Understanding

The "Drop 2" preset currently represents the **result** of a drop-2 transformation:

**What is Drop-2?**
1. Start with close-position 4-note chord (top to bottom): `7 - 5 - 3 - R` (e.g., Bb-G-E-C for C7)
2. "Drop the 2nd voice from top" = drop the 5th down an octave
3. Result (low to high): `5 - R - 3 - 7` (e.g., G3-C4-E4-Bb4)

**So yes, `5-R | 3-7` IS a drop-2 voicing.**

With the hand divider: **LH: 5-R** | **RH: 3-7**

### Options

| Approach | Description | Pros | Cons |
|----------|-------------|------|------|
| **A: Preset only** | "Drop 2" preset sets block order to `5-R-3-7` with divider after R | Simple, immediate | Doesn't teach the *transformation* concept |
| **B: Transformation button** | Button that takes any close-position stack and applies drop algorithm | Educational, flexible | More complex UI, requires close-position source |
| **C: Both** | Preset for quick access + optional "show me the transformation" animation | Best of both | Most implementation effort |

### Recommendation

For v1: **Option A** (preset only) with clear tooltip: "Drop 2: 2nd voice from top dropped an octave → 5-R-3-7"

Defer Option B/C to a future "Learn Voicing Transformations" feature.

### Open Question

Should drop-2 apply to 5+ note chords (with extensions)? 
- Traditional drop-2 is defined for 4-note chords
- With extensions, which voice is "2nd from top"?
- **Tentative answer**: For now, Drop-2 preset only applies to core 4-note voicings (R-3-5-7)

---

## Future Ideas

These are longer-term enhancements that build on the core features above.

### 1. Live Drop-2 Transformation

Instead of just a preset, allow users to **apply** the Drop-2 transformation to any existing block arrangement:

- User arranges blocks in any order (e.g., close position `R-3-5-7`)
- User clicks "Apply Drop-2" button
- System animates the 2nd-from-top block dropping down an octave
- Result: `5-R-3-7` with visual + audio feedback showing the transformation

**Educational value**: Users learn *what* Drop-2 means by seeing it happen, not just using a pre-made result.

Could extend to:
- **Drop-3**: Drop 3rd voice from top
- **Drop-2-4**: Drop 2nd and 4th voices (common in guitar voicings)

---

### 2. Context-Aware Voicing Recognition

Make Playground Mode "smart" — when users build a voicing through drag-and-drop, the system recognizes if they've recreated a standard jazz voicing and explains it.

#### How It Works

1. As user arranges blocks, compare current order to known voicing patterns
2. When a match is found, display an insight card:

**Example: User builds `5-R-3-7`**
> 🎹 **You found a Drop-2 voicing!**  
> This is created by taking a close-position chord and dropping the 2nd voice from the top down an octave.  
> **Why it works**: Opens up the voicing for better clarity and hand span.  
> **Common use**: Comping, solo piano, guitar adaptations.

**Example: User builds `3-5-7-R` (Slash/3)**
> 🎹 **This is a 1st inversion / Slash chord (C7/E)**  
> The 3rd is in the bass instead of the root.  
> **Why it sounds different**: Breaks the "root lowest" convention — creates a less stable, more colorful sound.  
> **When to use**: Voice leading (bass moves by step), creating motion, avoiding root heaviness.  
> **Caution**: Can sound "ungrounded" without a bassist covering the root.

**Example: User builds `3-7` (Shell)**
> 🎹 **You've built a Guide Tone Shell!**  
> Just the 3rd and 7th — the two notes that define chord quality.  
> **Why it works**: Maximum information, minimum notes. The 3rd tells you major/minor, the 7th tells you the chord type.  
> **Pro tip**: Add the 9th on top for a modern sound.

#### Pattern Library

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
    description: 'Root with the two guide tones (3rd and 7th).',
    whyItWorks: '3rd defines quality, 7th defines chord type — maximum info, minimum notes.',
    commonUse: 'Left-hand comping, voice leading practice.',
  },
  {
    id: 'slash-3',
    name: '1st Inversion / Slash-3',
    pattern: ['third', '*', '*', 'root'], // 3rd in bass, root on top
    description: 'Third in the bass creates a slash chord (e.g., C7/E).',
    whyItWorks: 'Smooth bass voice leading, less root-heavy sound.',
    caution: 'Can sound unstable without bassist covering the root.',
    commonUse: 'Passing chords, descending bass lines.',
  },
  {
    id: 'rootless-a',
    name: 'Rootless Type A',
    pattern: ['third', 'fifth', 'seventh', 'ninth'],
    description: 'No root — bassist covers it. Classic Bill Evans voicing.',
    whyItWorks: 'Avoids doubling the bass, frees up color tones.',
    commonUse: 'Trio/quartet comping, modern jazz.',
  },
  // ... more patterns
];
```

#### Implementation Sketch

```typescript
function detectVoicingPattern(blocks: PlaygroundBlock[]): VoicingPattern | null {
  const enabledRoles = blocks.filter(b => b.enabled).map(b => b.voicingRole);
  
  for (const pattern of VOICING_PATTERNS) {
    if (matchesPattern(enabledRoles, pattern.pattern)) {
      return pattern;
    }
  }
  
  return null; // No known pattern matched
}

// In PlaygroundPanel, show insight when pattern detected:
useEffect(() => {
  const detected = detectVoicingPattern(blocks);
  if (detected) {
    setInsightCard(detected);
  } else {
    setInsightCard(null);
  }
}, [blocks]);
```

#### UI Presentation

- Small card or tooltip that appears when pattern is recognized
- Non-intrusive — users can dismiss or minimize
- Option: "Learn more" link to deeper explanation or audio comparison

---

### 3. "Build This Voicing" Challenges

Gamification layer:
- System prompts: "Can you build a Drop-2 voicing?"
- User drags blocks to match
- Success triggers celebration + explanation
- Progresses through voicing types (shells → rootless → drop voicings → altered dominants)

---

## References

- `docs/PLAYGROUND_MODE.md` — current Playground spec
- `docs/OctavePlacement.md` — octave placement rules
- `src/components/ChordExplorer/playgroundUtils.ts` — current voicing logic
- `src/components/ChordExplorer/PlaygroundPanel.tsx` — current UI

