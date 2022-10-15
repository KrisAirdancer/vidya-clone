import React from 'react'

// TODO: For the <select> tag below, React.js requires that the values of the select dropdown be set using props. I will need to change my HTML to match the proper React.js formatting instead of vanilla HTML formatting. See this: https://stackoverflow.com/questions/52143691/react-warning-use-the-defaultvalue-or-value-props-on-select-instead-ofhttps://stackoverflow.com/questions/52143691/react-warning-use-the-defaultvalue-or-value-props-on-select-instead-of 

export default function HelloWorld() {
  return (
    <nav className="nav-flex-container">

      <select id="nav-playlist-selector">
        <option value="playlist_vip">VIP</option>
        <option value="playlist_source" selected>Source</option>
      </select>

      <div id="track-info head">Track Info</div>

      <ul>
        <li>
          <button id="btn_chosen" className="nav-button">C</button>
        </li>
        <li>
          <button id="btn_exiled" className="nav-button">E</button>
        </li>
        <li>
          <button id="btn_volume" className="nav-button">V</button>
        </li>
      </ul>
    </nav> 
  )
}
