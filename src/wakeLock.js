/**
 * Screen Wake Lock functionality
 * Prevents screen from sleeping while timer is running
 */

let wakeLock = null;

/**
 * Request a wake lock to keep the screen on
 * @returns {Promise<boolean>} True if wake lock was acquired, false otherwise
 */
export async function requestWakeLock() {
  // Check if Wake Lock API is supported
  if (!("wakeLock" in navigator)) {
    console.warn("Wake Lock API is not supported in this browser");
    return false;
  }

  try {
    wakeLock = await navigator.wakeLock.request("screen");
    console.log("Wake lock acquired");

    // Listen for wake lock release (e.g., tab becomes inactive)
    wakeLock.addEventListener("release", () => {
      console.log("Wake lock released");
    });

    return true;
  } catch (err) {
    console.error(`Failed to acquire wake lock: ${err.name}, ${err.message}`);
    return false;
  }
}

/**
 * Release the wake lock to allow screen to sleep normally
 * @returns {Promise<void>}
 */
export async function releaseWakeLock() {
  if (wakeLock !== null) {
    try {
      await wakeLock.release();
      wakeLock = null;
      console.log("Wake lock manually released");
    } catch (err) {
      console.error(`Failed to release wake lock: ${err.name}, ${err.message}`);
    }
  }
}

/**
 * Check if wake lock is currently active
 * @returns {boolean}
 */
export function isWakeLockActive() {
  return wakeLock !== null && !wakeLock.released;
}

/**
 * Re-acquire wake lock when page becomes visible again
 * Useful when user switches tabs and comes back
 */
async function handleVisibilityChange() {
  if (document.visibilityState === "visible" && wakeLock !== null && wakeLock.released) {
    await requestWakeLock();
  }
}

// Set up visibility change listener to re-acquire wake lock when returning to tab
document.addEventListener("visibilitychange", handleVisibilityChange);
