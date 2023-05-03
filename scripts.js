let tracksMasterListURI = 'playlists/tracks-master-list.json';
// TODO: Why do I have the masterTracksList object and the tracksMap? They seem to be serving the same purpose. Look through the code to figure out if I need both and consolidate if possible.
let masterTracksList = {}; // All tracks from the "tracks-master-list.json" file into an object for easy reference/use (does not contain audio data)
let tracksMap = new Map(); // Generates a Map of all tracks currently in the system so that they are easily accessible (does not contain audio data)
let previousStack = [];
let nextStack = [];
let currentTrack = {
  trackID: undefined,
  trackURL: undefined,
  trackAudio: new Audio()
}
let chosenTracks = new Set();
let exiledTracks = new Set();
let neutralTracks = new Set();
let DEFAULT_VOLUME_LEVEL = 0.5; // Denotes a percentage: 100%
let volumeLevel; // Denotes a percentage: 100%
let mouseUpEnabled_trackSlider = false; // TODO: This flag is being used to prevent the scrubber's 'mouseup' event from triggering when the user clicks on things on the page that aren't the track scrubber thumb. When the 'mouseup' event triggers on the rest of the page, the currently playing track is momentarilly paused - not good. Note that the rason the  'mouseup' event is firing when the user clicks anywhere on the page is because I applied it to the entire document object to ensure that the scrubber thumb is dropped when the user lets go of it. This isn't a good solution and will need to be replaced with an alternative. Essentially, the issue is that I'm using the 'mouseup' event to respond when the user lets go of the scrubber thumb. There is likely a way to handle this event without the 'mouseup' event.
let mouseUpEnabled_volumeBarBody = false;
let volumeSliderVisible = false;
let siteMenuVisible = false;
let headerVisible = true;
let infoPageVisible = true; // The siteMenu's info page is the default page (visible by default)
let configPageVisible = false;
let chosenOdds = 25;
let repeat = false;

// List of all track IDs (1/27/2023): 0001,0002,0003,0004,0005,0006,0007,0008,0009,0010,0011,0012,0013,0014,0015,0016,0017,0018,0019,0041,0038,0034,0033,0040,0023,0039,0021,0042,0043,0031,0029,0036,0026,0020,0024,0030,0027,0025,0028,0022,0037,0035,0032

/***************
 * Run Scripts *
 ***************/
// Note: This is not a great setup. All scripts must be run in .then() calls because the file load is async and the subsequent scripts will be run before the fetch() call completes which means they won't have access to the loaded data.
  // TODO: Fix this^^^

let reader = new FileReader();

fetch(tracksMasterListURI) // Load and sort master tracks list
    .then(response => response.json())
    .then(tracksData => {
      loadTracksMasterList(tracksData);
      populateTracksMap();
      populateNeutralTracks();
    })
    .then(() => { // Load data from local storage
      loadChosenTracksFromLocalStorage();
      loadExiledTracksFromLocalStorage();
    })
    .then(() => { // Generate tracksHTML from playlist file
      generateTracksListHTML();
    })
    .then(() => { // Apply event handlers/listeners
      applyTracksListEventHandler();
      // Controls Box
      applyPlayPauseEventHandler();
      applyNextTrackEventHandler();
      applyPreviousTrackEventHandler(); // TODO: Some of the Listeners are called Handlers and vice versa in my function names - update the function names to use consistent naming
      applyControlsBoxDraggableEventListener();
      applyEventListenerToReplyButton();
      applyEventListenerToHeaderCollapseButton();
      // Track Scrubber
      applyScrubberEventListener();
      applyRemoveScrubberEventListener();
      // Navbar Buttons
      applyNavButtonEventListeners();
      // Volume Slider (plus volume slider setup)
      loadVolumeFromLocalStorage();
      applyVolumeButtonEventListener();
      applyVolumeBarBodyEventListener();
      applyRemoveVolumeBarBodyEventListener();
      setVolumeBarSliderPositionOnSiteLoad();
      updateVolumeButtonStyle();
      // Site Menu
      applySiteMenuButtonEventListener();
      applyEventListenersToSiteMenuButtons();
      applyChosenOddsInputEventListener();
      setTotalChosenNumberInMenu();
      setTotalExiledNumberInMenu();
      setTracksCountInMenu();
      loadChosenOddsFromLocalStorage();
      updateChosenOddsInMenu();
    })
    .then(() => { // Set and play current track
      setCurrentTrack(getRandomTrackID());
      // currentTrack.trackAudio.play(); // TODO: Need to resolve the "user didn't interact with the DOM first error before I can start playing audio right when the page loads"
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
  
  nextTrackBtn.addEventListener('click', playNextTrack);
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

    if (repeat)
    {
      currentTrack.trackAudio.currentTime = 0;
      updateScrubberTimeStamps();
      currentTrack.trackAudio.play();
    }
    else
    {
      playNextTrack();
    }
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
    if (chosenTracks.has(currentTrack.trackID)) // If current track is in chosenTracks, remove it.
    {
      removeTrackFromChosen(currentTrack.trackID);
      saveChosenTracksToLocalStorage();
    }
    else // If current track is not in chosenTracks, add it.
    {
      addTrackToChosen(currentTrack.trackID);
      saveChosenTracksToLocalStorage();
    }
  });
}

