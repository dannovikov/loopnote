import styles from './playcontrols.module.css'

export default function PlayControls({isPlaying, editorRef, setIsPlaying, setPlayheadPosition, projectContentEndPosition, setPlayheadChangeIsCausedByUser}) {
  const togglePlay = () => {
    console.log("toggle play to: ", !isPlaying);
    setIsPlaying(!isPlaying);
    const eventName = isPlaying ? "project-play" : "project-pause";
    document.dispatchEvent( new CustomEvent(eventName) );
  }

  const jumpToStart = () => {
    console.log("jump to start");
    setPlayheadPosition(0);
    //scroll the editor to the start
    editorRef.current.scrollLeft = 0;
    setPlayheadChangeIsCausedByUser(true);
  }

  const jumpToEnd = () => {
    console.log("jump to end");
    setPlayheadPosition(projectContentEndPosition);
    //scroll the editor to the end
    editorRef.current.scrollLeft = editorRef.current.scrollWidth;

    setPlayheadChangeIsCausedByUser(true);
  }

  return (
    <div className={styles.playcontrols}>

      {/* jump to start */}
      <div className={styles.controlbutton} onClick={jumpToStart}>
        <svg id={styles.rr} fill="none" stroke="#A0A2A4" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"></path>
        </svg>
      </div>

      <div className={`${styles.controlbutton} ${isPlaying ? styles.pushed : ''}`} onClick={togglePlay}>
        {/* play */}
        <svg id={styles.pp} fill="#A0A2A4" stroke="#898989" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"></path>
        </svg>
      </div>

        {/* jump to end */}
      <div className={styles.controlbutton} onClick={jumpToEnd}>
        <svg id={styles.ff} fill="none" stroke="#A0A2A4" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"></path>
        </svg>
      </div>

    </div>
  );
}
