/* leaderboards.js
 * Aggregates results from localStorage across all users,
 * ranks them, and renders Top N tables.
 * Expects a table body with id="lb-tbody" and filter controls.
 */

(function () {
  "use strict";

  const LS_KEYS = {
    USERS: "users",             // array of {id, username, displayName, createdAt}
    GAME_RESULTS: "gameResults" // array of {userId, gameId, score, difficulty, durationSec, timestamp}
  };

  // ------- Data helpers -------
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEYS.USERS)) || [];
    } catch {
      return [];
    }
  }

  function getResults() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEYS.GAME_RESULTS)) || [];
    } catch {
      return [];
    }
  }

  function userMap() {
    const map = new Map();
    for (const u of getUsers()) map.set(u.id, u);
    return map;
  }

  // ------- DOM refs -------
  const $ = (s) => document.querySelector(s);
  const tbody = $("#lb-tbody");
  const gameSel = $("#lb-game");
  const difficultySel = $("#lb-difficulty");
  const sortSel = $("#lb-sort");
  const limitSel = $("#lb-limit");
  const refreshBtn = $("#lb-refresh");

  // ------- Logic -------
  function computeRows() {
    const all = getResults();
    const uMap = userMap();

    const game = (gameSel?.value || "game1").toLowerCase();
    const diff = (difficultySel?.value || "all").toLowerCase();
    const sortKey = (sortSel?.value || "best").toLowerCase();
    const limit = parseInt(limitSel?.value || "10", 10) || 10;

    // filter
    const filtered = all.filter(r => {
      if (r.gameId !== game) return false;
      if (diff !== "all" && (r.difficulty || "medium") !== diff) return false;
      return true;
    });

    // aggregate by user
    const agg = new Map();
    for (const r of filtered) {
      const cur = agg.get(r.userId) || { userId: r.userId, best: -Infinity, sum: 0, count: 0, lastTs: 0 };
      cur.best = Math.max(cur.best, r.score);
      cur.sum += r.score;
      cur.count += 1;
      cur.lastTs = Math.max(cur.lastTs, r.timestamp || 0);
      agg.set(r.userId, cur);
    }

    let rows = Array.from(agg.values()).map(a => {
      const u = uMap.get(a.userId);
      return {
        userId: a.userId,
        name: (u?.displayName || u?.username || "Unknown"),
        best: a.best === -Infinity ? 0 : a.best,
        sum: a.sum,
        count: a.count,
        lastTs: a.lastTs
      };
    });

    // sort
    if (sortKey === "best") {
      rows.sort((a, b) => b.best - a.best || b.sum - a.sum || b.count - a.count);
    } else if (sortKey === "sum") {
      rows.sort((a, b) => b.sum - a.sum || b.best - a.best);
    } else if (sortKey === "recent") {
      rows.sort((a, b) => b.lastTs - a.lastTs);
    }

    return rows.slice(0, limit);
  }

  function fmtDate(ts) {
    if (!ts) return "—";
    const d = new Date(ts);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  }

  function render() {
    if (!tbody) return;
    const rows = computeRows();
    tbody.innerHTML = "";

    if (rows.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.textContent = "No scores yet";
      td.className = "muted";
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    rows.forEach((r, idx) => {
      const tr = document.createElement("tr");

      const rankTd = document.createElement("td");
      rankTd.textContent = String(idx + 1);

      const nameTd = document.createElement("td");
      nameTd.textContent = r.name;

      const bestTd = document.createElement("td");
      bestTd.textContent = String(r.best);

      const sumTd = document.createElement("td");
      sumTd.textContent = String(r.sum);

      const lastTd = document.createElement("td");
      lastTd.textContent = fmtDate(r.lastTs);

      tr.append(rankTd, nameTd, bestTd, sumTd, lastTd);
      tbody.appendChild(tr);
    });
  }

  refreshBtn?.addEventListener("click", render);
  gameSel?.addEventListener("change", render);
  difficultySel?.addEventListener("change", render);
  sortSel?.addEventListener("change", render);
  limitSel?.addEventListener("change", render);

  document.addEventListener("DOMContentLoaded", render);
})();
