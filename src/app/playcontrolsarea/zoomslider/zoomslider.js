import styles from './zoomslider.module.css';

export default function ZoomSlider({setPixelsPerSecond, projectIsPlaying}) {
    const handleChange = (e) => {
        setPixelsPerSecond(e.target.value/10); 
    }
    return (
        <div className={styles.zoomslider}>
            Zoom (just for testing):
            <br/>
            {projectIsPlaying ? <input type="range" min="1" max="100" defaultValue="30" style={{width:"400px"}} disabled/> :
            <input type="range" min="1" max="100" defaultValue="30" onChange={handleChange} style={{width:"400px"}}/>}
        </div>
    );
}