// Adds an event listener to the chosen odds input field in the site menu
function applyChosenOddsInputEventListener()
{
  // console.log("AT: applyChosenOddsInputEventListener()");

  let chosenOddsInput = document.querySelector("#chosenOddsInput");

  chosenOddsInput.addEventListener('change', e => {
    if (chosenOddsInput.value < 1)
    {
      chosenOddsInput.value = 1;
      chosenOdds = 1;
    }
    else if (chosenOddsInput.value > 100)
    {
      chosenOddsInput.value = 100;
      chosenOdds = 100;
    }
    else
    {
      localStorage.setItem('chosenOdds', chosenOddsInput.value);
      chosenOdds = chosenOddsInput.value;
    }
  });
}

// Adds an event listener to the Exiled button to respond to a user clicking on it
function applyExiledButtonEventListener()
{
  let exiledBtn = document.querySelector('#btn_exiled');

  exiledBtn.addEventListener('click', e => {
    // console.log('AT: applyExiledButtonEventListener()');

    if (exiledTracks.has(currentTrack.trackID)) // If current track is in exiledTracks, remove it.
    {
      removeTrackFromExiled(currentTrack.trackID);
      saveExiledTracksToLocalStorage();
    }
    else // If current track is not in exiledTracks, add it.
    {
      addTrackToExiled(currentTrack.trackID);
      saveExiledTracksToLocalStorage();
    }
    
  });
}

// Applies an event listener to the #volumeBar-body to update the position of the volume bar slider
function applyVolumeBarBodyEventListener()
{
  // console.log("AT: applyVolumeBarBodyEventListener()");

  let volumeBarBody = document.querySelector('#volumeBar-body');

  volumeBarBody.addEventListener('mousedown', e => {
    // console.log("AT: volumeBarBody Event Listener");

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
      updateVolumeLevel(); // TODO: May need to pass something into this function such as the current position of the slider - although, I should be able to just pull that info from the DOM in the updateVolume() function anyway.
      document.removeEventListener('mousemove', moveVolumeBarSliderOnUserInput);
      mouseUpEnabled_volumeBarBody = false;
    }
  });
}

// Applies event listeners to handle the logic to show/hide the volume slider bar
function applyVolumeButtonEventListener()
{
  // console.log('AT: applyVolumeButtonEventListener()');

  let volumeBtn = document.querySelector('#btn_volume');

  volumeBtn.addEventListener('click', e => {
    showHideVolumeSlider();
  });
  
}

