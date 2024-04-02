import styles from './projectbarentry.module.css'
import React, { useState } from 'react';

export default function ProjectBarEntry({id, name, setCurrentProject, isCurrentProject}) {

    const currentProject = {
        "id": id, 
        "name": name,
    }

    if (isCurrentProject) {
        let class_string = `${styles.projectbarentry} ${styles.current}`
        return (
            <p className={class_string} onClick={() => {setCurrentProject(currentProject)}}>{name}</p>
        );
    } 

    return (
        <p className={styles.projectbarentry} onClick={() => {setCurrentProject(currentProject)}}>{name}</p>
    );
}