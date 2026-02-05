# Voice Leading Trainer Redesign

**Date:** February 4, 2026
**Status:** Design Complete - Ready for Implementation
**Context:** Redesigning Phase 7 based on loveable prototype UX with enhanced features

---

## Overview

Redesign the Voice Leading Trainer to combine the direct piano-clicking interaction from the loveable prototype with the sophisticated scoring and unlock system from Phase 7. Focus on intuitive UX while maintaining pedagogical depth.

---

## Design Decisions Summary

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Interaction Model** | Click piano keys directly (not abstract roles) | More intuitive, immediate visual feedback |
| **Layout** | 3-column responsive (Setup \| Keyboards \| Scoring) | Clean organization, all info visible |
| **Keyboard Stacking** | Vertical stack, lock after submit | Shows progression history, voice leading context |
| **Chord Tone Labels** | Below keyboard in click order [3] [5] [7] [9] | Teaches theory without cluttering keys |
| **First Chord** | User selects from preset dropdown | Pedagogical control, ties to unlock system |
| **Scoring** | Phase 7 algorithm (motion + pattern + playability) | Sophisticated, already implemented |
| **Unlock System** | Progressive: Keys AND voicing styles | Gradual complexity, sustained engagement |
| **Progressions** | Fixed II-V-I to start, unlock more later | Focus mastery before expanding |
| **Voice Leading Viz** | Color-coded arrows between keyboards | Visual teaching of smooth motion |
| **Audio** | Keys on click + full voicing on submit | Immediate + complete feedback |
| **Completion** | Simple screen + progression playback | Review and reinforce learning |
| **Try Again** | Available after each submit | Allow improvement, reduce frustration |

---

## Section 1: Overall Architecture & Layout

### Three-Column Layout

**Left Column (Setup Panel):**
- Progression selector (locked to "II-V-I" initially, more unlock later)
- Key selector (C major unlocked by default, circle of fifths progression)
- Starting voicing style dropdown (Shell A, Rootless A, etc. - progressive unlock)
- Starting voicing preset dropdown (specific voicing within chosen style)
- "Start Practice" button (becomes "Reset" during practice)

**Center Column (Interactive Practice Area):**
- Chord info header (shows current target chord: "Build: Dm7")
- Stacked keyboards (grow vertically as you progress through chords)
- Each keyboard shows:
  - Selected piano keys (highlighted)
  - Chord tone labels below keyboard: [♭3] [5] [♭7] [9] in click order
  - Voice leading arrows (connecting to keyboard above, color-coded by motion type)
  - Lock state (locked keyboards dim slightly, become non-interactive)
- First keyboard shows preset voicing (auto-filled, locked)
- Subsequent keyboards start empty, user clicks to build

**Right Column (Scoring Panel):**
- Before submit: Shows note count, "Submit Voicing" button
- After submit: Shows score breakdown (motion, pattern, playability), "Next Chord" / "Try Again" buttons
- On completion: Average score, encouragement message, "Practice Again" + "Play Progression" buttons

---

## Section 2: Interactive Keyboard Mechanics

### Piano Keyboard Interaction

Each keyboard spans 3 octaves (C3-C5) with full 88-key visual but focused range for voicings. Users interact by clicking keys directly.

### Building a Voicing (Active Keyboard)

- Click any key to select it (key highlights in color)
- Click again to deselect (removes highlight)
- Selected notes appear in a label row below keyboard: [♭3] [5] [♭7] [9]
  - Labels show chord tones/extensions relative to target chord
  - Order reflects click sequence (teaches voice ordering awareness)
  - Labels use chord theory notation: R, ♭3, 3, 5, ♭7, 7, 9, ♭9, ♯9, 11, ♯11, 13, ♭13
- Each key click plays its note (Tone.js piano sample)
- No limit on note count (user can experiment, but scoring rewards good choices)
- "Submit Voicing" button enables once at least 2 notes selected

### Locked Keyboards (Previous Chords)

- Shows previously submitted voicings
- Keys highlighted in muted color (not interactive)
- Chord tone labels remain visible below
- Voice leading arrows draw from this keyboard to the one below it

### Visual Feedback

- Selected keys: Primary color highlight (bright)
- Locked keys: Muted/gray highlight
- Hover state: Subtle brightness increase
- Common tones between chords: Could use matching colors in arrows

---

## Section 3: Voice Leading Visualization

### Arrow System Between Keyboards

When you submit a voicing, visual arrows draw from the locked keyboard above to your newly submitted keyboard below, showing how each voice moved.

### Arrow Matching Algorithm

Uses the same proximity-based matching from Phase 7's `analyzeVoiceMotion`:
- Each note in previous chord pairs with closest note in current chord
- Prevents duplicate matches (each note connects to exactly one target)
- Creates clear visual voice leading paths

### Color-Coded Motion Types

