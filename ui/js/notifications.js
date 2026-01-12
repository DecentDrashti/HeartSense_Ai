/**
 * HeartSense AI Notification System
 * Clinical-grade, responsive notification cards.
 */

class NotificationSystem {
    constructor() {
        this.container = this._createContainer();
        this.icons = {
            critical: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
            warning: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
            info: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`
        };
    }

    _createContainer() {
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        return container;
    }

    show({ title, message, type = 'info', duration = 5000 }) {
        const card = document.createElement('div');
        card.className = `notification-card notification-${type}`;

        const iconHtml = this.icons[type] || this.icons.info;

        card.innerHTML = `
            <div class="notification-icon">
                ${iconHtml}
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" aria-label="Close notification">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
        `;

        // Add to DOM
        this.container.appendChild(card);

        // Auto dismiss
        let dismissTimer = null;
        if (duration > 0) {
            dismissTimer = setTimeout(() => this._dismiss(card), duration);
        }

        // Manual dismiss
        card.querySelector('.notification-close').addEventListener('click', () => {
            if (dismissTimer) clearTimeout(dismissTimer);
            this._dismiss(card);
        });

        return card;
    }

    _dismiss(card) {
        card.classList.add('exit');
        card.addEventListener('animationend', () => {
            card.remove();
            // Remove container if empty to clean up DOM (optional)
            if (this.container.children.length === 0) {
                // this.container.remove();
                // this.container = null;
            }
        });
    }
}

// Global instance
window.notifications = new NotificationSystem();
