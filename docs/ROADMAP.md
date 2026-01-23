# Voicing Lab Roadmap

**Last Updated:** January 2026
**Current Focus:** Phase 7 - Decision Tree Navigator

This roadmap tracks feature development status. Feature numbers (F1.1, F2.1, etc.) match the specifications in [DESIGN_DOC.md](DESIGN_DOC.md).

---

## Now (Dec 2025 - Jan 2026) ✅

**Phase 4: Playground Mode v2** - Simplified to focus on voicing construction. Enharmonic display implemented.

### F4: Playground Mode v2

- [ ] **F4.1** - Hand Mode Toggle (Single | Two) ⏸️ DEFERRED
  - Removed from Playground Mode
  - Will be introduced in later phases where functionally necessary

- [ ] **F4.2** - Single-Hand Presets (Triads + 7th Inversions) ⏸️ DEFERRED
  - Removed from Playground Mode
  - Practice mode feature for future phase

- [ ] **F4.3** - Two-Hand Divider (Fixed, Snap-to-Block) ⏸️ DEFERRED
  - Removed from Playground Mode
  - Will be introduced with Melody-on-Top or Practice Mode

- [x] **F4.4** - Enharmonic Chord Symbol Display ✅
  - Display Bb instead of A# in chord symbols
  - Keep internal representation sharps-only
  - COMPLETED December 2025

**Phase 4 Update (December 2025):**
Hand context features (F4.1-F4.3) have been removed from Playground Mode to simplify the learning experience. Playground now focuses purely on voicing construction (which notes, what order). Hand assignment will be introduced in later phases where it's functionally necessary:
- Decision Tree: Passive color zones (Phase 7)
- Melody-on-Top: Automatic split based on 1-octave rule (Phase 8)
- Practice Mode: Explicit hand positions + fingering (Phase 9+)

**Status:** Simplified December 2025 ✅

---

## Now (Jan 2026) ✅

Pattern recognition is now complete, enabling discovery-based learning of jazz vocabulary.

### F6: Context-Aware Recognition ✅

- [x] **F6.1** - Voicing Pattern Detection Algorithm ✅
  - `detectVoicingPattern()` function implemented
  - Pattern matching against known voicing library (31 patterns)
  - Real-time detection as user drags blocks (300ms debounce)
  - Fuzzy matching with confidence scoring

- [x] **F6.2** - Pattern Browser & Library ✅
  - 31 recognizable patterns with metadata
  - Categories: shell, rootless, spread, inversion, slash
  - Browsable modal UI with "Try It" buttons
  - Related patterns linking (Shell A ↔ Shell B)

- [x] **F6.3** - Insight Card UI ("You built a Drop-2!") ✅
  - PatternCard with celebration animation
  - Category badges (Shell, Rootless, Spread)
  - Chord function badges (ii, V, I)
  - Expandable educational content

- [x] **F6.4** - Educational Explanations & Tips ✅
  - "Why It Works" callout with explanations
  - Context-sensitive fuzzy match suggestions
  - "When to use" recommendations
  - Related patterns for further exploration

**Value:** HIGH - Connects user exploration to jazz vocabulary. Discovery-based learning is more engaging than lecture.

**Completed:** January 2026 ✅

---

## Next (Feb - Apr 2026) 📋

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

### F5: Extensions in Playground

Completed: January 2026 (UI Redesign: December 2024)

