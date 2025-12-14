/* js/games.js
 * Dashboard interactions: session gate, logout, dark mode toggle, and basic stats.
 */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const GAME1_KEYS = window.GAME1_LS_KEYS || {
    BEST_SCORE: "game1_bestScore",
    TOTAL_POINTS: "game1_totalPoints",
    TOTAL_MISSES: "game1_totalMisses",
    GAMES_PLAYED: "game1_gamesPlayed",
    SESSIONS: "game1_sessions",
    RECENT_RESULTS: "game1_recentResults",
    LAST_DIFFICULTY: "game1_lastDifficulty"
  };

  function requireSession() {
    if (typeof getCurrentSession !== "function") return null;
    const session = getCurrentSession();
    if (!session) {
      window.location.href = "login.html";
      return null;
    }
    return session;
  }

  function renderUser(username) {
    const initial = username?.charAt(0)?.toUpperCase() || "U";
    const usernameEl = $("username");
    const welcomeEl = $("welcomeUsername");
    const avatarEl = $("userAvatar");

    if (usernameEl) usernameEl.textContent = username;
    if (welcomeEl) welcomeEl.textContent = username;
    if (avatarEl) avatarEl.textContent = initial;
  }

  function bindLogout() {
    const btn = $("logoutBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (typeof clearCurrentSession === "function") {
        clearCurrentSession();
      }
      window.location.href = "login.html";
    });
  }

  function keyFor(baseKey, username) {
    if (typeof getGame1Key === "function") {
      return getGame1Key(baseKey, username);
    }
    return `${baseKey}_${username}`;
  }

  function getNumber(baseKey, username, fallback = 0) {
    if (typeof getGame1NumberForUser === "function") {
      return getGame1NumberForUser(baseKey, username, fallback);
    }
    const val = localStorage.getItem(keyFor(baseKey, username));
    if (val === null) return fallback;
    const parsed = Number(JSON.parse(val));
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  function renderStats(username) {
    if (typeof ensureGame1DefaultsForUser === "function") {
      ensureGame1DefaultsForUser(username);
    }

    const bestScore = getNumber(GAME1_KEYS.BEST_SCORE, username, 0);
    const totalPoints = getNumber(GAME1_KEYS.TOTAL_POINTS, username, 0);
    const gamesPlayed = getNumber(GAME1_KEYS.GAMES_PLAYED, username, 0);
    const sessions = getNumber(GAME1_KEYS.SESSIONS, username, 0);

    setText("totalGamesPlayed", gamesPlayed);
    setText("totalScore", totalPoints);
    setText("totalSessions", sessions);

    setText("game1Played", sessions);
    setText("game1BestScore", bestScore === 0 ? "--" : bestScore);
    setText("game1GamesPlayed", gamesPlayed);
    setText("game1TotalScore", totalPoints);
  }

  function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = String(value);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const session = requireSession();
    if (!session) return;

    renderUser(session.username);
    renderStats(session.username);
    bindLogout();
  });
})();
