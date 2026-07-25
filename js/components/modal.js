// js/components/modal.js

export function showBottomSheet(contentHtml, title = '') {
    const container = document.getElementById('modal-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="modal-overlay" id="sheet-overlay"></div>
        <div class="bottom-sheet" id="bottom-sheet">
            <div class="sheet-handle" id="sheet-handle" title="Geser ke bawah untuk menutup"></div>
            ${title ? `<h3 style="margin-bottom: 16px; text-align: center; color: var(--text-primary); font-weight: 700;">${title}</h3>` : ''}
            <div class="sheet-content">
                ${contentHtml}
            </div>
        </div>
    `;
    
    const overlay = document.getElementById('sheet-overlay');
    const sheet = document.getElementById('bottom-sheet');
    const handle = document.getElementById('sheet-handle');
    
    // Trigger animation next frame
    requestAnimationFrame(() => {
        overlay.classList.add('active');
        sheet.classList.add('active');
    });
    
    const close = () => {
        overlay.classList.remove('active');
        sheet.style.transform = '';
        sheet.classList.remove('active');
        setTimeout(() => {
            container.innerHTML = '';
        }, 300);
    };
    
    overlay.addEventListener('click', close);
    if (handle) {
        handle.addEventListener('click', close);
    }
    
    // Smooth Drag Down to Close (Touch & Mouse Support)
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const startDrag = (clientY) => {
        if (sheet.scrollTop <= 0) {
            startY = clientY;
            isDragging = true;
            sheet.style.transition = 'none';
        }
    };

    const moveDrag = (clientY, e) => {
        if (!isDragging) return;
        const deltaY = clientY - startY;
        if (deltaY > 0 && sheet.scrollTop <= 0) {
            if (e && e.cancelable) e.preventDefault();
            currentY = deltaY;
            sheet.style.transform = `translateY(${currentY}px)`;
        }
    };

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        sheet.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        
        // If dragged down more than 80px, dismiss the modal
        if (currentY > 80) {
            close();
        } else {
            sheet.style.transform = '';
        }
        currentY = 0;
    };

    // Touch events (Mobile)
    sheet.addEventListener('touchstart', (e) => {
        startDrag(e.touches[0].clientY);
    }, { passive: true });

    sheet.addEventListener('touchmove', (e) => {
        moveDrag(e.touches[0].clientY, e);
    }, { passive: false });

    sheet.addEventListener('touchend', endDrag);

    // Mouse events (Desktop testing)
    if (handle) {
        handle.addEventListener('mousedown', (e) => {
            startDrag(e.clientY);
        });
    }
    
    window.addEventListener('mousemove', (e) => {
        if (isDragging) moveDrag(e.clientY, e);
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) endDrag();
    });
    
    return { close };
}
