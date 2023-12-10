'use client';

import React, { useEffect, useState } from 'react';
import styles from './editor.module.css';
import Header from '../header/header';
import PlayHead from '../playhead/playhead';
import Track from '../track/track';
import PlayControls from '../playcontrols/playcontrols';


// This is a mock function to simulate fetching tracks from the server
const fetchProjectTracks = (id, server, updateServer) => {
  const project = server[`project${id}`]
  let tracks = []

  for (const [trackId, trackData] of Object.entries(project)) {
    const track = {
      "id": trackId,
      "name": trackData.name,
      "link": trackData.link,
      "trackBodyColor": trackData.trackBodyColor,
      "trackWaveColor": trackData.trackWaveColor,
      "startTime": trackData.startTime,
      "duration": trackData.duration,
      "updateServer": updateServer,
    }
    tracks.push(track)
  }
  return tracks
}


export default function Editor({currentProject, server}) {
  const [tracks, setTracks] = useState([])

  // TODO: needs a better name, maybe dbupdate("startTime", trackId, startTime)
  let updateServer = (trackId, startTime) => {
    server[`project${currentProject.id}`][trackId]["startTime"] = startTime;
  }

  // Update tracks when the current project changes, and change the updateServer function to target the new project 
  useEffect(() => {
    updateServer = (trackId, startTime) => {server[`project${currentProject.id}`][trackId]["startTime"] = startTime;}
    const newTracks = fetchProjectTracks(currentProject.id, server, updateServer)
    setTracks(newTracks)
  }, [currentProject])

  
  return (
    <div className = {styles.editor_area}>
      <Header name={currentProject.name}/>
      <div className={styles.editor_centering_container}>
        <div className={styles.editor}>
          <PlayHead/>
          {tracks.map((track, index) => {
            console.log(`track ${index} has startTime: ${track.startTime}`)
            return (
              <Track 
                key={index} 
                id={track.id} 
                name={track.name}
                link={track.link}
                duration={track.duration}
                trackStartTime={track.startTime}
                trackBodyColor={track.trackBodyColor}
                trackWaveColor={track.trackWaveColor}
                updateServer={updateServer} 
              />
            )
          })}
        </div>
      </div>
      <PlayControls/>
    </div>
  );
}

