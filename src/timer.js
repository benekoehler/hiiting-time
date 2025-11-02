/**
 * Pure timer logic functions
 * No DOM manipulation or side effects
 */

import { state, TimerStatus } from "./state.js";

/**
 * Start the timer
 * Sets running state and calculates start time for resume functionality
 */
export function start() {
  state.status = TimerStatus.RUNNING;
  state.startTime = performance.now() - state.pausedTime;
}

/**
 * Pause the timer
 * Cancels animation frame and preserves elapsed time
 */
export function pause() {
  state.status = TimerStatus.PAUSED;

  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }
}

/**
 * Reset timer to initial work phase state
 */
export function reset() {
  // Cancel any ongoing countdown
  if (state.countdownTimeoutId !== null) {
    clearTimeout(state.countdownTimeoutId);
    state.countdownTimeoutId = null;
  }

  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  state.status = TimerStatus.IDLE;
  state.isWorkPhase = true;
  state.pausedTime = 0;
  state.totalTime = state.workTime;
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
  state.totalTime = state.isWorkPhase ? state.workTime : state.restTime;

  // Increment phase count when ENDING a work phase (starting rest)
  if (!state.isWorkPhase) {
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

/**
 * Run countdown before starting timer
 * @param {Function} onTick - Callback for each countdown tick (3, 2, 1)
 * @returns {Promise<boolean>} Resolves to true when countdown completes, false if cancelled
 */
export async function countdown(onTick) {
  state.status = TimerStatus.COUNTDOWN;

  for (let i = 3; i >= 1; i--) {
    // Check if countdown was cancelled
    if (state.status !== TimerStatus.COUNTDOWN) {
      return false;
    }

    // Call tick callback with current count
    if (onTick) {
      onTick(i);
    }

    // Wait 1 second
    await new Promise((resolve) => {
      state.countdownTimeoutId = setTimeout(resolve, 1000);
    });
  }

  state.countdownTimeoutId = null;
  return true;
}

/**
 * Cancel ongoing countdown
 */
export function cancelCountdown() {
  if (state.countdownTimeoutId !== null) {
    clearTimeout(state.countdownTimeoutId);
    state.countdownTimeoutId = null;
  }
  if (state.status === TimerStatus.COUNTDOWN) {
    state.status = TimerStatus.IDLE;
  }
}

/**
 * Start animation loop with callbacks
 * @param {Function} onUpdate - Called each frame with (elapsed, totalTime)
 * @param {Function} onPhaseComplete - Called when phase completes
 */
export function startAnimationLoop(onUpdate, onPhaseComplete) {
  function animate() {
    if (state.status !== TimerStatus.RUNNING) return;

    const elapsed = getElapsed();

    // Check if phase is complete
    if (isPhaseComplete(elapsed)) {
      state.pausedTime = elapsed;
      if (onPhaseComplete) {
        onPhaseComplete();
      }
    }

    if (onUpdate) {
      onUpdate(elapsed, state.totalTime);
    }

    // Schedule next frame
    state.animationFrameId = requestAnimationFrame(animate);
  }

  animate();
}
