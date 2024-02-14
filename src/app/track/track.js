'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './track.module.css'
import WaveSurfer from 'wavesurfer.js';
import Draggable from 'react-draggable'; // The default



export default function Track({id, projectId, name, link, duration, trackStartTime, trackBodyColor, trackWaveColor, dbUpdateTrackStartTime}) {

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
    waveSurferRef.current.load(link ? link :'https://www.mfiles.co.uk/mp3-downloads/gs-cd-track2.mp3');
  }, []);


  // Push track position updates to the database, at most once per second
  useEffect(() => {
    const interval = setInterval(() => {
      if (startTime !== null && startTime !== lastStartTime.current) {
        dbUpdateTrackStartTime(projectId, id, startTime);
        lastStartTime.current = startTime;
      }
    }, 250); // Update at most 4x per second
    return () => clearInterval(interval);
  }, [startTime]);
  

  const handleDrag = (e, data) => {
    setStartTime(data.x);
  }

  const waveformStyle = {
    backgroundColor: trackBodyColor,
    height: '100%',
    borderRadius: '10px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)'

  }

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

