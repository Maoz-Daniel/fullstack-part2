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

  function getGame2Number(baseKey, username, fallback = 0) {
    if (typeof getGame2NumberForUser === "function") {
      return getGame2NumberForUser(baseKey, username, fallback);
    }
    const GAME2_KEYS = window.GAME2_LS_KEYS || {};
    const keyName = baseKey || GAME2_KEYS.TOTAL_POINTS;
    const key = `${keyName}_${username}`;
    const val = localStorage.getItem(key);
    if (val === null) return fallback;
    const parsed = Number(JSON.parse(val));
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  function renderStats(username) {
    if (typeof ensureGame1DefaultsForUser === "function") {
      ensureGame1DefaultsForUser(username);
    }
    if (typeof ensureGame2DefaultsForUser === "function") {
      ensureGame2DefaultsForUser(username);
    }

    const GAME2_KEYS = window.GAME2_LS_KEYS || {
      TOTAL_POINTS: "game2_totalPoints",
      GAMES_PLAYED: "game2_gamesPlayed",
      SESSIONS: "game2_sessions"
    };

    const bestScore = getNumber(GAME1_KEYS.BEST_SCORE, username, 0);
    const game1TotalPoints = getNumber(GAME1_KEYS.TOTAL_POINTS, username, 0);
    const game1GamesPlayed = getNumber(GAME1_KEYS.GAMES_PLAYED, username, 0);
    const game1Sessions = getNumber(GAME1_KEYS.SESSIONS, username, 0);

    const game2TotalPoints = getGame2Number(GAME2_KEYS.TOTAL_POINTS, username, 0);
    const game2GamesPlayed = getGame2Number(GAME2_KEYS.GAMES_PLAYED, username, 0);
    const game2Sessions = getGame2Number(GAME2_KEYS.SESSIONS, username, 0);

    const totalGamesPlayed = game1GamesPlayed + game2GamesPlayed;
    const totalScore = game1TotalPoints + game2TotalPoints;
    const totalSessions = game1Sessions + game2Sessions;

    setText("totalGamesPlayed", totalGamesPlayed);
    setText("totalScore", totalScore);
    setText("totalSessions", totalSessions);

    setText("game1Played", game1Sessions);
    setText("game1BestScore", bestScore === 0 ? "--" : bestScore);
    setText("game1GamesPlayed", game1GamesPlayed);
    setText("game1TotalScore", game1TotalPoints);
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
