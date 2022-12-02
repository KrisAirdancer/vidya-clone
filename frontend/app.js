const express = require('express');
const path = require('path');
const axios = require('axios');

/***** CONFIGURATIONS *****/

const PORT = 11001;
const BACKEND_URL = 'http://localhost:11002';

/***** ROUTER & APP SETUP *****/

const app = express();

// Expose public directory
app.use(express.static(path.join(__dirname, 'public')));


// This method for testig the /test route on the backend (vidya-backend).
app.get('/test', (req, res) => {

  let data = '';

  axios.get(`${BACKEND_URL}/test`)
       .then(response => {
         console.log(response.data);
         data = response.data;
       })
       .then(() => {
         res.status(200);
         res.send(data);
       });

});

app.get('/', (req, res) => {
  send('index.html');
});

// /playlist/{playlistName}
// /list/{listName}
// /list/{trackID}
// /chosen-prob/{prob}
// /reset/{listName}

app.get('/current-track', (req, res) => {

  data = '';

  axios.get(`${BACKEND_URL}/current-track`)
       .then(response => {
        console.log(response.data);
        data = response.data;
       })
       .then(() => {
        res.status(200);
        res.send(data);
       })
});

app.get('/random-track', (req, res) => {

  data = '';

  axios.get(`${BACKEND_URL}/random-track`)
       .then(response => {
        console.log(response.data);
        data = response.data;
       })
       .then(() => {
        res.status(200);
        res.send(data);
       })
});

// This method for testing the /playlists route on the backend (vidya-backend).
app.get('/playlists', (req, res) => {

  let data = '';

  axios.get('http://localhost:11002/playlists')
       .then(response => {
        console.log(response.data);
        data = response.data;
       })
       .then(() => {
        res.status(200);
        res.send(data);
       });
});

// This route is for testing the /master route on vidya-backend.
app.get('/master', (req, res) => {

  let data = '';

  axios.get('http://localhost:11002/master')
       .then(response => {
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
});


// TODO: Add proper documentation comments to all of the routes in this file.
// TODO: Add docs to all routes in this file.