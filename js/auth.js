/**
 * Authentication Module - PlayHub Gaming Portal
 * @file auth.js
 * @description Handles user login, registration, and session management.
 * @requires storage.js
 */

"use strict";

// ============================================================================
// CONFIGURATION
// ============================================================================

const AUTH_CONFIG = {
    MAX_LOGIN_ATTEMPTS: 3,
    LOCKOUT_MINUTES: 15,
    MIN_USERNAME_LENGTH: 3,
    MIN_PASSWORD_LENGTH: 6
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Shows an error message in the specified element
 * @param {HTMLElement} element - Error display element
 * @param {string} message - Error message
 */
function showError(element, message) {
    if (!element) return;
    element.textContent = message;
    element.classList.add("show");
}

/**
 * Clears all visible error messages
 */
function clearAllErrors() {
    document.querySelectorAll(".error-message").forEach(el => {
        el.textContent = "";
        el.classList.remove("show");
    });
}

/**
 * Gets a lockout key for a username
 * @param {string} username - Username
 * @returns {Object} Keys for failed attempts and lockout time
 */
function getLockoutKeys(username) {
    return {
        attempts: `failedAttempts_${username}`,
        lockout: `lockoutTime_${username}`
    };
}

// ============================================================================
// SESSION CHECK
// ============================================================================

/**
 * Redirects to games page if already logged in
 */
function checkExistingSession() {
    const session = getCurrentSession();
    if (session && window.location.pathname.includes("login.html")) {
        window.location.href = "games.html";
    }
}

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

/**
 * Checks password against requirements
 * @param {string} password - Password to check
 * @returns {Object} Requirements status and strength
 */
function checkPasswordRequirements(password) {
    const requirements = {
        length: password.length >= AUTH_CONFIG.MIN_PASSWORD_LENGTH,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(password)
    };
    
    const passedCount = Object.values(requirements).filter(Boolean).length;
    
    let strength = "weak";
    if (passedCount >= 5) strength = "strong";
    else if (passedCount >= 4) strength = "good";
    else if (passedCount >= 3) strength = "fair";
    
    return { requirements, strength, passedCount };
}

/**
 * Updates password requirement UI elements
 * @param {HTMLElement} element - Requirement list item
 * @param {boolean} isValid - Whether requirement is met
 */
function updateRequirement(element, isValid) {
    if (!element) return;
    const icon = element.querySelector(".req-icon");
    
    element.classList.toggle("valid", isValid);
    element.classList.toggle("invalid", !isValid);
    if (icon) icon.textContent = isValid ? "✓" : "✗";
}

// ============================================================================
// LOGIN HANDLER
// ============================================================================

/**
 * Initializes login form handling
 */
function initLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;
    
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const generalError = document.getElementById("generalError");
    
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const keys = getLockoutKeys(username);
        
        // Clear previous errors
        generalError.textContent = "";
        generalError.classList.remove("show");
        
        // Check lockout
        const lockoutTime = localStorage.getItem(keys.lockout);
        if (lockoutTime) {
            const lockoutEnd = new Date(lockoutTime);
            if (new Date() < lockoutEnd) {
                const minutesLeft = Math.ceil((lockoutEnd - new Date()) / 60000);
                showError(generalError, `Account locked. Try again in ${minutesLeft} minutes.`);
                return;
            }
            // Unlock
            localStorage.removeItem(keys.lockout);
            localStorage.removeItem(keys.attempts);
        }
        
        // Validate user
        const user = getUserByUsername(username);
        if (!user) {
            showError(generalError, "Username not found.");
            return;
        }
        
        if (user.password !== password) {
            let attempts = parseInt(localStorage.getItem(keys.attempts) || "0") + 1;
            localStorage.setItem(keys.attempts, attempts.toString());
            
            if (attempts >= AUTH_CONFIG.MAX_LOGIN_ATTEMPTS) {
                const lockoutEnd = new Date(Date.now() + AUTH_CONFIG.LOCKOUT_MINUTES * 60 * 1000);
                localStorage.setItem(keys.lockout, lockoutEnd.toISOString());
                showError(generalError, `Too many failed attempts. Account locked for ${AUTH_CONFIG.LOCKOUT_MINUTES} minutes.`);
                return;
            }
            
            showError(generalError, `Incorrect password. ${AUTH_CONFIG.MAX_LOGIN_ATTEMPTS - attempts} attempts remaining.`);
            return;
        }
        
        // Successful login
        localStorage.removeItem(keys.attempts);
        localStorage.removeItem(keys.lockout);
        
        updateUser(username, {
            lastLogin: new Date().toISOString(),
            totalLogins: (user.totalLogins || 0) + 1
        });
        
        createSession(username);
        window.location.href = "games.html";
    });
}

