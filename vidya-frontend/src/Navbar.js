import React from 'react'

// TODO: For the <select> tag below, React.js requires that the values of the select dropdown be set using props. I will need to change my HTML to match the proper React.js formatting instead of vanilla HTML formatting. See this: https://stackoverflow.com/questions/52143691/react-warning-use-the-defaultvalue-or-value-props-on-select-instead-ofhttps://stackoverflow.com/questions/52143691/react-warning-use-the-defaultvalue-or-value-props-on-select-instead-of 

export default function HelloWorld() {
  return (
    <div>
      <nav className="nav-flex-container">

        <select id="nav-playlist-selector">
          <option value="playlist_vip">VIP</option>
          <option value="playlist_source" selected>Source</option>
        </select>

        <div id="track-info">Track Info</div>

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

      <div id='track-scrubber' className="track-scrubber-flex-container">
        <label id="time-played">0:00</label>
        <input type="range" id="track-scrubber"/>
        <label id="time-left">3:42</label>
      </div>
    </div>
  )
}
