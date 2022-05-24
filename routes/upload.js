const express = require('express')
const router = express.Router()
const appError = require('../utils/appError')
const handelErrorAsync = require('../utils/handelErrorAsync')
const { isAuth } = require('../utils/auth')

router.post(
  '/',
  isAuth,
  handelErrorAsync((req, res, next) => {})
)
