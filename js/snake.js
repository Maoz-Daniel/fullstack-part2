/**
 * Snake Game Module
 * @module snake
 * @description Classic snake game with difficulty levels and score tracking
 * @requires storage.js
 * @requires auth-guard.js
 */

"use strict";

/** @constant {Object} Difficulty settings */

const DIFFICULTY = Object.freeze({
    easy: { speed: 150, wallsKill: false, multiplier: 1, label: "Easy" },
    medium: { speed: 100, wallsKill: true, multiplier: 2, label: "Medium" },
    hard: { speed: 70, wallsKill: true, multiplier: 3, label: "Hard" }
});

const CONFIG = Object.freeze({
    gridSize: 20,
    boardSize: 400,
    initialLength: 3
});

const DIRECTIONS = Object.freeze({
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
});

const OPPOSITES = Object.freeze({ up: "down", down: "up", left: "right", right: "left" });

// ============================================================================
// GAME STATE
// ============================================================================

const state = {
    running: false,
    paused: false,
    difficulty: "medium",
    snake: [],
    food: null,
    dir: "right",
    nextDir: "right",
    score: 0,
    loopId: null,
    sessionStarted: false,
    newRecord: false,
    cells: [] // 2D array for DOM cells
};

// ============================================================================
// DOM CACHE
// ============================================================================

let els = {}; 

