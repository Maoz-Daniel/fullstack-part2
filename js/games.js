/**
 * Games Dashboard Module
 * @module games
 * @requires storage.js
 * @requires auth-guard.js
 */

(function() {
    "use strict";

    /**
     * Shorthand for getElementById
     * @param {string} id - Element ID
     * @returns {HTMLElement|null}
     */
    const $ = (id) => document.getElementById(id);

    /**
     * Sets text content of an element by ID
     * @param {string} id - Element ID
     * @param {*} value - Value to display
     */
    const setText = (id, value) => {
        const el = $(id);
        if (el) el.textContent = String(value);
    };

    /**
     * Renders user info in the header
     * @param {string} username - Current username
     */
    function renderUser(username) {
        const initial = username?.charAt(0)?.toUpperCase() || "U";
        setText("username", username);
        setText("welcomeUsername", username);
        const avatarEl = $("userAvatar");
        if (avatarEl) avatarEl.textContent = initial;
    }

    /**
     * Renders game statistics for both games
     * @param {string} username - Current username
     */
    function renderStats(username) {
        ensureGame1DefaultsForUser(username);
        ensureGame2DefaultsForUser(username);

        const g1Best = getGame1NumberForUser(GAME1_LS_KEYS.BEST_SCORE, username, 0);
        const g1Total = getGame1NumberForUser(GAME1_LS_KEYS.TOTAL_POINTS, username, 0);
        const g1Played = getGame1NumberForUser(GAME1_LS_KEYS.GAMES_PLAYED, username, 0);
        const g1Sessions = getGame1NumberForUser(GAME1_LS_KEYS.SESSIONS, username, 0);

        const g2Total = getGame2NumberForUser(GAME2_LS_KEYS.TOTAL_POINTS, username, 0);
        const g2Played = getGame2NumberForUser(GAME2_LS_KEYS.GAMES_PLAYED, username, 0);
        const g2Sessions = getGame2NumberForUser(GAME2_LS_KEYS.SESSIONS, username, 0);
        const g2Wins = getGame2NumberForUser(GAME2_LS_KEYS.WINS, username, 0);
        const g2BestStreak = getGame2NumberForUser(GAME2_LS_KEYS.BEST_STREAK, username, 0);

        setText("totalGamesPlayed", g1Played + g2Played);
        setText("totalScore", g1Total + g2Total);
        setText("totalSessions", g1Sessions + g2Sessions);

        setText("game1Played", g1Sessions);
        setText("game1BestScore", g1Best || "--");
        setText("game1GamesPlayed", g1Played);
        setText("game1TotalScore", g1Total);

        setText("wordlePlayed", g2Sessions);
        setText("wordleWins", g2Wins);
        const avgScore = g2Wins > 0 ? (g2Total / g2Wins).toFixed(1) : "--";
        setText("wordleAvgScore", avgScore);
        setText("wordleBestStreak", g2BestStreak);
    }

    // Initialize on DOM ready (auth handled by auth-guard.js)
    document.addEventListener("DOMContentLoaded", () => {
        const session = getCurrentSession();
        if (!session) return;
        renderUser(session.username);
        renderStats(session.username);
    });
})();



