/* profile.js
 * Renders the profile page with Game 1 statistics from localStorage.
 * Stats are kept in the shared GAME1_LS_KEYS map so every page uses the same keys.
 */

(function () {
  "use strict";

  const GAME1_KEYS = window.GAME1_LS_KEYS || {
    BEST_SCORE: "game1_bestScore",
    TOTAL_POINTS: "game1_totalPoints",
    TOTAL_MISSES: "game1_totalMisses",
    LAST_DIFFICULTY: "game1_lastDifficulty",
    GAMES_PLAYED: "game1_gamesPlayed",
    SESSIONS: "game1_sessions",
    RECENT_RESULTS: "game1_recentResults"
  };

  const els = {
    currentUsername: document.querySelector("#current-username"),
    avatar: document.querySelector("#avatar"),
    displayName: document.querySelector("#display-name"),
    memberSince: document.querySelector("#member-since"),
    totalSessions: document.querySelector("#total-sessions"),
    totalSessionsCard: document.querySelector("#totalSessionsCard"),
    bestGame1: document.querySelector("#best-game1"),
    sumGame1: document.querySelector("#sum-game1"),
    gamesPlayed: document.querySelector("#games-played"),
    recentTbody: document.querySelector("#recent-tbody"),
    displayNameInput: document.querySelector("#display-name-input"),
    saveDisplayBtn: document.querySelector("#save-display-name"),
    signOutBtn: document.querySelector("#sign-out"),
    resetBtn: document.querySelector("#reset-progress")
  };

  function currentUsername() {
    if (typeof getActiveUsername === "function") {
      return getActiveUsername();
    }
    try {
      const raw = localStorage.getItem("gameHub_currentSession");
      if (raw) {
        const session = JSON.parse(raw);
        if (session?.username) return session.username;
      }
    } catch {
      /* ignore */
    }
    return "Guest";
  }

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

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function keyFor(baseKey, username) {
    if (typeof getGame1Key === "function") {
      return getGame1Key(baseKey, username);
    }
    return `${baseKey}_${username}`;
  }

  function ensureGameDefaults(username) {
    if (typeof ensureGame1DefaultsForUser === "function") {
      ensureGame1DefaultsForUser(username);
      return;
    }

    const defaults = {
      [keyFor(GAME1_KEYS.BEST_SCORE, username)]: 0,
      [keyFor(GAME1_KEYS.TOTAL_POINTS, username)]: 0,
      [keyFor(GAME1_KEYS.TOTAL_MISSES, username)]: 0,
      [keyFor(GAME1_KEYS.LAST_DIFFICULTY, username)]: "medium",
      [keyFor(GAME1_KEYS.GAMES_PLAYED, username)]: 0,
      [keyFor(GAME1_KEYS.SESSIONS, username)]: 0,
      [keyFor(GAME1_KEYS.RECENT_RESULTS, username)]: []
    };

    Object.entries(defaults).forEach(([key, value]) => {
      if (localStorage.getItem(key) === null) {
        writeJson(key, value);
      }
    });
  }

  function getNumber(key, fallback = 0) {
    const val = readJson(key, fallback);
    const num = Number(val);
    return Number.isNaN(num) ? fallback : num;
  }

  function getRecentResults(username) {
    const results = readJson(keyFor(GAME1_KEYS.RECENT_RESULTS, username), []);
    return Array.isArray(results) ? results.slice(0, 5) : [];
  }

  function formatDate(ts) {
    if (!ts) return "--";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "--";
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  }

  function getDisplayName(username) {
    const key = `profile_displayName_${username}`;
    return localStorage.getItem(key) || username || "Guest";
  }

  function setDisplayName(username, value) {
    const key = `profile_displayName_${username}`;
    localStorage.setItem(key, value);
  }

  function getMemberSince(username) {
    const key = `profile_memberSince_${username}`;
    let ts = localStorage.getItem(key);
    if (!ts) {
      ts = new Date().toISOString();
      localStorage.setItem(key, ts);
    }
    return ts;
  }

  function initials(name) {
    const trimmed = (name || "").trim();
    if (!trimmed) return "U";
    return trimmed
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || "")
      .join("") || "U";
  }

  function loadStats(username) {
    return {
      bestScore: getNumber(keyFor(GAME1_KEYS.BEST_SCORE, username), 0),
      totalPoints: getNumber(keyFor(GAME1_KEYS.TOTAL_POINTS, username), 0),
      gamesPlayed: getNumber(keyFor(GAME1_KEYS.GAMES_PLAYED, username), 0),
      sessions: getNumber(keyFor(GAME1_KEYS.SESSIONS, username), 0),
      recent: getRecentResults(username)
    };
  }

  function renderHeader(username, displayName) {
    if (els.currentUsername) els.currentUsername.textContent = username;
    if (els.displayName) els.displayName.textContent = displayName;
    if (els.displayNameInput) els.displayNameInput.value = displayName;
    if (els.avatar) els.avatar.textContent = initials(displayName);
    if (els.memberSince) els.memberSince.textContent = formatDate(getMemberSince(username));
  }

  function renderStats(username) {
    const stats = loadStats(username);
    if (els.bestGame1) els.bestGame1.textContent = String(stats.bestScore);
    if (els.sumGame1) els.sumGame1.textContent = String(stats.totalPoints);
    if (els.gamesPlayed) els.gamesPlayed.textContent = String(stats.gamesPlayed);
    if (els.totalSessions) els.totalSessions.textContent = String(stats.sessions);
    if (els.totalSessionsCard) els.totalSessionsCard.textContent = String(stats.sessions);
    renderRecent(stats.recent);
  }

  function renderRecent(recent) {
    if (!els.recentTbody) return;
    els.recentTbody.innerHTML = "";

    if (!recent || recent.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.textContent = "No games yet";
      td.className = "muted";
      tr.appendChild(td);
      els.recentTbody.appendChild(tr);
      return;
    }

    recent.slice(0, 5).forEach((r) => {
      const tr = document.createElement("tr");

      const gameTd = document.createElement("td");
      gameTd.textContent = r.game || "Game 1";

      const scoreTd = document.createElement("td");
      scoreTd.textContent = String(r.score ?? 0);

      const dateTd = document.createElement("td");
      dateTd.textContent = formatDate(r.date);

      const diffTd = document.createElement("td");
      diffTd.textContent = r.difficulty || "medium";

      tr.append(gameTd, scoreTd, dateTd, diffTd);
      els.recentTbody.appendChild(tr);
    });
  }

  function onSaveDisplayName(username) {
    const value = (els.displayNameInput?.value || "").trim();
    if (!value) {
      alert("Display name cannot be empty.");
      return;
    }
    setDisplayName(username, value);
    renderHeader(username, value);
  }

  function onSignOut() {
    localStorage.removeItem("gameHub_currentSession");
    window.location.href = "login.html";
  }

  function resetProgress() {
    if (!confirm("This will reset your saved game stats on this device. Continue?")) {
      return;
    }
    const username = currentUsername();
    writeJson(keyFor(GAME1_KEYS.BEST_SCORE, username), 0);
    writeJson(keyFor(GAME1_KEYS.TOTAL_POINTS, username), 0);
    writeJson(keyFor(GAME1_KEYS.TOTAL_MISSES, username), 0);
    writeJson(keyFor(GAME1_KEYS.GAMES_PLAYED, username), 0);
    writeJson(keyFor(GAME1_KEYS.SESSIONS, username), 0);
    writeJson(keyFor(GAME1_KEYS.RECENT_RESULTS, username), []);
    renderStats(username);
    alert("Game stats cleared.");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const username = currentUsername();
    ensureGameDefaults(username);
    const displayName = getDisplayName(username);
    renderHeader(username, displayName);
    renderStats(username);

    els.saveDisplayBtn?.addEventListener("click", () => onSaveDisplayName(username));
    els.signOutBtn?.addEventListener("click", onSignOut);
    els.resetBtn?.addEventListener("click", resetProgress);
  });
})();
