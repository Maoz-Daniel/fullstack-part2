/**
 * Navbar Loader - Injects shared navbar component
 * @file navbar-loader.js
 * @description Dynamically loads the shared navbar HTML into pages
 */

"use strict";

(function() {
    // Navbar HTML template (embedded to work with file:// protocol)
    const NAVBAR_HTML = `
<nav class="navbar" id="main-navbar">
    <div class="nav-content">
        <!-- Brand/Logo -->
        <a class="nav-brand" href="games.html">FunZone</a>
        
        <!-- Navigation menu -->
        <div class="nav-menu">
            <a href="games.html" class="nav-link" data-page="games">Games</a>
            <a href="leaderboard.html" class="nav-link" data-page="leaderboard">Leaderboard</a>
            <a href="profile.html" class="nav-link" data-page="profile">Profile</a>
            
            <!-- User info section (shown on games page) -->
            <div class="user-info" id="navbar-user-info" style="display:none;">
                <div class="user-avatar" id="userAvatar">U</div>
                <span id="username">User</span>
            </div>
            
            <!-- Action buttons -->
            <button class="btn-darkmode" id="darkModeToggle" type="button">Dark mode</button>
            <button class="btn-logout" id="logoutBtn" type="button" style="display:none;">Logout</button>
            <a href="games.html" class="btn-back" id="backBtn" style="display:none;">Back to Games</a>
        </div>
    </div>
</nav>
`;

    /**
     * Load and inject navbar into the page
     */
    function loadNavbar() {
        const placeholder = document.getElementById("navbar-placeholder");
        if (!placeholder) return;

        // Determine path prefix based on page location
        const isInPages = window.location.pathname.includes("/pages/");
        const basePath = isInPages ? "../" : "";
        
        // Fix href paths based on current location
        let html = NAVBAR_HTML;
        if (!isInPages) {
            // From root (index.html), links should point to pages/
            html = html.replace(/href="games\.html"/g, 'href="pages/games.html"')
                       .replace(/href="leaderboard\.html"/g, 'href="pages/leaderboard.html"')
                       .replace(/href="profile\.html"/g, 'href="pages/profile.html"');
        }
        
        placeholder.innerHTML = html;
        
        // Initialize navbar after loading
        initNavbar();
        
        // Re-initialize darkmode after navbar is in DOM
        initDarkModeButton();
        
        // Initialize logout button
        initLogoutButton();
    }

    /**
     * Initialize navbar functionality after DOM injection
     */
    function initNavbar() {
        const currentPage = getCurrentPage();
        
        // Highlight current page link
        highlightCurrentPage(currentPage);
        
        // Configure visibility based on page
        configureNavbarForPage(currentPage);
        
        // Update user info if logged in
        updateUserInfo();
    }

    /**
     * Get current page name from URL
     * @returns {string} Page name without extension
     */
    function getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.substring(path.lastIndexOf("/") + 1);
        return filename.replace(".html", "") || "index";
    }

    /**
     * Highlight the current page in navigation
     * @param {string} page - Current page name
     */
    function highlightCurrentPage(page) {
        const links = document.querySelectorAll(".nav-link[data-page]");
        links.forEach(link => {
            if (link.dataset.page === page) {
                link.setAttribute("aria-current", "page");
            }
        });
    }

    /**
     * Configure navbar elements based on current page
     * @param {string} page - Current page name
     */
    function configureNavbarForPage(page) {
        const userInfo = document.getElementById("navbar-user-info");
        const logoutBtn = document.getElementById("logoutBtn");
        const backBtn = document.getElementById("backBtn");

        // Games page: show user info and logout
        if (page === "games") {
            if (userInfo) userInfo.style.display = "flex";
            if (logoutBtn) logoutBtn.style.display = "inline-block";
        }
        
        // Leaderboard and profile: show back button
        if (page === "leaderboard" || page === "profile") {
            if (backBtn) backBtn.style.display = "inline-block";
        }
    }

    /**
     * Update user info in navbar from session
     */
    function updateUserInfo() {
        // Check if storage functions are available
        if (typeof getActiveUsername !== "function") return;

        const username = getActiveUsername();
        if (!username) return;

        const avatarEl = document.getElementById("userAvatar");
        const usernameEl = document.getElementById("username");

        if (avatarEl) {
            avatarEl.textContent = username.charAt(0).toUpperCase();
        }
        if (usernameEl) {
            usernameEl.textContent = username;
        }
    }

    /**
     * Initialize dark mode button in navbar
     * Uses global initDarkMode from darkmode.js if available
     */
    function initDarkModeButton() {
        // Use darkmode.js if available (avoids duplicate code)
        if (typeof window.initDarkMode === "function") {
            window.initDarkMode();
            return;
        }
        
        // Fallback if darkmode.js not loaded
        const darkModeToggle = document.getElementById("darkModeToggle");
        if (!darkModeToggle) return;

        const DARK_LABEL = "Dark mode";
        const LIGHT_LABEL = "Light mode";
        const isDark = document.body.classList.contains("dark-mode");
        
        darkModeToggle.textContent = isDark ? LIGHT_LABEL : DARK_LABEL;
        
        darkModeToggle.addEventListener("click", function() {
            document.body.classList.toggle("dark-mode");
            const nowDark = document.body.classList.contains("dark-mode");
            localStorage.setItem("darkMode", nowDark);
            darkModeToggle.textContent = nowDark ? LIGHT_LABEL : DARK_LABEL;
        });
    }

    /**
     * Initialize logout button in navbar.
     * Uses window.location.replace() instead of .href to prevent
     * the user from using the back button to return to protected pages.
     * The replace() method replaces the current history entry,
     * so the protected page won't be in the browser's history stack.
     */
    function initLogoutButton() {
        const logoutBtn = document.getElementById("logoutBtn");
        if (!logoutBtn) return;

        logoutBtn.addEventListener("click", function() {
            // Clear the session from storage
            if (typeof clearCurrentSession === "function") {
                clearCurrentSession();
            } else {
                // Fallback: clear session manually
                sessionStorage.removeItem("currentSession");
            }
            // Use replace() to prevent back-button returning to protected page
            window.location.replace("login.html");
        });
    }

    // Load navbar when DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadNavbar);
    } else {
        loadNavbar();
    }
})();

