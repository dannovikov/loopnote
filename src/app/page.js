'use client';
import Image from 'next/image'
import styles from './page.module.css'
import Editor from './editor/editor'  
import ProjectBar from './projectbar/projectbar'
import Header from './header/header'
import { useState } from 'react'

export default function Home() {
  //usestate for current Proejct

  const [currentProject, setCurrentProject] = useState({"id": 0, "name": "Loopnote", "link": "project0"})

  return (
      <div className={styles.page}>
        <ProjectBar id="project-bar" currentProject={currentProject} setCurrentProject={setCurrentProject}/>
        <Editor id="editor" key={currentProject.id} currentProject={currentProject}/>
        {/* I have left key= here to force refresh on project change. only necessary for demo */}
      </div>
  )
}
