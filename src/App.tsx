/**
 * Voicing Lab - Main Application
 *
 * Interactive tool for learning jazz piano voicings.
 * Explore chord extensions and hear ii-V-I progressions voiced professionally.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import { VoicingDisplay, ChordExplorer, VoiceLeadingTrainer } from './components';
import { TheoryDrillsPage } from './components/TheoryDrills';

function ExplorerPage() {
  return (
    <>
      <ChordExplorer />
      <VoicingDisplay />
    </>
  );
}

function TrainerPage() {
  return <VoiceLeadingTrainer />;
}

function DrillsPage() {
  return <TheoryDrillsPage />;
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
          <NavLink to="/drills">Theory Drills</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<ExplorerPage />} />
          <Route path="/trainer" element={<TrainerPage />} />
          <Route path="/drills" element={<DrillsPage />} />
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
