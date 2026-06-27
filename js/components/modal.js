// js/components/modal.js

export function showBottomSheet(contentHtml, title = '') {
    const container = document.getElementById('modal-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="modal-overlay" id="sheet-overlay"></div>
        <div class="bottom-sheet" id="bottom-sheet">
            <div class="sheet-handle"></div>
            ${title ? `<h3 style="margin-bottom: 16px;">${title}</h3>` : ''}
            <div class="sheet-content">
                ${contentHtml}
            </div>
        </div>
    `;
    
    const overlay = document.getElementById('sheet-overlay');
    const sheet = document.getElementById('bottom-sheet');
    
    // Trigger animation next frame
    requestAnimationFrame(() => {
        overlay.classList.add('active');
        sheet.classList.add('active');
    });
    
    const close = () => {
        overlay.classList.remove('active');
        sheet.classList.remove('active');
        setTimeout(() => {
            container.innerHTML = '';
        }, 300);
    };
    
    overlay.addEventListener('click', close);
    
    return { close };
}
