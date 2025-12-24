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
  VoicedChord,
  SelectedExtensions,
  ExtensionKey,
  createEmptyExtensions,
  buildChordSymbol,
  getDisplayChordSymbol,
  getActiveExtensionKeys,
  EXTENSION_TIPS,
  DEFAULT_EXTENSION_RENDER_ORDER,
  getNoteNameForExtensionKey,
  getVoicingRoleForExtensionKey,
  Note,
  VoicingRole,
} from '../../lib/core';
import {
  initAudio,
  isAudioReady,
  playVoicing,
  playArpeggio,
} from '../../lib/audio';
import { PianoKeyboard, type ActiveNote } from '../PianoKeyboard';
import { ExtensionPanel } from './ExtensionPanel';
import { NoteBlocks } from './NoteBlocks';
import { PlaygroundPanel } from './PlaygroundPanel';
import {
  PlaygroundBlock,
  VoicePresetHint,
  ExtensionVariantKey,
  EXTENSION_STATE_CYCLES,
  buildPlaygroundBlocks,
  mergePlaygroundBlocks,
  getEnabledBlocks,
  getNextVariantKey,
  updateBlockVariant,
  voicePlaygroundBlocks,
  getRootWarning,
} from './playgroundUtils';

// ============================================
// TYPES
// ============================================

type ActiveNoteForKeyboard = ActiveNote;

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
const TEMPLATE_ROOT_OCTAVE = 4;
const TEMPLATE_EXTENSION_OCTAVE = 5;

interface PlaygroundPreset {
  id: string;
  name: string;
  description: string;
  order: string[];
  disabled?: string[];
  voiceHint?: VoicePresetHint;
  extensions?: Record<string, ExtensionVariantKey>; // Extension states to apply
}

const PLAYGROUND_PRESETS: PlaygroundPreset[] = [
  {
    id: 'shell-a',
    name: 'Shell A',
    description: '1-3-7 guides',
    order: ['root', 'third', 'seventh'],
    disabled: ['fifth'],
    voiceHint: 'compact',
  },
  {
    id: 'shell-b',
    name: 'Shell B',
    description: '1-7-3 inversion',
    order: ['root', 'seventh', 'third'],
    disabled: ['fifth'],
    voiceHint: 'compact',
  },
  {
    id: 'open',
    name: 'Open',
    description: '1-5-3-7 spread',
    order: ['root', 'fifth', 'third', 'seventh'],
    voiceHint: 'spread',
  },
  {
    id: 'rootless-a',
    name: 'Rootless A',
    description: '3-5-7-9',
    order: ['third', 'fifth', 'seventh', 'ninth'],
    disabled: ['root'],
    voiceHint: 'compact',
    extensions: { ninth: 'natural' }, // Rootless requires 9th
  },
  {
    id: 'rootless-b',
    name: 'Rootless B',
    description: '7-9-3-5',
    order: ['seventh', 'ninth', 'third', 'fifth'],
    disabled: ['root'],
    voiceHint: 'compact',
    extensions: { ninth: 'natural' }, // Rootless requires 9th
  },
  {
    id: 'drop-2',
    name: 'Drop 2',
    description: 'Drop-second voice',
    order: ['root', 'fifth', 'third', 'seventh'],
    voiceHint: 'spread',
  },
  {
    id: 'shell-a-9',
    name: 'Shell A+9',
    description: '1-3-7-9 with ninth',
    order: ['root', 'third', 'seventh', 'ninth'],
    disabled: ['fifth'],
    voiceHint: 'compact',
    extensions: { ninth: 'natural' },
  },
  {
    id: 'shell-altered',
    name: 'Shell Altered',
    description: '1-3-7-♭9-♯11 for V7',
    order: ['root', 'third', 'seventh'],
    disabled: ['fifth'],
    voiceHint: 'compact',
    extensions: { 
      ninth: 'flat',
      eleventh: 'sharp',
    },
  },
];

// ============================================
// HELPERS
// ============================================

/**
 * Convert chord tones to keyboard-compatible active notes.
 * Root is in lower octave, other tones above.
 * No hand differentiation for chord explorer.
 */
type TemplateNote = {
  note: Note;
  role: VoicingRole;
};

function buildTemplateNoteSequence(
  chordTones: ExtendedChordTones,
  selectedExtensions: SelectedExtensions
): TemplateNote[] {
  const sequence: TemplateNote[] = [
    { note: `${chordTones.root}${TEMPLATE_ROOT_OCTAVE}` as Note, role: 'root' },
    { note: `${chordTones.third}${TEMPLATE_ROOT_OCTAVE}` as Note, role: 'third' },
    { note: `${chordTones.fifth}${TEMPLATE_ROOT_OCTAVE}` as Note, role: 'fifth' },
    { note: `${chordTones.seventh}${TEMPLATE_ROOT_OCTAVE}` as Note, role: 'seventh' },
  ];

  DEFAULT_EXTENSION_RENDER_ORDER.forEach((key) => {
    if (!selectedExtensions[key]) return;

    const noteName = getNoteNameForExtensionKey(chordTones, key);
    const role = getVoicingRoleForExtensionKey(key);

    if (noteName) {
      sequence.push({
        note: `${noteName}${TEMPLATE_EXTENSION_OCTAVE}` as Note,
        role,
      });
    }
  });

  return sequence;
}

