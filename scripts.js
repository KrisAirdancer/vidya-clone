let masterTracksList = {};
let tracksMap = new Map();
let previousStack = [];
let nextStack = [];
let currentTrack = {
  trackID: undefined,
  trackURL: undefined,
  trackAudio: new Audio()
}
let chosenTracks = new Set();
let exiledTracks = new Set();
let DEFAULT_VOLUME_LEVEL = 0.5; // Denotes a percentage: 100%
let volumeLevel; // Denotes a percentage: 100%
let mouseUpEnabled_trackSlider = false; // TODO: This flag is being used to prevent the scrubber's 'mouseup' event from triggering when the user clicks on things on the page that aren't the track scrubber thumb. When the 'mouseup' event triggers on the rest of the page, the currently playing track is momentarilly paused - not good. Note that the rason the  'mouseup' event is firing when the user clicks anywhere on the page is because I applied it to the entire document object to ensure that the scrubber thumb is dropped when the user lets go of it. This isn't a good solution and will need to be replaced with an alternative. Essentially, the issue is that I'm using the 'mouseup' event to respond when the user lets go of the scrubber thumb. There is likely a way to handle this event without the 'mouseup' event.
let mouseUpEnabled_volumeBarBody = false;

// List of all track IDs (1/27/2023): 0001,0002,0003,0004,0005,0006,0007,0008,0009,0010,0011,0012,0013,0014,0015,0016,0017,0018,0019,0041,0038,0034,0033,0040,0023,0039,0021,0042,0043,0031,0029,0036,0026,0020,0024,0030,0027,0025,0028,0022,0037,0035,0032

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
    .then(() => { // Load data from local storage
      loadChosenTracksFromLocalStorage();
      loadExiledTracksFromLocalStorage();
    })
    .then(() => { // ***** Generate tracksHTML from playlist file
      generateTracksListHTML();
    })
    .then(() => { // Apply event handlers/listeners
      applyTracksListEventHandler();
      // Control Box
      applyPlayPauseEventHandler();
      applyNextTrackEventHandler();
      applyPreviousTrackEventHandler(); // TODO: Some of the Listeners are called Handlers and vice versa in my function names - update the function names to use consistent naming
      // Track Scrubber
      applyScrubberEventListener();
      applyRemoveScrubberEventListener();
      // Navbar Buttons
      applyChosenButtonEventListener();
      applyExiledButtonEventListener();
      // Volume Slider
      applyVolumeBarBodyEventListener();
      applyRemoveVolumeBarBodyEventListener();
      setVolumeBarSliderPositionOnSiteLoad();
    })
    .then(() => { // Set and play current track
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
    // console.log('AT: applyTracksListEventHandler()');

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
    // console.log('AT: applyPlayPauseEventHandler()');

    playPauseCurrentTrack();
  });
}

// Applies an event handler to the next track button in the controls box
function applyNextTrackEventHandler()
{
  let nextTrackBtn = document.querySelector('#next-track-btn');
  
  nextTrackBtn.addEventListener('click', e => {
    // console.log('AT: applyNextTrackEventHandler()');

    playNextTrack();
  });
}

// Applies an event handler to the previous track button in the controls box
function applyPreviousTrackEventHandler()
{
  let nextTrackBtn = document.querySelector('#previous-track-btn');
  
  nextTrackBtn.addEventListener('click', e => {
    // console.log('AT: applyPreviousTrackEventHandler()');

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
    // console.log('AT: applyEndedEventListener()');

    playNextTrack();
  });
}

// Applies an event handler to the #track-scrubber-bar to update the play position of the currentTrack
function applyScrubberEventListener()
{
  let scrubberThumb = document.querySelector('#scrubber-body');

  scrubberThumb.addEventListener('mousedown', e => {
    // console.log('AT: applyScrubberEventListener()');

    mouseUpEnabled_trackSlider = true;

    moveScrubberThumbOnUserInput(e); // This allows the user to click somewhere on the scrubber bar to scrub through the track

    currentTrack.trackAudio.removeEventListener('timeupdate', updateScrubberThumbPosition);
    document.addEventListener('mousemove', moveScrubberThumbOnUserInput);  // Select the entire document - Note: The function is automatically passed the event from the event listener. This is the same as moveScrubberThumb(e)
  });
}

