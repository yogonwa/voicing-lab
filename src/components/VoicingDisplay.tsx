/**
 * VoicingDisplay Component
 *
 * Display of jazz piano voicings for the ii-V-I progression.
 * Shows chord names, left hand notes, and right hand notes for each
 * voicing style. Includes audio playback.
 *
 * Phase 2: Added audio playback with Tone.js
 */

import React, { useState, useCallback } from 'react';
import './VoicingDisplay.css';
import {
  ALL_TEMPLATES,
  PROGRESSIONS,
  VoicingTemplate,
  VoicedChord,
  initAudio,
  isAudioReady,
  isAudioLoading,
  playVoicing,
  playProgression,
} from '../lib';

// ============================================
// CONSTANTS
// ============================================

// ii-V-I chord names in C major
const CHORD_NAMES = ['Dm7', 'G7', 'Cmaj7'];

// ============================================
// SUB-COMPONENTS
// ============================================

interface StyleSelectorProps {
  templates: VoicingTemplate[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/**
 * Buttons to switch between voicing styles
 */
function StyleSelector({ templates, selectedId, onSelect }: StyleSelectorProps) {
  return (
    <div className="style-selector">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template.id)}
          className={`style-button ${selectedId === template.id ? 'active' : ''}`}
          aria-pressed={selectedId === template.id}
        >
          {template.name}
        </button>
      ))}
    </div>
  );
}

interface ChordCardProps {
  name: string;
  voicing: VoicedChord;
  isPlaying: boolean;
  onPlay: () => void;
}

/**
 * Display a single chord's voicing with play button
 */
function ChordCard({ name, voicing, isPlaying, onPlay }: ChordCardProps) {
  return (
    <div className={`chord-card ${isPlaying ? 'playing' : ''}`}>
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
 * Shows ii-V-I progression with selectable voicing styles and audio playback.
 */
export function VoicingDisplay() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(ALL_TEMPLATES[0].id);
  const [audioReady, setAudioReady] = useState(isAudioReady());
  const [loading, setLoading] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isPlayingProgression, setIsPlayingProgression] = useState(false);

  // Get the progression for the selected template
  const progression = PROGRESSIONS[selectedTemplateId];

  // Get the selected template for display
  const selectedTemplate = ALL_TEMPLATES.find((t) => t.id === selectedTemplateId);

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
   * Play a single chord
   */
  const handlePlayChord = useCallback(
    async (index: number) => {
      const ready = await ensureAudioReady();
      if (!ready) return;

      setPlayingIndex(index);
      playVoicing(progression[index]);

      // Clear playing state after duration
      setTimeout(() => {
        setPlayingIndex(null);
      }, 1500);
    },
    [ensureAudioReady, progression]
  );

  /**
   * Play the full progression
   */
  const handlePlayAll = useCallback(async () => {
    const ready = await ensureAudioReady();
    if (!ready) return;

    const tempoMs = 1500; // 1.5 seconds per chord
    setIsPlayingProgression(true);

    // Play progression - callback handles highlighting each chord
    playProgression(progression, tempoMs, (index) => {
      setPlayingIndex(index);
    });

    // Clear playing state after full duration
    const totalDuration = progression.length * tempoMs + 500;
    setTimeout(() => {
      setPlayingIndex(null);
      setIsPlayingProgression(false);
    }, totalDuration);
  }, [ensureAudioReady, progression]);

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
        templates={ALL_TEMPLATES}
        selectedId={selectedTemplateId}
        onSelect={setSelectedTemplateId}
      />

      <div className="progression">
        {progression.map((voicing, index) => (
          <ChordCard
            key={CHORD_NAMES[index]}
            name={CHORD_NAMES[index]}
            voicing={voicing}
            isPlaying={playingIndex === index}
            onPlay={() => handlePlayChord(index)}
          />
        ))}
      </div>

      <PlayControls
        onPlayAll={handlePlayAll}
        isLoading={loading}
        isPlaying={isPlayingProgression}
      />
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
