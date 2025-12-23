/**
 * ExtensionPanel Component
 * 
 * Displays extension checkboxes grouped by degree (9ths, 11ths, 13ths).
 * Shows warning icons for avoid notes.
 */

import React from 'react';
import {
  NoteName,
  ChordQuality,
  Chord,
  shouldAvoidExtension,
  getExtensionsByGroup,
  SelectedExtensions,
  ExtensionKey,
  ExtensionOption,
  EXTENSION_TIPS,
} from '../../lib/core';

// ============================================
// TYPES
// ============================================

interface ExtensionPanelProps {
  quality: ChordQuality;
  root: NoteName;
  selected: SelectedExtensions;
  onToggle: (key: ExtensionKey) => void;
}

interface ExtensionCheckboxProps {
  option: ExtensionOption;
  checked: boolean;
  hasWarning: boolean;
  warningText?: string;
  onChange: () => void;
}

// ============================================
// SUB-COMPONENTS
// ============================================

function ExtensionCheckbox({ 
  option, 
  checked, 
  hasWarning, 
  warningText,
  onChange 
}: ExtensionCheckboxProps) {
  const tip = EXTENSION_TIPS[option.key];
  
  return (
    <label 
      className={`extension-checkbox ${checked ? 'checked' : ''} ${hasWarning ? 'has-warning' : ''} ${option.isAlteration ? 'is-alteration' : ''}`}
      title={hasWarning ? `⚠️ ${warningText}\n\n${tip}` : tip}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span className="checkbox-label">{option.label}</span>
      {hasWarning && <span className="warning-icon" title={warningText}>⚠️</span>}
    </label>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ExtensionPanel({ 
  quality, 
  root,
  selected, 
  onToggle 
}: ExtensionPanelProps) {
  const groups = getExtensionsByGroup(quality);
  
  // Map extension keys to their avoid status
  const getWarningText = (key: ExtensionKey): string | undefined => {
    // Check if this extension should be avoided for this quality
    const chord: Chord = { root, quality };
    
    // Map ExtensionKey to the role format used by shouldAvoidExtension
    const roleMap: Record<ExtensionKey, "ninth" | "eleventh" | "thirteenth" | undefined> = {
      ninth: "ninth",
      flatNinth: undefined, // Alterations don't have avoid rules
      sharpNinth: undefined,
      eleventh: "eleventh",
      sharpEleventh: undefined,
      thirteenth: "thirteenth",
      flatThirteenth: undefined,
    };
    
    const role = roleMap[key];
    if (role && shouldAvoidExtension(chord, role)) {
      if (role === "eleventh") {
        return "Natural 11th clashes with major 3rd. Try ♯11 instead.";
      }
      if (role === "thirteenth") {
        return "13th can clash with minor context.";
      }
    }
    return undefined;
  };

  const renderGroup = (groupName: "9ths" | "11ths" | "13ths", options: ExtensionOption[]) => {
    if (options.length === 0) return null;
    
    return (
      <div className="extension-group" key={groupName}>
        <span className="group-label">{groupName}:</span>
        <div className="group-checkboxes">
          {options.map(option => {
            const warningText = getWarningText(option.key);
            return (
              <ExtensionCheckbox
                key={option.key}
                option={option}
                checked={selected[option.key] || false}
                hasWarning={!!warningText}
                warningText={warningText}
                onChange={() => onToggle(option.key)}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="extension-panel">
      <h4 className="panel-title">Extensions</h4>
      <div className="extension-groups">
        {renderGroup("9ths", groups["9ths"])}
        {renderGroup("11ths", groups["11ths"])}
        {renderGroup("13ths", groups["13ths"])}
      </div>
    </div>
  );
}

export default ExtensionPanel;

