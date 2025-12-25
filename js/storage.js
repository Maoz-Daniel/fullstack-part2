/**
 * Storage Module - PlayHub Gaming Portal
 * @file storage.js
 * @description Central data persistence layer for the gaming portal.
 * Handles users, sessions, scores, and per-user game statistics.
 */

/* avoid eslint warnings */ 
"use strict"; 

// ============================================================================
// CONFIGURATION
// ============================================================================

/** Storage keys for Game 1 (Snake) */
const GAME1_LS_KEYS = Object.freeze({ 
    BEST_SCORE: "game1_bestScore",
    TOTAL_POINTS: "game1_totalPoints",
    TOTAL_MISSES: "game1_totalMisses",
    GAMES_PLAYED: "game1_gamesPlayed",
    SESSIONS: "game1_sessions",
    RECENT_RESULTS: "game1_recentResults",
    LAST_DIFFICULTY: "game1_lastDifficulty"
});

/** Storage keys for Game 2 (Wordle) */
const GAME2_LS_KEYS = Object.freeze({
    BEST_SCORE: "game2_bestScore",
    TOTAL_POINTS: "game2_totalPoints",
    GAMES_PLAYED: "game2_gamesPlayed",
    WINS: "game2_wins",
    SESSIONS: "game2_sessions",
    RECENT_RESULTS: "game2_recentResults",
    CURRENT_STREAK: "game2_currentStreak",
    BEST_STREAK: "game2_bestStreak"
});

/** Core storage keys */
const STORAGE_KEYS = Object.freeze({
    USERS: "gameHub_users",
    SESSIONS: "gameHub_sessions",
    SCORES: "gameHub_scores",
    CURRENT_SESSION: "gameHub_currentSession",
    DARK_MODE: "darkMode"
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely reads and parses JSON from localStorage
 * @param {string} key - Storage key
 * @param {*} fallback - Default value if key doesn't exist
 * @returns {*} Parsed value or fallback
 */
function readJson(key, fallback = null) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        const parsed = JSON.parse(raw);
        return parsed ?? fallback; // if parsed is null/undefined, return fallback
    } catch {
        return fallback;
    }
}

/**
 * Writes a value to localStorage as JSON
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
function writeJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value)); // parse to JSON
    } catch (e) {
        console.error("Storage write error:", e);
    }
}

/**
 * Creates a user-specific storage key
 * @param {string} baseKey - Base key name
 * @param {string} username - Username
 * @returns {string} User-specific key
 */
function userKey(baseKey, username) {
    return `${baseKey}_${username}`;
}

// Aliases for backward compatibility
const getGame1Key = userKey;
const getGame2Key = userKey;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initializes storage structure if not present
 */
function initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) { // if no users key then set it to empty array
        writeJson(STORAGE_KEYS.USERS, []); 
    }
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
        writeJson(STORAGE_KEYS.SESSIONS, []);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCORES)) {
        writeJson(STORAGE_KEYS.SCORES, []);
    }
}

/**
 * Ensures default Game 1 stats exist for a user
 * @param {string} username - Username
 */
function ensureGame1DefaultsForUser(username) {
    if (!username) return;
    
    const defaults = [
        { key: GAME1_LS_KEYS.BEST_SCORE, value: 0 },
        { key: GAME1_LS_KEYS.TOTAL_POINTS, value: 0 },
        { key: GAME1_LS_KEYS.TOTAL_MISSES, value: 0 },
        { key: GAME1_LS_KEYS.GAMES_PLAYED, value: 0 },
        { key: GAME1_LS_KEYS.SESSIONS, value: 0 },
        { key: GAME1_LS_KEYS.RECENT_RESULTS, value: [] },
        { key: GAME1_LS_KEYS.LAST_DIFFICULTY, value: "medium" }
    ];

    defaults.forEach(({ key, value }) => {
        const fullKey = userKey(key, username);
        if (localStorage.getItem(fullKey) === null) {
            writeJson(fullKey, value);
        }
    });
}

/**
 * Ensures default Game 2 stats exist for a user
 * @param {string} username - Username
 */
