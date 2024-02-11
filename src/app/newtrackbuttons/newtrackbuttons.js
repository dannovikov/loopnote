import React from 'react';
import styles from './newtrackbuttons.module.css';
import NewTrackButton from './newtrackbutton/newtrackbutton';
import UploadButton from './uploadButton/uploadButton';
import RecordButton from './recordButton/recordButton';
import LinkButton from './linkbutton/linkButton';

export default function NewTrackButtons({trackOptionsOpen, setTrackOptionsOpen, handleFileInput, openFileExplorer}) {
    return (
        <div className={styles.new_track_container}>
            <NewTrackButton trackOptionsOpen={trackOptionsOpen} setTrackOptionsOpen={setTrackOptionsOpen} />
            <RecordButton isVisible={trackOptionsOpen} />
            <input type="file" id="uploadButtonFileInput" style={{ display: "none" }} onChange={handleFileInput} />
            <UploadButton isVisible={trackOptionsOpen} openFileExplorer={openFileExplorer} />
            <LinkButton isVisible={trackOptionsOpen} />
        </div>
    )
}