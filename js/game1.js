// Game 1 - Catch the Falling Objects
// Pure vanilla JavaScript, DOM-based game (No Classes)

// ========== LocalStorage Helper Functions ==========
function saveGame1Data(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

function loadGame1Data(key, fallback = null) {
    try {
        const data = localStorage.getItem(key);
        if (data === null) {
            if (fallback !== null && fallback !== undefined) {
                saveGame1Data(key, fallback);
                return fallback;
            }
            return fallback;
        }
        return JSON.parse(data);
    } catch (e) {
        console.error('Error loading from localStorage:', e);
        return fallback;
    }
}

const GAME1_KEYS = typeof GAME1_LS_KEYS !== 'undefined' ? GAME1_LS_KEYS : {
    BEST_SCORE: 'game1_bestScore',
    TOTAL_POINTS: 'game1_totalPoints',
    TOTAL_MISSES: 'game1_totalMisses',
    LAST_DIFFICULTY: 'game1_lastDifficulty',
    GAMES_PLAYED: 'game1_gamesPlayed',
    SESSIONS: 'game1_sessions',
    RECENT_RESULTS: 'game1_recentResults'
};

function resolveActiveUsername() {
    if (typeof getActiveUsername === 'function') {
        return getActiveUsername();
    }
    try {
        const sessionRaw = localStorage.getItem('gameHub_currentSession');
        if (sessionRaw) {
            const session = JSON.parse(sessionRaw);
            if (session && session.username) return session.username;
        }
    } catch (_) {
        /* ignore */
    }
    return 'Guest';
}

const activeUsername = resolveActiveUsername();

function game1Key(base) {
    if (typeof getGame1Key === 'function') {
        return getGame1Key(base, activeUsername);
    }
    return `${base}_${activeUsername}`;
}

function ensureGameDefaults() {
    if (typeof ensureGame1DefaultsForUser === 'function') {
        ensureGame1DefaultsForUser(activeUsername);
        return;
    }

    const defaults = {
        [game1Key(GAME1_KEYS.BEST_SCORE)]: 0,
        [game1Key(GAME1_KEYS.TOTAL_POINTS)]: 0,
        [game1Key(GAME1_KEYS.TOTAL_MISSES)]: 0,
        [game1Key(GAME1_KEYS.LAST_DIFFICULTY)]: 'medium',
        [game1Key(GAME1_KEYS.GAMES_PLAYED)]: 0,
        [game1Key(GAME1_KEYS.SESSIONS)]: 0,
        [game1Key(GAME1_KEYS.RECENT_RESULTS)]: []
    };

    Object.entries(defaults).forEach(([key, value]) => {
        if (localStorage.getItem(key) === null) {
            saveGame1Data(key, value);
        }
    });
}

function getNumberStat(key, fallback = 0) {
    const value = loadGame1Data(key, fallback);
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return fallback;
    return parsed;
}

function incrementStat(key, amount = 1) {
    const next = getNumberStat(key, 0) + amount;
    saveGame1Data(key, next);
    return next;
}

function getRecentResults() {
    const results = loadGame1Data(game1Key(GAME1_KEYS.RECENT_RESULTS), []);
    return Array.isArray(results) ? results : [];
}

function addRecentResult(result) {
    const updated = [result, ...getRecentResults()].slice(0, 5);
    saveGame1Data(game1Key(GAME1_KEYS.RECENT_RESULTS), updated);
}

// ========== Game Configuration ==========
const DIFFICULTY_SETTINGS = {
    easy: {
        fallSpeed: 3,
        maxObjects: 1,
        spawnInterval: 1200
    },
    medium: {
        fallSpeed: 5,
        maxObjects: 2,
        spawnInterval: 900
    },
    hard: {
        fallSpeed: 8,
        maxObjects: 3,
        spawnInterval: 650
    }
};

const GAME_CONFIG = {
    gameAreaWidth: 800,
    gameAreaHeight: 600,
    playerWidth: 80,
    playerHeight: 40,
    playerSpeed: 12,
    objectSize: 40,
    maxMisses: 10,
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']
};

// ========== Game State Object ==========
const gameState = {
    isRunning: false,
    isPaused: false,
    score: 0,
    missed: 0,
    difficulty: 'medium',
    playerX: 360,
    fallingObjects: [],
    keys: {},
    animationId: null,
    spawnIntervalId: null,
    lastDifficulty: loadGame1Data(game1Key(GAME1_KEYS.LAST_DIFFICULTY), 'medium'),
    sessionStarted: false
};

// ========== DOM Elements ==========
const elements = {
    difficultySelector: null,
    startBtn: null,
    countdownDisplay: null,
    countdownNumber: null,
    gameInfo: null,
    gameArea: null,
    player: null,
    scoreDisplay: null,
    missedDisplay: null,
    bestScoreDisplay: null,
    gameOverPanel: null,
    playAgainBtn: null,
    backGamesBtn: null
};

// ========== Falling Object Factory ==========
function createFallingObject(gameAreaWidth, objectSize, fallSpeed) {
    const obj = {
        x: Math.random() * (gameAreaWidth - objectSize),
        y: -objectSize,
        size: objectSize,
        speed: fallSpeed,
        color: GAME_CONFIG.colors[Math.floor(Math.random() * GAME_CONFIG.colors.length)],
        element: null
    };

    // Create DOM element
    obj.element = document.createElement('div');
    obj.element.className = 'falling-object';
    obj.element.style.left = obj.x + 'px';
    obj.element.style.top = obj.y + 'px';
    obj.element.style.backgroundColor = obj.color;

    return obj;
}

function updateFallingObject(obj) {
    obj.y += obj.speed;
    obj.element.style.top = obj.y + 'px';
}

function isObjectOutOfBounds(obj, gameAreaHeight) {
    return obj.y > gameAreaHeight;
}

function checkObjectCollision(obj, playerX, playerY, playerWidth, playerHeight) {
    return (
        obj.x < playerX + playerWidth &&
        obj.x + obj.size > playerX &&
        obj.y < playerY + playerHeight &&
        obj.y + obj.size > playerY
    );
}

function removeFallingObject(obj) {
    if (obj.element && obj.element.parentNode) {
        obj.element.parentNode.removeChild(obj.element);
    }
}

// ========== Game State Functions ==========
function resetGameState() {
    gameState.score = 0;
    gameState.missed = 0;
    gameState.playerX = (GAME_CONFIG.gameAreaWidth - GAME_CONFIG.playerWidth) / 2;
    gameState.fallingObjects = [];
    gameState.isRunning = false;
    gameState.isPaused = false;
    gameState.sessionStarted = false;
}

function getBestScore() {
    return getNumberStat(game1Key(GAME1_KEYS.BEST_SCORE), 0);
}

function updateBestScore() {
    const currentBest = getBestScore();
    if (gameState.score > currentBest) {
        saveGame1Data(game1Key(GAME1_KEYS.BEST_SCORE), gameState.score);
    }
}

function getTotalPoints() {
    return getNumberStat(game1Key(GAME1_KEYS.TOTAL_POINTS), 0);
}

function getTotalMisses() {
    return getNumberStat(game1Key(GAME1_KEYS.TOTAL_MISSES), 0);
}

function updateTotalStats() {
    const currentPoints = getTotalPoints();
    const currentMisses = getTotalMisses();
    saveGame1Data(game1Key(GAME1_KEYS.TOTAL_POINTS), currentPoints + gameState.score);
    saveGame1Data(game1Key(GAME1_KEYS.TOTAL_MISSES), currentMisses + gameState.missed);
}

function incrementGamesPlayed() {
    incrementStat(game1Key(GAME1_KEYS.GAMES_PLAYED), 1);
}

function incrementSessions() {
    incrementStat(game1Key(GAME1_KEYS.SESSIONS), 1);
}

function recordRecentResult() {
    const entry = {
        game: 'Game 1',
        score: gameState.score,
        date: new Date().toISOString(),
        difficulty: gameState.difficulty
    };
    addRecentResult(entry);
}

// ========== DOM Initialization ==========
function initElements() {
    elements.difficultySelector = document.getElementById('difficultySelector');
    elements.startBtn = document.getElementById('startBtn');
    elements.countdownDisplay = document.getElementById('countdownDisplay');
    elements.countdownNumber = document.getElementById('countdownNumber');
    elements.gameInfo = document.getElementById('gameInfo');
    elements.gameArea = document.getElementById('gameArea');
    elements.player = document.getElementById('player');
    elements.scoreDisplay = document.getElementById('scoreDisplay');
    elements.missedDisplay = document.getElementById('missedDisplay');
    elements.bestScoreDisplay = document.getElementById('bestScoreDisplay');
    elements.gameOverPanel = document.getElementById('gameOverPanel');
    elements.playAgainBtn = document.getElementById('playAgainBtn');
    elements.backGamesBtn = document.getElementById('backGamesBtn');
}

function initEventListeners() {
    // Difficulty buttons
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.difficulty = btn.dataset.difficulty;
        });
    });

    // Start button
    elements.startBtn.addEventListener('click', () => startGame());

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            gameState.keys[e.key] = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            gameState.keys[e.key] = false;
        }
    });

    // Game over buttons
    elements.playAgainBtn.addEventListener('click', () => restartGame());
    elements.backGamesBtn.addEventListener('click', () => {
        window.location.href = 'games.html';
    });
}

