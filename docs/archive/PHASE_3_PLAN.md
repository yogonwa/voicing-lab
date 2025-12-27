# Phase 3: Piano Keyboard Visualization

## Goal
Add a visual piano keyboard that shows which keys are pressed, synchronized with audio playback, with color-coded chord tones.

---

## Key Decisions

| Decision | Choice | Notes |
|----------|--------|-------|
| **Text UI** | Keep (augment) | Move below keyboard, don't delete |
| **Audio sync** | Yes | Keys highlight when chord plays |
| **Hand differentiation** | Border weight | LH = thicker border, RH = normal |
| **Future: Arpeggio** | Planned | Rolled chords highlight L→R |
| **Rendering** | SVG | CSS animations, accessibility |
| **Range** | C2 - B5 (4 octaves) | Covers voicings + future extensions |

---

## Visual Design

### Keyboard Layout (C2 - B5, 4 octaves = 48 keys)
```
┌───────────────────────────────────────────────────────────────────────────────────┐
│  ┌──┬─┬──┬─┬──┬──┬─┬──┬─┬──┬─┬──┬──┬─┬──┬─┬──┬─┬──┬──┬─┬──┬─┬──┬──┬─┬──┬─┬──┬─┬──┐│
│  │  │█│  │█│  │  │█│  │█│  │█│  │  │█│  │█│  │█│  │  │█│  │█│  │  │█│  │█│  │█│  ││
│  │  │█│  │█│  │  │█│  │█│  │█│  │  │█│  │█│  │█│  │  │█│  │█│  │  │█│  │█│  │█│  ││
│  │  └┬┘  └┬┘  │  └┬┘  └┬┘  └┬┘  │  └┬┘  └┬┘  └┬┘  │  └┬┘  └┬┘  │  └┬┘  └┬┘  └┬┘  ││
│  │🔴 │   │   │   │ 🔵 │   │   │   │ 🟢 │   │   │ 🟣 │   │   │   │   │   │   │   ││
│  └───┴───┴───┴───┴────┴───┴───┴───┴────┴───┴───┴────┴───┴───┴───┴───┴───┴───┴───┘│
│       C2            C3            C4            C5            (extensions here)   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

### Color Coding (Chord Roles)
| Role | Color | CSS Variable |
|------|-------|--------------|
| Root | Red | `--color-root: #fc8181` |
| 3rd | Blue | `--color-third: #63b3ed` |
| 5th | Green | `--color-fifth: #68d391` |
| 7th | Purple | `--color-seventh: #b794f4` |

*Note: Colors match existing ChordToneDisplay. Will iterate.*

### Hand Differentiation
| Hand | Visual Treatment |
|------|------------------|
| Left Hand | Thick border (4px) |
| Right Hand | Normal border (2px) |

### Legend
```
┌──────────────────────────────────────────┐
│  🔴 Root   🔵 3rd   🟢 5th   🟣 7th      │
│  ━━ Left Hand   ── Right Hand            │
└──────────────────────────────────────────┘
```

---

## Component Architecture

```
src/components/
├── PianoKeyboard/
│   ├── index.ts              # Barrel export
│   ├── PianoKeyboard.tsx     # Main component
│   ├── PianoKeyboard.css     # Styles
│   ├── PianoKey.tsx          # Individual key component
│   ├── KeyboardLegend.tsx    # Color/hand legend
│   ├── KeyboardLegend.css    # Legend styles
│   ├── types.ts              # TypeScript interfaces
│   └── utils.ts              # Note mapping utilities
```

---

## Data Types

```typescript
// Which notes are active and their roles
interface ActiveNote {
  note: Note;           // e.g., "D3"
  role: VoicingRole;    // "root" | "third" | "fifth" | "seventh"
  hand: "left" | "right";
}

// Props for PianoKeyboard
interface PianoKeyboardProps {
  activeNotes: ActiveNote[];
  startOctave?: number;  // default: 2
  endOctave?: number;    // default: 5
}

// Props for individual key
interface PianoKeyProps {
  note: Note;
  isBlack: boolean;
  isActive: boolean;
  role?: VoicingRole;
  hand?: "left" | "right";
}
```

---

## Data Flow

```
VoicedChord + Chord
    │
    ▼
┌─────────────────────────────┐
│ getActiveNotes(voicing,     │  ← Utility in utils.ts
│   chord)                    │
│ Maps notes to roles + hands │
└─────────────────────────────┘
    │
    ▼
ActiveNote[]
    │
    ▼
┌─────────────────────────────┐
│ PianoKeyboard               │
│ - Renders 4 octaves of keys │
│ - Passes active state down  │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│ PianoKey (×48)              │
│ - Highlights if active      │
│ - Shows role color          │
│ - Shows hand border         │
└─────────────────────────────┘
```

