import React from 'react'
import TrackInfo from './TrackInfo.js'
import trackData from './dummyData.json'

// TODO: Need to add a unique ID to each of the track-info li tags so that React.js can interact with them properly.

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
