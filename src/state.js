/**
 * @typedef {Object} TimerState
 * @property {number} workTime - Work duration in seconds
 * @property {number} restTime - Rest duration in seconds
 * @property {number} startTime - Timestamp when current phase started (from performance.now())
 * @property {number} pausedTime - Time elapsed when paused (in milliseconds)
 * @property {number} totalTime - Total time for current phase in milliseconds
 * @property {boolean} isRunning - Whether timer is running
 * @property {boolean} isWorkPhase - Whether in work phase (true) or rest phase (false)
 * @property {boolean} isMuted - Whether sound is muted
 * @property {number} phaseCount - Number of completed phases
 * @property {number|null} animationFrameId - requestAnimationFrame ID for smooth animation
 * @property {AudioContext|null} audioContext - Web Audio API context
 * @property {boolean} isCountingDown - Whether in countdown mode
 */

/**
 * Global timer state
 * @type {TimerState}
 */
export const state = {
  workTime: 30,
  restTime: 10,
  startTime: 0,
  pausedTime: 0,
  totalTime: 30000, // 30 seconds in milliseconds
  isRunning: false,
  isWorkPhase: true,
  isMuted: false,
  phaseCount: 0,
  animationFrameId: null,
  audioContext: null,
  isCountingDown: false,
};
