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
  const [trackOptionsOpen, setTrackOptionsOpen] = useState(false)


  // TODO: needs a better name
  let updateServer = (trackId, startTime) => {
    server[`project${currentProject.id}`][trackId]["startTime"] = startTime;
  }


  // Update tracks when the current project changes, and change the updateServer function to target the new project 
  useEffect(() => {
    updateServer = (trackId, startTime) => {server[`project${currentProject.id}`][trackId]["startTime"] = startTime;}
    const newTracks = fetchProjectTracks(currentProject.id, server, updateServer)
    setTracks(newTracks)
  }, [currentProject])

  // on click anywhere in the editor, close the track options tray
  const handleClickOnWhitespace = () => {
    setTrackOptionsOpen(false);
  }

  // support file input from upload button
  const triggerFileInput = (event) => {
    document.getElementById("uploadButtonFileInput").click();
  }

  const handleFileInput = (event) => {
    /*
    What needs to happen when a file is selected:
    - check if the file is an audio file
    - if not, return
    - upload the file to the server
    - create a new track in the client using the file   
    */
  
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
      "id": `"track${tracks.length}"`,
      "name": file.name,
      "link": URL.createObjectURL(file),
      "trackBodyColor": "#C98161",
      "trackWaveColor": "#A3684E",
      "startTime": 0,
      "duration": 0,
      "updateServer": updateServer,
    }
    setTracks([...tracks, newTrack])
  }
  
  return (
    <div className = {styles.editor_area} onClick={handleClickOnWhitespace}>
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
         <div className={styles.new_track_container}> 
            <NewTrackButton trackOptionsOpen={trackOptionsOpen} setTrackOptionsOpen={setTrackOptionsOpen}/>
            <RecordButton isVisible={trackOptionsOpen}/>
            <input type="file" id="uploadButtonFileInput" style={{display: "none"}} onChange={handleFileInput}/>
            <UploadButton isVisible={trackOptionsOpen} triggerFileInput={triggerFileInput}/>
            <LinkButton isVisible={trackOptionsOpen}/>
         </div>
        </div>
      </div>
      <PlayControlsArea/>
    </div>
  );
}

