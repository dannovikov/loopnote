import styles from './sharebutton.module.css'
import { useState } from 'react';

export default function ShareButton({exportProjectAsMp3}) {
    const [shareButtonOpen, setShareButtonOpen] = useState(false);

    return (
        <div className={styles.sharebutton}>
            <button onClick={exportProjectAsMp3}>Share</button>
        </div>
    );
}