// js/darkmode.js - Dark mode toggle functionality
// Purpose: Handle dark mode state and persistence

(function () {
  "use strict";

  const DARK_LABEL = "Dark mode";
  const LIGHT_LABEL = "Light mode";

  /**
   * Apply dark mode state from localStorage (runs immediately)
   * This ensures dark mode is applied before page renders
   */
  function applyDarkModeState() {
    const darkModeEnabled = localStorage.getItem("darkMode") === "true";
    if (darkModeEnabled) {
      document.body.classList.add("dark-mode");
    }
  }

  /**
   * Initialize dark mode toggle button
   * Called after DOM is ready
   */
  function initDarkMode() {
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (!darkModeToggle) return;

    const isDark = document.body.classList.contains("dark-mode");
    darkModeToggle.textContent = isDark ? LIGHT_LABEL : DARK_LABEL;

    darkModeToggle.addEventListener("click", toggleDarkMode);
  }

  /**
   * Toggle dark mode state
   */
  function toggleDarkMode() {
    const body = document.body;
    const darkModeToggle = document.getElementById("darkModeToggle");

    body.classList.toggle("dark-mode");
    const isDark = body.classList.contains("dark-mode");

    localStorage.setItem("darkMode", isDark);
    if (darkModeToggle) {
      darkModeToggle.textContent = isDark ? LIGHT_LABEL : DARK_LABEL;
    }
  }

  // Apply dark mode immediately (prevents flash)
  applyDarkModeState();

  // Initialize button on page load (for pages without navbar-loader)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDarkMode);
  } else {
    initDarkMode();
  }

  // Expose functions for manual use
  window.toggleDarkMode = toggleDarkMode;
  window.initDarkMode = initDarkMode;
})();
