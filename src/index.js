const express = require('express');
const store = require('./store');

const app = express();
app.use(express.json());

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', host: req.host });
});

// Posts — optional :id? param (breaks in Express 5)
app.get('/api/posts/:id?', (req, res) => {
  if (req.params.id) {
    const post = store.posts.getById(req.params.id);
    if (!post) return res.send(404);
    return res.json(post);
  }
  res.json(store.posts.getAll());
});

// Create post
app.post('/api/posts', (req, res) => {
  const { title, body, author, tags } = req.body;
  if (!title || !body || !author) {
    return res.json(400, { error: 'title, body, and author required' });
  }
  const post = store.posts.create({ title, body, author, tags: tags || [] });
  res.status(201).json(post);
});

// Update post
app.put('/api/posts/:id', (req, res) => {
  const post = store.posts.update(req.params.id, req.body);
  if (!post) return res.send(404);
  res.json(post);
});

// Delete post
app.delete('/api/posts/:id', (req, res) => {
  const removed = store.posts.remove(req.params.id);
  if (!removed) return res.send(404);
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
  if (!text) return res.json(400, { error: 'text required' });
  const comment = store.comments.create({ postId: parseInt(req.params.postId), author, text });
  res.status(201).json(comment);
});

// Search posts — /api/search/* wildcard (breaks in Express 5)
app.get('/api/search/*', (req, res) => {
  const query = req.url.replace('/api/search/', '');
  const results = store.posts.search(decodeURIComponent(query));
  res.json(results);
});

// Static pages catch-all — /pages/* wildcard (breaks in Express 5)
app.get('/pages/*', (req, res) => {
  res.json({ page: req.url, content: 'Static page content' });
});

// 404 catch-all
app.all('*', (req, res) => {
  res.json(404, { error: 'Not found', path: req.url });
});

if (require.main === module) {
  app.listen(3000, () => console.log('Server on :3000'));
}

module.exports = app;
