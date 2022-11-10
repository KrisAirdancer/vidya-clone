const express = require('express')
const app = express()

const PORT = 11002;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})






// TODO: Build Node.js server here.