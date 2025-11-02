/**
 * HIIT (High-Intensity Interval Training) Timer
 *
 * Main orchestrator that coordinates timer state, logic, audio, and UI
 */

import { state } from "./state.js";
import * as timer from "./timer.js";
import * as audio from "./audio.js";
import * as ui from "./ui.js";
import * as vibration from "./vibration.js";

/**
 * Main animation loop using requestAnimationFrame
 *
 * Runs at ~60fps for smooth visual updates. Calculates elapsed time,
 * checks for phase completion, updates display, and schedules next frame.
 */
function animate() {
  if (!state.isRunning) return;

  // Calculate time elapsed in current phase
  const elapsed = timer.getElapsed();
  state.pausedTime = elapsed; // Store for resume functionality

  // Check if phase is complete
  if (timer.isPhaseComplete(elapsed)) {
    handlePhaseSwitch();
  }

  ui.updateDisplay(elapsed, state.totalTime);

  // Schedule next frame (typically ~60fps)
  state.animationFrameId = requestAnimationFrame(animate);
}

/**
 * Handle phase switching (work ↔ rest)
 * Updates state, UI, plays sound, and triggers vibration
 */
function handlePhaseSwitch() {
  timer.switchPhase();
  ui.setPhaseColor(state.isWorkPhase);
  ui.updatePhaseCount(state.phaseCount);
  audio.playBeep();
  vibration.vibratePhaseChange();
}

/**
 * Toggle between running and paused states
 * Includes countdown when starting from beginning (pausedTime === 0)
 */
async function handleToggleTimer() {
  if (state.isRunning) {
    // Pause
    timer.pause();
    ui.setStartStopButton(false);
  } else {
    // Check if starting from beginning (not resuming)
    const isStartingFresh = state.pausedTime === 0;

    if (isStartingFresh) {
      // Run countdown before starting
      ui.setStartStopButton(true); // Show "Pause" during countdown

      const completed = await timer.countdown((count) => {
        // On each countdown tick
        ui.showCountdown(count);
        audio.playCountdownBeep(count);
        vibration.vibrateCountdown(count);
      });

      // If countdown was cancelled, reset button
      if (!completed) {
        ui.setStartStopButton(false);
        return;
      }
    }

    // Start timer
    timer.start();
    ui.setStartStopButton(true);
    animate();
  }
}

/**
 * Reset timer to initial state
 */
function handleReset() {
  timer.reset();
  ui.setPhaseColor(state.isWorkPhase);
  ui.updatePhaseCount(state.phaseCount);
  ui.setStartStopButton(false);
  ui.updateDisplay(0, state.totalTime);
}

/**
 * Toggle mute state
 */
function handleToggleMute() {
  timer.toggleMute();
  ui.setMuteButton(state.isMuted);
}

/**
 * Handle work time input change
 */
function handleWorkTimeChange(e) {
  state.workTime = parseInt(e.target.value);
  if (!state.isRunning) {
    handleReset();
  }
}

/**
 * Handle rest time input change
 */
function handleRestTimeChange(e) {
  state.restTime = parseInt(e.target.value);
  if (!state.isRunning) {
    handleReset();
  }
}

/**
 * Handle fullscreen toggle
 */
async function handleToggleFullscreen() {
  await ui.toggleFullscreen();
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
  ui.elements.startStopBtn.addEventListener("click", handleToggleTimer);
  ui.elements.resetBtn.addEventListener("click", handleReset);
  ui.elements.muteBtn.addEventListener("click", handleToggleMute);
  ui.elements.fullscreenBtn.addEventListener("click", handleToggleFullscreen);
  ui.elements.workTimeInput.addEventListener("change", handleWorkTimeChange);
  ui.elements.restTimeInput.addEventListener("change", handleRestTimeChange);

  // Listen for fullscreen changes (e.g., ESC key)
  document.addEventListener("fullscreenchange", () => {
    ui.updateFullscreenButton();
  });
}

/**
 * Initialize the app
 */
function init() {
  initEventListeners();
  handleReset();
}

// Start the app
init();
