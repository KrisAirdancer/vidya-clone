// These scripts run to setup and build the webpage/GUI.

let masterTracksList = {};
let tracksMap = new Map();
let currentTrack = new Audio();

/***************
 * Run Scripts *
 ***************/
// Note: This is not a great setup. All scripts must be run in .then() calls because the file load is async and the subsequent scripts will be run before the fetch() call completes which means they won't have access to the loaded data.
  // TODO: Fix this^^^

let reader = new FileReader();

fetch('playlists/all-tracks.json') // ***** Load and sort master tracks list *****
    .then(response => response.json())
    .then(tracksData => {
      loadTracksMasterList(tracksData);
      populateTracksMap();
    })
    .then(() => { // ***** Generate tracksHTML from playlist file
      generateTracksListHTML();
    })
    .then(() => { // ***** Apply event handlers/listeners *****
      applyTracksListEventHandler();
      applyPlayPauseEventHandler();
    })

/************************
 * Apply Event Handlers *
 ************************/

// Applies an event listener to the #tracksList-group element to get the selected track
function applyTracksListEventHandler()
{
  let tracksListGroup = document.querySelector('#tracksList-group');
  
  tracksListGroup.addEventListener('click', e => {

    currentTrack.pause();
    setCurrentTrack(e.target.id);
    currentTrack.play();
  });
}

// Applies an event handler to the play/pause button in the controls box
function applyPlayPauseEventHandler()
{
  let playPauseBtn = document.querySelector('#play-pause-btn');

  playPauseBtn.addEventListener('click', e => {
    playPauseCurrentTrack();
  });
}

/*************
 * Functions *
 *************/

// Sets and stores the tracks master list from the given data (from the fetch call above)
function loadTracksMasterList(tracksData)
{
  let sortedTracks = tracksData.sort((a, b) => {

    if (`${a.trackGame} - ${a.trackName}` < `${b.trackGame} - ${b.trackName}`) {
      return -1;
    } else if (a.gameName > b.gameName) {
      return 1;
    } else { // a === b
      return 0;
    }
  })

 masterTracksList = sortedTracks;
}

// Populates the tracksMap
function populateTracksMap()
{
  masterTracksList.forEach(track => {
    // console.log(track);

    tracksMap.set(track.trackID, track);
  });
}

// Generates the HTML list of tracks
function generateTracksListHTML()
{
  // TODO: Need to change the playlist file that is used based on the user's selection (per the playlist dropdown)
      // Can likely just grab the currenly selected playlist from the <select> tag using a QuerySelector

  // Generate tracksHTML
  
  let tracksHTML = [];

  masterTracksList.forEach(track => {
  
    tracksHTML.push(
        `<li id="${track.trackID}" class="track-info">${track.trackGame} — ${track.trackName}</li>`
    );
  });
  
  // Inject tracks HTML into DOM
  
  let tracksList = document.querySelector('#tracks-list');
  
  tracksList.innerHTML = tracksHTML.join('');
}

// Sets currentTrack to the track with ID trackURL
function setCurrentTrack(trackID)
{
  let trackURL = tracksMap.get(trackID).trackURL;

  currentTrack = new Audio(`${trackURL}`);
}

// Toggles the state of the currently track between playing and paused
function playPauseCurrentTrack()
{
  if (currentTrack.paused)
  {
    currentTrack.play();
  }
  else
  {
    currentTrack.pause();
  }
}