- **Green arrows**: Common tone (note stays same, 0 semitones)
- **Blue arrows**: Half-step motion (±1 semitone) - smooth voice leading
- **Yellow arrows**: Whole-step motion (±2 semitones) - medium smoothness
- **Orange arrows**: Small leap (3-4 semitones) - noticeable jump
- **Red arrows**: Large leap (5+ semitones) - dramatic motion

### Visual Design

- SVG curved arrows connecting note centers
- Arrow thickness: 2-3px (visible but not overwhelming)
- Slight curve for aesthetics and overlap management
- Arrow direction indicated by arrowhead
- Arrows appear with subtle animation (draw from top to bottom, 300ms)

### Educational Value

At a glance, you see:
- Mostly green/blue = excellent smooth voice leading
- Yellow/orange = acceptable but less smooth
- Red = needs work, voices jumping too much

---

## Section 4: Scoring System & Feedback

### Score Calculation (Phase 7 Algorithm)

Total score: 0-100 points across three components:

#### Voice Motion Score (0-50 points)

- Starts at 50, adjusted based on movement types
- Bonuses: Common tones (+2 each, max +6), half-steps (neutral/slight bonus)
- Penalties: Whole-steps (-2), small leaps (-5), large leaps (-10)
- Rewards smooth voice leading, penalizes dramatic jumps

#### Pattern Recognition Bonus (0-30 points)

- Detects recognized jazz voicings (Shell A/B, Rootless A/B, Drop-2, etc.)
- Exact pattern match: 30 points
- Fuzzy match: 18-28 points based on confidence
- No pattern detected: 0 points
- Displays pattern name: "You built Shell A!" or "Shell A (variation)"

#### Playability Score (0-20 points)

- Starts at 20, deducts for awkward voicings
- Checks: excessive stretches, uncomfortable intervals, hand position issues
- Major issues: -10 points, minor issues: -5 points, suggestions: -2 points

### Scoring Panel Display

**Before submit:**
- Simple note counter ("3 notes selected")
- Disabled Submit button if <2 notes

**After submit:**
- Large score number (color-coded: 80+ green, 60-79 blue, <60 red)
- Three component breakdowns with icons
- Brief explanation: "Smooth voice leading! Common tones held."
- If pattern detected: "Pattern: Shell A (+30)"
- Action buttons: "Next Chord" (primary) / "Try Again" (secondary)

---

## Section 5: Progression Flow & Completion

### Practice Session Flow

#### 1. Setup Phase

- User selects: Progression (II-V-I), Key (C major initially), Starting Style (Shell A initially), Starting Voicing (dropdown of specific Shell A voicings)
- Click "Start Practice"

#### 2. First Chord (Auto-filled)

- Selected preset voicing appears on first keyboard (locked immediately)
- Chord tone labels show below: [R] [♭3] [♭7] for Dm7 Shell A example
- User sees reference but didn't build it (it's their starting point)

#### 3. Building Subsequent Chords

- New empty keyboard appears below with header: "Build: G7"
- User clicks keys to build voicing
- Chord tone labels update in real-time below keyboard
- Submit button enables once 2+ notes selected
- On submit:
  - Audio plays full voicing
  - Voice leading arrows draw from previous keyboard
  - Scoring panel shows results
  - Keyboard locks
- User chooses: "Try Again" (clears current, rebuild) or "Next Chord" (advances)

#### 4. Progression Complete

- All chords built and locked, stacked vertically
- Completion panel shows:
  - Trophy icon
  - Average score (large number, color-coded)
  - Encouragement message based on score (80+: "Excellent!", 60-79: "Good work!", <60: "Keep practicing!")
  - Two buttons:
    - "Play Progression" - Plays through all chords sequentially on a single keyboard (highlights + audio)
    - "Practice Again" - Restarts with same settings
- Progress saved: Updates key/style unlock status if score threshold met

---

## Section 6: Unlock System & Progression

### Dual Unlock Tracks

#### Key Unlocks (Circle of Fifths)

- Start: C major unlocked
- After completing C major with 70+ average score:
  - Unlock F major and G major (one flat, one sharp)
- Continue around circle: Bb/D, Eb/A, Ab/E, etc.
- Visual indicator in key dropdown: 🔒 locked keys, ✓ completed keys, current key highlighted

#### Voicing Style Unlocks

- Start: Shell A unlocked (foundational voicing)
- After mastering Shell A in 3+ keys (70+ score):
  - Unlock Shell B (alternate inversion)
- After mastering both shells in 5+ keys:
  - Unlock Rootless A & B (common jazz approach)
- Continue: Drop-2, Spread voicings, etc.
- Visual indicator in style dropdown: 🔒 locked, ✓ completed, progress bars

#### Progression Unlocks (Future)

- Start: II-V-I only
- Later unlocks: I-VI-II-V (rhythm changes), II-V sequences, blues progressions, etc.
- Tied to mastery across multiple keys and styles

