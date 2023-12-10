import styles from './header.module.css'

export default function Header({name}) {
    return (
        <div className={styles.header}>
            <p>{name}</p>
        </div>
    );
}