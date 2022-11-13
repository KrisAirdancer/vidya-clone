const express = require('express');
const path = require('path');
const vidyaRoutes = require('./routers/vidyaRoutes.js');

/***** CONFIGURATIONS *****/

const PORT = 11001;

/***** APPLICATION SETUP *****/

const app = express();

// Expose public directory
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', vidyaRoutes);

app.get('/test', (req, res) => {
  res.send('Hello!');
});

/***** ROUTING *****/

// TODO: Add a generic "404 resource not found" route here (outside of the routers) - 404 or 400?

/***** LAUNCH APPLICATION *****/

app.listen(PORT, () => {
  console.log(`vidya-backend is listening on port ${PORT}`)
})
