const express = require('express');
const path = require('path');
const axios = require('axios');

/***** CONFIGURATIONS *****/

const PORT = 11001;

/***** ROUTER & APP SETUP *****/

const app = express();

// Expose public directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  send('index.html');
});

app.get('/test', (req, res) => {

  let data = 'BLANK';

  axios.get('http://localhost:11002/test')
       .then(response => {
         // console.log(response);
         console.log(response.data);
         data = response.data;
       })
       .then(() => {
         res.status(200);
         res.send(data);
       });

});

/***** ROUTING *****/

// TODO: Add a generic "404 resource not found" route here (outside of the routers) - 404 or 400?

/***** LAUNCH APPLICATION *****/

app.listen(PORT, () => {
  console.log(`vidya-backend is listening on port ${PORT}`)
})
