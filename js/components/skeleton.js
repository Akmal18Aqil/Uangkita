// js/components/skeleton.js

export function getCardSkeleton() {
    return `
        <div class="clean-card skeleton-container animate-fade-in" style="margin-bottom: 16px;">
            <div class="skeleton skeleton-text" style="width: 40%;"></div>
            <div class="skeleton skeleton-text" style="width: 70%; height: 28px; margin-bottom: 16px;"></div>
            <div style="display: flex; gap: 12px;">
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-text short"></div>
            </div>
        </div>
    `;
}

export function getListSkeleton(count = 3) {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
            <div class="transaction-item" style="border: none; pointer-events: none; background: var(--bg-surface);">
                <div class="skeleton skeleton-avatar" style="margin-right: 12px; flex-shrink: 0;"></div>
                <div class="transaction-details" style="flex: 1;">
                    <div class="skeleton skeleton-text" style="width: 60%; margin-bottom: 6px;"></div>
                    <div class="skeleton skeleton-text" style="width: 35%; height: 10px;"></div>
                </div>
                <div class="skeleton skeleton-text" style="width: 25%; height: 18px;"></div>
            </div>
        `;
    }
    return html;
}

export function getPageSkeleton() {
    return `
        <div class="flex-col gap-lg animate-fade-in">
            <!-- Hero Shimmer Row -->
            <div class="flex gap-md" style="width: 100%;">
                <div class="skeleton" style="flex: 1; height: 140px; border-radius: var(--radius-lg);"></div>
                <div class="skeleton" style="flex: 1; height: 140px; border-radius: var(--radius-lg);"></div>
            </div>
            
            <!-- Balance Shimmer Card -->
            <div class="clean-card">
                <div class="skeleton skeleton-text" style="width: 35%; margin-bottom: 8px;"></div>
                <div class="skeleton skeleton-text" style="width: 65%; height: 32px; margin-bottom: 20px;"></div>
                <div class="skeleton" style="width: 100%; height: 100px; border-radius: var(--radius-md);"></div>
            </div>
            
            <!-- List Shimmer -->
            <div class="clean-card">
                <div class="skeleton skeleton-text" style="width: 45%; margin-bottom: 16px;"></div>
                ${getListSkeleton(3)}
            </div>
        </div>
    `;
}
