/**
 * ChordExplorer Component
 * 
 * Interactive chord explorer for learning extensions.
 * Select root + quality, toggle extensions, see/hear the result.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import './ChordExplorer.css';
import {
  NoteName,
  ChordQuality,
  Chord,
  CHROMATIC_SCALE,
  getExtendedChordTones,
  ExtendedChordTones,
  initAudio,
  isAudioReady,
  playVoicing,
  playArpeggio,
  VoicedChord,
  SelectedExtensions,
  ExtensionKey,
  createEmptyExtensions,
  buildChordSymbol,
  getActiveExtensionKeys,
  EXTENSION_TIPS,
  Note,
} from '../../lib';
import { PianoKeyboard } from '../PianoKeyboard';
import { ExtensionPanel } from './ExtensionPanel';
import { NoteBlocks } from './NoteBlocks';
import { PlaygroundPanel } from './PlaygroundPanel';
import {
  PlaygroundBlock,
  buildPlaygroundBlocks,
  mergePlaygroundBlocks,
  getEnabledBlocks,
  getOctaveForPosition,
  getMidiValue,
} from './playgroundUtils';

// ============================================
// TYPES
// ============================================

interface ActiveNoteForKeyboard {
  note: string;
  role: string;
  hand: 'left' | 'right';
}

// ============================================
// CONSTANTS
// ============================================

const QUALITIES: { value: ChordQuality; label: string }[] = [
  { value: 'maj7', label: 'Major 7' },
  { value: 'min7', label: 'Minor 7' },
  { value: 'dom7', label: 'Dominant 7' },
  { value: 'min7b5', label: 'Half-Dim' },
  { value: 'dim7', label: 'Dim 7' },
];

const MIN_ENABLED_BLOCKS = 2;

// ============================================
// HELPERS
// ============================================

/**
 * Convert chord tones to keyboard-compatible active notes.
 * Root is in lower octave, other tones above.
 * No hand differentiation for chord explorer.
 */
function getActiveNotesForKeyboard(
  chordTones: ExtendedChordTones,
  selectedExtensions: SelectedExtensions
): ActiveNoteForKeyboard[] {
  const notes: ActiveNoteForKeyboard[] = [];
  const rootOctave = 3;     // Root in lower octave
  const chordOctave = 4;    // Other chord tones
  const extOctave = 5;      // Extensions above

  // Root in lower octave (leftmost on keyboard)
  notes.push({ note: `${chordTones.root}${rootOctave}`, role: 'root', hand: 'right' });
  
  // Other chord tones
  notes.push({ note: `${chordTones.third}${chordOctave}`, role: 'third', hand: 'right' });
  notes.push({ note: `${chordTones.fifth}${chordOctave}`, role: 'fifth', hand: 'right' });
  notes.push({ note: `${chordTones.seventh}${chordOctave}`, role: 'seventh', hand: 'right' });

  // Extensions
  if (selectedExtensions.ninth && chordTones.extensions?.ninth) {
    notes.push({ note: `${chordTones.extensions.ninth}${extOctave}`, role: 'ninth', hand: 'right' });
  }
  if (selectedExtensions.flatNinth && chordTones.alterations?.flatNinth) {
    notes.push({ note: `${chordTones.alterations.flatNinth}${extOctave}`, role: 'flatNinth', hand: 'right' });
  }
  if (selectedExtensions.sharpNinth && chordTones.alterations?.sharpNinth) {
    notes.push({ note: `${chordTones.alterations.sharpNinth}${extOctave}`, role: 'sharpNinth', hand: 'right' });
  }
  if (selectedExtensions.eleventh && chordTones.extensions?.eleventh) {
    notes.push({ note: `${chordTones.extensions.eleventh}${extOctave}`, role: 'eleventh', hand: 'right' });
  }
  // #11 is in extensions (available for all chord types)
  if (selectedExtensions.sharpEleventh && chordTones.extensions?.sharpEleventh) {
    notes.push({ note: `${chordTones.extensions.sharpEleventh}${extOctave}`, role: 'sharpEleventh', hand: 'right' });
  }
  if (selectedExtensions.thirteenth && chordTones.extensions?.thirteenth) {
    notes.push({ note: `${chordTones.extensions.thirteenth}${extOctave}`, role: 'thirteenth', hand: 'right' });
  }
  if (selectedExtensions.flatThirteenth && chordTones.alterations?.flatThirteenth) {
    notes.push({ note: `${chordTones.alterations.flatThirteenth}${extOctave}`, role: 'flatThirteenth', hand: 'right' });
  }

  return notes;
}

