import React from 'react'
import TrackInfo from './TrackInfo.js'
import trackData from './dummyData.json'

// TODO: Need to add a unique ID to each of the track-info li tags so that React.js can interact with them properly.
// TODO: Ultimately (once the backend is implemented), this componenet should call the backend to retrieve a pre-sorted list of tracks, that list should then be passed to the TrackInfo component - essentially, just the sorting logic and the logic that gets the list of tracks from the directory of audio files should be put into the backend. The rest of the logic should stay here.

export default function TrackList() {
    
  let sortedTracks = trackData.sort((a, b) => {
    if (a.gameName < b.gameName) {
      return -1;
    } else if (a.gameName > b.gameName) {
      return 1;
    } else { // a === b
      return 0;
    }
  })

  return (
    <div id='track-list-div'>
      <ul id='track-list'>
        {
        <TrackInfo tracksList={sortedTracks}/>
        }
      </ul>
    </div>
  )
}
