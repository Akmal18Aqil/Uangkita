// js/components/skeleton.js

export function getCardSkeleton() {
    return `
        <div class="glass-card skeleton-container animate-fade-in" style="margin-bottom: 16px;">
            <div class="skeleton skeleton-text" style="width: 40%;"></div>
            <div class="skeleton skeleton-text" style="width: 70%; height: 24px; margin-bottom: 16px;"></div>
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
            <div class="transaction-item" style="border: none; pointer-events: none;">
                <div class="skeleton skeleton-avatar" style="margin-right: 12px;"></div>
                <div class="transaction-details" style="flex: 1;">
                    <div class="skeleton skeleton-text" style="width: 60%; margin-bottom: 6px;"></div>
                    <div class="skeleton skeleton-text" style="width: 30%; height: 10px;"></div>
                </div>
                <div class="skeleton skeleton-text" style="width: 25%;"></div>
            </div>
        `;
    }
    return html;
}
