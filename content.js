/**
 * Reddit Auto Following Tab - Content Script
 *
 * Features:
 * 1. Automatically selects "Following" tab when visiting reddit.com
 * 2. Intercepts Reddit logo clicks to stay on Following tab instead of navigating to Home
 */

(function() {
  'use strict';

  // Selectors
  const SELECTORS = {
    tabGroup: 'faceplate-tabgroup',
    followingTab: 'faceplate-tabgroup button:nth-child(2)', // Following is the 2nd tab
    redditLogo: '#reddit-logo',
    header: 'header'
  };

  /**
   * Click the Following tab
   */
  function selectFollowingTab() {
    const followingTab = document.querySelector(SELECTORS.followingTab);
    if (followingTab) {
      // Check if already selected (tabindex="0" means selected)
      if (followingTab.getAttribute('tabindex') === '0') {
        return true; // Already on Following tab
      }
      followingTab.click();
      return true;
    }
    return false;
  }

  /**
   * Set up logo click interception
   */
  function interceptLogoClick() {
    const logoLink = document.querySelector(SELECTORS.redditLogo);
    if (!logoLink) {
      return false;
    }

    // Check if already intercepted
    if (logoLink.dataset.followingTabIntercepted === 'true') {
      return true;
    }

    // Use capture phase to intercept before any other handlers
    logoLink.addEventListener('click', (event) => {
      // Only intercept if we're on the homepage (not a subreddit)
      const isHomepage = window.location.pathname === '/' || window.location.pathname === '';

      if (isHomepage) {
        event.preventDefault();
        event.stopPropagation();
        selectFollowingTab();
      }
      // If on a subreddit, allow normal navigation
    }, true); // capture phase

    logoLink.dataset.followingTabIntercepted = 'true';
    return true;
  }

  /**
   * Run the core logic - always runs on homepage
   */
  function runLogic() {
    // Only run on homepage
    const isHomepage = window.location.pathname === '/' || window.location.pathname === '';
    if (!isHomepage) return;

    selectFollowingTab();
    interceptLogoClick();
  }

  /**
   * Check and run logic - can be called multiple times safely
   */
  function checkAndRun() {
    runLogic();
  }

  // Run immediately if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndRun);
  } else {
    checkAndRun();
  }

  // Watch for SPA navigation - single observer for everything
  const observer = new MutationObserver(() => {
    // Re-check on any DOM change - setTimeout ensures we run after DOM settles
    setTimeout(checkAndRun, 0);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also handle popstate (back/forward)
  window.addEventListener('popstate', checkAndRun);

})();