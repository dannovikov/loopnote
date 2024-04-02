'use client';
import Image from 'next/image'
import styles from './page.module.css'
import Editor from './editor/editor'  
import ProjectBar from './projectbar/projectbar'
import Header from './header/header'
import { useState, useEffect } from 'react'


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, addDoc, collection, getDocs } from "firebase/firestore";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCr1J_ogZJ1cWZtIXd90FVJ6O3O7EsIchU",
  authDomain: "theloopnote.firebaseapp.com",
  projectId: "theloopnote",
  storageBucket: "theloopnote.appspot.com",
  messagingSenderId: "650699921604",
  appId: "1:650699921604:web:7c8224031b16418be61191",
  measurementId: "G-2H7VFX9C11"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



const getProjectIds = async () => {
  const projects = []
  const projectTracks = await getDocs(collection(db, "projects"))
  projectTracks.forEach((doc) => {
    projects.push({
      id: doc.id,
      name: doc.data().name
    })
  }
  )
  return projects
}
      

export default function Home() {

  const [currentProject, setCurrentProject] = useState({id: "1", name: "Project 1"})

  useEffect(() => {
    const analytics = getAnalytics(app);
    async function gp() {
      await getProjectIds().then((projects) => {
        setCurrentProject(projects[0])
      })
    }
    gp()
  }, [])

  return (
      <div className={styles.page}>
        <ProjectBar id="project-bar" currentProject={currentProject} setCurrentProject={setCurrentProject} getProjects={getProjectIds}/>
        <Editor id="editor" key={currentProject} currentProject={currentProject}/>
        {/* I have left key= here to force refresh on project change. only necessary for demo */}
      </div>
  )
}
