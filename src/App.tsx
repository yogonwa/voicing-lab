/**
 * Voicing Lab - Main Application
 *
 * Interactive tool for learning jazz piano voicings.
 * Explore chord extensions and hear ii-V-I progressions voiced professionally.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import { VoicingDisplay, ChordExplorer } from './components';

function ExplorerPage() {
  return (
    <>
      <ChordExplorer />
      <VoicingDisplay />
    </>
  );
}

function TrainerPage() {
  return (
    <div className="trainer-placeholder">
      <h2>Voice Leading Trainer</h2>
      <p>Coming soon...</p>
    </div>
  );
}

/**
 * App content without router wrapper.
 * Exported for testing with MemoryRouter.
 */
export function AppContent() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Voicing Lab</h1>
        <p className="tagline">Learn professional jazz piano voicings</p>
        <nav className="App-nav">
          <NavLink to="/" end>Explorer</NavLink>
          <NavLink to="/trainer">Voice Leading Trainer</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<ExplorerPage />} />
          <Route path="/trainer" element={<TrainerPage />} />
        </Routes>
      </main>
      <footer className="App-footer">
        <p>
          <kbd>Space</kbd> Play progression · <kbd>1-3</kbd> Basic voicings · <kbd>4-6</kbd> Extended voicings
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
