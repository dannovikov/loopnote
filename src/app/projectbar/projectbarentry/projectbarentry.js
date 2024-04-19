import styles from './projectbarentry.module.css'
import React, { useState } from 'react';

import DeleteProjectButton from '../deleteprojectbutton/deleteprojectbutton';

export default function ProjectBarEntry({id, name, setCurrentProject, isCurrentProject, deleteProject}) {

    const currentProject = {
        "id": id, 
        "name": name,
    }

    if (isCurrentProject) {
        let class_string = `${styles.projectbarentry} ${styles.current}`
        return (
            <div className={styles.projectbarentrycontainer} onClick={() => {setCurrentProject(currentProject)}}>
                <p className={class_string} >{name}</p>
                <div className={styles.deletebutton}>
                    <DeleteProjectButton deleteProject={() => {deleteProject(id)}} />
                </div>
            </div>
        );
    } 

    return (
        <div className={styles.projectbarentrycontainer} onClick={() => {setCurrentProject(currentProject)}}>
            <p className={styles.projectbarentry} >{name}</p>
            <div className={styles.deletebutton}>
                <DeleteProjectButton deleteProject={() => {deleteProject(id)}} />
            </div>
        </div>
    );
}