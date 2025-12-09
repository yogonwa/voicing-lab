/**
 * VoicingDisplay Component
 *
 * Display of jazz piano voicings for the ii-V-I progression.
 * Includes piano keyboard visualization, chord cards, and audio playback.
 *
 * Phase 3: Added piano keyboard visualization with audio sync
 *
 * Keyboard Highlighting Behavior:
 * - Default/template selected: No highlights (clean slate for study)
 * - During progression: Highlight current chord, clear when done
 * - Single chord clicked: Highlight and KEEP until next action (sticky)
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import './VoicingDisplay.css';
import {
  BASIC_TEMPLATES,
  EXTENDED_TEMPLATES,
  ALL_TEMPLATES,
  PROGRESSIONS,
  VoicingTemplate,
  VoicedChord,
  Chord,
  initAudio,
  isAudioReady,
  playVoicing,
  playProgression,
} from '../lib';
import { PianoKeyboard, KeyboardLegend, getActiveNotes, ActiveNote } from './PianoKeyboard';

// ============================================
// CONSTANTS
// ============================================

// ii-V-I chord names in C major (basic)
const CHORD_NAMES_BASIC = ['Dm7', 'G7', 'Cmaj7'];

// ii-V-I chord names in C major (extended)
const CHORD_NAMES_EXTENDED: Record<string, string[]> = {
  'shell-9': ['Dm9', 'G9', 'Cmaj9'],
  'shell-13': ['Dm9', 'G13', 'Cmaj9'],
  'open-9': ['Dm9', 'G9', 'Cmaj9'],
};

/** Get chord names based on template (basic vs extended) */
function getChordNames(templateId: string): string[] {
  return CHORD_NAMES_EXTENDED[templateId] || CHORD_NAMES_BASIC;
}

// ii-V-I chords for role calculation
const II_V_I_CHORDS: Chord[] = [
  { root: 'D', quality: 'min7' },
  { root: 'G', quality: 'dom7' },
  { root: 'C', quality: 'maj7' },
];

// ============================================
// SUB-COMPONENTS
// ============================================

