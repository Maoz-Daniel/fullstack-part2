/**
 * Leaderboard Module - FunZone Gaming Portal
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
     * formats a timestamp to readable date string
     * @param {string} ts - ISO timestamp
     * @returns {string} formatted date
     */
    function formatDate(ts) {
        if (!ts) return "--";
        const d = new Date(ts);
        if (Number.isNaN(d.getTime())) return "--";
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    }

    /**
     * creates a color hue for an avatar
     * @param {string} value - string to hash
     * @returns {number} hue value
     */
    function avatarHue(value) {
        let hash = 0;
        for (let i = 0; i < value.length; i += 1) {
            hash = (hash * 31 + value.charCodeAt(i)) % 360;
        }
        return hash;
    }

    /**
     * renders a difficulty badge
     * @param {string} difficulty - difficulty label
     * @returns {string} HTML string
     */
    function renderDifficultyBadge(difficulty) {
        const label = difficulty || "--";
        const key = String(label).trim().toLowerCase();
        const badgeClass = ["easy", "medium", "hard"].includes(key)
            ? `difficulty-badge difficulty-${key}`
            : "difficulty-badge";
        return `<span class="${badgeClass}">${label}</span>`;
    }

    /**
     * renders empty state message
     * @param {HTMLElement} container - container element
     * @param {string} message - message to display
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
     * creates a leaderboard row HTML
     * @param {Object} row - row data
     * @param {number} rank - rank number
     * @param {string} extraColumn - extra column value (difficulty/attempts)
     * @returns {string} HTML string
     */
    function createRowHtml(row, rank, extraColumn, extraType) {
        const rankClass = rank === 1 ? "rank rank--1" :
            rank === 2 ? "rank rank--2" :
            rank === 3 ? "rank rank--3" : "rank";
        const avatarHueValue = avatarHue(row.username || "");
        const extraValue = extraType === "difficulty"
            ? renderDifficultyBadge(extraColumn)
            : `<span class="table-number">${extraColumn}</span>`;

        return `
            <div class="leaderboard-row">
                <div class="${rankClass}">${rank}</div>
                <div class="player-info">
                    <div class="player-avatar" style="--avatar-hue:${avatarHueValue}">${row.username.charAt(0).toUpperCase()}</div>
                    <div class="player-name">${row.username}</div>
                </div>
                <div class="games table-number">${row.score}</div>
                <div class="score">${extraValue}</div>
                <div class="date">${formatDate(row.date)}</div>
            </div>
        `;
    }

    // ============================================================================
    // DATA COMPUTATION
    // ============================================================================

    /**
     * compute game 1 leaderboard rows
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
     * compute game 2 leaderboard rows
     * @returns {Array} sorted rows
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

    
    //renders game 1 leaderboard
    function renderGame1Leaderboard() {
        if (!content1El) return;
        
        const rows = computeGame1Rows();
        if (rows.length === 0) {
            renderEmptyState(content1El, "No scores yet. Play Snake to appear here.");
            return;
        }

        content1El.innerHTML = rows
            .map((row, idx) => createRowHtml(row, idx + 1, row.difficulty, "difficulty"))
            .join("");
    }

    
    //renders Wordle leaderboard
    function renderGame2Leaderboard() {
        if (!content2El) return;
        
        const rows = computeGame2Rows();
        if (rows.length === 0) {
            renderEmptyState(content2El, "No scores yet. Play Wordle to appear here.");
            return;
        }

        content2El.innerHTML = rows
            .map((row, idx) => createRowHtml(row, idx + 1, row.attempts, "attempts"))
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

