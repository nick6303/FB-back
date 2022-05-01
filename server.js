const mongoose = require('mongoose')
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

const app = express()
app.use(express.json())

app.use('/post', postRouter)
app.use('/user', userRouter)
app.use('/', indexRouter)

app.use(function (req, res, next) {
  res.status(404).send('抱歉，您的網頁找不到')
})

app.use(function (err, req, res, next) {
  console.log(err)
  res.status(500).send('程式有些問題，請稍後再試')
})

mongoose
  .connect(DATABASE)
  .then(() => {
    console.log('資料庫連線成功')
  })
  .catch((error) => {
    console.log(error)
  })

const port = process.env.PORT || 3000
app.listen(port)
