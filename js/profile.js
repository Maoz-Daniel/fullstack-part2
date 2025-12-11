/* profile.js
 * Loads current user, shows stats and recent results,
 * supports editing display name, sign-out, and resetting progress.
 */

(function () {
  "use strict";

  const LS_KEYS = {
    USERS: "users", // array of {id, username, displayName, createdAt}
    CURRENT_USER_ID: "currentUserId",
    GAME_RESULTS: "gameResults" // array of {userId, gameId, score, difficulty, durationSec, timestamp}
  };

  // ------------- helpers -------------
  const $ = (s) => document.querySelector(s);

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEYS.USERS)) || [];
    } catch {
      return [];
    }
  }

  function saveUsers(arr) {
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(arr));
  }

  function getCurrentUserId() {
    return localStorage.getItem(LS_KEYS.CURRENT_USER_ID);
  }

  function setCurrentUserId(id) {
    localStorage.setItem(LS_KEYS.CURRENT_USER_ID, id);
  }

  function getResults() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEYS.GAME_RESULTS)) || [];
    } catch {
      return [];
    }
  }

  function saveResults(arr) {
    localStorage.setItem(LS_KEYS.GAME_RESULTS, JSON.stringify(arr));
  }

  function getCurrentUser() {
    const id = getCurrentUserId();
    if (!id) return null;
    return getUsers().find((u) => u.id === id) || null;
  }

  function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString();
  }

  // ------------- DOM refs -------------
  const currentUsernamePill = $("#current-username");
  const avatar = $("#avatar");
  const displayNameEl = $("#display-name");
  const memberSinceEl = $("#member-since");
  const totalSessionsEl = $("#total-sessions");
  const totalSessionsCardEl = $("#totalSessionsCard");

  const bestGame1El = $("#best-game1");
  const sumGame1El = $("#sum-game1");
  const gamesPlayedEl = $("#games-played");

  const recentTbody = $("#recent-tbody");

  const displayNameInput = $("#display-name-input");
  const saveDisplayBtn = $("#save-display-name");
  const signOutBtn = $("#sign-out");
  const resetBtn = $("#reset-progress");

  // ------------- logic -------------
  function ensureSignedIn() {
    const u = getCurrentUser();
    if (u) return true;

    // Fallback: honor app session from storage.js if present
    if (typeof getCurrentSession === "function") {
      const session = getCurrentSession();
      if (session?.username) {
        const users = getUsers();
        let existing = users.find((usr) => usr.id === session.username);
        if (!existing) {
          existing = {
            id: session.username,
            username: session.username,
            displayName: session.username,
            createdAt: Date.now()
          };
          users.push(existing);
          saveUsers(users);
        }
        setCurrentUserId(existing.id);
        return true;
      }
    }

    alert("Please sign in first.");
    window.location.href = "login.html";
    return false;
  }

  function initials(name) {
    const t = (name || "?").trim();
    if (!t) return "?";
    const parts = t.split(/\s+/).slice(0, 2);
    return parts.map((w) => w[0]?.toUpperCase() || "").join("") || "?";
  }

  function computeStatsFor(userId) {
    const results = getResults().filter((r) => r.userId === userId);
    const game1 = results.filter((r) => r.gameId === "game1");

    return {
      totalSessions: results.length,
      bestGame1: game1.length ? Math.max(...game1.map((r) => r.score)) : 0,
      sumGame1: game1.reduce((a, r) => a + r.score, 0),
      gamesPlayed: results.length,
      recent: results
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 10)
    };
  }

  function renderProfile() {
    const user = getCurrentUser();
    if (!user) return;

    // Header pill
    if (currentUsernamePill) {
      currentUsernamePill.textContent = user.username || user.displayName || "User";
    }

    // Avatar + name
    if (avatar) avatar.textContent = initials(user.displayName || user.username || "U");
    if (displayNameEl) displayNameEl.textContent = user.displayName || user.username || "User";
    if (displayNameInput) displayNameInput.value = user.displayName || "";

    // Member since
    const since = user.createdAt ? formatDate(user.createdAt) : "—";
    if (memberSinceEl) memberSinceEl.textContent = since;

    // Stats
    const s = computeStatsFor(user.id);
    if (totalSessionsEl) totalSessionsEl.textContent = String(s.totalSessions);
    if (totalSessionsCardEl) totalSessionsCardEl.textContent = String(s.totalSessions);
    if (bestGame1El) bestGame1El.textContent = String(s.bestGame1);
    if (sumGame1El) sumGame1El.textContent = String(s.sumGame1);
    if (gamesPlayedEl) gamesPlayedEl.textContent = String(s.gamesPlayed);

    // Recent table
    if (recentTbody) {
      recentTbody.innerHTML = "";
      if (s.recent.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 5;
        td.textContent = "No games yet";
        td.className = "muted";
        tr.appendChild(td);
        recentTbody.appendChild(tr);
      } else {
        for (const r of s.recent) {
          const tr = document.createElement("tr");
          const d = new Date(r.timestamp || Date.now());
          const dateTd = document.createElement("td");
          dateTd.textContent = d.toLocaleString();

          const gameTd = document.createElement("td");
          gameTd.textContent = r.gameId;

          const diffTd = document.createElement("td");
          diffTd.textContent = r.difficulty || "—";

          const scoreTd = document.createElement("td");
          scoreTd.textContent = String(r.score);

          const durTd = document.createElement("td");
          durTd.textContent = `${r.durationSec || 0}s`;

          tr.append(dateTd, gameTd, diffTd, scoreTd, durTd);
          recentTbody.appendChild(tr);
        }
      }
    }
  }

  function saveDisplayName() {
    const user = getCurrentUser();
    if (!user) return;
    const val = (displayNameInput?.value || "").trim();
    if (!val) {
      alert("Display name cannot be empty.");
      return;
    }
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], displayName: val };
      saveUsers(users);
      renderProfile();
      alert("Display name updated.");
    }
  }

  function signOut() {
    setCurrentUserId("");
    if (typeof clearCurrentSession === "function") {
      clearCurrentSession();
    }
    window.location.href = "login.html";
  }

  function resetProgress() {
    if (!confirm("This will delete ALL your local scores for ALL users on this device. Continue?")) {
      return;
    }
    // Only wipe results; keep users
    saveResults([]);
    renderProfile();
    alert("All local scores were deleted.");
  }

  // ------------- bootstrap -------------
  document.addEventListener("DOMContentLoaded", () => {
    if (!ensureSignedIn()) return;
    renderProfile();
  });

  saveDisplayBtn?.addEventListener("click", saveDisplayName);
  signOutBtn?.addEventListener("click", signOut);
  resetBtn?.addEventListener("click", resetProgress);
})();
