'use client';

import React, { useEffect, useState } from 'react';
import styles from './editor.module.css';
import Header from '../header/header';
import PlayHead from '../playhead/playhead';
import Track from '../track/track';
import PlayControls from '../playcontrols/playcontrols';

const fetchProjectTracks = (id) => {
  const trackBodyColors = ["#7348B7", "#4762C4", "#61C9BD", "#76D155"]
  const trackWaveColors = ["#5E3B92", "#384E9B", "#50A19A", "#61A842"]
  
  let tracks = []
  for (let i = 0; i < (id+1); i++) {
    tracks.push(JSON.parse(`{"name": "track${i}", "id": ${i}, "link": "track${i}", "trackBodyColor": "${trackBodyColors[i%4]}", "trackWaveColor": "${trackWaveColors[i%4]}"}`))
  }
  return tracks
}

export default function Editor({currentProject}) {
  const [tracks, setTracks] = useState([])

  // when currentProject changes, fetch tracks for that project
  useEffect(() => {
    const newTracks = fetchProjectTracks(currentProject.id)
    setTracks(newTracks)
  }, [currentProject])

  return (
    <div className = {styles.editor_area}>
      <Header name={currentProject.name}/>
      <div className={styles.editor_centering_container}>
        <div className={styles.editor}>
          <PlayHead/>
          {tracks.map((track, index) => {
            return (
              <Track key={index} id={track.id} name={track.name} link={track.link} trackBodyColor={track.trackBodyColor} trackWaveColor={track.trackWaveColor}/>
            )
          })}
        </div>
      </div>
      <PlayControls/>
    </div>
  );
}

