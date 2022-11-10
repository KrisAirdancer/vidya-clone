const express = require('express');
const path = require('path');

/***** CONFIGURATIONS *****/

const PORT = 11001;

/***** ROUTING *****/

/***** APPLICATION SETUP *****/

const app = express();

// Expose public directory
app.use(express.static(path.join(__dirname, 'public')));

/***** ROUTING *****/

app.get('/', (req, res) => {
  // res.send('Hello World!')
  res.sendFile('index.html')
})

/***** LAUNCH APPLICATION *****/

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})


// TODO: Build Node.js server here.
// TODO: Restructure public to have public/tracks and public/resources
    // public/resources should contain .css files, images, favicons, etc.