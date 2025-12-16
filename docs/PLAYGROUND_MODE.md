# Chord Playground Mode - Design & Implementation Spec

## Overview

**Feature Name:** Chord Playground Mode  
**Location:** ChordExplorer component (toggle between Template Mode and Playground Mode)  
**Status:** Implementation Kickoff (mode toggle scaffold live)  
**Created:** December 2025

---

## Problem Statement

The current Chord Explorer shows chord tones as static colored blocks. Users can toggle extensions on/off, but they can't:
1. **Rearrange notes** to hear how order affects sound (1-3-5-7 vs 1-5-3-7 vs 3-7-1-5)
2. **Toggle individual chord tones** on/off (what does it sound like without the 5th?)
3. **Experiment freely** with voicing construction

This limits the exploratory, "play and discover" learning that builds jazz piano intuition.

---

## Solution

Transform the colored note blocks into an **interactive drag-and-drop interface** where users can:
1. **Reorder blocks** left-to-right to change pitch arrangement (low → high)
2. **Toggle blocks** on/off to include/exclude notes
3. **Hear/see results** in real-time on keyboard and audio

---

## User Stories

### Story 1: Rearrange Notes to Explore Voicings
```
As a jazz piano learner,
I want to drag chord tone blocks to rearrange their order,
So that I can hear how different note arrangements create different voicing sounds.

Acceptance Criteria:
- Blocks are draggable left-to-right
- Leftmost block = lowest pitch, rightmost = highest
- Keyboard display updates in real-time as blocks are dragged
- Can play the chord to hear the new arrangement
- Arpeggio mode plays notes in the new order
```

### Story 2: Toggle Notes On/Off
```
As a user exploring chord construction,
I want to click blocks to toggle notes on/off,
So that I can hear what the chord sounds like with fewer notes (e.g., without the 5th).

Acceptance Criteria:
- Click a block to toggle it off (dimmed, inset shadow)
- Click again to toggle it back on
- Disabled blocks don't appear on keyboard or in audio
- At least 2 notes must remain enabled (prevent empty/single-note chords)
```

### Story 3: Compare to Standard Voicings
```
As a user learning voicing patterns,
I want to compare my custom arrangement to standard voicings,
So that I can understand how my experimentation relates to established patterns.

Acceptance Criteria:
- "Compare to Shell A" button shows ghost overlay of standard voicing
- Can toggle between different presets (Shell A, Shell B, Open, etc.)
- Clear visual diff: my notes vs preset notes
```

### Story 4: Switch Between Modes
```
As a user,
I want to toggle between Template Mode (structured) and Playground Mode (freeform),
So that I can choose between guided learning and free exploration.

Acceptance Criteria:
- Clear toggle button: "Template Mode" ↔ "Playground Mode"
- Template Mode = current behavior (extension checkboxes, fixed block order)
- Playground Mode = draggable/toggleable blocks
- Mode selection persists during session
```

---

## UI Design

### Mode Toggle

```
┌─────────────────────────────────────────────────────────┐
│  CHORD EXPLORER                                         │
│                                                         │
│  ┌──────────────┐  ┌──────────────────┐                │
│  │ Root: C   ▼  │  │ Quality: Major 7 ▼│                │
│  └──────────────┘  └──────────────────┘                │
│                                                         │
│  Mode: [📋 Template] [🧩 Playground]  ← Toggle buttons  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Template Mode (Current Behavior)
- Extension checkboxes grouped by degree (9ths, 11ths, 13ths)
- Fixed block display order (R-3-5-7 | extensions)
- Standard voicing behavior

### Playground Mode (New)

```
┌─────────────────────────────────────────────────────────┐
│  PLAYGROUND MODE                                        │
│                                                         │
│  Drag to reorder • Click to toggle                      │
│                                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  │  R  │ │  5  │ │  3  │ │  7  │ │  9  │ │ ♯11 │       │
│  │  C  │ │  G  │ │  E  │ │  B  │ │  D  │ │ F♯  │       │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘       │
│     ↑       ↑       ↑       ↑                           │
│   [ON]   [OFF]    [ON]    [ON]  ← Toggled state        │
│                                                         │
│  ◀ Lower ─────────────────────────── Higher ▶          │
│                                                         │
│  Quick presets: [Shell A] [Shell B] [Open] [Reset]     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Block Visual States

