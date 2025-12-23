import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ChordExplorer } from './ChordExplorer';

// Mock audio to keep tests pure and avoid Tone.js ESM concerns.
jest.mock('../../lib/audio');

function getPlaygroundPanel(): HTMLElement {
  const header = screen.getByText('Playground Mode');
  const panel = header.closest('.playground-panel');
  if (!panel || !(panel instanceof HTMLElement)) {
    throw new Error('Expected PlaygroundPanel container to exist');
  }
  return panel;
}

describe('ChordExplorer (Playground Mode)', () => {
  it('switches between Template and Playground modes', async () => {
    render(<ChordExplorer />);

    // Template mode is default.
    expect(screen.getByText('Extensions')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /playground/i }));
    expect(await screen.findByText('Playground Mode')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /template/i }));
    expect(screen.getByText('Extensions')).toBeInTheDocument();
  });

  it('prevents disabling below two enabled notes and shows warning', async () => {
    render(<ChordExplorer />);
    fireEvent.click(screen.getByRole('button', { name: /playground/i }));

    const panel = getPlaygroundPanel();
    const ui = within(panel);

    const fifth = ui.getByRole('button', { name: /5\s*G/i });
    const seventh = ui.getByRole('button', { name: /7\s*B/i });
    const third = ui.getByRole('button', { name: /3\s*E/i });

    fireEvent.click(fifth);
    expect(fifth).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(seventh);
    expect(seventh).toHaveAttribute('aria-pressed', 'false');

    // Now only 2 notes remain enabled (root + third). Disabling another should be blocked.
    fireEvent.click(third);
    expect(third).toHaveAttribute('aria-pressed', 'true');

    // Note: dnd-kit also injects a live region with role="status", so assert by message text.
    expect(ui.getByText('At least 2 notes required')).toBeInTheDocument();
  });

  it('applies preset and resets to defaults', async () => {
    render(<ChordExplorer />);
    fireEvent.click(screen.getByRole('button', { name: /playground/i }));

    const panel = getPlaygroundPanel();
    const ui = within(panel);

    fireEvent.click(ui.getByRole('button', { name: /^shell a$/i }));

    const fifth = ui.getByRole('button', { name: /5\s*G/i });
    expect(fifth).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(ui.getByRole('button', { name: /^reset$/i }));
    expect(fifth).toHaveAttribute('aria-pressed', 'true');
  });
});


