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

test('renders voicing display', () => {
  render(<App />);
  const progressionTitle = screen.getByText(/ii-V-I in C Major/i);
  expect(progressionTitle).toBeInTheDocument();
});
