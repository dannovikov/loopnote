"use client";

import React, { useEffect, useState } from "react";
import styles from "./editor.module.css";
import Header from "../header/header";
import PlayHead from "../playhead/playhead";
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

  // Effect to change the tracks when the current project changes
  useEffect(() => {
    const newTracks = fetchProjectTracks(
      currentProject.id,
      server,
      dbUpdateTrackStartTime
    );
    setTracks(newTracks);
  }, [currentProject]);

  // function to update the start time of a track when it is dragged to a new position
  const dbUpdateTrackStartTime = (projectId, trackId, startTime) => {
    server[`project${projectId}`][`track${trackId}`]["startTime"] = startTime;
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
        <div className={styles.editor}>
          <PlayHead />
          {tracks.map((track, index) => {
            return (
              <Track
                key={index}
                id={track.id}
                projectId={track.projectId}
                name={track.name}
                link={track.link}
                duration={track.duration}
                trackStartTime={track.startTime}
                trackBodyColor={track.trackBodyColor}
                trackWaveColor={track.trackWaveColor}
                dbUpdateTrackStartTime={dbUpdateTrackStartTime}
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
      <PlayControlsArea />
    </div>
  );
}
