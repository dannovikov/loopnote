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
import { getFirestore, addDoc, collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";


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
      name: doc.data().name,
      dateCreated: doc.data().dateCreated,
      dateModified: doc.data().dateModified
    })
  }
  )
  return projects.sort((a, b) => b.dateModified - a.dateModified)
}


const dbCreateNewProject = async () => {
  // Create a new project with an empty tracks array
  const docRef = await addDoc(collection(db, "projects"), {
    name: "New Project",
    dateCreated: new Date().valueOf(),
    dateModified: new Date().valueOf(),
    tracks: []
  });
  return docRef.id
}


const dbDeleteProject = async (id) => {
  // Delete the project with the given id
  await deleteDoc(doc(db, "projects", id));
}

const dbUpdateProjectName = async (id, newName) => {
  const projectRef = doc(db, "projects", id);
  await updateDoc(projectRef, {
    name: newName,
    dateModified: new Date().valueOf(),
  });
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
        <ProjectBar id="project-bar" currentProject={currentProject} setCurrentProject={setCurrentProject} getProjects={getProjectIds} dbCreateNewProject={dbCreateNewProject} dbDeleteProject={dbDeleteProject} dbUpdateProjectName={dbUpdateProjectName}/>
        <Editor id="editor" key={currentProject} currentProject={currentProject}/>
        {/* I have left key= here to force refresh on project change. only necessary for demo */}
      </div>
  )
}
