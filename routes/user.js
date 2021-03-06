const express = require('express')
const router = express.Router()
const errorHelper = require('../utils/errorHelper')

const User = require('../models/user')

router.get('/', async (req, res) => {
  try {
    const users = await User.find()
    res.status(200).json({
      status: 'success',
      data: users,
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
    const user = await User.findById(id, { email: 0 })
    if (user) {
      res.status(200).json({
        status: 'success',
        data: user,
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
  const params = {
    name: data.name,
    email: data.email,
  }
  if (data.photo) {
    params.photo = data.photo
  }
  try {
    const newUser = await User.create(params)
    res.status(200).json({
      status: 'success',
      data: newUser,
    })
  } catch (error) {
    errorHelper(res, '欄位未填寫正確', error)
  }
})

router.delete('/', async (req, res) => {
  try {
    await User.deleteMany({})
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
    const test = await User.findByIdAndDelete(id)
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
  const params = {}
  if (data.name !== undefined) {
    params.name = data.name
  }
  if (data.email !== undefined) {
    params.email = data.email
  }
  if (data.photo !== undefined) {
    params.photo = data.photo
  }

  try {
    const user = await User.findByIdAndUpdate(id, { $set: params })
    if (user) {
      Object.assign(user, data)
      res.status(200).json({
        status: 'success',
        data: user,
      })
    } else {
      errorHelper(res, '或查無此ID')
    }
  } catch (error) {
    errorHelper(res, '欄位未填寫正確', error)
  }
})

module.exports = router
