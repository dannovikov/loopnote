import styles from './volumeslider.module.css'

export default function VolumeSlider({setProjectVolume}) {
    const handleChange = (e) => {
        setProjectVolume(e.target.value);
    }

    return (
        <div className={styles.volumeslider}>
            <svg className={styles.icon} xmlSpace="preserve" viewBox="0 0 100 125" fill="#909294">
                <path d="M50.989 19.903a4.286 4.286 0 0 0-4.529.498L26.757 35.992H13.11a4.29 4.29 0 0 0-4.291 4.29v19.436a4.29 4.29 0 0 0 4.291 4.289h13.646L46.46 79.599a4.29 4.29 0 0 0 6.953-3.364v-52.47a4.294 4.294 0 0 0-2.424-3.862zM69.175 34.81a4.288 4.288 0 0 0-6.066 0 4.288 4.288 0 0 0 0 6.066c5.029 5.03 5.029 13.215 0 18.245a4.286 4.286 0 0 0 0 6.065 4.267 4.267 0 0 0 3.033 1.259c1.1 0 2.195-.419 3.033-1.259a21.334 21.334 0 0 0 6.293-15.188 21.343 21.343 0 0 0-6.293-15.188z" />
                <path d="M74.231 23.685a4.294 4.294 0 0 0 0 6.068c11.164 11.163 11.164 29.327 0 40.49a4.291 4.291 0 0 0 6.068 6.066c14.508-14.508 14.508-38.119 0-52.627a4.296 4.296 0 0 0-6.068.003z" />
            </svg>
            <input type="range" min="0" max="100" step="1" defaultValue="50" onChange={handleChange} />
        </div>
    );
}
