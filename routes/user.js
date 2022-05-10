const express = require('express')
const router = express.Router()
const appError = require('../utils/appError')
const handelErrorAsync = require('../utils/handelErrorAsync')

const User = require('../models/user')

router.get(
  '/',
  handelErrorAsync(async (req, res, next) => {
    const users = await User.find()
    res.status(200).json({
      status: 'success',
      data: users,
    })
  })
)

router.get(
  '/:id',
  handelErrorAsync(async (req, res, next) => {
    const id = req.params.id
    const user = await User.findById(id, { email: 0 })
    if (user) {
      res.status(200).json({
        status: 'success',
        data: user,
      })
    } else {
      appError(400, '查無此ID', next)
    }
  })
)

router.post(
  '/',
  handelErrorAsync(async (req, res, next) => {
    const data = req.body
    const params = {}
    const keys = ['name', 'email']
    const errors = []
    keys.forEach((key) => {
      if (data[key]) {
        params[key] = data[key]
      } else {
        errors.push(key)
      }
    })

    if (errors.length > 0) {
      appError(400, `${errors.join('、')}未填寫`, next)
    }

    const matches = await User.find({ email: data.email })
    if (matches.length > 0) {
      appError(400, 'email已使用', next)
    }

    if (data.photo) {
      params.photo = data.photo
    }
    const newUser = await User.create(params)
    res.status(200).json({
      status: 'success',
      data: newUser,
    })
  })
)

router.delete(
  '/',
  handelErrorAsync(async (req, res, next) => {
    await User.deleteMany({})
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
    const test = await User.findByIdAndDelete(id)
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
    const params = {}
    const keys = ['name', 'email', 'photo']
    keys.forEach((key) => {
      if (data[key] !== undefined) {
        params[key] = data[key]
      }
    })

    const user = await User.findByIdAndUpdate(id, { $set: params })
    if (user) {
      Object.assign(user, data)
      res.status(200).json({
        status: 'success',
        data: user,
      })
    } else {
      appError(400, '查無此IP', next)
    }
  })
)

module.exports = router
