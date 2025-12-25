/**
 * Page Transitions - Animate page exits and entrances
 * @file page-transitions.js
 */

"use strict";

(function() {
    /**
     * Initialize page transitions
     */
    function init() {
        // Intercept all internal link clicks
        document.addEventListener("click", handleLinkClick);
    }

    /**
     * Handle link clicks - animate out then navigate
     * @param {Event} e - Click event
     */
    function handleLinkClick(e) {
        const link = e.target.closest("a");
        
        if (!link) return;
        if (link.target === "_blank") return;
        if (e.ctrlKey || e.metaKey) return;
        
        const href = link.getAttribute("href");
        if (!href) return;
        if (href.startsWith("#") || href.startsWith("javascript:")) return;
        if (href.startsWith("http") && !href.includes(window.location.host)) return;

        // Prevent default navigation
        e.preventDefault();

        // Animate out
        document.body.classList.add("page-exit");

        // Navigate after animation completes
        setTimeout(() => {
            window.location.href = href;
        }, 200);
    }

    // Initialize when DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
