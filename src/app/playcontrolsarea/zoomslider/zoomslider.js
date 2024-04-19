import styles from './zoomslider.module.css'

export default function ZoomSlider({setPixelsPerSecond}) {
    const handleChange = (e) => {
        setPixelsPerSecond(e.target.value / 10);
    }

    return (
        <div className={styles.zoomslider}>

<svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="#202020"
      className="bi bi-zoom-out"
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M6.5 12a5.5 5.5 0 100-11 5.5 5.5 0 000 11M13 6.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0"
      ></path>
      <path d="M10.344 11.742q.044.06.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1 1 0 00-.115-.1 6.5 6.5 0 01-1.398 1.4z"></path>
      <path
        fillRule="evenodd"
        d="M3 6.5a.5.5 0 01.5-.5h6a.5.5 0 010 1h-6a.5.5 0 01-.5-.5"
      ></path>
    </svg>

            <input type="range" min="1" max="100" step="1" defaultValue="50" onChange={handleChange} />
            <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="#202020"
      className="bi bi-zoom-in"
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M6.5 12a5.5 5.5 0 100-11 5.5 5.5 0 000 11M13 6.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0"
      ></path>
      <path d="M10.344 11.742q.044.06.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1 1 0 00-.115-.1 6.5 6.5 0 01-1.398 1.4z"></path>
      <path
        fillRule="evenodd"
        d="M6.5 3a.5.5 0 01.5.5V6h2.5a.5.5 0 010 1H7v2.5a.5.5 0 01-1 0V7H3.5a.5.5 0 010-1H6V3.5a.5.5 0 01.5-.5"
      ></path>
    </svg>

        </div>
    );
}