| State | Appearance | Interaction |
|-------|------------|-------------|
| **Enabled** | Bright color, slight raised shadow | Draggable, click to disable |
| **Disabled** | Desaturated (40% opacity), inset shadow | Click to enable, still draggable |
| **Dragging** | Lifted, larger drop shadow, slight scale up | Being moved |
| **Drop Target** | Gap opens between blocks | Visual cue for drop position |

### Block Component

```
┌─────────────────┐
│    Role Label   │  ← "R", "3", "5", "7", "9", etc.
│   ┌─────────┐   │
│   │  Note   │   │  ← "C", "E", "G", "B", "D", etc.
│   └─────────┘   │
│   [drag handle] │  ← Subtle grip dots or ≡ icon
└─────────────────┘
```

---

## Technical Design

### Data Structures

```typescript
// Block state for playground mode
interface PlaygroundBlock {
  id: string;                    // Unique ID for drag-drop (e.g., "root", "third")
  role: VoicingRole;             // 'root' | 'third' | 'fifth' | 'seventh' | ExtensionRole
  noteName: NoteName;            // 'C' | 'E' | 'G' | 'B' etc.
  enabled: boolean;              // Whether note is active
  position: number;              // Order in sequence (0 = lowest pitch)
}

// Full playground state
interface PlaygroundState {
  blocks: PlaygroundBlock[];     // Ordered array of blocks
  mode: 'template' | 'playground';
}
```

### Position-to-Octave Mapping

Notes are spread across octaves based on their position in the sequence:

```typescript
/**
 * Map block position to octave.
 * Spreads notes across octaves 3-5 based on total count and position.
 */
function getOctaveForPosition(
  position: number, 
  totalEnabled: number
): number {
  const BASE_OCTAVE = 3;
  const OCTAVE_SPREAD = 2; // Span 3 octaves (3, 4, 5)
  
  if (totalEnabled <= 1) return BASE_OCTAVE;
  
  // Distribute evenly across octave range
  const octaveOffset = Math.floor(
    (position / (totalEnabled - 1)) * OCTAVE_SPREAD
  );
  
  return BASE_OCTAVE + octaveOffset;
}

// Example with 4 enabled blocks:
// Position 0 → Octave 3 (lowest)
// Position 1 → Octave 3 or 4
// Position 2 → Octave 4
// Position 3 → Octave 5 (highest)
```

### Preset Configurations

```typescript
const VOICING_PRESETS = {
  'shell-a': {
    name: 'Shell A',
    description: '1-3-7 (root + guide tones)',
    order: ['root', 'third', 'seventh'],
    disabled: ['fifth'],
  },
  'shell-b': {
    name: 'Shell B', 
    description: '1-7-3 (inverted guides)',
    order: ['root', 'seventh', 'third'],
    disabled: ['fifth'],
  },
  'open': {
    name: 'Open Voicing',
    description: '1-5-3-7 (spread voicing)',
    order: ['root', 'fifth', 'third', 'seventh'],
    disabled: [],
  },
  'drop-2': {
    name: 'Drop 2',
    description: 'Close position with 2nd voice dropped',
    order: ['root', 'fifth', 'third', 'seventh'],
    disabled: [],
  },
  'rootless-a': {
    name: 'Rootless A',
    description: '3-5-7-9 (no root)',
    order: ['third', 'fifth', 'seventh', 'ninth'],
    disabled: ['root'],
  },
  'rootless-b': {
    name: 'Rootless B',
    description: '7-9-3-5 (inverted rootless)',
    order: ['seventh', 'ninth', 'third', 'fifth'],
    disabled: ['root'],
  },
};
```

### Component Architecture

```
<ChordExplorer>
  ├─ <ChordControls>           // Root/Quality selectors
  │
  ├─ <ModeToggle>              // Template ↔ Playground switch
  │     mode={mode}
  │     onChange={setMode}
  │
  ├─ {mode === 'template' ? (
  │     <ExtensionPanel />     // Current checkbox UI
  │   ) : (
  │     <PlaygroundPanel>      // New drag-drop UI
  │       <PresetButtons />    // Quick preset loaders
  │       <DraggableBlocks />  // The interactive blocks
  │       <PitchAxisLabel />   // "Lower ← → Higher" indicator
  │     </PlaygroundPanel>
  │   )}
  │
  ├─ <ChordDisplay>
  │     <ChordSymbol />        // "Cmaj7" or custom symbol
  │     <PlaybackControls />   // Play button, arpeggio toggle
  │
  ├─ <NoteBlocks />            // Read-only display (or merged with playground)
  │
  ├─ <PianoKeyboard />         // Visual keyboard
  │
  └─ <TipsSection />           // Contextual tips
```

