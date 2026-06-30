// Single post view with comments
let currentPost = null;

document.addEventListener('DOMContentLoaded', () => {
  auth.renderNav();

  const postId = getQueryParam('id');
  if (!postId) {
    window.location.href = '/index.html';
    return;
  }

  loadPost(postId);
  setupDeleteModal();
});

async function loadPost(postId) {
  const postContainer = document.getElementById('post-container');
  const commentsContainer = document.getElementById('comments-container');

  postContainer.innerHTML = `<div class="loading-center"><div class="spinner"></div></div>`;

  try {
    const post = await api.getPost(postId);
    currentPost = post;

    renderPost(post);
    renderComments(post.comments || []);
    renderCommentForm(postId);
  } catch (err) {
    if (err.status === 404) {
      postContainer.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🔍</span>
          <h3>Post not found</h3>
          <p>This post may have been deleted.</p>
          <a href="/index.html" class="btn btn-primary">Back to Home</a>
        </div>
      `;
    } else {
      postContainer.innerHTML = `
        <div class="alert alert-error">Failed to load post. Please try again.</div>
      `;
    }
  }
}

function renderPost(post) {
  const postContainer = document.getElementById('post-container');
  const currentUser = auth.getUser();
  const isAuthor = currentUser && currentUser.id === post.user_id;

  const actionsHtml = isAuthor ? `
    <div class="post-full-actions">
      <a href="/edit-post.html?id=${post.id}" class="btn btn-secondary btn-sm">✏️ Edit</a>
      <button class="btn btn-danger btn-sm" id="delete-post-btn">🗑️ Delete</button>
    </div>
  ` : '';

  postContainer.innerHTML = `
    <article class="post-full">
      <h1 class="post-full-title">${escapeHtml(post.title)}</h1>
      <div class="post-full-meta">
        <span class="author">✍️ ${escapeHtml(post.author)}</span>
        <span class="dot">•</span>
        <span>${formatDateTime(post.created_at)}</span>
        ${post.updated_at !== post.created_at
          ? `<span class="dot">•</span><span>Edited ${formatDateTime(post.updated_at)}</span>`
          : ''
        }
        ${actionsHtml}
      </div>
      <div class="post-content">${escapeHtml(post.content)}</div>
    </article>
  `;

  // Attach delete button handler
  const deleteBtn = document.getElementById('delete-post-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      document.getElementById('delete-modal').classList.add('active');
    });
  }
}

function renderComments(comments) {
  const commentsContainer = document.getElementById('comments-container');
  const currentUser = auth.getUser();

  let commentsHtml = '';
  if (comments.length === 0) {
    commentsHtml = `<p style="color: var(--text-muted); font-size: 0.92rem;">No comments yet. Be the first to comment!</p>`;
  } else {
    commentsHtml = `
      <div class="comment-list" id="comment-list">
        ${comments.map(c => renderCommentItem(c, currentUser)).join('')}
      </div>
    `;
  }

  commentsContainer.innerHTML = `
    <div class="comments-section">
      <h2>💬 Comments (${comments.length})</h2>
      <div id="comments-list-wrapper">${commentsHtml}</div>
      <div id="comment-form-wrapper"></div>
    </div>
  `;
}

function renderCommentItem(comment, currentUser) {
  const isOwner = currentUser && currentUser.id === comment.user_id;
  return `
    <div class="comment-item" id="comment-${comment.id}">
      <div class="comment-header">
        <div>
          <span class="comment-author">${escapeHtml(comment.username)}</span>
          <span class="comment-date" style="margin-left: 0.5rem;">${formatDateTime(comment.created_at)}</span>
        </div>
        ${isOwner
          ? `<button class="btn btn-danger btn-sm" onclick="deleteComment(${comment.id})">Delete</button>`
          : ''
        }
      </div>
      <p class="comment-content">${escapeHtml(comment.content)}</p>
    </div>
  `;
}

function renderCommentForm(postId) {
  const formWrapper = document.getElementById('comment-form-wrapper');
  if (!formWrapper) return;

  if (!auth.isLoggedIn()) {
    formWrapper.innerHTML = `
      <div class="add-comment">
        <div class="login-to-comment">
          <a href="/login.html">Login</a> or <a href="/register.html">register</a> to leave a comment.
        </div>
      </div>
    `;
    return;
  }

  formWrapper.innerHTML = `
    <div class="add-comment">
      <h3>Leave a Comment</h3>
      <div id="comment-alert"></div>
      <form id="comment-form">
        <div class="form-group">
          <textarea
            class="form-control"
            id="comment-content"
            placeholder="Share your thoughts..."
            rows="3"
            required
          ></textarea>
        </div>
        <button type="submit" class="btn btn-primary" id="comment-submit-btn">Post Comment</button>
      </form>
    </div>
  `;

  document.getElementById('comment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('comment-content').value.trim();
    if (!content) return;

    const submitBtn = document.getElementById('comment-submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner spinner-sm"></span> Posting...';
    clearAlert('comment-alert');

    try {
      const comment = await api.addComment(postId, content);
      document.getElementById('comment-content').value = '';

      // Re-fetch and re-render comments
      const updatedPost = await api.getPost(postId);
      currentPost = updatedPost;
      renderComments(updatedPost.comments || []);
      renderCommentForm(postId);
    } catch (err) {
      showAlert('comment-alert', err.message || 'Failed to post comment.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Post Comment';
    }
  });
}

async function deleteComment(commentId) {
  if (!confirm('Delete this comment?')) return;

  try {
    await api.deleteComment(commentId);
    const el = document.getElementById(`comment-${commentId}`);
    if (el) el.remove();

    // Update comment count in heading
    const list = document.querySelectorAll('.comment-item');
    const h2 = document.querySelector('.comments-section h2');
    if (h2) h2.textContent = `💬 Comments (${list.length})`;
  } catch (err) {
    alert(err.message || 'Failed to delete comment.');
  }
}

function setupDeleteModal() {
  const modal = document.getElementById('delete-modal');
  const cancelBtn = document.getElementById('delete-cancel-btn');
  const confirmBtn = document.getElementById('delete-confirm-btn');

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      if (!currentPost) return;
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<span class="spinner spinner-sm"></span> Deleting...';

      try {
        await api.deletePost(currentPost.id);
        window.location.href = '/index.html';
      } catch (err) {
        modal.classList.remove('active');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Delete Post';
        alert(err.message || 'Failed to delete post.');
      }
    });
  }

  // Close on overlay click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }
}
