const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  body: { type: String, required: true },
  author: { type: String, required: true },
  tags: [String],
  published: { type: Boolean, default: false },
}, { timestamps: true });

postSchema.methods.summarize = function() {
  return { id: this._id, title: this.title, slug: this.slug, published: this.published };
};

const commentSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  author: String,
  text: { type: String, required: true },
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);

module.exports = { Post, Comment, postSchema, commentSchema };
