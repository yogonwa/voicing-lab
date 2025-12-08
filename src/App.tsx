/**
 * Voicing Lab - Main Application
 *
 * Interactive tool for learning jazz piano voicings.
 * See and hear ii-V-I progressions voiced in different professional styles.
 */

import React from 'react';
import './App.css';
import { VoicingDisplay, ChordToneDisplay } from './components';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Voicing Lab</h1>
        <p className="tagline">Learn professional jazz piano voicings</p>
        <p className="intro">
          Move beyond blocky root-position chords. Explore how pros voice the classic ii-V-I progression.
        </p>
      </header>
      <main>
        <ChordToneDisplay />
        <VoicingDisplay />
      </main>
      <footer className="App-footer">
        <p>
          <kbd>Space</kbd> Play progression · <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> Switch voicings
        </p>
      </footer>
    </div>
  );
}

export default App;
