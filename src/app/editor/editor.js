"use client";

import React, { useEffect, useState, useRef } from "react";
import Crunker from "crunker";
import styles from "./editor.module.css";
import Header from "../header/header";
import PlayHeadBar from "../playheadbar/playheadbar";
import Track from "../track/track";
import PlayControlsArea from "../playcontrolsarea/playcontrolsarea";
import NewTrackButtons from "../newtrackbuttons/newtrackbuttons";

import { getFirestore, addDoc, collection, getDocs, getDoc, doc, updateDoc, deleteField } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Editor({ currentProject }) { //currentProject is the document id of the current project
  const [tracks, setTracks] = useState([]);
  const [trackOptionsOpen, setTrackOptionsOpen] = useState(false);
  const [pixelsPerSecond, setPixelsPerSecond] = useState(5);
  const [prevPixelsPerSecond, setPrevPixelsPerSecond] = useState(5); 
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [playheadChangeIsCausedByUser, setPlayheadChangeIsCausedByUser] = useState(false);
  const [projectContentEndPosition, setProjectContentEndPosition] = useState(0); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [projectVolume, setProjectVolume] = useState(50);
  const [selectedTracks, setSelectedTracks] = useState([]);

  const db = getFirestore();
  const storage = getStorage();
  
  const editorRef = useRef(null);

  // Pastel color palette from server.js tracks
  const pastelTrackColors = [
    { body: "#7348B7", wave: "#5E3B92" },
    { body: "#4762C4", wave: "#384E9B" },
    { body: "#61C9BD", wave: "#50A19A" },
    { body: "#76D155", wave: "#61A842" },
    { body: "#C98161", wave: "#A3684E" },
    // Add more if desired
  ];

  function getRandomTrackColors() {
    return pastelTrackColors[Math.floor(Math.random() * pastelTrackColors.length)];
  }

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
      // Get the tracks from the current project in the database
      const projectRef = doc(db, "projects", currentProject.id);
      const projectDoc = await getDoc(projectRef);
      const projectData = projectDoc.data();
      if (!projectData) {return;}
      const tracksData = projectData.tracks;
      // create track objects from the data
      const tracksArray = Object.keys(tracksData).map((key) => {
        return {
          id: key,
          projectId: currentProject.id,
          position: tracksData[key].position,
          name: tracksData[key].name,
          link: tracksData[key].link,
          trackBodyColor: tracksData[key].trackBodyColor,
          trackWaveColor: tracksData[key].trackWaveColor,
          startTime: tracksData[key].startTime,
          duration: tracksData[key].duration,
          isRecording: false,
          isSelected: false,
          volume: 100,
        };

      });      
      // sort tracksArray by position
      tracksArray.sort((a, b) => a.position - b.position); 
      setTracks(tracksArray);

      // Set the project content end position
      const projectEndPosition = Math.max(...tracksArray.map((track) => track.startTime + track.duration));
      setProjectContentEndPosition(projectEndPosition);
    }
    getTracks();
  }, [currentProject]);


  // Effect to trigger play/pause when the space bar is pressed
  useEffect(() => {
    const togglePlay = (event) => {
      // Ignore if focus is on an input or textarea
      const tag = event.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || event.target.isContentEditable) return;
      if (event.code === "Space" ) {
        event.preventDefault();  // Prevent scrolling and other side effects
        setIsPlaying(currentIsPlaying =>{
          const newState = !currentIsPlaying;
          const eventName = newState ? "project-play" : "project-pause";
          document.dispatchEvent( new CustomEvent(eventName) );
          return newState;
        });
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
    const projectRef = doc(db, "projects", projectId);
    const trackField = `tracks.${trackId}.${field}`;
    await updateDoc(projectRef, { [trackField]: value });
    console.log(`${field} updated`);
    setTracks((currentTracks) =>
      currentTracks.map((track) =>
        track.id === trackId ? { ...track, [field]: value } : track
      )
    );
  };


  
  
  // function to open the file explorer when clicking the upload button
  const openFileExplorer = (event) => {
    document.getElementById("uploadButtonFileInput").click();
  };
  
  
  // function to upload file to storage and return the download URL
  const uploadFile = async (file) => {
    const fileRef = storageRef(storage, `tracks/${currentProject.id}/${file.name}`);
    uploadBytes(fileRef, file).then((snapshot) => {
      console.log("Audio file uploaded");
      getDownloadURL(snapshot.ref).then((url) => {
        return url;
      });
    }).catch((e) => {
      console.error(e);
    });
  };


  const uploadBlob = async (blob, projectId, trackId) => {
    try {
      const fileRef = storageRef(storage, `tracks/${projectId}/${trackId}`);
      const snapshot = await uploadBytes(fileRef, blob);
      console.log("Audio file uploaded");
      // Here we need to return the promise that getDownloadURL returns
      const url = await getDownloadURL(snapshot.ref);
      return url; // This now correctly returns the URL
    } catch (e) {
      console.error("Error uploading blob: ", e);
      // You should throw the error so it can be caught where uploadBlob is called
      throw e;
    }
  };
  

  // function to handle the file input when a file is selected
  const handleFileInput = (event) => {
    //Validate file type as audio
    if (event.target.files.length === 0) 
      return;
    if (
      !event.target.files[0].type.includes("audio") &&
      !event.target.files[0].name.includes(".mp3") &&
      !event.target.files[0].name.includes(".wav")
    ) return;
      
    const file = event.target.files[0];
    uploadFile(file).then((url) => {
      const newTrack = {
        id: new Date().valueOf(),
        projectId: currentProject.id,
        position: tracks.length,
        name: file.name,
        link: url,
        trackBodyColor: "#C98161",
        trackWaveColor: "#A3684E",
        startTime: 0,
        duration: 0,
        isRecording: false,
        volume: 100,
      };
      // update the database with the new track
      const projectRef = doc(db, "projects", currentProject.id);
      const newTrackField = `tracks.${newTrack.id}`;
      updateDoc(projectRef, { [newTrackField]: {
        name: newTrack.name,
        link: newTrack.link,
        trackBodyColor: newTrack.trackBodyColor,
        trackWaveColor: newTrack.trackWaveColor,
        startTime: newTrack.startTime,
        duration: newTrack.duration,
        position: newTrack.position,
      }, })
      .then(() => {
        console.log("new track added to db in position: ", newTrack.position);
        setTracks([...tracks, newTrack]);
      })
      .catch((e) => {
        console.error(e);
      });
    });
  };

    
  // function to handle recording new tracks
  const recordNewTrack = async () => {
    // create a new recording track object and add it to the tracks array
    const randomColors = getRandomTrackColors();
    const newTrack = {
      id: new Date().valueOf(),
      projectId: currentProject.id,
      position: tracks.length,
      name: "Recording",
      link: null,
      trackBodyColor: randomColors.body,
      trackWaveColor: randomColors.wave,
      startTime: 0, // always 0, offset is now fixed by track.js
      duration: 0,
      isRecording: true,
      volume: 100,
    };

    // update the database with the new track
    const projectRef = doc(db, "projects", currentProject.id);
    const newTrackField = `tracks.${newTrack.id}`;

    try {
      await updateDoc(projectRef, { [newTrackField]: {
        name: newTrack.name,
        link: newTrack.link,
        trackBodyColor: newTrack.trackBodyColor,
        trackWaveColor: newTrack.trackWaveColor,
        startTime: newTrack.startTime,
        duration: newTrack.duration,
        position: newTrack.position,
      } });
      console.log("new track added to db in position: ", newTrack.position);
    } catch (e) {
      console.error(e);
    }

    // set the new track in the tracks array
    setTracks([...tracks, newTrack]);
  };

  
  const selectTrack = (trackId, shiftClick=false) => {
    const trackAlreadySelected = selectedTracks.includes(trackId);
    const leftClick = !shiftClick;
    if (leftClick){
      setSelectedTracks([trackId]);
    } else if (shiftClick && !trackAlreadySelected) {
      setSelectedTracks([...selectedTracks, trackId]);
    } else if (shiftClick && trackAlreadySelected) {
      setSelectedTracks(selectedTracks.filter((id) => id !== trackId));
    }
    console.log("selected tracks: ", selectedTracks);
  };



  const dbDeleteTrack = async (trackId) => {
    const projectRef = doc(db, "projects", currentProject.id);
    const trackField = `tracks.${trackId}`;
    await updateDoc(projectRef, { [trackField]: deleteField() });
    console.log("track deleted", trackField);
  };

  
  // on keypress delete, or backspace, delete the selected tracks
  useEffect(() => {
    const deleteSelectedTracks = (event) => {
      // Ignore if focus is on an input or textarea
      const tag = event.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || event.target.isContentEditable) return;
      if (event.key === "Delete" || event.key === "Backspace") {
        setTracks(tracks.filter((track) => !selectedTracks.includes(track.id)));
        selectedTracks.forEach((trackId) => {
          dbDeleteTrack(trackId);
        });
        setSelectedTracks([]);
      }
    };
    document.addEventListener("keydown", deleteSelectedTracks);
    return () => {
      document.removeEventListener("keydown", deleteSelectedTracks);
    };
  }, [selectedTracks]);    
  
  
  // function to close the new track options when clicking outside of the track options
  const editorWhitespaceClick = () => {
    setTrackOptionsOpen(false);
    setSelectedTracks([]);
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
    <div className={styles.editor_area} onClick={editorWhitespaceClick}>
      <Header name={currentProject.name} exportProjectAsMp3={exportProjectAsMp3} />
      <div className={styles.editor_centering_container} ref={editorRef}>
        <div className={styles.editor} style={{ width: `${500 * pixelsPerSecond}px` }}  >
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
                trackIsSelected={selectedTracks.includes(track.id)}
                trackVolume={track.volume}
                dbUpdateTrack={dbUpdateTrack}
                uploadBlob={uploadBlob}
                pixelsPerSecond={pixelsPerSecond}
                playheadPosition={playheadPosition}
                playheadChangeIsCausedByUser={playheadChangeIsCausedByUser}
                setPlayheadChangeIsCausedByUser={setPlayheadChangeIsCausedByUser}
                projectIsPlaying={isPlaying}
                setProjectIsPlaying={setIsPlaying}
                projectVolume={projectVolume}
                selectTrack={selectTrack}                
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
        isPlaying={isPlaying}
        projectContentEndPosition={projectContentEndPosition * pixelsPerSecond}
        editorRef={editorRef}
        setIsPlaying={setIsPlaying}
        setPlayheadPosition={setPlayheadPosition}
        setPlayheadChangeIsCausedByUser={setPlayheadChangeIsCausedByUser}
        setPixelsPerSecond={setPixelsPerSecond}
        setProjectVolume={setProjectVolume}
      />
    </div>
  );
}
