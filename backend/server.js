const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const commentsRoutes = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Resolve frontend path — works from repo root or /backend
const frontendPath = path.resolve(__dirname, '..', 'frontend');
console.log('Frontend path:', frontendPath);
console.log('Frontend exists:', fs.existsSync(frontendPath));
console.log('index.html exists:', fs.existsSync(path.join(frontendPath, 'index.html')));

// Serve frontend static files
app.use(express.static(frontendPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);

// API 404
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Catch-all: serve index.html for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Blog platform server running at http://localhost:${PORT}`);
  console.log(`Frontend served at http://localhost:${PORT}`);
});

module.exports = app;
