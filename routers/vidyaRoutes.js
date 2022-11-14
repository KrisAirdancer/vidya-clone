const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

/***** APPLICATION SETUP *****/

// Create Router
const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

/***** CONFIGURATIONS *****/

const TRACK_LISTS_DIR = './public/data';
const PLAYLISTS_DIR = './public/data/playlists';

/***** ROUTING *****/

/* GET */

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
        listName = 'chosen-tracks.csv'
        status = 200;
        break;
      case 'exiled':
        listName = 'exiled-tracks.csv'
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

  /**
   * Returns a human-readable list of the available playlists.
   * 
   * Works only for playlist files with filnames of the format "playlistname-playlist.json".
   * Returns "playlistname" from each filename.
   */
  router.get('/playlists', (req, res) => {

    let playlists = fs.readdirSync(PLAYLISTS_DIR);
    let formattedPlaylists = [];

    playlists.forEach(playlist => {
      formattedPlaylists.push(playlist.split('-')[0]);
    });

    res.status(200);
    res.send(formattedPlaylists);
  });
  
  /* PUT */
  
  /**
   * Adds the given trackID to the tracks list specified in the request body.
   * 
   * The target list must be specified in the response body as "targetList".
   * 
   * @param {*} :trackID The ID of the track to be added to the specified list.
   * @param {*} targetList The list to which the specified trackID will be added.
   */
  router.put('/list/:trackID', (req, res) => {

    let status = 400;

    if (req.body.targetList === undefined || req.body.targetList === null) {
      status = 400;
    } else {
      addTrackToList(req.body.targetList, req.params.trackID);
      status = 200;
    }

    res.status(status);
    res.send();
  });

  /* POST */
  
  // There are no POST routes in this API.
  
  /* DELETE */

/***** HELPER FUNCTIONS *****/

/**
 * Adds the specified trackID to the specifed tracks list.
 * 
 * @param {*} targetList The list to which the trackID will be added.
 * @param {*} trackID The ID of the track to be added to the targetList.
 * @returns The status code to be sent in the response.
 */
function addTrackToList(targetList, trackID) {

  let regExp = /^[0-9]{4}$/;

  if ((targetList !== 'chosen' && targetList !== 'exiled') || !regExp.test(trackID)) { // Matchs a series of digits of length 4. ex. 0034
    return 404;
  }

  let tracksList = fs.readFileSync(path.join(TRACK_LISTS_DIR, `${targetList}-tracks.csv`), 'utf-8');

  if (tracksList.length > 0) {
    tracksList = tracksList.split(',');
  }

  let tracks = new Set(tracksList);
  tracks.add(trackID);

  fs.writeFile(path.join(TRACK_LISTS_DIR, `${targetList}-tracks.csv`), Array.from(tracks).join(','), error => {
    if (error) {
      console.log(error);
    }
  });

  return 200;
}

/***** EXPORTS *****/

module.exports = router;