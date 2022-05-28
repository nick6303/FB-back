const mongoose = require('mongoose')
const cors = require('cors')
const express = require('express')
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })
const DATABASE = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
)

const indexRouter = require('./routes/index')
const postRouter = require('./routes/post')
const userRouter = require('./routes/user')
const uploadRouter = require('./routes/upload')

// 程式出現重大錯誤時
process.on('uncaughtException', (err) => {
  // 記錄錯誤下來，等到服務都處理完後，停掉該 process
  console.error('Uncaughted Exception！')
  console.error(err)
  process.exit(1)
})

const app = express()
app.use(express.json())
app.use(cors())

app.use('/post', postRouter)
app.use('/user', userRouter)
app.use('/upload', uploadRouter)
app.use('/', indexRouter)

app.use(function (req, res, next) {
  res.status(404).send('抱歉，您的網頁找不到')
})

// express 錯誤處理
// 自己設定的 err 錯誤
const resErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      message: err.message,
    })
  } else {
    // log 紀錄
    console.error('出現重大錯誤', err)
    // 送出罐頭預設訊息
    res.status(500).json({
      status: 'error',
      message: '系統錯誤，請恰系統管理員',
    })
  }
}
// 開發環境錯誤
const resErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack,
  })
}

app.use(function (err, req, res, next) {
  err.statusCode = err.statusCode || 500
  if (process.env.NODE_ENV === 'dev') {
    return resErrorDev(err, res)
  }
  // production
  if (err.name === 'ValidationError') {
    err.message = '資料欄位未填寫正確，請重新輸入！'
    err.isOperational = true
    return resErrorProd(err, res)
  }
  resErrorProd(err, res)
})

mongoose
  .connect(DATABASE)
  .then(() => {
    console.log('資料庫連線成功')
  })
  .catch((error) => {
    console.log(error)
  })

// 未捕捉到的 catch
process.on('unhandledRejection', (reason, promise) => {
  console.error('未捕捉到的 rejection：', promise, '原因：', reason)
  // 記錄於 log 上
})

const port = process.env.PORT || 3000
app.listen(port)

module.exports = app
