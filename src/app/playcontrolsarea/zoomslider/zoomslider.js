import styles from './zoomslider.module.css';

export default function ZoomSlider({setPixelsPerSecond}) {
    const handleChange = (e) => {
        setPixelsPerSecond(e.target.value);
    }
    return (
        <div className={styles.zoomslider}>
            <input type="range" min="1" max="100" defaultValue="30" onChange={handleChange}/>
        </div>
    );
}