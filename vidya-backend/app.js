const express = require('express');
const path = require('path');
const fs = require('fs');
const vidyaRoutes = require('./routers/vidyaRoutes.js');

/***** CONFIGURATIONS *****/

const PORT = 11001;
const TRACK_LISTS_DIR = './data';

/***** APPLICATION SETUP *****/

const app = express();

// Expose public directory
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', vidyaRoutes);

/***** ROUTING *****/

// TODO: Add a generic "404 resource not found" route here (outside of the routers) - 404 or 400?

/***** LAUNCH APPLICATION *****/

app.listen(PORT, () => {
  console.log(`vidya-backend is listening on port ${PORT}`)
})
