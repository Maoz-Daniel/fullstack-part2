/**
 * Profile Module - PlayHub Gaming Portal
 * @file profile.js
 * @description Manages user profile, statistics display, and account settings.
 * @requires storage.js
 */

(function() {
    "use strict";

    // ============================================================================
    // DOM CACHE
    // ============================================================================

    let els = {};

    /**
     * Initializes DOM element references
     */
    function initElements() {
        els = {
            currentUsername: document.querySelector("#current-username"),
            avatar: document.querySelector("#avatar"),
            displayName: document.querySelector("#display-name"),
            memberSince: document.querySelector("#member-since"),
            totalSessions: document.querySelector("#total-sessions"),
            totalSessionsCard: document.querySelector("#totalSessionsCard"),
            bestGame1: document.querySelector("#best-game1"),
            sumGame1: document.querySelector("#sum-game1"),
            bestGame2: document.querySelector("#best-game2"),
            sumGame2: document.querySelector("#sum-game2"),
            gamesPlayed: document.querySelector("#games-played"),
            recentTbody: document.querySelector("#recent-tbody"),
            usernameInput: document.querySelector("#display-name-input"),
            saveBtn: document.querySelector("#save-display-name"),
            signOutBtn: document.querySelector("#sign-out"),
            resetBtn: document.querySelector("#reset-progress")
        };
    }

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    /**
     * Gets current username from session
     * @returns {string} Username or "Guest"
     */
    function currentUsername() {
        return getActiveUsername();
    }

    /**
     * Formats a timestamp to readable date
     * @param {string} ts - ISO timestamp
     * @returns {string} Formatted date
     */
    function formatDate(ts) {
        if (!ts) return "--";
        const d = new Date(ts);
        return Number.isNaN(d.getTime()) ? "--" : `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    }

    /**
     * Gets initials from a name
     * @param {string} name - Full name
     * @returns {string} Initials
     */
    function getInitials(name) {
        const trimmed = (name || "").trim();
        if (!trimmed) return "U";
        return trimmed.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || "").join("") || "U";
    }

    /**
     * Gets member since date for a user
     * @param {string} username - Username
     * @returns {string} ISO timestamp
     */
    function getMemberSince(username) {
        const key = `profile_memberSince_${username}`;
        let ts = localStorage.getItem(key);
        if (!ts) {
            ts = new Date().toISOString();
            localStorage.setItem(key, ts);
        }
        return ts;
    }

    /**
     * Shows a toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type: success, error, info
     */
    function showToast(message, type = "info") {
        const existing = document.querySelector(".toast-notification");
        if (existing) existing.remove();
        
        const toast = document.createElement("div");
        toast.className = `toast-notification toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add("show"), 10);
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ============================================================================
    // STATISTICS
    // ============================================================================

    /**
     * Loads all stats for a user
     * @param {string} username - Username
     * @returns {Object} Stats object
     */
    function loadStats(username) {
        const g1Best = getGame1NumberForUser(GAME1_LS_KEYS.BEST_SCORE, username, 0);
        const g1Total = getGame1NumberForUser(GAME1_LS_KEYS.TOTAL_POINTS, username, 0);
        const g1Played = getGame1NumberForUser(GAME1_LS_KEYS.GAMES_PLAYED, username, 0);
        const g1Sessions = getGame1NumberForUser(GAME1_LS_KEYS.SESSIONS, username, 0);

        const g2Best = getGame2NumberForUser(GAME2_LS_KEYS.BEST_SCORE, username, 0);
        const g2Total = getGame2NumberForUser(GAME2_LS_KEYS.TOTAL_POINTS, username, 0);
        const g2Played = getGame2NumberForUser(GAME2_LS_KEYS.GAMES_PLAYED, username, 0);
        const g2Sessions = getGame2NumberForUser(GAME2_LS_KEYS.SESSIONS, username, 0);

        const g1Recent = getGame1RecentResultsForUser(username);
        const g2Recent = getGame2RecentResultsForUser(username);
        
        const allRecent = [...g1Recent, ...g2Recent]
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
            .slice(0, 10);

        return {
            bestGame1: g1Best,
            totalGame1: g1Total,
            bestGame2: g2Best,
            totalGame2: g2Total,
            gamesPlayed: g1Played + g2Played,
            sessions: g1Sessions + g2Sessions,
            recent: allRecent
        };
    }

    // ============================================================================
    // RENDERING
    // ============================================================================

    /**
     * Renders the profile header
     * @param {string} username - Username
     */
    function renderHeader(username) {
        if (els.currentUsername) els.currentUsername.textContent = username;
        if (els.displayName) els.displayName.textContent = username;
        if (els.usernameInput) els.usernameInput.value = username;
        if (els.avatar) els.avatar.textContent = getInitials(username);
        if (els.memberSince) els.memberSince.textContent = formatDate(getMemberSince(username));
    }

    /**
     * Renders all statistics
     * @param {string} username - Username
     */
    function renderStats(username) {
        const stats = loadStats(username);
        
        if (els.bestGame1) els.bestGame1.textContent = stats.bestGame1;
        if (els.sumGame1) els.sumGame1.textContent = stats.totalGame1;
        if (els.bestGame2) els.bestGame2.textContent = stats.bestGame2;
        if (els.sumGame2) els.sumGame2.textContent = stats.totalGame2;
        if (els.gamesPlayed) els.gamesPlayed.textContent = stats.gamesPlayed;
        if (els.totalSessions) els.totalSessions.textContent = stats.sessions;
        if (els.totalSessionsCard) els.totalSessionsCard.textContent = stats.sessions;
        
        renderRecent(stats.recent);
    }

    /**
     * Renders recent games table
     * @param {Array} recent - Recent results
     */
    function renderRecent(recent) {
        if (!els.recentTbody) return;
        
        if (!recent || recent.length === 0) {
            els.recentTbody.innerHTML = '<tr><td colspan="4" class="muted">No games yet</td></tr>';
            return;
        }

        els.recentTbody.innerHTML = recent.map(r => `
            <tr>
                <td>${r.game || "Game"}</td>
                <td>${r.score ?? 0}</td>
                <td>${formatDate(r.date)}</td>
                <td>${r.difficulty || "--"}</td>
            </tr>
        `).join("");
    }

    // ============================================================================
    // USER ACTIONS
    // ============================================================================

    /**
     * Handles username change
     * @param {string} oldUsername - Current username
     */
    function onChangeUsername(oldUsername) {
        const newUsername = els.usernameInput?.value?.trim() || "";
        
        if (!newUsername) {
            showToast("Username cannot be empty.", "error");
            return;
        }
        
        const result = changeUsername(oldUsername, newUsername);
        
        if (result.success) {
            if (els.saveBtn) {
                els.saveBtn.textContent = "✓ Changed!";
                els.saveBtn.style.background = "#27ae60";
                setTimeout(() => {
                    els.saveBtn.textContent = "Change Username";
                    els.saveBtn.style.background = "";
                }, 2000);
            }
            showToast("Username changed! Refreshing...", "success");
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showToast(result.message, "error");
        }
    }

    /**
     * Handles sign out
     */
    function onSignOut() {
        clearCurrentSession();
        window.location.href = "login.html";
    }

    /**
     * Resets all progress for the current user
     */
    function resetProgress() {
        if (!confirm("This will reset ALL your saved game stats. Continue?")) return;
        
        const username = currentUsername();
        
        // Reset Game 1
        Object.values(GAME1_LS_KEYS).forEach(key => {
            const fullKey = `${key}_${username}`;
            const defaultVal = key.includes("RESULTS") ? [] : 
                               key.includes("DIFFICULTY") ? "medium" : 0;
            localStorage.setItem(fullKey, JSON.stringify(defaultVal));
        });
        
        // Reset Game 2
        Object.values(GAME2_LS_KEYS).forEach(key => {
            const fullKey = `${key}_${username}`;
            const defaultVal = key.includes("RESULTS") ? [] : 0;
            localStorage.setItem(fullKey, JSON.stringify(defaultVal));
        });
        
        renderStats(username);
        showToast("All progress has been reset.", "info");
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    document.addEventListener("DOMContentLoaded", () => {
        initElements();
        
        const username = currentUsername();
        if (username === "Guest") {
            window.location.href = "login.html";
            return;
        }
        
        ensureGame1DefaultsForUser(username);
        ensureGame2DefaultsForUser(username);
        
        renderHeader(username);
        renderStats(username);

        // Bind events
        els.saveBtn?.addEventListener("click", () => onChangeUsername(username));
        els.signOutBtn?.addEventListener("click", onSignOut);
        els.resetBtn?.addEventListener("click", resetProgress);
        els.usernameInput?.addEventListener("keypress", (e) => {
            if (e.key === "Enter") onChangeUsername(username);
        });
    });
})();
