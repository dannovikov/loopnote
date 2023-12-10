'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './track.module.css'
import WaveSurfer from 'wavesurfer.js';
import Draggable from 'react-draggable'; // The default

export default function Track({id, name, link, trackBodyColor, trackWaveColor}) {

  const waveSurferRef = useRef(null);
  const waveformRef = useRef(null);

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

  const waveformStyle = {
    backgroundColor: trackBodyColor,
    height: '100%',
    borderRadius: '10px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)'
  }
  
  return (
      <div className={styles.track_container}>
        <Draggable bounds="parent">
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

