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
      applyScrubberEventListener();
      applyRemoveScrubberEventListener();
    })
    .then(() => {
      setCurrentTrack(getRandomTrackID());
      // currentTrack.trackAudio.play(); // Need to resolve the "user didn't interact with the DOM first error before I can start playing audio right when the page loads"
    });

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

// Applies an event listener to the currentTrack HTMLAudioElement to update the `value` (position) of the #track-scrubber-bar
function applyCurrentTimeChangeEventListener()
{
  currentTrack.trackAudio.addEventListener('timeupdate', updateScrubberThumbPosition);
}

// Applies an event listener to the currentTrack HTMLAudioElement that triggers when a track finishes playing
function applyEndedEventListener()
{
  currentTrack.trackAudio.addEventListener("ended", () => {

    playNextTrack();
  });
}

// Applies an event handler to the #track-scrubber-bar to update the play position of the currentTrack
function applyScrubberEventListener()
{
  let scrubberThumb = document.querySelector('#scrubber-body');

  scrubberThumb.addEventListener('mousedown', e => {

    moveScrubberThumbOnUserInput(e); // This allows the user to click somewhere on the scrubber bar to scrub through the track

    currentTrack.trackAudio.removeEventListener('timeupdate', updateScrubberThumbPosition);
    document.addEventListener('mousemove', moveScrubberThumbOnUserInput);  // Select the entire document - Note: The function is automatically passed the event from the event listener. This is the same as moveScrubberThumb(e)
  });
}

// Removes the event listener for mousemove events to prevent the scrubber thumb from following the users mouse after mouseup
function applyRemoveScrubberEventListener()
{
  document.addEventListener('mouseup', e => {
    document.removeEventListener('mousemove', moveScrubberThumbOnUserInput);
    setCurrentTime();
    currentTrack.trackAudio.addEventListener('timeupdate', updateScrubberThumbPosition);
  });
}

/*************
 * Functions *
 *************/

// Sets and stores the tracks master list from the given data (from the fetch call above)
function loadTracksMasterList(tracksData)
{
  // console.log('AT: populateTracksMap()');

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
  // console.log('AT: populateTracksMap()');

  masterTracksList.forEach(track => {

    tracksMap.set(track.trackID, track);
  });
}

// Generates the HTML list of tracks
function generateTracksListHTML()
{
  // console.log('AT: generateTracksListHTML()');

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
  console.log('AT: setCurrentTrack()');

  // TODO: I think this is dead code. If there are no bugs with it commented out, delete it.
  // if (currentTrack.trackID !== undefined)
  // {
  //   previousStack.push({
  //     trackID: currentTrack.trackID,
  //     trackURL: currentTrack.trackURL
  //   });
  // }
  nextStack = [];

  let trackURL = tracksMap.get(trackID).trackURL;

  currentTrack = {
    trackID: trackID,
    trackURL: trackURL,
    trackAudio: new Audio(trackURL)
  }
  applyCurrentTimeChangeEventListener();
  applyEndedEventListener();

  updateTrackInfoInHeader(currentTrack.trackID);

  console.log(currentTrack);
}

// Toggles the state of the currently track between playing and paused
function playPauseCurrentTrack()
{
  // console.log('AT: playPauseCurrentTrack()');

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
  // console.log('AT: playNextTrack()');

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
  applyCurrentTimeChangeEventListener();
  applyEndedEventListener();

  updateTrackInfoInHeader(currentTrack.trackID);
  
  currentTrack.trackAudio.play();

  console.log(currentTrack.trackID);
  console.log(currentTrack);
}

// Plays the previous track
function playPreviousTrack()
{
  // console.log('AT: playPreviousTrack()');

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
  applyCurrentTimeChangeEventListener();
  applyEndedEventListener();

  updateTrackInfoInHeader(currentTrack.trackID);

  console.log(currentTrack.trackID);
  console.log(currentTrack);
}

// Plays a random track from the currently selected playlist
function playRandomTrack()
{
  // console.log('AT: playRandomTrack()');

  // TODO: Add logic to select a track only from the currently selected playlist and not from the entire library

  let trackID = getRandomTrackID();

  currentTrack.trackAudio.pause();
  setCurrentTrack(trackID);
  currentTrack.trackAudio.play();
}

