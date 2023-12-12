import styles from './uploadButton.module.css';

export default function UploadButton({isVisible, triggerFileInput}) {

    let buttonContainerStyle = isVisible ? `${styles.buttonContainer} ${styles.visible}` : `${styles.buttonContainer} ${styles.hidden}`

    return (
        <div className={buttonContainerStyle} onClick={triggerFileInput}>
            <div className={styles.button}>
                <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 32 32" x="0px" y="0px">
                    <path fill="#A0A2A4" d="m27,14.95c-0.55,0-1,0.45-1,1v6.28c0,0.98-0.79,1.77-1.75,1.77H7.75c-0.96,0-1.75-0.79-1.75-1.77v-6.28c0-0.55-0.45-1-1-1s-1,0.45-1,1v6.28c0,2.08,1.68,3.77,3.75,3.77h16.5c2.07,0,3.75-1.69,3.75-3.77v-6.28c0-0.55-0.45-1-1-1Z"  />
                    <path fill="#A0A2A4" d="m11.21,13.24l3.79-3.82v11.07c0,0.55,0.45,1,1,1s1-0.45,1-1v-11.07l3.79,3.82c0.2,0.2,0.45,0.3,0.71,0.3s0.51-0.1,0.71-0.29c0.39-0.39,0.39-1.02,0-1.41l-5.5-5.54s0,0,0,0c-0.18-0.18-0.43-0.29-0.71-0.29s-0.53,0.11-0.71,0.29c0,0,0,0,0,0l-5.5,5.54c-0.39,0.39-0.39,1.02,0,1.41,0.39,0.39,1.02,0.39,1.42,0Z"  />
                </svg>
            </div>
        </div>
    );
}

