const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/posts - all posts (public)
router.get('/', (req, res) => {
  try {
    const posts = db.prepare(`
      SELECT p.id, p.title, p.content, p.created_at, p.updated_at,
             u.username AS author, u.id AS user_id
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `).all();

    return res.json(posts);
  } catch (err) {
    console.error('Get posts error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/posts/:id - single post with comments (public)
router.get('/:id', (req, res) => {
  try {
    const post = db.prepare(`
      SELECT p.id, p.title, p.content, p.created_at, p.updated_at,
             u.username AS author, u.id AS user_id
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comments = db.prepare(`
      SELECT c.id, c.content, c.created_at,
             u.username, u.id AS user_id
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).all(req.params.id);

    return res.json({ ...post, comments });
  } catch (err) {
    console.error('Get post error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/posts - create post (auth required)
router.post('/', authenticateToken, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  if (title.trim().length < 3) {
    return res.status(400).json({ message: 'Title must be at least 3 characters' });
  }

  if (content.trim().length < 10) {
    return res.status(400).json({ message: 'Content must be at least 10 characters' });
  }

  try {
    const result = db.prepare(
      'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)'
    ).run(req.user.id, title.trim(), content.trim());

    const post = db.prepare(`
      SELECT p.id, p.title, p.content, p.created_at, p.updated_at,
             u.username AS author, u.id AS user_id
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json(post);
  } catch (err) {
    console.error('Create post error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/posts/:id - edit post (auth required, own posts only)
router.put('/:id', authenticateToken, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  if (title.trim().length < 3) {
    return res.status(400).json({ message: 'Title must be at least 3 characters' });
  }

  if (content.trim().length < 10) {
    return res.status(400).json({ message: 'Content must be at least 10 characters' });
  }

  try {
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own posts' });
    }

    db.prepare(
      'UPDATE posts SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(title.trim(), content.trim(), req.params.id);

    const updatedPost = db.prepare(`
      SELECT p.id, p.title, p.content, p.created_at, p.updated_at,
             u.username AS author, u.id AS user_id
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(req.params.id);

    return res.json(updatedPost);
  } catch (err) {
    console.error('Update post error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/posts/:id - delete post (auth required, own posts only)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);

    return res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete post error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/posts/:id/comments - get comments for a post (public)
router.get('/:id/comments', (req, res) => {
  try {
    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comments = db.prepare(`
      SELECT c.id, c.content, c.created_at,
             u.username, u.id AS user_id
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).all(req.params.id);

    return res.json(comments);
  } catch (err) {
    console.error('Get comments error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/posts/:id/comments - add comment (auth required)
router.post('/:id/comments', authenticateToken, (req, res) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: 'Comment content is required' });
  }

  try {
    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const result = db.prepare(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)'
    ).run(req.params.id, req.user.id, content.trim());

    const comment = db.prepare(`
      SELECT c.id, c.content, c.created_at,
             u.username, u.id AS user_id
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json(comment);
  } catch (err) {
    console.error('Add comment error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
