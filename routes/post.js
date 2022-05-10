const express = require('express')
const router = express.Router()
const appError = require('../utils/appError')
const handelErrorAsync = require('../utils/handelErrorAsync')
const { ImgurClient } = require('imgur')
const client = new ImgurClient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
})
const Post = require('../models/post')

router.get(
  '/',
  handelErrorAsync(async (req, res, next) => {
    const timeSort = req.query.timeSort === 'asc' ? 'createdAt' : '-createdAt'
    const q =
      req.query.q !== undefined ? { content: new RegExp(req.query.q) } : {}
    const posts = await Post.find(q)
      .populate({
        path: 'user',
        select: 'name photo',
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
      appError(400, '查無此IP', next)
    }
  })
)

router.post(
  '/',
  handelErrorAsync(async (req, res, next) => {
    const data = req.body
    const keys = ['user', 'content']
    const errors = []
    const params = {}
    keys.forEach((key) => {
      if (data[key]) {
        params[key] = data[key]
      } else {
        errors.push(key)
      }
    })

    const message = errors.join('、')

    if (errors.length > 0) {
      appError(400, `${message}未填寫`, next)
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
  '/',
  handelErrorAsync(async (req, res, next) => {
    await Post.deleteMany({})
    res.status(200).json({
      status: 'success',
      message: '全部刪除成功',
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
      appError(400, '查無此IP', next)
    }
  })
)

router.patch(
  '/:id',
  handelErrorAsync(async (req, res, next) => {
    const id = req.params.id
    const data = req.body
    if (!data.content) {
      appError(400, '內容未填寫', next)
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
    const post = await Post.findByIdAndUpdate(id, { $set: params })
    if (post) {
      Object.assign(post, data)
      res.status(200).json({
        status: 'success',
        data: post,
      })
    } else {
      appError(400, '查無此IP', next)
    }
  })
)

router.post(
  '/upload',
  handelErrorAsync(async (req, res) => {
    const data = req.body
    const response = await client.upload({
      image: data.file,
      type: 'base64',
    })
    res.status(200).json({
      status: 'success',
      data: response,
    })
  })
)

module.exports = router
