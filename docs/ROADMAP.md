# Voicing Lab Roadmap

**Last Updated:** December 2025  
**Current Focus:** Phase 4 - Playground Mode v2

This roadmap tracks feature development status. Feature numbers (F1.1, F2.1, etc.) match the specifications in [DESIGN_DOC.md](DESIGN_DOC.md).

---

## Now (Dec 2025 - Jan 2026) 🚧

Currently building **Phase 4: Playground Mode v2** - Adding hand mode context and inversions.

### F4: Playground Mode v2

- [ ] **F4.1** - Hand Mode Toggle (Single | Two)
  - Add toggle button in Playground UI
  - Filter presets based on hand mode
  - Update voicing logic per mode

- [ ] **F4.2** - Single-Hand Presets (Triads + 7th Inversions)
  - Triad (1-3-5)
  - Triad 1st Inversion (3-5-1)
  - Triad 2nd Inversion (5-1-3)
  - 7th Close Position (1-3-5-7)
  - 7th 1st Inversion (3-5-7-1)
  - 7th 2nd Inversion (5-7-1-3)
  - 7th 3rd Inversion (7-1-3-5)
  - All in close position within single octave

- [ ] **F4.3** - Two-Hand Divider (Fixed, Snap-to-Block)
  - Visual divider line between LH/RH blocks
  - Snap to block boundaries
  - Hand-aware octave placement

- [ ] **F4.4** - Enharmonic Chord Symbol Display
  - Display Bb instead of A# in chord symbols
  - Keep internal representation sharps-only
  - Update `buildChordSymbol()` function

**Estimated Completion:** Mid-January 2026

---

## Next (Jan - Feb 2026) 📋

After completing hand mode, focus shifts to making Playground Mode fully featured with extensions and intelligent recognition.

### F5: Extensions in Playground