### Drag-and-Drop Implementation

**Recommended Library:** `@dnd-kit/core` + `@dnd-kit/sortable`

Reasons:
- Modern React hooks-based API
- Excellent accessibility (keyboard navigation)
- Smooth animations out of the box
- Active maintenance
- Smaller bundle than alternatives

```typescript
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

function PlaygroundBlocks({ blocks, onReorder, onToggle }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      onReorder(arrayMove(blocks, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blocks.map(b => b.id)}
        strategy={horizontalListSortingStrategy}
      >
        {blocks.map((block) => (
          <SortableBlock
            key={block.id}
            block={block}
            onToggle={() => onToggle(block.id)}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

---

## Interaction Behaviors

### Drag Behavior
1. **Pointer down** on block → slight lift animation (100ms)
2. **Drag** → block follows cursor, other blocks shift to show drop position
3. **Drop** → blocks reorder with spring animation (200ms)
4. **Keyboard** → Arrow keys move focused block left/right

### Toggle Behavior
1. **Click** on block → toggle enabled state
2. **Visual** → disabled blocks fade to 40% opacity, get inset shadow
3. **Constraint** → At least 2 blocks must remain enabled (prevent empty chord)
4. **Feedback** → If user tries to disable when only 2 left, show tooltip "At least 2 notes required"

### Preset Loading
1. **Click** preset button (e.g., "Shell A")
2. **Blocks reorder** to match preset arrangement (animated)
3. **Enable/disable** states update to match preset
4. **Audio** does NOT auto-play (user initiates)

### Real-Time Updates
- Keyboard visualization updates **immediately** as blocks are dragged/toggled
- No debouncing needed (simple state mapping)
- Arpeggio mode respects current block order

---

## Educational Content

### Contextual Tips by Arrangement

```typescript
const ARRANGEMENT_TIPS: Record<string, string> = {
  'root-lowest': "Root in bass provides strong foundation — typical for solo piano",
  'root-not-lowest': "Root not in bass — more like comping with a bassist",
  '3rd-on-top': "3rd on top emphasizes chord quality (major/minor color)",
  '7th-on-top': "7th on top creates smooth voice leading to next chord",
  'close-voicing': "Notes close together — dense, classical sound",
  'spread-voicing': "Notes spread wide — open, modern jazz sound",
  'no-5th': "Omitting 5th is common — 5th adds bulk but little color",
  'no-root': "Rootless voicing — assumes bass player covers root",
};

