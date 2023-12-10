'use client';

import React, { useState, useEffect } from 'react';
import styles from './projectbar.module.css'
import ProjectBarEntry from '../projectbarentry/projectbarentry'

const getProjects = () => {
  let projects = []
  for (let i = 0; i < 10; i++) {
    projects.push(JSON.parse(`{"name": "project${i}", "id": ${i}, "link": "project${i}"}`))
  }
  return projects
}


export default function ProjectBar({currentProject, setCurrentProject}) {
  const [count, setCount] = useState(0);
  const [projects, setProjects] = useState([])

  //lets useEffect to get projects from server once, on load
  useEffect(() => {
    const projects = getProjects()
    setProjects(projects)
  }, [])

  useEffect(() => {
    console.log(currentProject)
  }, [currentProject])


  return (
      <div className={styles.project_bar}>
        <div className={styles.project_bar_header}>
          <p>Projects</p>
        </div>
        <div className={styles.project_bar_content}>
          {projects.map((project, index) => {
            return (
              <ProjectBarEntry key={index} id={project.id} name={project.name} link={project.link} setCurrentProject={setCurrentProject} isCurrentProject={project.id === currentProject}/>
            )
          })}
      </div>
    </div>
  );
}

