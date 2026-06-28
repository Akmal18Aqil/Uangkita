// js/app.js
import { initRouter } from './router.js';
import { renderNavbar } from './components/navbar.js';
import { renderFAB } from './components/fab.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('FinanceKu App Initialized');
    
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
