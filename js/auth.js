/**
 * authentication Module - playHub Gaming Portal
 * @file auth.js
 * @description handles user login, registration, and session management.
 * @requires storage.js
 */

"use strict"; // all variables must be declared with var, let, or const

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


//displays an error message in the specified element
function showError(element, message) {
    if (!element) return;
    element.textContent = message;
    element.classList.add("show");
}


//clears all visible error messages
function clearAllErrors() {
    document.querySelectorAll(".error-message").forEach(el => {
        el.textContent = "";
        el.classList.remove("show");
    });
}

//returns lockout storage keys for a given username
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
 * Redirects already-logged-in users away from the login page.
 * This prevents logged-in users from seeing the login form.
 * Uses replace() to avoid adding unnecessary entries to browser history.
 */
function checkExistingSession() {
    const session = getCurrentSession();
    if (session && window.location.pathname.includes("login.html")) {
        window.location.replace("games.html");
    }
}

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

// checks password against requirements and returns results
function checkPasswordRequirements(password) {
    const requirements = {
        length: password.length >= AUTH_CONFIG.MIN_PASSWORD_LENGTH,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(password)
    };
    
    const passedCount = Object.values(requirements).filter(Boolean).length; // count passed requirements
    
    let strength = "weak";
    if (passedCount >= 5) strength = "strong";
    else if (passedCount >= 4) strength = "good";
    else if (passedCount >= 3) strength = "fair";
    
    return { requirements, strength, passedCount };
}

/**
 * updates password requirement UI elements
 * @param {HTMLElement} element - requirement list item
 * @param {boolean} isValid - whether requirement is met
 */
function updateRequirement(element, isValid) {
    if (!element) return;
    const icon = element.querySelector(".req-icon");
    
    element.classList.toggle("valid", isValid); // if valid, add 'valid' class
    element.classList.toggle("invalid", !isValid); // if invalid, add 'invalid' class
    if (icon) icon.textContent = isValid ? "✓" : "✗"; // update icon
}

// ============================================================================
// LOGIN HANDLER
// ============================================================================


// initializes login form handling
function initLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;
    
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const generalError = document.getElementById("generalError");
    
    form.addEventListener("submit", (e) => {
        e.preventDefault(); // prevent form submission
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const keys = getLockoutKeys(username);
        
        // clear previous errors
        generalError.textContent = "";
        generalError.classList.remove("show");
        
        // check lockout
        const lockoutTime = localStorage.getItem(keys.lockout);
        if (lockoutTime) {
            const lockoutEnd = new Date(lockoutTime);
            if (new Date() < lockoutEnd) {
                const minutesLeft = Math.ceil((lockoutEnd - new Date()) / 60000);
                showError(generalError, `Account locked. Try again in ${minutesLeft} minutes.`);
                return;
            }
            // unlock
            localStorage.removeItem(keys.lockout);
            localStorage.removeItem(keys.attempts);
        }
        
        // validate user
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
        
        // Successful login - clear any lockout data
        localStorage.removeItem(keys.attempts);
        localStorage.removeItem(keys.lockout);
        
        // Update user's login statistics
        updateUser(username, {
            lastLogin: new Date().toISOString(),
            totalLogins: (user.totalLogins || 0) + 1
        });
        
        // Create session and redirect to games page
        // Using replace() prevents the login page from being in browser history
        createSession(username);
        window.location.replace("games.html");
    });
}

// ============================================================================
// REGISTRATION HANDLER
// ============================================================================

//initializes registration form handling
function initRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;
    
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    
    // password UI elements
    const strengthFill = document.getElementById("strengthFill");
    const strengthText = document.getElementById("strengthText");
    const reqLength = document.getElementById("req-length");
    const reqUppercase = document.getElementById("req-uppercase");
    const reqLowercase = document.getElementById("req-lowercase");
    const reqNumber = document.getElementById("req-number");
    const reqSpecial = document.getElementById("req-special");
    
    
    //updates password strength UI 
    function updatePasswordUI() {
        const password = passwordInput.value;
        const { requirements, strength } = checkPasswordRequirements(password);
        
        updateRequirement(reqLength, requirements.length);
        updateRequirement(reqUppercase, requirements.uppercase);
        updateRequirement(reqLowercase, requirements.lowercase);
        updateRequirement(reqNumber, requirements.number);
        updateRequirement(reqSpecial, requirements.special);
        
        if (strengthFill && strengthText) { // if elements exist
            if (password.length === 0) {
                strengthFill.className = "strength-fill";
                strengthText.className = "strength-text";
                strengthText.textContent = "";
            } else {
                strengthFill.className = `strength-fill ${strength}`;
                strengthText.className = `strength-text ${strength}`;
                strengthText.textContent = strength.charAt(0).toUpperCase() + strength.slice(1); // capitalize first letter
            }
        }
    }
    
    passwordInput.addEventListener("input", updatePasswordUI);
    
    form.addEventListener("submit", (e) => {
        e.preventDefault(); // prevent form submission
        clearAllErrors();
        
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        let isValid = true;
        
        // validate username
        if (username.length < AUTH_CONFIG.MIN_USERNAME_LENGTH) {
            showError(document.getElementById("usernameError"), 
                `Username must be at least ${AUTH_CONFIG.MIN_USERNAME_LENGTH} characters.`);
            isValid = false;
        } else if (getUserByUsername(username)) {
            showError(document.getElementById("usernameError"), "Username already exists.");
            isValid = false;
        }
        
        // validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError(document.getElementById("emailError"), "Please enter a valid email address.");
            isValid = false;
        } else if (getAllUsers().some(u => u.email === email)) {
            showError(document.getElementById("emailError"), "Email already registered.");
            isValid = false;
        }
        
        // validate password
        const { requirements, passedCount } = checkPasswordRequirements(password);
        if (!requirements.length) {
            showError(document.getElementById("passwordError"), 
                `Password must be at least ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} characters.`);
            isValid = false;
        } else if (passedCount < 3) {
            showError(document.getElementById("passwordError"), "Password is too weak.");
            isValid = false;
        }
        
        // validate confirmation
        if (password !== confirmPassword) {
            showError(document.getElementById("confirmPasswordError"), "Passwords do not match.");
            isValid = false;
        }
        
        if (!isValid) return;
        
        // create user
        saveUser({
            username,
            email,
            password,
            registeredAt: new Date().toISOString(),
            totalLogins: 0,
            gamesPlayed: 0
        });
        
        createSession(username);
        window.location.replace("games.html");
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Wait for DOM to be ready before initializing auth functionality.
 * This prevents race conditions where auth checks might run before
 * the session is fully established during redirects.
 * 
 * checkExistingSession: Redirects logged-in users away from login page
 * initLoginForm: Sets up login form validation and submission
 * initRegisterForm: Sets up registration form validation and submission
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        checkExistingSession();
        initLoginForm();
        initRegisterForm();

    });
} else {
    // DOM already loaded
    checkExistingSession();
    initLoginForm();
    initRegisterForm();
}
