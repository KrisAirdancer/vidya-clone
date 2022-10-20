import React from 'react'

export default function Track({tracksList}) {

  return (
    <div>
      {
        tracksList.map(trackInfo => {
          return <li className='track-info'>{trackInfo.gameName} — {trackInfo.trackName}</li>
      })
      }
    </div>
  )
}
