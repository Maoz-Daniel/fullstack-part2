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

  const contentEl = document.querySelector("#leaderboardContent");
  const headerTitleEl = document.querySelector("#leaderboardGameName");
  const refreshBtn = document.querySelector("#lb-refresh");

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

  function getLastPlayed(username) {
    const results = getRecent(username);
    if (!results.length) return null;
    return results[0].date || results[0].timestamp || null;
  }

  function ensureDefaults(username) {
    if (typeof ensureGame1DefaultsForUser === "function") {
      ensureGame1DefaultsForUser(username);
    }
  }

  function computeRows() {
    const users = typeof getAllUsers === "function" ? getAllUsers() : [];
    const rows = [];

    users.forEach((u) => {
      const username = u.username;
      ensureDefaults(username);
      const bestScore = getNumber(GAME1_KEYS.BEST_SCORE, username);
      const totalPoints = getNumber(GAME1_KEYS.TOTAL_POINTS, username);
      const lastPlayed = getLastPlayed(username);

      if (bestScore > 0 || totalPoints > 0 || lastPlayed) {
        rows.push({
          username,
          bestScore,
          totalPoints,
          lastPlayed
        });
      }
    });

    return rows.sort((a, b) => {
      if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return a.username.localeCompare(b.username);
    });
  }

  function renderLeaderboard() {
    if (!contentEl) return;
    const rows = computeRows();
    if (headerTitleEl) headerTitleEl.textContent = "Game 1 - Top Scores";

    if (rows.length === 0) {
      contentEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">*</div>
          <p>No scores yet. Play a game to appear here.</p>
        </div>
      `;
      return;
    }

    contentEl.innerHTML = rows.map((row, idx) => {
      const rank = idx + 1;
      return `
        <div class="leaderboard-row">
          <div class="rank">${rank}</div>
          <div class="player-info">
            <div class="player-avatar">${row.username.charAt(0).toUpperCase()}</div>
            <div class="player-name">${row.username}</div>
          </div>
          <div class="games">${row.bestScore}</div>
          <div class="score">${row.totalPoints}</div>
          <div class="date">${formatDate(row.lastPlayed)}</div>
        </div>
      `;
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", renderLeaderboard);
  refreshBtn?.addEventListener("click", renderLeaderboard);
})();
