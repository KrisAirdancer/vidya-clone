// These scripts run to setup and build the webpage/GUI.

let masterTracksList = {};
let tracksMap = new Map();

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
    .then(() => {
      applyTracksListEventHandler();
    });

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

  console.log(masterTracksList);
  masterTracksList.forEach(track => {
  
    tracksHTML.push(
        `<li id="${track.trackID}" class="track-info">${track.trackGame} — ${track.trackName}</li>`
    );
  });
  
  // Inject tracks HTML into DOM
  
  let tracksList = document.querySelector('#tracks-list');
  
  tracksList.innerHTML = tracksHTML.join('');
}

/**************************************
 * Handle click events in tracks list *
 **************************************/

// Applies an event listener to the #tracksList-group element to get the selected track
function applyTracksListEventHandler()
{
  let tracksListGroup = document.querySelector('#tracksList-group');
  
  tracksListGroup.addEventListener('click', e => {
    console.log('AT: tracksListGroup Event Listener');
  
    console.log(e.target);
    console.log(e.target.id);
    console.log(masterTracksList);
    console.log(tracksMap.get(e.target.id).trackURL);

    // let trackAudio = new Audio('http://localhost:5500/single-file/tracks/0013 - HAWKEN - Origin.mp3');
    let trackAudio = new Audio(`${tracksMap.get(e.target.id).trackURL}`);
    trackAudio.play();
  });
}
