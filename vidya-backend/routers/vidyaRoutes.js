const express = require('express');
const fs = require('fs');

/***** APPLICATION SETUP *****/

// Create Router
const router = express.Router();

/***** CONFIGURATIONS *****/

const PORT = 11001;
const TRACK_LISTS_DIR = './data';

/***** ROUTING *****/

// GET

/**
 * Returns the tracks-master-list.json that is needed to render the Tracks List
 * HTML element on the vidya-player UI.
 * 
 * All data returned in the response body.
 */
 router.get('/', (req, res) => {
    res.send('Hello World!');
    // TODO: Implement this route.
  });
  
  /**
   * Returns a JSON representation of the specified list.
   * 
   * :listName is the name of the list to be returned.
   */
  router.get('/list/:listName', (req, res) => {
  
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
  
  // PUT
  
  // POST
  
  // There are no POST routes in this API.
  
  // DELETE

  module.exports = router;