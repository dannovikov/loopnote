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
  const [duration, setDuration] = useState(trackDuration);
  


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
      const waveDuration = waveSurferRef.current.getDuration();
      setDuration(waveDuration);
      dbUpdateTrackDuration(projectId, id, waveDuration);
    });
  }, []);

  // the main "play" and timing logic
  useEffect(() => {
    const playheadTimeSeconds = playheadPosition / pixelsPerSecond;
    const playheadTimeRelativeToTrack = playheadTimeSeconds - startTime;
    console.log("playheadTimeRelativeToTrack: ", playheadTimeRelativeToTrack);

    if (trackStartTimeChanged) { // due to dragging
      waveSurferRef.current.seekTo(Math.max(0,playheadTimeRelativeToTrack / duration));
      setTrackStartTimeChanged(false);
      if (playheadTimeRelativeToTrack <= 0 || playheadTimeRelativeToTrack >= duration) {
        waveSurferRef.current.pause();
        setIsPlaying(false);
      } 
    }

    if (projectIsPlaying) {  
      if (playheadTimeRelativeToTrack >= 0 && playheadTimeRelativeToTrack <= duration) {
        if (!isPlaying) { //if track is not playing
          waveSurferRef.current.seekTo(playheadTimeRelativeToTrack / duration);
          waveSurferRef.current.play();
          setIsPlaying(true);
        } else { // if track is playing
          if (playheadChangeIsCausedByUser) { //not just time passing
            waveSurferRef.current.seekTo(playheadTimeRelativeToTrack / duration);
            setPlayheadChangeIsCausedByUser(false);
          }
        }

      } else { // if playhead is outside of track
        // console.log("playhead is outside of track", playheadTimeRelativeToTrack, trackDuration, playheadTimeSeconds, startTime, duration);
        waveSurferRef.current.pause();
        waveSurferRef.current.seekTo(0);
        setIsPlaying(false);
      }

    } else { // if project is not playing
      waveSurferRef.current.pause();
      setIsPlaying(false);
      if (duration != 0) {
        waveSurferRef.current.seekTo(playheadTimeRelativeToTrack / duration);
      } else {
        waveSurferRef.current.seekTo(0);
      }
      
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
        <div className={styles.track_body} style={{ width: duration * pixelsPerSecond }}>
          <div className={styles.track_name}>track name</div>
          <div className={styles.track_waveform}>
            <div ref={waveformRef} style={waveformStyle}></div>
          </div>
        </div>
      </Draggable>
    </div>
  );
}

