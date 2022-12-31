const express = require('express');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');

/***** CONFIGURATIONS *****/

const PORT = 11001;
const BACKEND_URL = 'http://localhost:11002';

/***** ROUTER & APP SETUP *****/

const app = express();

// Expose public directory
app.use(express.static(path.join(__dirname, 'public')));

// body-parser to parse JSON request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// This method for testig the /test route on the backend (vidya-backend).
app.get('/test', (req, res) => {

  let data = '';

  axios.get(`${BACKEND_URL}/test`)
       .then(response => {
        //  console.log(response.data);
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

app.get('/current-track', (req, res) => {

  data = '';

  axios.get(`${BACKEND_URL}/current-track`)
       .then(response => {
        // console.log(response.data);
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
        // console.log(response.data);
        data = response.data;
       })
       .then(() => {
        res.status(200);
        res.send(data);
       })
});

app.get('/playlists', (req, res) => {

  let data = '';

  axios.get(`${BACKEND_URL}/playlists`)
       .then(response => {
        // console.log(response.data);
        data = response.data;
       })
       .then(() => {
        res.status(200);
        res.send(data);
       });
});

app.get('/playlist/:playlistName', (req, res) => {

  let playlistName = req.params.playlistName;

  axios.get(`${BACKEND_URL}/playlist/${playlistName}`)
       .then(response => {
          // console.log(response.data);
          data = response.data;
       })
       .then(() => {
          res.status(200);
          res.send(data);
      });
});

app.get('/list/:listName', (req, res) => {

  let listName = req.params.listName;

  axios.get(`${BACKEND_URL}/list/${listName}`)
       .then(response => {
          // console.log(response.data);
          data = response.data;
       })
       .then(() => {
          res.status(200);
          res.send(data);
      });
});

app.get('/master', (req, res) => {

  let data = '';

  axios.get(`${BACKEND_URL}/master`)
       .then(response => {
        // console.log(response.data);
        data = response.data;
       })
       .then(() => {
        res.status(200);
        res.send(data);
       });
});

app.put('/list/:trackID', (req, res) => {

  let trackID = req.params.trackID;

  axios({
    method: 'put',
    url: `${BACKEND_URL}/list/${trackID}`,
    data: {
      list: `${req.body.list}`,
      action: `${req.body.action}`
    },
    validateStatus: function(status) {
      return true;
    }
  }).then(response => {
    res.status(response.status);
    res.send();
  }).catch(response => {
    res.status(response.status);
    res.send();
  });
});

/***** ROUTING *****/

// TODO: Add a generic "404 resource not found" route here (outside of the routers) - 404 or 400?

/***** LAUNCH APPLICATION *****/

app.listen(PORT, () => {
  console.log(`vidya-frontend is listening on port ${PORT}`)
});


// TODO: Add proper documentation comments to all of the routes in this file.
// TODO: Add docs to all routes in this file.
// TODO: Remove all print statements
// TODO: Need set the status code of these responses based on the status codes of the responses from the backend