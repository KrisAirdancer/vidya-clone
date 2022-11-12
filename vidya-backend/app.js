const express = require('express');
const path = require('path');
const fs = require('fs');

/***** CONFIGURATIONS *****/

const PORT = 11001;
const TRACK_LISTS_DIR = './data';

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
});

app.get('/list/:listName', (req, res) => {

  let listName = '';
  let status = 400;

  switch(req.params.listName) {
    case 'master':
      listName = 'tracks-master-list.json'
      status = 200;
      break;
    case 'chosen':
      listName = 'chosen-tracks.json'
      status = 200;
      break;
    case 'exiled':
      listName = 'exiled-tracks.json'
      status = 200;
      break;
    default:
      status = 404;
      break;
  }

  if (status !== 400 && status !== 404) {
    
    let readStream = fs.createReadStream(TRACK_LISTS_DIR + '/' + listName);
    
    res.status(200);
    readStream.pipe(res);

  } else {
    res.status(status);
    res.send();
  }
});

/***** LAUNCH APPLICATION *****/

app.listen(PORT, () => {
  console.log(`vidya-backend is listening on port ${PORT}`)
})
