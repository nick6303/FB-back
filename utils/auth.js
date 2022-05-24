const appError = require('../utils/appError')
const handelErrorAsync = require('../utils/handelErrorAsync')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const secret = process.env.JWT_SECRET

const isAuth = handelErrorAsync(async (req, res, next) => {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(appError(401, '你尚未登入！', next))
  }

  const decord = await new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, payload) => {
      if (err) {
        reject(err)
      } else {
        resolve(payload)
      }
    })
  })

  const currentUser = await User.findById(decord.id)
  if (!currentUser) {
    return next(appError(403, 'token 已失效', next))
  }

  req.user = currentUser
  next()
})

const generateSendJwt = (user, res, statusCode) => {
  const jwtToken = jwt.sign({ id: user._id }, secret, {
    expiresIn: '90d',
  })
  user.password = undefined

  res.status(statusCode).json({
    status: 'success',
    user: {
      name: user.name,
      token: jwtToken,
    },
  })
}

module.exports = {
  isAuth,
  generateSendJwt,
}
