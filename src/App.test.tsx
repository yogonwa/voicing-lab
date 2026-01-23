import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock react-router-dom (uses src/__mocks__/react-router-dom.tsx)
jest.mock('react-router-dom');

// Mock the audio engine to avoid Tone.js ESM issues in tests
jest.mock('./lib/audio');

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

test('renders navigation links', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: /Explorer/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Voice Leading Trainer/i })).toBeInTheDocument();
});

test('renders keyboard shortcuts in footer', () => {
  render(<App />);
  const footer = document.querySelector('.App-footer');
  expect(footer).toBeInTheDocument();
  expect(footer).toHaveTextContent('Space');
  expect(footer).toHaveTextContent('Basic voicings');
  expect(footer).toHaveTextContent('Extended voicings');
});