// Applies event listeners to control the dragging of the controls box
function applyControlsBoxDraggableEventListener()
{
  // console.log('AT: applyControlsBoxDraggableEventListener()');

  let controlsBoxTopBar = document.querySelector('#controlsBox-topBar');

  controlsBoxTopBar.addEventListener('mousedown', e => {
    window.addEventListener('mousemove', repositionControlsBox);
  });

  window.addEventListener('mouseup', e => {
    window.removeEventListener('mousemove', repositionControlsBox);
  });
}

// Applies an event listener to the site menu button (the button that opens/closes the menu) to make it clickable
function applySiteMenuButtonEventListener()
{
  // console.log('AT: applySiteMenuButtonEventListener()');

  let siteMenuButton = document.querySelector('#siteMenu-showHideButton');
  
  siteMenuButton.addEventListener('click', showHideSiteMenu);
}

// Applies event listeners to all of the buttons within the site menu (excluding the button that opens/closes the menu)
function applyEventListenersToSiteMenuButtons()
{
  // console.log('AT: applyEventListenersToSiteMenuButtons()');

  // Information Button
  let infoButton = document.querySelector('#siteMenu-infoButton');
  infoButton.addEventListener('click', setInfoMenuPageVisible);
  
  // Configuration Button
  let configButton = document.querySelector('#siteMenu-configButton');
  configButton.addEventListener('click', setConfigMenuPageVisible);
  
  // Export Chosen Button
  let exportChosenButton = document.querySelector('#siteMenu-exportChosenButton');
  exportChosenButton.addEventListener('click', exportChosen);
  
  // Export Exiled Button
  let exportExiledButton = document.querySelector('#siteMenu-exportExiledButton');
  exportExiledButton.addEventListener('click', exportExiled);
  
  // Import Chosen Button
  let importChosenButton = document.querySelector('#siteMenu-importChosenButton');
  importChosenButton.addEventListener('click', importChosen);
  
  // Import Exiled Button
  let importExiledButton = document.querySelector('#siteMenu-importExiledButton');
  importExiledButton.addEventListener('click', importExiled);
  
  // Reset Chosen Button
  let resetChosenButton = document.querySelector('#siteMenu-resetChosenButton');
  resetChosenButton.addEventListener('click', resetChosen);
  
  // Reset Exiled Button
  let resetExiledButton = document.querySelector('#siteMenu-resetExiledButton');
  resetExiledButton.addEventListener('click', resetExiled);
}

// Adds an event listener to the repeat button in the controls box
function applyEventListenerToReplyButton()
{
  // console.log("AT: applyEventListenerToReplayButton()");

  let repeatButton = document.querySelector("#repeatButton");

  repeatButton.addEventListener('click', toggleRepeat);
}

function applyEventListenerToHeaderCollapseButton()
{
  let headerCollapseButton = document.querySelector('#headerCollapseButton');

  headerCollapseButton.addEventListener('click', showHideHeader);
}

function applyNavButtonEventListeners()
{
  let chosenButton = document.querySelector('#btn_chosen');
  let exiledButton = document.querySelector('#btn_exiled');

  // TODO: Pull the logic from these functions into this function. They (and similar functions) don't need to be in separate functions. They should just be one-liner calls that can be in this function.
  applyChosenButtonEventListener();
  applyExiledButtonEventListener();

  chosenButton.addEventListener('mouseover', changeChosenButtonIconOnHover);
  chosenButton.addEventListener('mouseout', changeChosenButtonIconOnMouseOut);
  exiledButton.addEventListener('mouseover', changeExiledButtonIconOnHover);
  exiledButton.addEventListener('mouseout', changeExiledButtonIconOnMouseOut);
}

/*************
 * Functions *
 *************/

// Initializes the neutralTracks set
function populateNeutralTracks()
{
  masterTracksList.forEach(track => {
    neutralTracks.add(track.trackID);
  });
}

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
  // console.log('AT: setCurrentTrack()');

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

  updateNavButtons();

  // console.log(currentTrack);
}

