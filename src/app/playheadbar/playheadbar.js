import styles from './playheadbar.module.css'

export default function PlayHeadBar({playheadPosition}) {
    // const playhead_start_position = 258;
    return (
        <div className={styles.playheadbar}>
            <div className={styles.playhead} style={{left: `${playheadPosition}px`}}></div>
        </div>
    );
}