# Voicing Lab

A browser-based tool to help piano players learn jazz voicings. See and hear ii-V-I progressions voiced in different professional styles.

🎹 **Live Demo:** [Coming soon]

## What It Does

You know what chords to play from a lead sheet (Dm7, G7, Cmaj7), but you're stuck playing boring root-position voicings. Voicing Lab shows you how professionals voice the same chords using shell voicings, open voicings, and more.

## MVP Complete ✅

- [x] **Chord Calculator** — Calculates chord tones for any root × quality (60 combinations)
- [x] **3 Voicing Styles** — Shell A, Shell B, Open voicings
- [x] **Audio Playback** — Hear each chord with Tone.js piano samples
- [x] **Piano Keyboard** — 4-octave visualization (C2-B5)
- [x] **Color-Coded Notes** — Root (red), 3rd (blue), 5th (green), 7th (purple)
- [x] **Hand Differentiation** — LH thick border, RH normal border
- [x] **Audio Sync** — Keyboard highlights during playback
- [x] **Keyboard Shortcuts** — Space to play, 1/2/3 to switch voicings
- [x] **92 Tests** — Comprehensive test coverage

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
| Components | 35 | UI interactions |
| **Total** | **92** | All passing ✅ |

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

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play progression |
| `1` | Shell Position A |
| `2` | Shell Position B |
| `3` | Open Voicing |

## Roadmap

See [docs/Design_Doc.md](docs/Design_Doc.md) for full product vision.

### Completed
- **Phase 1:** ✅ Text-based algorithm proof of concept
- **Phase 2:** ✅ Audio playback with Tone.js
- **Phase 3:** ✅ Piano keyboard visualization
- **Phase 4:** ✅ Polish & ship MVP

### Next Up
- **Decision Tree Navigator** — Pick voicings interactively, see voice leading arrows
- **More Voicing Types** — Rootless, Drop-2, Extensions
- **Key Transposition** — Practice in all 12 keys

## License

MIT
