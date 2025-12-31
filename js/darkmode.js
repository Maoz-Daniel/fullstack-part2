// js/darkmode.js - Dark mode toggle functionality
// Purpose: Handle dark mode state and persistence

(function () {
  "use strict"; // all variables must be declared with var, let, or const

  const DARK_LABEL = "Dark mode";
  const LIGHT_LABEL = "Light mode";

  // apply dark mode state from localStorage
  function applyDarkModeState() {
    const darkModeEnabled = localStorage.getItem("darkMode") === "true";
    if (darkModeEnabled) {
      document.body.classList.add("dark-mode"); // Apply dark mode class in body
    }
  }

  // initialize dark mode toggle button
  function initDarkMode() {
    const darkModeToggle = document.getElementById("darkModeToggle"); // button element
    if (!darkModeToggle) return;

    const isDark = document.body.classList.contains("dark-mode"); // current state
    darkModeToggle.textContent = isDark ? LIGHT_LABEL : DARK_LABEL;

    darkModeToggle.addEventListener("click", toggleDarkMode); // attach click event
  }
// toggle dark mode state
  function toggleDarkMode() {
    const body = document.body;
    const darkModeToggle = document.getElementById("darkModeToggle"); // button element

    body.classList.toggle("dark-mode");
    const isDark = body.classList.contains("dark-mode"); // new state

    localStorage.setItem("darkMode", isDark);
    if (darkModeToggle) {
      darkModeToggle.textContent = isDark ? LIGHT_LABEL : DARK_LABEL; // update button label
    }
  }

  // apply dark mode immediately for each page load
  applyDarkModeState();

  // initialize button on page load (for pages without navbar-loader)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDarkMode); //
  } else {
    initDarkMode();
  }

  // Expose functions for manual use
  window.toggleDarkMode = toggleDarkMode;
  window.initDarkMode = initDarkMode;
})();
