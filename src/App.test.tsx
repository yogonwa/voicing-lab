import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the audio engine to avoid Tone.js ESM issues in tests
jest.mock('./lib/audioEngine');

import App from './App';

test('renders app title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Voicing Lab/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders tagline', () => {
  render(<App />);
  const tagline = screen.getByText(/Learn professional jazz piano voicings/i);
  expect(tagline).toBeInTheDocument();
});

test('renders intro text', () => {
  render(<App />);
  const intro = screen.getByText(/Move beyond blocky root-position chords/i);
  expect(intro).toBeInTheDocument();
});

test('renders voicing display', () => {
  render(<App />);
  const progressionTitle = screen.getByText(/ii-V-I in C Major/i);
  expect(progressionTitle).toBeInTheDocument();
});

test('renders keyboard shortcuts in footer', () => {
  render(<App />);
  // Footer contains keyboard shortcuts hint
  const footer = document.querySelector('.App-footer');
  expect(footer).toBeInTheDocument();
  expect(footer).toHaveTextContent('Space');
  expect(footer).toHaveTextContent('Switch voicings');
});
