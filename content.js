/**
 * Reddit Auto Following Tab - Content Script
 *
 * Features:
 * 1. Automatically selects "Following" tab when visiting reddit.com
 * 2. Intercepts Reddit logo clicks to stay on Following tab instead of navigating to Home
 * 3. Includes retry logic to handle slow-loading pages
 */

(function() {
  'use strict';

  // Selectors
  const SELECTORS = {
    tabGroup: 'faceplate-tabgroup',
    followingTab: 'faceplate-tabgroup button:nth-child(2)', // Following is the 2nd tab
    redditLogo: '#reddit-logo',
    header: 'header' // Watch header for SPA navigation
  };

  let isProcessing = false;
  let lastAttempt = 0;
  const MIN_INTERVAL = 300; // Minimum ms between attempts

  /**
   * Click the Following tab and verify it worked
   * @returns {boolean} true if successfully selected Following tab
   */
  function selectAndVerifyFollowingTab() {
    const now = Date.now();
    if (now - lastAttempt < MIN_INTERVAL) {
      return false; // Too soon since last attempt
    }
    lastAttempt = now;

    const followingTab = document.querySelector(SELECTORS.followingTab);
    if (!followingTab) {
      return false; // Tab not found yet
    }

    // If already selected, nothing to do
    if (followingTab.getAttribute('tabindex') === '0') {
      return true;
    }

    // Click the tab
    followingTab.click();

    // Small delay to allow UI to update, then verify
    setTimeout(() => {
      const stillSelected = followingTab.getAttribute('tabindex') === '0';
      if (!stillSelected) {
        // If click didn't work, retry once after a bit longer
        setTimeout(selectAndVerifyFollowingTab, 400);
      }
    }, 100);

    return true; // We attempted the click
  }

  /**
   * Set up logo click interception
   */
  function setupLogoInterception() {
    const logoLink = document.querySelector(SELECTORS.redditLogo);
    if (!logoLink) {
      return false;
    }

    // Avoid duplicate listeners
    if (logoLink.dataset.followingTabIntercepted === 'true') {
      return true;
    }

    logoLink.addEventListener('click', (event) => {
      // Only intercept if we're on the homepage (not a subreddit)
      const isHomepage = window.location.pathname === '/' || window.location.pathname === '';

      if (isHomepage) {
        event.preventDefault();
        event.stopPropagation();
        selectAndVerifyFollowingTab();
      }
      // If on a subreddit, allow normal navigation
    }, true); // capture phase

    logoLink.dataset.followingTabIntercepted = 'true';
    return true;
  }

  /**
   * Main logic to run when conditions are met
   */
  function runLogic() {
    // Prevent re-entrancy
    if (isProcessing) return;
    isProcessing = true;

    try {
      // Only run on homepage
      const isHomepage = window.location.pathname === '/' || window.location.pathname === '';
      if (!isHomepage) return;

      // Try to select and verify the Following tab
      selectAndVerifyFollowingTab();
      setupLogoInterception();
    } finally {
      // Allow next attempt after a short delay
      setTimeout(() => { isProcessing = false; }, MIN_INTERVAL);
    }
  }

  // Run immediately if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runLogic);
  } else {
    runLogic();
  }

  // Watch for SPA navigation - single observer for everything
  const observer = new MutationObserver(() => {
    // Re-check on any DOM change - setTimeout ensures we run after DOM settles
    setTimeout(runLogic, 0);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also handle popstate (back/forward)
  window.addEventListener('popstate', runLogic);
})();