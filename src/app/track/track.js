'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './track.module.css'
import WaveSurfer from 'wavesurfer.js';
import Draggable from 'react-draggable'; // The default



export default function Track({id, name, link, duration, trackStartTime, trackBodyColor, trackWaveColor, updateServer}) {

  console.log(`trackStartTime: ${trackStartTime}`)

  const waveSurferRef = useRef(null);
  const waveformRef = useRef(null);
  const [startTime, setStartTime] = useState(Number(trackStartTime));
  const lastStartTime = useRef(0);


  // A one-time effect to intialize the waveform
  useEffect(() => {
    waveSurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: trackWaveColor,
      progressColor: trackBodyColor,
      interact: false,
      height: 100,
      cursorWidth: 0,
    });
    waveSurferRef.current.load('https://www.mfiles.co.uk/mp3-downloads/gs-cd-track2.mp3');
  }, []);

  // adding styling here because the track color is dynamic
  // TODO: create a CSS variable for track color, it shouldnt overwrite the rest of the CSS, which can be in a separate file
  const waveformStyle = {
    backgroundColor: trackBodyColor,
    height: '100%',
    borderRadius: '10px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)'

  }

  const handleDrag = (e, data) => {
    // data.x and data.y are relative to the parent container
    setStartTime(data.x);
  }

  // Push track position updates to the server 

  // TODO: Currently handled by each track independently, but maybe should be handled by the editor to minimize server calls
  // each track would notify the editor that it was repositioned, the editor would report to the DB if changes exist
  // one complication is replacing the way we use lastStartTime.current to avoid sending duplicate updates

  useEffect(() => {
    const interval = setInterval(() => {
      if (startTime !== null && startTime !== lastStartTime.current) {
        updateServer(id, startTime);
        lastStartTime.current = startTime;
      }
    }, 1000); // Update at most once per second
    return () => clearInterval(interval);
  }, [startTime]);
  

  return (
      <div className={styles.track_container}>
        <Draggable bounds="parent" onStop={handleDrag} defaultPosition={{x: startTime, y: 0}}>
          <div className={styles.track_body}>
            <div className={styles.track_name}>
              track name
            </div>
              <div className={styles.track_waveform}>
              <div ref={waveformRef} style={waveformStyle}></div>
              </div>
          </div>
        </Draggable>
      </div>
  );
}

