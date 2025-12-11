/* game1.js
 * "Target Pop" mini-game:
 * - Click the moving target to score points within a time limit.
 * - Difficulties change speed/size.
 * - Results are persisted to localStorage, attached to the current user.
 * No external libs. Pure DOM + localStorage.
 */

(function () {
  "use strict";

  // ------- Storage helpers -------
  const LS_KEYS = {
    CURRENT_USER_ID: "currentUserId",
    GAME_RESULTS: "gameResults" // array of {userId, gameId, score, difficulty, durationSec, timestamp}
  };

  function getCurrentUserId() {
    return localStorage.getItem(LS_KEYS.CURRENT_USER_ID);
  }

  function getResults() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEYS.GAME_RESULTS)) || [];
    } catch {
      return [];
    }
  }

  function saveResults(results) {
    localStorage.setItem(LS_KEYS.GAME_RESULTS, JSON.stringify(results));
  }

  function saveGameResult({ userId, gameId, score, difficulty, durationSec }) {
    const arr = getResults();
    arr.push({
      userId,
      gameId,
      score,
      difficulty,
      durationSec,
      timestamp: Date.now()
    });
    saveResults(arr);
  }

  // ------- DOM refs -------
  const $ = (sel) => document.querySelector(sel);
  const gameArea = $("#game-area");
  const target = $("#target");
  const startBtn = $("#start-btn");
  const stopBtn = $("#stop-btn");
  const difficultySel = $("#difficulty");
  const timeSel = $("#game-seconds");
  const scoreEl = $("#score");
  const timerEl = $("#timer");
  const statusEl = $("#status");

  // ------- State -------
  let score = 0;
  let isRunning = false;
  let moveInterval = null;
  let countdownInterval = null;
  let remaining = 0;

  // Difficulty profile
  const DIFF = {
    easy:   { moveMs: 900, size: 80 },
    medium: { moveMs: 600, size: 60 },
    hard:   { moveMs: 380, size: 40 },
  };

  function pickDiff() {
    const key = (difficultySel?.value || "medium").toLowerCase();
    return DIFF[key] || DIFF.medium;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function moveTarget() {
    if (!gameArea || !target) return;

    const rect = gameArea.getBoundingClientRect();
    const d = pickDiff();
    const size = d.size;

    // compute random position within the game area
    const maxLeft = rect.width  - size;
    const maxTop  = rect.height - size;

    const left = clamp(randomInt(0, Math.floor(maxLeft)), 0, maxLeft);
    const top  = clamp(randomInt(0, Math.floor(maxTop)),  0, maxTop);

    target.style.width = size + "px";
    target.style.height = size + "px";
    target.style.transform = `translate(${left}px, ${top}px)`;
  }

  function setRunning(on) {
    isRunning = on;
    if (startBtn) startBtn.disabled = on;
    if (stopBtn) stopBtn.disabled = !on;
    if (difficultySel) difficultySel.disabled = on;
    if (timeSel) timeSel.disabled = on;
    if (statusEl) statusEl.textContent = on ? "Game is running…" : "Idle";
  }

  function reset() {
    score = 0;
    if (scoreEl) scoreEl.textContent = "0";
    if (timerEl) timerEl.textContent = "0";
    clearInterval(moveInterval);
    clearInterval(countdownInterval);
    moveInterval = null;
    countdownInterval = null;
    setRunning(false);
  }

  function startGame() {
    const userId = getCurrentUserId();
    if (!userId) {
      alert("Please sign in first.");
      return;
    }

    reset();
    setRunning(true);

    const gameSeconds = parseInt(timeSel?.value || "30", 10);
    remaining = Number.isFinite(gameSeconds) && gameSeconds > 0 ? gameSeconds : 30;
    if (timerEl) timerEl.textContent = String(remaining);

    // Start movement timer
    const d = pickDiff();
    moveTarget();
    moveInterval = setInterval(moveTarget, d.moveMs);

    // Countdown
    countdownInterval = setInterval(() => {
      remaining -= 1;
      if (timerEl) timerEl.textContent = String(remaining);
      if (remaining <= 0) {
        endGame();
      }
    }, 1000);
  }

  function endGame() {
    const userId = getCurrentUserId();
    if (!userId) {
      reset();
      return;
    }
    clearInterval(moveInterval);
    clearInterval(countdownInterval);
    moveInterval = null;
    countdownInterval = null;

    // Persist result
    const difficulty = (difficultySel?.value || "medium").toLowerCase();
    const durationSec = parseInt(timeSel?.value || "30", 10) || 30;
    saveGameResult({
      userId,
      gameId: "game1",
      score,
      difficulty,
      durationSec
    });

    setRunning(false);
    alert(`Time! Your score: ${score}`);
  }

  function onHit() {
    if (!isRunning) return;
    score += 1;
    if (scoreEl) scoreEl.textContent = String(score);
    // Move immediately after a successful hit
    moveTarget();
  }

  // ------- Wire events -------
  startBtn?.addEventListener("click", startGame);
  stopBtn?.addEventListener("click", endGame);
  target?.addEventListener("click", onHit);

  // Safety on unload
  window.addEventListener("beforeunload", () => {
    clearInterval(moveInterval);
    clearInterval(countdownInterval);
  });
})();
