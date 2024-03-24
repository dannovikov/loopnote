'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './track.module.css'
import WaveSurfer from 'wavesurfer.js';
import Draggable from 'react-draggable'; // The default



export default function Track({
  id,
  projectId,
  name,
  link,
  trackDuration,
  trackStartTime,
  trackBodyColor,
  trackWaveColor,
  dbUpdateTrackStartTime,
  dbUpdateTrackDuration,
  pixelsPerSecond,
  playheadPosition,
  playheadChangeIsCausedByUser,
  setPlayheadChangeIsCausedByUser,
  projectIsPlaying,
}) {
  const waveSurferRef = useRef(null);
  const waveformRef = useRef(null);
  const [startTime, setStartTime] = useState(Number(trackStartTime));
  const lastStartTime = useRef(0);
  const [trackStartTimeChanged, setTrackStartTimeChanged] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState({ x: startTime * pixelsPerSecond, y: 0 });


  if (trackDuration === 0) {
    trackDuration = 319.075125;
    console.log("trackDuration is 0, setting to 319.075125");
  }

  // A one-time effect to intialize the waveform
  useEffect(() => {
    waveSurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: trackWaveColor,
      progressColor: trackBodyColor, //trackWaveColor
      interact: false,
      height: 100,
      cursorWidth: 0,
    });
    waveSurferRef.current.load(
      link ? link : "https://ia800806.us.archive.org/2/items/kcgetdown/kcgetdown.mp3"
    );
    // print track duration deduced by the waveSurfer
    waveSurferRef.current.on('ready', function () {
      console.log('track duration:', waveSurferRef.current.getDuration());
      dbUpdateTrackDuration(projectId, id, waveSurferRef.current.getDuration()); //Todo: this might not work. it may be too late as far as sizing the track
    });
  }, []);

  // the main "play" and timing logic
  useEffect(() => {
    const playheadTimeSeconds = playheadPosition / pixelsPerSecond;
    const playheadTimeRelativeToTrack = playheadTimeSeconds - startTime;
    console.log("playheadTimeRelativeToTrack: ", playheadTimeRelativeToTrack);

    if (trackStartTimeChanged) { // due to dragging
      waveSurferRef.current.seekTo(Math.max(0,playheadTimeRelativeToTrack / trackDuration));
      setTrackStartTimeChanged(false);
      if (playheadTimeRelativeToTrack <= 0 || playheadTimeRelativeToTrack >= trackDuration) {
        waveSurferRef.current.pause();
        setIsPlaying(false);
      } 
    }

    if (projectIsPlaying) {  
      if (playheadTimeRelativeToTrack >= 0 && playheadTimeRelativeToTrack <= trackDuration) {
        if (!isPlaying) { //if track is not playing
          waveSurferRef.current.seekTo(playheadTimeRelativeToTrack / trackDuration);
          waveSurferRef.current.play();
          setIsPlaying(true);
        } else { // if track is playing
          if (playheadChangeIsCausedByUser) { //not just time passing
            waveSurferRef.current.seekTo(playheadTimeRelativeToTrack / trackDuration);
            setPlayheadChangeIsCausedByUser(false);
          }
        }
      }
    } else { // if project is not playing
      waveSurferRef.current.pause();
      setIsPlaying(false);
      waveSurferRef.current.seekTo(playheadTimeRelativeToTrack / trackDuration);
    }
  }, [playheadPosition, projectIsPlaying, playheadChangeIsCausedByUser, trackStartTimeChanged]);


  // Function to handle dragging the track
  const handleDrag = (e, data) => {
    console.log("dragged to: ", data.x / pixelsPerSecond);
    setStartTime(data.x / pixelsPerSecond);
    setTrackStartTimeChanged(true);
  };

  // Update the track position when startTime or pixelsPerSecond changes
  useEffect(() => {
    setPosition({ x: startTime * pixelsPerSecond, y: 0 });
  }, [startTime, pixelsPerSecond]);

  // Push track position updates to the database
  useEffect(() => {
    const interval = setInterval(() => {
      if (startTime !== null && startTime !== lastStartTime.current) {
        dbUpdateTrackStartTime(projectId, id, startTime);
        lastStartTime.current = startTime;
      }
    }, 250); // Update at most 4x per second
    return () => clearInterval(interval);
  }, [startTime]);


  const waveformStyle = {
    backgroundColor: trackBodyColor,
    height: "100%",
    borderRadius: "10px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  };

  return (
    <div className={styles.track_container}>
      <Draggable
        bounds="parent"
        onDrag={handleDrag}
        position={position}
      >
        <div className={styles.track_body} style={{ width: `${trackDuration * pixelsPerSecond}px` }}>
          <div className={styles.track_name}>track name</div>
          <div className={styles.track_waveform}>
            <div ref={waveformRef} style={waveformStyle}></div>
          </div>
        </div>
      </Draggable>
    </div>
  );
}

