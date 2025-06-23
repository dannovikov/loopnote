import styles from './projectbarentry.module.css'
import React, { useState } from 'react';

import DeleteProjectButton from '../deleteprojectbutton/deleteprojectbutton';

export default function ProjectBarEntry({id, name, setCurrentProject, isCurrentProject, deleteProject, onUpdateName}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState(name);

  React.useEffect(() => {
    setEditableName(name);
  }, [name]);

  const handleNameClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleNameChange = (e) => {
    setEditableName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
    if (editableName !== name && onUpdateName) {
      onUpdateName(id, editableName);
    }
  };

  const handleInputKeyDown = (e) => {
    e.stopPropagation();
    // Allow all keys to reach the input, but prevent bubbling
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };
  const handleInputKeyUp = (e) => {
    e.stopPropagation();
  };

  const currentProject = {
    "id": id, 
    "name": editableName,
  }

  if (isCurrentProject) {
    let class_string = `${styles.projectbarentry} ${styles.current}`
    return (
      <div className={styles.projectbarentrycontainer} onClick={() => {setCurrentProject(currentProject)}}>
        <p className={class_string} onClick={handleNameClick} style={{cursor: 'pointer'}}>
          {isEditing ? (
            <input
              type="text"
              value={editableName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleInputKeyDown}
              onKeyUp={handleInputKeyUp}
              autoFocus
              style={{width: '90%'}}
            />
          ) : (
            editableName
          )}
        </p>
        <div className={styles.deletebutton}>
          <DeleteProjectButton deleteProject={() => {deleteProject(id)}} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.projectbarentrycontainer} onClick={() => {setCurrentProject(currentProject)}}>
      <p className={styles.projectbarentry} onClick={handleNameClick} style={{cursor: 'pointer'}}>
        {isEditing ? (
          <input
            type="text"
            value={editableName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleInputKeyDown}
            onKeyUp={handleInputKeyUp}
            autoFocus
            style={{width: '90%'}}
          />
        ) : (
          editableName
        )}
      </p>
      <div className={styles.deletebutton}>
        <DeleteProjectButton deleteProject={() => {deleteProject(id)}} />
      </div>
    </div>
  );
}