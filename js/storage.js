// js/storage.js - LocalStorage management functions
// Purpose: Handle all data persistence operations

// Shared base keys for per-user Game 1 stats
const GAME1_LS_KEYS = {
    BEST_SCORE: 'game1_bestScore',
    TOTAL_POINTS: 'game1_totalPoints',
    TOTAL_MISSES: 'game1_totalMisses',
    GAMES_PLAYED: 'game1_gamesPlayed',
    SESSIONS: 'game1_sessions',
    RECENT_RESULTS: 'game1_recentResults',
    LAST_DIFFICULTY: 'game1_lastDifficulty'
};

// Shared base keys for per-user Game 2 (Wordle) stats
const GAME2_LS_KEYS = {
    BEST_SCORE: 'game2_bestScore',
    TOTAL_POINTS: 'game2_totalPoints',
    GAMES_PLAYED: 'game2_gamesPlayed',
    WINS: 'game2_wins',
    SESSIONS: 'game2_sessions',
    RECENT_RESULTS: 'game2_recentResults',
    CURRENT_STREAK: 'game2_currentStreak',
    BEST_STREAK: 'game2_bestStreak'
};

function getGame1Key(keyName, username) {
    return `${keyName}_${username}`;
}

function getGame2Key(keyName, username) {
    return `${keyName}_${username}`;
}

// Initialize storage structure if it doesn't exist
function initializeStorage() {
    if (!localStorage.getItem('gameHub_users')) {
        localStorage.setItem('gameHub_users', JSON.stringify([]));
    }
    if (!localStorage.getItem('gameHub_sessions')) {
        localStorage.setItem('gameHub_sessions', JSON.stringify([]));
    }
    if (!localStorage.getItem('gameHub_scores')) {
        localStorage.setItem('gameHub_scores', JSON.stringify([]));
    }
}

function ensureGame1DefaultsForUser(username) {
    if (!username) return;
    const defaults = [
        { base: GAME1_LS_KEYS.BEST_SCORE, fallback: 0 },
        { base: GAME1_LS_KEYS.TOTAL_POINTS, fallback: 0 },
        { base: GAME1_LS_KEYS.TOTAL_MISSES, fallback: 0 },
        { base: GAME1_LS_KEYS.GAMES_PLAYED, fallback: 0 },
        { base: GAME1_LS_KEYS.SESSIONS, fallback: 0 },
        { base: GAME1_LS_KEYS.RECENT_RESULTS, fallback: [] },
        { base: GAME1_LS_KEYS.LAST_DIFFICULTY, fallback: 'medium' }
    ];

    defaults.forEach(({ base, fallback }) => {
        const userKey = getGame1Key(base, username);
        if (localStorage.getItem(userKey) === null) {
            const legacy = localStorage.getItem(base);
            if (legacy !== null) {
                localStorage.setItem(userKey, legacy);
            } else {
                localStorage.setItem(userKey, JSON.stringify(fallback));
            }
        }
    });
}

function ensureGame2DefaultsForUser(username) {
    if (!username) return;
    const defaults = [
        { base: GAME2_LS_KEYS.BEST_SCORE, fallback: 0 },
        { base: GAME2_LS_KEYS.TOTAL_POINTS, fallback: 0 },
        { base: GAME2_LS_KEYS.GAMES_PLAYED, fallback: 0 },
        { base: GAME2_LS_KEYS.WINS, fallback: 0 },
        { base: GAME2_LS_KEYS.SESSIONS, fallback: 0 },
        { base: GAME2_LS_KEYS.RECENT_RESULTS, fallback: [] },
        { base: GAME2_LS_KEYS.CURRENT_STREAK, fallback: 0 },
        { base: GAME2_LS_KEYS.BEST_STREAK, fallback: 0 }
    ];

    defaults.forEach(({ base, fallback }) => {
        const userKey = getGame2Key(base, username);
        if (localStorage.getItem(userKey) === null) {
            localStorage.setItem(userKey, JSON.stringify(fallback));
        }
    });
}

function readJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        const parsed = JSON.parse(raw);
        return parsed === undefined ? fallback : parsed;
    } catch {
        return fallback;
    }
}

function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getActiveUsername() {
    try {
        if (typeof getCurrentSession === 'function') {
            const session = getCurrentSession();
            if (session?.username) return session.username;
        }
    } catch (_) {
        /* ignore */
    }
    return localStorage.getItem('currentUser') || 'Guest';
}

