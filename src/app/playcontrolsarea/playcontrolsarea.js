import styles from './playcontrolsarea.module.css'
import NewTrackOptionsButton from '../newtrackbuttons/newtrackbutton/newtrackbutton';
import PlayControls from '../playcontrols/playcontrols';


export default function PlayControlsArea() {
    return (
        <div className={styles.playcontrolsarea}>
            <PlayControls/>
        </div>
    );
}