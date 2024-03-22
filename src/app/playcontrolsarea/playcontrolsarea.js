import styles from './playcontrolsarea.module.css'
import PlayControls from './playcontrols/playcontrols';
import NewTrackButtons from "../newtrackbuttons/newtrackbuttons";


export default function PlayControlsArea({ntb_trackOptionsOpen,ntb_setTrackOptionsOpen,ntb_handleFileInput,ntb_openFileExplorer, isPlaying, setIsPlaying }) {
    return (
        <div className={styles.playcontrolsarea}>
            <PlayControls isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
        </div>
    );
}