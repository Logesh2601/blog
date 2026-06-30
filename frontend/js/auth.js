// Auth utilities shared across all pages

const auth = {
  /**
   * Get the current user from localStorage
   * @returns {object|null} User object or null
   */
  getUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Get the current JWT token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  isLoggedIn() {
    return !!this.getToken() && !!this.getUser();
  },

  /**
   * Save auth data after login/register
   * @param {string} token
   * @param {object} user
   */
  setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * Clear auth data (logout)
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
  },

  /**
   * Require authentication — redirect to login if not logged in
   * @param {string} [redirectAfter] - URL to redirect to after login
   */
  requireAuth(redirectAfter) {
    if (!this.isLoggedIn()) {
      const url = redirectAfter
        ? `/login.html?redirect=${encodeURIComponent(redirectAfter)}`
        : '/login.html';
      window.location.href = url;
      return false;
    }
    return true;
  },

  /**
   * Render the nav links based on auth state
   * Looks for element with id="nav-auth"
   */
  renderNav() {
    const navAuth = document.getElementById('nav-auth');
    if (!navAuth) return;

    if (this.isLoggedIn()) {
      const user = this.getUser();
      navAuth.innerHTML = `
        <span class="nav-username">👤 ${escapeHtml(user.username)}</span>
        <a href="/create-post.html" class="btn-primary">+ New Post</a>
        <a href="#" id="logout-btn">Logout</a>
      `;
      document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    } else {
      navAuth.innerHTML = `
        <a href="/login.html">Login</a>
        <a href="/register.html" class="btn-primary">Register</a>
      `;
    }
  },
};

/**
 * HTML escape utility
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format a date string for display
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date+time string for display
 */
function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Show an alert message inside a container element
 */
function showAlert(containerId, message, type = 'error') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <div class="alert alert-${type}">
      ${escapeHtml(message)}
    </div>
  `;
}

/**
 * Clear alert message
 */
function clearAlert(containerId) {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = '';
}

/**
 * Get query param by name
 */
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}
