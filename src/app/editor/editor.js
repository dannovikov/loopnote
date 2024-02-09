'use client';

import React, { useEffect, useState } from 'react';
import styles from './editor.module.css';
import Header from '../header/header';
import PlayHead from '../playhead/playhead';
import Track from '../track/track';
import PlayControlsArea from '../playcontrolsarea/playcontrolsarea';
import NewTrackButton from '../newtrackbuttons/newtrackbutton/newtrackbutton';
import UploadButton from '../newtrackbuttons/uploadButton/uploadButton';
import RecordButton from '../newtrackbuttons/recordButton/recordButton';
import LinkButton from '../newtrackbuttons/linkbutton/linkButton';


const fetchProjectTracks = (projectId, server, dbUpdateTrackStartTime) => {
  const project = server[`project${projectId}`]
  let tracks = []
  for (const [trackId, trackData] of Object.entries(project)) {
    const track = {
      "id": trackId.replace("track", ""),
      "projectId": projectId,
      "name": trackData.name,
      "link": trackData.link,
      "trackBodyColor": trackData.trackBodyColor,
      "trackWaveColor": trackData.trackWaveColor,
      "startTime": trackData.startTime,
      "duration": trackData.duration,
      "dbUpdateTrackStartTime": dbUpdateTrackStartTime,
    }
    tracks.push(track)
  }
  return tracks
}


export default function Editor({currentProject, server}) {
  const [tracks, setTracks] = useState([])
  const [trackOptionsOpen, setTrackOptionsOpen] = useState(false)


  const dbUpdateTrackStartTime = (projectId, trackId, startTime) => {
    server[`project${projectId}`][`track${trackId}`]["startTime"] = startTime;
  }

  const closeOptions = () => {
    setTrackOptionsOpen(false);
  }

  const openFileExplorer = (event) => {
    document.getElementById("uploadButtonFileInput").click();
  }

  const handleFileInput = (event) => {  
    if (event.target.files.length === 0) {
      return;
    }
    if (!event.target.files[0].type.includes("audio") &&
        !event.target.files[0].name.includes(".mp3") &&
        !event.target.files[0].name.includes(".wav")) {
      return;
    }
    const file = event.target.files[0];
    // TODO: upload file to server
    server[`project${currentProject.id}`][`track${tracks.length}`] = {
      "name": file.name,
      "link": URL.createObjectURL(file),
      "trackBodyColor": "#C98161",
      "trackWaveColor": "#A3684E",
      "startTime": 0,
      "duration": 0,
    }


    // create new track in client using the file
    const newTrack = {
      "id": tracks.length,
      "projectId": currentProject.id,
      "name": file.name,
      "link": URL.createObjectURL(file),
      "trackBodyColor": "#C98161",
      "trackWaveColor": "#A3684E",
      "startTime": 0,
      "duration": 0,
      "dbUpdateTrackStartTime": dbUpdateTrackStartTime,
    }
    setTracks([...tracks, newTrack])
  }
  

  // Update tracks when the current project changes
  useEffect(() => {
    const newTracks = fetchProjectTracks(currentProject.id, server, dbUpdateTrackStartTime)
    setTracks(newTracks)
  }, [currentProject])


  return (
    <div className = {styles.editor_area} onClick={closeOptions}>
      <Header name={currentProject.name}/>
      <div className={styles.editor_centering_container}>
        <div className={styles.editor}>
          <PlayHead/>
          
          {tracks.map((track, index) => {
            return (<Track 
            key={index} 
            id={track.id} 
            projectId={track.projectId} 
            name={track.name} 
            link={track.link} 
            duration={track.duration} 
            trackStartTime={track.startTime} 
            trackBodyColor={track.trackBodyColor} 
            trackWaveColor={track.trackWaveColor} 
            dbUpdateTrackStartTime={dbUpdateTrackStartTime} />)})}

          <div className={styles.new_track_container}> 

            <NewTrackButton trackOptionsOpen={trackOptionsOpen} setTrackOptionsOpen={setTrackOptionsOpen}/>
            <RecordButton isVisible={trackOptionsOpen}/>
            <input type="file" id="uploadButtonFileInput" style={{display: "none"}} onChange={handleFileInput}/>
            <UploadButton isVisible={trackOptionsOpen} openFileExplorer={openFileExplorer}/>
            <LinkButton isVisible={trackOptionsOpen}/>

          </div>
        </div>
      </div>
      <PlayControlsArea/>
    </div>
  );
}

