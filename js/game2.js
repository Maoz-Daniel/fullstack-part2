// js/game2.js - Wordle game logic
// Purpose: Handle word guessing, validation, keyboard input, and game state

// Word list for the game - 5-letter words
const wordList = [
    'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
    'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALLOW', 'ALONE', 'ALONG',
    'ALTER', 'AMONG', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE', 'APPLY', 'ARENA', 'ARGUE',
    'ARISE', 'ARRAY', 'ASIDE', 'ASSET', 'AUDIO', 'AVOID', 'AWARD', 'AWARE', 'BADLY', 'BAKER',
    'BASES', 'BASIC', 'BASIS', 'BEACH', 'BEGAN', 'BEGIN', 'BEGUN', 'BEING', 'BELOW', 'BENCH',
    'BILLY', 'BIRTH', 'BLACK', 'BLAME', 'BLIND', 'BLOCK', 'BLOOD', 'BOARD', 'BOOST', 'BOOTH',
    'BOUND', 'BRAIN', 'BRAND', 'BREAD', 'BREAK', 'BREED', 'BRIEF', 'BRING', 'BROAD', 'BROKE',
    'BROWN', 'BUILD', 'BUILT', 'BUYER', 'CABLE', 'CALIF', 'CARRY', 'CATCH', 'CAUSE', 'CHAIN',
    'CHAIR', 'CHART', 'CHASE', 'CHEAP', 'CHECK', 'CHEST', 'CHIEF', 'CHILD', 'CHINA', 'CHOSE',
    'CIVIL', 'CLAIM', 'CLASS', 'CLEAN', 'CLEAR', 'CLICK', 'CLOCK', 'CLOSE', 'COACH', 'COAST',
    'COULD', 'COUNT', 'COURT', 'COVER', 'CRAFT', 'CRASH', 'CREAM', 'CRIME', 'CROSS', 'CROWD',
    'CROWN', 'CRUDE', 'CYCLE', 'DAILY', 'DANCE', 'DATED', 'DEALT', 'DEATH', 'DEBUT', 'DELAY',
    'DEPTH', 'DOING', 'DOUBT', 'DOZEN', 'DRAFT', 'DRAMA', 'DRANK', 'DRAWN', 'DREAM', 'DRESS',
    'DRINK', 'DRIVE', 'DROVE', 'DYING', 'EAGER', 'EARLY', 'EARTH', 'EIGHT', 'ELITE', 'EMPTY',
    'ENEMY', 'ENJOY', 'ENTER', 'ENTRY', 'EQUAL', 'ERROR', 'EVENT', 'EVERY', 'EXACT', 'EXIST',
    'EXTRA', 'FAITH', 'FALSE', 'FAULT', 'FIBER', 'FIELD', 'FIFTH', 'FIFTY', 'FIGHT', 'FINAL',
    'FIRST', 'FIXED', 'FLASH', 'FLEET', 'FLOOR', 'FLUID', 'FOCUS', 'FORCE', 'FORTH', 'FORTY',
    'FORUM', 'FOUND', 'FRAME', 'FRANK', 'FRAUD', 'FRESH', 'FRONT', 'FRUIT', 'FULLY', 'FUNNY',
    'GIANT', 'GIVEN', 'GLASS', 'GLOBE', 'GOING', 'GRACE', 'GRADE', 'GRAND', 'GRANT', 'GRASS',
    'GREAT', 'GREEN', 'GROSS', 'GROUP', 'GROWN', 'GUARD', 'GUESS', 'GUEST', 'GUIDE', 'HAPPY',
    'HARRY', 'HEART', 'HEAVY', 'HENCE', 'HENRY', 'HORSE', 'HOTEL', 'HOUSE', 'HUMAN', 'IDEAL',
    'IMAGE', 'INDEX', 'INNER', 'INPUT', 'ISSUE', 'JAPAN', 'JIMMY', 'JOINT', 'JONES', 'JUDGE',
    'KNOWN', 'LABEL', 'LARGE', 'LASER', 'LATER', 'LAUGH', 'LAYER', 'LEARN', 'LEASE', 'LEAST',
    'LEAVE', 'LEGAL', 'LEMON', 'LEVEL', 'LEWIS', 'LIGHT', 'LIMIT', 'LINKS', 'LIVES', 'LOCAL',
    'LOGIC', 'LOOSE', 'LOWER', 'LUCKY', 'LUNCH', 'LYING', 'MAGIC', 'MAJOR', 'MAKER', 'MARCH',
    'MARIA', 'MATCH', 'MAYBE', 'MAYOR', 'MEANT', 'MEDIA', 'METAL', 'MIGHT', 'MINOR', 'MINUS',
    'MIXED', 'MODEL', 'MONEY', 'MONTH', 'MORAL', 'MOTOR', 'MOUNT', 'MOUSE', 'MOUTH', 'MOVIE',
    'MUSIC', 'NEEDS', 'NEVER', 'NEWLY', 'NIGHT', 'NOISE', 'NORTH', 'NOTED', 'NOVEL', 'NURSE',
    'OCCUR', 'OCEAN', 'OFFER', 'OFTEN', 'ORDER', 'OTHER', 'OUGHT', 'PAINT', 'PANEL', 'PAPER',
    'PARTY', 'PEACE', 'PETER', 'PHASE', 'PHONE', 'PHOTO', 'PIECE', 'PILOT', 'PITCH', 'PLACE',
    'PLAIN', 'PLANE', 'PLANT', 'PLATE', 'POINT', 'POUND', 'POWER', 'PRESS', 'PRICE', 'PRIDE',
    'PRIME', 'PRINT', 'PRIOR', 'PRIZE', 'PROOF', 'PROUD', 'PROVE', 'QUEEN', 'QUICK', 'QUIET',
    'QUITE', 'RADIO', 'RAISE', 'RANGE', 'RAPID', 'RATIO', 'REACH', 'READY', 'REFER', 'RIGHT',
    'RIVAL', 'RIVER', 'ROBIN', 'ROGER', 'ROMAN', 'ROUGH', 'ROUND', 'ROUTE', 'ROYAL', 'RURAL',
    'SCALE', 'SCENE', 'SCOPE', 'SCORE', 'SENSE', 'SERVE', 'SEVEN', 'SHALL', 'SHAPE', 'SHARE',
    'SHARP', 'SHEET', 'SHELF', 'SHELL', 'SHIFT', 'SHINE', 'SHIRT', 'SHOCK', 'SHOOT', 'SHORT',
    'SHOWN', 'SIGHT', 'SINCE', 'SIXTH', 'SIXTY', 'SIZED', 'SKILL', 'SLEEP', 'SLIDE', 'SMALL',
    'SMART', 'SMILE', 'SMITH', 'SMOKE', 'SOLID', 'SOLVE', 'SORRY', 'SOUND', 'SOUTH', 'SPACE',
    'SPARE', 'SPEAK', 'SPEED', 'SPEND', 'SPENT', 'SPLIT', 'SPOKE', 'SPORT', 'STAFF', 'STAGE',
    'STAKE', 'STAND', 'START', 'STATE', 'STEAM', 'STEEL', 'STICK', 'STILL', 'STOCK', 'STONE',
    'STOOD', 'STORE', 'STORM', 'STORY', 'STRIP', 'STUCK', 'STUDY', 'STUFF', 'STYLE', 'SUGAR',
    'SUITE', 'SUPER', 'SWEET', 'TABLE', 'TAKEN', 'TASTE', 'TAXES', 'TEACH', 'TEETH', 'TERRY',
    'TEXAS', 'THANK', 'THEFT', 'THEIR', 'THEME', 'THERE', 'THESE', 'THICK', 'THING', 'THINK',
    'THIRD', 'THOSE', 'THREE', 'THREW', 'THROW', 'TIGHT', 'TIMES', 'TITLE', 'TODAY', 'TOPIC',
    'TOTAL', 'TOUCH', 'TOUGH', 'TOWER', 'TRACK', 'TRADE', 'TRAIN', 'TREAT', 'TREND', 'TRIAL',
    'TRIED', 'TRIES', 'TROOP', 'TRUCK', 'TRULY', 'TRUST', 'TRUTH', 'TWICE', 'UNDER', 'UNDUE',
    'UNION', 'UNITY', 'UNTIL', 'UPPER', 'UPSET', 'URBAN', 'USAGE', 'USUAL', 'VALID', 'VALUE',
    'VIDEO', 'VIRUS', 'VISIT', 'VITAL', 'VOCAL', 'VOICE', 'WASTE', 'WATCH', 'WATER', 'WHEEL',
    'WHERE', 'WHICH', 'WHILE', 'WHITE', 'WHOLE', 'WHOSE', 'WOMAN', 'WOMEN', 'WORLD', 'WORRY',
    'WORSE', 'WORST', 'WORTH', 'WOULD', 'WOUND', 'WRITE', 'WRONG', 'WROTE', 'YIELD', 'YOUNG',
    'YOUTH'
];

