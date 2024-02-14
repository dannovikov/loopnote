'use client';
import Image from 'next/image'
import styles from './page.module.css'
import Editor from './editor/editor'  
import ProjectBar from './projectbar/projectbar'
import Header from './header/header'
import { useState } from 'react'


// This is a mock server (a dictionary)
import server from './server/server';

const getProjects = () => {
  return Object.keys(server).map((key, index) => {
    return {
      "id": index,
      "name": key,
      "link": key
    }
  })
}


export default function Home() {

  const [currentProject, setCurrentProject] = useState({"id": 0, "name": "project0", "link": "project0"})

  return (
      <div className={styles.page}>
        <ProjectBar id="project-bar" currentProject={currentProject} setCurrentProject={setCurrentProject} getProjects={getProjects}/>
        <Editor id="editor" key={currentProject.id} currentProject={currentProject} server={server}/>
        {/* I have left key= here to force refresh on project change. only necessary for demo */}
      </div>
  )
}
