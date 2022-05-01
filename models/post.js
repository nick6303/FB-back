const mongoose = require('mongoose')
const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: [true, '請輸入您的名字'],
    },
    content: {
      type: String,
      required: [true, '未輸入內容'],
    },
    likes: {
      type: Number,
      default: 0,
    },
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