// Game state
let targetWord = '';
let currentRow = 0;
let currentGuess = '';
let gameOver = false;
let currentStreak = 0;
let keyboardState = {};

// Keyboard layout
const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

// Initialize game
function initGame() {
    const session = getCurrentSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    loadStreakData();
    createBoard();
    createKeyboard();
    setupEventListeners();
    startNewGame();
    applyDarkMode();
}

// Load streak data from user scores
function loadStreakData() {
    const session = getCurrentSession();
    const user = getUserByUsername(session.username);
    const userScores = getUserScores(session.username);
    const wordleScores = userScores.filter(s => s.game === 'wordle');
    
    // Calculate current streak
    if (wordleScores.length > 0) {
        let streak = 0;
        for (let i = wordleScores.length - 1; i >= 0; i--) {
            if (wordleScores[i].won) {
                streak++;
            } else {
                break;
            }
        }
        currentStreak = streak;
    }
    
    updateStreakDisplay();
}

// Create game board
function createBoard() {
    const board = document.getElementById('wordleBoard');
    board.innerHTML = '';
    
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'wordle-row';
        row.dataset.row = i;
        
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('div');
            cell.className = 'wordle-cell';
            cell.dataset.col = j;
            row.appendChild(cell);
        }
        
        board.appendChild(row);
    }
}