// Randomly generate a track ID from the list of available tracks
function getRandomTrackID()
{
  // console.log('AT: getRandomTrackID()');

  let trackIDs = [];

  tracksMap.forEach(entry => {
    trackIDs.push(entry.trackID);
  });
  
  let trackID = trackIDs[Math.round(Math.random() * (trackIDs.length - 0) - 0)]; // Math.random() * (max - min) + min

  return trackID;
}

// Updates the track info text displayed in the site header
function updateTrackInfoInHeader(trackID)
{
  // console.log('AT: updateTrackInfoInHeader()');

  let trackData = tracksMap.get(trackID);
  
  let trackInfoDiv = document.querySelector('#track-info');
  trackInfoDiv.innerHTML = `<strong>${trackData.trackName}</strong> — ${trackData.trackGame}`;
}

// Repositions the scrubber thumb element along the scrubber bar when the user interacts with it
function moveScrubberThumbOnUserInput(event)
{
  // console.log('AT: moveScrubberThumbOnUserInput()');
  
  let progressBar = document.querySelector('#scrubber-bar-background');

  let right = progressBar.getBoundingClientRect().right;
  let left = progressBar.getBoundingClientRect().left;

  let updatedPosition = ((event.clientX - left) / (right - left)) * 100;
  if (updatedPosition <= 100)
  {
    document.querySelector('#scrubber-bar-progress').style.width = `${updatedPosition}%`;
    updateScrubberTimeStamps();
  }
}

// Sets the currentTime attribute of the currentTrack
function setCurrentTime()
{
  // console.log('AT: setCurrentTime()');

  let position = document.querySelector('#scrubber-bar-progress').style.width;

  let newCurrentTime = (parseFloat(position) / 100) * currentTrack.trackAudio.duration; // percent position of scrubberThumb * currentTrack.duration

  // When the player first loads, this function is run for some reason. But this causes an error. So we check that the current track has a duration (inderectly via newCurrentTime).
  // Note: This is using JavaScript's "truthy" behavior to check that newCurrentTime contains a valid value. I tried other more explicit checks, but some NaNs were getting through. So I settled for this.
  if (newCurrentTime)
  {
    currentTrack.trackAudio.currentTime = newCurrentTime;
  }
}

// Repositions the scrubber thumb element along the scrubber bar as the track plays
function updateScrubberThumbPosition()
{
  // console.log('AT: updateScrubberThumbPosition()');

  let progressBar = document.querySelector('#scrubber-bar-progress');
  let updatedTime = currentTrack.trackAudio.currentTime;

  progressBar.style.width = `${(updatedTime / currentTrack.trackAudio.duration) * 100}%`;

  updateScrubberTimeStamps();
}

// Updates the text in the time stamps that flank the track scrubber bar
function updateScrubberTimeStamps()
{
  console.log('AT: updateScrubberTimeStamps()');

  let position = document.querySelector('#scrubber-bar-progress').style.width;
  let timePlayed = (parseFloat(position) / 100) * currentTrack.trackAudio.duration; // percent position of scrubberThumb * currentTrack.duration
  let timeRemaining = currentTrack.trackAudio.duration - timePlayed;
  
  console.log(`timePlayed: ${timePlayed}`);
  if (timePlayed)
  {
    document.querySelector('#right-timestamp').textContent = toFormattedTimeString(timePlayed.toString(), 1);
    document.querySelector('#left-timestamp').textContent = `-${toFormattedTimeString(timeRemaining, 1)}`;
  }
}

// Converts the given number of seconds into HH:MM:SS format.
// format - defaults to HH:MM:SS; 1 for SS:MM
// Source: https://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
function toFormattedTimeString(totalSeconds, format)
{
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
  let seconds = Math.floor(totalSeconds - (hours * 3600) - (minutes * 60));

  if (hours < 10) { hours = '0' + hours; }
  if (minutes < 10) { minutes = '0' + minutes; }
  if (seconds < 10) { seconds = '0' + seconds; }

  if (format === 1)
  {
    return `${minutes}:${seconds}`;
  }
  else
  {
  return `${hours}:${minutes}:${seconds}`;
  }
}