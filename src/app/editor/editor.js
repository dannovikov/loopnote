"use client";

import React, { useEffect, useState } from "react";
import styles from "./editor.module.css";
import Header from "../header/header";
import PlayHeadBar from "../playheadbar/playheadbar";
import Track from "../track/track";
import PlayControlsArea from "../playcontrolsarea/playcontrolsarea";
import NewTrackButtons from "../newtrackbuttons/newtrackbuttons";

// Function to fetch the tracks of a project from the server
const fetchProjectTracks = (projectId, server, dbUpdateTrackStartTime) => {
  const project = server[`project${projectId}`];
  let tracks = [];
  for (const [trackId, trackData] of Object.entries(project)) {
    const track = {
      id: trackId.replace("track", ""),
      projectId: projectId,
      name: trackData.name,
      link: trackData.link,
      trackBodyColor: trackData.trackBodyColor,
      trackWaveColor: trackData.trackWaveColor,
      startTime: trackData.startTime,
      duration: trackData.duration,
      dbUpdateTrackStartTime: dbUpdateTrackStartTime,
    };
    tracks.push(track);
  }
  return tracks;
};

export default function Editor({ currentProject, server }) {
  const [tracks, setTracks] = useState([]);
  const [trackOptionsOpen, setTrackOptionsOpen] = useState(false);
  const [pixelsPerSecond, setPixelsPerSecond] = useState(2);
  const [prevPixelsPerSecond, setPrevPixelsPerSecond] = useState(2); 
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [playheadChangeIsCausedByUser, setPlayheadChangeIsCausedByUser] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Effect to update the playhead position every 100ms when the audio is playing
  //Todo: just make it based on time. not position.  or better yet manage both the time and the position. 
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setPlayheadPosition((prevPlayheadPosition) => prevPlayheadPosition + pixelsPerSecond/10);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, pixelsPerSecond]);

  // Effect to reposition the playhead when pixelsPerSecond changes
  // TODO: save project PPS in the server with each project
  useEffect(() => {
    setPlayheadPosition((prevPlayheadPosition) => prevPlayheadPosition * pixelsPerSecond / prevPixelsPerSecond);
    setPrevPixelsPerSecond(pixelsPerSecond); 
  }, [pixelsPerSecond]);


  // Effect to change the tracks when the current project changes
  useEffect(() => {
    const newTracks = fetchProjectTracks(
      currentProject.id,
      server,
      dbUpdateTrackStartTime
    );
    setTracks(newTracks);
  }, [currentProject]);

  // Effect to trigger play/pause when the space bar is pressed
  useEffect(() => {
    const togglePlay = (event) => {
        if (event.code === "Space" ) {
            event.preventDefault();  // Prevent scrolling and other side effects
            setIsPlaying(currentIsPlaying => !currentIsPlaying);
        }
    };

    document.addEventListener("keydown", togglePlay);

    return () => {
        document.removeEventListener("keydown", togglePlay);
    };
  }, []); 


  // Effect to handle zooming in and out with the shift key and scroll wheel
  useEffect(() => {
    const handleScroll = (event) => {
        if (!isPlaying && event.shiftKey) {
            // Prevent the default scroll behavior
            event.preventDefault();
            
            // Adjust zoom level based on scroll direction
            setPixelsPerSecond((prev) => {
                const delta = event.deltaY < 0 ? -1 : 1; // Determine scroll direction
                return Math.max(1, Math.min(100, prev + delta)); // Ensure new value is within range
            });
        }
    };
    window.addEventListener('wheel', handleScroll, { passive: false });
    return () => {
        window.removeEventListener('wheel', handleScroll);
    };
  }, [setPixelsPerSecond, isPlaying]);


  // function to update the start time of a track when it is dragged to a new position
  const dbUpdateTrackStartTime = (projectId, trackId, startTime) => {
    server[`project${projectId}`][`track${trackId}`]["startTime"] = startTime;
  };


  //function to update the duration of a track when waveSurfer loads it
  const dbUpdateTrackDuration = (projectId, trackId, duration) => {
    server[`project${projectId}`][`track${trackId}`]["duration"] = duration;
  };


  // function to close the new track options when clicking outside of the track options
  const closeOptions = () => {
    setTrackOptionsOpen(false);
  };


  // function to open the file explorer when clicking the upload button
  const openFileExplorer = (event) => {
    document.getElementById("uploadButtonFileInput").click();
  };


  // function to handle the file input when a file is selected
  const handleFileInput = (event) => {
    //Validate file type as audio
    if (event.target.files.length === 0) {
      return;
    }
    if (
      !event.target.files[0].type.includes("audio") &&
      !event.target.files[0].name.includes(".mp3") &&
      !event.target.files[0].name.includes(".wav")
    ) {
      return;
    }
    const file = event.target.files[0];

    // Upload file to server
    // TODO: This is just a placeholder until a real backend is implemented
    server[`project${currentProject.id}`][`track${tracks.length}`] = {
      name: file.name,
      link: URL.createObjectURL(file),
      trackBodyColor: "#C98161",
      trackWaveColor: "#A3684E",
      startTime: 0,
      duration: 0,
    };

    // create new track object and add it to the tracks array
    const newTrack = {
      id: tracks.length,
      projectId: currentProject.id,
      name: file.name,
      link: URL.createObjectURL(file),
      trackBodyColor: "#C98161",
      trackWaveColor: "#A3684E",
      startTime: 0,
      duration: 0,
      dbUpdateTrackStartTime: dbUpdateTrackStartTime,
    };
    setTracks([...tracks, newTrack]);
  };

  

  return (
    <div className={styles.editor_area} onClick={closeOptions}>
      <Header name={currentProject.name} />
      <div className={styles.editor_centering_container}>
        <div
          className={styles.editor}
          style={{ width: `${500 * pixelsPerSecond}px` }} //Todo: dynamic resizing
        >
          <PlayHeadBar
            playheadPosition={playheadPosition}
            setPlayheadPosition={setPlayheadPosition}
            setPlayheadChangeIsCausedByUser={setPlayheadChangeIsCausedByUser}
          />
          {tracks.map((track, index) => {
            return (
              <Track
                key={index}
                id={track.id}
                projectId={track.projectId}
                name={track.name}
                link={track.link}
                trackDuration={track.duration}
                trackStartTime={track.startTime}
                trackBodyColor={track.trackBodyColor}
                trackWaveColor={track.trackWaveColor}
                dbUpdateTrackStartTime={dbUpdateTrackStartTime}
                dbUpdateTrackDuration={dbUpdateTrackDuration}
                pixelsPerSecond={pixelsPerSecond}
                playheadPosition={playheadPosition}
                playheadChangeIsCausedByUser={playheadChangeIsCausedByUser}
                setPlayheadChangeIsCausedByUser={setPlayheadChangeIsCausedByUser}
                projectIsPlaying={isPlaying}
              />
            );
          })}
          <NewTrackButtons
            trackOptionsOpen={trackOptionsOpen}
            setTrackOptionsOpen={setTrackOptionsOpen}
            handleFileInput={handleFileInput}
            openFileExplorer={openFileExplorer}
          />
        </div>
      </div>
      <PlayControlsArea
        ntb_trackOptionsOpen={trackOptionsOpen}
        ntb_setTrackOptionsOpen={setTrackOptionsOpen}
        ntb_handleFileInput={handleFileInput}
        ntb_openFileExplorer={openFileExplorer}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        setPlayheadPosition={setPlayheadPosition}
        setPlayheadChangeIsCausedByUser={setPlayheadChangeIsCausedByUser}
        setPixelsPerSecond={setPixelsPerSecond}
      />
    </div>
  );
}
