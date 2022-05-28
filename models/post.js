const mongoose = require('mongoose')
const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
    },
    content: {
      type: String,
      required: [true, '未輸入內容'],
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    image: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

const Post = new mongoose.model('Post', postSchema)
module.exports = Post