function initElements() {
    els = {
        diffPanel: document.getElementById("difficultyPanel"), // difficulty selection panel
        startBtn: document.getElementById("startBtn"),
        countdown: document.getElementById("countdownDisplay"), // countdown overlay
        countNum: document.getElementById("countdownNumber"), // countdown number element
        gameInfo: document.getElementById("gameInfo"),
        wrapper: document.querySelector(".game-area-wrapper"),
        board: document.getElementById("gameBoard"),
        pauseOverlay: document.getElementById("pauseOverlay"),
        scoreEl: document.getElementById("scoreDisplay"),
        lengthEl: document.getElementById("lengthDisplay"),
        bestEl: document.getElementById("currentBestDisplay"),
        diffEl: document.getElementById("difficultyDisplay"),
        bestPanel: document.getElementById("bestScoreDisplay"),
        gameOver: document.getElementById("gameOverPanel"),
        playAgain: document.getElementById("playAgainBtn"),
        backBtn: document.getElementById("backGamesBtn")
    };
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

const username = getActiveUsername();

function gameKey(base) {
    return userKey(base, username);
}

function loadStat(key, fallback = 0) {
    const val = readJson(gameKey(key), fallback);
    const num = Number(val);
    return Number.isNaN(num) ? fallback : num;
}

function saveStat(key, value) {
    writeJson(gameKey(key), value);
}

function incrementStat(key, amount = 1) {
    const next = loadStat(key, 0) + amount;
    saveStat(key, next);
    return next;
}

function getRecent() { // recent game results
    const data = readJson(gameKey(GAME1_LS_KEYS.RECENT_RESULTS), []);
    return Array.isArray(data) ? data : [];
}

function addRecent(entry) { // add a recent game result
    const updated = [entry, ...getRecent()].slice(0, 5); // keep only last 5
    writeJson(gameKey(GAME1_LS_KEYS.RECENT_RESULTS), updated);
}

// ============================================================================
// GRID CREATION (DOM-based)
// ============================================================================

function createGrid() {
    const board = els.board;
    board.innerHTML = "";
    state.cells = [];
    
    board.style.width = "100%";
    board.style.maxWidth = `${CONFIG.boardSize}px`;
    board.style.gridTemplateColumns = `repeat(${CONFIG.gridSize}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${CONFIG.gridSize}, 1fr)`;
    
    for (let y = 0; y < CONFIG.gridSize; y++) {
        state.cells[y] = [];
        for (let x = 0; x < CONFIG.gridSize; x++) {
            const cell = document.createElement("div");
            cell.className = "grid-cell";
            board.appendChild(cell);
            state.cells[y][x] = cell;
        }
    }
}

// ============================================================================
// SNAKE & FOOD
// ============================================================================

function createSnake() {
    const snake = [];

    // start in center
    const startX = Math.floor(CONFIG.gridSize / 2);
    const startY = Math.floor(CONFIG.gridSize / 2);

    for (let i = 0; i < CONFIG.initialLength; i++) { 
        snake.push({ x: startX - i, y: startY }); // each node in same row, extending left
    }
    return snake;
}

function getEmptyCells() {
    const occupied = new Set(state.snake.map(s => `${s.x},${s.y}`));
    const empty = [];
    for (let y = 0; y < CONFIG.gridSize; y++) {
        for (let x = 0; x < CONFIG.gridSize; x++) {
            if (!occupied.has(`${x},${y}`)) empty.push({ x, y });
        }
    }
    return empty;
}

function spawnFood() { // place food in random position not occupied by snake
    const empty = getEmptyCells();
    if (empty.length === 0) {
        state.food = null;
        return false;
    }
    state.food = empty[Math.floor(Math.random() * empty.length)];
    return true;
}

function ensureFoodVisible() {
    if (!state.food) return spawnFood();
    // check if food is out of bounds or on invalid cell
    if (state.food.x < 0 || state.food.x >= CONFIG.gridSize ||
        state.food.y < 0 || state.food.y >= CONFIG.gridSize) {
        return spawnFood();
    }
    
    if (!state.cells[state.food.y]?.[state.food.x]) {
        return spawnFood();
    }
    
    return true;
}

function moveSnake() {
    const head = state.snake[0];
    const d = DIRECTIONS[state.nextDir];
    state.dir = state.nextDir;
    
    let newHead = { x: head.x + d.x, y: head.y + d.y }; // calculate new head position
    const settings = DIFFICULTY[state.difficulty];
    
    if (settings.wallsKill) {  //if the wall make you lose
        if (newHead.x < 0 || newHead.x >= CONFIG.gridSize ||
            newHead.y < 0 || newHead.y >= CONFIG.gridSize) { //if hits wall
            return false;
        }
    } else { // if walls don't kill
        // move to opposite side
        if (newHead.x < 0) newHead.x = CONFIG.gridSize - 1;
        if (newHead.x >= CONFIG.gridSize) newHead.x = 0;
        if (newHead.y < 0) newHead.y = CONFIG.gridSize - 1;
        if (newHead.y >= CONFIG.gridSize) newHead.y = 0;
    }
    
    // self collision - check new head against entire current snake body
    if (state.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        return false;
    }
    
    state.snake.unshift(newHead); // add new head to front of snake
    
    // if food eaten
    if (state.food && newHead.x === state.food.x && newHead.y === state.food.y) {
        state.score += settings.multiplier; // increase score
        updateDisplays(); 
        if (!spawnFood()) return false;
    } else {
        state.snake.pop(); // remove tail segment, beacuse we increased length only if food eaten (visually move snake)
    }
    
    return true;
}

// ============================================================================
// RENDERING (DOM-based)
// ============================================================================

function render() {
    // Clear all cells
    for (let y = 0; y < CONFIG.gridSize; y++) {
        for (let x = 0; x < CONFIG.gridSize; x++) {
            const cell = state.cells[y][x];
            cell.className = "grid-cell";
            cell.innerHTML = "";
        }
    }
    
    // Render food
    if (state.food && state.cells[state.food.y]?.[state.food.x]) { // ensure food position is valid
        const foodCell = state.cells[state.food.y][state.food.x];
        foodCell.classList.add("food");
    }
    
    // Render snake
    state.snake.forEach((seg, i) => {
        if (seg.y >= 0 && seg.y < CONFIG.gridSize && seg.x >= 0 && seg.x < CONFIG.gridSize) {
            const cell = state.cells[seg.y][seg.x];
            if (i === 0) {
                cell.classList.add("snake-head", `dir-${state.dir}`);
                // Add eyes
                cell.innerHTML = '<span class="eye left"></span><span class="eye right"></span>';
            } else {
                cell.classList.add("snake-body");
                if (i % 2 === 0) cell.classList.add("alt");
            }
        }
    });
}

// ============================================================================
// UI UPDATES
// ============================================================================

function updateDisplays() { 
    if (els.scoreEl) els.scoreEl.textContent = state.score; 
    if (els.lengthEl) els.lengthEl.textContent = state.snake.length;
    if (els.bestEl) els.bestEl.textContent = loadStat(GAME1_LS_KEYS.BEST_SCORE, 0);
}

function updateBestDisplay() {
    if (els.bestPanel) els.bestPanel.textContent = loadStat(GAME1_LS_KEYS.BEST_SCORE, 0);
}

function setDifficultyBadge(level) { // show label and color for current difficulty
    if (!els.diffEl) return;
    els.diffEl.textContent = DIFFICULTY[level]?.label || "Medium";
    els.diffEl.classList.remove("difficulty-easy", "difficulty-medium", "difficulty-hard");
    els.diffEl.classList.add(`difficulty-${level}`);
}

// ============================================================================
// GAME FLOW
// ============================================================================

function sleep(ms) { 
    return new Promise(r => setTimeout(r, ms)); 
}

async function showCountdown() {
    els.countdown.classList.add("active");
    for (let i = 3; i > 0; i--) {
        els.countNum.textContent = i;

        // this restarts the CSS animation for the countdown number, because just changing text doesn't retrigger it
        els.countNum.style.animation = "none";
        setTimeout(() => els.countNum.style.animation = "countdown-pulse 1s ease-in-out", 10); 
        await sleep(1000);
    }
    els.countdown.classList.remove("active");
}

async function startGame() {
    if (state.running) return;
    
    els.diffPanel.style.display = "none";
    saveStat(GAME1_LS_KEYS.LAST_DIFFICULTY, state.difficulty);
    
    await showCountdown();
    
    resetState();
    createGrid();
    state.sessionStarted = true;
    incrementStat(GAME1_LS_KEYS.GAMES_PLAYED);
    state.running = true;
    state.snake = createSnake();
    spawnFood();
    
    els.gameInfo.classList.add("active");
    els.wrapper.classList.add("active");
    setDifficultyBadge(state.difficulty);
    updateDisplays();
    render();
    
    state.loopId = setInterval(gameLoop, DIFFICULTY[state.difficulty].speed);
}

function gameLoop() {
    if (!state.running || state.paused) return;
    if (!ensureFoodVisible()) {
        endGame();
        return;
    }
    if (!moveSnake()) {
        endGame();
        return;
    }
    render();
}

function resetState() {
    state.score = 0;
    state.snake = [];
    state.food = null;
    state.dir = "right";
    state.nextDir = "right";
    state.running = false;
    state.paused = false;
    state.sessionStarted = false;
    state.newRecord = false;
    if (state.loopId) {
        clearInterval(state.loopId);
        state.loopId = null;
    }
}

function endGame() {
    state.running = false;
    if (state.loopId) {
        clearInterval(state.loopId);
        state.loopId = null;
    }
    
    // update stats
    const best = loadStat(GAME1_LS_KEYS.BEST_SCORE, 0);
    if (state.score > best) {
        saveStat(GAME1_LS_KEYS.BEST_SCORE, state.score);
        state.newRecord = true;
    }
    
    const total = loadStat(GAME1_LS_KEYS.TOTAL_POINTS, 0);
    saveStat(GAME1_LS_KEYS.TOTAL_POINTS, total + state.score);
    
    if (state.sessionStarted) {
        incrementStat(GAME1_LS_KEYS.SESSIONS);
        state.sessionStarted = false;
    }
    
    addRecent({ 
        game: "Snake",
        score: state.score,
        date: new Date().toISOString(),
        difficulty: state.difficulty
    });
    
    showGameOver();
}

function showGameOver() {
    // populate game over panel
    document.getElementById("finalScore").textContent = state.score;
    document.getElementById("finalLength").textContent = state.snake.length;
    document.getElementById("finalBestScore").textContent = loadStat(GAME1_LS_KEYS.BEST_SCORE, 0);
    document.getElementById("totalGames").textContent = loadStat(GAME1_LS_KEYS.GAMES_PLAYED, 0);
    
    const badge = document.getElementById("newRecordBadge");
    badge.style.display = state.newRecord ? "block" : "none";
    

    els.gameOver.classList.add("active");
}

function restartGame() {

    // reset and go back to difficulty selection
    els.gameOver.classList.remove("active");
    els.gameInfo.classList.remove("active");
    els.wrapper.classList.remove("active");
    els.pauseOverlay.classList.remove("active");
    els.diffPanel.style.display = "block";
    updateBestDisplay();
    resetState();
}

function togglePause() {
    state.paused = !state.paused;
    if (state.paused) {
        els.pauseOverlay.classList.add("active");
        clearInterval(state.loopId);
    } else {
        els.pauseOverlay.classList.remove("active");
        state.loopId = setInterval(gameLoop, DIFFICULTY[state.difficulty].speed);
    }
}

// ============================================================================
// INPUT HANDLING
// ============================================================================

function handleKeyDown(e) {
    const keyMap = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
        w: "up", W: "up", s: "down", S: "down", a: "left", A: "left", d: "right", D: "right"
    };
    
    if (keyMap[e.key]) { //if it's a direction key
        e.preventDefault(); // prevent scrolling
        changeDir(keyMap[e.key]); // change direction
    }
    
    if (e.key === " " && state.running) {
        e.preventDefault();
        togglePause();
    }
}