// Removes the event listener for mousemove events to prevent the scrubber thumb from following the user's mouse after mouseup
function applyRemoveScrubberEventListener()
{
  document.addEventListener('mouseup', e => {
    // console.log('AT: applyRemoveScrubberEventListener()');

    if (mouseUpEnabled_trackSlider)
    {
      document.removeEventListener('mousemove', moveScrubberThumbOnUserInput);
      setCurrentTime();
      currentTrack.trackAudio.addEventListener('timeupdate', updateScrubberThumbPosition);
      mouseUpEnabled_trackSlider = false;
    }
  });
}

// Add an event listener to the Chosen button to respond to a user clicking on it
function applyChosenButtonEventListener()
{
  let chosenBtn = document.querySelector('#btn_chosen');

  chosenBtn.addEventListener('click', e => {
    // console.log('AT: applyChosenButtonEventListener()');

    if (chosenTracks.has(currentTrack.trackID))
    {
      removeTrackFromChosen(currentTrack.trackID);
      saveChosenTracksToLocalStorage();
    }
    else
    {
      addTrackToChosen(currentTrack.trackID);
      saveChosenTracksToLocalStorage();
    }
  });
}

// Adds an event listener to the Exiled button to respond to a user clicking on it
function applyExiledButtonEventListener()
{
  let exiledBtn = document.querySelector('#btn_exiled');

  exiledBtn.addEventListener('click', e => {
    // console.log('AT: applyExiledButtonEventListener()');

    if (exiledTracks.has(currentTrack.trackID))
    {
      removeTrackFromExiled(currentTrack.trackID);
      saveExiledTracksToLocalStorage();
    }
    else{
      addTrackToExiled(currentTrack.trackID);
      saveExiledTracksToLocalStorage();
    }
    
  });
}

// Applies an event listener to the #volumeBar-body to update the position of the volume bar slider
function applyVolumeBarBodyEventListener()
{
  let volumeBarBody = document.querySelector('#volumeBar-body');

  volumeBarBody.addEventListener('mousedown', e => {

    mouseUpEnabled_volumeBarBody = true;

    moveVolumeBarSliderOnUserInput(e);
    document.addEventListener('mousemove', moveVolumeBarSliderOnUserInput);  // Select the entire document - Note: The function is automatically passed the event from the event listener. This is the same as moveScrubberThumb(e)
  });
}

