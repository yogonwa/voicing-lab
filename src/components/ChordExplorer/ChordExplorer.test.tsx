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

    // Click remove buttons in drag area to disable notes
    const fifthRemove = ui.getByRole('button', { name: /Remove G/i });
    const seventhRemove = ui.getByRole('button', { name: /Remove B/i });
    const thirdRemove = ui.getByRole('button', { name: /Remove E/i });

    fireEvent.click(fifthRemove);
    fireEvent.click(seventhRemove);

    // Now only 2 notes remain enabled (root + third). Removing another should be blocked.
    fireEvent.click(thirdRemove);

    // Note: dnd-kit also injects a live region with role="status", so assert by message text.
    expect(ui.getByText('At least 2 notes required')).toBeInTheDocument();
  });

  it('applies preset and resets to defaults', async () => {
    render(<ChordExplorer />);
    fireEvent.click(screen.getByRole('button', { name: /playground/i }));

    const panel = getPlaygroundPanel();
    const ui = within(panel);

    fireEvent.click(ui.getByRole('button', { name: /^shell a$/i }));

    // After Shell A preset, fifth should be disabled (not in drag area)
    // Check that there's no Remove G button (fifth is not in drag area)
    expect(ui.queryByRole('button', { name: /Remove G/i })).not.toBeInTheDocument();

    fireEvent.click(ui.getByRole('button', { name: /^reset$/i }));
    
    // After reset, fifth should be enabled again (in drag area)
    expect(ui.getByRole('button', { name: /Remove G/i })).toBeInTheDocument();
  });
});


