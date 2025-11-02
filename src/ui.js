/**
 * UI functions for DOM manipulation and display updates
 */

/**
 * DOM element references
 */
export const elements = {
  arcProgress: document.querySelector(".arc-progress"),
  progressPath: document.getElementById("progressPath"),
  timeTextBase: document.getElementById("timeTextBase"),
  timeTextInverted: document.getElementById("timeTextInverted"),
  startStopBtn: document.getElementById("startStop"),
  resetBtn: document.getElementById("reset"),
  muteBtn: document.getElementById("mute"),
  fullscreenBtn: document.getElementById("fullscreen"),
  workTimeInput: document.getElementById("workTime"),
  restTimeInput: document.getElementById("restTime"),
  phaseCountDisplay: document.getElementById("phaseCount"),
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
 * @param {number} totalTime - Total time for current phase in milliseconds
 */
export function updateDisplay(elapsed, totalTime) {
  // Calculate remaining time in seconds (rounded up)
  const remaining = Math.ceil((totalTime - elapsed) / 1000);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  // Format as MM:SS with zero-padding
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // Update both text layers (base and inverted)
  elements.timeTextBase.textContent = timeString;
  elements.timeTextInverted.textContent = timeString;

  // Calculate progress ratio (0 to 1) and generate arc path
  const progress = Math.min(elapsed / totalTime, 1);
  const pathData = createArcPath(progress);

  // Update both the visible arc and the clip path for text inversion
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
 * Set phase color (work = green, rest = red)
 * @param {boolean} isWorkPhase - Whether in work phase
 */
export function setPhaseColor(isWorkPhase) {
  if (isWorkPhase) {
    elements.arcProgress.classList.remove("rest");
  } else {
    elements.arcProgress.classList.add("rest");
  }
}

/**
 * Update start/stop button text
 * @param {boolean} isRunning - Whether timer is running
 */
export function setStartStopButton(isRunning) {
  elements.startStopBtn.textContent = isRunning ? "Pause" : "Start";
}

/**
 * Update mute button icon and style
 * @param {boolean} isMuted - Whether sound is muted
 */
export function setMuteButton(isMuted) {
  elements.muteBtn.textContent = isMuted ? "🔇" : "🔊";
  elements.muteBtn.classList.toggle("muted", isMuted);
}

/**
 * Toggle fullscreen mode
 * Uses the Fullscreen API to enter/exit fullscreen
 */
export async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.error("Error entering fullscreen:", err);
    }
  } else {
    try {
      await document.exitFullscreen();
    } catch (err) {
      console.error("Error exiting fullscreen:", err);
    }
  }
}

/**
 * Update fullscreen button icon based on fullscreen state
 */
export function updateFullscreenButton() {
  const isFullscreen = !!document.fullscreenElement;
  elements.fullscreenBtn.textContent = isFullscreen ? "⛶" : "⛶";
  elements.fullscreenBtn.setAttribute(
    "aria-label",
    isFullscreen ? "Exit fullscreen" : "Enter fullscreen",
  );
}

/**
 * Display countdown number
 * @param {number} count - Countdown number (3, 2, 1)
 */
export function showCountdown(count) {
  elements.timeTextBase.textContent = count.toString();
  elements.timeTextInverted.textContent = count.toString();
}