function loadLastDifficulty() {
    const lastDiff = gameState.lastDifficulty;
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.difficulty === lastDiff) {
            btn.classList.add('active');
            gameState.difficulty = lastDiff;
        }
    });
}

function updateBestScoreDisplay() {
    elements.bestScoreDisplay.textContent = getBestScore();
}

// ========== Game Flow Functions ==========
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function showCountdown() {
    elements.countdownDisplay.classList.add('active');
    
    for (let i = 3; i > 0; i--) {
        elements.countdownNumber.textContent = i;
        // Restart animation
        elements.countdownNumber.style.animation = 'none';
        setTimeout(() => {
            elements.countdownNumber.style.animation = 'countdown-pulse 1s ease-in-out';
        }, 10);
        await sleep(1000);
    }
    
    elements.countdownDisplay.classList.remove('active');
}

async function startGame() {
    if (gameState.isRunning) return;

    // Hide difficulty selector
    elements.difficultySelector.style.display = 'none';
    
    // Save selected difficulty
    saveGame1Data(game1Key(GAME1_KEYS.LAST_DIFFICULTY), gameState.difficulty);
    
    // Show countdown
    await showCountdown();
    
    // Initialize game
    resetGameState();
    gameState.sessionStarted = true;
    incrementGamesPlayed();
    gameState.isRunning = true;
    
    // Show game elements
    elements.gameInfo.classList.add('active');
    elements.gameArea.classList.add('active');
    
    // Update displays
    updateScore();
    updateMissed();
    
    // Reset player position
    updatePlayerPosition();
    
    // Start game loop
    gameLoop();
    
    // Start spawning objects
    startSpawning();
}

