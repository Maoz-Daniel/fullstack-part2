/**
 * Auth Guard - Protects pages from unauthorized access
 * Include this file in all protected pages BEFORE page-specific JS
 * @requires storage.js (for getCurrentSession)
 */

(function() {
    "use strict";

    /**
     * Validates session and redirects to login if invalid
     * @returns {boolean} True if session is valid
     */
    function validateSession() {
        const session = getCurrentSession();
        if (!session) {
            window.location.replace("login.html");
            return false;
        }
        return true;
    }

    /**
     * Shows page content (removes CSS visibility:hidden)
     */
    function showPage() {
        document.body.style.visibility = "visible";
    }

    /**
     * Hides page and redirects to login
     */
    function hideAndRedirect() {
        document.body.style.visibility = "hidden";
        window.location.replace("login.html");
    }

    // Auth check on initial load
    document.addEventListener("DOMContentLoaded", () => {
        if (validateSession()) {
            showPage();
        }
    });

    // Auth check on back/forward navigation (catches bfcache)
    let pageShown = false;
    window.addEventListener("pageshow", (e) => {
        if (!pageShown && !e.persisted) {
            pageShown = true;
            return;
        }
        if (!getCurrentSession()) {
            hideAndRedirect();
        }
    });
})();
