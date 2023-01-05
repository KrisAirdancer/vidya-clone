let masterTracksList = {};
let tracksMap = new Map();
let previousStack = [];
let nextStack = [];
let currentTrack = {
  trackID: undefined,
  trackURL: undefined,
  trackAudio: new Audio()
}

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
      applyNextTrackEventHandler();
      applyPreviousTrackEventHandler();
    })

/************************
 * Apply Event Handlers *
 ************************/

// Applies an event listener to the #tracksList-group element to get the selected track
function applyTracksListEventHandler()
{
  let tracksListGroup = document.querySelector('#tracksList-group');
  
  tracksListGroup.addEventListener('click', e => {

    currentTrack.trackAudio.pause();
    setCurrentTrack(e.target.id);
    currentTrack.trackAudio.play();
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

// Applies an event handler to the next track button in the controls box
function applyNextTrackEventHandler()
{
  let nextTrackBtn = document.querySelector('#next-track-btn');
  
  nextTrackBtn.addEventListener('click', e => {
    playNextTrack();
  });
}

// Applies an event handler to the previous track button in the controls box
function applyPreviousTrackEventHandler()
{
  let nextTrackBtn = document.querySelector('#previous-track-btn');
  
  nextTrackBtn.addEventListener('click', e => {
    playPreviousTrack();
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

  if (currentTrack.trackID !== undefined)
  {
    previousStack.push({
      trackID: currentTrack.trackID,
      trackURL: currentTrack.trackURL
    });
  }
  nextStack = [];

  let trackURL = tracksMap.get(trackID).trackURL;

  currentTrack = {
    trackID: trackID,
    trackURL: trackURL,
    trackAudio: new Audio(`${trackURL}`)
  }

  console.log(currentTrack);
}

// Toggles the state of the currently track between playing and paused
function playPauseCurrentTrack()
{
  if (currentTrack.trackAudio.paused)
  {
    currentTrack.trackAudio.play();
  }
  else
  {
    currentTrack.trackAudio.pause();
  }
}

// Plays the next track
function playNextTrack()
{
  currentTrack.trackAudio.pause();
  previousStack.push({
    trackID: currentTrack.trackID,
    trackURL: currentTrack.trackURL
  });
  
  if(nextStack.length !== 0) // There are tracks in the nextTracks history
  {
    let newTrack = nextStack.pop();
    currentTrack = {
      trackID: newTrack.trackID,
      trackURL: newTrack.trackURL,
      trackAudio: new Audio(newTrack.trackURL)
    }
  }
  else // There are no tracks in the nextTracks history, we need to select a random track
  {
    let trackID = getRandomTrackID();

    // Ensure that the current track is not returned
    while (trackID === currentTrack.trackID)
    {
      trackID = getRandomTrackID();
    }

    let newTrack = tracksMap.get(trackID);
    currentTrack = {
      trackID: newTrack.trackID,
      trackURL: newTrack.trackURL,
      trackAudio: new Audio(newTrack.trackURL)
    }
  }

  currentTrack.trackAudio.play();

  console.log(currentTrack.trackID);
  console.log(currentTrack);
}

// Plays the previous track
function playPreviousTrack()
{
  if (previousStack.length !== 0) // If previousStack is not empty
  {
    currentTrack.trackAudio.pause();

    nextStack.push({ // Push currentTrack onto stack
      trackID: currentTrack.trackID,
      trackURL: currentTrack.trackURL
    });

    prev = previousStack.pop();
    currentTrack = {
      trackID: prev.trackID,
      trackURL: prev.trackURL,
      trackAudio: new Audio(prev.trackURL)
    }

    currentTrack.trackAudio.play();
  }

  console.log(currentTrack.trackID);
  console.log(currentTrack);
}

// Plays a random track from the currently selected playlist
function playRandomTrack()
{
  // TODO: Add logic to select a track only from the currently selected playlist and not from the entire library

  let trackID = getRandomTrackID();

  currentTrack.trackAudio.pause();
  setCurrentTrack(trackID);
  currentTrack.trackAudio.play();
}

// Randomly generate a track ID from the list of available tracks
function getRandomTrackID()
{
  let trackIDs = [];

  tracksMap.forEach(entry => {
    trackIDs.push(entry.trackID);
  });
  
  let trackID = trackIDs[Math.round(Math.random() * (trackIDs.length - 0) - 0)]; // Math.random() * (max - min) + min

  return trackID;
}