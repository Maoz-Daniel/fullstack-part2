/**
 * Leaderboard Module - PlayHub Gaming Portal
 * @file leaderboard.js
 * @description Displays sorted leaderboard rankings for all games.
 * @requires storage.js
 */

(function() {
    "use strict";

    // ============================================================================
    // DOM REFERENCES
    // ============================================================================

    const content1El = document.querySelector("#leaderboard1Content");
    const content2El = document.querySelector("#leaderboard2Content");

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    /**
     * Formats a timestamp to readable date string
     * @param {string} ts - ISO timestamp
     * @returns {string} Formatted date
     */
    function formatDate(ts) {
        if (!ts) return "--";
        const d = new Date(ts);
        return Number.isNaN(d.getTime()) ? "--" : `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    }

    /**
     * Renders empty state message
     * @param {HTMLElement} container - Container element
     * @param {string} message - Message to display
     */
    function renderEmptyState(container, message) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                </div>
                <p>${message}</p>
            </div>
        `;
    }

    /**
     * Creates a leaderboard row HTML
     * @param {Object} row - Row data
     * @param {number} rank - Rank number
     * @param {string} extraColumn - Extra column value (difficulty/attempts)
     * @returns {string} HTML string
     */
    function createRowHtml(row, rank, extraColumn) {
        return `
            <div class="leaderboard-row">
                <div class="rank">${rank}</div>
                <div class="player-info">
                    <div class="player-avatar">${row.username.charAt(0).toUpperCase()}</div>
                    <div class="player-name">${row.username}</div>
                </div>
                <div class="games">${row.score}</div>
                <div class="score">${extraColumn}</div>
                <div class="date">${formatDate(row.date)}</div>
            </div>
        `;
    }

    // ============================================================================
    // DATA COMPUTATION
    // ============================================================================

    /**
     * Computes Game 1 leaderboard rows
     * @returns {Array} Sorted rows
     */
    function computeGame1Rows() {
        const users = getAllUsers();
        const rows = [];

        users.forEach(u => {
            ensureGame1DefaultsForUser(u.username);
            getGame1RecentResultsForUser(u.username).forEach(result => {
                rows.push({
                    username: u.username,
                    score: result.score || 0,
                    date: result.date || result.timestamp || null,
                    difficulty: result.difficulty || "medium"
                });
            });
        });

        return rows.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (a.date && b.date) return new Date(b.date) - new Date(a.date);
            return a.username.localeCompare(b.username);
        });
    }

    /**
     * Computes Game 2 leaderboard rows
     * @returns {Array} Sorted rows
     */
    function computeGame2Rows() {
        const users = getAllUsers();
        const rows = [];

        users.forEach(u => {
            ensureGame2DefaultsForUser(u.username);
            getGame2RecentResultsForUser(u.username).forEach(result => {
                rows.push({
                    username: u.username,
                    score: result.score || 0,
                    date: result.date || result.timestamp || null,
                    attempts: result.attempts || 6
                });
            });
        });

        return rows.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (a.attempts !== b.attempts) return a.attempts - b.attempts;
            if (a.date && b.date) return new Date(b.date) - new Date(a.date);
            return a.username.localeCompare(b.username);
        });
    }

    // ============================================================================
    // RENDERING
    // ============================================================================

    /**
     * Renders Game 1 leaderboard
     */
    function renderGame1Leaderboard() {
        if (!content1El) return;
        
        const rows = computeGame1Rows();
        if (rows.length === 0) {
            renderEmptyState(content1El, "No scores yet. Play Snake to appear here.");
            return;
        }

        content1El.innerHTML = rows
            .map((row, idx) => createRowHtml(row, idx + 1, row.difficulty))
            .join("");
    }

    /**
     * Renders Game 2 leaderboard
     */
    function renderGame2Leaderboard() {
        if (!content2El) return;
        
        const rows = computeGame2Rows();
        if (rows.length === 0) {
            renderEmptyState(content2El, "No scores yet. Play Wordle to appear here.");
            return;
        }

        content2El.innerHTML = rows
            .map((row, idx) => createRowHtml(row, idx + 1, row.attempts))
            .join("");
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    document.addEventListener("DOMContentLoaded", () => {
        renderGame1Leaderboard();
        renderGame2Leaderboard();
    });
})();
