const express = require('express');
const store = require('./store');

const app = express();
app.use(express.json());

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', host: req.hostname });
});

// Posts — optional :id? param (breaks in Express 5)
app.get('/api/posts{/:id}', (req, res) => {
  if (req.params.id) {
    const post = store.posts.getById(req.params.id);
    if (!post) return res.sendStatus(404);
    return res.json(post);
  }
  res.json(store.posts.getAll());
});

// Create post
app.post('/api/posts', (req, res) => {
  const { title, body, author, tags } = req.body;
  if (!title || !body || !author) {
    return res.status(400).json({ error: 'title, body, and author required' });
  }
  const post = store.posts.create({ title, body, author, tags: tags || [] });
  res.status(201).json(post);
});

// Update post
app.put('/api/posts/:id', (req, res) => {
  const post = store.posts.update(req.params.id, req.body);
  if (!post) return res.sendStatus(404);
  res.json(post);
});

// Delete post
app.delete('/api/posts/:id', (req, res) => {
  const removed = store.posts.remove(req.params.id);
  if (!removed) return res.sendStatus(404);
  res.json({ deleted: true });
});

// Comments for a post
app.get('/api/posts/:postId/comments', (req, res) => {
  const comments = store.comments.getByPost(req.params.postId);
  res.json(comments);
});

// Add comment
app.post('/api/posts/:postId/comments', (req, res) => {
  const { author, text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });
  const comment = store.comments.create({ postId: parseInt(req.params.postId), author, text });
  res.status(201).json(comment);
});

// Search posts — /api/search/* wildcard (breaks in Express 5)
app.get('/api/search/{*path}', (req, res) => {
  const query = req.url.replace('/api/search/', '');
  const results = store.posts.search(decodeURIComponent(query));
  res.json(results);
});

// Static pages catch-all — /pages/* wildcard (breaks in Express 5)
app.get('/pages/{*path}', (req, res) => {
  res.json({ page: req.url, content: 'Static page content' });
});

// 404 catch-all
app.all('{*path}', (req, res) => {
  res.status(404).json({ error: 'Not found', path: req.url });
});

if (require.main === module) {
  app.listen(3000, () => console.log('Server on :3000'));
}

module.exports = app;
