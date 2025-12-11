// js/auth.js - Authentication and registration logic
// Purpose: Handle user login, registration, and validation

// Check if user is already logged in and redirect to games page
function checkExistingSession() {
    const session = getCurrentSession();
    if (session && window.location.pathname.includes('login.html')) {
        window.location.href = 'games.html';
    }
}

// Login Form Handler
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const generalError = document.getElementById('generalError');
    
    // Track failed login attempts
    let failedAttempts = parseInt(localStorage.getItem('failedAttempts_' + usernameInput.value) || '0');
    let lockoutTime = localStorage.getItem('lockoutTime_' + usernameInput.value);
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        // Clear previous errors
        generalError.textContent = '';
        generalError.classList.remove('show');
        
        // Check if account is locked
        if (lockoutTime) {
            const lockoutEnd = new Date(lockoutTime);
            const now = new Date();
            if (now < lockoutEnd) {
                const minutesLeft = Math.ceil((lockoutEnd - now) / 60000);
                showError(generalError, `Account locked. Try again in ${minutesLeft} minutes.`);
                return;
            } else {
                // Unlock account
                localStorage.removeItem('lockoutTime_' + username);
                localStorage.removeItem('failedAttempts_' + username);
                failedAttempts = 0;
            }
        }
        
        // Validate user
        const user = getUserByUsername(username);
        
        if (!user) {
            showError(generalError, 'Username not found.');
            return;
        }
        
        if (user.password !== password) {
            failedAttempts++;
            localStorage.setItem('failedAttempts_' + username, failedAttempts.toString());
            
            if (failedAttempts >= 3) {
                const lockoutEnd = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
                localStorage.setItem('lockoutTime_' + username, lockoutEnd.toISOString());
                showError(generalError, 'Too many failed attempts. Account locked for 15 minutes.');
                return;
            }
            
            showError(generalError, `Incorrect password. ${3 - failedAttempts} attempts remaining.`);
            return;
        }
        
        // Successful login
        localStorage.removeItem('failedAttempts_' + username);
        localStorage.removeItem('lockoutTime_' + username);
        
        // Update user stats
        updateUser(username, {
            lastLogin: new Date().toISOString(),
            totalLogins: (user.totalLogins || 0) + 1
        });
        
        // Create session
        createSession(username);
        
        // Redirect to games page
        window.location.href = 'games.html';
    });
}

// Register Form Handler
if (document.getElementById('registerForm')) {
    const registerForm = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear all errors
        clearAllErrors();
        
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        let isValid = true;
        
        // Validate username
        if (username.length < 3) {
            showError(document.getElementById('usernameError'), 'Username must be at least 3 characters.');
            isValid = false;
        } else if (getUserByUsername(username)) {
            showError(document.getElementById('usernameError'), 'Username already exists.');
            isValid = false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError(document.getElementById('emailError'), 'Please enter a valid email address.');
            isValid = false;
        } else {
            // Check if email already exists
            const users = getAllUsers();
            if (users.some(user => user.email === email)) {
                showError(document.getElementById('emailError'), 'Email already registered.');
                isValid = false;
            }
        }
        
        // Validate password
        if (password.length < 6) {
            showError(document.getElementById('passwordError'), 'Password must be at least 6 characters.');
            isValid = false;
        }
        
        // Validate password confirmation
        if (password !== confirmPassword) {
            showError(document.getElementById('confirmPasswordError'), 'Passwords do not match.');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Create new user
        const newUser = {
            username: username,
            email: email,
            password: password, // Note: In real app, this should be hashed
            registeredAt: new Date().toISOString(),
            totalLogins: 0,
            gamesPlayed: 0
        };
        
        saveUser(newUser);
        
        // Auto login after registration
        createSession(username);
        
        // Redirect to games page
        window.location.href = 'games.html';
    });
}

// Helper function to show error messages
function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
}

// Helper function to clear all error messages
function clearAllErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => {
        error.textContent = '';
        error.classList.remove('show');
    });
}

// Check for existing session on page load
checkExistingSession();