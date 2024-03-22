import styles from './playcontrolsarea.module.css'
import PlayControls from './playcontrols/playcontrols';
import NewTrackButtons from "../newtrackbuttons";


export default function PlayControlsArea({ntb_trackOptionsOpen,ntb_setTrackOptionsOpen,ntb_handleFileInput,ntb_openFileExplorer}) {
    return (
        <div className={styles.playcontrolsarea}>
            <PlayControls/>
        </div>
    );
}