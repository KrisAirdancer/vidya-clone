import React from 'react'

export default function HelloWorld() {
  return (
    <nav class="navbar">
      <div>Track Info</div>
      <ul>
        <li>
          <button id="btn_chosen" class="nav-button">C</button>
        </li>
        <li>
          <button id="btn_exiled" class="nav-button">E</button>
        </li>
        <li>
          <button id="btn_volume" class="nav-button">V</button>
        </li>
      </ul>
    </nav> 
  )
}
