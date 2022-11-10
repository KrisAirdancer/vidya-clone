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

/**
 * Returns the tracks-master-list.json that is needed to render the Tracks List
 * HTML element on the vidya-player UI.
 * 
 * All data returned in the response body.
 */
app.get('/', (req, res) => {
  res.send('Hello World!')
})

/***** LAUNCH APPLICATION *****/

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})


// TODO: Build Node.js server here.