---

## Keyboard Highlighting Behavior

### Default State
- No keys highlighted (clean slate for study)

### Template Selected (no playback)
- No keys highlighted

### Single Chord Clicked
- Keys highlight immediately
- **Sticky**: Stays highlighted until next user action

### Progression Playback
1. **Dm7 plays** → Dm7 keys highlight, others dim
2. **G7 plays** → G7 keys highlight, Dm7 keys dim
3. **Cmaj7 plays** → Cmaj7 keys highlight
4. **End** → All keys clear (back to default)

### Future: Arpeggio Mode
When arpeggio is enabled:
1. LH notes highlight first (left to right within hand)
2. RH notes highlight next (left to right)
3. Creates "rolled chord" visual effect

---

## Tasks

### Phase 3a: Static Keyboard ✅ COMPLETE
| # | Task | Status |
|---|------|--------|
| 1 | Create note-to-position mapping utility | ✅ Done |
| 2 | Build `PianoKey` component (white + black) | ✅ Done |
| 3 | Build `PianoKeyboard` component | ✅ Done |
| 4 | Add `getActiveNotes()` utility | ✅ Done |
| 5 | Style with role colors + hand borders | ✅ Done |
| 6 | Add `KeyboardLegend` component | ✅ Done |
| 7 | Integrate into `VoicingDisplay` | ✅ Done |
| 8 | Tests (existing tests still pass) | ✅ Done |

### Phase 3b: Audio Sync ✅ COMPLETE
| # | Task | Status |
|---|------|--------|
| 9 | Update playback to emit current chord index | ✅ Done |
| 10 | Sync keyboard highlighting with playback | ✅ Done |
| 11 | Add transition animations | ✅ Done |

### Phase 3c: UX Polish ✅ COMPLETE
| # | Task | Status |
|---|------|--------|
| 12 | Sticky highlight for single chord clicks | ✅ Done |
| 13 | Clear highlights on template change | ✅ Done |
| 14 | Octave markers (C2, C3, C4, C5) | ✅ Done |

### Phase 3d: Future Enhancements (Not in MVP)
| # | Task | Status |
|---|------|--------|
| 15 | Arpeggio mode (roll L→R) | Planned |
| 16 | Click key to hear note | Planned |
| 17 | Responsive sizing for mobile | Planned |

---

## Page Layout After Phase 3

```
┌─────────────────────────────────────────────┐
│              Voicing Lab                    │
│        Jazz piano voicing explorer          │
├─────────────────────────────────────────────┤
│         [Chord Calculator Panel]            │
├─────────────────────────────────────────────┤
│              ii-V-I in C Major              │
│   [Shell A]  [Shell B]  [Open]              │
├─────────────────────────────────────────────┤
│                                             │
│         ┌─────────────────────┐             │
│         │   PIANO KEYBOARD    │  ✅ Done    │
│         │   (4 octaves)       │             │
│         └─────────────────────┘             │
│                                             │
│         [Legend: R 3 5 7 / LH RH]           │
│                                             │
├─────────────────────────────────────────────┤
│         [▶ Play Progression]                │
├─────────────────────────────────────────────┤
│            Note Details                     │
│   ┌─────┐  ┌─────┐  ┌─────────┐             │
│   │ Dm7 │  │ G7  │  │ Cmaj7   │  ✅ Kept    │
│   │LH:D3│  │LH:G3│  │ LH:C3   │             │
│   │RH:..│  │RH:..│  │ RH:...  │             │
│   └─────┘  └─────┘  └─────────┘             │
└─────────────────────────────────────────────┘
```

---

## Success Criteria

- [x] Can clearly see which piano keys are pressed
- [x] Colors distinguish root, 3rd, 5th, 7th
- [x] Can tell LH from RH notes
- [x] Keyboard syncs with audio playback
- [x] Text display still visible below
- [x] Default state shows no highlights (clean)
- [x] Single chord click = sticky highlight
- [x] Progression clears highlights when done
- [x] Works on tablet/desktop widths (basic support)

---

## Resolved Questions

1. **Black key highlighting** - Used lighter overlay with glow effect ✅
2. **Octave labels** - Added C2, C3, C4, C5 markers below keyboard ✅
3. **Note names on keys** - Not shown (keeps UI clean) ✅

---

## References

- [react-piano](https://github.com/kevinsqi/react-piano) - Reference implementation
- [SVG Piano Tutorial](https://css-tricks.com/svg-piano-keyboard/)
- Existing color scheme from `ChordToneDisplay.css`