function changeDir(newDir) {
    if (!state.running || state.paused) return; 
    if (newDir !== OPPOSITES[state.dir]) { // prevent reversing into self
        state.nextDir = newDir;
    }
}

// ============================================================================
// EVENT BINDING
// ============================================================================

function initEvents() {
    //  listen for difficulty selection, if chosen, set active and update state
    document.querySelectorAll(".difficulty-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".difficulty-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.difficulty = btn.dataset.difficulty;
            setDifficultyBadge(state.difficulty);
        });
    });
    
    els.startBtn.addEventListener("click", startGame); 
    document.addEventListener("keydown", handleKeyDown); 
    els.playAgain.addEventListener("click", restartGame);
    els.backBtn.addEventListener("click", () => window.location.href = "games.html"); // back to games list
    
    // mobile controls
    // document.querySelectorAll(".mobile-btn").forEach(btn => {
    //     btn.addEventListener("click", () => {
    //         if (btn.dataset.direction) changeDir(btn.dataset.direction);
    //     });
    // });
}

function loadLastDifficulty() {
    const last = readJson(gameKey(GAME1_LS_KEYS.LAST_DIFFICULTY), "medium");
    document.querySelectorAll(".difficulty-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.dataset.difficulty === last) {
            btn.classList.add("active");
            state.difficulty = last;
        }
    });
}

/**
 * Initializes the Snake game (auth handled by auth-guard.js)
 */
function init() {
    if (!getCurrentSession()) return;
    ensureGame1DefaultsForUser(username);
    initElements();
    initEvents();
    loadLastDifficulty();
    updateBestDisplay();
    setDifficultyBadge(state.difficulty);
}

document.addEventListener("DOMContentLoaded", init);
