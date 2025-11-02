/**
 * Timer state enum
 * @enum {string}
 */
export const TimerStatus = {
  IDLE: "idle",
  COUNTDOWN: "countdown",
  RUNNING: "running",
  PAUSED: "paused",
};

/**
 * @typedef {Object} TimerState
 * @property {number} workTime - Work duration in milliseconds
 * @property {number} restTime - Rest duration in milliseconds
 * @property {number} startTime - Timestamp when current phase started (from performance.now())
 * @property {number} pausedTime - Time elapsed when paused (in milliseconds)
 * @property {number} totalTime - Total time for current phase in milliseconds
 * @property {TimerStatus} status - Current timer status
 * @property {boolean} isWorkPhase - Whether in work phase (true) or rest phase (false)
 * @property {boolean} isMuted - Whether sound is muted
 * @property {number} phaseCount - Number of completed phases
 * @property {number|null} animationFrameId - requestAnimationFrame ID for smooth animation
 * @property {AudioContext|null} audioContext - Web Audio API context
 * @property {number|null} countdownTimeoutId - Timeout ID for countdown
 */

/**
 * Global timer state with logging
 * @type {TimerState}
 */
const _state = {
  workTime: 30000, // 30 seconds in milliseconds
  restTime: 10000, // 10 seconds in milliseconds
  startTime: 0,
  pausedTime: 0,
  totalTime: 30000, // 30 seconds in milliseconds
  status: TimerStatus.IDLE,
  isWorkPhase: true,
  isMuted: false,
  phaseCount: 0,
  animationFrameId: null,
  audioContext: null,
  countdownTimeoutId: null,
};

// Enable logging in development mode (set to false for production)
const ENABLE_STATE_LOGGING = false;

/**
 * Create a proxy for state change logging
 */
export const state = new Proxy(_state, {
  set(target, property, value) {
    if (ENABLE_STATE_LOGGING && target[property] !== value) {
      console.log(`[State] ${String(property)}: ${target[property]} → ${value}`);
    }
    target[property] = value;
    return true;
  },
});
