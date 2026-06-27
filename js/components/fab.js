// js/components/fab.js
import { openTransactionForm } from './transactionForm.js';

export function renderFAB() {
    const container = document.getElementById('fab-container');
    if (!container) return;
    
    container.innerHTML = `
        <button class="fab" id="main-fab" aria-label="Tambah Transaksi">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
        </button>
    `;
    
    const fab = document.getElementById('main-fab');
    fab.addEventListener('click', () => {
        openTransactionForm();
    });
}
