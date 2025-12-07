/**
 * ChordToneDisplay Component
 *
 * Interactive chord calculator test harness.
 * - Shows validation for ii-V-I progression
 * - Allows testing any root × quality combination
 */

import React, { useState, useMemo, useCallback } from 'react';
import './ChordToneDisplay.css';
import {
  getChordTones,
  Chord,
  ChordTones,
  NoteName,
  ChordQuality,
  CHROMATIC_SCALE,
  initAudio,
  isAudioReady,
  playVoicing,
  VoicedChord,
} from '../lib';

// ============================================
// TYPES
// ============================================

interface ChordDefinition {
  name: string;
  chord: Chord;
  expected: ChordTones;
}

// ============================================
// CONSTANTS
// ============================================

// Available qualities for testing
const QUALITIES: { value: ChordQuality; label: string }[] = [
  { value: 'maj7', label: 'Major 7' },
  { value: 'min7', label: 'Minor 7' },
  { value: 'dom7', label: 'Dominant 7' },
  { value: 'min7b5', label: 'Half-Dim' },
  { value: 'dim7', label: 'Dim 7' },
];

// ii-V-I progression with expected outputs for validation
const CHORDS_TO_TEST: ChordDefinition[] = [
  {
    name: 'Dm7',
    chord: { root: 'D', quality: 'min7' },
    expected: { root: 'D', third: 'F', fifth: 'A', seventh: 'C' },
  },
  {
    name: 'G7',
    chord: { root: 'G', quality: 'dom7' },
    expected: { root: 'G', third: 'B', fifth: 'D', seventh: 'F' },
  },
  {
    name: 'Cmaj7',
    chord: { root: 'C', quality: 'maj7' },
    expected: { root: 'C', third: 'E', fifth: 'G', seventh: 'B' },
  },
];

// ============================================
// HELPERS
// ============================================

function tonesMatch(calculated: ChordTones, expected: ChordTones): boolean {
  return (
    calculated.root === expected.root &&
    calculated.third === expected.third &&
    calculated.fifth === expected.fifth &&
    calculated.seventh === expected.seventh
  );
}

function getChordName(root: NoteName, quality: ChordQuality): string {
  const qualityLabels: Record<ChordQuality, string> = {
    maj7: 'maj7',
    min7: 'm7',
    dom7: '7',
    min7b5: 'm7♭5',
    dim7: '°7',
  };
  return `${root}${qualityLabels[quality]}`;
}

