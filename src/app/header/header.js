import styles from './header.module.css'
import ShareButton from './sharebutton/sharebutton';

export default function Header({name, exportProjectAsMp3}) {
    return (
        <div className={styles.header}>
            <p>{name}</p>
            <ShareButton exportProjectAsMp3={exportProjectAsMp3}/>

        </div>
    );
}