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
        sheet.style.transform = ''; // Hapus inline style agar kembali ke CSS
        sheet.classList.remove('active');
        setTimeout(() => {
            container.innerHTML = '';
        }, 300);
    };
    
    overlay.addEventListener('click', close);
    
    // Fitur Swipe / Geser ke Bawah untuk Menutup
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    
    sheet.addEventListener('touchstart', (e) => {
        // Hanya mulai drag jika konten sedang berada di paling atas (tidak sedang di-scroll)
        if (sheet.scrollTop <= 0) {
            startY = e.touches[0].clientY;
            isDragging = true;
            sheet.style.transition = 'none'; // Matikan animasi transisi sementara agar dragging mulus
        }
    }, { passive: true });

    sheet.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const y = e.touches[0].clientY;
        const deltaY = y - startY;
        
        // Jika menggeser ke bawah
        if (deltaY > 0 && sheet.scrollTop <= 0) {
            if (e.cancelable) e.preventDefault();
            currentY = deltaY;
            sheet.style.transform = `translateY(${currentY}px)`;
        }
    }, { passive: false });

    sheet.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        
        sheet.style.transition = ''; // Kembalikan transisi CSS asli
        
        // Jika digeser lebih dari 120px ke bawah, tutup sheet
        if (currentY > 120) {
            close();
        } else {
            // Jika kurang, kembalikan ke posisi semula
            sheet.style.transform = '';
        }
        currentY = 0;
    });
    
    return { close };
}
