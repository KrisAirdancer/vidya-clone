import React from 'react'
import TrackInfo from './TrackInfo.js'
import tracksData from './dummyData.json'

// TODO: Need to add a unique ID to each of the track-info li tags so that React.js can interact with them properly.

export default function TrackList() {
    
  return (
    <div id='track-list-div'>
      <ul id='track-list'>
        {
        <TrackInfo tracksData={tracksData}/>
        }
      </ul>
    </div>
  )
}
