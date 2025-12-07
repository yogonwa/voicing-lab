# Voicing Lab

A browser-based tool to help piano players learn jazz voicings. See and hear ii-V-I progressions voiced in different professional styles.

## What It Does

You know what chords to play from a lead sheet (Dm7, G7, Cmaj7), but you're stuck playing boring root-position voicings. Voicing Lab shows you how professionals voice the same chords using shell voicings, open voicings, and more.

## Current Status

**Phase 1: Algorithm Proof of Concept** ✅ In Progress

- [x] Chord tone calculator
- [x] Voicing templates (Shell A, Shell B, Open)
- [x] Test coverage
- [ ] Voicing generator
- [ ] Text display UI

## Tech Stack

- **React 19** + **TypeScript**
- **Tone.js** — Audio playback with piano samples
- **Tailwind CSS** — Styling

## Project Structure

```
src/
├── lib/                    # Core music theory logic
│   ├── chordCalculator.ts  # Note transposition, chord tone generation
│   ├── voicingTemplates.ts # Voicing patterns and progressions
│   └── index.ts            # Barrel exports
├── components/             # React components (coming)
└── App.tsx                 # Main app
```

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Run tests
npm test

# Run tests once (CI mode)
npm test -- --watchAll=false
```

## Voicing Templates

| Template | Left Hand | Right Hand | Sound |
|----------|-----------|------------|-------|
| Shell Position A | root | 3rd, 7th | Classic 1-3-7 shell |
| Shell Position B | root | 7th, 3rd | Inverted 1-7-3 shell |
| Open Voicing | root, 5th | 3rd, 7th | Fuller sound |

## Roadmap

See [docs/MVP_scope.md](docs/MVP_scope.md) for full specification.

- **Phase 1:** Text-based algorithm proof of concept
- **Phase 2:** Audio playback with Tone.js
- **Phase 3:** Piano keyboard visualization
- **Phase 4:** Polish and ship MVP

## License

MIT
