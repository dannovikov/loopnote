'use client';

import React, { useState, useEffect } from 'react';
import styles from './projectbar.module.css'
import ProjectBarEntry from './projectbarentry/projectbarentry'
import NewProjectButton from './newprojectbutton/newprojectbutton'


export default function ProjectBar({ currentProject, setCurrentProject, getProjects, dbCreateNewProject }) {
  const [count, setCount] = useState(0);
  const [projects, setProjects] = useState([])


  useEffect(() => { console.log("currentproject:", currentProject) }, [currentProject])

  // an effect to fetch projects from the server
  useEffect(() => {
    const fetchData = async () => {
      const projects = await getProjects();
      setProjects(projects);
    };
    fetchData();
  }, []);

  const createNewProject = async () => {
    const newProjectId = await dbCreateNewProject();
    const newProjects = await getProjects();
    console.log("newProjects:", newProjects)
    setProjects(newProjects);
    setCurrentProject(newProjects.find(project => project.id === newProjectId));
  }
  



  return (
    <div className={styles.project_bar}>
      <div className={styles.project_bar_header}>
        <p>Projects</p>
        <NewProjectButton createNewProject={createNewProject} />
      </div>
      <div className={styles.project_bar_content}>
        {projects.map((project, index) => {
          return (
            <ProjectBarEntry key={index} id={project.id} name={project.name} 
            setCurrentProject={setCurrentProject} isCurrentProject={project.id === currentProject} />
          )
        })}
      </div>
    </div>
  );
}

