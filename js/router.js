// js/router.js
const routes = {
    '/': {
        title: 'Dashboard',
        render: () => import('./pages/dashboard.js').then(m => m.render())
    },
    '/transactions': {
        title: 'Transaksi',
        render: () => import('./pages/transactions.js').then(m => m.render())
    },
    '/analytics': {
        title: 'Analitik',
        render: () => import('./pages/analytics.js').then(m => m.render())
    },
    '/tasks': {
        title: 'Tugas',
        render: () => import('./pages/tasks.js').then(m => m.render())
    },
    '/settings': {
        title: 'Pengaturan',
        render: () => import('./pages/settings.js').then(m => m.render())
    }
};

export async function navigateTo(path) {
    if (!routes[path]) path = '/'; // fallback to dashboard
    
    // Update URL hash
    window.location.hash = path;
    
    // Update Page Title in header
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = routes[path].title;
    
    // Render content
    const appRoot = document.getElementById('app-root');
    appRoot.innerHTML = '<div class="empty-state"><div class="skeleton skeleton-card"></div></div>'; // loading
    
    try {
        const content = await routes[path].render();
        appRoot.innerHTML = '';
        appRoot.appendChild(content);
        
        // Update active state in navbars
        updateNavActiveState(path);
        
    } catch (e) {
        console.error('Error rendering page:', e);
        appRoot.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Gagal memuat halaman.</p></div>`;
    }
}

function updateNavActiveState(path) {
    document.querySelectorAll('.nav-item, .sidebar-item').forEach(el => {
        el.classList.remove('active');
        if (el.getAttribute('href') === '#' + path) {
            el.classList.add('active');
        }
    });
}

export function initRouter() {
    window.addEventListener('hashchange', () => {
        let path = window.location.hash.slice(1) || '/';
        navigateTo(path);
    });
    
    // Initial route
    let path = window.location.hash.slice(1) || '/';
    navigateTo(path);
}
