'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './track.module.css'
import WaveSurfer from 'wavesurfer.js';
// import 'wavesurfer.js/dist/plugin/wavesurfer.timeline.min.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'

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
  trackIsRecording,
  trackVolume,
  dbUpdateTrackStartTime,
  dbUpdateTrackDuration,
  dbUpdateTrackLink,
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


  // Intialize wavesurfer
  useEffect(() => {
    waveSurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: trackWaveColor,
      progressColor: trackWaveColor, //trackBodyColor, //
      interact: false,
      height: 100,
      cursorWidth: 0,
    });
    waveSurferRef.current.load(
      link ? link : "https://ia800806.us.archive.org/2/items/kcgetdown/kcgetdown.mp3"
    );
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
        
      }));
      record.startRecording();
      setProjectIsPlaying(true);

      let interval;
      record.on('record-start', () => {
        console.log("recording started")
        const interval = setInterval(() => {
          if (isRecording) {
            setRecordingTime((prevRecordingTime) => prevRecordingTime + 1);
          }
        }, 1000); 
      });
      // useEffect(() => {


      // }, [isRecording]);

      record.on('record-end', (blob) => {
        const recordedUrl = URL.createObjectURL(blob);
        console.log("recording ended", recordedUrl);
        setIsRecording(false);
        dbUpdateTrackLink(projectId, id, recordedUrl);
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
      return () => clearInterval(interval);
    }
  }, [isRecording]);


  // handle volume changes
  useEffect(() => {
    console.log("volume: ", volume);
    console.log("projectVolume: ", projectVolume);
    waveSurferRef.current.setVolume((volume / 100) * (projectVolume / 100));
  }, [projectVolume]);


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

