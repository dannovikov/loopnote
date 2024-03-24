import styles from './playcontrolsarea.module.css'
import PlayControls from './playcontrols/playcontrols';
import NewTrackButtons from "../newtrackbuttons/newtrackbuttons";


export default function PlayControlsArea({ntb_trackOptionsOpen,ntb_setTrackOptionsOpen,ntb_handleFileInput,ntb_openFileExplorer, isPlaying, setIsPlaying, setPlayheadPosition, projectContentEndPosition, setPlayheadChangeIsCausedByUser}) {
    return (
        <div className={styles.playcontrolsarea}>
            {/* <NewTrackButtons
                trackOptionsOpen={ntb_trackOptionsOpen}
                setTrackOptionsOpen={ntb_setTrackOptionsOpen}
                handleFileInput={ntb_handleFileInput}
                openFileExplorer={ntb_openFileExplorer}
            /> */}
            <PlayControls isPlaying={isPlaying} setIsPlaying={setIsPlaying} setPlayheadPosition={setPlayheadPosition} projectContentEndPosition={projectContentEndPosition}  setPlayheadChangeIsCausedByUser={setPlayheadChangeIsCausedByUser}/>
        </div>
    );
}