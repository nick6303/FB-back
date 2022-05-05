const express = require('express')
const router = express.Router()
const errorHelper = require('../utils/errorHelper')
const { ImgurClient } = require('imgur')
const client = new ImgurClient({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
})
const Post = require('../models/post')

router.get('/', async (req, res) => {
  const timeSort = req.query.timeSort === 'asc' ? 'createdAt' : '-createdAt'
  const q =
    req.query.q !== undefined ? { content: new RegExp(req.query.q) } : {}
  try {
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
  } catch (error) {
    res.status(400).json({
      status: 'success',
      error,
    })
  }
})

router.get('/:id', async (req, res) => {
  const id = req.params.id
  try {
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
      errorHelper(res, '查無此ID')
    }
  } catch (error) {
    errorHelper(res, '', error)
  }
})

router.post('/', async (req, res) => {
  const data = req.body
  if (data.content === '' || data.content === undefined) {
    errorHelper(res, '內容未填寫')
  }
  const params = {
    user: data.user,
    content: data.content,
  }
  if (data.image !== undefined) {
    params.image = data.image
  }
  try {
    const newPost = await Post.create(params)
    res.status(200).json({
      status: 'success',
      data: newPost,
    })
  } catch (error) {
    errorHelper(res, '欄位未填寫正確', error)
  }
})

router.delete('/', async (req, res) => {
  try {
    await Post.deleteMany({})
    res.status(200).json({
      status: 'success',
      message: '全部刪除成功',
    })
  } catch (error) {
    errorHelper(res, '全部刪除失敗', error)
  }
})

router.delete('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const test = await Post.findByIdAndDelete(id)
    if (test) {
      res.status(200).json({
        status: 'success',
        message: '刪除單筆成功',
      })
    } else {
      errorHelper(res, '查無此IP')
    }
  } catch (error) {
    errorHelper(res, '', error)
  }
})

router.patch('/:id', async (req, res) => {
  const id = req.params.id
  const data = req.body
  const params = {
    content: data.content,
  }
  if (data.image !== undefined) {
    params.image = data.image
  }
  if (data.likes !== undefined) {
    params.likes = data.likes
  }
  try {
    const post = await Post.findByIdAndUpdate(id, { $set: params })
    if (post) {
      Object.assign(post, data)
      res.status(200).json({
        status: 'success',
        data: post,
      })
    } else {
      errorHelper(res, '或查無此ID')
    }
  } catch (error) {
    errorHelper(res, '欄位未填寫正確', error)
  }
})

router.post('/upload', async (req, res) => {
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

module.exports = router
