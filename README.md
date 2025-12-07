# Voicing Lab

A browser-based tool to help piano players learn jazz voicings. See and hear ii-V-I progressions voiced in different professional styles.

## What It Does

You know what chords to play from a lead sheet (Dm7, G7, Cmaj7), but you're stuck playing boring root-position voicings. Voicing Lab shows you how professionals voice the same chords using shell voicings, open voicings, and more.

## Current Status

**Phase 2 Complete** ✅

- [x] Chord tone calculator (12 roots × 5 qualities)
- [x] Voicing templates (Shell A, Shell B, Open)
- [x] Interactive chord calculator with audio preview
- [x] Audio playback with Tone.js piano samples
- [x] Voicing display with play progression
- [x] 72 tests passing

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

| Module | Coverage | Notes |
|--------|----------|-------|
| chordCalculator.ts | 100% | All chord tone calculations |
| voicingTemplates.ts | 100% | Template definitions |
| voicingGenerator.ts | 97% | Voicing generation |
| audioEngine.ts | 0% | Mocked in tests (Tone.js) |
| Components | ~50% | UI interactions |

## Architecture

### Three-Layer Voicing System

```
Layer 1: chordCalculator    → WHAT notes (D, F, A, C)
Layer 2: voicingTemplates   → WHICH hand plays what (LH: root, RH: 3rd+7th)
Layer 3: voicingGenerator   → WHERE on piano (D2, F3, C4)
```

### Voicing Templates

| Template | Left Hand | Right Hand | Sound |
|----------|-----------|------------|-------|
| **Shell Position A** | root | 3rd, 7th | Classic 1-3-7 shell |
| **Shell Position B** | root | 7th, 3rd | Inverted 1-7-3 shell |
| **Open Voicing** | root, 5th | 3rd, 7th | Fuller sound |

## Roadmap

See [docs/MVP_scope.md](docs/MVP_scope.md) for full specification.

- **Phase 1:** ✅ Text-based algorithm proof of concept
- **Phase 2:** ✅ Audio playback with Tone.js
- **Phase 3:** Piano keyboard visualization
- **Phase 4:** Polish and ship MVP

## License

MIT