// Create keyboard
function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    keyboard.innerHTML = '';
    
    keyboardRows.forEach(row => {
        const keyboardRow = document.createElement('div');
        keyboardRow.className = 'keyboard-row';
        
        row.forEach(key => {
            const button = document.createElement('button');
            button.className = 'key';
            button.textContent = key;
            button.dataset.key = key;
            
            if (key === 'ENTER' || key === 'BACK') {
                button.classList.add('wide');
            }
            
            button.addEventListener('click', () => handleKeyPress(key));
            keyboardRow.appendChild(button);
        });
        
        keyboard.appendChild(keyboardRow);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Physical keyboard support
    document.addEventListener('keydown', function(e) {
        if (gameOver) return;
        
        const key = e.key.toUpperCase();
        
        if (key === 'ENTER') {
            handleKeyPress('ENTER');
        } else if (key === 'BACKSPACE') {
            handleKeyPress('BACK');
        } else if (key.length === 1 && key.match(/[A-Z]/)) {
            handleKeyPress(key);
        }
    });
    
    // New game button
    document.getElementById('newGameBtn').addEventListener('click', startNewGame);
    
    // Play again button
    document.getElementById('playAgainBtn').addEventListener('click', function() {
        document.getElementById('gameOverModal').classList.remove('show');
        startNewGame();
    });
}

// Handle key press
function handleKeyPress(key) {
    if (gameOver) return;
    
    if (key === 'ENTER') {
        submitGuess();
    } else if (key === 'BACK') {
        deleteLetter();
    } else if (currentGuess.length < 5) {
        addLetter(key);
    }
}

// Add letter to current guess
function addLetter(letter) {
    if (currentGuess.length < 5) {
        currentGuess += letter;
        updateBoard();
    }
}

// Delete letter from current guess
function deleteLetter() {
    if (currentGuess.length > 0) {
        currentGuess = currentGuess.slice(0, -1);
        updateBoard();
    }
}

// Update board display
function updateBoard() {
    const row = document.querySelector(`[data-row="${currentRow}"]`);
    const cells = row.querySelectorAll('.wordle-cell');
    
    cells.forEach((cell, index) => {
        if (index < currentGuess.length) {
            cell.textContent = currentGuess[index];
            cell.classList.add('filled');
        } else {
            cell.textContent = '';
            cell.classList.remove('filled');
        }
    });
}

// Submit guess
function submitGuess() {
    if (currentGuess.length !== 5) {
        showMessage('Word must be 5 letters', 'error');
        return;
    }
    
    if (!wordList.includes(currentGuess)) {
        showMessage('Not in word list', 'error');
        return;
    }
    
    checkGuess();
    updateAttemptsDisplay();
    
    if (currentGuess === targetWord) {
        winGame();
    } else if (currentRow === 5) {
        loseGame();
    } else {
        currentRow++;
        currentGuess = '';
    }
}

// Check guess and update colors
function checkGuess() {
    const row = document.querySelector(`[data-row="${currentRow}"]`);
    const cells = row.querySelectorAll('.wordle-cell');
    const letterCount = {};
    
    // Count letters in target word
    for (let letter of targetWord) {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    }
    
    // First pass: mark correct letters
    const results = [];
    for (let i = 0; i < 5; i++) {
        const guessLetter = currentGuess[i];
        const targetLetter = targetWord[i];
        
        if (guessLetter === targetLetter) {
            results[i] = 'correct';
            letterCount[guessLetter]--;
        } else {
            results[i] = null;
        }
    }
    
    // Second pass: mark present letters
    for (let i = 0; i < 5; i++) {
        if (results[i] === null) {
            const guessLetter = currentGuess[i];
            if (targetWord.includes(guessLetter) && letterCount[guessLetter] > 0) {
                results[i] = 'present';
                letterCount[guessLetter]--;
            } else {
                results[i] = 'absent';
            }
        }
    }
    
    // Animate and apply colors with delay
    cells.forEach((cell, index) => {
        setTimeout(() => {
            cell.classList.add(results[index]);
            updateKeyboardKey(currentGuess[index], results[index]);
        }, index * 200);
    });
}

// Update keyboard key color
function updateKeyboardKey(letter, state) {
    const key = document.querySelector(`[data-key="${letter}"]`);
    if (!key) return;
    
    const currentState = keyboardState[letter];
    
    // Priority: correct > present > absent
    if (state === 'correct' || 
        (state === 'present' && currentState !== 'correct') ||
        (state === 'absent' && !currentState)) {
        keyboardState[letter] = state;
        key.className = 'key ' + state;
    }
}

// Show message
function showMessage(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = 'message show ' + type;
    
    setTimeout(() => {
        message.classList.remove('show');
    }, 2000);
}

// Update attempts display
function updateAttemptsDisplay() {
    document.getElementById('attemptsDisplay').textContent = `${currentRow + 1}/6`;
}

// Update streak display
function updateStreakDisplay() {
    document.getElementById('streakDisplay').textContent = currentStreak;
}

// Win game
function winGame() {
    gameOver = true;
    currentStreak++;
    
    const session = getCurrentSession();
    const score = (6 - currentRow) * 1000;
    const attempts = currentRow + 1;
    
    saveScore({
        username: session.username,
        game: 'wordle',
        score: score,
        attempts: attempts,
        won: true
    });
    
    // Update per-user Game 2 stats
    if (typeof window.GAME2_LS_KEYS !== 'undefined') {
        const username = session.username;
        
        // Update best score
        if (typeof getGame2NumberForUser === 'function' && typeof setGame2NumberForUser === 'function') {
            const currentBest = getGame2NumberForUser(window.GAME2_LS_KEYS.BEST_SCORE, username, 0);
            if (score > currentBest) {
                setGame2NumberForUser(window.GAME2_LS_KEYS.BEST_SCORE, username, score);
            }
            
            // Update total points
            incrementGame2NumberForUser(window.GAME2_LS_KEYS.TOTAL_POINTS, username, score);
            
            // Update games played
            incrementGame2NumberForUser(window.GAME2_LS_KEYS.GAMES_PLAYED, username, 1);
            
            // Update wins
            incrementGame2NumberForUser(window.GAME2_LS_KEYS.WINS, username, 1);
            
            // Update current streak
            setGame2NumberForUser(window.GAME2_LS_KEYS.CURRENT_STREAK, username, currentStreak);
            
            // Update best streak
            const bestStreak = getGame2NumberForUser(window.GAME2_LS_KEYS.BEST_STREAK, username, 0);
            if (currentStreak > bestStreak) {
                setGame2NumberForUser(window.GAME2_LS_KEYS.BEST_STREAK, username, currentStreak);
            }
            
            // Update recent results
            if (typeof getGame2RecentResultsForUser === 'function' && typeof saveGame2RecentResultsForUser === 'function') {
                const recent = getGame2RecentResultsForUser(username);
                recent.unshift({
                    game: 'Game 2',
                    score: score,
                    attempts: attempts,
                    date: new Date().toISOString(),
                    won: true
                });
                saveGame2RecentResultsForUser(username, recent.slice(0, 20));
            }
        }
    }
    
    // Update user streak
    const user = getUserByUsername(session.username);
    if (!user.bestStreak || currentStreak > user.bestStreak) {
        updateUser(session.username, { bestStreak: currentStreak });
    }
    
    showMessage('Congratulations!', 'success');
    
    setTimeout(() => {
        showGameOverModal(true);
    }, 1500);
}

// Lose game
function loseGame() {
    gameOver = true;
    currentStreak = 0;
    
    const session = getCurrentSession();
    const attempts = 6;
    
    saveScore({
        username: session.username,
        game: 'wordle',
        score: 0,
        attempts: attempts,
        won: false
    });
    
    // Update per-user Game 2 stats
    if (typeof window.GAME2_LS_KEYS !== 'undefined') {
        const username = session.username;
        
        if (typeof incrementGame2NumberForUser === 'function' && typeof setGame2NumberForUser === 'function') {
            // Update games played
            incrementGame2NumberForUser(window.GAME2_LS_KEYS.GAMES_PLAYED, username, 1);
            
            // Reset current streak
            setGame2NumberForUser(window.GAME2_LS_KEYS.CURRENT_STREAK, username, 0);
            
            // Update recent results
            if (typeof getGame2RecentResultsForUser === 'function' && typeof saveGame2RecentResultsForUser === 'function') {
                const recent = getGame2RecentResultsForUser(username);
                recent.unshift({
                    game: 'Game 2',
                    score: 0,
                    attempts: attempts,
                    date: new Date().toISOString(),
                    won: false
                });
                saveGame2RecentResultsForUser(username, recent.slice(0, 20));
            }
        }
    }
    
    showMessage(`The word was ${targetWord}`, 'error');
    
    setTimeout(() => {
        showGameOverModal(false);
    }, 1500);
}

// Show game over modal
function showGameOverModal(won) {
    const modal = document.getElementById('gameOverModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const wordReveal = document.getElementById('wordReveal');
    
    if (won) {
        modalTitle.textContent = '🎉 Congratulations!';
        modalMessage.textContent = 'You guessed the word!';
    } else {
        modalTitle.textContent = '😔 Game Over';
        modalMessage.textContent = 'Better luck next time!';
    }
    
    wordReveal.textContent = targetWord;
    document.getElementById('finalAttempts').textContent = currentRow + 1;
    document.getElementById('finalStreak').textContent = currentStreak;
    
    // Calculate total wins
    const session = getCurrentSession();
    const userScores = getUserScores(session.username);
    const totalWins = userScores.filter(s => s.game === 'wordle' && s.won).length;
    document.getElementById('totalWins').textContent = totalWins;
    
    modal.classList.add('show');
}

// Start new game
function startNewGame() {
    // Reset game state
    targetWord = wordList[Math.floor(Math.random() * wordList.length)];
    currentRow = 0;
    currentGuess = '';
    gameOver = false;
    keyboardState = {};
    
    // Reset board
    createBoard();
    
    // Reset keyboard colors
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.className = 'key';
        if (key.dataset.key === 'ENTER' || key.dataset.key === 'BACK') {
            key.classList.add('wide');
        }
    });
    
    // Update displays
    updateAttemptsDisplay();
    updateStreakDisplay();
    
    console.log('Target word:', targetWord); // For testing - remove in production
}

// Apply dark mode
function applyDarkMode() {
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
    }
}

// Initialize on page load
initGame();