// Game 1 stat helpers (per user)
function getGame1NumberForUser(baseKey, username, fallback = 0) {
    const key = getGame1Key(baseKey, username);
    const val = readJson(key, fallback);
    const num = Number(val);
    if (Number.isNaN(num)) return fallback;
    return num;
}

function setGame1NumberForUser(baseKey, username, value) {
    const key = getGame1Key(baseKey, username);
    writeJson(key, value);
}

function incrementGame1NumberForUser(baseKey, username, amount = 1) {
    const current = getGame1NumberForUser(baseKey, username, 0);
    const next = current + amount;
    setGame1NumberForUser(baseKey, username, next);
    return next;
}

function getGame1RecentResultsForUser(username) {
    const key = getGame1Key(GAME1_LS_KEYS.RECENT_RESULTS, username);
    const results = readJson(key, []);
    return Array.isArray(results) ? results : [];
}

function saveGame1RecentResultsForUser(username, results) {
    const key = getGame1Key(GAME1_LS_KEYS.RECENT_RESULTS, username);
    writeJson(key, results);
}

// Game 2 stat helpers (per user)
function getGame2NumberForUser(baseKey, username, fallback = 0) {
    const key = getGame2Key(baseKey, username);
    const val = readJson(key, fallback);
    const num = Number(val);
    if (Number.isNaN(num)) return fallback;
    return num;
}

function setGame2NumberForUser(baseKey, username, value) {
    const key = getGame2Key(baseKey, username);
    writeJson(key, value);
}

function incrementGame2NumberForUser(baseKey, username, amount = 1) {
    const current = getGame2NumberForUser(baseKey, username, 0);
    const next = current + amount;
    setGame2NumberForUser(baseKey, username, next);
    return next;
}

function getGame2RecentResultsForUser(username) {
    const key = getGame2Key(GAME2_LS_KEYS.RECENT_RESULTS, username);
    const results = readJson(key, []);
    return Array.isArray(results) ? results : [];
}

function saveGame2RecentResultsForUser(username, results) {
    const key = getGame2Key(GAME2_LS_KEYS.RECENT_RESULTS, username);
    writeJson(key, results);
}

// User Management Functions
function getAllUsers() {
    const users = localStorage.getItem('gameHub_users');
    return users ? JSON.parse(users) : [];
}

function saveUser(user) {
    const users = getAllUsers();
    users.push(user);
    localStorage.setItem('gameHub_users', JSON.stringify(users));
}

function getUserByUsername(username) {
    const users = getAllUsers();
    return users.find(user => user.username === username);
}

function updateUser(username, updates) {
    const users = getAllUsers();
    const index = users.findIndex(user => user.username === username);
    if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        localStorage.setItem('gameHub_users', JSON.stringify(users));
        return true;
    }
    return false;
}

// Session Management Functions
function createSession(username) {
    const session = {
        username: username,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
    localStorage.setItem('gameHub_currentSession', JSON.stringify(session));
    
    // Add to sessions history
    const sessions = getAllSessions();
    sessions.push(session);
    localStorage.setItem('gameHub_sessions', JSON.stringify(sessions));
    
    return session;
}

function getCurrentSession() {
    const session = localStorage.getItem('gameHub_currentSession');
    if (!session) return null;
    
    const sessionData = JSON.parse(session);
    const now = new Date();
    const expiresAt = new Date(sessionData.expiresAt);
    
    if (now > expiresAt) {
        clearCurrentSession();
        return null;
    }
    
    return sessionData;
}

function clearCurrentSession() {
    localStorage.removeItem('gameHub_currentSession');
}

function getAllSessions() {
    const sessions = localStorage.getItem('gameHub_sessions');
    return sessions ? JSON.parse(sessions) : [];
}

// Score Management Functions
function saveScore(scoreData) {
    const scores = getAllScores();
    scores.push({
        ...scoreData,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('gameHub_scores', JSON.stringify(scores));
}

function getAllScores() {
    const scores = localStorage.getItem('gameHub_scores');
    return scores ? JSON.parse(scores) : [];
}

function getUserScores(username) {
    const scores = getAllScores();
    return scores.filter(score => score.username === username);
}

function getTopScores(gameName, limit = 10) {
    const scores = getAllScores();
    return scores
        .filter(score => score.game === gameName)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

// Initialize storage on load
initializeStorage();
const bootstrapUsername = getActiveUsername();
if (bootstrapUsername) {
    ensureGame1DefaultsForUser(bootstrapUsername);
    ensureGame2DefaultsForUser(bootstrapUsername);
}
