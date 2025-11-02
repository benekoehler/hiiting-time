/**
 * @typedef {Object} TimerState
 * @property {number} workTime - Work duration in seconds
 * @property {number} restTime - Rest duration in seconds
 * @property {number} startTime - Timestamp when current phase started (from performance.now())
 * @property {number} pausedTime - Time elapsed when paused (in milliseconds)
 * @property {number} totalTime - Total time for current phase in milliseconds
 * @property {boolean} isRunning - Whether timer is running
 * @property {boolean} isWorkPhase - Whether in work phase (true) or rest phase (false)
 * @property {number|null} animationFrameId - requestAnimationFrame ID for smooth animation
 */

/**
 * HIIT (High-Intensity Interval Training) Timer
 *
 * Creates a visual timer with a circular progress indicator that fills smoothly
 * using requestAnimationFrame. Alternates between work and rest phases with
 * different colors and plays a sound when switching phases.
 */
class HIITTimer {
  constructor() {
    /** @type {number} */
    this.workTime = 30;

    /** @type {number} */
    this.restTime = 10;

    /** @type {number} */
    this.startTime = 0;

    /** @type {number} */
    this.pausedTime = 0;

    /** @type {number} */
    this.totalTime = this.workTime * 1000;

    /** @type {boolean} */
    this.isRunning = false;

    /** @type {boolean} */
    this.isWorkPhase = true;

    /** @type {number|null} */
    this.animationFrameId = null;

    /** @type {SVGPathElement} */
    this.arcProgress = document.querySelector(".arc-progress");

    /** @type {SVGPathElement} */
    this.progressPath = document.getElementById("progressPath");

    /** @type {SVGTextElement} */
    this.timeTextBase = document.getElementById("timeTextBase");

    /** @type {SVGTextElement} */
    this.timeTextInverted = document.getElementById("timeTextInverted");

    /** @type {HTMLButtonElement} */
    this.startStopBtn = document.getElementById("startStop");

    /** @type {HTMLButtonElement} */
    this.resetBtn = document.getElementById("reset");

    /** @type {HTMLInputElement} */
    this.workTimeInput = document.getElementById("workTime");

    /** @type {HTMLInputElement} */
    this.restTimeInput = document.getElementById("restTime");

    /** @type {HTMLButtonElement} */
    this.muteBtn = document.getElementById("mute");

    /** @type {AudioContext|null} */
    this.audioContext = null;

    /** @type {boolean} */
    this.isMuted = false;

    /** @type {number} */
    this.phaseCount = 0;

    /** @type {HTMLElement} */
    this.phaseCountDisplay = document.getElementById("phaseCount");

    this.init();
  }

  /**
   * Initialize event listeners and reset to initial state
   */
  init() {
    this.startStopBtn.addEventListener("click", () => this.toggleTimer());
    this.resetBtn.addEventListener("click", () => this.reset());
    this.muteBtn.addEventListener("click", () => this.toggleMute());

    // Update work/rest times when inputs change, but only reset if timer is paused
    this.workTimeInput.addEventListener("change", (e) => {
      this.workTime = parseInt(e.target.value);
      if (!this.isRunning) this.reset();
    });

    this.restTimeInput.addEventListener("change", (e) => {
      this.restTime = parseInt(e.target.value);
      if (!this.isRunning) this.reset();
    });

    this.reset();
  }

  /**
   * Toggle between running and paused states
   */
  toggleTimer() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  /**
   * Toggle sound mute state
   * Updates button icon to reflect current state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.muteBtn.textContent = this.isMuted ? "🔇" : "🔊";
    this.muteBtn.classList.toggle("muted", this.isMuted);
  }

  /**
   * Start the timer animation
   * Uses performance.now() for high-resolution timestamps and subtracts
   * pausedTime to resume from where we left off
   */
  start() {
    this.isRunning = true;
    this.startStopBtn.textContent = "Pause";
    this.startTime = performance.now() - this.pausedTime;
    this.animate();
  }