/**
 * Build voicing for audio playback
 */
function buildBlockChordVoicing(
  chordTones: ExtendedChordTones,
  selectedExtensions: SelectedExtensions
): VoicedChord {
  const rootOctave = 3;
  const chordOctave = 4;
  const extOctave = 5;

  // Root in left hand (lower octave)
  const leftHand = [`${chordTones.root}${rootOctave}`] as VoicedChord['leftHand'];
  
  // Right hand: chord tones + extensions
  const rightHand: string[] = [
    `${chordTones.third}${chordOctave}`,
    `${chordTones.fifth}${chordOctave}`,
    `${chordTones.seventh}${chordOctave}`,
  ];

  // Extensions
  if (selectedExtensions.ninth && chordTones.extensions?.ninth) {
    rightHand.push(`${chordTones.extensions.ninth}${extOctave}`);
  }
  if (selectedExtensions.flatNinth && chordTones.alterations?.flatNinth) {
    rightHand.push(`${chordTones.alterations.flatNinth}${extOctave}`);
  }
  if (selectedExtensions.sharpNinth && chordTones.alterations?.sharpNinth) {
    rightHand.push(`${chordTones.alterations.sharpNinth}${extOctave}`);
  }
  if (selectedExtensions.eleventh && chordTones.extensions?.eleventh) {
    rightHand.push(`${chordTones.extensions.eleventh}${extOctave}`);
  }
  // #11 is in extensions (available for all chord types)
  if (selectedExtensions.sharpEleventh && chordTones.extensions?.sharpEleventh) {
    rightHand.push(`${chordTones.extensions.sharpEleventh}${extOctave}`);
  }
  if (selectedExtensions.thirteenth && chordTones.extensions?.thirteenth) {
    rightHand.push(`${chordTones.extensions.thirteenth}${extOctave}`);
  }
  if (selectedExtensions.flatThirteenth && chordTones.alterations?.flatThirteenth) {
    rightHand.push(`${chordTones.alterations.flatThirteenth}${extOctave}`);
  }

  return {
    leftHand,
    rightHand: rightHand as VoicedChord['rightHand'],
  };
}

function getOctaveFromNoteString(note: string): number {
  const match = note.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : 4;
}

/**
 * Convert a sequence of notes into a VoicedChord shape for playback.
 * First note drives the left hand, remaining notes go to the right hand.
 */
function buildPlaygroundVoicing(notes: string[]): VoicedChord {
  const typedNotes = notes as unknown as Note[];
  const leftHand = typedNotes.slice(0, 1) as VoicedChord['leftHand'];
  const rightHand = typedNotes.slice(1) as VoicedChord['rightHand'];

  return {
    leftHand,
    rightHand,
  };
}

// ============================================
// MAIN COMPONENT
// ============================================

type ExplorerMode = 'template' | 'playground';

