/**
 * Vibration functions for haptic feedback
 * Uses the Vibration API for mobile devices
 */

import { state } from "./state.js";

/**
 * Check if vibration is supported
 * @returns {boolean} True if navigator.vibrate is available
 */
export function isVibrationSupported() {
  return "vibrate" in navigator;
}

/**
 * Trigger vibration if supported and not muted
 * Respects mute state (when muted, also disables vibration)
 *
 * @param {number|number[]} pattern - Vibration pattern in milliseconds
 *   - Single number: vibrate for that duration
 *   - Array: alternating vibrate/pause durations [vibrate, pause, vibrate, ...]
 */
export function vibrate(pattern) {
  // Don't vibrate if muted or unsupported
  if (state.isMuted || !isVibrationSupported()) return;

  navigator.vibrate(pattern);
}

/**
 * Play vibration for phase change
 * Single 200ms pulse
 */
export function vibratePhaseChange() {
  vibrate(200);
}

/**
 * Play vibration for countdown tick
 * Pattern depends on countdown number for escalating intensity
 *
 * @param {number} count - Countdown number (3, 2, 1)
 */
export function vibrateCountdown(count) {
  // Escalating patterns: 3=short, 2=medium, 1=long
  const patterns = {
    3: 100, // Short pulse
    2: 150, // Medium pulse
    1: 300, // Longer pulse for final count
  };

  const pattern = patterns[count] || 100;
  vibrate(pattern);
}

/**
 * Stop all vibrations
 */
export function stopVibration() {
  if (isVibrationSupported()) {
    navigator.vibrate(0);
  }
}
