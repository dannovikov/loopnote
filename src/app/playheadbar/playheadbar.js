import styles from './playheadbar.module.css'

export default function PlayHeadBar({playheadPosition, setPlayheadPosition, setPlayheadChangeIsCausedByUser}) {
    const handleClick = (e) => {
        const playheadBar = e.target;
        const playheadBarRect = playheadBar.getBoundingClientRect();
        const clickX = e.clientX - playheadBarRect.left;
        setPlayheadPosition(clickX);
        setPlayheadChangeIsCausedByUser(true);
    }
    return (
        <div className={styles.playheadbar} onClick={handleClick}>
            <div className={styles.playhead} style={{left: `${playheadPosition}px`}}></div>
        </div>
    );
}