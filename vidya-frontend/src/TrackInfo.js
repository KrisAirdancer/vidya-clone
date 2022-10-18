import React from 'react'

export default function Track({tracksData}) {

  let sortedInfo = tracksData.sort((a, b) => {
    if (a.gameName < b.gameName) {
      return -1;
    } else if (a.gameName > b.gameName) {
      return 1;
    } else { // a === b
      return 0;
    }
  })

  return (
    <div>
      {
        sortedInfo.map(trackInfo => {
        return <li className='track-info'>{trackInfo.gameName} — {trackInfo.trackName}</li>
      })
      }
    </div>
  )
}
