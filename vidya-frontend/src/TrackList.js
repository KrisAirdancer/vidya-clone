import React from 'react'
import tracks from './dummyData.json'

// TODO: Need to add a unique ID to each of the track-info li tags so that React.js can interact with them properly.
// TODO: Break this file out into two files (TrackList.js and TrackInfo.js) as per this video: https://www.youtube.com/watch?v=5s8Ol9uw-yM

export default function TrackList() {
    
  return (
    <ul id='track-list'>
      {
       tracks.map(trackData => <li className='track-info'>{trackData.trackName}</li>)
      }
    </ul>
  )
}
