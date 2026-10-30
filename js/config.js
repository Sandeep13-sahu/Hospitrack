/**
 * Hospitrack — Centralized Production & Development Configuration
 * Single source of truth for API endpoints, timeouts, and environment parameters.
 */

(function () {
  const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  let defaultApi = (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file:'))
    ? window.location.origin
    : 'http://localhost:8080';

  // If local host on non-proxy port (e.g. 5173 / Vite dev server), talk directly to backend on 8080
  if (isLocalHost && window.location.port !== '8000' && window.location.port !== '8080' && window.location.port !== '') {
    defaultApi = 'http://localhost:8080';
  }

  const envApiUrl = (typeof window !== 'undefined' && (
    window.__HOSPITRACK_API_URL__ ||
    (window.__ENV__ && (window.__ENV__.VITE_API_URL || window.__ENV__.VITE_API_BASE_URL || window.__ENV__.API_BASE_URL))
  )) || null;

  window.HOSPITRACK_CONFIG = {
    API_BASE_URL: envApiUrl || defaultApi,
    APP_NAME: 'Hospitrack',
    APP_TAGLINE: 'Connected Healthcare Platform',
    VERSION: '2.4.0',
    TIMEOUT_MS: 15000,
    STORAGE_KEYS: {
      ACCESS_TOKEN: 'hospitrack_access_token',
      REFRESH_TOKEN: 'hospitrack_refresh_token',
      AUTH_USER: 'hospitrack_auth_user',
      REMEMBER_ME: 'hospitrack_remember_me'
    }
  };

  // Toast Notification Subsystem
  window.showToast = function (message, type = 'info', durationMs = 4000) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const toastType = ['success', 'error', 'warning', 'info'].includes(type) ? type : 'info';
    toast.className = `toast-item toast-${toastType} toast-enter`;

    const iconMap = {
      success: '✓',
      error: '✕',
      warning: '⚠️',
      info: 'ℹ️'
    };

    toast.innerHTML = `
      <div class="toast-icon">${iconMap[toastType] || 'ℹ️'}</div>
      <div class="toast-content">
        <div class="toast-message">${escapeHtml(message)}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()" aria-label="Close notification">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-exit');
      setTimeout(() => { if (toast.parentElement) toast.remove(); }, 300);
    }, durationMs);
  };

  window.showError = function (message) {
    window.showToast(message || 'Something went wrong. Please try again.', 'error', 5000);
  };

  window.showSuccess = function (message) {
    window.showToast(message || 'Action completed successfully.', 'success', 4000);
  };

  window.escapeHtml = function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
})();

