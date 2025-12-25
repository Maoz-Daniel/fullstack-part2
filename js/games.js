/**
 * Games Dashboard Module - PlayHub Gaming Portal
 * @file games.js
 * @description Handles the games dashboard with session validation and statistics.
 * @requires storage.js
 */

(function() {
    "use strict";

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    const $ = (id) => document.getElementById(id);
    const setText = (id, value) => {
        const el = $(id);
        if (el) el.textContent = String(value);
    };

    // ============================================================================
    // SESSION MANAGEMENT
    // ============================================================================

    /**
     * Requires valid session, redirects to login if none
     * @returns {Object|null} Session object or null
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
     * Renders user information in header
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
     * Renders combined game statistics
     * @param {string} username - Username
     */
    function renderStats(username) {
        ensureGame1DefaultsForUser(username);
        ensureGame2DefaultsForUser(username);

        // Game 1 stats
        const g1Best = getGame1NumberForUser(GAME1_LS_KEYS.BEST_SCORE, username, 0);
        const g1Total = getGame1NumberForUser(GAME1_LS_KEYS.TOTAL_POINTS, username, 0);
        const g1Played = getGame1NumberForUser(GAME1_LS_KEYS.GAMES_PLAYED, username, 0);
        const g1Sessions = getGame1NumberForUser(GAME1_LS_KEYS.SESSIONS, username, 0);

        // Game 2 stats
        const g2Total = getGame2NumberForUser(GAME2_LS_KEYS.TOTAL_POINTS, username, 0);
        const g2Played = getGame2NumberForUser(GAME2_LS_KEYS.GAMES_PLAYED, username, 0);
        const g2Sessions = getGame2NumberForUser(GAME2_LS_KEYS.SESSIONS, username, 0);

        // Combined totals
        setText("totalGamesPlayed", g1Played + g2Played);
        setText("totalScore", g1Total + g2Total);
        setText("totalSessions", g1Sessions + g2Sessions);

        // Game 1 specific
        setText("game1Played", g1Sessions);
        setText("game1BestScore", g1Best || "--");
        setText("game1GamesPlayed", g1Played);
        setText("game1TotalScore", g1Total);
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