// Analyze current arrangement and show relevant tips
function getArrangementTips(blocks: PlaygroundBlock[]): string[] {
  const tips: string[] = [];
  const enabled = blocks.filter(b => b.enabled);
  
  if (enabled[0]?.role === 'root') {
    tips.push(ARRANGEMENT_TIPS['root-lowest']);
  } else {
    tips.push(ARRANGEMENT_TIPS['root-not-lowest']);
  }
  
  // ... more analysis
  
  return tips;
}
```

### Warning States

Some arrangements may sound unusual or "wrong" to jazz ears. Rather than prevent them, show educational warnings:

| Arrangement | Warning |
|-------------|---------|
| Root on top | "Root on top sounds pop/folk — jazz usually puts color tones (3rd, 7th) on top" |
| 7th below root | "7th below root can sound muddy — try raising it" |
| Very close cluster | "Close clusters can sound tense — spread for open sound" |
| Only root + 5th | "Power chord! Works in rock, but lacks jazz color (add 3rd or 7th)" |

---

## Implementation Phases

### Phase 1: Mode Toggle + Static Reorder
| Task | Description | Status |
|------|-------------|--------|
| 1.1 | Add mode toggle UI (Template ↔ Playground) | ✅ Complete |
| 1.2 | Create PlaygroundPanel component shell | ✅ Complete |
| 1.3 | Implement block rendering with current order | ✅ Complete |
| 1.4 | Wire up keyboard/audio to respect block order | ✅ Complete |

### Phase 2: Drag-and-Drop
| Task | Description | Status |
|------|-------------|--------|
| 2.1 | Install @dnd-kit/core and @dnd-kit/sortable | ✅ Complete |
| 2.2 | Implement SortableBlock component | ✅ Complete |
| 2.3 | Add drag-end handler to reorder blocks | ✅ Complete |
| 2.4 | Style drag states (lifted, drop target) | ✅ Complete |
| 2.5 | Add keyboard navigation (arrow keys) | ✅ Complete |

### Phase 3: Toggle On/Off
| Task | Description | Status |
|------|-------------|--------|
| 3.1 | Add enabled/disabled state to blocks | ✅ Complete |
| 3.2 | Implement click-to-toggle behavior | ✅ Complete |
| 3.3 | Style disabled state (dimmed, inset shadow) | ✅ Complete |
| 3.4 | Add minimum-2-blocks constraint | ✅ Complete |
| 3.5 | Update keyboard/audio to skip disabled blocks | ✅ Complete |
feedback/edits TODO: 
- initial playground keyboard load SHOULD show highlighted keys.
- The extensions of 9,11,13 should have a single block to indicate normal,sharp,orflat notes. This can be a multi-click toggle control. Off>On>Flat>Sharp>Off. Interacting with this block will update the note in the keyboard and update the key name in the block itself eg: F>F# 
- The first key in the keyboard display is shown in Depressed state. It should be neutral when no sound is playing. 
- Block / Roll button should maintain a fixed width.



### Phase 4: Presets
| Task | Description | Status |
|------|-------------|--------|
| 4.1 | Define preset configurations | Pending |
| 4.2 | Create PresetButtons component | Pending |
| 4.3 | Implement preset loading with animation | Pending |
| 4.4 | Add "Reset" to return to default order | Pending |

### Phase 5: Polish & Tips
| Task | Description | Status |
|------|-------------|--------|
| 5.1 | Add contextual tips based on arrangement | Pending |
| 5.2 | Add warning states for unusual arrangements | Pending |
| 5.3 | Animate block transitions on preset load | Pending |
| 5.4 | Mobile/touch optimization | Pending |
| 5.5 | Accessibility audit (screen reader, keyboard) | Pending |
| 5.6 | Fix keyboard note visualization + audio sync (idle + playback states) | Pending |

---

## Success Criteria

### Functional
- [x] Can switch between Template and Playground modes
- [x] Blocks are draggable and reorder correctly
- [x] Blocks can be toggled on/off with click
- [x] Keyboard display updates in real-time
- [x] Audio plays notes in current block order
- [x] Arpeggio respects block order
- [ ] Presets load correct arrangements
- [x] At least 2 blocks must remain enabled

### Educational
- [x] User can discover that order affects sound
- [ ] User can hear effect of omitting notes (e.g., no 5th)
- [ ] Tips explain what arrangements mean musically
- [ ] Presets teach standard voicing patterns

### UX Quality
- [ ] Drag animations feel smooth (60fps)
- [ ] Toggle feedback is immediate
- [x] Accessible via keyboard navigation
- [ ] Works on tablet/touch devices
- [ ] Clear visual hierarchy (enabled vs disabled)

---

## Future Enhancements (Not in Initial Scope)

| Feature | Description |
|---------|-------------|
| **Hand Split** | Draggable divider to assign blocks to LH vs RH |
| **Octave Control** | Per-block octave adjustment (not just position-based) |
| **Save Custom Voicings** | Save arrangements to local storage |
| **Share Voicings** | URL encoding for sharing custom voicings |
| **Compare Mode** | Ghost overlay showing preset vs custom arrangement |
| **MIDI Export** | Export current voicing as MIDI file |

---

## Technical Notes

### Dependencies to Add
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Bundle Size Impact
- @dnd-kit/core: ~12KB gzipped
- @dnd-kit/sortable: ~5KB gzipped
- Total: ~17KB — acceptable for the functionality gained

### Browser Support
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Touch devices supported via PointerSensor
- IE11 not supported (project requirement)

---

## Open Questions

| Question | Options | Decision |
|----------|---------|----------|
| Should disabled blocks be draggable? | A) Yes, can reorder even when off B) No, lock position when off | TBD |
| Show octave numbers on blocks? | A) Yes, show "C3", "E4" B) No, just "C", "E" | TBD |
| Auto-play on preset load? | A) Yes, immediate feedback B) No, user clicks play | Leaning B |
| Include extensions in Playground? | A) Yes, all available B) Only 7th chord tones initially | Leaning A |

---

## References

- [dnd-kit Documentation](https://dndkit.com/)
- [Framer Motion Reorder](https://www.framer.com/motion/reorder/)
- [Design_Doc.md](./Design_Doc.md) - Overall project vision
- [phase2.md](./phase2.md) - Chord Explorer implementation

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Author:** Voicing Lab Team
