var http = require('http')
http.createServer(function (req, res) {
  res.write('Hello!')
  res.end()
})
  .listen(3020)
