'use client';

import React, { useState, useEffect } from 'react';
import styles from './projectbar.module.css'
import ProjectBarEntry from './projectbarentry/projectbarentry'


export default function ProjectBar({currentProject, setCurrentProject, getProjects}) {
  const [count, setCount] = useState(0);
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const projects = await getProjects();
      setProjects(projects);
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log("currentproject:", currentProject)
  }, [currentProject])

  return (
      <div className={styles.project_bar}>
        <div className={styles.project_bar_header}>
          <p>Projects</p>
        </div>
        <div className={styles.project_bar_content}>
          {projects.map((project, index) => {
            return (
              <ProjectBarEntry key={index} id={project.id} name={project.name} setCurrentProject={setCurrentProject} isCurrentProject={project.id === currentProject}/>
            )
          })}
      </div>
    </div>
  );
}

