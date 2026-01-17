/**
 * UI functions for DOM manipulation and display updates
 */

/**
 * DOM element references
 */
export const elements = {
  appContainer: document.getElementById("appContainer"),
  arcProgress: document.querySelector(".arc-progress"),
  arcBg: document.querySelector(".arc-bg"),
  progressPath: document.getElementById("progressPath"),
  timeText: document.getElementById("timeText"),
  timeTextInverted: document.getElementById("timeTextInverted"),
  startStopBtn: document.getElementById("startStop"),
  resetBtn: document.getElementById("reset"),
  muteBtn: document.getElementById("mute"),
  workTimeInput: document.getElementById("workTime"),
  restTimeInput: document.getElementById("restTime"),
  phaseCountDisplay: document.getElementById("phaseCount"),
  phaseTextDisplay: document.getElementById("phaseText"),
};

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
export function createArcPath(progress) {
  const cx = 100; // Center X in viewBox coordinates
  const cy = 100; // Center Y in viewBox coordinates
  const r = 90; // Radius

  // Use minimal slice for 0% progress (Safari needs non-empty clip-path to render text)
  if (progress === 0) {
    return "M 100,100 L 100,10 A 90,90 0 0,1 100.0001,10.0 Z";
    progress = 0.0000001; // Tiny slice, virtually invisible but keeps clip-path valid
  }

  // Calculate end point on circle (starting from top, going clockwise)
  // Subtract π/2 to start from top instead of right
  const angle = progress * 2 * Math.PI;
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
 * The inverted text layer uses CSS filter to automatically flip colors.
 *
 * @param {number} elapsed - Elapsed time in milliseconds since phase started
 * @param {number} totalTime - Total time for current phase in milliseconds
 */
export function updateDisplay(elapsed, totalTime) {
  // Prevent negative time and handle division by zero
  const safeElapsed = Math.max(0, Math.min(elapsed, totalTime));
  const safeTotalTime = totalTime > 0 ? totalTime : 1;

  // Calculate remaining time in seconds (rounded up, min 0)
  const remaining = Math.max(0, Math.ceil((safeTotalTime - safeElapsed) / 1000));
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  // Format as MM:SS with zero-padding
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // Update text (single update)
  elements.timeText.textContent = timeString;
  elements.timeTextInverted.textContent = timeString;

  // Calculate progress ratio (0 to 1) with bounds checking
  const progress = Math.min(Math.max(0, safeElapsed / safeTotalTime), 1);
  const pathData = createArcPath(progress);

  // Update both the visible arc and the clip path
  elements.arcProgress.setAttribute("d", pathData);
  elements.progressPath.setAttribute("d", pathData);
}

/**
 * Update phase counter display
 * @param {number} count - Number of completed phases
 */
export function updatePhaseCount(count) {
  elements.phaseCountDisplay.textContent = count.toString();
}

/**
 * Set phase color (work = black, rest = inverted)
 * @param {boolean} isWorkPhase - Whether in work phase
 */
export function setPhaseColor(isWorkPhase) {
  elements.appContainer.classList.toggle("rest", !isWorkPhase);
  elements.phaseTextDisplay.textContent = isWorkPhase ? "Work" : "Rest";
}

/**
 * Update start/stop button text
 * @param {boolean} isRunning - Whether timer is running
 */
export function setStartStopButton(isRunning) {
  elements.startStopBtn.textContent = isRunning ? "Pause" : "Start";
}

/**
 * Update mute checkbox state
 * @param {boolean} isMuted - Whether sound is muted
 */
export function setMuteButton(isMuted) {
  elements.muteBtn.checked = isMuted;
}

/**
 * Split text into individual tspan elements for character-by-character animation
 * @param {SVGTextElement} textElement - The text element to populate
 * @param {string} text - The text to split into tspans
 */
function setTextWithTspans(textElement, text) {
  // Clear existing content
  textElement.textContent = "";

  // Create a tspan for each character
  for (let i = 0; i < text.length; i++) {
    const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    tspan.textContent = text[i];
    // Explicitly set the baseline to prevent Safari from shifting text
    tspan.setAttribute("dominant-baseline", "middle");
    textElement.appendChild(tspan);
  }
}

/**
 * Start intro animation with the timer time
 * Should be called instead of showing countdown
 * @param {number} totalTime - Total time for the phase in milliseconds
 */
export function startIntroAnimation(totalTime) {
  // Calculate time display
  const remaining = Math.max(0, Math.ceil(totalTime / 1000));
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // Set up tspans for each character
  setTextWithTspans(elements.timeText, timeString);
  setTextWithTspans(elements.timeTextInverted, timeString);

  // Trigger animation
  elements.timeText.classList.add("intro-animation");
  elements.timeTextInverted.classList.add("intro-animation");
}

/**
 * Clear countdown animation classes
 * Should be called when animation finishes
 */
export function clearCountdownAnimation() {
  elements.timeText.classList.remove("intro-animation");
  elements.timeTextInverted.classList.remove("intro-animation");

  // Reset to normal text content (remove tspans) to prevent Safari rendering issues
  // This will be updated by updateDisplay() when the timer starts
  const currentText = elements.timeText.textContent;
  elements.timeText.textContent = currentText;
  elements.timeTextInverted.textContent = currentText;
}