function ensureGame2DefaultsForUser(username) {
    if (!username) return;
    
    const defaults = [
        { key: GAME2_LS_KEYS.BEST_SCORE, value: 0 },
        { key: GAME2_LS_KEYS.TOTAL_POINTS, value: 0 },
        { key: GAME2_LS_KEYS.GAMES_PLAYED, value: 0 },
        { key: GAME2_LS_KEYS.WINS, value: 0 },
        { key: GAME2_LS_KEYS.SESSIONS, value: 0 },
        { key: GAME2_LS_KEYS.RECENT_RESULTS, value: [] },
        { key: GAME2_LS_KEYS.CURRENT_STREAK, value: 0 },
        { key: GAME2_LS_KEYS.BEST_STREAK, value: 0 }
    ];

    defaults.forEach(({ key, value }) => {
        const fullKey = userKey(key, username);
        if (localStorage.getItem(fullKey) === null) {
            writeJson(fullKey, value);
        }
    });
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Gets the currently active username
 * @returns {string} Username or "Guest"
 */
function getActiveUsername() {
    const session = getCurrentSession();
    return session?.username || "Guest";
}

/**
 * Creates a new session for a user (uses sessionStorage)
 * @param {string} username - Username
 * @returns {Object} Session object
 */
function createSession(username) {
    const session = {
        username,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    
    // Add to session history
    const sessions = getAllSessions();
    sessions.push(session);
    writeJson(STORAGE_KEYS.SESSIONS, sessions);
    
    return session;
}

/**
 * Gets the current active session
 * @returns {Object|null} Session or null if expired/none
 */
function getCurrentSession() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
        if (!raw) return null;
        
        const session = JSON.parse(raw);
        if (new Date() > new Date(session.expiresAt)) {
            clearCurrentSession();
            return null;
        }
        return session;
    } catch {
        return null;
    }
}

/**
 * Clears the current session
 */
function clearCurrentSession() {
    sessionStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
}

/**
 * Gets all session history
 * @returns {Array} Sessions array
 */
function getAllSessions() {
    return readJson(STORAGE_KEYS.SESSIONS, []);
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Gets all registered users
 * @returns {Array} Users array
 */
function getAllUsers() {
    return readJson(STORAGE_KEYS.USERS, []);
}

/**
 * Saves a new user
 * @param {Object} user - User object
 */
function saveUser(user) {
    const users = getAllUsers();
    users.push(user);
    writeJson(STORAGE_KEYS.USERS, users);
}

/**
 * Finds a user by username
 * @param {string} username - Username to find
 * @returns {Object|undefined} User or undefined
 */
function getUserByUsername(username) {
    return getAllUsers().find(u => u.username === username);
}

/**
 * updates a user's data
 * @param {string} username - username
 * @param {Object} updates - fields to update
 * @returns {boolean} success status
 */
function updateUser(username, updates) {
    const users = getAllUsers();
    const index = users.findIndex(u => u.username === username);
    if (index === -1) return false;
    
    users[index] = { ...users[index], ...updates }; // updates only specified fields
    writeJson(STORAGE_KEYS.USERS, users);
    return true;
}

/**
 * changes username across all stored data
 * @param {string} oldUsername  current username
 * @param {string} newUsername  new username
 * @returns {Object} result with success and message
 */
function changeUsername(oldUsername, newUsername) {
    newUsername = (newUsername || "").trim();
    
    if (!newUsername) {
        return { success: false, message: "username cannot be empty" };
    }
    if (newUsername.length < 3) {
        return { success: false, message: "username must be at least 3 characters" };
    }
    if (oldUsername === newUsername) {
        return { success: false, message: "new username is the same as current" };
    }
    if (getUserByUsername(newUsername)) {
        return { success: false, message: "username already taken" };
    }
    
    // Update users list
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.username === oldUsername);
    if (userIndex !== -1) {
        users[userIndex].username = newUsername;
        writeJson(STORAGE_KEYS.USERS, users);
    }
    
    // Update current session
    const session = getCurrentSession();
    if (session?.username === oldUsername) {
        session.username = newUsername;
        sessionStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    }
    
    // Update leaderboard scores
    const scores = getAllScores();
    let updated = false;
    scores.forEach(s => {
        if (s.username === oldUsername) {
            s.username = newUsername;
            updated = true;
        }
    });
    if (updated) writeJson(STORAGE_KEYS.SCORES, scores);
    
    // Update sessions history
    const sessions = getAllSessions();
    updated = false;
    sessions.forEach(s => {
        if (s.username === oldUsername) {
            s.username = newUsername;
            updated = true;
        }
    });
    if (updated) writeJson(STORAGE_KEYS.SESSIONS, sessions);
    
    // Migrate per-user keys
    const keysToMigrate = [
        ...Object.values(GAME1_LS_KEYS),
        ...Object.values(GAME2_LS_KEYS),
        "profile_displayName",
        "profile_memberSince"
    ];
    
    keysToMigrate.forEach(baseKey => {
        const oldKey = userKey(baseKey, oldUsername);
        const newKey = userKey(baseKey, newUsername);
        const value = localStorage.getItem(oldKey);
        if (value !== null) {
            localStorage.setItem(newKey, value);
            localStorage.removeItem(oldKey);
        }
    });
    
    return { success: true, message: "Username changed successfully" };
}

// ============================================================================
// SCORE MANAGEMENT
// ============================================================================

/**
 * Gets all scores
 * @returns {Array} Scores array
 */
function getAllScores() {
    return readJson(STORAGE_KEYS.SCORES, []);
}

