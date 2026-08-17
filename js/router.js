// js/router.js
import { getPageSkeleton } from './components/skeleton.js';

const routes = {
    '/': {
        title: 'Dashboard',
        load: () => import('./pages/dashboard.js')
    },
    '/transactions': {
        title: 'Transaksi',
        load: () => import('./pages/transactions.js')
    },
    '/analytics': {
        title: 'Analitik',
        load: () => import('./pages/analytics.js')
    },
    '/tasks': {
        title: 'Tugas',
        load: () => import('./pages/tasks.js')
    },
    '/settings': {
        title: 'Pengaturan',
        load: () => import('./pages/settings.js')
    }
};

const pageCache = new Map();

// Navigasi yang sedang berjalan, dikunci per path.
const inFlight = new Map();

export async function navigateTo(path) {
    if (!routes[path]) path = '/'; // fallback to dashboard

    // Menulis hash yang nilainya sama hanya memicu 'hashchange' percuma.
    const targetHash = '#' + path;
    if (window.location.hash !== targetHash) {
        window.location.hash = path;
    }

    // Update Page Title in header
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = routes[path].title;

    // Saat load pertama, penulisan hash di atas memicu 'hashchange' sehingga
    // navigateTo() berjalan dua kali untuk path yang sama. Tanpa kunci ini
    // keduanya melewati pageCache yang masih kosong, lalu masing-masing
    // me-render dan meng-append halaman: hasilnya container ganda, container
    // pertama jadi yatim (tidak pernah disembunyikan) dan datanya dimuat 2x.
    if (inFlight.has(path)) return inFlight.get(path);

    const task = renderRoute(path).finally(() => inFlight.delete(path));
    inFlight.set(path, task);
    return task;
}

async function renderRoute(path) {
    const appRoot = document.getElementById('app-root');

    // Hide all currently cached pages
    pageCache.forEach((page) => {
        if (page.container) {
            page.container.style.display = 'none';
        }
    });

    try {
        if (pageCache.has(path)) {
            // SHOW INSTANTLY FROM CACHE
            const page = pageCache.get(path);
            page.container.style.display = ''; 
            
            // Refresh data softly
            if (page.module.refresh) {
                page.module.refresh(page.container);
            }
        } else {
            // FIRST LOAD (Render Shimmer)
            const loadingEl = document.createElement('div');
            loadingEl.className = 'page-loading-temp';
            loadingEl.style.width = '100%';
            loadingEl.innerHTML = getPageSkeleton();
            appRoot.appendChild(loadingEl);

            const module = await routes[path].load();
            const container = await module.render();
            
            // Remove loading
            if (loadingEl.parentNode) {
                loadingEl.parentNode.removeChild(loadingEl);
            }
            
            appRoot.appendChild(container);
            
            pageCache.set(path, {
                module: module,
                container: container
            });
        }
        
        // Update active state in navbars
        updateNavActiveState(path);
        
    } catch (e) {
        console.error('Error rendering page:', e);
        // Clear loading if error
        const loadingEls = appRoot.querySelectorAll('.page-loading-temp');
        loadingEls.forEach(el => el.remove());
        
        const errorEl = document.createElement('div');
        errorEl.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Gagal memuat halaman. (${e.message})</p></div>`;
        appRoot.appendChild(errorEl);
    }
}

// Function to force refresh cached pages (e.g., after adding transaction)
export function invalidateCache() {
    pageCache.forEach((page) => {
        if (page.module.refresh && page.container) {
            page.module.refresh(page.container);
        }
    });
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
    // Clear root on init
    document.getElementById('app-root').innerHTML = '';
    
    window.addEventListener('hashchange', () => {
        let path = window.location.hash.slice(1) || '/';
        navigateTo(path);
    });
    
    // Initial route
    let path = window.location.hash.slice(1) || '/';
    navigateTo(path);
}
