const express = require('express')
const router = express.Router()
const appError = require('../utils/appError')
const handelErrorAsync = require('../utils/handelErrorAsync')
const { isAuth } = require('../utils/auth')

const Post = require('../models/post')
const Comment = require('../models/comment')

router.get(
  '/',
  isAuth,
  handelErrorAsync(async (req, res, next) => {
    const timeSort = req.query.timeSort === 'asc' ? 'createdAt' : '-createdAt'
    const q =
      req.query.q !== undefined ? { content: new RegExp(req.query.q) } : {}
    const posts = await Post.find(q)
      .populate({
        path: 'user',
        select: 'name photo',
      })
      .populate({
        path: 'comments',
        select: 'content user',
      })
      .sort(timeSort)
    res.status(200).json({
      status: 'success',
      data: posts,
    })
  })
)

router.get(
  '/:id',
  handelErrorAsync(async (req, res, next) => {
    const id = req.params.id
    const post = await Post.findById(id).populate({
      path: 'user',
      select: 'name photo',
    })
    if (post) {
      res.status(200).json({
        status: 'success',
        data: post,
      })
    } else {
      return next(appError(400, '查無此IP', next))
    }
  })
)

router.post(
  '/',
  isAuth,
  handelErrorAsync(async (req, res, next) => {
    const user = req.user
    const data = req.body
    const { content } = data
    if (!content) {
      return next(appError(400, '內容未填寫', next))
    }
    const params = {
      user: user._id,
      content,
    }

    if (data.image) {
      params.image = data.image
    }
    const newPost = await Post.create(params)
    res.status(200).json({
      status: 'success',
      data: newPost,
    })
  })
)

router.delete(
  '/all',
  handelErrorAsync(async (req, res, next) => {
    await Post.deleteMany({})
    res.status(200).json({
      status: 'success',
      message: '全部刪除成功',
    })
  })
)

router.get(
  '/user/:id',
  isAuth,
  handelErrorAsync(async (req, res, next) => {
    const id = req.user.id
    const postsList = await Post.find({
      user: id,
    })

    res.status(200).json({
      status: 'success',
      data: postsList,
    })
  })
)

router.delete(
  '/:id',
  handelErrorAsync(async (req, res, next) => {
    const id = req.params.id
    const test = await Post.findByIdAndDelete(id)
    if (test) {
      res.status(200).json({
        status: 'success',
        message: '刪除單筆成功',
      })
    } else {
      return next(appError(400, '查無此IP', next))
    }
  })
)

router.patch(
  '/:id',
  isAuth,
  handelErrorAsync(async (req, res, next) => {
    const id = req.params.id
    const data = req.body
    if (!data.content) {
      return next(appError(400, '內容未填寫', next))
    }
    const params = {
      content: data.content,
    }
    if (data.image !== undefined) {
      params.image = data.image
    }
    if (data.likes !== undefined) {
      params.likes = data.likes
    }
    const post = await Post.findByIdAndUpdate(
      id,
      { $set: params },
      { runValidators: true }
    )
    if (post) {
      Object.assign(post, data)
      res.status(200).json({
        status: 'success',
        data: post,
      })
    } else {
      return next(appError(400, '查無此文章', next))
    }
  })
)

router.post(
  '/:id/likes',
  isAuth,
  handelErrorAsync(async (req, res, next) => {
    const id = req.params.id
    await Post.findByIdAndUpdate(id, {
      $addToSet: {
        likes: req.user.id,
      },
    })

    res.status(200).json({
      status: 'success',
      postId: id,
      userId: req.user.id,
    })
  })
)

router.delete(
  '/:id/likes',
  isAuth,
  handelErrorAsync(async (req, res, next) => {
    const id = req.params.id
    await Post.findByIdAndUpdate(id, {
      $pull: {
        likes: req.user.id,
      },
    })

    res.status(200).json({
      status: 'success',
      postId: id,
      userId: req.user.id,
    })
  })
)

router.post(
  '/:id/comments',
  isAuth,
  handelErrorAsync(async (req, res, next) => {
    const postid = req.params.id
    const data = req.body
    const { content } = data

    const newComment = await Comment.create({
      post: postid,
      user: req.user.id,
      content,
    })

    res.status(200).json({
      status: 'success',
      data: newComment,
    })
  })
)

module.exports = router