// Toggles the state of the currently track between playing and paused
function playPauseCurrentTrack()
{
  // console.log('AT: playPauseCurrentTrack()');

  let playPauseButton = document.querySelector("#play-pause-btn")

  if (currentTrack.trackAudio.paused)
  {
    currentTrack.trackAudio.play();

    playPauseButton.classList.remove("playPauseButton-paused");
    playPauseButton.classList.add("playPauseButton-playing");
  }
  else
  {
    currentTrack.trackAudio.pause();

    playPauseButton.classList.remove("playPauseButton-playing");
    playPauseButton.classList.add("playPauseButton-paused");
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

  updateNavButtons();
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

  updateNavButtons();

  console.log(currentTrack.trackID);
  console.log(currentTrack);
}

// TODO: This function appears to be unused! Either use it somewhere or delete it. It looks like this function was replaced by getRandomTrackID() - instead of calling a function to play the next track, I am calling a function to generate a track ID. I think I did this because I needed to be able to play tracks under different conditions in different places. Double check this and refactor if it doesn't make sense to do that anymore (or if that isn't the case).
// Plays a random track from the currently selected playlist
function playRandomTrack()
{
  // console.log('AT: playRandomTrack()');

  removeCurrentTrackHighlighting();

  let trackID = getRandomTrackID();

  currentTrack.trackAudio.pause();
  setCurrentTrack(trackID);
  currentTrack.trackAudio.play();

  scrollCurrentTrackToTop();
  highlightCurrentTrack();

  setCurrentTrackVolume();

  updateNavButtons();
}

// Randomly generate a track ID from the list of available tracks
function getRandomTrackID()
{
  // console.log('AT: getRandomTrackID()');

  let trackID;

  let randomValue = Math.floor(Math.random() * (100 - 1 + 1) + 1) // Math.floor(Math.random() * (max - min + 1) + min)

  if (randomValue <= chosenOdds)
  {
    trackID = Array.from(chosenTracks)[Math.round(Math.random() * (chosenTracks.size - 0 + 1) - 0)];
  }
  else
  {
    trackID = Array.from(neutralTracks)[Math.round(Math.random() * (neutralTracks.size - 0 + 1) - 0)];
  }

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
  if (!trackID) { return }

  if (chosenTracks.size == tracksMap.size - 1) { return }

  chosenTracks.add(trackID);
  neutralTracks.delete(trackID);
  exiledTracks.delete(trackID);

  setTotalChosenNumberInMenu();
  setTotalExiledNumberInMenu();
  saveChosenTracksToLocalStorage();
  saveExiledTracksToLocalStorage();
}

// Removes the currently playing track from the chosenTracks Set()
function removeTrackFromChosen(trackID)
{
  if (trackID)
  {
    chosenTracks.delete(trackID);
    neutralTracks.add(trackID);

    setTotalChosenNumberInMenu();
    saveChosenTracksToLocalStorage();
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

    chosenTracksStr.split(',').forEach(trackID => {
      chosenTracks.add(trackID);
      neutralTracks.delete(trackID);
    });
  }
}

// TODO: This function does more than it should. It should be broken out into two functions: one to add the track to exiled and one to update the previousStack.
  // I should also note that this function should be identical to addTrackToChosen() excepting that it should modify the exiled lists instead of the chosen lists, and it currently looks very different from addTrackToChosen(). That means we have a problem.
// Adds the currently playing track to the exiledTracks Set
function addTrackToExiled(trackID)
{
  if (!trackID) { return }

  if (exiledTracks.size == tracksMap.size - 1) { return }

  exiledTracks.add(trackID);
  chosenTracks.delete(trackID);
  neutralTracks.delete(trackID);

  setTotalExiledNumberInMenu();
  setTotalChosenNumberInMenu();
  saveExiledTracksToLocalStorage();
  saveChosenTracksToLocalStorage();
}

// Removes the currently playing track from the exiledTracks set
function removeTrackFromExiled(trackID)
{
  if (trackID)
  {
    exiledTracks.delete(trackID);
    neutralTracks.add(trackID);

    setTotalExiledNumberInMenu();
    saveExiledTracksToLocalStorage();
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

    exiledTracksStr.split(',').forEach(trackID => {
      exiledTracks.add(trackID);
      neutralTracks.delete(trackID);
    });
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

    updateVolumeLevel();
  }

  updateVolumeButtonStyle();
}

// Updates the width (position) of the volume bar slider on the UI
// updatedPosition - a float representing the position of the slider along a range of 0 to 100
function setVolumeBarSliderPosition(updatedPosition)
{
  document.querySelector('#volumeBar-slider').style.width = `${updatedPosition}%`;
}

// Updates the volumeLevel global variable based on the position of the volumeBar-slider
function updateVolumeLevel()
{
  // console.log('AT: updateVolume()');
  // TODO: There is a small bug somewhere that is preventing the volume from being set to zero. The lowest that it can currently go is 1.

  let volumeBarSliderPosition = document.querySelector('#volumeBar-slider').style.width;
  volumeLevel = Math.round(parseFloat(volumeBarSliderPosition)) / 100;

  if (volumeLevel <= 0.02)
  {
    volumeLevel = 0;
  }

  setVolumeBarSliderPosition(volumeLevel * 100)

  setCurrentTrackVolume();
  saveVolumeToLocalStorage();

  updateVolumeButtonStyle();
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

// Shows/hides the volumeBar by applying or removing the volumeBar-visible class
function showHideVolumeSlider()
{
  // console.log('AT: showHideVolumeSlider()');

  let volumeBar = document.querySelector('#volumeBar-body');
  if (!volumeSliderVisible)
  {
      volumeSliderVisible = !volumeSliderVisible;
    
      volumeBar.classList.add('volumeBar-visible');
  }
  else
  {
    volumeSliderVisible = !volumeSliderVisible;
    
    volumeBar.classList.remove('volumeBar-visible');
  }
}

// Sets the position of the controls box to the location of the mouse pointer (box centers relative to the middle-center of its topBar)
function repositionControlsBox(e) // e is passed in implicitly by the event handlers that call this function
{
  // console.log('AT: repositionControlsBox()');

  let controlsBox = document.querySelector('#control-box-flex-container');
  let controlsBoxWidth = controlsBox.offsetWidth;
  let controlsBoxHeight = controlsBox.offsetHeight;
  
  // Left boundary = left edge of screen - half the width of the controls box. Right boundary = right edge of screen - half the width of the controls box.
  if (e.pageX >= (0 + (controlsBoxWidth / 2)) && e.pageX <= (window.innerWidth - (controlsBoxWidth / 2)))
  {
    controlsBox.style.left = e.pageX + 'px';
  }

  // Top boundary = top of screen - 10% of the height of the controls box. Bottom boundary = bottom of screen - 90% of the height of the controls box.
  // 10% and 90% b/c the cursor sits 10% of the way down from the top of the controls box and is the point from which the controls box's location is measured.
  if (e.pageY >= (0 + (controlsBoxHeight * 0.1)) && e.pageY <= (window.innerHeight - (controlsBoxHeight * 0.9)))
  {
    controlsBox.style.top = e.pageY + 'px';
  }
}

/***** Site Menu Functions */

// Shows/hides the site menu and site menu buttons by adding/removing visibility classes
function showHideSiteMenu()
{
  // console.log('AT: showHideSiteMenu()');

  let siteMenu = document.querySelector('#siteMenu');
  let siteMenuButtonsGroup = document.querySelector('#siteMenu-navButtons-group');
  if (!siteMenuVisible)
  {
    siteMenuVisible = !siteMenuVisible;

    siteMenu.classList.add('siteMenu-menuVisible');
    siteMenuButtonsGroup.classList.add('siteMenu-buttonsVisible');
  }
  else
  {
    siteMenuVisible = !siteMenuVisible;

    siteMenu.classList.remove('siteMenu-menuVisible');
    siteMenuButtonsGroup.classList.remove('siteMenu-buttonsVisible');
  }
}


// Toggles the header between visible and hidden
function showHideHeader()
{
  // console.log("AT: showHideHeader()");
  
  let navBarGroup = document.querySelector("#navbar-group");
  let tracksList = document.querySelector("#tracks-list");
  
  if (headerVisible)
  {
    navBarGroup.classList.add('navHidden');
    tracksList.classList.add('tracksListHidden');
  }
  else
  {
    navBarGroup.classList.remove('navHidden');
    tracksList.classList.remove('tracksListHidden');
  }

  headerVisible = !headerVisible;
}

// Toggles the visibility of the info page in the siteMenu
function setInfoMenuPageVisible()
{
  // console.log('AT: displayInfoMenuPage()');

  let configPage = document.querySelector('#siteMenu-configPage');
  let infoPage = document.querySelector('#siteMenu-infoPage');
  
  if (!infoPageVisible)
  {
    infoPageVisible = !infoPageVisible;
    configPageVisible = !configPageVisible;
    
    infoPage.classList.add('pageVisible');
    configPage.classList.remove('pageVisible');

    // Resize buttons
    document.querySelector('#siteMenu-infoButton').setAttribute("style", "width:4rem");
    document.querySelector('#siteMenu-configButton').setAttribute("style", "width:1.75rem");
  }
}

// Toggles the visibility of the configuration page in the siteMenu
function setConfigMenuPageVisible()
{
  // console.log('AT: displayConfigMenuPage()');

  let configPage = document.querySelector('#siteMenu-configPage');
  let infoPage = document.querySelector('#siteMenu-infoPage');

  if (!configPageVisible)
  {
    infoPageVisible = !infoPageVisible;
    configPageVisible = !configPageVisible;

    configPage.classList.add('pageVisible');
    infoPage.classList.remove('pageVisible');

    // Resize buttons
    document.querySelector('#siteMenu-configButton').setAttribute("style", "width:4rem");
    document.querySelector('#siteMenu-infoButton').setAttribute("style", "width:1.75rem");
  }
}

// Delivers the list of chosen tracks to the user via an on-screen prompt
function exportChosen()
{
  // console.log('AT: exportChosen()');

  prompt('Export Chosen tracks.\nCopy this:', Array.from(chosenTracks).join(','));
}

// Delivers the list of exiled tracks to the user via an on-screen prompt
function exportExiled()
{
  // console.log('AT: exportExiled()');

  prompt('Export Exiled tracks.\nCopy this:', Array.from(exiledTracks).join(','));

}

// Requests (via an on-screen prompt) the chosen track IDs from the user then stores them in the application state and local storage
function importChosen()
{
  // console.log('AT: importChosen()');

  let importedTracks = prompt('Import Chosen tracks.\nPaste here:');
  if (importedTracks === null) { return; } // User canceled import or error occurred
  if (importedTracks === '') { return; } // If no tracks imported, keep the current state
  importedTracks = importedTracks.split(',');

  chosenTracks.clear();

  importedTracks.forEach(trackID => {
    if (trackID)
    {
      chosenTracks.add(trackID);
      neutralTracks.delete(trackID);
      exiledTracks.delete(trackID);
    }
  });

  currentTrack.trackAudio.pause(); // Have to pause the track or it will continue playing even after the currentTrack has changed
  saveChosenTracksToLocalStorage();
  saveExiledTracksToLocalStorage();
  generateTracksListHTML();
  let minTrackID = Array.from(tracksMap.keys())[0]; // The output is always sorted in ascending order. So the top track (lowest trackID) will always be at the top.
  setCurrentTrack(minTrackID);
  scrollCurrentTrackToTop();
  currentTrack.trackAudio.play();
}

// Requests (via an on-screen prompt) the exiled track IDs from the user then stores them in the application state and local storage
function importExiled()
{
  // console.log('AT: importExiled()');

  let exiledString = prompt('Import Exiled tracks.\nPaste here:');
  if (exiledString === null) { return; } // User canceled import or error occurred
  if (exiledString === '') { return; } // If no tracks imported, keep the current state
  exiledString = exiledString.split(',');

  exiledTracks.clear();

  exiledString.forEach(trackID => {
    if (trackID)
    {
      exiledTracks.add(trackID);
      chosenTracks.delete(trackID);
      neutralTracks.delete(trackID);
    }
  });

  currentTrack.trackAudio.pause(); // Have to pause the track or it will continue playing even after the currentTrack has changed
  saveExiledTracksToLocalStorage();
  saveChosenTracksToLocalStorage();
  generateTracksListHTML();
  let minTrackID = Array.from(tracksMap.keys())[0]; // The output is always sorted in ascending order. So the top track (lowest trackID) will always be at the top.
  setCurrentTrack(minTrackID);
  scrollCurrentTrackToTop();
  currentTrack.trackAudio.play();
}

// Clears all Chosen tracks from the program state and local storage
function resetChosen()
{
  // console.log('AT: resetChosen()');

  if (confirm('Reset Chosen tracks.\nAre you sure about that?'))
  {
    chosenTracks.forEach(trackID => {
      neutralTracks.add(trackID);
    });

    chosenTracks.clear();

    saveChosenTracksToLocalStorage();
    generateTracksListHTML();
    let minTrackID = Array.from(tracksMap.keys())[0]; // The output is always sorted in ascending order. So the top track (lowest trackID) will always be at the top.
    setCurrentTrack(minTrackID);
    scrollCurrentTrackToTop();
  }
}

// Clears all Exiled tracks from the program state and local storage
function resetExiled()
{
  // console.log('AT: resetExiled()');

  if (confirm('Reset Exiled tracks.\nAre you sure about that?'))
  {
    exiledTracks.clear();

    saveExiledTracksToLocalStorage();
    generateTracksListHTML();
    let minTrackID = Array.from(tracksMap.keys())[0]; // The output is always sorted in ascending order. So the top track (lowest trackID) will always be at the top.
    setCurrentTrack(minTrackID);
    scrollCurrentTrackToTop();
  }
}

// Sets the "Total Chosen" value in the site menu to the current chosen tracks count
function setTotalChosenNumberInMenu()
{
  let chosenNumberTag = document.querySelector('#siteMenu-totalChosenNumber');

  chosenNumberTag.textContent = chosenTracks.size;
}

// Sets the "Total Exiled" value in the site menu to the current exiled tracks count
function setTotalExiledNumberInMenu()
{
  let exiledNumberTag = document.querySelector('#siteMenu-totalExiledNumber');

  exiledNumberTag.textContent = exiledTracks.size;
}

// Sets the "Tracks" count number in the site menu to the total number of tracks in the system
function setTracksCountInMenu()
{
  let tracksCountNumberTag = document.querySelector('#siteMenu-totalTracksNumber');

  tracksCountNumberTag.textContent = tracksMap.size;
}

// Loads the chosen odds value form local storage
function loadChosenOddsFromLocalStorage()
{
  let storageValue = localStorage.getItem('chosenOdds');

  if (storageValue)
  {
    chosenOdds = storageValue;
  }
  else
  {
    chosenOdds = 25;
  }
}

// Updates the value displayed in the chosen odds field in the site menu
function updateChosenOddsInMenu()
{
  document.querySelector('#chosenOddsInput').value = chosenOdds;
}

// Toggles the replay status
function toggleRepeat()
{
  // console.log("AT: toggleRepeat()");

  repeat = !repeat;

  let repeatButton = document.querySelector("#repeatButton");
  if (repeat)
  {
    repeatButton.classList.remove("repeatButton-noRepeat");
    repeatButton.classList.add("repeatButton-repeat");
  }
  else
  {
    repeatButton.classList.remove("repeatButton-repeat");
    repeatButton.classList.add("repeatButton-noRepeat");
  }
}

// Updates the styling of the navigation bar's buttons based on the status of the currently playing track
function updateNavButtons()
{
  let chosenButton = document.querySelector("#btn_chosen");
  let exiledButton = document.querySelector("#btn_exiled");

  if (chosenTracks.has(currentTrack.trackID)) // Track is chosen
  {
    chosenButton.classList.add("chosenButton-broken");
    exiledButton.classList.add("exiledButton-ban");
    
    chosenButton.classList.remove("chosenButton-whole");
    exiledButton.classList.remove("exiledButton-check");
  }
  else if (exiledTracks.has(currentTrack.trackID)) // Track is exiled
  {
    chosenButton.classList.remove("chosenButton-broken");
    exiledButton.classList.remove("exiledButton-ban");
    
    chosenButton.classList.add("chosenButton-whole");
    exiledButton.classList.add("exiledButton-check");
  }
  else // Set to default look
  {
    chosenButton.classList.add("chosenButton-whole");
    exiledButton.classList.add("exiledButton-ban");

    chosenButton.classList.remove("chosenButton-broken");
    exiledButton.classList.remove("exiledButton-check");
  }
}

// Updates the style of the volume button based on the current volume level
function updateVolumeButtonStyle()
{
  // console.log("AT: updateVolumeButtonStyle()");

  let volumeButton = document.querySelector("#btn_volume");

  if (volumeLevel == 0)
  {
    volumeButton.classList.remove("volumeButton-down");
    volumeButton.classList.remove("volumeButton-up");
  
    volumeButton.classList.add("volumeButton-off");
  }
  else if (volumeLevel <= 0.5)
  {
    volumeButton.classList.remove("volumeButton-off");
    volumeButton.classList.remove("volumeButton-up");

    volumeButton.classList.add("volumeButton-down");
  }
  else
  {
    volumeButton.classList.remove("volumeButton-off");
    volumeButton.classList.remove("volumeButton-down");
  
    volumeButton.classList.add("volumeButton-up");
  }
}

function changeChosenButtonIconOnHover()
{
  let chosenButton = document.querySelector("#btn_chosen");

  if (chosenButton.classList.contains("chosenButton-whole"))
  {
    chosenButton.classList.add('chosenButton-whole-blue');
    chosenButton.classList.remove('chosenButton-whole');
  }
  else if (chosenButton.classList.contains("chosenButton-broken"))
  {
    chosenButton.classList.add('chosenButton-broken-blue');
    chosenButton.classList.remove('chosenButton-broken');
  }
}

function changeChosenButtonIconOnMouseOut()
{
  let chosenButton = document.querySelector("#btn_chosen");

  if (chosenButton.classList.contains("chosenButton-whole-blue"))
  {
    chosenButton.classList.add('chosenButton-whole');
    chosenButton.classList.remove('chosenButton-whole-blue');
  }
  else if (chosenButton.classList.contains("chosenButton-broken-blue"))
  {
    chosenButton.classList.remove('chosenButton-broken-blue');
    chosenButton.classList.add('chosenButton-broken');
  }
}

function changeExiledButtonIconOnHover()
{
  let exiledButton = document.querySelector("#btn_exiled");

  if (exiledButton.classList.contains("exiledButton-ban"))
  {
    exiledButton.classList.add('exiledButton-ban-blue');
    exiledButton.classList.remove('exiledButton-ban');
  }
  else if (exiledButton.classList.contains("exiledButton-check"))
  {
    exiledButton.classList.add('exiledButton-check-blue');
    exiledButton.classList.remove('exiledButton-check');
  }
}

function changeExiledButtonIconOnMouseOut()
{
  let exiledButton = document.querySelector("#btn_exiled");

  if (exiledButton.classList.contains("exiledButton-ban-blue"))
  {
    exiledButton.classList.add('exiledButton-ban');
    exiledButton.classList.remove('exiledButton-ban-blue');
  }
  else if (exiledButton.classList.contains("exiledButton-check-blue"))
  {
    exiledButton.classList.remove('exiledButton-check-blue');
    exiledButton.classList.add('exiledButton-check');
  }
}