const errorHelper = (res, message = null, error = null) => {
  const response = {}
  if (message) {
    response.message = message
  }
  if (error) {
    response.error = error
  }
  res.status(400).json(response)
}

module.exports = errorHelper
