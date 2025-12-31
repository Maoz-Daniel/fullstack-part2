/**
 * Page Transitions - Animate page exits and entrances
 * @file page-transitions.js
 */

"use strict"; // all variables must be declared with var, let, or const

(function() {
    
    // initialize page transition handlers
    function init() {

        // intercept all internal link clicks
        document.addEventListener("click", handleLinkClick);
    }

    /**
     * Handle link clicks - animate out then navigate
     * @param {Event} e - Click event
     */
    function handleLinkClick(e) {
        const link = e.target.closest("a"); //
        
        if (!link) return;
        if (link.target === "_blank") return; // allow new tab
        if (e.ctrlKey || e.metaKey) return; // allow new tab/window
        
        const href = link.getAttribute("href"); //get href
        if (!href) return;
        if (href.startsWith("#") || href.startsWith("javascript:")) return; // ignore anchors and JS links
        if (href.startsWith("http") && !href.includes(window.location.host)) return;

        // prevent default navigation
        e.preventDefault();

        // animate out
        document.body.classList.add("page-exit");

        // navigate after animation completes
        setTimeout(() => {
            window.location.href = href;
        }, 200);
    }

    // initialize when DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
