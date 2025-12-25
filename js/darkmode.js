// js/darkmode.js - Dark mode toggle functionality
// Purpose: Handle dark mode state and persistence

(function () {
  "use strict";

  const DARK_LABEL = "Dark mode";
  const LIGHT_LABEL = "Light mode";

  function initDarkMode() {
    const darkModeEnabled = localStorage.getItem("darkMode") === "true";
    const body = document.body;
    const darkModeToggle = document.getElementById("darkModeToggle");

    if (darkModeEnabled) {
      body.classList.add("dark-mode");
      if (darkModeToggle) darkModeToggle.textContent = LIGHT_LABEL; // show "Light mode" when dark mode is active
    } else if (darkModeToggle) {
      darkModeToggle.textContent = DARK_LABEL;
    }

    if (darkModeToggle) {
      darkModeToggle.addEventListener("click", toggleDarkMode); 
    }
  }

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

  // initialize on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDarkMode);
  } else {
    initDarkMode();
  }

  // expose toggle for manual use if needed
  window.toggleDarkMode = toggleDarkMode;
  window.initDarkMode = initDarkMode;
})();
