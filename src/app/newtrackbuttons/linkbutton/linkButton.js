import styles from './linkButton.module.css';

export default function LinkButton({isVisible}) {
    let buttonContainerStyle = isVisible ? `${styles.buttonContainer} ${styles.visible}` : `${styles.buttonContainer} ${styles.hidden}`
    return (
        <div className={buttonContainerStyle}>
            <div className={styles.button}>
            <svg xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 100 125">
                <path
                    style={{
                    WebkitTextIndent: "0",
                    textIndent: "0",
                    WebkitTextTransform: "none",
                    textTransform: "none",
                    blockProgression: "tb",
                    }}
                    d="M16.766 1012.969c-6.23 6.231-6.231 16.396 0 22.627 6.23 6.231 16.396 6.231 22.627 0l15.557-15.556c5.94-5.94 6.268-15.439.862-21.722a3.01 3.01 45 10-4.575 3.912c3.403 3.953 3.241 9.796-.53 13.567l-15.556 15.556c-3.954 3.954-10.188 3.954-14.142 0-3.954-3.954-3.954-10.187 0-14.141l14.849-14.85a3 3 45 10-4.243-4.242l-14.849 14.849zm28.284-28.284c-5.94 5.94-6.268 15.438-.862 21.72a3.01 3.01 45 004.575-3.91c-3.403-3.954-3.241-9.796.53-13.568l15.556-15.556c3.954-3.954 10.188-3.954 14.142 0 3.954 3.954 3.954 10.188 0 14.142l-14.849 14.85a3 3 45 104.243 4.242l14.849-14.85c6.23-6.23 6.231-16.396 0-22.627-6.231-6.23-16.396-6.23-22.627 0L45.05 984.685z"
                    fill="#A0A2A4"
                    enableBackground="accumulate"
                    overflow="visible"
                    transform="translate(0 -952.362)"
                ></path>
                </svg>
            </div>
        </div>
    );
}