function getQualityFullName(quality: ChordQuality): string {
  const names: Record<ChordQuality, string> = {
    maj7: 'Major 7',
    min7: 'Minor 7',
    dom7: 'Dominant 7',
    min7b5: 'Half-Diminished',
    dim7: 'Diminished 7',
  };
  return names[quality];
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface ChordToneRowProps {
  name: string;
  chord: Chord;
  expected: ChordTones;
}

function ChordToneRow({ name, chord, expected }: ChordToneRowProps) {
  const calculated = getChordTones(chord);
  const isCorrect = tonesMatch(calculated, expected);

  return (
    <div className={`chord-tone-row ${isCorrect ? 'valid' : 'invalid'}`}>
      <span className="chord-label">{name}</span>
      <span className="chord-formula">({chord.quality})</span>
      <span className="tone-list">
        <span className="tone root">{calculated.root}</span>
        <span className="tone third">{calculated.third}</span>
        <span className="tone fifth">{calculated.fifth}</span>
        <span className="tone seventh">{calculated.seventh}</span>
      </span>
      <span className="validation-icon">{isCorrect ? '✓' : '✗'}</span>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ChordToneDisplay() {
  const [selectedRoot, setSelectedRoot] = useState<NoteName>('C');
  const [selectedQuality, setSelectedQuality] = useState<ChordQuality>('maj7');
  const [audioReady, setAudioReady] = useState(isAudioReady());
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Calculate tones for selected chord (reactive)
  const calculatedChord = useMemo(() => {
    const chord: Chord = { root: selectedRoot, quality: selectedQuality };
    const tones = getChordTones(chord);
    return {
      chord,
      tones,
      name: getChordName(selectedRoot, selectedQuality),
      qualityName: getQualityFullName(selectedQuality),
    };
  }, [selectedRoot, selectedQuality]);

  // Validate ii-V-I progression
  const allValid = CHORDS_TO_TEST.every(({ chord, expected }) =>
    tonesMatch(getChordTones(chord), expected)
  );

  /**
   * Ensure audio is initialized
   */
  const ensureAudioReady = useCallback(async () => {
    if (audioReady) return true;
    if (loading) return false;

    setLoading(true);
    try {
      await initAudio();
      setAudioReady(true);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      setLoading(false);
      return false;
    }
  }, [audioReady, loading]);

  /**
   * Play the calculated chord
   * Creates a simple close-position voicing in octave 3
   */
  const handlePlayChord = useCallback(async () => {
    const ready = await ensureAudioReady();
    if (!ready) return;

    // Create a simple voicing: root in LH, upper tones in RH
    const { root, third, fifth, seventh } = calculatedChord.tones;
    const voicing: VoicedChord = {
      leftHand: [`${root}3`],
      rightHand: [`${third}3`, `${fifth}3`, `${seventh}3`],
    };

    setIsPlaying(true);
    playVoicing(voicing);

    // Clear playing state after duration
    setTimeout(() => {
      setIsPlaying(false);
    }, 1500);
  }, [ensureAudioReady, calculatedChord.tones]);

  return (
    <div className="chord-tone-display">
      {/* Interactive Calculator */}
      <section className="calculator-section">
        <header className="section-header">
          <h3>Chord Calculator</h3>
        </header>

        <div className="calculator-controls">
          <div className="control-group">
            <label htmlFor="root-select">Root</label>
            <select
              id="root-select"
              value={selectedRoot}
              onChange={(e) => setSelectedRoot(e.target.value as NoteName)}
            >
              {CHROMATIC_SCALE.map((note) => (
                <option key={note} value={note}>
                  {note}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="quality-select">Quality</label>
            <select
              id="quality-select"
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value as ChordQuality)}
            >
              {QUALITIES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={`calculator-result ${isPlaying ? 'playing' : ''}`}>
          <div className="result-chord-name">{calculatedChord.name}</div>
          <div className="result-quality-name">{calculatedChord.qualityName}</div>
          <div className="result-tones">
            <div className="result-tone">
              <span className="tone-label">R</span>
              <span className="tone-value root">{calculatedChord.tones.root}</span>
            </div>
            <div className="result-tone">
              <span className="tone-label">3</span>
              <span className="tone-value third">{calculatedChord.tones.third}</span>
            </div>
            <div className="result-tone">
              <span className="tone-label">5</span>
              <span className="tone-value fifth">{calculatedChord.tones.fifth}</span>
            </div>
            <div className="result-tone">
              <span className="tone-label">7</span>
              <span className="tone-value seventh">{calculatedChord.tones.seventh}</span>
            </div>
          </div>
          <button
            className="play-calculator-button"
            onClick={handlePlayChord}
            disabled={loading || isPlaying}
            aria-label={`Play ${calculatedChord.name}`}
          >
            {loading ? '...' : isPlaying ? '♪' : '▶'}
          </button>
        </div>
      </section>

      {/* Validation Section */}
      <section className="validation-section">
        <header className="section-header">
          <h3>ii-V-I Validation</h3>
          <span className={`status-badge ${allValid ? 'valid' : 'invalid'}`}>
            {allValid ? '✓' : '✗'}
          </span>
        </header>

        <div className="chord-tone-list">
          {CHORDS_TO_TEST.map(({ name, chord, expected }) => (
            <ChordToneRow
              key={name}
              name={name}
              chord={chord}
              expected={expected}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ChordToneDisplay;