function getActiveNotesForKeyboard(
  chordTones: ExtendedChordTones,
  selectedExtensions: SelectedExtensions
): ActiveNoteForKeyboard[] {
  const sequence = buildTemplateNoteSequence(chordTones, selectedExtensions);
  return sequence.map((entry, index) => ({
    note: entry.note,
    role: entry.role,
    hand: index === 0 ? 'left' : 'right',
  }));
}

/**
 * Build voicing for audio playback
 */
function buildBlockChordVoicing(
  chordTones: ExtendedChordTones,
  selectedExtensions: SelectedExtensions
): VoicedChord {
  const sequence = buildTemplateNoteSequence(chordTones, selectedExtensions);
  const leftHand = sequence.slice(0, 1).map((entry) => entry.note);
  const rightHand = sequence.slice(1).map((entry) => entry.note);

  return {
    leftHand: leftHand as VoicedChord['leftHand'],
    rightHand: rightHand as VoicedChord['rightHand'],
  };
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
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

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
    setActivePresetId(null);
    setPlaygroundWarning(null);
  }, [basePlaygroundBlocks]);

  const enabledPlaygroundBlocks = useMemo(
    () => getEnabledBlocks(playgroundBlocks),
    [playgroundBlocks]
  );

  // Split blocks into chord tones and extensions
  const { chordToneBlocks, extensionBlocks } = useMemo(() => {
    const chord = playgroundBlocks.filter(b => !b.isExtension);
    const ext = playgroundBlocks.filter(b => b.isExtension);
    return { chordToneBlocks: chord, extensionBlocks: ext };
  }, [playgroundBlocks]);

  const activePresetHint = useMemo<VoicePresetHint | undefined>(() => {
    if (!activePresetId) return undefined;
    return PLAYGROUND_PRESETS.find((preset) => preset.id === activePresetId)?.voiceHint;
  }, [activePresetId]);

  // Build chord symbol with enharmonic display (Bb instead of A#)
  const chordSymbol = useMemo(() => 
    getDisplayChordSymbol(selectedRoot, selectedQuality, selectedExtensions),
    [selectedRoot, selectedQuality, selectedExtensions]
  );

  // Build active notes for keyboard
  const templateActiveNotes = useMemo(() => 
    getActiveNotesForKeyboard(extendedChordTones, selectedExtensions),
    [extendedChordTones, selectedExtensions]
  );

  const voicedPlaygroundNotes = useMemo(
    () => voicePlaygroundBlocks(playgroundBlocks, { presetHint: activePresetHint }),
    [playgroundBlocks, activePresetHint]
  );

  const playgroundActiveNotes = useMemo(() => {
    if (voicedPlaygroundNotes.length === 0) return [];

    return voicedPlaygroundNotes.map((note, index) => {
      const block = enabledPlaygroundBlocks[index];
      return {
        note,
        role: block?.voicingRole ?? 'root',
        hand: index === 0 ? 'left' : 'right',
      };
    }) as ActiveNoteForKeyboard[];
  }, [enabledPlaygroundBlocks, voicedPlaygroundNotes]);

  const baseActiveNotes = useMemo(() => (
    mode === 'playground' ? playgroundActiveNotes : templateActiveNotes
  ), [mode, playgroundActiveNotes, templateActiveNotes]);

  // Only show keys after playback has occurred; during playback, show the currently sounding notes
  const activeNotes = useMemo(() => {
    if (isPlaying && arpeggioMode && highlightedNoteIndex !== null) {
      return baseActiveNotes.slice(0, highlightedNoteIndex + 1);
    }
    return baseActiveNotes;
  }, [baseActiveNotes, isPlaying, arpeggioMode, highlightedNoteIndex]);

  // Get active tips
  const activeTips = useMemo(() => {
    const activeKeys = getActiveExtensionKeys(selectedExtensions);
    return activeKeys.map(key => ({
      key,
      tip: EXTENSION_TIPS[key],
    }));
  }, [selectedExtensions]);

  const rootWarning = useMemo(() => getRootWarning(playgroundBlocks), [playgroundBlocks]);
  const warningMessage = playgroundWarning ?? rootWarning;

  /**
   * Switch modes between Template and Playground
   */
  const handleModeChange = useCallback((nextMode: ExplorerMode) => {
    setMode(nextMode);
  }, []);

  const handlePlaygroundReorder = useCallback((nextBlocks: PlaygroundBlock[]) => {
    setActivePresetId(null);
    setPlaygroundWarning(null);
    setPlaygroundBlocks(nextBlocks);
  }, []);
  // Cycle through block states (selector area)
  const handleBlockCycle = useCallback((blockId: string) => {
    setPlaygroundBlocks((prev) => {
      const index = prev.findIndex((block) => block.id === blockId);
      if (index === -1) return prev;

      const target = prev[index];
      const { nextKey, nextEnabled } = getNextVariantKey(target);
      
      const next = [...prev];
      let updated = updateBlockVariant(target, nextKey, nextEnabled);
      
      // Update currentState for extensions
      if (target.isExtension && target.extensionFamily) {
        const cycle = EXTENSION_STATE_CYCLES[target.extensionFamily];
        const currentIndex = cycle.indexOf((target.currentState as any) || 'off');
        const nextIndex = (currentIndex + 1) % cycle.length;
        updated.currentState = cycle[nextIndex] as any;
      }
      
      next[index] = updated;
      return next;
    });
    
    setActivePresetId(null);
    setPlaygroundWarning(null);
  }, []);

  // Remove block from drag area (sets to 'off' state)
  const handleBlockRemove = useCallback((blockId: string) => {
    setPlaygroundBlocks((prev) => {
      const enabledCount = prev.filter((block) => block.enabled).length;
      if (enabledCount <= MIN_ENABLED_BLOCKS) {
        setPlaygroundWarning('At least 2 notes required');
        return prev;
      }

      const index = prev.findIndex((block) => block.id === blockId);
      if (index === -1) return prev;

      const next = [...prev];
      const target = next[index];
      
      // Set to 'off' state
      next[index] = {
        ...target,
        enabled: false,
        currentState: target.isExtension ? 'off' : target.currentState,
      };
      
      setPlaygroundWarning(null);
      return next;
    });
    
    setActivePresetId(null);
  }, []);

  const handlePresetApply = useCallback((presetId: string) => {
    const preset = PLAYGROUND_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setPlaygroundBlocks((prev) => {
      const blockMap = new Map(prev.map((block) => [block.id, block]));
      const ordered: PlaygroundBlock[] = [];

      preset.order.forEach((id) => {
        const block = blockMap.get(id);
        if (block) {
          ordered.push(block);
          blockMap.delete(id);
        }
      });

      blockMap.forEach((block) => ordered.push(block));

      const disabledSet = new Set(preset.disabled ?? []);

      return ordered.map((block) => {
        let updated = { ...block };
        const isOrdered = preset.order.includes(block.id);
        const shouldDisable = disabledSet.has(block.id);
        
        // Handle chord tones
        if (!block.isExtension) {
          const nextEnabled = shouldDisable ? false : isOrdered ? true : block.enabled;
          const targetVariant = isOrdered && block.variants ? 'natural' : block.variantKey;
          updated = updateBlockVariant(updated, targetVariant, nextEnabled);
        }
        
        // Handle extensions
        if (block.isExtension && block.extensionFamily && preset.extensions) {
          const extensionState = preset.extensions[block.id];
          if (extensionState) {
            // Extension is specified in preset - enable with that variant
            updated = updateBlockVariant(updated, extensionState, true);
            updated.currentState = extensionState;
          } else {
            // Extension not in preset - set to off
            updated.enabled = false;
            updated.currentState = 'off';
          }
        } else if (block.isExtension && !preset.extensions) {
          // No extensions config - turn off all extensions
          updated.enabled = false;
          updated.currentState = 'off';
        }
        
        return updated;
      });
    });

    setActivePresetId(presetId);
    setPlaygroundWarning(null);
  }, []);

  const handlePresetReset = useCallback(() => {
    setPlaygroundWarning(null);
    setActivePresetId(null);
    setPlaygroundBlocks(basePlaygroundBlocks);
  }, [basePlaygroundBlocks]);

  const chordSelectorInputs = (
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
  );

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
      return [...voicedPlaygroundNotes];
    }

    return buildTemplateNoteSequence(extendedChordTones, selectedExtensions).map((entry) => entry.note);
  }, [mode, voicedPlaygroundNotes, extendedChordTones, selectedExtensions]);

  /**
   * Play the chord (block or arpeggio based on mode)
   */
  const handlePlay = useCallback(async () => {
    const ready = await ensureAudioReady();
    if (!ready) return;

    setIsPlaying(true);
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
          <div className="template-controls">
            <div className="template-controls__selectors">
              {chordSelectorInputs}
            </div>
            <ExtensionPanel
              quality={selectedQuality}
              root={selectedRoot}
              selected={selectedExtensions}
              onToggle={handleExtensionToggle}
            />
          </div>
        ) : (
          <>
            <div className="selector-card">
              <h4 className="selector-card__title">Chord</h4>
              {chordSelectorInputs}
            </div>
            <div className="playground-callout">
              <p>
                Playground Mode lets you drag note blocks to experiment with voicing order. Reordering is
                live for audio + keyboard, so play the chord or arpeggio to hear every variation instantly.
              </p>
            </div>
          </>
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
            allBlocks={playgroundBlocks}
            enabledBlocks={enabledPlaygroundBlocks}
            onBlockCycle={handleBlockCycle}
            onBlockRemove={handleBlockRemove}
            onReorder={handlePlaygroundReorder}
            warningMessage={warningMessage}
            presets={PLAYGROUND_PRESETS}
            activePresetId={activePresetId}
            onPresetSelect={handlePresetApply}
            onPresetReset={handlePresetReset}
            quality={selectedQuality}
          />
        )}

        <div className="keyboard-container">
          <PianoKeyboard
            activeNotes={activeNotes}
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
