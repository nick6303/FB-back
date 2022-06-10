const express = require('express')
const router = express.Router()
const appError = require('../utils/appError')
const handelErrorAsync = require('../utils/handelErrorAsync')
const { isAuth } = require('../utils/auth')
const upload = require('../utils/image')
const { ImgurClient } = require('imgur')

router.post(
  '/image',
  upload,
  isAuth,
  handelErrorAsync(async (req, res, next) => {
    if (!req.files.length) {
      return next(appError(400, '未上傳檔案', next))
    }

    const client = new ImgurClient({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.CLIENT_REFRESH_TOKEN,
    })

    const response = await client.upload({
      image: req.files[0].buffer.toString('base64'),
      type: 'base64',
      album: process.env.ALBUM_ID,
    })

    if (response.data.link) {
      res.status(200).json({
        status: 'success',
        data: {
          imgUrl: response.data.link,
        },
      })
    } else {
      return next(appError(400, '上傳失敗', next))
    }
  })
)

module.exports = router