- [x] **F5.1** - Multi-State Extension Blocks (Off → 9 → ♭9 → ♯9) ✅
  - Click to cycle through states
  - Enforces mutual exclusivity (can't have 9 and ♭9 simultaneously)
  - States cycle based on extension family
  - All variants available regardless of current selection

- [x] **F5.2** - Unified Note Selector UI ✅
  - Separate selector area for choosing notes (R-3-5-7-9-11-13)
  - Fixed sequential order, never reordered
  - State indicator dots only on extensions (not chord tones)
  - Unified drag area for enabled notes with X button removal

- [x] **F5.3** - Extension Integration with Presets ✅
  - Shell A+9 preset added
  - Shell Altered (1-3-7-♭9-♯11) for V7 added
  - Rootless presets include 9ths by default
  - Presets don't affect selector display order

**Value:** Extensions are core to jazz sound. Without 9ths, voicings sound sparse.

**UI Refinement (December 2024):**
- Redesigned with separate selector and drag areas
- Fixed extension cycling bug (state persistence + variant availability)
- Selector always shows R-3-5-7-9-11-13 in fixed order
- Chord tones toggle on/off, extensions cycle through alterations

---

### F6: Context-Aware Recognition

Completed: January 2026

- [x] **F6.1** - Voicing Pattern Detection Algorithm
  - `detectVoicingPattern()` with exact and fuzzy matching
  - Confidence scoring for fuzzy matches
  - 300ms debounce for performance

- [x] **F6.2** - Pattern Browser & Library
  - 31 patterns across 5 categories
  - PatternBrowser modal with category accordion
  - "Try It" buttons load patterns into Playground
  - Related patterns linking

- [x] **F6.3** - Insight Card UI ("You built a Drop-2!")
  - PatternCard with celebration animation
  - Category and chord function badges
  - Expandable educational content

- [x] **F6.4** - Educational Explanations & Tips
  - "Why It Works" callout boxes
  - Contextual fuzzy match suggestions
  - Related patterns section

---

## Timeline Summary

| Phase | Features | Timeline | Status |
|-------|----------|----------|--------|
| Phase 1 | F1.1-F1.4 (Foundation) | Completed | ✅ |
| Phase 2 | F2.1-F2.4 (Template Mode) | Completed | ✅ |
| Phase 3 | F3.1-F3.6 (Playground v1) | Completed | ✅ |
| Phase 4 | F4.1-F4.4 (Playground v2) | Completed | ✅ |
| Phase 5 | F5.1-F5.3 (Extensions) | Completed | ✅ |
| Phase 6 | F6.1-F6.4 (Recognition) | Completed | ✅ |
| **Phase 7** | **F7.1-F7.5 (Decision Tree)** | **Feb-Apr 2026** | **📋 Next** |
| Phase 8 | F8.1-F8.5 (Advanced) | TBD | 💡 Ideas |

**Total Estimated Time to Decision Tree:** 6-8 weeks from now

---

## Priority Rationale

### Why This Order?

1. **Phase 4 First (Hand Mode)**: Foundational for learning chord shapes. Single-hand inversions are prerequisites to understanding shells/rootless.

2. **Phase 5 Complete (Extensions)**: Extensions are now integrated. Rootless voicings include 9ths by default. Users can cycle through alterations (♭9, ♯9, ♯11, ♭13) to explore jazz harmony.

3. **Phase 6 Before Phase 7 (Recognition)**: Low-effort, high-value feature. Provides immediate pedagogical feedback. Builds excitement for Decision Tree.

4. **Phase 7 Last (Decision Tree)**: Most complex feature, requires 3-4 weeks. This is the "killer feature" that teaches voice leading through interactive decision-making.

5. **Phase 8 Deferred (Future Ideas)**: Nice-to-have features that don't block core learning objectives. Melody Lock, Slash Chords, and Context Toggle add complexity without proportional pedagogical value at this stage.

---

## Success Metrics

### Phase 4 Success
- [x] Chord symbols display with correct enharmonic spelling ✅
- [x] Hand features deferred to appropriate future phases ✅

### Phase 5 Success
- [x] Extensions integrate seamlessly with existing presets ✅
- [x] Users understand mutual exclusivity of alterations ✅
- [x] Voicings sound "jazzy" with 9ths ✅

### Phase 6 Success ✅
- [x] System recognizes standard voicings as user builds them ✅
- [x] Insights provide helpful education without annoyance ✅
- [x] Users discover jazz vocabulary organically ✅

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

