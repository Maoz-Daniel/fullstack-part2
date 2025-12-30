/**
 * games Dashboard Module - FunZone Gaming Portal
 * @file games.js
 * @description handles the games dashboard with session validation and statistics.
 * @requires storage.js
 */

(function() {
    "use strict";

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    const $ = (id) => document.getElementById(id); // shorthand for getElementById
    const setText = (id, value) => {
        const el = $(id);
        if (el) el.textContent = String(value);
    };

    // ============================================================================
    // SESSION MANAGEMENT
    // ============================================================================

    /**
     * requires valid session, redirects to login if none
     * @returns {Object|null} session object or null
     */
    function requireSession() {
        const session = getCurrentSession();
        if (!session) {
            window.location.href = "login.html";
            return null;
        }
        return session;
    }

    // ============================================================================
    // UI RENDERING
    // ============================================================================

    /**
     * renders user information in header
     * @param {string} username - Username to display
     */
    function renderUser(username) {
        const initial = username?.charAt(0)?.toUpperCase() || "U";
        setText("username", username);
        setText("welcomeUsername", username);
        
        const avatarEl = $("userAvatar");
        if (avatarEl) avatarEl.textContent = initial;
    }

    /**
     * renders combined game statistics
     * @param {string} username - Username
     */
    function renderStats(username) {
        ensureGame1DefaultsForUser(username);
        ensureGame2DefaultsForUser(username);

        // game 1 stats
        const g1Best = getGame1NumberForUser(GAME1_LS_KEYS.BEST_SCORE, username, 0);
        const g1Total = getGame1NumberForUser(GAME1_LS_KEYS.TOTAL_POINTS, username, 0);
        const g1Played = getGame1NumberForUser(GAME1_LS_KEYS.GAMES_PLAYED, username, 0);
        const g1Sessions = getGame1NumberForUser(GAME1_LS_KEYS.SESSIONS, username, 0);

        // game 2 stats
        const g2Total = getGame2NumberForUser(GAME2_LS_KEYS.TOTAL_POINTS, username, 0);
        const g2Played = getGame2NumberForUser(GAME2_LS_KEYS.GAMES_PLAYED, username, 0);
        const g2Sessions = getGame2NumberForUser(GAME2_LS_KEYS.SESSIONS, username, 0);
        const g2Wins = getGame2NumberForUser(GAME2_LS_KEYS.WINS, username, 0);
        const g2BestStreak = getGame2NumberForUser(GAME2_LS_KEYS.BEST_STREAK, username, 0);

        // combined totals
        setText("totalGamesPlayed", g1Played + g2Played);
        setText("totalScore", g1Total + g2Total);
        setText("totalSessions", g1Sessions + g2Sessions);

        // game 1 specific
        setText("game1Played", g1Sessions);
        setText("game1BestScore", g1Best || "--");
        setText("game1GamesPlayed", g1Played);
        setText("game1TotalScore", g1Total);

        // game 2 specific
        setText("wordlePlayed", g2Sessions);
        setText("wordleWins", g2Wins);
        const avgScore = g2Wins > 0 ? (g2Total / g2Wins).toFixed(1) : "--";
        setText("wordleAvgScore", avgScore);
        setText("wordleBestStreak", g2BestStreak);
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    document.addEventListener("DOMContentLoaded", () => {
        const session = requireSession();
        if (!session) return;

        renderUser(session.username);
        renderStats(session.username);
        
        // Note: Logout button is now handled by navbar-loader.js
    });
})();



