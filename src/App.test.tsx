import React from 'react';
import { render, screen } from '@testing-library/react';
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