  /**
   * Pause the timer by canceling the animation frame loop
   */
  pause() {
    this.isRunning = false;
    this.startStopBtn.textContent = "Start";

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Reset timer to initial work phase state
   */
  reset() {
    this.pause();
    this.isWorkPhase = true;
    this.pausedTime = 0;
    this.totalTime = this.workTime * 1000;
    this.arcProgress.classList.remove("rest");
    this.phaseCount = 0;
    this.phaseCountDisplay.textContent = "0";
    this.updateDisplay(0);
  }

  /**
   * Switch between work and rest phases
   * Toggles colors, resets phase time, plays a transition sound, and increments counter
   */
  switchPhase() {
    this.isWorkPhase = !this.isWorkPhase;
    this.pausedTime = 0;
    this.startTime = performance.now();
    this.totalTime = (this.isWorkPhase ? this.workTime : this.restTime) * 1000;

    if (this.isWorkPhase) {
      this.arcProgress.classList.remove("rest");
      // Increment phase counter
      this.phaseCount++;
    } else {
      this.arcProgress.classList.add("rest");
    }

    this.phaseCountDisplay.textContent = this.phaseCount.toString();

    this.playSound();
  }

  /**
   * Play a simple beep sound using Web Audio API
   *
   * Creates a 800Hz sine wave that decays exponentially over 200ms.
   * The decay uses exponentialRampToValueAtTime which creates a natural-sounding
   * fade-out by reducing the gain from 0.3 to 0.01 over 0.2 seconds.
   * This mimics how real sounds decay in nature (exponentially, not linearly).
   *
   * Sound characteristics:
   * - Frequency: 800Hz (sine wave)
   * - Initial volume: 0.5 (50% of max)
   * - Duration: 200ms
   * - Decay curve: Exponential (natural sounding)
   */
  playSound() {
    // Don't play if muted
    if (this.isMuted) return;

    // Lazy-initialize AudioContext to avoid creating it until needed
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    }

    // Create oscillator (tone generator) and gain node (volume control)
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Connect: oscillator -> gain -> speakers
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Configure the tone
    oscillator.frequency.value = 800; // 800Hz frequency
    oscillator.type = "sine"; // Smooth sine wave

    // Set initial volume to 0.3 at current time
    gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);

    // Exponentially decay to near-silence (0.01) over 200ms
    // Exponential decay sounds more natural than linear fade
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.2,
    );

    // Play the sound for 200ms
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  /**
   * Main animation loop using requestAnimationFrame
   *
   * Runs at ~60fps for smooth visual updates. Calculates elapsed time,
   * checks for phase completion, updates display, and schedules next frame.
   */
  animate() {
    if (!this.isRunning) return;

    // Calculate time elapsed in current phase
    const elapsed = performance.now() - this.startTime;
    this.pausedTime = elapsed; // Store for resume functionality

    // Check if phase is complete
    if (elapsed >= this.totalTime) {
      this.switchPhase();
    }

    this.updateDisplay(elapsed);

    // Schedule next frame (typically ~60fps)
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Create SVG path for filled arc (pie slice)
   *
   * Generates an SVG path that creates a filled circular segment from the top (12 o'clock)
   * sweeping clockwise. The path forms a "pie slice" shape that grows as progress increases.
   *
   * Path construction:
   * - M: Move to center point
   * - L: Line to start point (top of circle)
   * - A: Arc from start to current progress point
   * - Z: Close path back to center
   *
   * @param {number} progress - Progress from 0 to 1 (0% to 100%)
   * @returns {string} SVG path string in format "M x,y L x,y A ... Z"
   */
  createArcPath(progress) {
    const cx = 100; // Center X in viewBox coordinates
    const cy = 100; // Center Y in viewBox coordinates
    const r = 90; // Radius
    const angle = progress * 2 * Math.PI; // Convert progress to radians

    // Empty path for 0% progress
    if (progress === 0) return "";

    // Full circle for 100% progress (two half-circle arcs)
    if (progress >= 1) {
      return `M ${cx},${cy} m -${r},0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`;
    }

    // Calculate end point on circle (starting from top, going clockwise)
    // Subtract π/2 to start from top instead of right
    const x = cx + r * Math.cos(angle - Math.PI / 2);
    const y = cy + r * Math.sin(angle - Math.PI / 2);

    // Use large-arc flag when progress > 50%
    const largeArc = progress > 0.5 ? 1 : 0;

    // Create pie slice: center -> top -> arc -> back to center
    return `M ${cx},${cy} L ${cx},${cy - r} A ${r},${r} 0 ${largeArc},1 ${x},${y} Z`;
  }

  /**
   * Update the visual display (time text and progress arc)
   *
   * Updates both the countdown timer and the filled arc progress.
   * The time is shown in two overlapping layers - one normal and one inverted -
   * with the inverted version clipped to only show where the arc has filled.
   *
   * @param {number} elapsed - Elapsed time in milliseconds since phase started
   */
  updateDisplay(elapsed) {
    // Calculate remaining time in seconds (rounded up)
    const remaining = Math.ceil((this.totalTime - elapsed) / 1000);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    // Format as MM:SS with zero-padding
    const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    // Update both text layers (base and inverted)
    this.timeTextBase.textContent = timeString;
    this.timeTextInverted.textContent = timeString;

    // Calculate progress ratio (0 to 1) and generate arc path
    const progress = Math.min(elapsed / this.totalTime, 1);
    const pathData = this.createArcPath(progress);

    // Update both the visible arc and the clip path for text inversion
    this.arcProgress.setAttribute("d", pathData);
    this.progressPath.setAttribute("d", pathData);
  }
}

new HIITTimer();
