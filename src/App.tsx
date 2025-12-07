/**
 * Voicing Lab - Main Application
 *
 * Phase 1: Text-based algorithm proof of concept
 * TODO: Replace with VoicingDisplay component
 */

import React from 'react';
import './App.css';

// Use barrel import from lib
import { getChordTones, type ChordTones } from './lib';

// ============================================
// TEMPORARY: Console validation of chord calculator
// Remove once VoicingDisplay component is built
// ============================================

const formatTones = (name: string, t: ChordTones) =>
  `${name}: R=${t.root}, 3=${t.third}, 5=${t.fifth}, 7=${t.seventh}`;

console.log('=== ii-V-I in C Major ===');
console.log(formatTones('Dm7', getChordTones({ root: 'D', quality: 'min7' })));
console.log(formatTones('G7', getChordTones({ root: 'G', quality: 'dom7' })));
console.log(formatTones('Cmaj7', getChordTones({ root: 'C', quality: 'maj7' })));

// ============================================

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Voicing Lab</h1>
        <p>Jazz piano voicing explorer</p>
        <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          Phase 1: Check browser console for chord calculator output
        </p>
      </header>
    </div>
  );
}

export default App;
