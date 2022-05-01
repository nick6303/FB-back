const errorHelper = (res, message = null, error = null) => {
  const response = {}
  if (message) {
    response.message = message
  }
  if (error) {
    const { code, keyValue } = error
    if (code === 11000) {
      const keys = Object.keys(keyValue).join('、')
      response.message = `${keys}已存在`
    } else {
      response.error = error
    }
  }
  res.status(400).json(response)
}

module.exports = errorHelper
