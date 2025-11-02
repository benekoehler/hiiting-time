/**
 * Pure timer logic functions
 * No DOM manipulation or side effects
 */

import { state } from "./state.js";

/**
 * Start the timer
 * Sets running state and calculates start time for resume functionality
 */
export function start() {
  state.isRunning = true;
  state.startTime = performance.now() - state.pausedTime;
}

/**
 * Pause the timer
 * Cancels animation frame and preserves elapsed time
 */
export function pause() {
  state.isRunning = false;

  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }
}

/**
 * Reset timer to initial work phase state
 */
export function reset() {
  pause();
  state.isWorkPhase = true;
  state.pausedTime = 0;
  state.totalTime = state.workTime * 1000;
  state.phaseCount = 0;
}

/**
 * Switch between work and rest phases
 * Increments phase counter and resets timing
 */
export function switchPhase() {
  state.isWorkPhase = !state.isWorkPhase;
  state.pausedTime = 0;
  state.startTime = performance.now();
  state.totalTime = (state.isWorkPhase ? state.workTime : state.restTime) * 1000;

  // Only increment phase count when starting a new work phase
  if (state.isWorkPhase) {
    state.phaseCount++;
  }
}

/**
 * Calculate elapsed time in current phase
 * @returns {number} Elapsed time in milliseconds
 */
export function getElapsed() {
  return performance.now() - state.startTime;
}

/**
 * Check if current phase is complete
 * @param {number} elapsed - Elapsed time in milliseconds
 * @returns {boolean} True if phase is complete
 */
export function isPhaseComplete(elapsed) {
  return elapsed >= state.totalTime;
}

/**
 * Toggle mute state
 */
export function toggleMute() {
  state.isMuted = !state.isMuted;
}