interface StyleSelectorProps {
  basicTemplates: VoicingTemplate[];
  extendedTemplates: VoicingTemplate[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/**
 * Buttons to switch between voicing styles, grouped by basic/extended
 */
function StyleSelector({ basicTemplates, extendedTemplates, selectedId, onSelect }: StyleSelectorProps) {
  return (
    <div className="style-selector">
      {/* Basic voicings */}
      <div className="style-selector__group">
        <span className="style-selector__label">Basic</span>
        <div className="style-selector__buttons">
          {basicTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template.id)}
              className={`style-button ${selectedId === template.id ? 'active' : ''}`}
              aria-pressed={selectedId === template.id}
              title={template.description}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Extended voicings (with 9th, 13th) */}
      <div className="style-selector__group">
        <span className="style-selector__label">Extended</span>
        <div className="style-selector__buttons">
          {extendedTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template.id)}
              className={`style-button style-button--extended ${selectedId === template.id ? 'active' : ''}`}
              aria-pressed={selectedId === template.id}
              title={template.description}
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ChordCardProps {
  name: string;
  voicing: VoicedChord;
  isHighlighted: boolean;
  onPlay: () => void;
}

/**
 * Display a single chord's voicing with play button
 */
function ChordCard({ name, voicing, isHighlighted, onPlay }: ChordCardProps) {
  return (
    <div className={`chord-card ${isHighlighted ? 'playing' : ''}`}>
      <h3 className="chord-name">{name}</h3>
      <div className="chord-notes">
        <div className="hand left-hand">
          <span className="hand-label">LH:</span>
          <span className="notes">{voicing.leftHand.join(', ')}</span>
        </div>
        <div className="hand right-hand">
          <span className="hand-label">RH:</span>
          <span className="notes">{voicing.rightHand.join(', ')}</span>
        </div>
      </div>
      <button className="play-chord-button" onClick={onPlay} aria-label={`Play ${name}`}>
        ▶
      </button>
    </div>
  );
}

interface PlayControlsProps {
  onPlayAll: () => void;
  isLoading: boolean;
  isPlaying: boolean;
}

/**
 * Play all button for the full progression
 */
function PlayControls({ onPlayAll, isLoading, isPlaying }: PlayControlsProps) {
  return (
    <div className="play-controls">
      <button
        className="play-all-button"
        onClick={onPlayAll}
        disabled={isLoading || isPlaying}
      >
        {isLoading ? 'Loading...' : isPlaying ? 'Playing...' : '▶ Play Progression'}
      </button>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * Main voicing display component.
 * Shows ii-V-I progression with piano keyboard, voicing cards, and audio playback.
 */
export function VoicingDisplay() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(ALL_TEMPLATES[0].id);
  const [audioReady, setAudioReady] = useState(isAudioReady());
  const [loading, setLoading] = useState(false);

  // Highlighting state:
  // - playingIndex: Currently playing during progression (transient)
  // - stickyChordIndex: User clicked a chord, keep highlighted (persistent)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [stickyChordIndex, setStickyChordIndex] = useState<number | null>(null);
  const [isPlayingProgression, setIsPlayingProgression] = useState(false);

  // Get the progression for the selected template
  const progression = PROGRESSIONS[selectedTemplateId];

  // Get the selected template for display
  const selectedTemplate = ALL_TEMPLATES.find((t) => t.id === selectedTemplateId);

  // Check if current template uses extensions
  const isExtendedTemplate = EXTENDED_TEMPLATES.some((t) => t.id === selectedTemplateId);

  // Get appropriate chord names based on template
  const chordNames = getChordNames(selectedTemplateId);

  // Determine which chord index to highlight (if any)
  // Priority: playingIndex (during progression) > stickyChordIndex (after single click)
  const highlightedIndex = playingIndex ?? stickyChordIndex;

  // Calculate active notes for the keyboard
  // Returns empty array when nothing is highlighted (default state)
  const activeNotes: ActiveNote[] = useMemo(() => {
    if (highlightedIndex === null) {
      return []; // No highlights - clean keyboard
    }
    const voicing = progression[highlightedIndex];
    const chord = II_V_I_CHORDS[highlightedIndex];
    return getActiveNotes(voicing, chord);
  }, [progression, highlightedIndex]);

  /**
   * Handle template change - clear any sticky highlight
   */
  const handleTemplateSelect = useCallback((templateId: string) => {
    setSelectedTemplateId(templateId);
    setStickyChordIndex(null); // Clear sticky on template change
  }, []);

  /**
   * Initialize audio on first interaction
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
   * Play a single chord - keeps highlight sticky after playback
   */
  const handlePlayChord = useCallback(
    async (index: number) => {
      const ready = await ensureAudioReady();
      if (!ready) return;

      // Set sticky highlight (persists after sound ends)
      setStickyChordIndex(index);
      playVoicing(progression[index]);
    },
    [ensureAudioReady, progression]
  );

  /**
   * Play the full progression - clears highlights when done
   */
  const handlePlayAll = useCallback(async () => {
    const ready = await ensureAudioReady();
    if (!ready) return;

    // Clear any sticky highlight when starting progression
    setStickyChordIndex(null);

    const tempoMs = 1500; // 1.5 seconds per chord
    setIsPlayingProgression(true);

    // Play progression - callback handles highlighting each chord
    playProgression(progression, tempoMs, (index) => {
      setPlayingIndex(index);
    });

    // Clear playing state after full duration (back to no highlights)
    const totalDuration = progression.length * tempoMs + 500;
    setTimeout(() => {
      setPlayingIndex(null);
      setIsPlayingProgression(false);
    }, totalDuration);
  }, [ensureAudioReady, progression]);

  /**
   * Keyboard shortcuts:
   * - Space: Play progression
   * - 1, 2, 3: Switch between basic voicing templates
   * - 4, 5, 6: Switch between extended voicing templates
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
        return;
      }

      switch (event.key) {
        case ' ':
          event.preventDefault();
          if (!isPlayingProgression && !loading) {
            handlePlayAll();
          }
          break;
        // Basic templates (1-3)
        case '1':
          handleTemplateSelect(BASIC_TEMPLATES[0]?.id);
          break;
        case '2':
          handleTemplateSelect(BASIC_TEMPLATES[1]?.id);
          break;
        case '3':
          handleTemplateSelect(BASIC_TEMPLATES[2]?.id);
          break;
        // Extended templates (4-6)
        case '4':
          handleTemplateSelect(EXTENDED_TEMPLATES[0]?.id);
          break;
        case '5':
          handleTemplateSelect(EXTENDED_TEMPLATES[1]?.id);
          break;
        case '6':
          handleTemplateSelect(EXTENDED_TEMPLATES[2]?.id);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayingProgression, loading, handlePlayAll, handleTemplateSelect]);

  return (
    <div className="voicing-display">
      <header className="display-header">
        <h2>ii-V-I in C Major</h2>
        <p className="template-description">
          {selectedTemplate?.name}:{' '}
          {getTemplateDescription(selectedTemplateId)}
        </p>
      </header>

      <StyleSelector
        basicTemplates={BASIC_TEMPLATES}
        extendedTemplates={EXTENDED_TEMPLATES}
        selectedId={selectedTemplateId}
        onSelect={handleTemplateSelect}
      />

      {/* Piano Keyboard Visualization */}
      <section className="keyboard-section">
        <PianoKeyboard activeNotes={activeNotes} />
        <KeyboardLegend showExtensions={isExtendedTemplate} />
      </section>

      <PlayControls
        onPlayAll={handlePlayAll}
        isLoading={loading}
        isPlaying={isPlayingProgression}
      />

      {/* Text display (kept from Phase 1/2) */}
      <section className="text-display-section">
        <h3 className="section-title">Note Details</h3>
        <div className="progression">
          {progression.map((voicing, index) => (
            <ChordCard
              key={chordNames[index]}
              name={chordNames[index]}
              voicing={voicing}
              isHighlighted={highlightedIndex === index}
              onPlay={() => handlePlayChord(index)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

// ============================================
// HELPERS
// ============================================

/**
 * Get a human-readable description of the voicing template
 */
function getTemplateDescription(templateId: string): string {
  // First check if template has its own description
  const template = ALL_TEMPLATES.find(t => t.id === templateId);
  if (template?.description) {
    return template.description;
  }

  // Fallback for legacy
  switch (templateId) {
    case 'shell-a':
      return 'Root in left hand, 3rd and 7th in right hand (1-3-7)';
    case 'shell-b':
      return 'Root in left hand, 7th and 3rd in right hand (1-7-3)';
    case 'open':
      return 'Root and 5th in left hand, 3rd and 7th in right hand (1-5 / 3-7)';
    default:
      return '';
  }
}

export default VoicingDisplay;
