const express = require('express')
const app = express()

const PORT = 11001;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${PORT}`)
})





// TODO: Build Node.js server here.
// TODO: Restructure public to have public/tracks and public/resources
    // public/resources should contain .css files, images, favicons, etc.