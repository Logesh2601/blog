const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// DELETE /api/comments/:id - delete comment (auth required, own comments only)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);

    return res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Delete comment error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
