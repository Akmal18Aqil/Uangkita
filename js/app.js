// js/app.js
import { store } from './store.js';
import { initRouter } from './router.js';
import { renderNavbar } from './components/navbar.js';
import { renderFAB } from './components/fab.js';

function applyThemeUI(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    
    if (sunIcon && moonIcon) {
        if (theme === 'dark') {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        } else {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('FinanceKu App Initialized');
    
    // Initial Theme setup
    const settings = store.get('settings') || {};
    const initialTheme = settings.theme || 'light';
    applyThemeUI(initialTheme);
    
    // Theme toggle button setup
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const newTheme = store.toggleTheme();
            applyThemeUI(newTheme);
        });
    }
    
    // Capture PWA Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        window.deferredPrompt = e;
    });
    
    // Setup UI components
    renderNavbar();
    renderFAB();
    
    // Init router
    initRouter();
});
