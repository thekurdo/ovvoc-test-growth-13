const posts = [];
const comments = [];
let nextPostId = 1;
let nextCommentId = 1;

module.exports = {
  posts: {
    getAll: () => posts.slice(),
    getById: (id) => posts.find(p => p.id === parseInt(id)),
    getBySlug: (slug) => posts.find(p => p.slug === slug),
    create: (data) => {
      const post = {
        id: nextPostId++,
        ...data,
        slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        published: false,
        createdAt: new Date().toISOString(),
      };
      posts.push(post);
      return post;
    },
    update: (id, updates) => {
      const post = posts.find(p => p.id === parseInt(id));
      if (!post) return null;
      Object.assign(post, updates);
      return post;
    },
    remove: (id) => {
      const idx = posts.findIndex(p => p.id === parseInt(id));
      if (idx === -1) return false;
      posts.splice(idx, 1);
      return true;
    },
    search: (q) => posts.filter(p => p.title.includes(q) || p.body.includes(q)),
    reset: () => { posts.length = 0; nextPostId = 1; },
  },
  comments: {
    getByPost: (postId) => comments.filter(c => c.postId === parseInt(postId)),
    create: (data) => {
      const comment = { id: nextCommentId++, ...data, createdAt: new Date().toISOString() };
      comments.push(comment);
      return comment;
    },
    reset: () => { comments.length = 0; nextCommentId = 1; },
  },
};
