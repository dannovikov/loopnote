"use client";

import React, { useEffect, useState } from "react";
import Crunker from "crunker";
import styles from "./editor.module.css";
import Header from "../header/header";
import PlayHeadBar from "../playheadbar/playheadbar";
import Track from "../track/track";
import PlayControlsArea from "../playcontrolsarea/playcontrolsarea";
import NewTrackButtons from "../newtrackbuttons/newtrackbuttons";

import { getFirestore, addDoc, collection, getDocs, getDoc, doc, updateDoc } from "firebase/firestore";

export default function Editor({ currentProject }) { //currentProject is the document id of the current project
  const [tracks, setTracks] = useState([]);
  const [trackOptionsOpen, setTrackOptionsOpen] = useState(false);
  const [pixelsPerSecond, setPixelsPerSecond] = useState(5);
  const [prevPixelsPerSecond, setPrevPixelsPerSecond] = useState(5); 
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [playheadChangeIsCausedByUser, setPlayheadChangeIsCausedByUser] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [projectVolume, setProjectVolume] = useState(50);

  const db = getFirestore();
  
  // Effect to update the playhead position every 100ms when the audio is playing
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setPlayheadPosition((prevPlayheadPosition) => prevPlayheadPosition + pixelsPerSecond/10);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, pixelsPerSecond]);

  
  // Effect to reposition the playhead when pixelsPerSecond changes
  // TODO: save project PPS in the db with each project
  useEffect(() => {
    setPlayheadPosition((prevPlayheadPosition) => prevPlayheadPosition * pixelsPerSecond / prevPixelsPerSecond);
    setPrevPixelsPerSecond(pixelsPerSecond); 
  }, [pixelsPerSecond]);


  // Effect to change the tracks when the current project changes
  useEffect(() => {
    async function getTracks() {
      const projectRef = doc(db, "projects", currentProject.id);
      const projectDoc = await getDoc(projectRef);
      const projectData = projectDoc.data();
      if (!projectData) {return;}
      const tracksData = projectData.tracks;
      const tracksArray = Object.keys(tracksData).map((key) => {
        return {
          id: key,
          projectId: currentProject.id,
          name: tracksData[key].name,
          link: tracksData[key].link,
          trackBodyColor: tracksData[key].trackBodyColor,
          trackWaveColor: tracksData[key].trackWaveColor,
          startTime: tracksData[key].startTime,
          duration: tracksData[key].duration,
          isRecording: false,
          volume: 100,
        };
      });       
      setTracks(tracksArray);
    }
    getTracks();
  }, [currentProject]);


  // Effect to trigger play/pause when the space bar is pressed
  useEffect(() => {
    const togglePlay = (event) => {
        if (event.code === "Space" ) {
            event.preventDefault();  // Prevent scrolling and other side effects
            setIsPlaying(currentIsPlaying =>{
              const newState = !currentIsPlaying;
              const eventName = newState ? "project-play" : "project-pause";
              document.dispatchEvent( new CustomEvent(eventName) );
              return newState;

            } );
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


  const dbUpdateTrack = async (field, value, projectId, trackId) => {
    console.log("attempting to update: ", field, value, projectId, trackId)
    /*
    Access within a track object record, you have the following available fields:
      - name (todo)
      - duration
      - link
      - startTime
      - trackBodyColor
      - trackWaveColor
    */
    const projectRef = doc(db, "projects", projectId);
    const trackField = `tracks.${trackId}.${field}`;
    // try {
    await updateDoc(projectRef, { [trackField]: value });
    console.log(`${field} updated`);
    // }
    // catch (e) {
    //   console.error(e);
    // }

    setTracks((currentTracks) =>
      currentTracks.map((track) =>
        track.id === trackId ? { ...track, [field]: value } : track
      )
    );
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

    const url = URL.createObjectURL(file);

    const uploadTrack = async () => {
      const trackRef = await addDoc(collection(db, "projects", currentProject.id, "tracks"), {
        name: file.name,
        link: url,
        trackBodyColor: "#C98161",
        trackWaveColor: "#A3684E",
        startTime: 0,
        duration: 0,
      });


      const newTrack = {
        id: trackRef.id,
        projectId: currentProject.id,
        name: file.name,
        link: url,
        trackBodyColor: "#C98161",
        trackWaveColor: "#A3684E",
        startTime: 0,
        duration: 0,
        isRecording: false,
        volume: 100,
      };
    setTracks([...tracks, newTrack]);
  };


};




  // function to handle recording new tracks
  const recordNewTrack = () => {
    // create a new server entry for the new track
    server[`project${currentProject.id}`][`track${tracks.length}`] = {
      name: "Recording",
      link: null,
      trackBodyColor: "#C98161",
      trackWaveColor: "#A3684E",
      startTime: playheadPosition / pixelsPerSecond,
      duration: 0,
    };
    // create a new recording track object and add it to the tracks array
    const newTrack = {
      id: tracks.length,
      projectId: currentProject.id,
      name: "Recording",
      link: null,
      trackBodyColor: "#C98161",
      trackWaveColor: "#A3684E",
      startTime: playheadPosition / pixelsPerSecond,
      duration: 0,
      isRecording: true,
      volume: 100,
    };
    setTracks([...tracks, newTrack]);
  };

  // function to export the project as an mp3 file
  const exportProjectAsMp3 = async () => {
    const crunker = new Crunker();
    const buffers = await crunker.fetchAudio(...tracks.map(track => track.link));

    const paddedBuffers = buffers.map((buffer, index) => {
      const track = tracks[index];
      // Pad the start of each track with silence up to its start time
      return crunker.padAudio(buffer, 0, track.startTime);
    });

    const mergedBuffer = crunker.mergeAudio(paddedBuffers);
    const { blob } = crunker.export(mergedBuffer, 'audio/mp3');
    const url = URL.createObjectURL(blob);

    // Create a temporary download link and click it
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `${currentProject.name}_loopnote.mp3`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  
    URL.revokeObjectURL(url);
  };
  

  return (
    <div className={styles.editor_area} onClick={closeOptions}>
      <Header name={currentProject.name} exportProjectAsMp3={exportProjectAsMp3} />
      <div className={styles.editor_centering_container}>
        <div className={styles.editor} style={{ width: `${500 * pixelsPerSecond}px` }} >
          <PlayHeadBar
            playheadPosition={playheadPosition}
            setPlayheadPosition={setPlayheadPosition}
            setPlayheadChangeIsCausedByUser={setPlayheadChangeIsCausedByUser}
          />
          {tracks.map((track, index) => {
            return (
              <Track
                key={track.id + track.projectId}
                id={track.id}
                projectId={track.projectId}
                name={track.name}
                link={track.link}
                trackDuration={track.duration}
                trackStartTime={track.startTime}
                trackBodyColor={track.trackBodyColor}
                trackWaveColor={track.trackWaveColor}
                trackIsRecording={track.isRecording}
                trackVolume={track.volume}
                dbUpdateTrack={dbUpdateTrack}
                pixelsPerSecond={pixelsPerSecond}
                playheadPosition={playheadPosition}
                playheadChangeIsCausedByUser={playheadChangeIsCausedByUser}
                setPlayheadChangeIsCausedByUser={setPlayheadChangeIsCausedByUser}
                projectIsPlaying={isPlaying}
                setProjectIsPlaying={setIsPlaying}
                projectVolume={projectVolume}
              />
            );
          })}
          <NewTrackButtons
            trackOptionsOpen={trackOptionsOpen}
            setTrackOptionsOpen={setTrackOptionsOpen}
            handleFileInput={handleFileInput}
            openFileExplorer={openFileExplorer}
            recordNewTrack={recordNewTrack}
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
        setProjectVolume={setProjectVolume}
      />
    </div>
  );
}
