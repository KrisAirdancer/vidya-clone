const express = require('express');
const path = require('path');

const axios = require('axios');
// const axios = require('axios').default;

/***** CONFIGURATIONS *****/

const PORT = 11002;

/***** APPLICATION SETUP *****/

const app = express();

// Expose public directory
app.use(express.static(path.join(__dirname, 'public')));

/***** ROUTING *****/

// TODO: Move routing into a Router() file. This will make the project easier to integrate into krisairdancer-dot-com later on.

app.get('/', (req, res) => {
  // res.send('Hello World!')
  res.sendFile('index.html')

  // Data needed to render the UI
    // tracks-master-list
    // exiled-list
    // chosen-list
    // list of playlists
    // Currently playing track
    // Note: There should be no previous track at this point. This'll have to be handled by the client-side scripts.
    // Note: The next track should be an API call from the client to the frontend and then a frontend to backend API call. The backend calculates the next track to be played and returns the trackID.

  // OUTLINE
    // Make API call to backend using Axios to get the tracks-master-list data.
    // Two Options:
      // 1) Build the HTML string that is the list of tracks on the UI and insert it into the index.html file. Then return index.html in the response
        // This seems problematic. Go with option 2.
      // 2) Append the tracks-master-list data to the response body and have a script on the frontend kick-in to generate the tracks list HTML
        // Could attach a script.js file to index.html using a <script> tag so that it runs when the HTML file first arrives at the client. That script.js script could then generate the tracks list HTML and append it to the DOM - The index.html can have a tag/id where this should be inserted.
        // In this same response, send separate objects for the exiled and chosen tracks lists and have a script on the frontend that parses these lists and updates the highlighting on the DOM according to the lists.
    // Make API call to backend using Axios to get the list of available playlists.
      // Append the list of playlists as an object to the response body.
    // Makle an API call to the backend using Axios to get the trackID of the currently playing track.
    // Return index.html with res.sendFile()
});

app.get('/pl', (req, res) => {
  console.log('AT: /pl');

  axios({
    method: 'get',
    // url: 'https://jsonplaceholder.typicode.com/users' // It works with this URL. That means the issue isn't with this code, but with the vidya-backend API code.
    url: 'http://localhost:11001/playlists'
  })
  .then(response => console.log(response))
  .catch(error => console.log(error))
  console.log('Axios request complete');
  // res.status(200);
  // res.send();


});

/***** LAUNCH APPLICATION *****/

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})


// TODO: Build Node.js server here.
// TODO: Restructure public to have public/tracks and public/resources
    // public/resources should contain .css files, images, favicons, etc.