// ============================================================================
// REGISTRATION HANDLER
// ============================================================================

/**
 * Initializes registration form handling
 */
function initRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;
    
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    
    // Password UI elements
    const strengthFill = document.getElementById("strengthFill");
    const strengthText = document.getElementById("strengthText");
    const reqLength = document.getElementById("req-length");
    const reqUppercase = document.getElementById("req-uppercase");
    const reqLowercase = document.getElementById("req-lowercase");
    const reqNumber = document.getElementById("req-number");
    const reqSpecial = document.getElementById("req-special");
    
    /**
     * Updates password strength UI
     */
    function updatePasswordUI() {
        const password = passwordInput.value;
        const { requirements, strength } = checkPasswordRequirements(password);
        
        updateRequirement(reqLength, requirements.length);
        updateRequirement(reqUppercase, requirements.uppercase);
        updateRequirement(reqLowercase, requirements.lowercase);
        updateRequirement(reqNumber, requirements.number);
        updateRequirement(reqSpecial, requirements.special);
        
        if (strengthFill && strengthText) {
            if (password.length === 0) {
                strengthFill.className = "strength-fill";
                strengthText.className = "strength-text";
                strengthText.textContent = "";
            } else {
                strengthFill.className = `strength-fill ${strength}`;
                strengthText.className = `strength-text ${strength}`;
                strengthText.textContent = strength.charAt(0).toUpperCase() + strength.slice(1);
            }
        }
    }
    
    passwordInput.addEventListener("input", updatePasswordUI);
    
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        clearAllErrors();
        
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        let isValid = true;
        
        // Validate username
        if (username.length < AUTH_CONFIG.MIN_USERNAME_LENGTH) {
            showError(document.getElementById("usernameError"), 
                `Username must be at least ${AUTH_CONFIG.MIN_USERNAME_LENGTH} characters.`);
            isValid = false;
        } else if (getUserByUsername(username)) {
            showError(document.getElementById("usernameError"), "Username already exists.");
            isValid = false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError(document.getElementById("emailError"), "Please enter a valid email address.");
            isValid = false;
        } else if (getAllUsers().some(u => u.email === email)) {
            showError(document.getElementById("emailError"), "Email already registered.");
            isValid = false;
        }
        
        // Validate password
        const { requirements, passedCount } = checkPasswordRequirements(password);
        if (!requirements.length) {
            showError(document.getElementById("passwordError"), 
                `Password must be at least ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} characters.`);
            isValid = false;
        } else if (passedCount < 3) {
            showError(document.getElementById("passwordError"), "Password is too weak.");
            isValid = false;
        }
        
        // Validate confirmation
        if (password !== confirmPassword) {
            showError(document.getElementById("confirmPasswordError"), "Passwords do not match.");
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Create user
        saveUser({
            username,
            email,
            password,
            registeredAt: new Date().toISOString(),
            totalLogins: 0,
            gamesPlayed: 0
        });
        
        createSession(username);
        window.location.href = "games.html";
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

checkExistingSession();
initLoginForm();
initRegisterForm();
