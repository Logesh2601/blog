// Homepage — list all blog posts
document.addEventListener('DOMContentLoaded', () => {
  auth.renderNav();
  loadPosts();
});

async function loadPosts() {
  const postsContainer = document.getElementById('posts-container');

  postsContainer.innerHTML = `
    <div class="loading-center">
      <div class="spinner"></div>
    </div>
  `;

  try {
    const posts = await api.getPosts();

    if (posts.length === 0) {
      postsContainer.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📝</span>
          <h3>No posts yet</h3>
          <p>Be the first to share something with the world.</p>
          ${auth.isLoggedIn()
            ? `<a href="/create-post.html" class="btn btn-primary">Write a Post</a>`
            : `<a href="/register.html" class="btn btn-primary">Get Started</a>`
          }
        </div>
      `;
      return;
    }

    postsContainer.innerHTML = `<div class="posts-grid">${posts.map(renderPostCard).join('')}</div>`;
  } catch (err) {
    postsContainer.innerHTML = `
      <div class="alert alert-error">
        Failed to load posts. Make sure the backend server is running at http://localhost:3000.
      </div>
    `;
  }
}

function renderPostCard(post) {
  const excerpt = post.content.length > 150
    ? escapeHtml(post.content.slice(0, 150)) + '…'
    : escapeHtml(post.content);

  return `
    <article class="post-card">
      <h2 class="post-card-title">
        <a href="/post.html?id=${post.id}">${escapeHtml(post.title)}</a>
      </h2>
      <div class="post-meta">
        <span class="author">✍️ ${escapeHtml(post.author)}</span>
        <span class="dot">•</span>
        <span>${formatDate(post.created_at)}</span>
        ${post.created_at !== post.updated_at
          ? `<span class="dot">•</span><span>Updated ${formatDate(post.updated_at)}</span>`
          : ''
        }
      </div>
      <p class="post-excerpt">${excerpt}</p>
      <a href="/post.html?id=${post.id}" class="read-more">Read more →</a>
    </article>
  `;
}
