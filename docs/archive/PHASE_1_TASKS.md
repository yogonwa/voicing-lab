# Phase 1: Text-Based Algorithm Proof of Concept

## Goal
Build the voicing algorithm and display voicings as text output.

## Tasks
1. Create `src/lib/chordCalculator.ts` - implements note transposition and chord tone calculation
2. Create `src/lib/voicingTemplates.ts` - defines 3 hardcoded voicing templates
3. Create `src/lib/voicingGenerator.ts` - applies templates to chords
4. Create `src/components/VoicingDisplay.tsx` - displays voicings as formatted text
5. Create basic UI with buttons to switch between 3 variations

## Success Criteria
- Can display Dm7-G7-Cmaj7 in 3 voicing styles
- Notes are correct for each chord
- Output is readable and formatted

## No audio, no visualization yet - just text output.
```

---

## 4. Start with Cursor
**Prompt Cursor:**
```
I'm building a jazz piano voicing tool. Read docs/MVP_SPEC.md for full context.

I want to start with Phase 1. Read docs/PHASE_1_TASKS.md.

Let's build the chord calculator first. Create src/lib/chordCalculator.ts that:
- Has a CHROMATIC_SCALE constant
- Has CHORD_FORMULAS for maj7, min7, dom7
- Implements calculateNote(root, semitones) function
- Implements getChordTones(chord) function

Use TypeScript with proper types. No external libraries - build from scratch.