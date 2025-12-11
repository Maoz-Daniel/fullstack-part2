/* js/games.js
 * Dashboard interactions: session gate, logout, dark mode toggle, and basic stats.
 */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

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

  function renderStats(username) {
    if (typeof getUserScores !== "function") return;

    const scores = getUserScores(username);
    const totalScore = scores.reduce((sum, s) => sum + (Number(s.score) || 0), 0);
    const wordleScores = scores.filter((s) => s.game === "wordle");
    const memoryScores = scores.filter((s) => s.game === "memory");
    const wordleWins = wordleScores.filter((s) => s.won).length;
    const memoryBest = memoryScores.length
      ? Math.max(...memoryScores.map((s) => Number(s.score) || 0))
      : null;

    const user = typeof getUserByUsername === "function" ? getUserByUsername(username) : null;

    setText("totalGamesPlayed", scores.length);
    setText("totalScore", totalScore);
    setText("bestStreak", user?.bestStreak || 0);
    setText("memoryPlayed", memoryScores.length);
    setText("memoryBest", memoryBest === null ? "--" : memoryBest);
    setText("wordlePlayed", wordleScores.length);
    setText("wordleWins", wordleWins);
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
