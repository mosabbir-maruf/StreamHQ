import { useState, useEffect } from "react";

/**
 * Custom hook to manage device vibration.
 *
 * @returns {object} - Contains functions to start, stop, and manage vibration patterns.
 */
const useDeviceVibration = () => {
  const [isVibrating, setIsVibrating] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const isVibrationSupported = () => "vibrate" in navigator;

  /**
   * Start device vibration with a given pattern.
   * @param {number | number[]} pattern - Single number or array of numbers defining the vibration pattern.
   */
  const startVibration = (pattern: VibratePattern) => {
    if (isVibrationSupported() && hasUserInteracted) {
      navigator.vibrate(pattern);
      setIsVibrating(true);
    } else if (!hasUserInteracted) {
      // Vibration requires user interaction first
    } else {
      // Vibration API is not supported in this browser
    }
  };

  /**
   * Stop the current vibration.
   */
  const stopVibration = () => {
    if (isVibrationSupported() && hasUserInteracted) {
      navigator.vibrate(0);
      setIsVibrating(false);
    }
  };

  useEffect(() => {
    // Set up user interaction listener
    const handleUserInteraction = () => {
      setHasUserInteracted(true);
    };

    // Add event listeners for user interaction
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      // Clean up event listeners
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      
      // Only stop vibration if user has interacted
      if (hasUserInteracted) {
        stopVibration();
      }
    };
  }, [hasUserInteracted]);

  return {
    isVibrating,
    startVibration,
    stopVibration,
    isVibrationSupported,
  };
};

export default useDeviceVibration;