- [ ] **F5.1** - Multi-State Extension Blocks (Off → 9 → ♭9 → ♯9)
  - Vertical toggle UI (like Price is Right wheel)
  - Enforces mutual exclusivity (can't have 9 and ♭9 simultaneously)
  - States cycle: Off → natural → flat → sharp → Off

- [ ] **F5.2** - Extension Blocks UI (Vertical Toggle)
  - Visual indicator showing available states
  - Color coding for alterations
  - Smooth state transitions

- [ ] **F5.3** - Extension Integration with Presets
  - Shell A + 9th preset
  - Shell Altered (1-3-7-♭9-♯11) for V7
  - Update existing Rootless presets to include 9ths

**Value:** Extensions are core to jazz sound. Without 9ths, voicings sound sparse.

**Estimated Duration:** 2 weeks

---

### F6: Context-Aware Recognition

- [ ] **F6.1** - Voicing Pattern Detection Algorithm
  - `detectVoicingPattern()` function
  - Pattern matching against known voicing library
  - Real-time detection as user drags blocks

- [ ] **F6.2** - Pattern Library (Shell A/B, Drop-2, Rootless, Inversions)
  - Define recognizable patterns with metadata
  - Include descriptions, "why it works", common use
  - Cover: shells, rootless, drop-2, inversions, slash chords

- [ ] **F6.3** - Insight Card UI ("You found a Drop-2!")
  - Non-intrusive card/tooltip
  - Shows pattern name + explanation
  - Dismissible without disrupting workflow

- [ ] **F6.4** - Educational Explanations & Tips
  - Context-sensitive learning content
  - "Why this works" explanations
  - "When to use" recommendations

**Value:** HIGH - Connects user exploration to jazz vocabulary. Discovery-based learning is more engaging than lecture.

**Estimated Duration:** 1 week

---

## Later (Feb - Apr 2026) 📅

The Decision Tree Navigator is the "killer feature" - teaches voice leading through interactive decision-making.

### F7: Decision Tree Navigator

- [ ] **F7.1** - Decision Tree Data Structure
  - `DecisionNode` and `VoicingOption` types
  - Build tree for ii-V-I with template voicings
  - Navigation state management (back, start over)

- [ ] **F7.2** - Voice Leading Analysis Algorithm
  - Analyze common tones, half-steps, whole-steps
  - Calculate smoothness score (0-100)
  - Generate explanations ("C→B is smooth half-step")

- [ ] **F7.3** - Hover-to-Preview Interaction
  - Preview keyboard appears on hover (faded)
  - Shows future voicing before committing
  - Smooth animations

- [ ] **F7.4** - Voice Movement Arrows
  - SVG arrows showing note movement
  - Color-coded by interval type:
    - Green = common tone (stays)
    - Blue = half-step (smooth)
    - Yellow = whole-step (medium)
    - Red = large interval (dramatic)
  - Animated drawing effect

- [ ] **F7.5** - Smoothness Score & Explanations
  - Display score for each option
  - Explain why option is smooth/dramatic
  - Recommendation level (best/good/alternative)

**Scope:** Template voicings only (not playground custom voicings)

**Value:** This is the unique pedagogical feature. No other tool teaches voice leading through interactive decision-making.

**Estimated Duration:** 3-4 weeks

---

## Future Ideas (v3+) 💡

These features are deferred to v3 or beyond. Not currently prioritized but documented for future consideration.

### F8: Advanced Features

- [ ] **F8.1** - Melody Lock (Top Note Focus)
  - Lock specific note as top voice
  - Explore voicings with that melody note
  - Educational tips per top note choice

- [ ] **F8.2** - Live Drop-2 Transformation Animation
  - "Apply Drop-2" button
  - Animated transformation showing voice dropping
  - Before/after comparison

- [ ] **F8.3** - Slash Chord / Bass Note Selector
  - Explicit bass note selection (C7/E, C7/G)
  - LH plays bass, RH plays voicing
  - Chord symbol updates dynamically

- [ ] **F8.4** - Performance Context Toggle (Solo | With Bassist)
  - Adjust recommendations based on context
  - Solo: root important, full harmony
  - With bassist: rootless preferred

- [ ] **F8.5** - Build This Voicing Challenges (Gamification)
  - Guided challenges: "Build a Drop-2 voicing"
  - Progressive difficulty ladder
  - Celebration + explanation on success

**Status:** Ideas only, not planned for immediate development

---

## Completed ✅

### F1: Foundation (MVP - Phase 1)

Completed: December 2025

- [x] **F1.1** - Chord Calculator Algorithm
  - Semitone-based interval calculation
  - `getChordTones()` and `getExtendedChordTones()`
  - Chromatic scale for pitch class math

- [x] **F1.2** - Voicing Templates
  - Shell A, Shell B, Open voicing definitions
  - LH/RH role assignments
  - Base octave specifications

- [x] **F1.3** - Audio Playback (Tone.js)
  - Piano sampler with realistic samples
  - `playVoicing()`, `playArpeggio()`, `playProgression()`
  - Browser audio context handling

- [x] **F1.4** - Piano Keyboard Visualization
  - SVG-based keyboard (C2-C6)
  - Color-coded note highlighting by role
  - Active note display with labels

---

### F2: Template Mode (Phase 2)

Completed: December 2025

- [x] **F2.1** - Extension System (9/11/13)
  - Extended chord tones interface
  - Extension intervals (14, 17, 21 semitones)
  - Alteration intervals (♭9, ♯9, ♯11, ♭13)

- [x] **F2.2** - Extension Checkboxes UI
  - `ExtensionPanel` component
  - Grouped by degree (9ths, 11ths, 13ths)
  - Quality-aware filtering

- [x] **F2.3** - Quality-Aware Extension Rules
  - `AVOID_EXTENSIONS` constant
  - Prevent 11th on maj7/dom7
  - Prevent 13th on min7/min7b5/dim7

- [x] **F2.4** - Extension Tips & Warnings
  - Context-sensitive warnings
  - "11th clashes with major 3rd" feedback
  - Function-appropriate recommendations

---

### F3: Playground Mode v1 (Phase 3)

Completed: December 2025

- [x] **F3.1** - Mode Toggle (Template ↔ Playground)
  - Toggle button in ChordExplorer
  - Conditional rendering per mode
  - Session persistence

- [x] **F3.2** - Drag-and-Drop Blocks (@dnd-kit)
  - Horizontal list sorting
  - Keyboard and pointer sensor support
  - Smooth reorder animations

- [x] **F3.3** - Toggle Blocks On/Off
  - Click to enable/disable
  - Visual feedback (dimmed when disabled)
  - Keyboard/audio skip disabled blocks

- [x] **F3.4** - Preset Buttons (Shell A/B, Open, Rootless A/B, Drop-2)
  - 6 standard voicing presets
  - Animated block reordering on load
  - Reset button to default

- [x] **F3.5** - Octave Placement Algorithm
  - Drag-order octave wrapping
  - Root-lowest enforcement (when leftmost)
  - Min/max spread constraints
  - See [OctavePlacement.md](OctavePlacement.md) for details

- [x] **F3.6** - Min-2-Blocks Constraint
  - Validation prevents < 2 enabled blocks
  - Warning message on constraint violation
  - "At least 2 notes required" feedback

---

## Timeline Summary

| Phase | Features | Timeline | Status |
|-------|----------|----------|--------|
| Phase 1 | F1.1-F1.4 (Foundation) | Completed | ✅ |
| Phase 2 | F2.1-F2.4 (Template Mode) | Completed | ✅ |
| Phase 3 | F3.1-F3.6 (Playground v1) | Completed | ✅ |
| **Phase 4** | **F4.1-F4.4 (Playground v2)** | **Dec 2025 - Jan 2026** | **🚧 In Progress** |
| Phase 5 | F5.1-F5.3 (Extensions) | Jan-Feb 2026 | 📋 Planned |
| Phase 6 | F6.1-F6.4 (Recognition) | Jan-Feb 2026 | 📋 Planned |
| Phase 7 | F7.1-F7.5 (Decision Tree) | Feb-Apr 2026 | 📅 Later |
| Phase 8 | F8.1-F8.5 (Advanced) | TBD | 💡 Ideas |

**Total Estimated Time to Decision Tree:** 8-10 weeks from now

---

## Priority Rationale

### Why This Order?

1. **Phase 4 First (Hand Mode)**: Foundational for learning chord shapes. Single-hand inversions are prerequisites to understanding shells/rootless.

2. **Phase 5 Next (Extensions)**: Extensions are core to jazz sound, not optional. Rootless voicings (3-5-7-9) require 9ths. Current voicings sound sparse without extensions.

3. **Phase 6 Before Phase 7 (Recognition)**: Low-effort, high-value feature. Provides immediate pedagogical feedback. Builds excitement for Decision Tree.

4. **Phase 7 Last (Decision Tree)**: Most complex feature, requires 3-4 weeks. This is the "killer feature" that teaches voice leading through interactive decision-making.

5. **Phase 8 Deferred (Future Ideas)**: Nice-to-have features that don't block core learning objectives. Melody Lock, Slash Chords, and Context Toggle add complexity without proportional pedagogical value at this stage.

---

## Success Metrics

### Phase 4 Success
- [ ] Users can practice triad inversions in single-hand mode
- [ ] Two-hand divider clearly shows LH/RH split
- [ ] Chord symbols display with correct enharmonic spelling

### Phase 5 Success
- [ ] Extensions integrate seamlessly with existing presets
- [ ] Users understand mutual exclusivity of alterations
- [ ] Voicings sound "jazzy" with 9ths

### Phase 6 Success
- [ ] System recognizes standard voicings as user builds them
- [ ] Insights provide helpful education without annoyance
- [ ] Users discover jazz vocabulary organically

### Phase 7 Success
- [ ] Users navigate decision tree making informed choices
- [ ] Voice leading visualizations are clear and educational
- [ ] Users internalize smooth voice leading principles

---

## Notes

- Feature numbers (F1.1, F2.1, etc.) are consistent across DESIGN_DOC.md and ROADMAP.md
- See [DESIGN_DOC.md](DESIGN_DOC.md) for detailed specifications
- See [OctavePlacement.md](OctavePlacement.md) for octave placement algorithm
- Historical docs archived in [docs/archive/](archive/)

---

**Version:** 1.0  
**Document Status:** Active roadmap, updated as features complete

