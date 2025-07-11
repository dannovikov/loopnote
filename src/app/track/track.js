'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './track.module.css'
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js'
import Draggable from 'react-draggable'; 
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";



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
  trackIsSelected,
  trackVolume,
  dbUpdateTrack,
  uploadBlob,
  pixelsPerSecond,
  playheadPosition,
  playheadChangeIsCausedByUser,
  setPlayheadChangeIsCausedByUser,
  projectIsPlaying,
  setProjectIsPlaying,
  projectVolume,
  selectTrack,
}) {

  const waveSurferRef = useRef(null);
  const waveformRef = useRef(null);
  const nodeRef = useRef(null);
  const [startTime, setStartTime] = useState(Number(trackStartTime));
  const lastStartTime = useRef(Number(trackStartTime));
  const [trackStartTimeChanged, setTrackStartTimeChanged] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(trackIsRecording);
  const [position, setPosition] = useState({ x: startTime * pixelsPerSecond, y: 0 });
  const [duration, setDuration] = useState(trackDuration > 0 ? trackDuration : 5);

  const [recordingTime, setRecordingTime] = useState(0);

  const [volume, setVolume] = useState(trackVolume);
  const [url, setUrl] = useState(link);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editableName, setEditableName] = useState(name);
  

  const [waveformStyle, setWaveformStyle] = useState({
    backgroundColor: trackIsSelected ? "rgba(0, 0, 0, 0.1)" : trackBodyColor,
    height: "100%",
    borderRadius: "10px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  });  

  const shouldStopRecordingRef = useRef(false);

  // Intialize wavesurfer
  useEffect(() => {
    console.log("Recreating track #" + id)
    // Destroy previous wavesurfer instance to avoid memory leaks
    waveSurferRef.current?.destroy();
    waveSurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: trackWaveColor,
      progressColor: trackWaveColor, //trackBodyColor, //
      interact: false,
      height: 100,
      cursorWidth: 0,
    });
    try {
      if (url) {
        waveSurferRef.current.load(url);
      }
    } catch (err) {
      console.error('WaveSurfer failed to load url:', url, err);
    }
    waveSurferRef.current.on('ready', function () {
      const waveDuration = waveSurferRef.current.getDuration();
      if (waveDuration !== duration) {
        console.log("unequal durations: ", waveDuration, duration)
        setDuration(waveDuration);
        dbUpdateTrack("duration", waveDuration, projectId, id);
      }
    });
  }, [url]);


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
          const playPromise = waveSurferRef.current.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              setIsPlaying(true);
            }).catch((e) => {
              // Handle autoplay prevention or other errors
              setIsPlaying(false);
            });
          } else {
            setIsPlaying(true);
          }
        } else { // if playhead moves while track is playing, synchronize the track with the playhead
          if (playheadChangeIsCausedByUser) { //not just time passing
            waveSurferRef.current.seekTo(playheadTimeRelativeToTrack / duration);
            setPlayheadChangeIsCausedByUser(false);
          }
        }
      } else { // if playhead is outside of track, pause the track
        if (waveSurferRef.current.isPlaying()) {
          waveSurferRef.current.pause();
        }
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
      if (waveSurferRef.current.isPlaying()) {
        waveSurferRef.current.pause();
      }
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
        const trueOffset = playheadPosition / pixelsPerSecond;
        setStartTime(trueOffset);
        dbUpdateTrack('startTime', trueOffset, projectId, id);
        setProjectIsPlaying(true);
        console.log("recording started")
        interval = setInterval(() => {
          if (isRecording) {
            setRecordingTime((prevRecordingTime) => prevRecordingTime + 1);
          }
        }, 1000); 
      });
      
      // update the track url when recording ends
      record.on('record-end', (blob) => {
        console.log("recording ended");
        setIsRecording(false);
        // Since uploadBlob is an async function, it returns a promise so you can use .then()
        uploadBlob(blob, projectId, id).then((url) => {
          console.log("url: ", url); // Now url should log the correct download URL
          setUrl(url);
          dbUpdateTrack("link", url, projectId, id);
        }).catch((error) => {
          console.error("Error getting download URL: ", error);
        });
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
      const handleProjectPause = () => {
        if (isRecording) {
          record.stopRecording();
          shouldStopRecordingRef.current = true;
        }
      };
      document.addEventListener('project-pause', handleProjectPause);
      
      return () => {
        interval && clearInterval(interval);
        document.removeEventListener('project-pause', handleProjectPause);
      };
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

  // Function to update drag state based on event type
  const eventControl = (event) => {
    if (event.type === 'mousemove' || event.type === 'touchmove') {
      setIsDragging(true);
    } else if (event.type === 'mouseup' || event.type === 'touchend') {
      setTimeout(() => setIsDragging(false), 100); // Delay to distinguish from click
    }
  };

  // Function to handle dragging the track
  const handleDrag = (e, data) => {
    eventControl(e);
    console.log("dragged to: ", data.x / pixelsPerSecond);
    setStartTime(data.x / pixelsPerSecond);
    setTrackStartTimeChanged(true);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (isDragging) return;
    console.log("clicked track: ", id);
    if (e.shiftKey) 
      selectTrack(id, true);
    else
      selectTrack(id, false);
  }

  const dimColor = (color, factor) => '#' + color.slice(1).match(/.{2}/g).map(hex => Math.floor(parseInt(hex, 16) * factor).toString(16).padStart(2, '0')).join('');

  useEffect(() => {
    console.log("trackIsSelected: ", trackIsSelected);
    setWaveformStyle({
      backgroundColor: trackIsSelected ? dimColor(trackBodyColor, 0.7) : trackBodyColor,
      height: "100%",
      borderRadius: "10px",
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    });

  }, [trackIsSelected]);


  const displayWidth = isRecording ? recordingTime : duration;

  // Inline name editing state and handlers
  useEffect(() => {
    setEditableName(name);
  }, [name]);

  const handleNameClick = (e) => {
    e.stopPropagation();
    setIsEditingName(true);
  };

  const handleNameChange = (e) => {
    setEditableName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (editableName !== name) {
      dbUpdateTrack && dbUpdateTrack('name', editableName, projectId, id);
    }
  };

  const handleInputKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };
  const handleInputKeyUp = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.track_container}>
      <Draggable
        nodeRef={nodeRef}
        bounds="parent"
        onDrag={handleDrag}
        onStop={eventControl}
        position={position}
      >
        <div ref={nodeRef} className={styles.track_body} style={{ width: displayWidth * pixelsPerSecond }} onClick={handleClick}>
          <div className={styles.track_name} onClick={handleNameClick} style={{cursor: 'pointer'}}>
            {isEditingName ? (
              <input
                type="text"
                value={editableName}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                onKeyDown={handleInputKeyDown}
                onKeyUp={handleInputKeyUp}
                autoFocus
                style={{width: '90%'}}
              />
            ) : (
              editableName
            )}
          </div>
          <div className={styles.track_waveform}>
            <div ref={waveformRef} style={waveformStyle}></div>
          </div>
        </div>
      </Draggable>
    </div>
  );
}

