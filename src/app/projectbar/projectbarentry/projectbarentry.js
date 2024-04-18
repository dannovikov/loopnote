import styles from './projectbarentry.module.css'
import React, { useState } from 'react';

export default function ProjectBarEntry({id, name, setCurrentProject, isCurrentProject, deleteProject}) {

    const currentProject = {
        "id": id, 
        "name": name,
    }

    if (isCurrentProject) {
        let class_string = `${styles.projectbarentry} ${styles.current}`
        return (
            <div className={styles.projectbarentrycontainer}>
                <p className={class_string} onClick={() => {setCurrentProject(currentProject)}}>{name}</p>
                <button className={styles.deletebutton} onClick={() => {deleteProject(id)}}>x</button>
            </div>
        );
    } 

    return (
        <div className={styles.projectbarentrycontainer}>
            <p className={styles.projectbarentry} onClick={() => {setCurrentProject(currentProject)}}>{name}</p>
            <button className={styles.deletebutton} onClick={() => {deleteProject(id)}}>x</button>
        </div>
    );
}