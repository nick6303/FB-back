const express = require('express')
const router = express.Router()
const appError = require('../utils/appError')
const handelErrorAsync = require('../utils/handelErrorAsync')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const Post = require('../models/post')
const { isAuth, generateSendJwt } = require('../utils/auth')

router.post(
  '/sign_up',
  handelErrorAsync(async (req, res, next) => {
    const data = req.body
    const { name, photo, email, password, password2 } = data
    const keys = ['name', 'email', 'password', 'password2']
    const errors = []
    keys.forEach((key) => {
      if (!data[key]) {
        errors.push(key)
      }
    })

    if (errors.length > 0) {
      return next(appError(400, `${errors.join('、')}未填寫`, next))
    }

    if (password !== password2) {
      return next(appError(400, `密碼不相同`, next))
    }
    if (!validator.isLength(password, { min: 8 })) {
      return next(appError(400, `密碼不滿8個字`, next))
    }
    if (!validator.isEmail(email)) {
      return next(appError(400, `email格式不正確`, next))
    }

    const matches = await User.find({ email: data.email })
    if (matches.length > 0) {
      return next(appError(400, 'email已使用', next))
    }
    const bcryptPassword = await bcrypt.hash(password, 12)
    const newUser = await User.create({
      name,
      email,
      photo,
      password: bcryptPassword,
    })

    res.status(200).json({
      status: 'success',
      data: newUser,
    })
  })
)

router.post(
  '/sign_in',
  handelErrorAsync(async (req, res, next) => {
    const data = req.body

    const { email, password } = data

    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return next(appError(403, '無此使用者', next))
    }
    const auth = await bcrypt.compare(password, user.password)

    if (!auth) {
      return next(appError(403, '密碼錯誤', next))
    }

    generateSendJwt(user, res, 200)
  })
)

router.get(
  '/profile',
  isAuth,
  handelErrorAsync(async (req, res, next) => {
    const id = req.user.id
    const user = await User.findById(id).select('+email')
    res.status(200).json({
      status: 'success',
      data: user,
    })
  })
)

router.patch(
  '/profile',
  isAuth,
  handelErrorAsync(async (req, res, next) => {
    const id = req.user.id
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
    }
  })
)

router.post(
  '/updatePassword',
  isAuth,
  handelErrorAsync(async (req, res, next) => {
    const id = req.user.id
    const data = req.body
    const { password, password2 } = data
    const keys = ['password', 'password2']
    const errors = []
    keys.forEach((key) => {
      if (!data[key]) {
        errors.push(key)
      }
    })

    if (errors.length > 0) {
      return next(appError(400, `${errors.join('、')}未填寫`, next))
    }

    if (password !== password2) {
      return next(appError(400, `密碼不相同`, next))
    }
    if (!validator.isLength(password, { min: 8 })) {
      return next(appError(400, `密碼不滿8個字`, next))
    }

    const newPassword = await bcrypt.hash(password, 12)

    const user = await User.findByIdAndUpdate(id, {
      $set: { password: newPassword },
    })

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    })
  })
)

router.get(
  '/',
  isAuth,
  handelErrorAsync(async (req, res, next) => {
    const users = await User.find()
    res.status(200).json({
      status: 'success',
      data: users,
    })
  })
)

router.get(
  '/getLikeList',
  isAuth,
  handelErrorAsync(async (req, res, next) => {
    const likeList = await Post.find({
      likes: { $in: [req.user.id] },
    }).populate({
      path: 'user',
      select: 'name',
    })
    res.status(200).json({
      status: 'success',
      data: {
        likeList,
      },
    })
  })
)

router.post(
  '/',
  isAuth,
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
      return next(appError(400, `${errors.join('、')}未填寫`, next))
    }

    const matches = await User.find({ email: data.email })
    if (matches.length > 0) {
      return next(appError(400, 'email已使用', next))
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
  '/all',
  isAuth,
  handelErrorAsync(async (req, res, next) => {
    await User.deleteMany({})
    res.status(200).json({
      status: 'success',
      message: '全部刪除成功',
    })
  })
)

router.get(
  '/:id',
  isAuth,
  handelErrorAsync(async (req, res, next) => {
    const id = req.params.id
    const user = await User.findById(id, { email: 0 })
    if (user) {
      res.status(200).json({
        status: 'success',
        data: user,
      })
    } else {
      return next(appError(400, '查無此ID', next))
    }
  })
)

router.delete(
  '/:id',
  isAuth,
  handelErrorAsync(async (req, res, next) => {
    const id = req.params.id
    const test = await User.findByIdAndDelete(id)
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

router.post(
  '/:id/follow',
  isAuth,
  handelErrorAsync(async (req, res, next) => {
    const targetId = req.params.id
    const userId = req.user.id

    if (targetId === userId) {
      return next(appError(400, '不可追蹤自己', next))
    }

    const newUser = await User.updateOne(
      { _id: userId, 'following.user': { $ne: targetId } },
      {
        $addToSet: {
          following: { user: targetId },
        },
      }
    )

    await User.findByIdAndUpdate(
      { _id: targetId, 'followers.user': { $ne: userId } },
      {
        $addToSet: {
          followers: { user: userId },
        },
      }
    )

    res.status(200).json({
      status: 'success',
      message: '追蹤成功',
      data: {
        newUser,
      },
    })
  })
)

router.delete(
  '/:id/follow',
  isAuth,
  handelErrorAsync(async (req, res, next) => {
    const targetId = req.params.id
    const userId = req.user.id
    const newUser = await User.findByIdAndUpdate(userId, {
      $pull: {
        following: { user: targetId },
      },
    })

    await User.findByIdAndUpdate(targetId, {
      $pull: {
        followers: { user: userId },
      },
    })

    res.status(200).json({
      status: 'success',
      message: '取消追蹤',
      data: {
        newUser,
      },
    })
  })
)

module.exports = router
