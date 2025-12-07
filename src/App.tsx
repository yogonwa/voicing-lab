/**
 * Voicing Lab - Main Application
 *
 * Phase 1: Text-based algorithm proof of concept
 */

import React from 'react';
import './App.css';
import { VoicingDisplay } from './components';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Voicing Lab</h1>
        <p>Jazz piano voicing explorer</p>
      </header>
      <main>
        <VoicingDisplay />
      </main>
    </div>
  );
}

export default App;