/**
 * Saves a score entry
 * @param {Object} scoreData - Score data
 */
function saveScore(scoreData) {
    const scores = getAllScores();
    scores.push({ ...scoreData, timestamp: new Date().toISOString() });
    writeJson(STORAGE_KEYS.SCORES, scores);
}

/**
 * Gets scores for a specific user
 * @param {string} username - Username
 * @returns {Array} User's scores
 */
function getUserScores(username) {
    return getAllScores().filter(s => s.username === username);
}

/**
 * Gets top scores for a game
 * @param {string} gameName - Game name
 * @param {number} limit - Max results
 * @returns {Array} Top scores
 */
function getTopScores(gameName, limit = 10) {
    return getAllScores()
        .filter(s => s.game === gameName)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

// ============================================================================
// GAME STAT HELPERS
// ============================================================================

/**
 * Gets a numeric stat for Game 1
 * @param {string} baseKey - Key from GAME1_LS_KEYS
 * @param {string} username - Username
 * @param {number} fallback - Default value
 * @returns {number} Stat value
 */
function getGame1NumberForUser(baseKey, username, fallback = 0) {
    const val = readJson(userKey(baseKey, username), fallback);
    const num = Number(val);
    return Number.isNaN(num) ? fallback : num;
}

/**
 * Sets a numeric stat for Game 1
 * @param {string} baseKey - Key from GAME1_LS_KEYS
 * @param {string} username - Username
 * @param {number} value - Value to set
 */
function setGame1NumberForUser(baseKey, username, value) {
    writeJson(userKey(baseKey, username), value);
}

/**
 * Increments a numeric stat for Game 1
 * @param {string} baseKey - Key from GAME1_LS_KEYS
 * @param {string} username - Username
 * @param {number} amount - Amount to add
 * @returns {number} New value
 */
function incrementGame1NumberForUser(baseKey, username, amount = 1) {
    const current = getGame1NumberForUser(baseKey, username, 0);
    const next = current + amount;
    setGame1NumberForUser(baseKey, username, next);
    return next;
}

/**
 * Gets recent results for Game 1
 * @param {string} username - Username
 * @returns {Array} Recent results
 */
function getGame1RecentResultsForUser(username) {
    const results = readJson(userKey(GAME1_LS_KEYS.RECENT_RESULTS, username), []);
    return Array.isArray(results) ? results : [];
}

/**
 * Saves recent results for Game 1
 * @param {string} username - Username
 * @param {Array} results - Results array
 */
function saveGame1RecentResultsForUser(username, results) {
    writeJson(userKey(GAME1_LS_KEYS.RECENT_RESULTS, username), results);
}

/**
 * Gets a numeric stat for Game 2
 * @param {string} baseKey - Key from GAME2_LS_KEYS
 * @param {string} username - Username
 * @param {number} fallback - Default value
 * @returns {number} Stat value
 */
function getGame2NumberForUser(baseKey, username, fallback = 0) {
    const val = readJson(userKey(baseKey, username), fallback);
    const num = Number(val);
    return Number.isNaN(num) ? fallback : num;
}

/**
 * Sets a numeric stat for Game 2
 * @param {string} baseKey - Key from GAME2_LS_KEYS
 * @param {string} username - Username
 * @param {number} value - Value to set
 */
function setGame2NumberForUser(baseKey, username, value) {
    writeJson(userKey(baseKey, username), value);
}

/**
 * Increments a numeric stat for Game 2
 * @param {string} baseKey - Key from GAME2_LS_KEYS
 * @param {string} username - Username
 * @param {number} amount - Amount to add
 * @returns {number} New value
 */
function incrementGame2NumberForUser(baseKey, username, amount = 1) {
    const current = getGame2NumberForUser(baseKey, username, 0);
    const next = current + amount;
    setGame2NumberForUser(baseKey, username, next);
    return next;
}

/**
 * Gets recent results for Game 2
 * @param {string} username - Username
 * @returns {Array} Recent results
 */
function getGame2RecentResultsForUser(username) {
    const results = readJson(userKey(GAME2_LS_KEYS.RECENT_RESULTS, username), []);
    return Array.isArray(results) ? results : [];
}

/**
 * Saves recent results for Game 2
 * @param {string} username - Username
 * @param {Array} results - Results array
 */
function saveGame2RecentResultsForUser(username, results) {
    writeJson(userKey(GAME2_LS_KEYS.RECENT_RESULTS, username), results);
}

// ============================================================================
// AUTO-INITIALIZATION
// ============================================================================

initializeStorage();
const _bootstrapUser = getActiveUsername();
if (_bootstrapUser && _bootstrapUser !== "Guest") {
    ensureGame1DefaultsForUser(_bootstrapUser);
    ensureGame2DefaultsForUser(_bootstrapUser);
}