function startSpawning() {
    const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
    
    gameState.spawnIntervalId = setInterval(() => {
        if (gameState.isRunning && !gameState.isPaused) {
            if (gameState.fallingObjects.length < settings.maxObjects) {
                spawnObject();
            }
        }
    }, settings.spawnInterval);
}

function spawnObject() {
    const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
    const obj = createFallingObject(
        GAME_CONFIG.gameAreaWidth,
        GAME_CONFIG.objectSize,
        settings.fallSpeed
    );
    
    gameState.fallingObjects.push(obj);
    elements.gameArea.appendChild(obj.element);
}

// ========== Game Loop ==========
function gameLoop() {
    if (!gameState.isRunning) return;
    
    // Update player position
    handlePlayerMovement();
    
    // Update falling objects
    updateAllFallingObjects();
    
    // Continue loop
    gameState.animationId = requestAnimationFrame(() => gameLoop());
}

function handlePlayerMovement() {
    if (gameState.keys['ArrowLeft']) {
        gameState.playerX -= GAME_CONFIG.playerSpeed;
    }
    if (gameState.keys['ArrowRight']) {
        gameState.playerX += GAME_CONFIG.playerSpeed;
    }
    
    // Boundary checking
    gameState.playerX = Math.max(0, Math.min(
        gameState.playerX,
        GAME_CONFIG.gameAreaWidth - GAME_CONFIG.playerWidth
    ));
    
    updatePlayerPosition();
}