export function ChordExplorer() {
  // Chord selection state
  const [selectedRoot, setSelectedRoot] = useState<NoteName>('C');
  const [selectedQuality, setSelectedQuality] = useState<ChordQuality>('maj7');
  const [selectedExtensions, setSelectedExtensions] = useState<SelectedExtensions>(createEmptyExtensions());
  const [mode, setMode] = useState<ExplorerMode>('template');
  const [playgroundBlocks, setPlaygroundBlocks] = useState<PlaygroundBlock[]>([]);
  const [playgroundWarning, setPlaygroundWarning] = useState<string | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);

  // Audio state
  const [audioReady, setAudioReady] = useState(isAudioReady());
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Arpeggio mode
  const [arpeggioMode, setArpeggioMode] = useState(false);
  const [highlightedNoteIndex, setHighlightedNoteIndex] = useState<number | null>(null);

  // Calculate chord tones
  const chord: Chord = useMemo(() => ({
    root: selectedRoot,
    quality: selectedQuality,
  }), [selectedRoot, selectedQuality]);

  const extendedChordTones = useMemo(() => 
    getExtendedChordTones(chord),
    [chord]
  );

  const basePlaygroundBlocks = useMemo(
    () => buildPlaygroundBlocks(extendedChordTones, selectedExtensions),
    [extendedChordTones, selectedExtensions]
  );

  useEffect(() => {
    setPlaygroundBlocks((prev) => mergePlaygroundBlocks(prev, basePlaygroundBlocks));
  }, [basePlaygroundBlocks]);

  const enabledPlaygroundBlocks = useMemo(
    () => getEnabledBlocks(playgroundBlocks),
    [playgroundBlocks]
  );

  // Build chord symbol
  const chordSymbol = useMemo(() => 
    buildChordSymbol(selectedRoot, selectedQuality, selectedExtensions),
    [selectedRoot, selectedQuality, selectedExtensions]
  );

  // Build active notes for keyboard
  const templateActiveNotes = useMemo(() => 
    getActiveNotesForKeyboard(extendedChordTones, selectedExtensions),
    [extendedChordTones, selectedExtensions]
  );

  const playgroundActiveNotes = useMemo(() => {
    const total = enabledPlaygroundBlocks.length;
    if (total === 0) return [];

    let lastMidi = -Infinity;

    return enabledPlaygroundBlocks.map((block, index) => {
      let octave = getOctaveForPosition(index, total);
      let midi = getMidiValue(block.note, octave);

      while (midi <= lastMidi) {
        octave += 1;
        midi = getMidiValue(block.note, octave);
      }

      lastMidi = midi;

      return {
        note: `${block.note}${octave}`,
        role: block.voicingRole,
        hand: index === 0 ? 'left' : 'right',
      };
    }) as ActiveNoteForKeyboard[];
  }, [enabledPlaygroundBlocks]);

  const baseActiveNotes = useMemo(() => (
    mode === 'playground' ? playgroundActiveNotes : templateActiveNotes
  ), [mode, playgroundActiveNotes, templateActiveNotes]);

  // Only show keys after playback has occurred; during playback, show the currently sounding notes
  const activeNotes = useMemo(() => {
    if (!isPlaying && !hasPlayed) {
      return [];
    }

    if (isPlaying && arpeggioMode && highlightedNoteIndex !== null) {
      return baseActiveNotes.slice(0, highlightedNoteIndex + 1);
    }

    return baseActiveNotes;
  }, [baseActiveNotes, isPlaying, hasPlayed, arpeggioMode, highlightedNoteIndex]);

  useEffect(() => {
    setHasPlayed(false);
  }, [selectedRoot, selectedQuality, selectedExtensions, mode, playgroundBlocks]);

  // Get active tips
  const activeTips = useMemo(() => {
    const activeKeys = getActiveExtensionKeys(selectedExtensions);
    return activeKeys.map(key => ({
      key,
      tip: EXTENSION_TIPS[key],
    }));
  }, [selectedExtensions]);

  /**
   * Switch modes between Template and Playground
   */
  const handleModeChange = useCallback((nextMode: ExplorerMode) => {
    setMode(nextMode);
  }, []);
  const handlePlaygroundReorder = useCallback((nextBlocks: PlaygroundBlock[]) => {
    setPlaygroundBlocks(nextBlocks);
  }, []);
  const handlePlaygroundToggle = useCallback((blockId: string) => {
    setPlaygroundBlocks((prev) => {
      const index = prev.findIndex((block) => block.id === blockId);
      if (index === -1) return prev;

      const enabledCount = prev.filter((block) => block.enabled).length;
      const target = prev[index];

      if (target.enabled && enabledCount <= MIN_ENABLED_BLOCKS) {
        setPlaygroundWarning('At least 2 notes required');
        return prev;
      }

      setPlaygroundWarning(null);

      const next = [...prev];
      next[index] = {
        ...target,
        enabled: !target.enabled,
      };
      return next;
    });
  }, []);

  /**
   * Handle root change - reset extensions
   */
  const handleRootChange = useCallback((newRoot: NoteName) => {
    setSelectedRoot(newRoot);
    setSelectedExtensions(createEmptyExtensions());
  }, []);

  /**
   * Handle quality change - reset extensions
   */
  const handleQualityChange = useCallback((newQuality: ChordQuality) => {
    setSelectedQuality(newQuality);
    setSelectedExtensions(createEmptyExtensions());
  }, []);

  /**
   * Toggle extension
   */
  const handleExtensionToggle = useCallback((key: ExtensionKey) => {
    setSelectedExtensions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

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
   * Get ordered notes for playback (root first, then chord tones, then extensions)
   */
  const getOrderedNotes = useCallback((): string[] => {
    if (mode === 'playground') {
      const total = enabledPlaygroundBlocks.length;
      return enabledPlaygroundBlocks.map((block, index) => 
        `${block.note}${getOctaveForPosition(index, total)}`
      );
    }

    const rootOctave = 3;
    const chordOctave = 4;
    const extOctave = 5;

    const notes: string[] = [
      `${extendedChordTones.root}${rootOctave}`,
      `${extendedChordTones.third}${chordOctave}`,
      `${extendedChordTones.fifth}${chordOctave}`,
      `${extendedChordTones.seventh}${chordOctave}`,
    ];

    // Add selected extensions in order
    if (selectedExtensions.ninth && extendedChordTones.extensions?.ninth) {
      notes.push(`${extendedChordTones.extensions.ninth}${extOctave}`);
    }
    if (selectedExtensions.flatNinth && extendedChordTones.alterations?.flatNinth) {
      notes.push(`${extendedChordTones.alterations.flatNinth}${extOctave}`);
    }
    if (selectedExtensions.sharpNinth && extendedChordTones.alterations?.sharpNinth) {
      notes.push(`${extendedChordTones.alterations.sharpNinth}${extOctave}`);
    }
    if (selectedExtensions.eleventh && extendedChordTones.extensions?.eleventh) {
      notes.push(`${extendedChordTones.extensions.eleventh}${extOctave}`);
    }
    if (selectedExtensions.sharpEleventh && extendedChordTones.extensions?.sharpEleventh) {
      notes.push(`${extendedChordTones.extensions.sharpEleventh}${extOctave}`);
    }
    if (selectedExtensions.thirteenth && extendedChordTones.extensions?.thirteenth) {
      notes.push(`${extendedChordTones.extensions.thirteenth}${extOctave}`);
    }
    if (selectedExtensions.flatThirteenth && extendedChordTones.alterations?.flatThirteenth) {
      notes.push(`${extendedChordTones.alterations.flatThirteenth}${extOctave}`);
    }

    return notes;
  }, [mode, enabledPlaygroundBlocks, extendedChordTones, selectedExtensions]);

  /**
   * Play the chord (block or arpeggio based on mode)
   */
  const handlePlay = useCallback(async () => {
    const ready = await ensureAudioReady();
    if (!ready) return;

    setIsPlaying(true);
    setHasPlayed(true);
    setHighlightedNoteIndex(null);

    const orderedNotes = getOrderedNotes();

    if (arpeggioMode) {
      // Play as arpeggio with visual sync
      await playArpeggio(orderedNotes, 150, '4n', (noteIndex) => {
        setHighlightedNoteIndex(noteIndex);
      });
      setHighlightedNoteIndex(null);
    } else {
      // Play as block chord
      const voicing = mode === 'playground'
        ? buildPlaygroundVoicing(orderedNotes)
        : buildBlockChordVoicing(extendedChordTones, selectedExtensions);
      playVoicing(voicing);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setIsPlaying(false);
  }, [ensureAudioReady, arpeggioMode, getOrderedNotes, extendedChordTones, selectedExtensions, mode]);

  return (
    <div className="chord-explorer">
      {/* Controls Section */}
      <section className="explorer-controls">
        <h3 className="section-title">Chord Explorer</h3>
        
        <div className="chord-selectors">
          <div className="selector-group">
            <label htmlFor="root-select">Root</label>
            <select
              id="root-select"
              value={selectedRoot}
              onChange={(e) => handleRootChange(e.target.value as NoteName)}
            >
              {CHROMATIC_SCALE.map((note) => (
                <option key={note} value={note}>{note}</option>
              ))}
            </select>
          </div>

          <div className="selector-group">
            <label htmlFor="quality-select">Quality</label>
            <select
              id="quality-select"
              value={selectedQuality}
              onChange={(e) => handleQualityChange(e.target.value as ChordQuality)}
            >
              {QUALITIES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mode-toggle">
          <span className="mode-toggle__label">Mode</span>
          <div className="mode-toggle__buttons" role="group" aria-label="Explorer mode toggle">
            <button
              type="button"
              className={`mode-toggle__button ${mode === 'template' ? 'is-active' : ''}`}
              onClick={() => handleModeChange('template')}
            >
              <span role="img" aria-hidden="true">📋</span> Template
            </button>
            <button
              type="button"
              className={`mode-toggle__button ${mode === 'playground' ? 'is-active' : ''}`}
              onClick={() => handleModeChange('playground')}
            >
              <span role="img" aria-hidden="true">🧩</span> Playground
            </button>
          </div>
        </div>

        {mode === 'template' ? (
          <ExtensionPanel
            quality={selectedQuality}
            root={selectedRoot}
            selected={selectedExtensions}
            onToggle={handleExtensionToggle}
          />
        ) : (
          <div className="playground-callout">
            <p>
              Playground Mode lets you drag note blocks to experiment with voicing order. Reordering is
              live for audio + keyboard, so play the chord or arpeggio to hear every variation instantly.
            </p>
          </div>
        )}
      </section>

      {/* Display Section */}
      <section className="explorer-display">
        <header className="display-header">
          <h2 className="chord-symbol">{chordSymbol}</h2>
          <div className="playback-controls">
            <button
              className={`arpeggio-toggle ${arpeggioMode ? 'active' : ''}`}
              onClick={() => setArpeggioMode(!arpeggioMode)}
              aria-label={arpeggioMode ? 'Switch to block chord' : 'Switch to arpeggio'}
              title={arpeggioMode ? 'Arpeggio mode (notes roll up)' : 'Block mode (all notes together)'}
            >
              {arpeggioMode ? '🎵 Roll' : '🎹 Block'}
            </button>
            <button
              className={`play-button ${isPlaying ? 'playing' : ''}`}
              onClick={handlePlay}
              disabled={loading || isPlaying}
              aria-label={`Play ${chordSymbol}`}
            >
              {loading ? '...' : isPlaying ? '♪' : '▶ Play'}
            </button>
          </div>
        </header>

        {mode === 'template' ? (
          <NoteBlocks
            chordTones={extendedChordTones}
            selectedExtensions={selectedExtensions}
          />
        ) : (
          <PlaygroundPanel
            blocks={playgroundBlocks}
            onReorder={handlePlaygroundReorder}
            onToggle={handlePlaygroundToggle}
            warningMessage={playgroundWarning}
          />
        )}

        <div className="keyboard-container">
          <PianoKeyboard
            activeNotes={activeNotes as any}
            startOctave={3}
            endOctave={6}
          />
        </div>

        {activeTips.length > 0 && (
          <div className="tips-section">
            {activeTips.map(({ key, tip }) => (
              <p key={key} className="tip">
                💡 <strong>{key}:</strong> {tip}
              </p>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ChordExplorer;
