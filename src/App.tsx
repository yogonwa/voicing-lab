/**
 * Voicing Lab - Main Application
 *
 * Interactive tool for learning jazz piano voicings.
 * Explore chord extensions and hear ii-V-I progressions voiced professionally.
 */

import React from 'react';
import './App.css';
import { VoicingDisplay, ChordExplorer } from './components';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Voicing Lab</h1>
        <p className="tagline">Learn professional jazz piano voicings</p>
        <p className="intro">
          Move beyond blocky root-position chords. Explore extensions and hear how pros voice progressions.
        </p>
      </header>
      <main>
        <ChordExplorer />
        <VoicingDisplay />
      </main>
      <footer className="App-footer">
        <p>
          <kbd>Space</kbd> Play progression · <kbd>1-3</kbd> Basic voicings · <kbd>4-6</kbd> Extended voicings
        </p>
      </footer>
    </div>
  );
}

export default App;
