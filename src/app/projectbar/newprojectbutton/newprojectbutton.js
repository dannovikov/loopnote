import styles from './newprojectbutton.module.css'

export default function NewProjectButton({createNewProject}) {
    return (
        <div className={styles.new_project_button} onClick={createNewProject}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" x="0px" y="0px"><path fill="#A0A2A4" d="M2.911,17.5H14.456v11.544c0,.829,.672,1.5,1.5,1.5s1.5-.671,1.5-1.5v-11.544h11.544c.828,0,1.5-.671,1.5-1.5s-.672-1.5-1.5-1.5h-11.544V2.956c0-.829-.672-1.5-1.5-1.5s-1.5,.671-1.5,1.5V14.5H2.911c-.828,0-1.5,.671-1.5,1.5s.672,1.5,1.5,1.5Z"/></svg>
        </div>
    );
}