function updatePlayerPosition() {
    elements.player.style.left = gameState.playerX + 'px';
}

function updateAllFallingObjects() {
    const playerY = GAME_CONFIG.gameAreaHeight - GAME_CONFIG.playerHeight - 20;
    
    for (let i = gameState.fallingObjects.length - 1; i >= 0; i--) {
        const obj = gameState.fallingObjects[i];
        updateFallingObject(obj);
        
        // Check collision with player
        if (checkObjectCollision(
            obj,
            gameState.playerX,
            playerY,
            GAME_CONFIG.playerWidth,
            GAME_CONFIG.playerHeight
        )) {
            handleCatch(i);
            continue;
        }
        
        // Check if object is out of bounds
        if (isObjectOutOfBounds(obj, GAME_CONFIG.gameAreaHeight)) {
            handleMiss(i);
        }
    }
}

function handleCatch(index) {
    const obj = gameState.fallingObjects[index];
    removeFallingObject(obj);
    gameState.fallingObjects.splice(index, 1);
    
    gameState.score++;
    updateScore();
}

function handleMiss(index) {
    const obj = gameState.fallingObjects[index];
    removeFallingObject(obj);
    gameState.fallingObjects.splice(index, 1);
    
    gameState.missed++;
    updateMissed();
    
    // Check game over condition
    if (gameState.missed >= GAME_CONFIG.maxMisses) {
        endGame();
    }
}

function updateScore() {
    elements.scoreDisplay.textContent = gameState.score;
}

function updateMissed() {
    elements.missedDisplay.textContent = `${gameState.missed} / ${GAME_CONFIG.maxMisses}`;
}

// ========== Game End Functions ==========
function endGame() {
    gameState.isRunning = false;
    
    // Stop animation and spawning
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
    }
    if (gameState.spawnIntervalId) {
        clearInterval(gameState.spawnIntervalId);
    }
    
    // Clear remaining objects
    gameState.fallingObjects.forEach(obj => removeFallingObject(obj));
    gameState.fallingObjects = [];
    
    // Update statistics
    updateBestScore();
    updateTotalStats();
    if (gameState.sessionStarted) {
        incrementSessions();
        gameState.sessionStarted = false;
    }
    recordRecentResult();
    
    // Show game over panel
    showGameOver();
}

function showGameOver() {
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalBestScore').textContent = getBestScore();
    document.getElementById('totalCatches').textContent = getTotalPoints();
    document.getElementById('totalMisses').textContent = getTotalMisses();
    
    elements.gameOverPanel.classList.add('active');
}

function restartGame() {
    // Hide game over panel
    elements.gameOverPanel.classList.remove('active');
    
    // Hide game elements
    elements.gameInfo.classList.remove('active');
    elements.gameArea.classList.remove('active');
    
    // Show difficulty selector
    elements.difficultySelector.style.display = 'block';
    
    // Update best score display
    updateBestScoreDisplay();
    
    // Reset state
    resetGameState();
}

// ========== Initialize Game ==========
function initGame() {
    ensureGameDefaults();
    initElements();
    initEventListeners();
    loadLastDifficulty();
    updateBestScoreDisplay();
}

document.addEventListener('DOMContentLoaded', () => {
    initGame();
});