// Removes the volumeBarBody event listener to prevent the volume slider from following the user's mouse after mouseup
function applyRemoveVolumeBarBodyEventListener()
{
  document.addEventListener('mouseup', e => {
    // console.log('AT: applyRemoveVolumeBarBodyEventListener()');

    if (mouseUpEnabled_volumeBarBody)
    {
      document.removeEventListener('mousemove', moveVolumeBarSliderOnUserInput);
      updateVolumeLevel(); // TODO: May need to pass something into this function such as the current position of the slider - although, I should be able to just pull that info from the DOM in the updateVolume() function anyway.
      mouseUpEnabled_volumeBarBody = false;
    }
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
      // Note: Make sure to update the underlying data structures based on the tracks in the chosen playlist so that the track selection logic continues to work - this will likely need to be updated in loadTracksMasterList()
      // Note: Don't take tracks out of the tracksMasterList. Instead, update the tracksMap to reflect the selected playlist.

  // Generate tracksHTML
  
  let tracksHTML = [];

  masterTracksList.forEach(track => {
  
    if (chosenTracks.has(track.trackID))
    {
      tracksHTML.push(
          `<li id="${track.trackID}" class="track-info chosenTrack">${track.trackGame} — ${track.trackName}</li>`
      );
    }
    else if (exiledTracks.has(track.trackID))
    {
      tracksHTML.push(
          `<li id="${track.trackID}" class="track-info exiledTrack">${track.trackGame} — ${track.trackName}</li>`
      );
    }
    else
    {
      tracksHTML.push(
          `<li id="${track.trackID}" class="track-info">${track.trackGame} — ${track.trackName}</li>`
      );
    }

  });
  
  // Inject tracks HTML into DOM
  
  let tracksList = document.querySelector('#tracks-list');
  
  tracksList.innerHTML = tracksHTML.join('');
}

// Sets currentTrack to the track with ID trackURL
function setCurrentTrack(trackID)
{
  console.log('AT: setCurrentTrack()');

  // TODO: This whole if block might be dead code... If so, remove it.
  if (currentTrack.trackID !== undefined)
  {
    removeCurrentTrackHighlighting();
    // TODO: I think this is dead code. If there are no bugs with it commented out, delete it.
    // previousStack.push({
    //   trackID: currentTrack.trackID,
    //   trackURL: currentTrack.trackURL
    // });
  }
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

  highlightCurrentTrack();
  scrollCurrentTrackToTop();
  setCurrentTrackVolume();

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

  removeCurrentTrackHighlighting();

  currentTrack.trackAudio.pause();
  if (!exiledTracks.has(currentTrack.trackID))
  {
    previousStack.push({
      trackID: currentTrack.trackID,
      trackURL: currentTrack.trackURL
    });
  }
  
  if(nextStack.length !== 0) // There are tracks in the nextTracks history
  {
    let newTrack = nextStack.pop();
    currentTrack = { // TODO: Anywhere this is done, it could be replaced with a function that takes in the trackID and sets the current track. I think the reason my setCurrentTrack() function didn't end up being useful is that I tried to pack too much functionality into setCurrentTrack();
      trackID: newTrack.trackID,
      trackURL: newTrack.trackURL,
      trackAudio: new Audio(newTrack.trackURL)
    }
  }
  else // There are no tracks in the nextTracks history, we need to select a random track
  {
    let trackID = getRandomTrackID();

    // TODO: If a user exiles all of the tracks, they will end up in a forever loop here - add logic to prevent this (maybe notify the user and prevent any tracks from playing until they un-exile at least one track?)
    // Ensure that the current track is not replayed and that the track has not been exiled
    while (trackID === currentTrack.trackID || exiledTracks.has(trackID) || trackID === null || trackID === undefined)
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
  
  scrollCurrentTrackToTop();
  highlightCurrentTrack();

  setCurrentTrackVolume();
  
  console.log(currentTrack.trackID);
  console.log(currentTrack);
}

// Plays the previous track
function playPreviousTrack()
{
  // console.log('AT: playPreviousTrack()');

  removeCurrentTrackHighlighting();

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
  
  scrollCurrentTrackToTop();
  highlightCurrentTrack();

  setCurrentTrackVolume();

  console.log(currentTrack.trackID);
  console.log(currentTrack);
}

// TODO: This function appears to be unused! Either use it somewhere or delete it.
// Plays a random track from the currently selected playlist
function playRandomTrack()
{
  console.log('AT: playRandomTrack()');

  // TODO: Add logic to select a track only from the currently selected playlist and not from the entire library

  removeCurrentTrackHighlighting();

  let trackID = getRandomTrackID();

  currentTrack.trackAudio.pause();
  setCurrentTrack(trackID);
  currentTrack.trackAudio.play();

  scrollCurrentTrackToTop();
  highlightCurrentTrack();

  setCurrentTrackVolume();
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
  // console.log('AT: updateScrubberTimeStamps()');

  let position = document.querySelector('#scrubber-bar-progress').style.width;
  let timePlayed = (parseFloat(position) / 100) * currentTrack.trackAudio.duration; // percent position of scrubberThumb * currentTrack.duration
  let timeRemaining = currentTrack.trackAudio.duration - timePlayed;
  
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

// Scrolls the current track's li to the top of the #tracks-list ul
function scrollCurrentTrackToTop()
{
  // Scroll the current track to the top of the page
  let currentTrackLi = document.getElementById(`${currentTrack.trackID}`);
  currentTrackLi.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
}

// Applies the .currentTrack class to the currently playing track's li element
function highlightCurrentTrack()
{
  let currentTrackLi = document.getElementById(`${currentTrack.trackID}`);
  currentTrackLi.classList.add('currentTrack');

  if (chosenTracks.has(currentTrack.trackID))
  {
    currentTrackLi.classList.remove('chosenTrack');
  }
  if (exiledTracks.has(currentTrack.trackID))
  {
    currentTrackLi.classList.remove('exiledTrack');
  }
}

// Removes the .currentTrack class from the currently playing track's li element
function removeCurrentTrackHighlighting()
{
  let currentTrackLi = document.getElementById(`${currentTrack.trackID}`);
  currentTrackLi.classList.remove('currentTrack');

  if (chosenTracks.has(currentTrack.trackID))
  {
    currentTrackLi.classList.add('chosenTrack');
  }
  if (exiledTracks.has(currentTrack.trackID))
  {
    currentTrackLi.classList.add('exiledTrack');
  }
}

// Adds the currently playing track to the chosenTracks set
function addTrackToChosen(trackID)
{
  if (trackID)
  {
    chosenTracks.add(trackID);
    exiledTracks.delete(trackID);
  }
}

// Removes the currently playing track from the chosenTracks Set()
function removeTrackFromChosen(trackID)
{
  if (trackID)
  {
    chosenTracks.delete(trackID);
  }
}

// Saves the chosenTracks Set to the browser's local storage
function saveChosenTracksToLocalStorage()
{
  let chosenTracksStr = Array.from(chosenTracks);
  localStorage.setItem('chosen', chosenTracksStr);
}

// Gets the list of chosen tracks from local storage and loads them into the chosenTracks Set
function loadChosenTracksFromLocalStorage()
{
  if (localStorage.getItem('chosen'))
  {
    let chosenTracksStr = localStorage.getItem('chosen');
    chosenTracks = new Set(chosenTracksStr.split(','));
  }
}

// Adds the currently playing track to the exiledTracks Set
function addTrackToExiled(trackID)
{
  if (trackID)
  {
    exiledTracks.add(trackID);
    chosenTracks.delete(trackID);

    previousStack.forEach(track => {
      if (track.trackID === trackID) {
        while (previousStack.indexOf(trackID) !== -1)
        {
          let trackIndex = previousStack.indexOf(trackID);
          previousStack.splice(trackIndex, 1);
        }
      }
    });
  }
}

// Removes the currently playing track from the exiledTracks set
function removeTrackFromExiled(trackID)
{
  if (trackID)
  {
    exiledTracks.delete(trackID);
  }
}

// Saves the exiledTracks Set track to the browser's local storage
function saveExiledTracksToLocalStorage()
{
  let exiledTracksStr = Array.from(exiledTracks);
  localStorage.setItem('exiled', exiledTracksStr);
}

// Gets the list of exiled tracks from local storage and loads them into the chosenTracks Set
function loadExiledTracksFromLocalStorage()
{
  if (localStorage.getItem('exiled'))
  {
    let exiledTracksStr = localStorage.getItem('exiled');
    exiledTracks = new Set(exiledTracksStr.split(','));
  }
}

// Repositions the scrubber bar slider along the volume bar body when the user interacts with the volume bar slider
function moveVolumeBarSliderOnUserInput(event)
{
  // console.log('AT: moveScrubberThumbOnUserInput()');
  
  let volumeBarSlider = document.querySelector('#volumeBar-body');

  let right = volumeBarSlider.getBoundingClientRect().right;
  let left = volumeBarSlider.getBoundingClientRect().left;

  let updatedPosition = ((event.clientX - left) / (right - left)) * 100;
  if (updatedPosition <= 100)
  {
    setVolumeBarSliderPosition(updatedPosition);
  }
}

// Updates the width (position) of the volume bar slider on the UI
// updatedPosition - a float representing the position of the slider along a range of 0 to 100
function setVolumeBarSliderPosition(updatedPosition)
{
  console.log('slider position: ' + updatedPosition);
  document.querySelector('#volumeBar-slider').style.width = `${updatedPosition}%`;
}

// Updates the volumeLevel global variable based on the position of the volumeBar-slider
function updateVolumeLevel()
{
  // console.log('AT: updateVolume()');
  // TODO: There is a small bug somewhere that is preventing the volume from being set to zero. The lowest that it can currently go is 1.

  let volumeBarSliderPosition = document.querySelector('#volumeBar-slider').style.width;
  volumeLevel = Math.round(parseFloat(volumeBarSliderPosition)) / 100;

  setCurrentTrackVolume();
  saveVolumeToLocalStorage();
}

// Sets the volume level of the currently playing track Audio object
function setCurrentTrackVolume()
{
  currentTrack.trackAudio.volume = volumeLevel;
}

// Saves the current value of the volumeLevel variable to browser's local storage
function saveVolumeToLocalStorage()
{
  localStorage.setItem('volumeLevel', volumeLevel);
}

// Loads the volume level from local storage
// return - the volume level value retrieved from local storage
function loadVolumeFromLocalStorage()
{
  return localStorage.getItem('volumeLevel');
}

// Sets the position of the volume bar slider to match the volume level stored in local storage
// or sets it to the DEFAULT_VOLUME_LEVEL position if no volume level is stored in local storage.
function setVolumeBarSliderPositionOnSiteLoad()
{
  loadedVolumeLevel = loadVolumeFromLocalStorage();
  console.log('loadedVolumeLevel: ' + loadedVolumeLevel);
  if (loadedVolumeLevel)
  {
    volumeLevel = loadedVolumeLevel;
  }
  else
  {
    volumeLevel = DEFAULT_VOLUME_LEVEL;
  }
  setVolumeBarSliderPosition(volumeLevel * 100);
}