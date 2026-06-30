// Create/Edit post — handles both create-post.html and edit-post.html
document.addEventListener('DOMContentLoaded', async () => {
  // Determine mode: create or edit
  const isEdit = window.location.pathname.includes('edit-post');
  const postId = getQueryParam('id');

  // Require authentication
  if (!auth.requireAuth(window.location.href)) return;

  auth.renderNav();

  if (isEdit) {
    if (!postId) {
      window.location.href = '/index.html';
      return;
    }
    await loadPostForEditing(postId);
  }

  setupForm(isEdit, postId);
});

async function loadPostForEditing(postId) {
  const titleInput = document.getElementById('post-title');
  const contentInput = document.getElementById('post-content');
  const formCard = document.getElementById('post-form-card');

  try {
    const post = await api.getPost(postId);

    // Check ownership
    const currentUser = auth.getUser();
    if (!currentUser || currentUser.id !== post.user_id) {
      alert('You can only edit your own posts.');
      window.location.href = `/post.html?id=${postId}`;
      return;
    }

    titleInput.value = post.title;
    contentInput.value = post.content;
  } catch (err) {
    if (formCard) {
      formCard.innerHTML = `<div class="alert alert-error">Failed to load post. It may not exist.</div>`;
    }
  }
}

function setupForm(isEdit, postId) {
  const form = document.getElementById('post-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('post-title').value.trim();
    const content = document.getElementById('post-content').value.trim();
    const submitBtn = document.getElementById('submit-btn');

    clearAlert('form-alert');

    if (!title) {
      showAlert('form-alert', 'Title is required.');
      return;
    }

    if (title.length < 3) {
      showAlert('form-alert', 'Title must be at least 3 characters.');
      return;
    }

    if (!content) {
      showAlert('form-alert', 'Content is required.');
      return;
    }

    if (content.length < 10) {
      showAlert('form-alert', 'Content must be at least 10 characters.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner spinner-sm"></span> ${isEdit ? 'Saving...' : 'Publishing...'}`;

    try {
      let post;
      if (isEdit) {
        post = await api.updatePost(postId, title, content);
      } else {
        post = await api.createPost(title, content);
      }
      window.location.href = `/post.html?id=${post.id}`;
    } catch (err) {
      showAlert('form-alert', err.message || 'Failed to save post.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = isEdit ? 'Save Changes' : 'Publish Post';
    }
  });
}
