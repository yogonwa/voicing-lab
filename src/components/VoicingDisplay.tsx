/**
 * VoicingDisplay Component
 *
 * Text-based display of jazz piano voicings for the ii-V-I progression.
 * Shows chord names, left hand notes, and right hand notes for each
 * voicing style.
 *
 * Phase 1: Text output only (no audio, no piano visualization)
 */

import React, { useState } from 'react';
import './VoicingDisplay.css';
import {
  ALL_TEMPLATES,
  PROGRESSIONS,
  VoicingTemplate,
  VoicedChord,
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
}

/**
 * Display a single chord's voicing
 */
function ChordCard({ name, voicing }: ChordCardProps) {
  return (
    <div className="chord-card">
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
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * Main voicing display component.
 * Shows ii-V-I progression with selectable voicing styles.
 */
export function VoicingDisplay() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(ALL_TEMPLATES[0].id);

  // Get the progression for the selected template
  const progression = PROGRESSIONS[selectedTemplateId];

  // Get the selected template for display
  const selectedTemplate = ALL_TEMPLATES.find((t) => t.id === selectedTemplateId);

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
          />
        ))}
      </div>
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

