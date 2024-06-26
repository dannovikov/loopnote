import styles from './recordButton.module.css';

export default function RecordButton({isVisible, recordNewTrack}) {
    let buttonContainerStyle = isVisible ? `${styles.buttonContainer} ${styles.visible}` : `${styles.buttonContainer} ${styles.hidden}`
    return (
        <div className={buttonContainerStyle} onClick={recordNewTrack}>
            <div className={styles.button}>
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 100 125"><g><path fill="#A0A2A4" d="M71.004,33.356c-1.45,0-2.626,1.175-2.626,2.626v15.753c0,10.134-8.245,18.379-18.379,18.379s-18.379-8.245-18.379-18.379   V35.981c0-1.45-1.175-2.626-2.626-2.626c-1.45,0-2.626,1.175-2.626,2.626v15.753c0,12.142,9.206,22.17,21.004,23.48v14.534h-8.856   c-1.45,0-2.626,1.175-2.626,2.626c0,1.45,1.175,2.626,2.626,2.626h22.962c1.45,0,2.626-1.175,2.626-2.626   c0-1.45-1.175-2.626-2.626-2.626h-8.856V75.215c11.798-1.311,21.004-11.339,21.004-23.48V35.981   C73.63,34.531,72.454,33.356,71.004,33.356z"/><path fill="#A0A2A4" d="M50,66.963c8.397,0,15.228-6.832,15.228-15.228V20.228C65.228,11.832,58.397,5,50,5s-15.228,6.832-15.228,15.228v31.506   C34.772,60.131,41.603,66.963,50,66.963z M40.023,20.228c0-5.501,4.476-9.977,9.977-9.977s9.977,4.476,9.977,9.977v31.506   c0,5.501-4.476,9.977-9.977,9.977s-9.977-4.476-9.977-9.977V20.228z"/></g></svg>
            </div>
        </div>
    );
}

