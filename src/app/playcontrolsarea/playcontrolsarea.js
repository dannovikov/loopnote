import styles from './playcontrolsarea.module.css'
import PlayControls from './playcontrols/playcontrols';
import NewTrackButtons from "../newtrackbuttons/newtrackbuttons";
import VolumeSlider from './volumeslider/volumeslider';
import ZoomSlider from './zoomslider/zoomslider';


export default function PlayControlsArea({ isPlaying, editorRef, setIsPlaying, setPlayheadPosition, projectContentEndPosition, setPlayheadChangeIsCausedByUser, setPixelsPerSecond, setProjectVolume }) {
    return (
        <div className={styles.playcontrolsarea}>
            <VolumeSlider setProjectVolume={setProjectVolume} />
            <PlayControls isPlaying={isPlaying}
                setIsPlaying={setIsPlaying} 
                setPlayheadPosition={setPlayheadPosition}
                projectContentEndPosition={projectContentEndPosition}
                setPlayheadChangeIsCausedByUser={setPlayheadChangeIsCausedByUser}
                editorRef={editorRef} />
            <ZoomSlider setPixelsPerSecond={setPixelsPerSecond} />
        </div>
    );
}