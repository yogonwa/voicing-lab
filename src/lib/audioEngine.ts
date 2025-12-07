/**
 * Audio Engine
 *
 * Handles audio playback using Tone.js with piano samples.
 * Provides functions to play individual voicings and full progressions.
 *
 * Note: Browser requires user gesture before audio can play.
 * Call initAudio() on first user interaction.
 */

import * as Tone from 'tone';
import { VoicedChord } from './voicingTemplates';

// ============================================
// STATE
// ============================================

let sampler: Tone.Sampler | null = null;
let isInitialized = false;
let isLoading = false;

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the audio context and load piano samples.
 * Must be called after a user gesture (click, tap, etc.)
 *
 * @returns Promise that resolves when samples are loaded
 */
export async function initAudio(): Promise<void> {
  if (isInitialized) return;
  if (isLoading) return;

  isLoading = true;

  try {
    // Start the audio context (required by browsers)
    await Tone.start();

    // Create sampler with Salamander piano samples
    // Using a subset of notes for faster loading
    sampler = new Tone.Sampler({
      urls: {
        A1: 'A1.mp3',
        A2: 'A2.mp3',
        A3: 'A3.mp3',
        A4: 'A4.mp3',
        A5: 'A5.mp3',
        C2: 'C2.mp3',
        C3: 'C3.mp3',
        C4: 'C4.mp3',
        C5: 'C5.mp3',
        'D#2': 'Ds2.mp3',
        'D#3': 'Ds3.mp3',
        'D#4': 'Ds4.mp3',
        'F#2': 'Fs2.mp3',
        'F#3': 'Fs3.mp3',
        'F#4': 'Fs4.mp3',
      },
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      onload: () => {
        isInitialized = true;
        isLoading = false;
      },
    }).toDestination();

    // Wait for samples to load
    await Tone.loaded();
    isInitialized = true;
    isLoading = false;
  } catch (error) {
    isLoading = false;
    throw error;
  }
}

/**
 * Check if audio is ready to play
 */
export function isAudioReady(): boolean {
  return isInitialized && sampler !== null;
}

/**
 * Check if audio is currently loading
 */
export function isAudioLoading(): boolean {
  return isLoading;
}

// ============================================
// PLAYBACK
// ============================================

/**
 * Play a single voicing (all notes at once)
 *
 * @param voicing - The voicing to play
 * @param duration - How long to hold the notes (default: 1.5 seconds)
 */
export function playVoicing(voicing: VoicedChord, duration: string = '2n'): void {
  if (!sampler || !isInitialized) {
    console.warn('Audio not initialized. Call initAudio() first.');
    return;
  }

  const allNotes = [...voicing.leftHand, ...voicing.rightHand];
  const now = Tone.now();

  sampler.triggerAttackRelease(allNotes, duration, now);
}

/**
 * Play a full progression (sequence of voicings)
 *
 * @param voicings - Array of voicings to play in sequence
 * @param tempoMs - Milliseconds between each chord (default: 1500)
 * @param onChordStart - Callback when each chord starts (for UI sync)
 */
export function playProgression(
  voicings: VoicedChord[],
  tempoMs: number = 1500,
  onChordStart?: (index: number) => void
): void {
  if (!sampler || !isInitialized) {
    console.warn('Audio not initialized. Call initAudio() first.');
    return;
  }

  // Play each chord with synchronized visual callback
  voicings.forEach((voicing, index) => {
    const delayMs = index * tempoMs;
    const allNotes = [...voicing.leftHand, ...voicing.rightHand];

    // Schedule both audio and visual callback together
    setTimeout(() => {
      // Trigger visual highlight
      if (onChordStart) {
        onChordStart(index);
      }
      // Trigger audio
      sampler!.triggerAttackRelease(allNotes, '2n', Tone.now());
    }, delayMs);
  });
}

/**
 * Stop all currently playing sounds
 */
export function stopAll(): void {
  if (sampler) {
    sampler.releaseAll();
  }
}

// ============================================
// CLEANUP
// ============================================

/**
 * Dispose of the audio engine and free resources
 */
export function disposeAudio(): void {
  if (sampler) {
    sampler.dispose();
    sampler = null;
  }
  isInitialized = false;
  isLoading = false;
}

