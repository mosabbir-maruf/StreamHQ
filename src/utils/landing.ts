/**
 * Utility functions for managing landing page experience
 */

export const LANDING_STORAGE_KEY = 'streamhq-visited';

/**
 * Check if user has visited before
 */
export const hasVisitedBefore = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(LANDING_STORAGE_KEY) === 'true';
};

/**
 * Mark user as having visited
 */
export const markAsVisited = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LANDING_STORAGE_KEY, 'true');
};

/**
 * Reset landing page experience (for testing)
 */
export const resetLandingExperience = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LANDING_STORAGE_KEY);
};

/**
 * Force show landing page (for testing)
 */
export const forceShowLanding = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LANDING_STORAGE_KEY);
  window.location.reload();
};

/**
 * Test utilities for development
 */
export const testLanding = {
  /**
   * Reset and show landing page
   */
  showLanding: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(LANDING_STORAGE_KEY);
    window.location.reload();
  },
  
  /**
   * Skip landing page (mark as visited)
   */
  skipLanding: () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LANDING_STORAGE_KEY, 'true');
    window.location.reload();
  },
  
  /**
   * Check current state
   */
  getState: () => {
    if (typeof window === 'undefined') return null;
    return {
      hasVisited: hasVisitedBefore(),
      storageValue: localStorage.getItem(LANDING_STORAGE_KEY)
    };
  },
  
  /**
   * Clear all landing data
   */
  clearAll: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(LANDING_STORAGE_KEY);
  }
};
