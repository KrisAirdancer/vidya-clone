import React from 'react'

export default function ControlBox() {
  return (
    <div id='control-box-flex-container' className='control-box'>
      
      <div className='control-box-first-row control-box-element'></div>

      <div id='control-box-row-two-flex-container' className='control-box-second-row'>
        <button className='control-box-element'>&lt;&lt;</button>
        <button className='control-box-element'>&gt;/II</button>
        <button className='control-box-element'>&gt;&gt;</button>
      </div>

      <div id='control-box-row-three-flex-container' className='control-box-row'>
        <button className='control-box-element'>Replay</button> {/* TODO: This button should set the current track to replay endlessly */}
        <button className='control-box-element'>Nav Up</button> {/* TODO: This button should hide the navbar */}
      </div>
    
    </div>
  )
}
