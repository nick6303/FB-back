const mongoose = require('mongoose')
const CommentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.ObjectId,
    ref: 'post',
    required: [true, '未輸入 post ID'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: [true, '未輸入user ID'],
  },
  content: {
    type: String,
    required: [true, '未輸入內容'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
})

CommentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name id createdAt',
  })
  next()
})

const Comment = new mongoose.model('Comment', CommentSchema)

module.exports = Comment
