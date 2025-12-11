// js/storage.js - LocalStorage management functions
// Purpose: Handle all data persistence operations

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