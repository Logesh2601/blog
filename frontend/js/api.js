// Centralized API helper
// Empty string = same origin (works both locally via Express and on Render)
const BASE_URL = '';

const api = {
  /**
   * Make an API request
   * @param {string} endpoint - API endpoint (e.g. '/api/posts')
   * @param {object} options - fetch options
   * @returns {Promise<any>} Parsed JSON response
   */
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Request failed');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  },

  // Auth
  register(username, email, password) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Posts
  getPosts() {
    return this.request('/api/posts');
  },

  getPost(id) {
    return this.request(`/api/posts/${id}`);
  },

  createPost(title, content) {
    return this.request('/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  },

  updatePost(id, title, content) {
    return this.request(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content }),
    });
  },

  deletePost(id) {
    return this.request(`/api/posts/${id}`, {
      method: 'DELETE',
    });
  },

  // Comments
  getComments(postId) {
    return this.request(`/api/posts/${postId}/comments`);
  },

  addComment(postId, content) {
    return this.request(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  deleteComment(commentId) {
    return this.request(`/api/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};
