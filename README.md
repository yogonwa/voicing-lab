# Voicing Lab

A browser-based tool to help piano players learn jazz voicings. See and hear ii-V-I progressions voiced in different professional styles.

## What It Does

You know what chords to play from a lead sheet (Dm7, G7, Cmaj7), but you're stuck playing boring root-position voicings. Voicing Lab shows you how professionals voice the same chords using shell voicings, open voicings, and more.

## Current Status

**Phase 3 Complete** ✅

- [x] Chord tone calculator (12 roots × 5 qualities)
- [x] Voicing templates (Shell A, Shell B, Open)
- [x] Interactive chord calculator with audio preview
- [x] Audio playback with Tone.js piano samples
- [x] **Piano keyboard visualization (4 octaves)**
- [x] **Color-coded chord roles (R, 3, 5, 7)**
- [x] **Hand differentiation (LH/RH borders)**
- [x] **Audio-synced highlighting**
- [x] **Sticky highlights for study mode**
- [x] 89 tests passing

## Tech Stack

- **React 19** + **TypeScript**
- **Tone.js** — Audio playback with Salamander piano samples
- **Jest** + **React Testing Library** — Test coverage

## Project Structure

```
src/
├── lib/                          # Core music theory library
│   ├── chordCalculator.ts        # Layer 1: Chord tone calculation
│   ├── voicingTemplates.ts       # Layer 2: Voicing patterns
│   ├── voicingGenerator.ts       # Layer 3: Generate playable voicings
│   ├── audioEngine.ts            # Tone.js audio playback
│   ├── index.ts                  # Barrel exports
│   └── __mocks__/                # Jest mocks
│       └── audioEngine.ts
├── components/
│   ├── PianoKeyboard/            # Piano visualization (Phase 3)
│   │   ├── PianoKeyboard.tsx     # Main keyboard component
│   │   ├── PianoKey.tsx          # Individual key
│   │   ├── KeyboardLegend.tsx    # Color/hand legend
│   │   ├── utils.ts              # Note mapping
│   │   └── types.ts              # TypeScript interfaces
│   ├── ChordToneDisplay.tsx      # Interactive chord calculator
│   ├── VoicingDisplay.tsx        # ii-V-I progression display
│   └── index.ts                  # Barrel exports
└── App.tsx                       # Main application
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage --watchAll=false
```

## Test Coverage

| Module | Tests | Notes |
|--------|-------|-------|
| chordCalculator.ts | 16 | All chord tone calculations |
| voicingTemplates.ts | 13 | Template definitions |
| voicingGenerator.ts | 28 | Voicing generation + close position |
| audioEngine.ts | 0 | Mocked in tests (Tone.js) |
| Components | 32 | UI interactions |
| **Total** | **89** | All passing ✅ |

## Architecture

### Three-Layer Voicing System

```
Layer 1: chordCalculator    → WHAT notes (D, F, A, C)
Layer 2: voicingTemplates   → WHICH hand plays what (LH: root, RH: 3rd+7th)
Layer 3: voicingGenerator   → WHERE on piano (D3, F4, C5)
```

### Voicing Templates

| Template | Left Hand | Right Hand | Sound |
|----------|-----------|------------|-------|
| **Shell Position A** | root | 3rd, 7th | Classic 1-3-7 shell |
| **Shell Position B** | root | 7th, 3rd | Inverted 1-7-3 shell |
| **Open Voicing** | root, 5th | 3rd, 7th | Fuller sound |

### Keyboard Highlighting

| State | Behavior |
|-------|----------|
| Default | No highlights (clean) |
| Template change | Clears highlights |
| Single chord click | **Sticky** highlight for study |
| Progression play | Synced highlights → clear at end |

## Roadmap

See [docs/MVP_scope.md](docs/MVP_scope.md) for full specification.

- **Phase 1:** ✅ Text-based algorithm proof of concept
- **Phase 2:** ✅ Audio playback with Tone.js
- **Phase 3:** ✅ Piano keyboard visualization
- **Phase 4:** Polish and ship MVP

## License

MIT
