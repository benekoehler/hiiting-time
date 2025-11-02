/**
 * Audio functions using Web Audio API
 */

import { state } from "./state.js";
import { COUNTDOWN_CONFIG } from "./config.js";

/**
 * Play a simple beep sound using Web Audio API
 *
 * Creates a sine wave that decays exponentially.
 * The decay uses exponentialRampToValueAtTime which creates a natural-sounding
 * fade-out by reducing the gain from 0.5 to 0.01 over 0.2 seconds.
 * This mimics how real sounds decay in nature (exponentially, not linearly).
 *
 * Sound characteristics:
 * - Frequency: 800Hz (sine wave)
 * - Initial volume: 0.5 (50% of max)
 * - Duration: 200ms
 * - Decay curve: Exponential (natural sounding)
 *
 * @param {number} frequency - Frequency in Hz (default: 800)
 */
export function playBeep(frequency = 800) {
  // Don't play if muted
  if (state.isMuted) return;

  // Lazy-initialize AudioContext to avoid creating it until needed
  if (!state.audioContext) {
    state.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
  }

  // Create oscillator (tone generator) and gain node (volume control)
  const oscillator = state.audioContext.createOscillator();
  const gainNode = state.audioContext.createGain();

  // Connect: oscillator -> gain -> speakers
  oscillator.connect(gainNode);
  gainNode.connect(state.audioContext.destination);

  // Configure the tone
  oscillator.frequency.value = frequency;
  oscillator.type = "sine"; // Smooth sine wave

  // Set initial volume to 0.5 at current time
  gainNode.gain.setValueAtTime(0.5, state.audioContext.currentTime);

  // Exponentially decay to near-silence (0.01) over 200ms
  // Exponential decay sounds more natural than linear fade
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    state.audioContext.currentTime + 0.2,
  );

  // Play the sound for 200ms
  oscillator.start(state.audioContext.currentTime);
  oscillator.stop(state.audioContext.currentTime + 0.2);
}

/**
 * Play countdown beep with escalating frequency
 * Higher count = lower frequency for anticipation buildup
 *
 * @param {number} count - Countdown number (3, 2, 1)
 */
export function playCountdownBeep(count) {
  const config = COUNTDOWN_CONFIG[count];
  const frequency = config ? config.audioFrequency : 800;
  playBeep(frequency);
}
