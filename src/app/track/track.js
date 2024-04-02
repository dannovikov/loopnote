'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './track.module.css'
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'
import Draggable from 'react-draggable'; 


export default function Track({
  id,
  projectId,
  name,
  link,
  trackDuration,
  trackStartTime,
  trackBodyColor,
  trackWaveColor,
  trackIsRecording,
  trackVolume,
  dbUpdateTrack,
  pixelsPerSecond,
  playheadPosition,
  playheadChangeIsCausedByUser,
  setPlayheadChangeIsCausedByUser,
  projectIsPlaying,
  setProjectIsPlaying,
  projectVolume,
}) {
  const waveSurferRef = useRef(null);
  const waveformRef = useRef(null);

  const [startTime, setStartTime] = useState(Number(trackStartTime));
  const lastStartTime = useRef(0);
  const [trackStartTimeChanged, setTrackStartTimeChanged] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(trackIsRecording);

  const [position, setPosition] = useState({ x: startTime * pixelsPerSecond, y: 0 });
  const [duration, setDuration] = useState(trackDuration > 0 ? trackDuration : 5);

  const [recordingTime, setRecordingTime] = useState(-4.5);

  const [volume, setVolume] = useState(trackVolume);

  const [url, setUrl] = useState(link);


  // Intialize wavesurfer
  useEffect(() => {
    console.log("Recreating track #" + id)
    waveSurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: trackWaveColor,
      progressColor: trackWaveColor, //trackBodyColor, //
      interact: false,
      height: 100,
      cursorWidth: 0,
    });
    if (url) {
      waveSurferRef.current.load(url);
    }    
    waveSurferRef.current.on('ready', function () {
      const waveDuration = waveSurferRef.current.getDuration();
      if (waveDuration !== duration) {
        console.log("unequal durations: ", waveDuration, duration)
        setDuration(waveDuration);
        dbUpdateTrack("duration", waveDuration, projectId, id);
      }
    });
  }, []);


  // Play and timing logic
  useEffect(() => {
    const playheadTimeSeconds = playheadPosition / pixelsPerSecond;
    const playheadTimeRelativeToTrack = playheadTimeSeconds - startTime;
    // console.log("playheadTimeRelativeToTrack: ", playheadTimeRelativeToTrack);

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
        if (!isPlaying && !isRecording) { //if track is not playing, start playing it
          waveSurferRef.current.seekTo(playheadTimeRelativeToTrack / duration);
          waveSurferRef.current.play();
          setIsPlaying(true);
        } else { // if playhead moves while track is playing, synchronize the track with the playhead
          if (playheadChangeIsCausedByUser) { //not just time passing
            waveSurferRef.current.seekTo(playheadTimeRelativeToTrack / duration);
            setPlayheadChangeIsCausedByUser(false);
          }
        }
      } else { // if playhead is outside of track, pause the track
        waveSurferRef.current.pause();
        try{
          waveSurferRef.current.seekTo(0);
        } catch (e) {
          console.log("error seeking to 0");
          console.log("playheadTimeRelativeToTrack: ", playheadTimeRelativeToTrack);
          console.log("duration: ", duration);
        }
        setIsPlaying(false);
      }
    } else { // if project is not playing, pause the track and synchronize the track with the playhead
      waveSurferRef.current.pause();
      try {
        waveSurferRef.current.seekTo(duration > 0 ? playheadTimeRelativeToTrack / duration : 0);
      } catch (e) {
        console.log("error seeking to", playheadTimeRelativeToTrack / duration);
        console.log("playheadTimeRelativeToTrack: ", playheadTimeRelativeToTrack);
        console.log("duration: ", duration);
      }
      setIsPlaying(false);
    }
  }, [playheadPosition, projectIsPlaying, playheadChangeIsCausedByUser, trackStartTimeChanged, isRecording]);


  // Recording logic
  useEffect(() => {
    if (isRecording) {
      let record = waveSurferRef.current.registerPlugin(RecordPlugin.create({
        audioBitsPerSecond: 128000,
      }));
      record.startRecording();
      
      // grow the track body while recording
      let interval;
      record.on('record-start', () => {
        setProjectIsPlaying(true);
        console.log("recording started")
        const interval = setInterval(() => {
          if (isRecording) {
            setRecordingTime((prevRecordingTime) => prevRecordingTime + 1);
          }
        }, 1000); 
      });
      
      // update the track url when recording ends
      record.on('record-end', (blob) => {
        const recordedUrl = URL.createObjectURL(blob);
        console.log("recording ended", recordedUrl);
        setIsRecording(false);
        dbUpdateTrack("link", recordedUrl, projectId, id);
        setUrl(recordedUrl);
      });
      
      // listen for "r" key to stop recording
      document.addEventListener('keydown', (e) => {
        if (e.key === 'r') {
          if (isRecording) {
            record.stopRecording();
            setIsRecording(false);
          }
        }
      });

      // listen for "project-pause" event to stop recording
      document.addEventListener('project-pause', () => {
        if (isRecording) {
          record.stopRecording();
          setIsRecording(false);
        }
      }); 
      
      
      return () => clearInterval(interval);
    }
  }, [isRecording]);


  // handle project volume changes
  useEffect(() => {
    console.log("volume: ", volume);
    console.log("projectVolume: ", projectVolume);
    waveSurferRef.current.setVolume((volume / 100) * (projectVolume / 100));
  }, [projectVolume]);


  // Update the track position when startTime or pixelsPerSecond changes
  useEffect(() => {
    setPosition({ x: startTime * pixelsPerSecond, y: 0 });
  }, [startTime, pixelsPerSecond]);


  // Push track position updates to the database
  useEffect(() => {
    const interval = setInterval(() => {
      if (startTime !== null && startTime !== lastStartTime.current) {
        dbUpdateTrack("startTime", startTime, projectId, id);
        lastStartTime.current = startTime;
      }
    }, 500); // Update at most 2x per second
    return () => clearInterval(interval);
  }, [startTime]);


  // Function to handle dragging the track
  const handleDrag = (e, data) => {
    console.log("dragged to: ", data.x / pixelsPerSecond);
    setStartTime(data.x / pixelsPerSecond);
    setTrackStartTimeChanged(true);
  };
  
  
  const waveformStyle = {
    backgroundColor: trackBodyColor,
    height: "100%",
    borderRadius: "10px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  };


  const displayWidth = isRecording ? recordingTime+duration : duration;

  return (
    <div className={styles.track_container}>
      <Draggable
        bounds="parent"
        onDrag={handleDrag}
        position={position}
      >
        <div className={styles.track_body} style={{ width: displayWidth * pixelsPerSecond }}>
          <div className={styles.track_name}>track name</div>
          <div className={styles.track_waveform}>
            <div ref={waveformRef} style={waveformStyle}></div>
          </div>
        </div>
      </Draggable>
    </div>
  );
}

