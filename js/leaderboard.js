/* leaderboard.js
 * Reads leaderboard_users from localStorage and renders rankings.
 */

(function () {
  "use strict";

  const GAME1_KEYS = window.GAME1_LS_KEYS || {
    BEST_SCORE: "game1_bestScore",
    TOTAL_POINTS: "game1_totalPoints",
    TOTAL_MISSES: "game1_totalMisses",
    GAMES_PLAYED: "game1_gamesPlayed",
    SESSIONS: "game1_sessions",
    RECENT_RESULTS: "game1_recentResults",
    LAST_DIFFICULTY: "game1_lastDifficulty"
  };

  const GAME2_KEYS = window.GAME2_LS_KEYS || {
    BEST_SCORE: "game2_bestScore",
    TOTAL_POINTS: "game2_totalPoints",
    GAMES_PLAYED: "game2_gamesPlayed",
    WINS: "game2_wins",
    SESSIONS: "game2_sessions",
    RECENT_RESULTS: "game2_recentResults",
    CURRENT_STREAK: "game2_currentStreak",
    BEST_STREAK: "game2_bestStreak"
  };

  const content1El = document.querySelector("#leaderboard1Content");
  const content2El = document.querySelector("#leaderboard2Content");

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }

  function formatDate(ts) {
    if (!ts) return "--";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "--";
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  }

  function keyFor(baseKey, username) {
    if (typeof getGame1Key === "function") return getGame1Key(baseKey, username);
    return `${baseKey}_${username}`;
  }

  function getNumber(baseKey, username) {
    if (typeof getGame1NumberForUser === "function") {
      return getGame1NumberForUser(baseKey, username, 0);
    }
    const raw = readJson(keyFor(baseKey, username), 0);
    const num = Number(raw);
    return Number.isNaN(num) ? 0 : num;
  }

  function getRecent(username) {
    if (typeof getGame1RecentResultsForUser === "function") {
      return getGame1RecentResultsForUser(username);
    }
    const data = readJson(keyFor(GAME1_KEYS.RECENT_RESULTS, username), []);
    return Array.isArray(data) ? data : [];
  }

  function keyForGame2(baseKey, username) {
    if (typeof getGame2Key === "function") return getGame2Key(baseKey, username);
    return `${baseKey}_${username}`;
  }

  function getRecentGame2(username) {
    if (typeof getGame2RecentResultsForUser === "function") {
      return getGame2RecentResultsForUser(username);
    }
    const data = readJson(keyForGame2(GAME2_KEYS.RECENT_RESULTS, username), []);
    return Array.isArray(data) ? data : [];
  }

  function getLastPlayed(username) {
    const results = getRecent(username);
    if (!results.length) return null;
    return results[0].date || results[0].timestamp || null;
  }

  function ensureDefaults(username) {
    if (typeof ensureGame1DefaultsForUser === "function") {
      ensureGame1DefaultsForUser(username);
    }
    if (typeof ensureGame2DefaultsForUser === "function") {
      ensureGame2DefaultsForUser(username);
    }
  }

  function computeGame1Rows() {
    const users = typeof getAllUsers === "function" ? getAllUsers() : [];
    const rows = [];

    // Collect all game sessions from all users
    users.forEach((u) => {
      const username = u.username;
      ensureDefaults(username);
      const recentResults = getRecent(username);

      // Add each game session as a separate row
      recentResults.forEach((result) => {
        rows.push({
          username,
          score: result.score || 0,
          date: result.date || result.timestamp || null,
          difficulty: result.difficulty || "medium"
        });
      });
    });

    // Sort by score descending (highest first)
    return rows.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Secondary sort by date (most recent first)
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return a.username.localeCompare(b.username);
    });
  }

  function computeGame2Rows() {
    const users = typeof getAllUsers === "function" ? getAllUsers() : [];
    const rows = [];

    // Collect all game sessions from all users
    users.forEach((u) => {
      const username = u.username;
      ensureDefaults(username);
      const recentResults = getRecentGame2(username);

      // Add each game session as a separate row
      recentResults.forEach((result) => {
        rows.push({
          username,
          score: result.score || 0,
          date: result.date || result.timestamp || null,
          attempts: result.attempts || 6
        });
      });
    });

    // Sort by score descending (highest first)
    return rows.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Secondary sort by attempts (fewer is better)
      if (a.attempts !== b.attempts) return a.attempts - b.attempts;
      // Tertiary sort by date (most recent first)
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return a.username.localeCompare(b.username);
    });
  }

  function renderGame1Leaderboard() {
    if (!content1El) return;
    const rows = computeGame1Rows();

    if (rows.length === 0) {
      content1El.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
          </div>
          <p>No scores yet. Play Game 1 to appear here.</p>
        </div>
      `;
      return;
    }

    content1El.innerHTML = rows.map((row, idx) => {
      const rank = idx + 1;
      return `
        <div class="leaderboard-row">
          <div class="rank">${rank}</div>
          <div class="player-info">
            <div class="player-avatar">${row.username.charAt(0).toUpperCase()}</div>
            <div class="player-name">${row.username}</div>
          </div>
          <div class="games">${row.score}</div>
          <div class="score">${row.difficulty}</div>
          <div class="date">${formatDate(row.date)}</div>
        </div>
      `;
    }).join("");
  }

  function renderGame2Leaderboard() {
    if (!content2El) return;
    const rows = computeGame2Rows();

    if (rows.length === 0) {
      content2El.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
          </div>
          <p>No scores yet. Play Game 2 to appear here.</p>
        </div>
      `;
      return;
    }

    content2El.innerHTML = rows.map((row, idx) => {
      const rank = idx + 1;
      return `
        <div class="leaderboard-row">
          <div class="rank">${rank}</div>
          <div class="player-info">
            <div class="player-avatar">${row.username.charAt(0).toUpperCase()}</div>
            <div class="player-name">${row.username}</div>
          </div>
          <div class="games">${row.score}</div>
          <div class="score">${row.attempts}</div>
          <div class="date">${formatDate(row.date)}</div>
        </div>
      `;
    }).join("");
  }

  function renderLeaderboard() {
    renderGame1Leaderboard();
    renderGame2Leaderboard();
  }

  document.addEventListener("DOMContentLoaded", renderLeaderboard);
})();
