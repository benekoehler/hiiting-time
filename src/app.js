/**
 * HIIT (High-Intensity Interval Training) Timer
 *
 * Main orchestrator that coordinates timer state, logic, audio, and UI
 */

import { state, TimerStatus } from "./state.js";
import * as timer from "./timer.js";
import * as audio from "./audio.js";
import * as ui from "./ui.js";
import * as vibration from "./vibration.js";
import * as wakeLock from "./wakeLock.js";

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
  if (state.status === TimerStatus.RUNNING) {
    // Pause the running timer
    timer.pause();
    state.pausedTime = timer.getElapsed();
    ui.setStartStopButton(false);
    // Release wake lock when pausing
    await wakeLock.releaseWakeLock();
  } else if (state.status === TimerStatus.COUNTDOWN) {
    // Cancel countdown if user clicks during countdown
    timer.cancelCountdown();
    ui.setStartStopButton(false);
    ui.updateDisplay(0, state.totalTime);
  } else {
    // Starting or resuming
    const isStartingFresh = state.pausedTime === 0;

    if (isStartingFresh) {
      // Run countdown before starting
      const completed = await timer.countdown((count) => {
        // On each countdown tick
        ui.showCountdown(count);
        audio.playCountdownBeep(count);
        vibration.vibrateCountdown(count);
      });

      // If countdown was cancelled, don't start
      if (!completed) {
        ui.setStartStopButton(false);
        ui.updateDisplay(0, state.totalTime);
        return;
      }
    }

    // Start or resume timer
    timer.start();
    ui.setStartStopButton(true);
    timer.startAnimationLoop(ui.updateDisplay, handlePhaseSwitch);
    // Request wake lock to prevent screen sleep
    await wakeLock.requestWakeLock();
  }
}

/**
 * Reset timer to initial state
 */
async function handleReset() {
  timer.reset();
  ui.setPhaseColor(state.isWorkPhase);
  ui.updatePhaseCount(state.phaseCount);
  ui.setStartStopButton(false);
  ui.updateDisplay(0, state.totalTime);
  // Release wake lock when resetting
  await wakeLock.releaseWakeLock();
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
  const value = parseInt(e.target.value, 10);

  // Validate input - reject NaN and negative values
  if (isNaN(value) || value <= 0) {
    // Reset input to current valid value
    e.target.value = Math.floor(state.workTime / 1000);
    return;
  }

  state.workTime = value * 1000; // Convert seconds to milliseconds

  // Save to localStorage
  localStorage.setItem("workTime", value.toString());

  // Only update if in idle state and is work phase
  if (state.status === TimerStatus.IDLE && state.isWorkPhase) {
    state.totalTime = state.workTime;
    ui.updateDisplay(0, state.totalTime);
  }
}

/**
 * Handle rest time input change
 */
function handleRestTimeChange(e) {
  const value = parseInt(e.target.value, 10);

  // Validate input - reject NaN and negative values
  if (isNaN(value) || value <= 0) {
    // Reset input to current valid value
    e.target.value = Math.floor(state.restTime / 1000);
    return;
  }

  state.restTime = value * 1000; // Convert seconds to milliseconds

  // Save to localStorage
  localStorage.setItem("restTime", value.toString());

  // Only update if in idle state and is rest phase
  if (state.status === TimerStatus.IDLE && !state.isWorkPhase) {
    state.totalTime = state.restTime;
    ui.updateDisplay(0, state.totalTime);
  }
}

/**
 * Load settings from localStorage
 */
function loadSettings() {
  const savedWorkTime = localStorage.getItem("workTime");
  const savedRestTime = localStorage.getItem("restTime");

  if (savedWorkTime) {
    const workTime = parseInt(savedWorkTime, 10);
    if (!isNaN(workTime) && workTime > 0) {
      state.workTime = workTime * 1000;
      ui.elements.workTimeInput.value = workTime;
    }
  }

  if (savedRestTime) {
    const restTime = parseInt(savedRestTime, 10);
    if (!isNaN(restTime) && restTime > 0) {
      state.restTime = restTime * 1000;
      ui.elements.restTimeInput.value = restTime;
    }
  }
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
  ui.elements.startStopBtn.addEventListener("click", handleToggleTimer);
  ui.elements.resetBtn.addEventListener("click", handleReset);
  ui.elements.muteBtn.addEventListener("change", handleToggleMute);
  ui.elements.workTimeInput.addEventListener("change", handleWorkTimeChange);
  ui.elements.restTimeInput.addEventListener("change", handleRestTimeChange);
}

/**
 * Initialize the app
 */
function init() {
  loadSettings();
  initEventListeners();
  handleReset();
}

// Start the app
init();
