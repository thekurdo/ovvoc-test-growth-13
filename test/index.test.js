const assert = require('assert');
const app = require('../src/index');
const store = require('../src/store');

async function runTests() {
  const server = await new Promise(resolve => {
    const s = app.listen(0, () => resolve(s));
  });
  const port = server.address().port;
  const base = `http://localhost:${port}`;
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try { await fn(); passed++; }
    catch (err) { failed++; console.error(`FAIL: ${name} — ${err.message}`); }
  }

  store.posts.reset();
  store.comments.reset();

  await test('GET /health', async () => {
    const res = await fetch(`${base}/health`);
    assert.strictEqual(res.status, 200);
  });

  await test('GET /api/posts returns empty', async () => {
    const res = await fetch(`${base}/api/posts`);
    assert.strictEqual(res.status, 200);
    const d = await res.json();
    assert.strictEqual(d.length, 0);
  });

  await test('POST /api/posts creates', async () => {
    const res = await fetch(`${base}/api/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'First Post', body: 'Hello world', author: 'admin', tags: ['intro'] }),
    });
    assert.strictEqual(res.status, 201);
  });

  await test('GET /api/posts/:id', async () => {
    const res = await fetch(`${base}/api/posts/1`);
    assert.strictEqual(res.status, 200);
    const d = await res.json();
    assert.strictEqual(d.title, 'First Post');
  });

  await test('GET /api/posts (list)', async () => {
    const res = await fetch(`${base}/api/posts`);
    const d = await res.json();
    assert.strictEqual(d.length, 1);
  });

  await test('PUT /api/posts/:id', async () => {
    const res = await fetch(`${base}/api/posts/1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: true }),
    });
    assert.strictEqual(res.status, 200);
    const d = await res.json();
    assert.strictEqual(d.published, true);
  });

  await test('POST /api/posts/:postId/comments', async () => {
    const res = await fetch(`${base}/api/posts/1/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: 'user', text: 'Great post!' }),
    });
    assert.strictEqual(res.status, 201);
  });

  await test('GET /api/posts/:postId/comments', async () => {
    const res = await fetch(`${base}/api/posts/1/comments`);
    assert.strictEqual(res.status, 200);
    const d = await res.json();
    assert.strictEqual(d.length, 1);
    assert.strictEqual(d[0].text, 'Great post!');
  });

  await test('GET /api/search/* finds posts', async () => {
    const res = await fetch(`${base}/api/search/First`);
    assert.strictEqual(res.status, 200);
    const d = await res.json();
    assert.strictEqual(d.length, 1);
  });

  await test('GET /pages/* returns page', async () => {
    const res = await fetch(`${base}/pages/about`);
    assert.strictEqual(res.status, 200);
  });

  await test('DELETE /api/posts/:id', async () => {
    const res = await fetch(`${base}/api/posts/1`, { method: 'DELETE' });
    assert.strictEqual(res.status, 200);
  });

  await test('GET /unknown returns 404', async () => {
    const res = await fetch(`${base}/nonexistent`);
    assert.strictEqual(res.status, 404);
  });

  server.close();
  console.log(`${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => { console.error(err); process.exit(1); });
