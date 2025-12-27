/**
 * Music Theory Constants
 * 
 * Centralized constants for intervals, MIDI notes, and voicing constraints.
 * These values are used throughout the codebase for consistent music theory calculations.
 */

/**
 * Common musical intervals in semitones
 */
export const INTERVALS = {
  UNISON: 0,
  MINOR_SECOND: 1,
  MAJOR_SECOND: 2,
  MINOR_THIRD: 3,
  MAJOR_THIRD: 4,
  PERFECT_FOURTH: 5,
  TRITONE: 6,
  PERFECT_FIFTH: 7,
  MINOR_SIXTH: 8,
  MAJOR_SIXTH: 9,
  MINOR_SEVENTH: 10,
  MAJOR_SEVENTH: 11,
  OCTAVE: 12,
  MINOR_NINTH: 13,
  MAJOR_NINTH: 14,
  MINOR_TENTH: 15, // Octave + minor 3rd (max comfortable hand span)
  MAJOR_TENTH: 16, // Octave + major 3rd
} as const;

/**
 * MIDI note numbers for common reference pitches
 */
export const MIDI_NOTES = {
  MIDDLE_C: 60, // C4
  C3: 48,
  B6: 95,
} as const;

/**
 * Voicing constraints for playability and quality analysis
 */
export const VOICING_LIMITS = {
  /** Minimum notes required for a valid voicing */
  MIN_NOTES: 2,
  
  /** Maximum notes comfortably playable in one hand */
  MAX_COMFORTABLE_NOTES: 5,
  
  /** Absolute maximum notes (both hands, not recommended) */
  MAX_PLAYABLE_NOTES: 7,
  
  /** Maximum hand span in semitones (minor 10th) */
  MAX_HAND_SPAN_SEMITONES: 15,
  
  /** Maximum comfortable span for one hand (octave) */
  MAX_COMFORTABLE_SPAN_SEMITONES: 12,
  
  /** Interval threshold for "wide gap" warning (perfect 4th) */
  WIDE_GAP_THRESHOLD: 5,
  
  /** Interval threshold for "dense cluster" (minor 3rd) */
  CLUSTER_THRESHOLD: 3,
} as const;

/**
 * Bass register constraints for low-end clarity
 */
export const BASS_REGISTER = {
  /** Upper limit of bass register (C3 = MIDI 48) */
  UPPER_LIMIT_MIDI: 48,
  
  /** Minimum interval for clarity in bass (perfect 4th) */
  MIN_BASS_INTERVAL: 5,
} as const;

