# Voicing Lab
Browser-based jazz piano voicing trainer. Teaches ii-V-I progressions with interactive audio.

## Status
**Last touched:** Feb 2026 | **State:** Awaiting manual testing + merge to main
**Current branch:** phase7-voice-leading-trainer

### Where We Are
- **Phases 1-6:** Complete ✅
- **Phase 7 (Voice Leading Trainer):** Code complete ✅ — awaiting manual QA 🧪
  - `/trainer` route: interactive voice leading trainer with scoring
  - Build voicings chord-by-chord through progressions
  - Key unlock system (circle of fifths)
  - ChordExplorer template mode: smart octave placement for A/B roots
- **Phase 8 (Theory Drills):** Code complete ✅ — awaiting manual QA 🧪
  - `/drills` route: SM-2 spaced-repetition flashcard drills
  - 3rd, 7th, and guide-tone drill types
  - Tonal.js for correct enharmonic spelling (Cmin7→Bb, F#maj7→A#)
  - localStorage persistence, leech detection, session cap

### Next Steps
1. **Manual testing** — test `/trainer` and `/drills` routes in browser
2. **Merge** — create PR from `phase7-voice-leading-trainer` → `main`
3. **Next feature** — see ideas below

### Feature Ideas (Post-Merge)
- Audio in drills (hear the chord, name the tone)
- More drill types: 5ths, 9ths, extensions
- Voice Leading Trainer audio playback
- Decision Tree Navigator (original F7 idea — guided voicing choices with arrows)

## Run It
```bash
npm start          # Dev server at localhost:3000
npm test           # 338 tests, all passing
npm run build      # Production build
```

## Testing

After modifying any TypeScript/React component files, run the test suite and verify compilation before considering the task complete. Ensure all tests pass (e.g., 'npm test' should show 284+ passing tests). This catches bugs immediately rather than during manual testing.

## Key Files

### Core Library (src/lib/)
- `chordCalculator.ts` - Chord tone calculation (Layer 1)
- `voicingTemplates.ts` - Voicing patterns (Layer 2)
- `voicingGenerator.ts` - Generates playable voicings (Layer 3)
- `patterns.ts` - 31 voicing pattern definitions
- `voicingRecognition.ts` - Pattern detection algorithm
- `voiceLeadingAnalysis.ts` - Voice motion scoring (Phase 7)
- `trainerState.ts` - Trainer mode state management (Phase 7)
- `keyProgress.ts` - Key unlock system (Phase 7)
- `starterVoicings.ts` - Starting voicings for each key (Phase 7)
- `drillGenerator.ts` - Flashcard question generator (Phase 8)
- `spacedRepetition.ts` - SM-2 algorithm + localStorage (Phase 8)
- `chordSpelling.ts` - Tonal.js wrapper for enharmonic display (Phase 8)

### UI Components (src/components/)
- `App.tsx` - Router: Explorer / Trainer / Drills routes
- `ChordExplorer/` - Main explorer UI (Template + Playground)
- `PatternBrowser/` - Browse 31 patterns modal
- `FeedbackArea/` - PatternCard, WarningCard
- `VoiceLeadingTrainer/` - Trainer mode with 6 sub-components (Phase 7)
- `TheoryDrills/` - SM-2 drill system: Page, FlashCard, Settings, Summary (Phase 8)
- `PianoKeyboard/` - Piano visualization

### Documentation
- `docs/ROADMAP.md` - Feature phases and priorities
- `docs/DESIGN_DOC.md` - Complete architecture (32KB)
- `docs/PHASE_7_PLAN.md` - Voice Leading Trainer details

## Architecture Rules (DO NOT VIOLATE)

### Core vs Audio Boundary
- Import pure theory from `src/lib/core.ts` (NO Tone.js)
- Import audio from `src/lib/audio.ts` (Tone.js boundary)
- Never import Tone.js transitively from pure modules

### Single Source of Truth
- **Notes/pitch:** `noteUtils.ts` is canonical
- **Extensions:** `extensionUtils.ts` is canonical

### Playground Mode Invariants
- Drag order is respected visually AND audibly
- If root is dragged away from bass, WARN but don't auto-correct
- See `docs/OctavePlacement.md` for algorithm

### Pattern Detection
- 300ms debounce for performance
- Exact match first, then fuzzy matching