### Progress Persistence

- Saves to localStorage: `keyProgress.ts` from Phase 7
- Tracks: keys completed, styles mastered, scores achieved
- Can view progress summary (future feature)

### Unlock Feedback

- Toast notification when new content unlocks: "🎉 F Major unlocked!"
- Gentle encouragement without pressure

---

## Visual Design & Aesthetics

### Theme: Classic Jazz Club (Dark, Warm, Timeless)

**Vibe:** Late-night club, wood paneling, low light, whiskey. Serious, musical, slightly academic. Feels like liner notes.

### Color Palette

- **Charcoal Black** `#121212` - Main background
- **Panel Background** `#1A1A1A` - Setup/Scoring panels (slightly lighter)
- **Warm Brass/Gold** `#C9A24D` - Accents, active chords, highlights
- **Off-White** `#EAE7DC` - Primary text, white piano keys

### Typography

- **Primary (Headings, Chord Names):** Playfair Display (serif, elegant)
- **Secondary (UI, Labels, Body):** Inter or Source Sans 3 (sans-serif, readable)

### Component Styling

**Background & Structure:**
- App background: Charcoal Black #121212
- Panels (Setup, Scoring): #1A1A1A with subtle border and soft shadow
- No harsh edges, gentle rounded corners

**Piano Keyboard:**
- White keys: Off-white #EAE7DC (natural ivory feel)
- Black keys: Deep charcoal #0A0A0A
- Selected keys: Warm Brass #C9A24D glow/highlight
- Locked keys (previous chords): Brass at 40% opacity (muted gold)
- Hover state: Subtle brightness increase

**Typography Application:**
- Chord names ("Dm7", "G7"): Playfair Display, medium-large size, brass color
- Chord tone labels [♭3] [5] [7]: Inter/Source Sans 3, smaller, off-white
- Panel headings: Playfair Display, off-white
- Body text, buttons: Inter/Source Sans 3

**Voice Leading Arrows (Desaturated for warm low-light vibe):**
- Green (common tone): Muted sage #7A9D7E
- Blue (half-step): Cool jazz blue #5B8FA3
- Yellow (whole-step): Warm amber #D4A574
- Orange (small leap): Burnt orange #C4845F
- Red (large leap): Deep burgundy #8B4D4D

**Scoring Panel:**
- Score number: Large Playfair Display in brass (good scores), muted when poor
- Icons: Simple line-art style in off-white
- Buttons:
  - Primary: Brass background #C9A24D, charcoal text
  - Secondary: Outline style, brass border, off-white text

**Animations:**
- Subtle, smooth transitions (300ms ease-in-out)
- Arrow drawing animation from top to bottom
- No jarring or bouncy effects - keep it sophisticated

---

## Technical Implementation Notes

### Reuse from Phase 7

- `voiceLeadingAnalysis.ts` - Scoring algorithm (keep as-is)
- `keyProgress.ts` - Unlock system persistence (extend for style unlocks)
- `trainerState.ts` - State management (adapt for new flow)
- `starterVoicings.ts` - Preset voicings (use for first chord selection)

### Reuse from Loveable Prototype

- 3-column layout structure
- Scoring panel UI patterns
- Setup panel component organization
- Clean completion screen approach

### New Components Needed

- `InteractiveKeyboard` - Clickable piano with selection state
- `ChordToneLabels` - Display [3] [5] [7] labels below keyboard
- `VoiceLeadingArrows` - SVG arrows with color coding
- `KeyboardStack` - Container managing multiple keyboards vertically
- `ProgressionPlayback` - Single keyboard with sequential highlight/play
- `PresetVoicingSelector` - Dropdown with voicing previews

### Audio Integration

- Use existing Tone.js setup from `audio.ts`
- Individual note playback on key click
- Full voicing playback on submit
- Sequential progression playback on completion

---

## Success Metrics

- Users understand voice leading through visual arrows
- Unlock system motivates continued practice
- Scoring provides clear, actionable feedback
- Progression playback reinforces learning
- Interface feels intuitive (minimal confusion/errors)

---

## Future Enhancements (Out of Scope for MVP)

- Visual preset selector with mini keyboards
- Progress dashboard showing mastery across keys/styles
- Custom progression builder
- Leaderboards or social sharing
- More complex progressions (rhythm changes, turnarounds, etc.)
- Alternative voicing styles (quartal, cluster, etc.)
- MIDI input support for real piano practice

---

## Next Steps

1. **Finalize visual design** - Color palette, typography, component styling
2. **Create implementation plan** - Break design into tasks with file changes
3. **Set up isolated workspace** - Use git worktree for clean development
4. **Implement iteratively** - Build components, integrate, test, refine
5. **Manual testing** - Verify UX, audio, scoring, unlocks work as designed
6. **Merge to main** - Deploy redesigned trainer

---

**Document Status:** Complete functional design, pending visual design decisions
